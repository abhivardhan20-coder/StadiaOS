import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import { WebSocketServer, WebSocket } from 'ws';
import http from 'http';
import express, { Request, Response, NextFunction } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import crypto from "crypto";

if (!process.env.GEMINI_API_KEY) {
  console.warn('WARNING: GEMINI_API_KEY is not set. All AI endpoints will serve offline mock data.');
}

export const DEFAULT_GREEN_OPS = {
  score: 88, electricity: "1.2MW", solar: "350kW", water: "4.2kL/h",
  hvac: "Optimal (22C)", carbon: "2.1t/h", waste: "1.2t", recycling: "0.8t",
  foodWaste: "150kg", battery: "92%", airQuality: "Good (42 AQI)",
  temperature: "22°C", humidity: "45%", savings: "$1,250",
  forecasts: ["Peak energy demand expected at 18:00", "Solar generation dropping in 2 hours", "HVAC efficiency at 95%"],
  recommendations: ["Pre-cool sector 4", "Switch to battery power for peak", "Reduce lighting in empty zones"],
};

export interface OpsPolicyResult {
  level: "normal" | "suggest" | "escalate";
  reasons: string[];
  suggestedActions: string[];
}

const DENSITY_ESCALATE = 85;
const DENSITY_SUGGEST = 75;

export function evaluateOpsPolicy(liveContext?: { zones?: { name: string; density: number }[]; alerts?: string[] }): OpsPolicyResult {
  const reasons: string[] = [];
  const suggestedActions: string[] = [];
  let level: OpsPolicyResult["level"] = "normal";

  for (const zone of liveContext?.zones ?? []) {
    if (zone.density >= DENSITY_ESCALATE) {
      level = "escalate";
      reasons.push(`${zone.name} density at ${zone.density}% (>= ${DENSITY_ESCALATE}%)`);
      suggestedActions.push(`Dispatch security/medical to ${zone.name}`);
    } else if (zone.density >= DENSITY_SUGGEST && level !== "escalate") {
      level = "suggest";
      reasons.push(`${zone.name} density at ${zone.density}% (>= ${DENSITY_SUGGEST}%)`);
      suggestedActions.push(`Consider opening overflow route near ${zone.name}`);
    }
  }

  if ((liveContext?.alerts ?? []).length > 0) {
    level = "escalate";
    reasons.push(...(liveContext?.alerts ?? []));
  }

  return { level, reasons, suggestedActions };
}

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Zod schemas for validation
const opsCopilotSchema = z.object({
  prompt: z.string().min(1).max(1000),
  context: z.object({
    time: z.string().optional(),
    alerts: z.array(z.string()).optional(),
    weather: z.string().optional(),
    transit: z.string().optional(),
    zones: z.array(z.any()).optional()
  }).optional()
});

/**
 * Zod schema for validating the polyglot concierge API payload.
 */
export const polyglotSchema = z.object({
  text: z.string().min(1).max(2000),
  targetLanguage: z.string().min(1).max(50),
  history: z.array(z.object({
    role: z.string(),
    content: z.string()
  })).optional()
});

/**
 * Zod schema for validating the wayfinder API payload.
 */
export const wayfinderSchema = z.object({
  destination: z.string().min(1).max(500),
  stepFreeOnly: z.boolean().optional(),
  role: z.string().optional(),
  avoid: z.array(z.string()).optional(),
  evacuationMode: z.boolean().optional()
});

// Rate limiters
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // Limit each IP to 30 requests per `window`
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
  validate: { trustProxy: true }
});

/**
 * The main Express application instance.
 */
export const app = express();
app.use(cookieParser());

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('FATAL: JWT_SECRET is not set.');
  process.exit(1);
}
if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
  console.warn('OAuth secrets missing. OAuth will fail.');
}

app.get('/api/auth/google', (req, res) => {
  const state = crypto.randomBytes(16).toString('hex');
  res.cookie('oauth_state', state, { httpOnly: true, secure: true, sameSite: 'lax', maxAge: 5 * 60 * 1000 });

  const protocol = req.headers['x-forwarded-proto'] || req.protocol;
  const host = req.get('host');
  const redirectUri = `${protocol}://${host}/api/auth/google/callback`;

  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=email%20profile&access_type=offline&state=${state}`;
  res.redirect(url);
});

app.get('/api/auth/google/callback', async (req, res) => {
  const { code, state } = req.query;
  const expectedState = req.cookies?.oauth_state;
  res.clearCookie('oauth_state');

  if (!expectedState || state !== expectedState) {
    console.warn('OAuth state mismatch — possible CSRF attempt.');
    return res.send(`<html><body><script>
      window.opener.postMessage({ type: 'OAUTH_ERROR', reason: 'state_mismatch' }, window.location.origin);
      window.close();
    </script></body></html>`);
  }

  const protocol = req.headers['x-forwarded-proto'] || req.protocol;
  const host = req.get('host');
  const redirectUri = `${protocol}://${host}/api/auth/google/callback`;

  try {
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        code: code as string,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri
      }).toString()
    });
    
    const tokenData = await tokenResponse.json();
    if (tokenData.error) throw new Error(tokenData.error);
    
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    });
    const userInfo = await userInfoResponse.json();

    const token = jwt.sign(userInfo, JWT_SECRET, { expiresIn: '1d' });
    res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'none' });
    
    res.send(`
      <html><body><script>
        window.opener.postMessage({ type: 'OAUTH_SUCCESS', user: ${JSON.stringify(userInfo)} }, window.location.origin);
        window.close();
      </script></body></html>
    `);
  } catch (error) {
    console.error('OAuth error:', error);
    res.send(`
      <html><body><script>
        window.opener.postMessage({ type: 'OAUTH_ERROR' }, window.location.origin);
        window.close();
      </script></body></html>
    `);
  }
});

app.set("trust proxy", 1);
const PORT = 3000;

// Security Middlewares
app.use(helmet({
  crossOriginOpenerPolicy: false,
  xFrameOptions: false,
  contentSecurityPolicy: false,
}));
app.use(cors({ origin: process.env.APP_URL || 'http://localhost:3000' }));
app.use(express.json({ limit: "10kb" }));

// Apply rate limiter to /api
app.use("/api", apiLimiter);

// API route for Ops Copilot (Streaming)
app.post("/api/ops-copilot", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = opsCopilotSchema.parse(req.body);
    const { prompt, context } = parsed;
    
    const policy = evaluateOpsPolicy(context as any);
    
    const systemInstruction = `You are Ops Copilot, an AI assistant for the Smart Stadium Intelligence Platform (SSIP) at the FIFA World Cup 2026. 
You provide real-time decision support based on the provided context (telemetry, weather, crowd data). 
Use markdown heavily: tables, bold text, blockquotes, timelines, and lists.
When recommending actions, always:
- Explain your reasoning.
- Show a confidence percentage (e.g. 92% Confidence).
- Display a brief reasoning chain summary.
- Offer concrete suggested actions. IMPORTANT: For one-click execution, output actions as markdown links with the 'action:' protocol, e.g. [Execute: Route Staff to Gate 4](action:route_staff_gate_4).
- You can generate charts by outputting a code block with language 'chart' containing a JSON array of objects with 'name' and 'value' keys, e.g.:
\`\`\`chart
[{"name":"Gate 1","value":80},{"name":"Gate 2","value":45}]
\`\`\`

Deterministic policy engine has already evaluated this context: level="${policy.level}", reasons=${JSON.stringify(policy.reasons)}.
Your recommendation MUST be consistent with this level — do not upgrade or downgrade it.

Context:
${JSON.stringify(context, null, 2)}`;

    const responseStream = await ai.models.generateContentStream({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.2
      }
    });

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();
    
    res.write(`data: ${JSON.stringify({ policy })}\n\n`);

    for await (const chunk of responseStream) {
      if (chunk.text) {
        res.write(`data: ${JSON.stringify({ text: chunk.text })}\n\n`);
      }
    }
    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return next(error);
    }
    const message = error instanceof Error ? error.message : "unknown_error";
    console.log("Gemini API quota exceeded in /api/ops-copilot, using offline mock data. Error:", message);
    if (!res.headersSent) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.flushHeaders();
    }
    res.write(`data: ${JSON.stringify({ text: "I'm currently operating in offline mode due to API rate limits. I cannot process your specific request at this moment, but standard protocols advise checking the Crowd Pulse Engine and Green Ops Advisor for live metrics." })}\n\n`);
    res.write('data: [DONE]\n\n');
    res.end();
  }
});

// API route for Polyglot Concierge
app.post("/api/polyglot", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = polyglotSchema.parse(req.body);
    const { text, targetLanguage, history } = parsed;
    
    let historyContext = "";
    if (history && history.length > 0) {
      historyContext = `\nPrevious conversation:\n` + history.map(h => `${h.role}: ${h.content}`).join('\n');
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `You are the Polyglot Concierge, a multilingual fan assistant for a stadium.
Translate the user's latest text to ${targetLanguage}. 
Also detect the user's input language.
Also detect the user's intent (e.g. 'navigation', 'medical', 'food_ordering', 'emergency', 'ticket_help', 'accessibility', 'lost_child', 'parking', 'announcement', 'general').
Also provide a brief 'recommendation' or AI response (e.g. nearby service or suggested action) in ${targetLanguage}.
${historyContext}

Latest User Text: "${text}"`,
      config: {
        responseMimeType: "application/json",
        temperature: 0.3,
        systemInstruction: "Always return valid JSON strictly matching the schema: { translatedText: string, detectedLanguage: string, intent: string, recommendation: string, confidence: number }. `confidence` should be an integer between 0 and 100 representing the translation confidence score."
      }
    });

    let result;
    try {
      result = JSON.parse(response.text || "{}");
    } catch (e) {
      return next(new Error("invalid_model_response"));
    }
    res.json(result);
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return next(error);
    }
    const message = error instanceof Error ? error.message : "unknown_error";
    console.log("Gemini API quota exceeded in /api/polyglot, using offline mock data. Error:", message);
    res.json({
      translatedText: "(Mock Translation) El servicio de IA está experimentando alta demanda.",
      detectedLanguage: "en",
      intent: "general",
      recommendation: "Por favor, inténtelo de nuevo más tarde o diríjase al servicio de atención al cliente.",
      confidence: 50
    });
  }
});

app.get("/api/stadium-live", (req: Request, res: Response) => {
  // Simulate live dynamic data on the server
  const baseOccupancy = 68400;
  const timeOffset = Date.now() % 10000;
  
  const zones = [
    { id: 'north_stand', name: 'North Stand (Zone A)', density: 80 + Math.random() * 5, status: 'warning' },
    { id: 'south_stand', name: 'South Stand (Zone B)', density: 40 + Math.random() * 10, status: 'normal' },
    { id: 'east_stand', name: 'East Stand (Zone C)', density: 90 + Math.random() * 8, status: 'critical' },
    { id: 'west_stand', name: 'West Stand (Zone D)', density: 55 + Math.random() * 5, status: 'normal' },
    { id: 'gate_north', name: 'Concourse 4B', density: 85 + Math.random() * 10, status: 'warning' },
  ];

  zones.forEach(z => {
    if (z.density >= 90) z.status = 'critical';
    else if (z.density >= 75) z.status = 'warning';
    else z.status = 'normal';
    z.density = Math.round(z.density);
  });

  const chartData = [
    { time: '18:00', actual: 30, predicted: 30 },
    { time: '18:15', actual: 45, predicted: 42 },
    { time: '18:30', actual: 65, predicted: 60 },
    { time: '18:45', actual: 80, predicted: 78 },
    { time: '19:00', actual: 95, predicted: 90 },
    { time: '19:15', actual: null, predicted: 85 },
    { time: '19:30', actual: null, predicted: 60 },
    { time: '19:45', actual: null, predicted: 40 },
  ];

  res.json({
    occupancy: baseOccupancy + Math.floor(Math.random() * 100),
    zones,
    chartData,
    liveContext: {
      time: new Date().toISOString(),
      alerts: zones.filter(z => z.status === 'critical').map(z => `Density Breach: ${z.name} (${z.density}%)`),
      weather: "Clear, 22C",
      transit: "Metro Line B delayed by 10m",
      zones,
      totalOccupancy: baseOccupancy
    }
  });
});

// API route for Green Ops Advisor
app.get("/api/green-ops", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const context = "Current Time: Active match. Stadium capacity: 90%. Weather: Clear, 22C.";
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: "Generate a JSON response for an environmental intelligence dashboard. Provide current metric states, AI forecasts (energy spikes, maintenance, equipment failures), cost savings, and recommendations. Schema: { score: number (0-100), electricity: string (e.g. '1.2MW'), solar: string, water: string, hvac: string, carbon: string, waste: string, recycling: string, foodWaste: string, battery: string, airQuality: string, temperature: string, humidity: string, savings: string, forecasts: string[], recommendations: string[] }",
      config: {
        systemInstruction: `Context: ${context}`,
        responseMimeType: "application/json",
        temperature: 0.7
      }
    });
    
    let result;
    try {
      result = JSON.parse(response.text || "{}");
    } catch (e) {
      return next(new Error("invalid_model_response"));
    }
    res.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "unknown_error";
    console.log("Gemini API quota exceeded in /api/green-ops, using offline mock data. Error:", message);
    res.json({ ...DEFAULT_GREEN_OPS });
  }
});

// API route for Wayfinder AI
app.post("/api/wayfinder", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = wayfinderSchema.parse(req.body);
    const { destination, stepFreeOnly, role } = parsed;
    
    const venueKnowledgeBase = {
      gates: ["Gate A (North)", "Gate B (South)", "Gate C (East)", "Gate D (West)"],
      amenities: ["Restrooms near all gates", "Accessible Restrooms near Gate B, Gate C", "Medical near Gate A", "Prayer Room near Gate D"],
      routes: {
        stepFree: ["Ramp to Gate C", "Elevator to Concourse 4B", "Level path to Gate B"]
      },
      liveContext: {
        crowds: ["Gate A (High Density)", "Concourse 2 (Moderate Density)"],
        maintenance: ["Elevator 3 (Out of Service)"],
        closedGates: ["Gate D (West) - Closed for security"],
      }
    };

    const prompt = `Generate a navigational route to "${destination}".
Preferences: Step-free only: ${stepFreeOnly}. User Role: ${role || 'General Fan'}.
Venue Context: ${JSON.stringify(venueKnowledgeBase)}
Schema required: {
  destination: string,
  route_steps: { instruction: string, type: "walk" | "stairs" | "elevator" | "ramp" | "turn" | "emergency_exit" | "staff_corridor" | "checkpoint" | "vip_corridor", congestion: "low" | "moderate" | "high" | "blocked", distance: number, duration: number }[],
  estimated_walk_time_min: number,
  step_free: boolean,
  rationale: string,
  predicted_congestion: string,
  alternative_routes: { name: string, time_min: number, reason: string }[]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.2
      }
    });
    
    let result;
    try {
      result = JSON.parse(response.text || "{}");
      if (!result.route_steps) throw new Error("Invalid schema");
      res.json(result);
    } catch (e) {
      throw new Error("invalid_model_response");
    }
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return next(error);
    }
    const message = error instanceof Error ? error.message : "unknown_error";
    console.log("Gemini API error in /api/wayfinder, using offline mock data. Error:", message);
    res.json({
      destination: req.body?.destination || "Unknown",
      route_steps: [
        { instruction: "Head towards Concourse 4B", type: "walk", congestion: "low", distance: 150, duration: 2 },
        { instruction: "Take the elevator down to Level 2", type: "elevator", congestion: "low", distance: 0, duration: 1 },
        { instruction: "Proceed straight to Gate C", type: "walk", congestion: "moderate", distance: 200, duration: 3 }
      ],
      estimated_walk_time_min: 6,
      step_free: true,
      rationale: "Optimized route avoiding main crowd bottlenecks.",
      predicted_congestion: "Moderate near Gate C",
      alternative_routes: [{ name: "West Loop", time_min: 8, reason: "Less crowded" }]
    });
  }
});

// Centralized Error Handling Middleware
app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
  if (res.headersSent) {
    return next(err);
  }

  console.error("API Error:", err);
  
  if (err instanceof z.ZodError) {
    return res.status(400).json({ error: "validation_error", details: err.issues });
  }

  if (err instanceof Error && err.message === "invalid_model_response") {
    return res.status(502).json({ error: "invalid_model_response", message: "Received malformed data from AI provider." });
  }

  if (err instanceof SyntaxError && 'status' in err && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: "bad_request", message: "Malformed JSON payload." });
  }

  const status = typeof err === 'object' && err !== null && 'status' in err && typeof (err as any).status === 'number' ? (err as any).status : 500;
  const message = err instanceof Error ? err.message : "An unexpected error occurred.";

  res.status(status).json({ 
    error: "internal_server_error", 
    message: process.env.NODE_ENV === 'development' ? message : "An unexpected error occurred." 
  });
});

/**
 * Creates and configures the Express application and WebSocket server.
 * Sets up Vite in development or static serving in production.
 * @returns The configured Express application instance.
 */
export const createApp = async () => {

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production" && process.env.NODE_ENV !== "test") {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: { port: 24680 } },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else if (process.env.NODE_ENV === "production") {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const server = http.createServer(app);
  
  // Set up WebSocket server
  const wss = new WebSocketServer({ server });
  
  const connectedClients = new Set<WebSocket>();
  
  wss.on('connection', (ws) => {
    connectedClients.add(ws);
    
    ws.on('message', (message) => {
      try {
        const msg = JSON.parse(message.toString());
        if (msg.type === 'ping') {
           ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
        }
      } catch(e) {}
    });
    
    ws.on('close', () => {
      connectedClients.delete(ws);
    });
  });

  // Broadcast function
  const broadcast = (channel: string, payload: unknown) => {
     const msg = JSON.stringify({
        id: `server-${Date.now()}-${Math.random()}`,
        channel,
        payload,
        timestamp: Date.now()
     });
     connectedClients.forEach(ws => {
        if (ws.readyState === WebSocket.OPEN) {
           ws.send(msg);
        }
     });
  };

  // Periodic broadcast for event-driven architecture
  let lastStadiumLive = {
    liveContext: {
      crowds: ["Gate A (High Density)", "Concourse 2 (Moderate Density)"],
      maintenance: ["Elevator 3 (Out of Service)", "Corridor 7 (Blocked)"],
      closedGates: ["Gate D (West) - Closed for security"],
      securityIncidents: ["Gate D (West) - Suspicious package"],
      traffic: ["Perimeter Road East (Heavy Traffic)"]
    },
    crowdPulse: {
      overallDensity: 85,
      predictedPeak: "19:30",
      anomalies: ["Unusual buildup near Gate C", "Concourse 4 flow restricted"],
      heatmapData: [
        { zone: "Gate A", density: 92, trend: "up" },
        { zone: "Gate B", density: 45, trend: "down" },
        { zone: "Gate C", density: 88, trend: "up" },
        { zone: "Concourse 1", density: 60, trend: "stable" }
      ]
    }
  };
  
  let lastGreenOps = { ...DEFAULT_GREEN_OPS };

  setInterval(() => {
    // Perturb data slightly for live effect
    lastStadiumLive.crowdPulse.overallDensity = Math.max(0, Math.min(100, lastStadiumLive.crowdPulse.overallDensity + (Math.random() * 4 - 2)));
    lastStadiumLive.crowdPulse.heatmapData.forEach(zone => {
      zone.density = Math.max(0, Math.min(100, zone.density + (Math.random() * 10 - 5)));
    });
    
    lastGreenOps.score = Math.max(0, Math.min(100, lastGreenOps.score + (Math.random() * 2 - 1)));
    lastGreenOps.battery = `${Math.floor(Math.max(0, Math.min(100, parseInt(lastGreenOps.battery) + (Math.random() * 2 - 1))))}%`;
    
    broadcast('stadiumLive', lastStadiumLive);
    broadcast('greenOps', lastGreenOps);
  }, 4000);

  if (process.env.NODE_ENV !== 'test') {
    server.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }
  return app;
}

if (process.env.NODE_ENV !== 'test') {
  createApp();
}



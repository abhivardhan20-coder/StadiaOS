import cookieParser from 'cookie-parser';
import express, { Request, Response, NextFunction } from "express";
import path from "path";
import http from 'http';
import { createServer as createViteServer } from "vite";
import { z } from "zod";

import { setupSecurity, apiLimiter } from "./src/server/middleware/security";
import authRoutes from "./src/server/routes/auth";
import opsCopilotRoutes from "./src/server/routes/opsCopilot";
import polyglotRoutes from "./src/server/routes/polyglot";
import wayfinderRoutes from "./src/server/routes/wayfinder";
import greenOpsRoutes from "./src/server/routes/greenOps";
import stadiumLiveRoutes from "./src/server/routes/stadiumLive";
import { setupWebSocket } from "./src/server/websocket/broadcast";

// Re-export for tests
export { evaluateOpsPolicy, OpsPolicyResult } from "./src/server/policy/evaluateOpsPolicy";
export { opsCopilotSchema } from "./src/server/routes/opsCopilot";
export { polyglotSchema } from "./src/server/routes/polyglot";
export { wayfinderSchema } from "./src/server/routes/wayfinder";

export const app = express();
app.use(cookieParser());
app.set("trust proxy", 1);
app.use(express.json({ limit: "10kb" }));

setupSecurity(app);

// Apply rate limiter to /api
app.use("/api", apiLimiter);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/ops-copilot", opsCopilotRoutes);
app.use("/api/polyglot", polyglotRoutes);
app.use("/api/wayfinder", wayfinderRoutes);
app.use("/api/green-ops", greenOpsRoutes);
app.use("/api/stadium-live", stadiumLiveRoutes);

// Centralized Error Handling Middleware
app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
  if (res.headersSent) return next(err);
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

  const status = typeof err === 'object' && err !== null && 'status' in err && typeof (err as Record<string, unknown>).status === 'number' ? (err as Record<string, unknown>).status as number : 500;
  const message = err instanceof Error ? err.message : "An unexpected error occurred.";

  res.status(status).json({ 
    error: "internal_server_error", 
    message: process.env.NODE_ENV === 'development' ? message : "An unexpected error occurred." 
  });
});

const PORT = 3000;

export const createApp = async () => {
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
  setupWebSocket(server);

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

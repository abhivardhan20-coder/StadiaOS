import express, { Response, NextFunction } from "express";
import { z } from "zod";
import { requireAuth, requireCsrf, AuthenticatedRequest } from "../middleware/auth";
import { aiLimiter } from "../middleware/security";
import { ai } from "../config";
import { evaluateOpsPolicy } from "../policy/evaluateOpsPolicy";

const router = express.Router();

export const opsCopilotSchema = z.object({
  prompt: z.string().min(1).max(1000),
  context: z.object({
    time: z.string().optional(),
    alerts: z.array(z.string()).optional(),
    weather: z.string().optional(),
    transit: z.string().optional(),
    zones: z.array(z.object({ name: z.string(), density: z.number() })).optional()
  }).optional()
});

router.post("/", aiLimiter, requireAuth, requireCsrf, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const parsed = opsCopilotSchema.parse(req.body);
    const { prompt, context } = parsed;
    
    const policy = evaluateOpsPolicy(context);
    
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
      model: "gemini-2.5-flash",
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
    
    res.write(`data: ${JSON.stringify({ policy })}\\n\\n`);

    for await (const chunk of responseStream) {
      if (chunk.text) {
        res.write(`data: ${JSON.stringify({ text: chunk.text })}\\n\\n`);
      }
    }
    res.write('data: [DONE]\\n\\n');
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
    res.write(`data: ${JSON.stringify({ text: "I'm currently operating in offline mode due to API rate limits. I cannot process your specific request at this moment, but standard protocols advise checking the Crowd Pulse Engine and Green Ops Advisor for live metrics." })}\\n\\n`);
    res.write('data: [DONE]\\n\\n');
    res.end();
  }
});

export default router;

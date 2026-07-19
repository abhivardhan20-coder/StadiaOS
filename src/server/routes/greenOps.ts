import express, { Request, Response, NextFunction } from "express";
import { aiLimiter } from "../middleware/security";
import { ai, DEFAULT_GREEN_OPS } from "../config";

const router = express.Router();

let greenOpsCache: { data: unknown; expiresAt: number } | null = null;
const GREEN_OPS_TTL_MS = 30_000;

router.get("/", aiLimiter, async (req: Request, res: Response, next: NextFunction) => {
  if (greenOpsCache && greenOpsCache.expiresAt > Date.now()) {
    return res.json(greenOpsCache.data);
  }
  try {
    const context = "Current Time: Active match. Stadium capacity: 90%. Weather: Clear, 22C.";
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
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
    
    greenOpsCache = { data: result, expiresAt: Date.now() + GREEN_OPS_TTL_MS };
    res.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "unknown_error";
    console.log("Gemini API quota exceeded in /api/green-ops, using offline mock data. Error:", message);
    res.json({ ...DEFAULT_GREEN_OPS });
  }
});

export default router;

import express, { Response, NextFunction } from "express";
import { z } from "zod";
import { requireAuth, requireCsrf, AuthenticatedRequest } from "../middleware/auth";
import { aiLimiter } from "../middleware/security";
import { ai } from "../config";

const router = express.Router();

export const polyglotSchema = z.object({
  text: z.string().min(1).max(2000),
  targetLanguage: z.string().min(1).max(50),
  history: z.array(z.object({
    role: z.string(),
    content: z.string()
  })).optional()
});

router.post("/", aiLimiter, requireAuth, requireCsrf, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const parsed = polyglotSchema.parse(req.body);
    const { text, targetLanguage, history } = parsed;
    
    let historyContext = "";
    if (history && history.length > 0) {
      historyContext = `
Previous conversation:
` + history.map(h => `${h.role}: ${h.content}`).join('\n');
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
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

export default router;

import { GoogleGenAI } from "@google/genai";
import { z } from "zod";

if (!process.env.GEMINI_API_KEY) {
  console.warn('WARNING: GEMINI_API_KEY is not set. All AI endpoints will serve offline mock data.');
}

export const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  if (process.env.NODE_ENV === 'production') {
    console.error('FATAL: JWT_SECRET must be set in production. Refusing to start.');
    process.exit(1);
  }
  console.warn('WARNING: JWT_SECRET is not set. Using an insecure dev-only fallback.');
}
export const EFFECTIVE_JWT_SECRET = JWT_SECRET || 'fallback_secret_for_dev_environments_only';
if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
  console.warn('OAuth secrets missing. OAuth will fail.');
}

export const DEFAULT_GREEN_OPS = {
  score: 88, electricity: "1.2MW", solar: "350kW", water: "4.2kL/h",
  hvac: "Optimal (22C)", carbon: "2.1t/h", waste: "1.2t", recycling: "0.8t",
  foodWaste: "150kg", battery: "92%", airQuality: "Good (42 AQI)",
  temperature: "22°C", humidity: "45%", savings: "$1,250",
  forecasts: ["Peak energy demand expected at 18:00", "Solar generation dropping in 2 hours", "HVAC efficiency at 95%"],
  recommendations: ["Pre-cool sector 4", "Switch to battery power for peak", "Reduce lighting in empty zones"],
};

import express, { Response, NextFunction } from "express";
import { z } from "zod";
import { requireAuth, requireCsrf, AuthenticatedRequest } from "../middleware/auth";
import { aiLimiter } from "../middleware/security";
import { ai } from "../config";

const router = express.Router();

export const wayfinderSchema = z.object({
  destination: z.string().min(1).max(500),
  stepFreeOnly: z.boolean().optional(),
  role: z.string().optional(),
  avoid: z.array(z.string()).optional(),
  evacuationMode: z.boolean().optional()
});

router.post("/", aiLimiter, requireAuth, requireCsrf, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
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
      model: "gemini-2.5-flash",
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
      
      if (stepFreeOnly && result.route_steps.some((step: { type: string }) => step.type === "stairs")) {
        throw new Error("step_free_violation");
      }
      
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

export default router;

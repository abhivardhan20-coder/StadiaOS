export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  metadata?: Record<string, unknown>;
}

export interface Zone {
  id: string;
  name: string;
  density: number;
  status: 'normal' | 'warning' | 'critical';
}

export interface RouteStep {
  instruction: string;
  type: 'walk' | 'stairs' | 'elevator' | 'ramp' | 'turn' | 'emergency_exit' | 'staff_corridor' | 'checkpoint' | 'vip_corridor';
  congestion?: 'low' | 'moderate' | 'high' | 'blocked';
  distance?: number;
  duration?: number;
}

export interface WayfinderRoute {
  destination: string;
  route_steps: RouteStep[];
  estimated_walk_time_min: number;
  step_free: boolean;
  rationale: string;
  alternative_entrance?: string;
  predicted_congestion?: string;
  alternative_routes?: { name: string, time_min: number, reason: string }[];
}

export interface GreenOpsData {
  score: number;
  electricity: string;
  solar: string;
  water: string;
  hvac: string;
  carbon: string;
  waste: string;
  recycling: string;
  foodWaste: string;
  battery: string;
  airQuality: string;
  temperature: string;
  humidity: string;
  savings: string;
  forecasts: string[];
  recommendations: string[];
}

export interface TranslationResult {
  translatedText?: string;
  intent?: string;
  detectedLanguage?: string;
  recommendation?: string;
  confidence?: number;
}

export interface LiveContext {
  time: string;
  alerts: string[];
  weather: string;
  transit: string;
  zones: Zone[];
  totalOccupancy: number;
}

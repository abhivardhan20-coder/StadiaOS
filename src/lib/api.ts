import { TranslationResult, WayfinderRoute, GreenOpsData } from '../types';
import { FALLBACK_MOCKS } from './mocks';

/**
 * ApiClient handles all communication with the backend API.
 * It provides methods for translating text, retrieving stadium metrics,
 * and calculating wayfinding routes, with built-in fallback to mock data.
 */
export class ApiClient {
  private static async handleResponse(response: Response) {
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        throw new Error(`API Error: ${response.status}`, { cause: e });
      }
      throw new Error(errorData.message || errorData.error || 'Unknown API Error');
    }
    return response.json();
  }

  /**
   * Translates text to a target language.
   * @param text The original text to translate.
   * @param targetLanguage The language code to translate into (e.g., 'es').
   * @param history Optional conversation history.
   * @returns A promise resolving to a TranslationResult.
   */
  static async translate(text: string, targetLanguage: string, history?: {role: string, content: string}[]): Promise<TranslationResult> {
    try {
    const res = await fetch('/api/polyglot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, targetLanguage, history })
    });
    return await this.handleResponse(res);
    } catch (e) {
      console.warn("Falling back to offline mock for translate", e);
      return FALLBACK_MOCKS.polyglot(text, targetLanguage) as unknown as TranslationResult;
    }
  }

  /**
   * Retrieves live environmental and operational sustainability metrics.
   * @returns A promise resolving to GreenOpsData.
   */
  static async getGreenOpsData(): Promise<GreenOpsData> {
    try {
    const res = await fetch('/api/green-ops');
    return await this.handleResponse(res);
    } catch (e) {
      console.warn("Falling back to offline mock for greenOps", e);
      // Simulate real-time variation
      const mock = { ...FALLBACK_MOCKS.greenOps };
      mock.score = Math.floor(mock.score + (Math.random() * 4 - 2));
      return mock as unknown as GreenOpsData;
    }
  }

  /**
   * Retrieves real-time stadium occupancy, crowd, and event context data.
   * @returns A promise resolving to the stadium live context data.
   */
  static async getStadiumLive(): Promise<unknown> {
    try {
    const res = await fetch('/api/stadium-live');
    return await this.handleResponse(res);
    } catch (e) {
      console.warn("Falling back to offline mock for stadiumLive", e);
      // Simulate real-time variation
      const mock = JSON.parse(JSON.stringify(FALLBACK_MOCKS.stadiumLive));
      mock.crowdPulse.overallDensity = Math.floor(mock.crowdPulse.overallDensity + (Math.random() * 4 - 2));
      return mock;
    }
  }

  /**
   * Retrieves an optimal navigational route based on current stadium conditions.
   * @param options Configuration for the route calculation including destination and preferences.
   * @returns A promise resolving to a WayfinderRoute.
   */
  static async getWayfinderRoute(options: { destination: string, stepFreeOnly?: boolean, role?: string, avoid?: string[], evacuationMode?: boolean }): Promise<WayfinderRoute> {
    try {
    const res = await fetch('/api/wayfinder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(options)
    });
    return await this.handleResponse(res);
    } catch (e) {
      console.warn("Falling back to offline mock for wayfinder", e);
      return FALLBACK_MOCKS.wayfinder(options.destination) as unknown as WayfinderRoute;
    }
  }
}

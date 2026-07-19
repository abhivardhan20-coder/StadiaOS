import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ApiClient } from './api';

describe('ApiClient', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  describe('getGreenOpsData', () => {
    it('returns parsed JSON on a successful request', async () => {
      (fetch as unknown).mockResolvedValueOnce({ ok: true, json: async () => ({ score: 85 }) });
      const result = await ApiClient.getGreenOpsData();
      expect(result).toEqual({ score: 85 });
    });

    it('falls back to mock data when the network request fails', async () => {
      (fetch as unknown).mockRejectedValueOnce(new Error('network down'));
      const result = await ApiClient.getGreenOpsData();
      expect(result).toBeDefined();
      expect(result.score).toBeTypeOf('number');
    });

    it('throws/handles non-2xx responses gracefully', async () => {
      (fetch as unknown).mockResolvedValueOnce({ ok: false, status: 500, json: async () => ({}) });
      const result = await ApiClient.getGreenOpsData();
      expect(result).toBeDefined();
      expect(result.score).toBeTypeOf('number');
    });
  });

  describe('translate', () => {
    it('returns parsed JSON on a successful request', async () => {
      (fetch as unknown).mockResolvedValueOnce({ ok: true, json: async () => ({ translatedText: 'Hola' }) });
      const result = await ApiClient.translate('Hello', 'es');
      expect(result).toEqual({ translatedText: 'Hola' });
    });

    it('falls back to mock data when network fails', async () => {
      (fetch as unknown).mockRejectedValueOnce(new Error('network down'));
      const result = await ApiClient.translate('Hello', 'es');
      expect(result).toBeDefined();
    });
    
    it('handles non-2xx error with message', async () => {
      (fetch as unknown).mockResolvedValueOnce({ ok: false, status: 400, json: async () => ({ message: 'Bad Request' }) });
      const result = await ApiClient.translate('Hello', 'es');
      expect(result).toBeDefined(); // Falls back to mock on throw
    });
    
    it('handles non-2xx error without json', async () => {
      (fetch as unknown).mockResolvedValueOnce({ ok: false, status: 502, json: async () => { throw new Error('invalid') } });
      const result = await ApiClient.translate('Hello', 'es');
      expect(result).toBeDefined(); // Falls back to mock on throw
    });
  });

  describe('getStadiumLive', () => {
    it('returns parsed JSON on a successful request', async () => {
      (fetch as unknown).mockResolvedValueOnce({ ok: true, json: async () => ({ occupancy: 100 }) });
      const result = await ApiClient.getStadiumLive();
      expect(result).toEqual({ occupancy: 100 });
    });

    it('falls back to mock data when network fails', async () => {
      (fetch as unknown).mockRejectedValueOnce(new Error('network down'));
      const result = await ApiClient.getStadiumLive();
      expect(result).toBeDefined();
    });
  });

  describe('getWayfinderRoute', () => {
    it('returns parsed JSON on a successful request', async () => {
      (fetch as unknown).mockResolvedValueOnce({ ok: true, json: async () => ({ destination: 'Gate A' }) });
      const result = await ApiClient.getWayfinderRoute({ destination: 'Gate A' });
      expect(result).toEqual({ destination: 'Gate A' });
    });

    it('falls back to mock data when network fails', async () => {
      (fetch as unknown).mockRejectedValueOnce(new Error('network down'));
      const result = await ApiClient.getWayfinderRoute({ destination: 'Gate A' });
      expect(result).toBeDefined();
    });
  });
});

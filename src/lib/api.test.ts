import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ApiClient } from './api';

describe('ApiClient', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  it('returns parsed JSON on a successful request', async () => {
    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ score: 85 }),
    });
    const result = await ApiClient.getGreenOpsData();
    expect(result).toEqual({ score: 85 });
  });

  it('falls back to mock data when the network request fails', async () => {
    (fetch as any).mockRejectedValueOnce(new Error('network down'));
    const result = await ApiClient.getGreenOpsData();
    expect(result).toBeDefined();
    expect(result.score).toBeTypeOf('number');
  });

  it('throws/handles non-2xx responses gracefully', async () => {
    (fetch as any).mockResolvedValueOnce({ ok: false, status: 500, json: async () => ({}) });
    await expect(ApiClient.getGreenOpsData()).resolves.toBeDefined(); // Falls back to mock
  });
});

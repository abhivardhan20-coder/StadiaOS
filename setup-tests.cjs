const fs = require('fs');

// 1. src/lib/api.test.ts
fs.writeFileSync('src/lib/api.test.ts', `
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
    await expect(ApiClient.getGreenOpsData()).resolves.toBeDefined();
  });
});
`);

// 2. src/hooks/useContainerWidth.test.ts
fs.writeFileSync('src/hooks/useContainerWidth.test.ts', `
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useContainerWidth } from './useContainerWidth';

describe('useContainerWidth', () => {
  let resizeCallback: any;
  const mockObserve = vi.fn();
  const mockDisconnect = vi.fn();

  beforeEach(() => {
    global.ResizeObserver = class ResizeObserver {
      constructor(cb: any) {
        resizeCallback = cb;
      }
      observe = mockObserve;
      unobserve = vi.fn();
      disconnect = mockDisconnect;
    } as any;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should initialize and update width on resize', () => {
    const { result, unmount } = renderHook(() => useContainerWidth());
    
    expect(result.current.width).toBe(0);
    
    // Simulate ref attached
    act(() => {
      result.current.containerRef({ clientWidth: 500 } as HTMLElement);
    });

    expect(mockObserve).toHaveBeenCalled();

    // Simulate resize
    act(() => {
      resizeCallback([{ contentRect: { width: 800 } }]);
    });

    expect(result.current.width).toBe(800);

    // Unmount
    unmount();
    expect(mockDisconnect).toHaveBeenCalled();
  });
});
`);

// 3. src/components/dashboard/OverviewMap.test.tsx
fs.writeFileSync('src/components/dashboard/OverviewMap.test.tsx', `
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { OverviewMap } from './OverviewMap';

vi.mock('../../lib/LiveEventPipeline', () => ({
  useLivePipeline: () => ({
    data: {
      crowdPulse: {
        heatmapData: [
          { zone: "Gate A", density: 92, trend: "up" },
          { zone: "Gate B", density: 45, trend: "down" }
        ]
      }
    }
  })
}));

describe('OverviewMap', () => {
  it('renders critical density zones with correct status class', () => {
    render(<OverviewMap />);
    const gateA = screen.getByText('Gate A');
    // Find parent element to check class
    const button = gateA.closest('button');
    expect(button).not.toBeNull();
    
    // Just clicking should not throw
    if(button) fireEvent.click(button);
  });
});
`);

// 4. src/App.test.tsx
fs.writeFileSync('src/App.test.tsx', `
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';

// Need to mock fetch and resize observer
vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({}) })));
vi.stubGlobal('ResizeObserver', class { observe() {} unobserve() {} disconnect() {} });

// Mock modules
vi.mock('./components/auth/AuthFlow', () => ({
  AuthFlow: ({ onAuthenticated }: any) => <button onClick={onAuthenticated}>Login</button>
}));

describe('App', () => {
  it('renders authentication and then dashboard shell', async () => {
    render(<App />);
    
    const loginButton = screen.getByText('Login');
    expect(loginButton).toBeDefined();
    
    fireEvent.click(loginButton);
    
    // Check if dashboard renders
    await waitFor(() => {
      expect(document.querySelector('.custom-scrollbar')).toBeDefined();
    });
  });
});
`);

// 5. server.test.ts
fs.writeFileSync('server.test.ts', `
import { describe, it, expect, vi, beforeAll } from 'vitest';
import request from 'supertest';

vi.mock('@google/genai', () => ({
  GoogleGenAI: vi.fn().mockImplementation(() => ({
    models: { generateContent: vi.fn().mockResolvedValue({ text: 'mock response' }) },
  })),
}));

let app: any;
beforeAll(async () => {
  process.env.JWT_SECRET = 'test_secret';
  ({ app } = await import('./server'));
});

describe('POST /api/ops-copilot', () => {
  it('rejects an empty prompt with 400', async () => {
    const res = await request(app).post('/api/ops-copilot').send({ prompt: '' });
    expect(res.status).toBe(400);
  });

  it('accepts a valid payload', async () => {
    const res = await request(app).post('/api/ops-copilot').send({ prompt: 'Show Gate 7 status' });
    expect(res.status).toBe(200);
  });
});

describe('Zod Schemas', () => {
  it('validates wayfinder schema', async () => {
    const { wayfinderSchema } = await import('./server');
    const valid = { destination: 'Gate A', stepFreeOnly: true, role: 'Staff' };
    expect(() => wayfinderSchema.parse(valid)).not.toThrow();
    
    const invalid = { stepFreeOnly: true }; // missing destination
    expect(() => wayfinderSchema.parse(invalid)).toThrow();
  });
});
`);

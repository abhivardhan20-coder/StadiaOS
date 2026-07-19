import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CrowdPulse } from './CrowdPulse';
import React from 'react';
import * as LiveEventPipeline from '@/src/lib/LiveEventPipeline';

vi.mock('@/src/lib/LiveEventPipeline', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as unknown),
    useLivePipeline: vi.fn(),
  };
});

// Mock Recharts to avoid dom measurement issues
vi.mock('recharts', async () => {
  const OriginalRechartsModule = await vi.importActual('recharts');
  return {
    ...OriginalRechartsModule,
    ResponsiveContainer: ({ children }: unknown) => <div>{children}</div>,
  };
});

describe('CrowdPulse', () => {
  it('renders crowd pulse dashboard with live data', async () => {
    vi.spyOn(LiveEventPipeline, 'useLivePipeline').mockReturnValue({
      data: {
        crowdPulse: {
          overallDensity: 85,
          predictedPeak: '19:30',
          anomalies: ['Unusual buildup near Gate C'],
          heatmapData: [
            { zone: 'Gate A', density: 92, trend: 'up' },
          ]
        },
      } as unknown,
      status: 'active',
      lastUpdated: Date.now(),
      error: undefined,
      optimisticUpdate: vi.fn()
    });

    render(<CrowdPulse />);

    await waitFor(() => {
      expect(screen.getByText('Crowd Intelligence Engine')).toBeTruthy();
    });
  });
});

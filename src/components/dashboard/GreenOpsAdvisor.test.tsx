import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { GreenOpsAdvisor } from './GreenOpsAdvisor';
import { ToastProvider } from '@/src/hooks/useToast';
import React from 'react';
import * as LiveEventPipeline from '@/src/lib/LiveEventPipeline';

vi.mock('@/src/lib/LiveEventPipeline', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as unknown),
    useLivePipeline: vi.fn(),
  };
});

describe('GreenOpsAdvisor', () => {
  it('renders green ops dashboard with mock data', async () => {
    vi.spyOn(LiveEventPipeline, 'useLivePipeline').mockReturnValue({
      data: {
        score: 88,
        electricity: '1.2MW',
        solar: '350kW',
        water: '4.2kL/h',
        hvac: 'Optimal (22C)',
        carbon: '2.1t/h',
        waste: '1.2t',
        recycling: '0.8t',
        foodWaste: '150kg',
        battery: '92%',
        airQuality: 'Good (42 AQI)',
        temperature: '22°C',
        humidity: '45%',
        savings: '$4,250',
        forecasts: ['Peak energy demand expected at 18:00'],
        recommendations: ['Pre-cool sector 4']
      } as unknown,
      status: 'active',
      lastUpdated: Date.now(),
      error: undefined,
      optimisticUpdate: vi.fn()
    });

    render(
      <ToastProvider>
        <GreenOpsAdvisor />
      </ToastProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Pre-cool sector 4')).toBeTruthy();
      expect(screen.getByText('1.2MW')).toBeTruthy();
      expect(screen.getByText('350kW')).toBeTruthy();
    });
  });
});

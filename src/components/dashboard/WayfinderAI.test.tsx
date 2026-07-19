import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { WayfinderAI } from './WayfinderAI';
import { ToastProvider } from '@/src/hooks/useToast';
import { ApiClient } from '@/src/lib/api';
import React from 'react';

vi.mock('@/src/lib/api');

describe('WayfinderAI', () => {
  it('excludes stairs when step-free is required', async () => {
    (ApiClient.getWayfinderRoute as unknown).mockResolvedValue({
      destination: 'Gate C',
      step_free: true,
      route_steps: [
        { instruction: 'Take elevator', type: 'elevator', congestion: 'low', distance: 0, duration: 1 },
      ],
      estimated_walk_time_min: 5,
      rationale: 'Step-free path selected.',
      predicted_congestion: 'low',
      alternative_routes: [],
    });

    render(
      <ToastProvider>
        <WayfinderAI />
      </ToastProvider>
    );
    fireEvent.click(screen.getByLabelText(/Toggle step-free wheelchairs/i));
    fireEvent.change(screen.getByPlaceholderText(/e.g. Gate 4/i), { target: { value: 'Gate C' } });
    fireEvent.click(screen.getByRole('button', { name: /Find Route/i }));

    await waitFor(() => {
      expect(screen.getByText(/Take elevator/i)).toBeTruthy();
    });
    expect(screen.queryByText(/stairs/i)).toBeNull();
  });
});

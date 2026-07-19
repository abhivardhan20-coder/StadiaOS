import "@testing-library/jest-dom";
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SecurityCenter } from './SecurityCenter';
import { useLivePipeline } from '../../lib/LiveEventPipeline';

vi.mock('../../lib/LiveEventPipeline', () => ({
  useLivePipeline: vi.fn(),
}));

describe('SecurityCenter', () => {
  it('renders critical alerts with appropriate accessibility attributes', () => {
    vi.mocked(useLivePipeline).mockReturnValue({
      data: {
        lastUpdate: new Date().toISOString(),
        crowdPulse: { overallDensity: 50, zoneCount: 1, activeAlerts: 1 },
        zones: [
          { id: 'z1', name: 'Zone 1', density: 90, status: 'critical', threatLevel: 'high' }
        ],
        alerts: [
          { id: '1', type: 'security', severity: 'critical', message: 'Medical emergency at Gate C', timestamp: new Date().toISOString(), status: 'active' }
        ]
      },
      status: 'active',
    } as any);

    render(<SecurityCenter />);

    // Look for elements with role="alert" or aria-live="assertive" or aria-live="polite"
    const alertElements = screen.getAllByRole('alert');
    expect(alertElements.length).toBeGreaterThan(0);
    
    // Specifically looking for the critical alert
    const criticalAlertText = screen.getByText(/Medical emergency at Gate C/i);
    expect(criticalAlertText).toBeInTheDocument();
  });
});

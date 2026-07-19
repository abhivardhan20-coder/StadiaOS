import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CommandCenter } from './CommandCenter';
import { ToastProvider } from '../../hooks/useToast';
import '@testing-library/jest-dom';

vi.mock('./OverviewMap', () => ({ OverviewMap: () => <div data-testid="overview-map">Map</div> }));
vi.mock('./CrowdPulse', () => ({ CrowdPulse: () => <div>CrowdPulse</div> }));
vi.mock('./WayfinderAI', () => ({ WayfinderAI: () => <div>WayfinderAI</div> }));
vi.mock('./GreenOpsAdvisor', () => ({ GreenOpsAdvisor: () => <div>GreenOpsAdvisor</div> }));
vi.mock('./OpsCopilot', () => ({ OpsCopilot: () => <div>OpsCopilot</div> }));
vi.mock('../../hooks/useContainerWidth', () => ({
  useContainerWidth: () => ({ width: 1000, containerRef: { current: null }, mounted: true })
}));

vi.mock('../../lib/LiveEventPipeline', () => ({
  useLivePipeline: vi.fn(() => ({ status: 'success', lastUpdated: new Date().toISOString(), error: null })),
  usePipelineHealth: vi.fn(() => ({ isOnline: true, activeSubscriptions: 0, queuedMessages: 0, wsReady: true, lastPing: 0 })),
}));

describe('CommandCenter', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  const renderComponent = () => render(
    <ToastProvider>
      <CommandCenter />
    </ToastProvider>
  );

  it('renders default layout when localStorage is empty', () => {
    renderComponent();
    expect(screen.getByTestId('overview-map')).toBeInTheDocument();
  });

  it('handles corrupted localStorage gracefully', () => {
    localStorage.setItem('ssip_command_center_layouts', 'invalid json {');
    
    expect(() => renderComponent()).not.toThrow();
    expect(screen.getByTestId('overview-map')).toBeInTheDocument();
  });

  it('restores layout from valid localStorage', () => {
    const customLayouts = {
      lg: [{ i: 'map', x: 2, y: 2, w: 2, h: 2 }]
    };
    localStorage.setItem('ssip_command_center_layouts', JSON.stringify(customLayouts));
    
    renderComponent();
    expect(screen.getByTestId('overview-map')).toBeInTheDocument();
  });
});

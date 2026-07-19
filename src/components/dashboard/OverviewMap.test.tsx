import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { OverviewMap } from './OverviewMap';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as LiveEventPipeline from '@/src/lib/LiveEventPipeline';

// Mock the Recharts ResponsiveContainer to just render its children
vi.mock('recharts', async (importOriginal) => {
  const actual: unknown = await importOriginal();
  return {
    ...actual,
    ResponsiveContainer: ({ children }: unknown) => <div>{children}</div>,
  };
});

describe('OverviewMap', () => {
  beforeEach(() => {
    vi.spyOn(LiveEventPipeline, 'useLivePipeline').mockReturnValue({
      data: {
        liveContext: {
          zones: [
            { id: 'north_stand', name: 'North Stand', density: 95, status: 'critical' },
            { id: 'south_stand', name: 'South Stand', density: 40, status: 'normal' },
          ]
        }
      } as unknown,
      status: 'active',
      lastUpdated: Date.now(),
      error: undefined,
      optimisticUpdate: vi.fn()
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders critical-density zones with correct status class/label and handles clicks', async () => {
    render(<OverviewMap />);
    
    // Wait for the Live Digital Twin map to render
    expect(screen.getByText('Live Digital Twin')).toBeDefined();
    
    // Find the critical zone text in the SVG (or test clicking it)
    // The component renders SVGs with texts for zone names
    // It should have 'North Stand' text
    const northStandText = screen.getByText('North Stand');
    expect(northStandText).toBeDefined();

    // Click on the group containing the text or the path
    // Since it's an SVG group with role="button", we can find it by clicking the text's parent
    const buttonGroup = northStandText.closest('g[role="button"]');
    expect(buttonGroup).not.toBeNull();
    
    fireEvent.click(buttonGroup!);
    
    // The side panel should open with details for North Stand
    await waitFor(() => {
      expect(screen.getByText('ID: NORTH_STAND')).toBeDefined();
    });
    
    // Check if the critical status is displayed in the side panel
    expect(screen.getByText('critical')).toBeDefined();
    // Check density
    expect(screen.getByText('95.0')).toBeDefined();
  });
});

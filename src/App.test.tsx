import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock ResizeObserver
const mockResizeObserver = vi.fn(() => ({
  observe: vi.fn(),
  disconnect: vi.fn(),
  unobserve: vi.fn(),
}));

vi.mock('./components/auth/AuthFlow', () => ({
  AuthFlow: ({ onAuthenticated }: any) => {
    React.useEffect(() => {
      onAuthenticated();
    }, [onAuthenticated]);
    return <div>Auth Mock</div>;
  }
}));

// Mock ResizeObserver for any child components using useContainerWidth
vi.stubGlobal('ResizeObserver', mockResizeObserver);

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders the main dashboard and handles sidebar navigation', async () => {
    render(<App />);
    
    // Wait for the main shell to render (which implies AuthFlow successfully finished)
    // The main shell has a 'Skip to main content' link or we can check for Sidebar elements
    await waitFor(() => {
      expect(screen.getByText('Skip to main content')).toBeDefined();
    });

    // The default active tab is 'overview' (Stadium Overview).
    // Let's verify something specific to OverviewMap is rendered, or just 'Stadium Overview' title
    // Actually, 'CommandCenter' is lazy-loaded, let's wait for it
    await waitFor(() => {
      // In CommandCenter or Header, the title might be displayed or we can check sidebar active item
      // We know 'Overview' tab is in Sidebar
      const crowdLink = screen.getByRole('button', { name: /crowd pulse/i });
      expect(crowdLink).toBeDefined();
    });

    // Click on another tab in the sidebar
    const crowdTab = screen.getByRole('button', { name: /crowd pulse/i });
    fireEvent.click(crowdTab);

    // Assert that the visible panel is updated (e.g., activeTab changes, and CrowdPulse component renders)
    // We can just verify the Document Title changes, since App.tsx has: document.title = titles[activeTab];
    await waitFor(() => {
      expect(document.title).toBe('Crowd Pulse Engine');
    });
  });
});

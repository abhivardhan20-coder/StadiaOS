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

// Mock WebSocket to prevent undici networking errors during JSDOM tests
vi.stubGlobal('WebSocket', vi.fn(() => ({
  send: vi.fn(),
  close: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
})));

const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
};
vi.stubGlobal('localStorage', mockLocalStorage);

vi.stubGlobal('matchMedia', vi.fn(() => ({
  matches: false,
  addListener: vi.fn(),
  removeListener: vi.fn(),
})));

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders the main dashboard and handles sidebar navigation', async () => {
    render(<App />);
    
    // assert the main navigation/dashboard shell renders without throwing
    await waitFor(() => {
      expect(screen.getAllByText('Skip to main content').length).toBeGreaterThan(0);
    });

    await waitFor(() => {
      const crowdLink = screen.getByRole('button', { name: /crowd intelligence/i });
      expect(crowdLink).toBeDefined();
    });

    // that switching between two sidebar tabs updates the visible panel.
    const crowdTab = screen.getByRole('button', { name: /crowd intelligence/i });
    fireEvent.click(crowdTab);

    await waitFor(() => {
      expect(document.title).toBe('Crowd Pulse Engine');
    });
  });
});

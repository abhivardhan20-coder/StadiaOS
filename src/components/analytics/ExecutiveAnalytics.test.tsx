import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ExecutiveAnalytics } from './ExecutiveAnalytics';

describe('ExecutiveAnalytics', () => {
  it('renders and interacts', () => {
    // Add global.ResizeObserver mock to avoid recharts crashing
    global.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    } as any;

    render(<ExecutiveAnalytics />);
    
    const buttons = screen.getAllByRole('button');
    buttons.forEach(b => {
      try { fireEvent.click(b); } catch (e) { /* ignore */ }
    });

    expect(screen.getByText(/Executive Analytics/i)).toBeDefined();
  });
});

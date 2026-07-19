import React from 'react';
import { render, screen, act, fireEvent } from '@testing-library/react';
import { useToast, ToastProvider } from './useToast';
import { describe, it, expect, vi } from 'vitest';

vi.mock('motion/react', () => ({
  motion: { div: ({ children, ...props }: any) => <div {...props}>{children}</div> },
  AnimatePresence: ({ children }: any) => <>{children}</>
}));

const TestComponent = () => {
  const { addToast } = useToast();
  return (
    <div>
      <button onClick={() => addToast('Test Message', 'success')}>Add Success Toast</button>
      <button onClick={() => addToast('Error Message', 'error')}>Add Error Toast</button>
    </div>
  );
};

describe('useToast', () => {
  it('throws an error if used outside ToastProvider', () => {
    // Suppress console.error for expected react error
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    let error;
    try {
      render(<TestComponent />);
    } catch (e) {
      error = e;
    }
    expect(error).toBeDefined();
    consoleError.mockRestore();
  });

  it('renders a toast and removes it on click', async () => {
    vi.useFakeTimers();
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    // Click to add success toast
    const button = screen.getByText('Add Success Toast');
    fireEvent.click(button);

    // Assert it appears
    expect(screen.getByText('Test Message')).toBeDefined();

    // Click close button
    const closeBtn = screen.getByLabelText('Close notification');
    fireEvent.click(closeBtn);

    // Wait for remove
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(screen.queryByText('Test Message')).toBeNull();
    
    vi.useRealTimers();
  });

  it('automatically removes toast after 5 seconds', () => {
    vi.useFakeTimers();
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    const button = screen.getByText('Add Error Toast');
    fireEvent.click(button);

    expect(screen.getByText('Error Message')).toBeDefined();

    // Fast forward 5000ms
    act(() => {
      vi.advanceTimersByTime(5100);
    });

    expect(screen.queryByText('Error Message')).toBeNull();
    
    vi.useRealTimers();
  });
});

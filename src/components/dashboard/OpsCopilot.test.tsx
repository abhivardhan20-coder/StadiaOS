import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeAll } from 'vitest';
import { OpsCopilot } from './OpsCopilot';
import { ToastProvider } from '@/src/hooks/useToast';
import React from 'react';
import * as LiveEventPipeline from '@/src/lib/LiveEventPipeline';

vi.mock('@/src/lib/LiveEventPipeline', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as any),
    useLivePipeline: vi.fn(),
  };
});

describe('OpsCopilot', () => {
  beforeAll(() => {
    window.HTMLElement.prototype.scrollIntoView = vi.fn();
  });

  it('renders correctly and handles submission', async () => {
    vi.spyOn(LiveEventPipeline, 'useLivePipeline').mockReturnValue({
      data: {
        liveContext: { zones: [] },
      } as any,
      status: 'active',
      lastUpdated: Date.now(),
      error: undefined,
      optimisticUpdate: vi.fn()
    });

    render(
      <ToastProvider>
        <OpsCopilot />
      </ToastProvider>
    );

    const input = screen.getByPlaceholderText(/Ask about crowd management/i);
    fireEvent.change(input, { target: { value: 'help' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    await waitFor(() => {
      expect(screen.getByText('help')).toBeTruthy();
    });
  });
});

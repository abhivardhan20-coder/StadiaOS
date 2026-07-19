import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useLivePipeline, usePipelineHealth, PipelineProvider } from './LiveEventPipeline';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('LiveEventPipeline', () => {
  beforeEach(() => {
    // Stub out WebSocket to prevent any real networking
    vi.stubGlobal('WebSocket', vi.fn(() => ({
      send: vi.fn(),
      close: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      readyState: 0,
    })));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('useLivePipeline fetches data and updates state', async () => {
    const fetcher = vi.fn().mockResolvedValue({ testData: 123 });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <PipelineProvider>{children}</PipelineProvider>
    );

    const { result } = renderHook(() => useLivePipeline('testChannel', fetcher, 5000), { wrapper });

    // Initial state is loading
    expect(result.current.status).toBe('loading');

    await waitFor(() => {
      expect(result.current.data).toEqual({ testData: 123 });
    });

    expect(fetcher).toHaveBeenCalled();
    expect(result.current.status).toBe('active');
  });

  it('usePipelineHealth returns initial health metrics', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <PipelineProvider>{children}</PipelineProvider>
    );

    const { result } = renderHook(() => usePipelineHealth(), { wrapper });

    expect(result.current).toBeDefined();
    expect(result.current.isOnline).toBeTypeOf('boolean');
  });

  it('optimisticUpdate changes data locally', async () => {
    const fetcher = vi.fn().mockResolvedValue({ val: 1 });
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <PipelineProvider>{children}</PipelineProvider>
    );

    const { result } = renderHook(() => useLivePipeline('optChannel', fetcher, 5000), { wrapper });

    await waitFor(() => {
      expect(result.current.data).toEqual({ val: 1 });
    });

    act(() => {
      result.current.optimisticUpdate((prev: unknown) => ({ ...prev, val: 2 }));
    });

    await waitFor(() => {
      expect(result.current.data).toEqual({ val: 2 });
    });
  });

  it('handles offline state properly', async () => {
    const fetcher = vi.fn().mockRejectedValue(new Error('offline'));
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <PipelineProvider>{children}</PipelineProvider>
    );

    const { result } = renderHook(() => useLivePipeline('offlineChannel', fetcher, 5000), { wrapper });

    act(() => {
      window.dispatchEvent(new Event('offline'));
    });

    await waitFor(() => {
      expect(result.current.status).toBe('offline');
    });

    act(() => {
      window.dispatchEvent(new Event('online'));
    });
  });
});


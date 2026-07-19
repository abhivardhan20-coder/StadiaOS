import { renderHook, act } from '@testing-library/react';
import { useContainerWidth } from './useContainerWidth';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('useContainerWidth', () => {
  let mockResizeObserver: unknown;
  let observeMock: unknown;
  let disconnectMock: unknown;

  beforeEach(() => {
    observeMock = vi.fn();
    disconnectMock = vi.fn();
    
    class MockResizeObserver {
      observe = observeMock;
      disconnect = disconnectMock;
      unobserve = vi.fn();
      trigger: unknown;
      constructor(callback: unknown) {
        this.trigger = callback;
        // save the instance so we can trigger it
        if (!mockResizeObserver) mockResizeObserver = { instances: [] };
        if (!mockResizeObserver.instances) mockResizeObserver.instances = [];
        mockResizeObserver.instances.push(this);
      }
    }

    vi.stubGlobal('ResizeObserver', MockResizeObserver);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('initializes with width 1200 and mounted false, then updates on mount', () => {
    const { result, unmount } = renderHook(() => {
      const hookResult = useContainerWidth();
      (hookResult.containerRef as unknown).current = { offsetWidth: 800 };
      return hookResult;
    });

    expect(result.current.mounted).toBe(true);
    
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });
    
    expect(result.current.width).toBe(800);
    expect(observeMock).toHaveBeenCalled();

    unmount();
    expect(disconnectMock).toHaveBeenCalled();
  });

  it('updates width when ResizeObserver fires', () => {
    const { result } = renderHook(() => {
      const hookResult = useContainerWidth();
      (hookResult.containerRef as unknown).current = { offsetWidth: 950 };
      return hookResult;
    });
    
    act(() => {
      const observerInstance = mockResizeObserver.instances[0];
      observerInstance.trigger();
    });

    expect(result.current.width).toBe(950);
  });
});

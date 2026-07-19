import { renderHook, act } from '@testing-library/react';
import { useContainerWidth } from './useContainerWidth';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('useContainerWidth', () => {
  let mockResizeObserver: any;
  let observeMock: any;
  let disconnectMock: any;

  beforeEach(() => {
    observeMock = vi.fn();
    disconnectMock = vi.fn();
    
    mockResizeObserver = vi.fn((callback) => ({
      observe: observeMock,
      disconnect: disconnectMock,
      unobserve: vi.fn(),
      // expose callback to trigger it manually
      trigger: callback
    }));

    vi.stubGlobal('ResizeObserver', mockResizeObserver);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('initializes with width 1200 and mounted false, then updates on mount', () => {
    // Need a mock element
    const mockRef = {
      current: {
        offsetWidth: 800
      }
    };
    
    const { result, unmount } = renderHook(() => {
      const hookResult = useContainerWidth();
      // manually assign ref for testing if needed, though useContainerWidth returns containerRef.
      // We will override the ref's current value before the effect runs if possible, 
      // but in React 18 useEffect runs after paint. So we can just set it after render and trigger resize.
      return hookResult;
    });

    expect(result.current.mounted).toBe(true);
    
    // Set the ref current
    (result.current.containerRef as any).current = { offsetWidth: 800 };
    
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });
    
    expect(result.current.width).toBe(800);
    expect(observeMock).toHaveBeenCalled();

    unmount();
    expect(disconnectMock).toHaveBeenCalled();
  });

  it('updates width when ResizeObserver fires', () => {
    const { result } = renderHook(() => useContainerWidth());
    
    (result.current.containerRef as any).current = { offsetWidth: 950 };
    
    act(() => {
      const observerInstance = mockResizeObserver.mock.results[0].value;
      observerInstance.trigger();
    });

    expect(result.current.width).toBe(950);
  });
});

import { useState, useEffect, useRef } from 'react';

/**
 * A React hook that observes and returns the current width of a container element.
 * Useful for responsive visualizations that need to know their exact pixel width.
 * @returns An object containing the current width, a ref to attach to the container, and a boolean indicating if it has mounted.
 */
export function useContainerWidth() {
  const [width, setWidth] = useState(1200);
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    const updateWidth = () => {
      if (containerRef.current) {
        setWidth(containerRef.current.offsetWidth);
      }
    };
    
    // Use ResizeObserver for more accurate container width tracking if available
    const observer = new ResizeObserver(() => {
        updateWidth();
    });
    
    if (containerRef.current) {
        observer.observe(containerRef.current);
    }
    
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => {
        window.removeEventListener('resize', updateWidth);
        observer.disconnect();
    };
  }, []);

  return { width, containerRef, mounted };
}

import { useState, useEffect, useRef } from 'react';

export function useContainerWidth() {
  const [width, setWidth] = useState(1200);
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
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

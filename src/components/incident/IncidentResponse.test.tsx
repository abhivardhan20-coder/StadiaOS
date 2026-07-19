import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { IncidentResponse } from './IncidentResponse';

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: unknown) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: unknown) => <>{children}</>,
}));

describe('IncidentResponse Smoke Test', () => {
  it('renders without crashing', () => {
    const { container } = render(<IncidentResponse />);
    expect(container).toBeDefined();
  });
});

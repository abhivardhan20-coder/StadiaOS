import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AuthFlow } from './AuthFlow';

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: unknown) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: unknown) => <>{children}</>,
}));

describe('AuthFlow Smoke Test', () => {
  it('renders without crashing', () => {
    const { container } = render(<AuthFlow onAuthenticated={() => {}} />);
    expect(container).toBeDefined();
  });
});

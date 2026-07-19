import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { NotificationHub } from './NotificationHub';

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: unknown) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: unknown) => <>{children}</>,
}));

describe('NotificationHub Smoke Test', () => {
  it('renders without crashing', () => {
    const { container } = render(<NotificationHub />);
    expect(container).toBeDefined();
  });
});

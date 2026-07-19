import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { UserProfile } from './UserProfile';

describe('UserProfile', () => {
  it('renders without crashing', () => {
    const { container } = render(<UserProfile />);
    expect(container).toBeTruthy();
  });
});

import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { StaffManagement } from './StaffManagement';

describe('StaffManagement', () => {
  it('renders without crashing', () => {
    const { container } = render(<StaffManagement />);
    expect(container).toBeTruthy();
  });
});

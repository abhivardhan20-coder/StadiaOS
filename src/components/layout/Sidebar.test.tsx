import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Sidebar } from './Sidebar';

describe('Sidebar', () => {
  it('renders without crashing', () => {
    const setActiveTab = vi.fn();
    const { container } = render(<Sidebar activeTab="dashboard" setActiveTab={setActiveTab} />);
    expect(container).toBeTruthy();
  });
});

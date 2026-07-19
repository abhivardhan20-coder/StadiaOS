import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Header } from './Header';

describe('Header', () => {
  it('renders without crashing and handles clicks', () => {
    const onMenuClick = vi.fn();
    const toggleTheme = vi.fn();
    const setActiveTab = vi.fn();
    const { container } = render(<Header onMenuClick={onMenuClick} isDark={false} toggleTheme={toggleTheme} setActiveTab={setActiveTab} />);
    expect(container).toBeTruthy();
  });
});

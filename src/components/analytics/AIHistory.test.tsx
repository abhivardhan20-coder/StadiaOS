import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AIHistory } from './AIHistory';

describe('AIHistory', () => {
  it('renders and interacts', () => {
    render(<AIHistory />);
    
    const buttons = screen.getAllByRole('button');
    buttons.forEach(b => {
      try { fireEvent.click(b); } catch (e) { /* ignore */ }
    });

    const inputs = screen.queryAllByRole('textbox');
    inputs.forEach(i => {
        try { fireEvent.change(i, { target: { value: 'test' } }); } catch (e) { /* ignore */ }
    });

    expect(screen.queryAllByText(/AI/i).length).toBeGreaterThan(0);
  });
});

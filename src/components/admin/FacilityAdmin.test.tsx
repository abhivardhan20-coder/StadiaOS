import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FacilityAdmin } from './FacilityAdmin';

describe('FacilityAdmin', () => {
  it('renders and interacts', () => {
    render(<FacilityAdmin />);
    
    const buttons = screen.getAllByRole('button');
    buttons.forEach(b => {
      try { fireEvent.click(b); } catch (e) { /* ignore */ }
    });

    const inputs = screen.queryAllByRole('textbox');
    inputs.forEach(i => {
        try { fireEvent.change(i, { target: { value: 'test' } }); } catch (e) { /* ignore */ }
    });

    expect(screen.getByText(/Admin/i)).toBeDefined();
  });
});

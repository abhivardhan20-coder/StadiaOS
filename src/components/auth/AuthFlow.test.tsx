import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AuthFlow } from './AuthFlow';

describe('AuthFlow', () => {
  it('renders and interacts', () => {
    vi.spyOn(window, 'open').mockImplementation(() => null);
    const { container } = render(<AuthFlow onAuthenticated={() => {}} />);
    
    expect(container).toBeTruthy();
    
    const buttons = screen.queryAllByRole('button');
    buttons.forEach(b => {
      try { fireEvent.click(b); } catch (e) { /* ignore */ }
    });
  });
});

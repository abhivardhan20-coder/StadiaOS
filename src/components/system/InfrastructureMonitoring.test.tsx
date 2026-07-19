import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { InfrastructureMonitoring } from './InfrastructureMonitoring';

describe('InfrastructureMonitoring', () => {
  it('renders without crashing', () => {
    render(<InfrastructureMonitoring />);
    expect(screen.getByText(/Live Infrastructure/i)).toBeDefined();
  });
});

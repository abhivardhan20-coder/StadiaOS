import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { WidgetContainer } from './WidgetContainer';

describe('WidgetContainer', () => {
  it('renders without crashing', () => {
    const { container } = render(<WidgetContainer><div>test</div></WidgetContainer>);
    expect(container).toBeTruthy();
  });
});

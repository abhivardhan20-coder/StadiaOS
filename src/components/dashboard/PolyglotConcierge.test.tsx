import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PolyglotConcierge } from './PolyglotConcierge';
import { ApiClient } from '../../lib/api';
import { ToastProvider } from '../../hooks/useToast';
import '@testing-library/jest-dom';

vi.mock('../../lib/api', () => ({
  ApiClient: {
    translate: vi.fn(),
  },
}));

describe('PolyglotConcierge', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  const renderComponent = () => render(<ToastProvider><PolyglotConcierge /></ToastProvider>);

  it('renders translated text', async () => {
    vi.mocked(ApiClient.translate).mockResolvedValueOnce({
      original: 'Hello',
      translatedText: 'Hola',
      language: 'es',
      intent: 'greeting',
    } as any);

    renderComponent();
    const input = screen.getByPlaceholderText(/type or speak in any language/i);
    fireEvent.change(input, { target: { value: 'Hello' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    expect(screen.getByText('ANALYZING...')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText('Hola')).toBeInTheDocument();
      expect(screen.getByText('greeting')).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('shows error state on failure', async () => {
    vi.mocked(ApiClient.translate).mockRejectedValueOnce(new Error('API Error'));

    renderComponent();
    const input = screen.getByPlaceholderText(/type or speak in any language/i);
    fireEvent.change(input, { target: { value: 'Hello' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    await waitFor(() => {
      expect(screen.getByText(/API Error/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('persists chat history to localStorage', async () => {
    vi.mocked(ApiClient.translate).mockResolvedValueOnce({
      original: 'Hello',
      translatedText: 'Hola',
      language: 'es',
      intent: 'greeting',
    } as any);

    const { unmount } = renderComponent();
    const input = screen.getByPlaceholderText(/type or speak in any language/i);
    fireEvent.change(input, { target: { value: 'Hello' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    await waitFor(() => {
      expect(screen.getByText('Hola')).toBeInTheDocument();
    }, { timeout: 3000 });
    
    unmount();
    
    const stored = JSON.parse(localStorage.getItem('ssip_polyglot_history') || '[]');
    expect(stored.length).toBeGreaterThan(0);
    expect(stored[0].original).toBe('Hello');
  });
});

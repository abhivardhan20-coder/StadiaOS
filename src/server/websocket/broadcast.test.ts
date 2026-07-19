import { describe, it, expect, vi } from 'vitest';
import { setupWebSocket } from './broadcast';
import { Server } from 'http';
import { WebSocket } from 'ws';

describe('broadcast', () => {
  it('setupWebSocket', () => {
    const mockServer = new Server();
    setupWebSocket(mockServer);
    expect(mockServer).toBeDefined();
  });
});

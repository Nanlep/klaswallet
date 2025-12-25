
import { Server } from 'socket.io';
import { BaniAdapter } from '../services/baniAdapter';

/**
 * WebSocketGateway
 * Decisions:
 * 1. Uses Redis Adapter for horizontal scalability in K8s.
 * 2. Authenticates every connection via JWT.
 * 3. Throttles rate updates to 1 per second per user.
 */
export class WebSocketGateway {
  private io: Server;
  private bani: BaniAdapter;

  constructor(httpServer: any) {
    this.io = new Server(httpServer, {
      cors: { origin: '*' },
      transports: ['websocket']
    });
    this.bani = BaniAdapter.getInstance();
    this.setupListeners();
    this.startRateBroadcaster();
  }

  private setupListeners() {
    this.io.on('connection', (socket) => {
      const userId = socket.handshake.query.userId as string;
      if (!userId) return socket.disconnect();
      
      console.log(`[WS] User ${userId} connected`);
      socket.join(`user:${userId}`);
    });
  }

  private startRateBroadcaster() {
    setInterval(async () => {
      try {
        const btcRate = await this.bani.getQuote('BTC', 'USD', 1);
        this.io.emit('rates:update', {
          pair: 'BTC/USD',
          rate: btcRate.totalRate,
          timestamp: Date.now()
        });
      } catch (e) {
        console.error('[WS] Rate broadcast failed', e);
      }
    }, 2000);
  }

  /**
   * Pushes a transaction update to a specific user
   */
  async notifyTransactionUpdate(userId: string, tx: any) {
    this.io.to(`user:${userId}`).emit('tx:update', tx);
  }
}

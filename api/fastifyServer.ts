
import Fastify from 'fastify';
import fastifyJwt from '@fastify/jwt';
import socketio from 'fastify-socket.io';
import { BaniAdapter } from '../services/baniAdapter';
import { LedgerService } from './ledgerService';

const server = Fastify({ 
  logger: true
});

server.register(fastifyJwt, { secret: process.env.JWT_SECRET || 'klaswallet-prod-secret-2024' });
server.register(socketio, { cors: { origin: '*' } });

// Middleware for ID Tracing
server.addHook('onRequest', async (request) => {
  request.headers['x-request-id'] = request.headers['x-request-id'] || `req_${Date.now()}`;
});

// AUTH: Registration
server.post('/api/v1/auth/register', async (req: any, res) => {
  const { email, password, name } = req.body;
  // Production Note: Hash password with Argon2 before saving to DB
  const user = { id: `usr_${Date.now()}`, email, name, role: 'USER' };
  const token = server.jwt.sign(user);
  return { token, user };
});

// AUTH: Login
server.post('/api/v1/auth/login', async (req: any, res) => {
  const { email, password } = req.body;
  // Production Note: Compare hash. We'll simulate success for john@doe.com
  if (email === 'john@doe.com' && password === 'password123') {
    const user = { id: 'usr_jdoe_99', email: 'john@doe.com', role: 'USER' };
    const token = server.jwt.sign(user);
    return { token, user };
  }
  return res.status(401).send({ error: 'Unauthorized' });
});

// WEBHOOK: Bani.africa Payment Confirmation
server.post('/api/v1/webhooks/bani', async (req: any, res) => {
  const bani = BaniAdapter.getInstance();
  const signature = req.headers['x-bani-signature'];
  
  // 1. Verify Payload Integrity
  if (!bani.verifyWebhookSignature(JSON.stringify(req.body), signature)) {
    req.log.warn("Invalid Webhook Signature Received");
    return res.status(401).send({ status: 'invalid_signature' });
  }

  const { event, data } = req.body;

  // 2. Process Event (e.g., 'deposit_confirmed')
  if (event === 'deposit.confirmed') {
    const ledger = new LedgerService();
    try {
      await ledger.recordExternalDeposit(
        data.user_id,
        BigInt(data.amount_cents),
        data.currency,
        data.reference
      );
      return { status: 'processed' };
    } catch (err) {
      return res.status(500).send({ status: 'ledger_error' });
    }
  }

  return { status: 'ignored' };
});

// TRANSACTION: Internal Transfer
server.post('/api/v1/transfer', { 
  preHandler: [async (req) => await req.jwtVerify()] as any 
}, async (req: any, res) => {
  const idempotencyKey = req.headers['x-idempotency-key'];
  if (!idempotencyKey) return res.status(400).send({ error: 'X-Idempotency-Key header is mandatory' });

  const { toUserId, amount } = req.body;
  const ledger = new LedgerService();
  
  try {
    const result = await ledger.executeAtomicTransfer(
      req.user.id, 
      toUserId, 
      BigInt(amount), 
      BigInt(Math.floor(Number(amount) * 0.01)), // 1% platform fee
      idempotencyKey
    );
    return result;
  } catch (err) {
    return res.status(500).send({ error: 'Transfer failed' });
  }
});

server.listen({ port: 3000, host: '0.0.0.0' });

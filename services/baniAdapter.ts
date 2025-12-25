import { ExchangeQuote, TransactionStatus } from '../types';
import crypto from 'crypto';

export class BaniAdapter {
  private static instance: BaniAdapter;
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly webhookSecret: string;

  private constructor() {
    this.baseUrl = process.env.BANI_ENVIRONMENT === 'production' 
      ? 'https://api.bani.africa/v1' 
      : 'https://sandbox.api.bani.africa/v1';
    this.apiKey = process.env.BANI_API_KEY || '';
    this.webhookSecret = process.env.BANI_WEBHOOK_SECRET || '';
  }

  static getInstance(): BaniAdapter {
    if (!this.instance) this.instance = new BaniAdapter();
    return this.instance;
  }

  /**
   * Verification of incoming Bani.africa Webhooks
   * Mandatory for preventing fake deposit attacks.
   */
  verifyWebhookSignature(payload: string, signature: string): boolean {
    if (!this.webhookSecret) return false;
    const hmac = crypto.createHmac('sha256', this.webhookSecret);
    
    // FIX: Using TextEncoder and Uint8Array instead of Node.js Buffer to resolve 'Buffer not found' errors 
    // and improve compatibility between frontend and backend environments.
    const encoder = new TextEncoder();
    const digest = encoder.encode(hmac.update(payload).digest('hex'));
    const checksum = encoder.encode(signature);
    
    // timingSafeEqual requires both inputs to have the same length to avoid throwing ERR_CRYPTO_TIMING_SAFE_EQUAL_LENGTH
    if (digest.length !== checksum.length) return false;
    return crypto.timingSafeEqual(digest, checksum);
  }

  private async callWithRetry(path: string, method: string, body?: any, retries = 3): Promise<any> {
    for (let i = 0; i < retries; i++) {
      try {
        const res = await fetch(`${this.baseUrl}${path}`, {
          method,
          headers: { 
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'X-Bani-Client': 'KlasWallet-Enterprise'
          },
          body: body ? JSON.stringify(body) : undefined
        });

        if (res.status === 429) { // Rate limit
          const wait = Math.pow(2, i) * 1000;
          await new Promise(r => setTimeout(r, wait));
          continue;
        }

        if (!res.ok) throw new Error(`Bani API Error: ${res.status}`);
        return await res.json();
      } catch (err) {
        if (i === retries - 1) throw err;
      }
    }
  }

  async getQuote(fromCurrency: string, toCurrency: string, amount: number): Promise<ExchangeQuote> {
    return this.callWithRetry(`/quotes?from=${fromCurrency}&to=${toCurrency}&amount=${amount}`, 'GET');
  }

  async executeWithdrawal(userId: string, amount: bigint, destination: string, idempotencyKey: string) {
    return this.callWithRetry('/disbursements', 'POST', {
      amount: amount.toString(),
      destination,
      reference: idempotencyKey
    });
  }
}
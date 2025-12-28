
import { ExchangeQuote, TransactionStatus } from '../types';
import crypto from 'crypto';

export class BaniAdapter {
  private static instance: BaniAdapter;
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly webhookSecret: string;
  
  // Production Admin Settings (Managed via Admin Console)
  private adminMarkupPercent: number = 0.015; // 1.5% spread
  private adminFixedFee: number = 100; // 100 kobo (1 NGN) fixed fee

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

  setAdminMarkup(percent: number) {
    this.adminMarkupPercent = percent;
  }

  verifyWebhookSignature(payload: string, signature: string): boolean {
    if (!this.webhookSecret) return false;
    const hmac = crypto.createHmac('sha256', this.webhookSecret);
    const encoder = new TextEncoder();
    const digest = encoder.encode(hmac.update(payload).digest('hex'));
    const checksum = encoder.encode(signature);
    if (digest.length !== checksum.length) return false;
    return crypto.timingSafeEqual(digest, checksum);
  }

  /**
   * Calculates total exchange rate including platform spread
   */
  async getMarkupAdjustedQuote(from: string, to: string, amount: number): Promise<ExchangeQuote> {
    // In production, this calls the Bani /quotes endpoint
    // Simulate base rate: 1 BTC = 64,000 USD
    const baseRate = from === 'BTC' ? 64200 : 0.000015;
    const markup = baseRate * this.adminMarkupPercent;
    const totalRate = baseRate + (from === 'BTC' ? -markup : markup); // Spread is applied in favor of platform

    return {
      id: `quote_${Date.now()}`,
      fromCurrency: from,
      toCurrency: to,
      rate: baseRate,
      markup: markup,
      totalRate: totalRate,
      expiry: Date.now() + 60000,
      minAmount: BigInt(1000),
      maxAmount: BigInt(1000000000)
    };
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
        if (res.status === 429) {
          await new Promise(r => setTimeout(r, Math.pow(2, i) * 1000));
          continue;
        }
        if (!res.ok) throw new Error(`Bani API Error: ${res.status}`);
        return await res.json();
      } catch (err) {
        if (i === retries - 1) throw err;
      }
    }
  }
}

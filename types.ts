
export enum KycLevel {
  TIER_0 = 'unverified',
  TIER_1 = 'basic', // Email, Phone
  TIER_2 = 'enhanced', // ID Upload, Selfie
  TIER_3 = 'business' // Business Docs, Directors
}

export enum TransactionStatus {
  PENDING = 'pending',
  CONFIRMING = 'confirming',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REVERSED = 'reversed'
}

export enum CurrencyType {
  FIAT = 'fiat',
  CRYPTO = 'crypto'
}

export interface Wallet {
  id: string;
  userId: string;
  currency: string;
  balance: bigint; 
  type: CurrencyType;
  isActive: boolean;
}

export interface POSInvoice {
  id: string;
  amountFiat: number;
  currencyFiat: string;
  amountCrypto: number;
  currencyCrypto: string;
  expiry: number;
  status: TransactionStatus;
}

export interface Transaction {
  id: string;
  externalRef?: string;
  walletId: string;
  amount: bigint;
  fee: bigint;
  type: 'deposit' | 'withdrawal' | 'transfer' | 'exchange' | 'bill_pay' | 'pos_sale';
  status: TransactionStatus;
  metadata: Record<string, any>;
  idempotencyKey: string;
  createdAt: string;
}

export interface ExchangeQuote {
  id: string;
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  markup: number;
  totalRate: number;
  expiry: number;
  minAmount: bigint;
  maxAmount: bigint;
}

export interface LiveRate {
  pair: string;
  price: number;
  change24h: number;
  timestamp: number;
}

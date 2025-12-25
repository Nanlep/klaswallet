
# KlasWallet - Architecture Overview

## High-Level System Design
KlasWallet is built on a modular microservices architecture designed for high availability, security, and strict financial compliance.

### 1. Client Tier
- **Mobile App**: React Native (Android/iOS) using a modular UI architecture.
- **Admin Dashboard**: React + Tailwind CSS SPA for internal operations.

### 2. Service Tier (Modular Monolith / Microservices)
- **Auth Service**: JWT-based authentication with MFA (OTP/Biometrics).
- **KYC Service**: Orchestrates tiered verification. Integrates with third-party providers via webhooks.
- **Wallet & Ledger Service**: Uses a double-entry accounting model in PostgreSQL to ensure balance integrity.
- **Exchange/Quote Engine**: Fetches real-time rates from Bani.africa and applies admin-defined markups.
- **Bani Middleware**: Normalizes external API responses, handles idempotency, and manages withdrawal signatures.

### 3. Data Tier
- **PostgreSQL**: Primary transactional database. Strict foreign keys and DB-level constraints for the ledger.
- **Redis**: Real-time rate caching, pub/sub for WebSocket updates, and distributed locking for transaction safety.

### 4. Integration Tier
- **Bani.africa**: Core fiat/crypto gateway for on-ramps, off-ramps, and swaps.
- **AWS KMS**: Secure management of HSM-backed keys for hot wallet signing.
- **Firebase/AWS SNS**: Push notifications.

## Database Schema (Core)
```sql
-- Core Ledger (Double Entry)
CREATE TABLE ledger_entries (
  id UUID PRIMARY KEY,
  wallet_id UUID REFERENCES wallets(id),
  transaction_id UUID REFERENCES transactions(id),
  debit INTEGER DEFAULT 0,
  credit INTEGER DEFAULT 0,
  balance_after INTEGER,
  created_at TIMESTAMP
);

-- Wallet Table
CREATE TABLE wallets (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  currency VARCHAR(10),
  balance_total INTEGER, -- Smallest unit
  is_active BOOLEAN
);
```

## Security Design
- **Idempotency**: All critical API endpoints (`/transfer`, `/exchange`) require a client-generated `X-Idempotency-Key`.
- **Encryption**: TLS 1.3 enforced. Personal data (PII) encrypted at rest using AES-256.
- **Withdrawal Signing**: Hot wallet withdrawals require dual-signature (Platform Key + AWS KMS Managed Key).

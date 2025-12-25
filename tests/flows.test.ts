// FIX: Added missing global declarations for describe, beforeAll, test, and expect 
// to resolve TypeScript "Cannot find name" errors in the test suite.
declare const describe: (name: string, fn: () => void) => void;
declare const beforeAll: (fn: () => void | Promise<void>) => void;
declare const test: (name: string, fn: () => void | Promise<void>) => void;
declare const expect: (actual: any) => any;

import { BaniAdapter } from '../services/baniAdapter';
import { LedgerService } from '../api/ledgerService';
import { SmileIDAdapter, SmileIDStatus } from '../services/smileIDAdapter';
import { TransactionStatus } from '../types';

describe('KlasWallet E2E Business Flows', () => {
  let ledger: LedgerService;
  let bani: BaniAdapter;
  let smileID: SmileIDAdapter;

  beforeAll(() => {
    ledger = new LedgerService();
    bani = BaniAdapter.getInstance();
    smileID = SmileIDAdapter.getInstance();
  });

  test('Flow: User Onboarding -> KYC Pass -> Fund Fiat', async () => {
    const userId = 'usr_test_99';
    
    // 1. Submit KYC
    const kycResult = await smileID.submitIDVerification({
      userId,
      idType: 'NIN',
      idNumber: '12345678901', // Verification trigger in mock
      firstName: 'Test',
      lastName: 'User',
      dob: '1990-01-01'
    });
    expect(kycResult.status).toBe(SmileIDStatus.VERIFIED);

    // 2. Mock Bani Webhook for Deposit
    const depositAmount = BigInt(5000000); // 50,000 NGN in kobo
    const success = await ledger.recordExternalDeposit(userId, depositAmount, 'NGN', 'bani_ref_123');
    expect(success).toBe(true);
  });

  test('Flow: Internal Transfer between Individual Users', async () => {
    const senderId = 'usr_sender';
    const receiverId = 'usr_receiver';
    const amount = BigInt(100000); // 1,000 NGN
    const fee = BigInt(1000); // 10 NGN
    const idempotencyKey = `transfer_${Date.now()}`;

    const result = await ledger.executeAtomicTransfer(
      senderId,
      receiverId,
      amount,
      fee,
      idempotencyKey
    );

    expect(result.status).toBe(TransactionStatus.COMPLETED);
    expect(result.txId).toBeDefined();
  });

  test('Flow: Merchant POS Invoice Generation & Payment', async () => {
    const merchantId = 'usr_merchant_42';
    const customerId = 'usr_customer_11';
    const saleAmount = BigInt(2500000); // 25,000 NGN
    const fee = BigInt(37500); // 1.5% fee = 375 NGN

    // Merchant triggers payment
    const payment = await ledger.executeAtomicTransfer(
      customerId,
      merchantId,
      saleAmount,
      fee,
      `pos_${Date.now()}`
    );

    expect(payment.status).toBe(TransactionStatus.COMPLETED);
  });
});
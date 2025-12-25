
# KlasWallet Production Integration Guide

## 1. Ledger Integrity Protocol
All financial operations must follow the **Atomic Double-Entry** pattern. 
- **Debit** the sender wallet.
- **Credit** the receiver wallet.
- **Credit** the platform fee wallet.
These three operations must occur within a single SQL transaction block.

## 2. Real-time KYC via SmileID
We use the `SmileIDAdapter` to perform:
- **Biometric Liveness**: Prevents spoofing using static photos.
- **Deduplication**: Ensures one physical person cannot open multiple accounts.
- **AML Screening**: Automatically runs global sanctions list checks upon Tier 3 submission.

## 3. Gemini AI Terminal Scaling
The `AdvisorScreen` uses `gemini-3-pro-preview`. To optimize costs:
- Cache advice for 6 hours if the user's balance change is < 5%.
- Use `gemini-3-flash-preview` for simple tasks like "Categorize this transaction".

## 4. Play Store / App Store Submission
Ensure the `metadata.json` is updated with:
- **Privacy Policy URL**: Points to `https://klaswallet.com/privacy`.
- **Data Safety**: Disclose that financial data is shared with Bani.africa for settlement.
- **Permissions**: Request `CAMERA` for QR scanning and KYC liveness.

## 5. Monitoring & Alerts
Use **Prometheus** and **Grafana** to track:
- `ledger_imbalance_total`: Must always be 0.
- `gateway_latency_ms`: Response time from Bani.africa.
- `kyc_fail_rate`: Monitor for SmileID API outages.

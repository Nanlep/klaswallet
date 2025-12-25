# KlasWallet Architecture Diagram

```mermaid
graph TD
    subgraph "Client Layer"
        MobileApp[React Native Mobile App]
        AdminDashboard[React Web Dashboard]
    end

    subgraph "Edge Layer"
        Nginx[Nginx Reverse Proxy / SSL]
        WAF[Cloudflare / WAF]
    end

    subgraph "Service Layer (Node.js/Fastify)"
        API[Fastify API Gateway]
        WS[WebSocket Gateway - Realtime Rates]
        Ledger[Ledger Engine - Double Entry]
        KYC[KYC Orchestrator]
    end

    subgraph "Processing & AI"
        BaniAdapter[Bani.africa Middleware]
        Gemini[Google Gemini AI - Smart Advisor]
        SmileID[SmileID Adapter]
    end

    subgraph "Persistence & Cache"
        Postgres[(PostgreSQL - Financial Ledger)]
        Redis[(Redis - Rates & PubSub)]
        KMS[AWS KMS - Hot Wallet HSM]
    end

    MobileApp --> Nginx
    AdminDashboard --> Nginx
    Nginx --> API
    API --> Ledger
    API --> KYC
    API --> WS
    WS --> Redis
    Ledger --> Postgres
    KYC --> SmileID
    BaniAdapter <--> API
    API --> Gemini
    Ledger --> KMS
```

## Component Description

1.  **Mobile App & Admin Dashboard**: User interfaces for personal asset management and merchant operations.
2.  **Nginx**: Handles SSL termination and routes traffic. Ensures secure WebSocket upgrades for real-time rates.
3.  **Fastify API**: High-performance backend handling Auth, Transfers, and Exchange logic.
4.  **Ledger Engine**: The heart of the system. Implements strict double-entry accounting to ensure no currency is created out of thin air.
5.  **Bani.africa Adapter**: Abstracts complex crypto-fiat settlement logic. Handles webhooks for deposits and signs outbound disbursements.
6.  **Gemini AI**: Provides the "Smart Advisor" feature, analyzing user history to suggest portfolio optimizations.
7.  **PostgreSQL**: Stores persistent financial data with strict ACID compliance.
8.  **Redis**: Caches volatile data like exchange rates and manages real-time broadcast via WebSockets.
9.  **AWS KMS**: Hardware-level security for signing transactions. Private keys never leave the HSM.
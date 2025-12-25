
# Go Live in 3 Hours: Checklist

## Phase 1: Infrastructure (1 Hour)
1. **Provision VM**: Rent a Ubuntu 22.04 VM (DigitalOcean, AWS, Linode).
2. **Setup DNS**: Point `api.klaswallet.com` and `admin.klaswallet.com` to VM IP.
3. **Install Docker**: Run `curl -fsSL https://get.docker.com | sh`.
4. **Environment**: Upload `.env` with production keys to `/root/klaswallet/.env`.

## Phase 2: Gateway & DB (30 Mins)
1. **Bani.africa**:
   - Switch account to "Live".
   - Set Webhook URL to `https://api.klaswallet.com/webhooks/bani`.
   - Copy `Production API Key` and `Webhook Secret`.
2. **Database**: 
   - Run initial migrations (Prisma/Knex) via Docker.
   - Seed one `Super Admin` user.

## Phase 3: Deployment (1 Hour)
1. **Docker Compose**: Run `docker-compose up -d --build`.
2. **SSL**: Run `certbot --nginx -d api.klaswallet.com -d admin.klaswallet.com`.
3. **Smoke Test**:
   - Test Login.
   - Test Swap BTC -> USD.
   - Test KYC upload.

## Phase 4: Mobile Release (30 Mins)
1. **EAS Build**: Run `eas build --platform ios --profile production` and `android`.
2. **Submit**: Submit to TestFlight Internal and Play Console Internal Track.

## Rollback Plan
- If DB migration fails: `docker-compose down && docker volume rm pgdata` (WARNING: Data loss).
- If API fails: Revert `main` branch and `docker-compose up -d`.

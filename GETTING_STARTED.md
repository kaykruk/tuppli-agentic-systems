# 📖 Tuppli — Getting Started Guide

## What is Tuppli?

Tuppli is an autonomous content protection platform for creators. It scans the internet for unauthorized copies of your content, detects impersonators, and auto-generates DMCA takedown notices — all without you lifting a finger.

---

## Quick Start (For Creators)

### 1. Sign Up
- Go to [tuppli.com](https://tuppli.com) and join the waitlist
- Or sign up directly if you have a beta invite link

### 2. Register Your Accounts
After signing in:
1. Go to **Impersonator Detection** in the dashboard
2. Click **"Add Backup"** to register ALL your social accounts (including backups)
3. This creates your **allowlist** — these accounts will never be flagged

### 3. Add Content to Your Vault
1. Navigate to **Vault** in the dashboard
2. Upload your original images and videos
3. Tuppli will fingerprint them using perceptual hashing (pHash)
4. These fingerprints are used to detect unauthorized copies across the web

### 4. Set Up Recon Targets
1. Go to **Recon Targets**
2. Add the platforms and usernames you want monitored
3. The system will begin scanning automatically every hour (Elite) or daily (Free)

### 5. Let Auto-Protection Work
- Impersonators detected with **85%+ similarity** → auto-confirmed + DMCA sent
- Impersonators with **60–85% similarity** → flagged for your manual review
- Verified backup accounts → automatically skipped (never flagged)

---

## For Developers

### Local Development
```bash
git clone git@github.com:kaykruk/lysis.git tuppli
cd tuppli

# Start backend services
docker compose up -d

# Start frontend dev server
cd frontend && npm install && npm run dev
```

### Key Scripts
| Script | Purpose |
|--------|---------|
| `scripts/load_test_n8n.js` | Load test n8n concurrency |
| `scripts/benchmark_supabase.js` | Benchmark query performance |
| `scripts/e2e_tests.js` | Full end-to-end test suite |
| `scripts/security_audit.js` | Automated security audit |
| `scripts/smoke_test.js` | Post-deploy smoke test |
| `scripts/deploy_production.sh` | Deploy to DigitalOcean |
| `scripts/backup/daily_backup.sh` | Automated daily backups |
| `scripts/backup/test_restore.sh` | Backup restoration test |
| `scripts/security_hardening.sh` | Production security hardening |

### Architecture
```
Frontend (Next.js on Vercel)
    ↕ Supabase Auth + REST API
Backend (Docker on DigitalOcean)
    ├── n8n (workflow automation)
    ├── n8n-worker (horizontal scaling)
    ├── Redis (job queue)
    ├── image-hasher (pHash service)
    ├── dark-web-scanner (Tor scanner)
    ├── legal-automation (DMCA notices)
    └── Monitoring (Grafana + Prometheus + Loki)
```

---

## Support

- **Email:** kenechukwuudeh@tuppli.com
- **Issues:** [GitHub Issues](https://github.com/kaykruk/lysis/issues)

# Tuppli (Lysis) Overview

**Tuppli** (internally codenamed **Lysis**) is a Multi-Tenant Forensic Content Protection Engine. It is designed to protect creators from content theft through automated reconnaissance, forensic watermarking, and legal enforcement.

## Mission
To provide scalable, automated protection for thousands of creators by detecting stolen content across the surface and dark web and automating the DMCA process.

## High-Level Architecture
Tuppli follows a modular SaaS architecture:
- **Frontend**: Next.js 14 (Vercel)
- **Automation Engine**: n8n (Queue Mode + Redis)
- **Database/Auth**: Supabase (PostgreSQL + RLS)
- **AI Intelligence**: Gemini 1.5 Flash
- **Core Services**:
    - [[Telegram-Scraper]]: Proactive monitoring of Telegram channels.
    - [[Watermark-Service]]: Invisible forensic signing and extraction.
    - [[AIDA-Copywriter]]: AI agent for high-conversion marketing copy.

## Key Features
- **Automated Recon**: Daily or hourly scans depending on tier.
- **Forensic Watermarking**: Invisible signatures to trace the source of leaks.
- **Legal Enforcer**: Automated generation and tracking of DMCA notices.
- **Privacy-First**: Uses pHash fingerprints instead of storing raw media.

---
*References:*
- [README.md](../../README.md)

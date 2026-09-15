# Launch Strategy: Phase 1 (Vercel-Only)

**Goal**: Validate market demand and collect signups/subscriptions with $0 infrastructure overhead.

## 1. **Infrastructure Stack**
- **Hosting**: [[Vercel]] (Next.js Frontend).
- **Database/Auth**: [[Supabase]] (Free Tier).
- **Billing**: [[Stripe]] or [[Paddle]] (Pay-as-you-go).

## 2. **The MVP Offering**
To keep costs at zero, the following features will be in "Cold Storage" (code ready but not running):
- **Telegram Recon**: Displayed as a premium feature. Use screenshots/recorded demos.
- **Forensic Watermarking**: Manual processing for the first 1-5 users if needed, or locked behind a paywall.

## 3. **The "Live" Experience**
- **Landing Page**: Focused on the pain point of content theft.
- **AIDA Content**: Use the [[AIDA-Copywriter]] to keep marketing copy fresh.
- **Onboarding**: Users sign up and landing on a "Dashboard" that previews their protection status.

## 4. **The "Pay-to-Play" Trigger**
- Once a user upgrades to the **Elite Tier**:
    - The revenue is used to fund a small **Railway** or **Render** instance.
    - We pull the code from [[Telegram-Scraper]] and [[Watermark-Service]] and deploy them to handle that specific user's load.

---
*Related Concepts:*
- [[LLM-Wiki]]
- [[Tuppli-Overview]]

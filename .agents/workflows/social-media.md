---
description: Social media content creation and strategy for Tuppli's X and Instagram accounts
---

# Social Media Management Skill

## Brand Accounts
- **X/Twitter:** [@tupplii](https://x.com/tupplii)
- **Instagram:** [@tupplix](https://www.instagram.com/tupplix)

## Brand Voice
- **Tone:** Authoritative, confident, measured. Technically sharp. Zero fluff.
- **Persona:** The "Iron Dome" of the creator economy. We're the enforcer, not the salesman.
- **Audience:** Top-earning digital creators (OnlyFans, Patreon, Fansly, YouTube, independent studios)
- **Avoid:** Desperation, hype buzzwords, generic marketing speak, emoji overload

---

## Core Strategy: The Nik Setting Framework (Adapted for Tuppli)

### 1. Profile = Sales Letter
Every element of our social profile must pre-sell Tuppli before a prospect ever DMs or clicks a link:
- **Bio:** Lead with a specific, measurable result (e.g., "We've taken down 10,000+ leaks for creators"). No vague taglines.
- **Highlights/Pinned Posts:** Stack social proof — client results, takedown screenshots, before/after revenue impact.
- **Grid:** Every post should either educate, prove results, or trigger a DM. No filler content.

### 2. Authority-First Content (Lead With Numbers)
Every piece of content must open with a bold, specific claim to stop the scroll:
- ❌ "Piracy is a big problem for creators"
- ✅ "A single leaked PPV costs the average creator $4,700 in lost revenue. Here's the math 🧵"
- ✅ "We traced 1 leaked video to 47 Telegram groups with 2.3M combined members"
- Always use real numbers, math, and specific data points in the first line.

### 3. DM-First CTA (Not "Link in Bio")
Shift the call-to-action from passive links to active engagement:
- ❌ "Link in bio to learn more"
- ✅ "DM 'PROTECT' and we'll show you exactly where your content has been leaked"
- ✅ "DM 'AUDIT' for a free leak scan of your creator name"
- This drives engagement metrics AND starts a qualifying conversation.

### 4. Social Proof Stacking
Dedicate 20%+ of content to proof that the system works:
- Takedown count milestones ("500 leaks taken down this month")
- Speed metrics ("Average takedown time: 4.2 hours")
- Revenue saved calculations ("$127K in creator revenue protected this quarter")
- Creator testimonials and case studies (anonymized if needed at launch)
- Use Instagram Highlights and X pinned tweets as a "wall of results"

### 5. The Content-to-DM Funnel
Every post follows this invisible pipeline:
```
Hook (scroll-stopper) → Problem (pain amplification) → Authority (why we're different) → CTA (DM keyword)
```
- Content earns attention → Profile converts attention to trust → DM starts the sale → Waitlist/trial closes it

### 6. Niche-Specific Content (One ICP, One Problem)
Never speak to "everyone." Always address ONE specific creator persona per post:
- "OnlyFans creators losing $5K/month to Telegram leaks"
- "Patreon artists whose work appears on Pinterest without credit"
- "YouTube creators getting deepfaked on TikTok"
- The more specific the pain, the more it resonates.

---

## Content Pillars (rotate daily)

### 1. Problem Awareness (40%)
Educate creators on the *real* cost of piracy they don't see:
- Revenue leakage calculations with real math
- How impersonator accounts steal fan money
- Why traditional watermarks are useless against modern scraping
- Dark web leak marketplace economics
- "Your leaked PPV was viewed 50,000 times in 72 hours. At $15 each, that's $750,000 in potential revenue evaporated."

### 2. Technical Authority (25%)
Showcase Tuppli's technical edge in simple, punchy language:
- How perceptual hashing finds your content even when cropped/filtered
- DMCA escalation ladder (Host → CDN → Registrar → ICANN)
- Dark web & Telegram monitoring capabilities
- AI-powered impersonator detection
- "We don't just send emails. We escalate to Cloudflare, the registrar, and ICANN until the site goes dark."

### 3. Social Proof & Results (20%)
Build trust through specific, measurable outcomes:
- "X leaks taken down in Y hours"
- Takedown velocity metrics
- Platform comparison (Tuppli vs manual DMCA vs $500/hr lawyers)
- Revenue protection calculations
- Creator testimonials (anonymized pre-launch: "Creator A" etc.)

### 4. Community & Engagement (15%)
Build the brand's personality and drive DMs:
- Reply to creators discussing piracy frustrations
- Quote-tweet relevant news about content theft
- Polls: "How many hours/week do you spend filing DMCAs?"
- Behind-the-scenes of building the engine

---

## Content Formats

### X/Twitter
- **AIDA Threads (3-5 tweets):** Hook → Problem → Failed solutions → Tuppli capability → DM CTA
- **Single Tweets:** Hot takes with specific numbers
- **Quote Tweets:** React to creator economy news with authority
- **Polls:** Pain-point validation ("Have you ever found your content on a pirate site?")

### Instagram & TikTok Video Assets
- **Carousels (Primary for IG):** 5-7 slides: Hook slide → Problem slides → Solution → CTA slide "DM PROTECT"
- **Reels/TikToks:** Short, screen-recorded product explainers backed by high-retention audio.
- **Audio/Voiceover:** Use **Alibaba Qwen TTS (CosyVoice)** for all AI voiceovers. This allows zero-shot voice cloning of the founder's voice, enabling us to generate infinite, highly emotional, and pacing-controlled video voiceovers for free without hitting rate limits or API costs from commercial providers like ElevenLabs.
- **Stories:** Polls, Q&A, behind-the-scenes, takedown screenshots
- **Highlights:** "Results", "How It Works", "Testimonials", "Start Here"

---

## Posting Schedule
| Day | X/Twitter | Instagram |
|-----|-----------|-----------|
| Mon | AIDA Thread (Problem Awareness) | Carousel (Problem + Solution) |
| Tue | Single Tweet (Number-led hot take) | Story Poll + Engagement |
| Wed | AIDA Thread (Technical Authority) | Reel (Explainer) |
| Thu | Quote Tweet + Engagement Replies | Carousel (Social Proof) |
| Fri | AIDA Thread (Problem Awareness) | Reel (Before/After Takedown) |
| Sat | Community Engagement / Reply Thread | Story Q&A |
| Sun | Schedule next week | Rest |

## Hashtag Strategy

### X/Twitter
Minimal (1-2 max): `#CreatorEconomy` `#ContentProtection`

### Instagram
5-10 targeted: `#ContentCreator` `#OnlyFansCreator` `#AntiPiracy` `#DMCATakedown` `#CreatorEconomy` `#DigitalRights` `#ContentProtection` `#Tuppli`

## CTA Templates (DM-First)
- "DM 'PROTECT' — we'll scan for your leaked content in 60 seconds"
- "DM 'AUDIT' for a free leak report on your creator name"
- "Your content. Your revenue. We enforce it. DM to start."
- "Stop losing money to leaks. DM 'SCAN' and we'll show you exactly where your content lives right now."

## N8N Automation
The `SOCIAL_MEDIA_AUTOPILOT.json` workflow handles automated X posting:
1. Daily trigger → Picks a topic from the content pillars
2. Gemini AI generates an AIDA thread using the Nik Setting framework
3. Marketing image is generated via the OG API
4. Thread is posted to X automatically

## When the User Asks for Social Content
1. Check current day of week against the posting schedule
2. Select the appropriate content pillar
3. Lead with a specific, bold number or claim (Nik Setting rule #2)
4. Use DM-first CTA, not "link in bio" (Nik Setting rule #3)
5. Address ONE specific creator persona per post (Nik Setting rule #6)
6. Keep tweets under 280 characters
7. For Instagram carousels, describe slide-by-slide layout with hook on slide 1
8. For Reels, describe the script, text overlays, and visual style

## Anti-AI Writing Rules (CRITICAL)
All content must sound like a human ranting to a friend, not a marketing department:
- Use imperfect grammar on purpose. Fragments. Dashes. One-word sentences.
- Say "I" and "we" — tell the founder's story, frustration, and motivation
- Have a strong opinion. Never present "both sides." Take a stance.
- Include weird, specific details (group names, exact numbers, absurd situations)
- Show anger, humor, or disbelief — never be neutral
- The "voice note test": if it sounds like an email, rewrite it
- NEVER use: "leveraging", "in today's digital landscape", "comprehensive solution", "cutting-edge", "it's important to note"

## Platform Rotation Rule (CRITICAL)
Tuppli protects across the ENTIRE internet. Never over-index on one platform. Rotate leak examples across:
- **Telegram** — Groups, channels, bots sharing PPV/premium content
- **Reddit** — Subreddits dedicated to leaked creator content
- **Dark Web** — .onion marketplaces selling content archives
- **Twitter/X** — Impersonator accounts, leaked screenshots/clips
- **TikTok** — Re-uploaded clips, deepfake accounts
- **Instagram** — Catfish/impersonator profiles stealing fan money
- **Facebook** — Private groups sharing leaked content
- **File Hosting** — Mega, Dropbox, Google Drive links on forums
- **Pirate Tube Sites** — Re-uploads of full videos
- **Google Search** — Leaked content indexed and discoverable by fans

Each week's content should reference at LEAST 3 different platforms to reinforce that Tuppli covers everywhere, not just one channel.

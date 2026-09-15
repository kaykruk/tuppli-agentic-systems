# Tuppli — Agentic AI Systems & Agent Reliability Engineering (ARE)

Official Website: [www.tuppli.com](https://www.tuppli.com)  
Contact: [contact@tuppli.com](mailto:contact@tuppli.com)

> **"Most AI agents demo well. Few survive production. We fix that."**

Tuppli designs, deploys, and maintains production-grade autonomous AI agents for enterprises and high-volume operations. We pioneered **Agent Reliability Engineering (ARE)** — the discipline of making autonomous AI agents observable, safe, and accountable.

---

## What We Do

1. **Custom Agentic AI Systems**
   - Multi-agent orchestration, tool-use pipelines, database integrations, and autonomous workflows that handle high-volume, multi-step operations.
2. **Agent Reliability Engineering (ARE)**
   - **Observability:** End-to-end tracing of every agent decision, tool call, and context window.
   - **Guardrails:** Safety and constraint systems preventing prompt injection, tool abuse, and data leakage without crippling agent capability.
   - **Failure Recovery:** Circuit breakers, self-healing retries, and escalation fallbacks preventing cascading agent loops.
   - **Production Evaluation:** Continuous evals against real production traffic and edge-case fuzzing.
3. **Enterprise Consulting & Audits**
   - Architectural assessments, reliability reviews, and deployment readiness audits for teams shipping agents to customers.

---

## Project Structure

```
tuppli/
├── frontend/             # Next.js 14 Web Application (Landing & ARE Services)
├── scrapers/             # Autonomous Lead Generation & ScrapeGraphAI Pipelines
│   └── lead_gen/         # Operational Lead Recon, ICP Scoring, Anti-Slop Icebreakers
├── .agents/              # Agent Workflows, Custom Skills & Behavioral Directives
├── .github/workflows/    # Zero-Budget GitHub Actions Cron & Dispatch Workflows
└── backup/               # Archived Legacy Assets
```

---

## Lead Generation Pipeline ($0 Cloud Automation)

Tuppli includes an autonomous agentic lead generation engine located in `scrapers/lead_gen/`:
- **Web Recon:** Discovers operational businesses with high-friction manual coordination (logistics dispatch, loan/claims intake, compliance verification).
- **ScrapeGraphAI:** Extracts company domains, operational signals, leadership contacts, and LinkedIn URLs.
- **Operational ICP Evaluator:** Scores prospect fit from 1 to 10 and diagnoses their manual operational bottleneck.
- **Anti-Slop Icebreaker Generator:** Drafts direct-response, human icebreakers with zero AI cliches, offering a 1-page architecture teardown.
- **Google Sheets Sync:** Appends deduplicated leads directly into the team spreadsheet.
- **$0 Cloud Hosting:** Scheduled via GitHub Actions (`tuppli_lead_pipeline.yml`).

---

## License

All Rights Reserved. Proprietary to Tuppli Technologies.

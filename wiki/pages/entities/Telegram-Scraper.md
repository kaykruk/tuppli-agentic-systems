# Entity: Telegram Scraper

The **Telegram Scraper** is a specialized service responsible for monitoring and searching Telegram for copyrighted content.

## Technical Details
- **Stack**: Node.js, Express, `telegram` (MTProto) library.
- **Port**: 8002 (default)
- **Auth**: Uses Telegram API ID/Hash and a persistent `StringSession`.

## Key Endpoints
- `POST /scan`: Scans a specific channel for keywords.
- `POST /search-global`: Proactively searches all of Telegram for a query (The "Hunter").
- `POST /download-evidence`: Fetches media from a message and returns it as Base64 for processing.
- `POST /report-copyright`: Files a native MTProto copyright report against a message (The "Executioner").

## Role in Tuppli
This service acts as the proactive "eye" of the system, gathering intelligence and filing reports directly to Telegram's trust and safety team.

---
*Source:*
- [telegram_scraper/index.js](../../telegram_scraper/index.js)

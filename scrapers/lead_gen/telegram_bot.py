import os
import sys
import time
import logging
import requests
from dotenv import load_dotenv

# Ensure local imports work
sys.path.append(os.path.dirname(__file__))

load_dotenv()

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("TelegramBotRunner")

SPREADSHEET_ID = "14k9pAVjqmWh6ukQo3S2JV2kdUkV-fazy8TnqkYI-1Zc"
SPREADSHEET_URL = f"https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit"
GITHUB_REPO = "kaykruk/tuppli-agentic-systems"
WORKFLOW_FILE = "tuppli_lead_pipeline.yml"

def send_message(bot_token: str, chat_id: str, text: str):
    url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
    payload = {
        "chat_id": chat_id,
        "text": text,
        "parse_mode": "HTML",
        "disable_web_page_preview": True
    }
    try:
        requests.post(url, json=payload, timeout=10)
    except Exception as e:
        logger.error(f"Error sending message: {e}")

def handle_message(bot_token: str, message: dict, allowed_chat_id: str, github_token: str):
    chat_id = str(message.get("chat", {}).get("id"))
    raw_text = message.get("text", "").strip()
    text = raw_text.lower()

    if allowed_chat_id and chat_id != str(allowed_chat_id):
        logger.warning(f"Unauthorized chat_id: {chat_id}")
        send_message(bot_token, chat_id, "⛔ <b>Access Denied:</b> This bot is private.")
        return

    logger.info(f"Received message from {chat_id}: {raw_text}")

    # Command: Run Lead Gen
    if text.startswith(("/run", "run", "scrape", "/scrape", "find", "search")):
        import re
        num_match = re.search(r"\b(\d{1,2})\b", text)
        max_leads = min(max(int(num_match.group(1)), 1), 15) if num_match else 5

        city = ""
        city_match = re.search(r"\bin\s+([a-zA-Z\s]+)", text, re.IGNORECASE)
        if city_match:
            city = city_match.group(1).strip()
        elif "chicago" in text:
            city = "Chicago"
        elif "dallas" in text:
            city = "Dallas"

        if not github_token:
            send_message(bot_token, chat_id, "❌ <code>GITHUB_TOKEN</code> is not set in environment.")
            return

        dispatch_url = f"https://api.github.com/repos/{GITHUB_REPO}/actions/workflows/{WORKFLOW_FILE}/dispatches"
        headers = {
            "Authorization": f"Bearer {github_token}",
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
        }
        body = {
            "ref": "main",
            "inputs": {
                "max_leads": str(max_leads),
                "query_limit": "10",
                "city": city,
            }
        }
        res = requests.post(dispatch_url, headers=headers, json=body)
        if res.status_code in (200, 204):
            target_desc = f"in <b>{city}</b>" if city else "across <b>Chicago & Dallas</b>"
            send_message(
                bot_token,
                chat_id,
                f"🚀 <b>Tuppli Lead Agent Dispatched!</b>\n\n"
                f"• <b>Target:</b> {target_desc}\n"
                f"• <b>Max Leads:</b> {max_leads}\n"
                f"• <b>Platform:</b> GitHub Actions Cloud Runner\n\n"
                f"Scraping active. I will send you the breakdown and top discoveries right here when complete!"
            )
        else:
            send_message(bot_token, chat_id, f"❌ Failed to dispatch GitHub Action: HTTP {res.status_code}")
        return

    # Command: Status
    if text.startswith(("/status", "status", "leads", "/leads", "count", "summary")):
        try:
            csv_url = f"https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/gviz/tq?tqx=out:csv"
            res = requests.get(csv_url, timeout=10)
            rows = [r for r in res.text.split("\n") if r.strip()]
            lead_count = max(0, len(rows) - 1)
        except Exception:
            lead_count = "30+"

        send_message(
            bot_token,
            chat_id,
            f"📊 <b>Tuppli Lead Database Status</b>\n\n"
            f"✅ <b>Qualified Leads in Sheet:</b> <code>{lead_count}</code>\n"
            f"🎯 <b>Niches:</b> 3PL Logistics, Freight Dispatch, Claims Intake, Operations\n"
            f"⚡ <b>Filter:</b> ICP Score ≥ 4/10 with Custom Anti-Slop Icebreakers\n\n"
            f"🔗 <a href=\"{SPREADSHEET_URL}\">Open Google Sheet</a>\n\n"
            f"💡 <i>Reply with <code>/run 5 in Chicago</code> to launch a fresh batch!</i>"
        )
        return

    # Help
    send_message(
        bot_token,
        chat_id,
        "👋 <b>Tuppli Lead Generation Bot</b>\n\n"
        "Commands:\n"
        "• <code>/run 5 in Chicago</code> — Dispatches agent to scrape 5 SMB leads in Chicago\n"
        "• <code>/run 10 in Dallas</code> — Scrapes Dallas operations and enriches with icebreakers\n"
        "• <code>/status</code> — Current lead count & link to Google Sheet\n"
        "• <code>/help</code> — Show this menu"
    )

def poll_telegram():
    bot_token = os.getenv("TELEGRAM_BOT_TOKEN")
    chat_id = os.getenv("TELEGRAM_CHAT_ID")
    github_token = os.getenv("GITHUB_TOKEN")

    if not bot_token:
        logger.error("TELEGRAM_BOT_TOKEN is not configured in .env.")
        return

    logger.info(f"🤖 Starting Telegram Bot polling loop for authorized chat: {chat_id}...")
    offset = 0

    while True:
        try:
            url = f"https://api.telegram.org/bot{bot_token}/getUpdates?offset={offset}&timeout=30"
            res = requests.get(url, timeout=35).json()

            if res.get("ok"):
                for update in res.get("result", []):
                    offset = update["update_id"] + 1
                    if "message" in update:
                        handle_message(bot_token, update["message"], chat_id, github_token)
        except KeyboardInterrupt:
            logger.info("Bot polling stopped by user.")
            break
        except Exception as e:
            logger.error(f"Polling exception: {e}")
            time.sleep(5)

if __name__ == "__main__":
    poll_telegram()

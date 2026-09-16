import os
import sys
import logging
import requests
from typing import Optional, Dict, Any
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger("TelegramNotifier")

DEFAULT_SPREADSHEET_URL = "https://docs.google.com/spreadsheets/d/14k9pAVjqmWh6ukQo3S2JV2kdUkV-fazy8TnqkYI-1Zc/edit"

class TelegramNotifier:
    def __init__(self, bot_token: Optional[str] = None, chat_id: Optional[str] = None):
        self.bot_token = bot_token or os.getenv("TELEGRAM_BOT_TOKEN")
        self.chat_id = chat_id or os.getenv("TELEGRAM_CHAT_ID")
        self.base_url = f"https://api.telegram.org/bot{self.bot_token}" if self.bot_token else None

    def is_configured(self) -> bool:
        return bool(self.bot_token and self.chat_id)

    def send_message(self, text: str, parse_mode: str = "HTML") -> bool:
        if not self.is_configured():
            logger.info("ℹ️ Telegram Notifier is not configured (missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID).")
            return False

        try:
            url = f"{self.base_url}/sendMessage"
            payload = {
                "chat_id": self.chat_id,
                "text": text,
                "parse_mode": parse_mode,
                "disable_web_page_preview": True
            }
            res = requests.post(url, json=payload, timeout=10)
            if res.status_code == 200:
                logger.info("📲 Telegram message successfully delivered!")
                return True
            else:
                logger.error(f"❌ Telegram API returned error {res.status_code}: {res.text}")
                return False
        except Exception as e:
            logger.error(f"❌ Exception sending Telegram message: {e}")
            return False

    def send_run_summary(
        self,
        total_added: int,
        target_city: Optional[str] = None,
        top_lead: Optional[Dict[str, Any]] = None,
        spreadsheet_url: str = DEFAULT_SPREADSHEET_URL,
        quota_warning: bool = False
    ) -> bool:
        if not self.is_configured():
            logger.info("ℹ️ Telegram Notifier not configured. Summary not sent.")
            return False

        city_str = f" in <b>{target_city}</b>" if target_city else ""
        header = f"🚀 <b>Tuppli Lead Gen Update</b>\n\n"
        stats = f"✅ <b>New Leads Synced:</b> {total_added}{city_str}\n"

        lead_details = ""
        if top_lead:
            company = top_lead.get("company_name", "N/A")
            score = top_lead.get("icp_score", "N/A")
            niche = top_lead.get("niche_industry", "N/A")
            bottleneck = top_lead.get("target_bottleneck_workflow", "Manual back-office coordination")
            icebreaker = top_lead.get("icebreaker", "")

            # Truncate icebreaker if too long
            if len(icebreaker) > 200:
                icebreaker = icebreaker[:197] + "..."

            lead_details = (
                f"\n⭐ <b>Top Discovery:</b> <code>{company}</code>\n"
                f"• <b>ICP Score:</b> {score}/10\n"
                f"• <b>Niche:</b> {niche}\n"
                f"• <b>Target Bottleneck:</b> {bottleneck}\n"
                f"• <b>Sample Icebreaker:</b>\n<i>\"{icebreaker}\"</i>\n"
            )
        elif total_added == 0:
            lead_details = "\nℹ️ <i>No new unique leads added this run (all candidates were duplicates or filtered).</i>\n"

        footer = f"\n📊 <a href=\"{spreadsheet_url}\">Open Google Sheet</a>"

        if quota_warning:
            footer += "\n\n⚠️ <i>Note: Free Gemini rate quota was reached; fallback icebreakers were applied for some leads.</i>"

        message = header + stats + lead_details + footer
        return self.send_message(message, parse_mode="HTML")

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
    notifier = TelegramNotifier()

    print("Testing Telegram Notifier...")
    print(f"Configured: {notifier.is_configured()}")
    if not notifier.is_configured():
        print("❌ Please set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID.")
    else:
        success = notifier.send_message("👋 <b>Hello from Tuppli!</b> Your Telegram notification agent is working.")
        print(f"Send success: {success}")

import os
import sys
import logging
from typing import Optional, Dict, Any
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger("WhatsAppNotifier")

DEFAULT_SPREADSHEET_URL = "https://docs.google.com/spreadsheets/d/14k9pAVjqmWh6ukQo3S2JV2kdUkV-fazy8TnqkYI-1Zc/edit"
DEFAULT_TWILIO_WHATSAPP_FROM = "whatsapp:+14155238886"

class WhatsAppNotifier:
    def __init__(self):
        self.account_sid = os.getenv("TWILIO_ACCOUNT_SID")
        self.auth_token = os.getenv("TWILIO_AUTH_TOKEN")
        self.from_number = os.getenv("TWILIO_WHATSAPP_NUMBER", DEFAULT_TWILIO_WHATSAPP_FROM)
        self.to_number = os.getenv("USER_WHATSAPP_NUMBER")

        if not self.from_number.startswith("whatsapp:"):
            self.from_number = f"whatsapp:{self.from_number}"

        if self.to_number and not self.to_number.startswith("whatsapp:"):
            self.to_number = f"whatsapp:{self.to_number}"

        self.client = None
        if self.account_sid and self.auth_token:
            try:
                from twilio.rest import Client
                self.client = Client(self.account_sid, self.auth_token)
            except Exception as e:
                logger.warning(f"Failed to initialize Twilio client: {e}")

    def is_configured(self) -> bool:
        return bool(self.client and self.to_number)

    def send_message(self, body: str, to: Optional[str] = None) -> bool:
        target_to = to or self.to_number
        if not self.is_configured() and not (self.client and target_to):
            logger.info("ℹ️ WhatsApp Notifier is not configured (missing TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, or USER_WHATSAPP_NUMBER). Skipping WhatsApp notification.")
            return False

        if not target_to.startswith("whatsapp:"):
            target_to = f"whatsapp:{target_to}"

        try:
            message = self.client.messages.create(
                from_=self.from_number,
                to=target_to,
                body=body
            )
            logger.info(f"📲 WhatsApp message successfully sent! SID: {message.sid}")
            return True
        except Exception as e:
            logger.error(f"❌ Error sending WhatsApp message: {e}")
            return False

    def send_run_summary(
        self,
        total_added: int,
        target_city: Optional[str] = None,
        top_lead: Optional[Dict[str, Any]] = None,
        spreadsheet_url: str = DEFAULT_SPREADSHEET_URL,
        quota_warning: bool = False
    ) -> bool:
        """Sends a structured WhatsApp update when lead pipeline completes."""
        if not self.is_configured():
            logger.info("ℹ️ WhatsApp Notifier not configured. Summary not sent to WhatsApp.")
            return False

        city_str = f" in {target_city}" if target_city else ""
        header = f"🚀 *Tuppli Lead Gen Update*\n"
        stats = f"✅ *New Leads Synced:* {total_added}{city_str}\n"

        lead_details = ""
        if top_lead:
            company = top_lead.get("company_name", "N/A")
            score = top_lead.get("icp_score", "N/A")
            niche = top_lead.get("niche_industry", "N/A")
            bottleneck = top_lead.get("target_bottleneck_workflow", "Manual back-office coordination")
            icebreaker = top_lead.get("icebreaker", "")

            # Truncate icebreaker to keep message readable
            if len(icebreaker) > 160:
                icebreaker = icebreaker[:157] + "..."

            lead_details = (
                f"\n⭐ *Top Discovery:* {company}\n"
                f"• *ICP Score:* {score}/10\n"
                f"• *Niche:* {niche}\n"
                f"• *Bottleneck:* {bottleneck}\n"
                f"• *Sample Icebreaker:* \"{icebreaker}\"\n"
            )
        elif total_added == 0:
            lead_details = "\nℹ️ No new unique leads added this run (all candidates were duplicates or skipped).\n"

        footer = f"\n📊 *Google Sheet:* {spreadsheet_url}"

        if quota_warning:
            footer += "\n⚠️ *Note:* Daily Gemini free quota was reached; fallback icebreakers used for some leads."

        message_body = header + stats + lead_details + footer
        return self.send_message(message_body)

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
    notifier = WhatsAppNotifier()

    if len(sys.argv) > 1 and sys.argv[1] == "--test":
        print(f"Testing WhatsApp Notifier...")
        print(f"Configured: {notifier.is_configured()}")
        print(f"From: {notifier.from_number}")
        print(f"To: {notifier.to_number}")

        if not notifier.is_configured():
            print("\n❌ Setup missing: Please set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and USER_WHATSAPP_NUMBER in your environment or .env file.")
        else:
            success = notifier.send_message("👋 Hello from Tuppli! Your WhatsApp notification pipeline is working perfectly.")
            print(f"Send result: {success}")
    else:
        print("Run with --test to send a test message.")

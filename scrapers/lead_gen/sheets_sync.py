import os
import json
import logging
from datetime import datetime
from typing import List, Dict, Set, Optional
import gspread
from google.oauth2.service_account import Credentials

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("SheetsSync")

SPREADSHEET_ID = os.getenv("SPREADSHEET_ID", "14k9pAVjqmWh6ukQo3S2JV2kdUkV-fazy8TnqkYI-1Zc")
SERVICE_ACCOUNT_FILE = os.getenv(
    "SERVICE_ACCOUNT_FILE",
    os.path.join(os.path.dirname(__file__), "service_account.json")
)

HEADERS = [
    "Company Name",
    "Website URL",
    "Target City",
    "Niche / Industry",
    "ICP Fit Score (1-10)",
    "ICP Fit Reason",
    "Personalized Icebreaker",
    "Target Bottleneck Workflow",
    "Decision Maker",
    "Role / Title",
    "Direct Contact (Email/Phone/Profile)",
    "LinkedIn Company URL",
    "Date Added",
    "Status"
]

SCOPES = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive"
]

class SheetsSync:
    def __init__(self, spreadsheet_id: str = SPREADSHEET_ID, creds_path: str = SERVICE_ACCOUNT_FILE):
        self.spreadsheet_id = spreadsheet_id
        self.creds_path = creds_path
        self.client = None
        self.sheet = None
        self._authenticate()

    def _authenticate(self):
        try:
            if not os.path.exists(self.creds_path):
                raise FileNotFoundError(f"Service account file not found at: {self.creds_path}")
            
            credentials = Credentials.from_service_account_file(self.creds_path, scopes=SCOPES)
            self.client = gspread.authorize(credentials)
            self.spreadsheet = self.client.open_by_key(self.spreadsheet_id)
            self.sheet = self.spreadsheet.get_worksheet(0)
            logger.info(f"Successfully connected to Google Sheet: '{self.spreadsheet.title}'")
            self._ensure_headers()
        except Exception as e:
            logger.error(f"Failed to authenticate with Google Sheets: {e}")
            raise

    def _ensure_headers(self):
        """Ensures the sheet has the required column headers formatted properly."""
        try:
            existing_headers = self.sheet.row_values(1)
            if not existing_headers:
                logger.info("Sheet is empty. Adding header row...")
                self.sheet.insert_row(HEADERS, 1)
                self.sheet.format("A1:N1", {
                    "textFormat": {"bold": True, "foregroundColor": {"red": 1.0, "green": 1.0, "blue": 1.0}},
                    "backgroundColor": {"red": 0.08, "green": 0.18, "blue": 0.36},
                    "horizontalAlignment": "CENTER"
                })
                self.sheet.freeze(rows=1)
                logger.info("Headers initialized with styling.")
            else:
                logger.info(f"Existing headers detected: {len(existing_headers)} columns.")
        except Exception as e:
            logger.warning(f"Could not format headers: {e}")

    def get_existing_urls_and_names(self) -> Set[str]:
        """Retrieves all existing website URLs and company names to prevent duplicate scraping."""
        try:
            all_records = self.sheet.get_all_values()
            if len(all_records) <= 1:
                return set()
            
            seen = set()
            for row in all_records[1:]:
                if len(row) >= 1 and row[0]:
                    seen.add(row[0].strip().lower()) # Company name
                if len(row) >= 2 and row[1]:
                    # Clean url domain
                    url = row[1].strip().lower().replace("https://", "").replace("http://", "").replace("www.", "").rstrip("/")
                    seen.add(url)
            return seen
        except Exception as e:
            logger.error(f"Error fetching existing records: {e}")
            return set()

    def append_lead(self, lead: Dict) -> bool:
        """Appends a qualified lead row to the sheet."""
        try:
            row = [
                lead.get("company_name", ""),
                lead.get("website_url", ""),
                lead.get("city", ""),
                lead.get("niche_industry", ""),
                str(lead.get("icp_score", "")),
                lead.get("icp_reason", ""),
                lead.get("icebreaker", ""),
                lead.get("target_bottleneck_workflow", ""),
                lead.get("decision_maker", ""),
                lead.get("role_title", ""),
                lead.get("direct_contact", ""),
                lead.get("linkedin_url", ""),
                lead.get("date_added", datetime.now().strftime("%Y-%m-%d")),
                lead.get("status", "New")
            ]
            self.sheet.append_row(row, value_input_option="USER_ENTERED")
            logger.info(f"Added lead to sheet: {lead.get('company_name')} (Score: {lead.get('icp_score')}/10)")
            return True
        except Exception as e:
            logger.error(f"Failed to append lead: {e}")
            return False

if __name__ == "__main__":
    sync = SheetsSync()
    print("Google Sheet Sync verified successfully!")

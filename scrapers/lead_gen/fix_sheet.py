import sys, os
sys.path.append(os.path.join(os.path.dirname(__file__)))
from sheets_sync import SheetsSync

sync = SheetsSync()
all_records = sync.sheet.get_all_values()

valid_leads = []
for row in all_records[1:]:
    clean_row = [cell.strip() for cell in row if cell.strip()]
    if len(clean_row) >= 8 and clean_row[0] != "Company Name":
        # Pad to 14 columns
        while len(clean_row) < 14:
            clean_row.append("")
        valid_leads.append(clean_row[:14])

sync.sheet.clear()

headers = [
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
sync.sheet.append_row(headers, value_input_option="USER_ENTERED")

if valid_leads:
    sync.sheet.append_rows(valid_leads, value_input_option="USER_ENTERED")

sync.sheet.format("A1:N1", {
    "textFormat": {"bold": True, "foregroundColor": {"red": 1.0, "green": 1.0, "blue": 1.0}},
    "backgroundColor": {"red": 0.08, "green": 0.18, "blue": 0.36},
    "horizontalAlignment": "CENTER"
})

print(f"Fixed sheet and restored {len(valid_leads)} leads.")

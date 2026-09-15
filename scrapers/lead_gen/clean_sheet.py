import sys, os
sys.path.append(os.path.join(os.path.dirname(__file__)))
from sheets_sync import SheetsSync

sync = SheetsSync()
all_rows = sync.sheet.get_all_values()

# Garbage company names to remove
garbage = ["just a moment", "trucking jobs", "cdl training", "simplyhired", "thetruckersreport"]

headers = all_rows[0]
clean_rows = []
removed = []

for row in all_rows[1:]:
    company_name = row[0].strip().lower() if len(row) > 0 else ""
    website = row[1].strip().lower() if len(row) > 1 else ""
    
    is_garbage = any(g in company_name for g in garbage) or any(g in website for g in garbage)
    if is_garbage:
        removed.append(row[0])
    else:
        clean_rows.append(row[:14])  # Keep only 14 columns

sync.sheet.clear()
sync.sheet.append_row(headers[:14], value_input_option="USER_ENTERED")
if clean_rows:
    sync.sheet.append_rows(clean_rows, value_input_option="USER_ENTERED")

sync.sheet.format("A1:N1", {
    "textFormat": {"bold": True, "foregroundColor": {"red": 1.0, "green": 1.0, "blue": 1.0}},
    "backgroundColor": {"red": 0.08, "green": 0.18, "blue": 0.36},
    "horizontalAlignment": "CENTER"
})

print(f"Removed {len(removed)} junk leads: {removed}")
print(f"Kept {len(clean_rows)} valid leads.")

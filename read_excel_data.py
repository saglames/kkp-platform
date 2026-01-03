import pandas as pd
import json

# Read Excel file
excel_file = r'C:\Users\ESAT\Desktop\1.xlsx'

# Read all sheets
xls = pd.ExcelFile(excel_file)

print("Available sheets:", xls.sheet_names)
print("\n" + "="*80 + "\n")

# Read each sheet
for sheet_name in xls.sheet_names:
    print(f"Sheet: {sheet_name}")
    print("-" * 80)
    df = pd.read_excel(excel_file, sheet_name=sheet_name)
    print(df.to_string())
    print("\n" + "="*80 + "\n")

# Save to JSON for easier parsing
data = {}
for sheet_name in xls.sheet_names:
    df = pd.read_excel(excel_file, sheet_name=sheet_name)
    # Convert to dict, replacing NaN with None
    data[sheet_name] = df.where(pd.notnull(df), None).to_dict(orient='records')

with open('excel_data.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("Data saved to excel_data.json")

import csv
import json
from collections import defaultdict

# Read bs.csv to get the actual adhikarana mapping
adhikarana_sutras = defaultdict(list)
with open('bs.csv', 'r', encoding='utf-8-sig') as f:
    reader = csv.DictReader(f)
    for row in reader:
        sutra_id = f"{row['adhyaya']}.{row['pada']}.{row['sutra_number']}"
        adhikarana_name = row['adhikarana']
        adhikarana_sutras[adhikarana_name].append(sutra_id)

# Read adhikarana-details.json
with open('adhikarana-details.json', 'r', encoding='utf-8') as f:
    adhikarana_details = json.load(f)

# Compare and report differences
print("Checking adhikarana ranges...\n")
errors_found = False

for adhik_id, details in adhikarana_details.items():
    if adhik_id.startswith('_'):
        continue
    
    name = details['name']
    declared_range = details['sutras']
    
    if name not in adhikarana_sutras:
        print(f"❌ {adhik_id}: {name}")
        print(f"   Not found in bs.csv")
        print()
        errors_found = True
        continue
    
    actual_sutras = adhikarana_sutras[name]
    
    # Calculate actual range
    if len(actual_sutras) == 1:
        actual_range = actual_sutras[0]
    else:
        actual_range = f"{actual_sutras[0]}-{actual_sutras[-1]}"
    
    # Compare
    if declared_range != actual_range:
        print(f"❌ {adhik_id}: {name}")
        print(f"   Declared: {declared_range}")
        print(f"   Actual:   {actual_range}")
        print(f"   Sutras:   {', '.join(actual_sutras)}")
        print()
        errors_found = True
    else:
        print(f"✅ {adhik_id}: {name} - {declared_range}")

if not errors_found:
    print("\n✅ All adhikarana ranges are correct!")
else:
    print("\n❌ Found errors in adhikarana ranges. Please fix them.")

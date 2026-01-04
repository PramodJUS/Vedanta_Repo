import csv
import json
from collections import OrderedDict

# Read bs.csv and group consecutive sutras by adhikarana
adhikarana_list = []
current_adhikarana = None
current_sutras = []

with open('bs.csv', 'r', encoding='utf-8-sig') as f:
    reader = csv.DictReader(f, fieldnames=['adhyaya', 'pada', 'sutra_number', 'sutra_text', 'adhikarana'])
    next(reader)  # Skip header
    
    for row in reader:
        sutra_id = f"{row['adhyaya']}.{row['pada']}.{row['sutra_number']}"
        adhikarana_name = row['adhikarana']
        
        # If adhikarana name changes, save the previous group and start new one
        if adhikarana_name != current_adhikarana:
            # Save previous group if exists
            if current_adhikarana is not None:
                if len(current_sutras) == 1:
                    sutra_range = current_sutras[0]
                else:
                    sutra_range = f"{current_sutras[0]}-{current_sutras[-1]}"
                
                adhikarana_list.append({
                    'name': current_adhikarana,
                    'sutras': sutra_range
                })
            
            # Start new group
            current_adhikarana = adhikarana_name
            current_sutras = [sutra_id]
        else:
            # Same adhikarana, add to current group
            current_sutras.append(sutra_id)
    
    # Don't forget the last group
    if current_adhikarana is not None:
        if len(current_sutras) == 1:
            sutra_range = current_sutras[0]
        else:
            sutra_range = f"{current_sutras[0]}-{current_sutras[-1]}"
        
        adhikarana_list.append({
            'name': current_adhikarana,
            'sutras': sutra_range
        })

# Build the JSON structure
adhikarana_details = OrderedDict()
for i, adhik in enumerate(adhikarana_list, start=1):
    adhikarana_details[f"Adhikarana_{i}"] = OrderedDict([
        ("name", adhik['name']),
        ("sutras", adhik['sutras']),
        ("वषय - Topic", ""),
        ("सशय - Samshaya", ""),
        ("परवपकष - Purvapaksha", ""),
        ("सधदनत - Siddhanta", ""),
        ("notes", ""),
        ("references", "")
    ])

# Write to new file
with open('adhikarana-details-new.json', 'w', encoding='utf-8') as f:
    json.dump(adhikarana_details, f, ensure_ascii=False, indent=4)

print(f"Created {len(adhikarana_list)} adhikarana entries")
print("\nFirst 10 entries:")
for i in range(min(10, len(adhikarana_list))):
    print(f"  Adhikarana_{i+1}: {adhikarana_list[i]['name']} - {adhikarana_list[i]['sutras']}")

# Generate sutra-details.json with proper UTF-8 encoding
$ErrorActionPreference = "Stop"

# Read CSV with UTF-8 encoding
$csv = Import-Csv "c:\AllScripts\Personal\vedanta\sutra\bs.csv" -Encoding UTF8

# Create ordered hashtable for JSON
$newJson = [ordered]@{}

# Process each sutra
foreach ($row in $csv) {
    $key = "$($row.adhyaya).$($row.pada).$($row.sutra_number)"
    
    # Create sutra entry
    $newJson[$key] = [ordered]@{
        "वयकतगत-टपण" = @{
            "moola" = "<p style=`"text-align: center;`">अधयय $($row.adhyaya)</p><p style=`"text-align: center;`"><font color=`"#dc2626`">$($row.sutra_text)</font></p><p style=`"text-align: center;`">अधकरणम - $($row.adhikarana)</p><p><br></p><p>सतररथ</p><p>यह सतररथ लख</p>"
        };
        "Part#1" = [ordered]@{
            "भषयम" = @{
                "author" = "madhwacharya";
                "moola" = "अतर भषयम $key भवषयत";
                "Ka_Translation" = "ವಯಖಯನ - ಇಲಲ ನಮಮ ಕನನಡ ವಯಖಯನವನನ ಬರಯರ";
                "En_Translation" = "Commentary - Write your English commentary here"
            };
            "तततवपरकशक" = @{
                "author" = "jayateertha";
                "moola" = "अतर तततवपरकशक $key भवषयत"
            };
            "गरवरथदपक" = @{
                "author" = "Vadiraja";
                "moola" = "अतर गरवरथदपक $key भवषयत"
            };
            "भवबध" = @{
                "author" = "Raghuttama";
                "moola" = "अतर भवबध $key भवषयत"
            };
            "भवदप" = @{
                "author" = "Raghavendra";
                "moola" = "अतर भवदप $key भवषयत"
            };
            "अभनवचनदरक" = @{
                "moola" = "अतर अभनवचनदरक $key भवषयत"
            };
            "वकयरथमकतवल" = @{
                "moola" = "अतर वकयरथमकतवल $key भवषयत"
            };
            "तततवसबधन" = @{
                "moola" = "अतर तततवसबधन $key भवषयत"
            };
            "वकयरथववरणम" = @{
                "moola" = "अतर वकयरथववरणम $key भवषयत"
            };
            "वकयरथमञजर" = @{
                "moola" = "अतर वकयरथमञजर $key भवषयत"
            };
            "तततवपरकशकववत" = @{
                "moola" = "अतर तततवपरकशकववत $key भवषयत"
            }
        }
    }
}

# Convert to JSON and save with UTF-8 encoding (no BOM)
$utf8NoBom = New-Object System.Text.UTF8Encoding $false
$jsonContent = $newJson | ConvertTo-Json -Depth 10
[System.IO.File]::WriteAllText("c:\AllScripts\Personal\vedanta\sutra\sutra-details.json", $jsonContent, $utf8NoBom)

Write-Output "Created JSON with $($newJson.Count) sutras"
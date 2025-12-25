# Update version date in bs.js
$jsFile = "js\bs.js"
$currentDateTime = Get-Date -Format "yyyy-MM-ddTHH:mm:sszzz"
$displayDateTime = Get-Date -Format "MMM dd, yyyy, h:mm tt"

Write-Host "Updating version date to: $displayDateTime" -ForegroundColor Green

# Read the file content
$content = Get-Content $jsFile -Raw

# Update the VERSION_DATE line
$content = $content -replace "const VERSION_DATE = '[^']+';", "const VERSION_DATE = '$currentDateTime';"

# Write back to file
Set-Content $jsFile -Value $content -NoNewline

Write-Host "Version date updated successfully!" -ForegroundColor Green
Write-Host "Don't forget to commit and push the changes." -ForegroundColor Yellow

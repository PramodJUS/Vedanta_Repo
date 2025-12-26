# Update version date in bs.js
$jsFile = "js\bs.js"
$releaseNotesFile = "RELEASE_NOTES.md"
$currentDateTime = Get-Date -Format "yyyy-MM-ddTHH:mm:sszzz"
$displayDateTime = Get-Date -Format "MMM dd, yyyy, h:mm tt"
$releaseDate = Get-Date -Format "MMMM dd, yyyy"

Write-Host "Updating version date to: $displayDateTime" -ForegroundColor Green

# Read the file content
$content = Get-Content $jsFile -Raw

# Update the VERSION_DATE line
$content = $content -replace "const VERSION_DATE = '[^']+';", "const VERSION_DATE = '$currentDateTime';"

# Write back to file
Set-Content $jsFile -Value $content -NoNewline

Write-Host "Version date updated in bs.js" -ForegroundColor Green

# Update RELEASE_NOTES.md with current date
$releaseContent = Get-Content $releaseNotesFile -Raw

# Check if today's date already exists in release notes
$todaySection = "## $releaseDate"
if ($releaseContent -notmatch [regex]::Escape($todaySection)) {
    Write-Host "Adding new section for $releaseDate in RELEASE_NOTES.md" -ForegroundColor Green
    
    # Find the position after "# Release Notes" and insert new section
    $newSection = @"

## $releaseDate

### New Changes
- Update this section with your changes before committing

---
"@
    
    $releaseContent = $releaseContent -replace "(# Release Notes)", "`$1$newSection"
    Set-Content $releaseNotesFile -Value $releaseContent -NoNewline
    Write-Host "New release section added. Please update with your changes!" -ForegroundColor Yellow
} else {
    Write-Host "Release section for $releaseDate already exists" -ForegroundColor Cyan
}

Write-Host "`nVersion update completed!" -ForegroundColor Green
Write-Host "Don't forget to:" -ForegroundColor Yellow
Write-Host "  1. Update RELEASE_NOTES.md with actual changes" -ForegroundColor Yellow
Write-Host "  2. Commit and push the changes" -ForegroundColor Yellow

# Checkin script - Updates timestamp, release notes, and documentation before commit
param(
    [string]$Message = ""
)

$timestampFile = "build-timestamp.txt"
$currentDateTime = Get-Date -Format "MMMM dd, yyyy - hh:mm tt"

Write-Host "=== Pre-Checkin Update ===" -ForegroundColor Cyan
Write-Host "Updating build timestamp to: $currentDateTime IST" -ForegroundColor Green

# Update build-timestamp.txt
Set-Content $timestampFile -Value "$currentDateTime IST" -NoNewline

Write-Host "Build timestamp updated" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Update RELEASE_NOTES.md with your changes" -ForegroundColor Yellow
Write-Host "  2. Update FRAMEWORK_DOCUMENTATION.md if needed" -ForegroundColor Yellow
Write-Host "  3. Review changes with: git status" -ForegroundColor Yellow
Write-Host "  4. Stage files: git add ." -ForegroundColor Yellow
Write-Host "  5. Commit: git commit -m 'your message'" -ForegroundColor Yellow
Write-Host "  6. Push: git push origin develop" -ForegroundColor Yellow

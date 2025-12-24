# Publishing to GitHub for Free CDN Hosting

Follow these steps to publish your transliteration library and use it via jsDelivr CDN:

## Step 1: Create a GitHub Repository

1. Go to https://github.com/new
2. Create a new repository:
   - **Name**: `devanagari-transliterate` (or your preferred name)
   - **Description**: "Transliterate Devanagari text to Indic scripts"
   - **Visibility**: Public (required for free jsDelivr CDN)
   - **Initialize**: Don't check any boxes

## Step 2: Setup GitHub Authentication

GitHub requires a Personal Access Token (PAT) for HTTPS authentication:

1. Go to https://github.com/settings/tokens
2. Click **"Generate new token"** → **"Generate new token (classic)"**
3. Settings:
   - **Note**: "Devanagari Transliterate Library"
   - **Expiration**: 90 days (or your preference)
   - **Select scopes**: Check `repo` (full control of private repositories)
4. Click **"Generate token"**
5. **IMPORTANT**: Copy the token immediately (you won't see it again!)

## Step 3: Push Your Code

Open PowerShell in the `transliterate-library` folder and run:

```powershell
# Initialize git repository
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: Devanagari transliteration library"

# Add your GitHub repository as remote (replace PramodJUS with your username if different)
git remote add origin https://github.com/PramodJUS/devanagari-transliterate.git

# Push to GitHub
git branch -M main
git push -u origin main
```

When prompted for credentials:
- **Username**: Your GitHub username (e.g., `PramodJUS`)
- **Password**: Paste your Personal Access Token (NOT your GitHub password!)

### Alternative: Use Git Credential Manager (Easier)

```powershell
# Install Git Credential Manager (if not already installed)
# Download from: https://github.com/git-ecosystem/git-credential-manager/releases

# After installation, just push - it will open a browser for authentication
git push -u origin main
# A browser window will open - login to GitHub and authorize
```

## Step 4: Create a Release (Optional but Recommended)

1. Go to your repository on GitHub
2. Click "Releases" → "Create a new release"
3. Tag version: `v1.0.0`
4. Release title: `v1.0.0 - Initial Release`
5. Click "Publish release"

## Step 5: Use via jsDelivr CDN

Your library is now available on a free global CDN! Use it in any project:

### Latest Version (Auto-updates)
```html
<script src="https://cdn.jsdelivr.net/gh/PramodJUS/devanagari-transliterate@main/transliterate.js"></script>
<script src="https://cdn.jsdelivr.net/gh/PramodJUS/devanagari-transliterate@main/scripts/kannada-script.js"></script>
<script src="https://cdn.jsdelivr.net/gh/PramodJUS/devanagari-transliterate@main/scripts/telugu-script.js"></script>
```

### Specific Version (Recommended for production)
```html
<script src="https://cdn.jsdelivr.net/gh/PramodJUS/devanagari-transliterate@v1.0.0/transliterate.js"></script>
<script src="https://cdn.jsdelivr.net/gh/PramodJUS/devanagari-transliterate@v1.0.0/scripts/kannada-script.js"></script>
<script src="https://cdn.jsdelivr.net/gh/PramodJUS/devanagari-transliterate@v1.0.0/scripts/telugu-script.js"></script>
```

## Step 6: Test Your CDN Links

1. Wait 1-2 minutes for jsDelivr to cache your files
2. Open your browser and visit:
   ```
   https://cdn.jsdelivr.net/gh/PramodJUS/devanagari-transliterate@main/transliterate.js
   ```
3. You should see your JavaScript code

## Making Updates

When you update your library:

```powershell
# Make your changes to the files
# Then commit and push
git add .
git commit -m "Description of your changes"
git push

# For versioned releases, create a new tag
git tag v1.0.1
git push --tags
```

## Testing Locally

You can test the demo locally before publishing:

1. Open PowerShell in the `transliterate-library` folder
2. Run: `python -m http.server 8000` (if you have Python)
   OR: Install a simple HTTP server
3. Open http://localhost:8000/demo.html

## Benefits of This Setup

✅ **Free forever** - GitHub and jsDelivr are free
✅ **Global CDN** - Fast worldwide
✅ **Version control** - Track all changes
✅ **Easy updates** - Just push to GitHub
✅ **No maintenance** - jsDelivr handles caching automatically
✅ **Use anywhere** - Include in any HTML project with a simple `<script>` tag

---

Need help? Check:
- GitHub Docs: https://docs.github.com/
- jsDelivr Docs: https://www.jsdelivr.com/

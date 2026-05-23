# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Vedanta is a web-based application for studying Vedanta philosophy, specifically the **Brahma Sutras** with **Madhvacharya's Dvaita Vedanta** commentary. The application displays Sanskrit sutras with multiple commentaries, supports multi-language transliteration, Sanskrit search with sandhi-awareness, and provides an admin interface for content management.

**Technology Stack**: Pure vanilla JavaScript, HTML/CSS, no build tools or frameworks required.

## Running the Application

The application requires a local web server (to load CSV/JSON files via CORS):

```bash
# Using Python (recommended)
python -m http.server 8000

# Using Node.js
npx http-server -p 8000

# Using VS Code Live Server extension
# Right-click index.html > "Open with Live Server"
```

Access at: http://localhost:8000/

## Project Structure

```
vedanta/
├── index.html              # Main viewer application
├── admin.html              # Content management interface
├── config.js               # Centralized configuration (colors, paths, auth)
├── js/
│   ├── bs.js               # Main application logic (~190KB)
│   ├── performance-utils.js    # LRU cache, debounce, lazy loading
│   └── virtual-scroller.js     # Virtual scrolling for large texts
├── css/
│   └── bs.css              # Application styles
├── sutra/
│   ├── bs.csv              # Main sutra list (adhyaya, pada, number, text, adhikarana)
│   ├── sutra-details.json  # Commentary content (~1.8MB)
│   ├── adhikarana-details.json  # Topic details
│   └── Author.csv          # Author-commentary mappings
├── transliterate-library/  # Git submodule: Devanagari ↔ Indic scripts
├── sanskrit-search-library/  # Git submodule: Sandhi-aware search
├── dataimport/             # Python web scraping toolkit
└── gita/                   # Bhagavad Gita data (separate section)
```

## Key Architecture Concepts

### 1. Data Model

**Sutra Identification**: `{adhyaya}.{pada}.{sutra}` (e.g., "1.1.1")

**Data Files**:
- `bs.csv`: Main index (columns: adhyaya, pada, sutraNumber, sutraText, adhikarana)
- `sutra-details.json`: Nested structure:
  ```json
  {
    "1.1.1": {
      "Part#1": {
        "भाष्यम्": {"moola": "..."},
        "तत्त्वप्रकाशिका": {"moola": "..."},
        ...
      }
    }
  }
  ```
- `Author.csv`: Maps commentary names to authors (columns: Grantha, Commentry_Name, Author_Name, Image_Name)

**Multi-Part Sutras**: Some sutras have multiple parts (Part#1, Part#2, etc.) for lengthy commentaries.

**Translation Fields**: Translations stored as `{Language}_Translation` (e.g., Ka_Translation, Te_Translation)

### 2. Git Submodules

**transliterate-library** and **sanskrit-search-library** are git submodules (separate repositories). They are:
- Standalone libraries (can be used in other projects)
- Have their own package.json and versioning
- Published to npm: `devanagari-transliterate`, `sanskrit-search-library`

**Working with submodules**:
```bash
# Clone with submodules
git clone --recurse-submodules <repo-url>

# Update submodules
git submodule update --remote

# Commit changes in submodule
cd transliterate-library
git add . && git commit -m "message"
git push
cd ..
git add transliterate-library
git commit -m "Update submodule"
```

### 3. Multi-Language Transliteration

Handled by `transliterate-library/transliterate.js`:
- **Generic engine**: Language-agnostic transliteration logic
- **Script configs**: `scripts/{language}-script.js` with character mappings
- **Supported**: Kannada, Telugu, Tamil, Malayalam, Bengali, Gujarati, Odia, English
- **Smart features**: Anusvara normalization, compound letters (क्ष, ज्ञ, श्र), final nasal conversion

**Usage in code**:
```javascript
const transliterated = transliterate(text, 'sa', 'kn'); // Sanskrit → Kannada
```

### 4. Sanskrit Search System

Handled by `sanskrit-search-library/sanskrit-search.js`:
- **Sandhi-aware**: Handles 26+ sandhi transformation rules
- **Precision modes**:
  - With ending marks (नारायणं) → exact match
  - Without endings (नारायण) → matches all forms
- **Two-step API**:
  ```javascript
  const results = sanskritSearcher.search(searchTerm, text);
  const highlightedHTML = sanskritSearcher.highlightMatches(text, results.matches);
  ```

**Search persistence**: Searches persist across pagination via `vyakhyanaSearchTerms` object.

### 5. Performance Optimizations

**Caching** (performance-utils.js):
- `transliterationCache`: LRU cache for transliteration results
- `sutraDataCache`: LRU cache for sutra data
- Debounced search handlers (300ms delay)

**Virtual scrolling** (virtual-scroller.js):
- Enabled for texts > 5000 lines
- Lazy rendering of visible lines only

**Lazy loading**:
- Background images (watermarks) loaded on scroll

### 6. Admin Panel Features

**Authentication**: SHA-256 hashed password (configured in config.js)

**Rich Text Editor**:
- Custom contenteditable-based editor
- Color palettes, formatting, alignment
- Configured via `EDITOR_CONFIG` in config.js

**Data Management**:
- Add/edit/delete sutras and commentaries
- Multi-part sutra support
- Translation management per field
- Personal notes (व्यक्तिगत-टिपाणी) with yellow background

**Save**: Downloads modified JSON (no backend—user must manually replace file)

## Common Development Tasks

### Testing Transliteration Changes

```bash
# Navigate to submodule
cd transliterate-library

# Make changes to scripts/*.js or transliterate.js

# Test in demo page
# Open transliterate-library/demo.html in browser

# Commit and update
git add . && git commit -m "Update transliteration"
cd ..
git add transliterate-library
```

### Testing Sanskrit Search Changes

```bash
# Navigate to submodule
cd sanskrit-search-library

# Make changes to sanskrit-search.js or sandhi-rules.js

# Test in demo page
# Open sanskrit-search-library/demo.html in browser

# Run tests
# Open sanskrit-search-library/test/pratika-identifier-test.html
```

### Data Import (Web Scraping)

Located in `dataimport/`:

```bash
cd dataimport

# Install dependencies (first time only)
pip install -r requirements.txt

# Create custom scraper from template
cp template/scraper_template.py my_scraper.py
# Edit my_scraper.py (see dataimport/START_HERE.md)

# Run scraper
python my_scraper.py

# Post-process data
python utilities/replace_dandas.py      # Normalize dandas (।। → ॥)
python utilities/cleanup_whitespace.py  # Clean newlines
```

**Important**: Read `dataimport/START_HERE.md` for detailed scraping workflow.

**Scraping Session Summary**: See `dataimport/SCRAPING_SESSION_SUMMARY.md` for:
- Complete documentation of adhikarana scraping workflow
- Multi-part sutra detection via article link counting
- Tools: `scrape_adhikarana_v4.py`, `merge_adhikarana.py`, `find_missing_sutra.py`
- Current progress: 19/562 sutras complete (1.1.1-1.1.19)
- **Process**: Each adhikarana (topic group) must be scraped individually from its unique URL on dvaitavedanta.in
- The scraping requires going through each adhikarana page to pull all commentary data

### Modifying Configuration

Edit `config.js` to change:
- Editor colors and features (`EDITOR_CONFIG`)
- Admin password hash (`ADMIN_PASSWORD_HASH`)
- UI colors and spacing (`UI_CONFIG`)
- Data file paths (`DATA_CONFIG`)
- Standard vyakhyanas (`STANDARD_VYAKHYANAS`)

## Data Format Notes

### CSV Format (bs.csv, Author.csv)

- **Encoding**: UTF-8 (supports Devanagari)
- **Quoted fields**: Commentary names in Devanagari are quoted
- **Parsing**: Use custom CSV parser that handles quoted fields (see admin.html parseCSV function)

### JSON Format (sutra-details.json)

- **Encoding**: UTF-8 with `ensure_ascii=False` when writing
- **Indentation**: 2 spaces
- **Keys**: Always use Sanskrit (Devanagari) for vyakhyana keys
- **Backup before editing**: Always create timestamped backups

### Cleaning Data

When removing author fields or making bulk changes:
```bash
cd gita  # or relevant data directory
python cleanup_script.py  # See AUTHOR_CSV_MIGRATION.md for reference
```

Always:
1. Create backup with timestamp
2. Preserve UTF-8 encoding
3. Verify file size reduction makes sense
4. Test in browser after cleanup

## Important Code Patterns

### Global State Management

Key global variables in `bs.js`:
- `allSutras`: Full sutra list
- `sutraDetails`: Commentary content
- `authorMap`: Author data from CSV
- `currentLanguage`: Current display language
- `selectedVyakhyanaKeys`: Set of selected commentaries
- `vyakhyanaPagination`: Pagination state per commentary
- `vyakhyanaSearchTerms`: Search terms per commentary

### Vyakhyana (Commentary) Identification

Always use **key name** (e.g., "भाष्यम्"), not position/index.

Data attributes:
```html
<div data-vyakhyana-num="1" data-vyakhya-key="भाष्यम्">
```

### Cross-Reference Highlighting

On text selection in one commentary:
1. Extract selected text
2. Search in all other open commentaries (300ms debounce)
3. Auto-populate search boxes
4. Clear on deselection (click elsewhere)

### Translation Storage

Translations stored alongside moola text:
```json
{
  "भाष्यम्": {
    "moola": "Sanskrit text",
    "Ka_Translation": "Kannada translation",
    "Te_Translation": "Telugu translation"
  }
}
```

## File Naming Conventions

- **Timestamps**: `YYYYMMDD_HHMMSS` (e.g., `sutra-details-backup-20260105_143304.json`)
- **CSV files**: Snake_case with Devanagari support
- **JSON files**: Kebab-case
- **Scripts**: Snake_case for Python, camelCase for JavaScript

## Documentation Files

- `FRAMEWORK_DOCUMENTATION.md`: Comprehensive feature documentation (~78KB)
- `PERFORMANCE.md`, `PERFORMANCE_INTEGRATION.md`: Performance optimization guides
- `AUTHOR_CSV_MIGRATION.md`: Example of data migration process
- `RELEASE_NOTES.md`: Version history
- `DATA_FILLING_GUIDE.md`: **⭐ Complete guide for filling remaining sutra data**
- `DATA_PROGRESS.md`: Progress tracker for data completion
- `dataimport/START_HERE.md`: Quick start for web scraping
- `dataimport/README.md`: Complete scraping toolkit documentation
- `dataimport/SCRAPING_SESSION_SUMMARY.md`: **⭐ Adhikarana scraping workflow and progress (19/562 sutras complete)**

## Git Workflow

**Main branch**: `main`
**Current branch**: `V1_0_7`

**Version tagging**: Use format `v1.0.x` (e.g., `v1.0.7`)

**Commit messages**: Follow format used in recent commits:
- "Update {feature}" for enhancements
- "Add {feature}" for new functionality
- "Fix {issue}" for bug fixes
- "Refactor {component}" for code improvements

**Submodule updates**: When changing submodules, always commit the submodule first, then update the parent repo.

## Browser Compatibility

Target: Modern browsers (Chrome, Firefox, Edge, Safari)
- Uses ES6+ features (arrow functions, Set, Map, template literals)
- No polyfills—assumes modern browser environment
- contenteditable API for rich text editing
- Web Speech API for text-to-speech
- Audio API for sutra recitations

## Debugging

**Console logs**: Look for:
- "Author.csv loaded successfully" (on startup)
- "Sanskrit Search Module loaded" (on startup)
- Virtual scrolling status messages

**Common issues**:
- CORS errors → Must use web server, not file://
- "authorMap undefined" → Check Author.csv loading
- Search not highlighting → Verify Sanskrit Search Module loaded
- Watermarks not showing → Check image paths in Author.csv

## Important Principles

1. **No external dependencies**: Pure vanilla JS, no npm/build process for main app
2. **UTF-8 everywhere**: Always use UTF-8 encoding for Devanagari support
3. **Backup before bulk changes**: Create timestamped backups of data files
4. **Test incrementally**: When scraping, test on 1-2 items before full scrape
5. **Submodules are separate**: Treat transliterate-library and sanskrit-search-library as independent codebases
6. **Performance matters**: Large texts (commentaries) need virtual scrolling and caching

# Release Notes

## Version 1.0.3 - December 30, 2025

### UI/UX Refinements
- **Updated**: Next Sutra button (>>) tooltip changed from "Next Vyakhyana" to "Next Sutra" for clarity

### Adhikarana Popup Enhancements
- **New**: Interactive glossary system with info icons for philosophical terms
  - Generic terms (Brahman, moksha, karma, etc.) auto-detected with tooltips
  - Contextual tooltips for specific terms with custom explanations
  - Hover over ℹ️ icons to see detailed explanations
- **New**: Section tooltips for Sanskrit terminology (विषयः, संशयः, पूर्वपक्षः, सिद्धान्तः, प्रयोजनम्)
- **New**: Info icon next to adhikarana name indicating clickable content
- Increased popup width from 600px to 900px for better readability
- More flexible responsive design (90% of screen width up to 900px max)
- All tooltip definitions stored in adhikarana-details.json for easy maintenance

### Text Corrections
- **Fixed**: Sanskrit spelling corrected from "संस्कृतभ" to "संस्कृतम्" in language dropdown
- **Fixed**: Commentary name corrected from "तत्वप्रकाशः" to "तत्त्वप्रकाशिका"

### Navigation Improvements
- **Fixed**: Navigation button states now properly disable/enable based on position
- `<<` and `>>` buttons disabled at first/last sutra respectively (regardless of part)
- `<` and `>` buttons disabled at first/last part of first/last sutra respectively
- Fixed type comparison bug preventing proper button state detection
- Added visual opacity feedback (30%) for disabled buttons

### Cross-Reference Highlighting
- Select any text in one commentary to automatically search and highlight it across all other open commentaries
- Perfect for comparative study across multiple vyākhyānas
- **Fixed**: Highlights now properly clear when text is deselected (click elsewhere)
- Highlights automatically appear on selection and disappear on deselection

### Search Persistence
- Search terms now remain active when navigating between pages
- No need to re-enter searches after page changes

### Library Organization
- Renamed `sanskrit-search` folder to `sanskrit-search-library` for consistency with `transliterate-library`
- Both libraries now follow consistent naming convention
- Configured as git submodules for better dependency management

### Bug Fixes
- Fixed pagination corruption when searching
- Fixed search highlighting not persisting across page navigation
- Fixed boundary errors when content has different page counts
- **Fixed**: Search transliteration bug - searches now work correctly in all transliterated languages (Kannada, Telugu, etc.)
- **Fixed**: Page navigation button state bug - Previous/Next buttons now update correctly when navigating between pages
- **Fixed**: Search box text clearing on click - search terms now persist when clicking in the search input field

---

## December 25, 2025

### Auto-Hide Headers
- Headers automatically hide when scrolling down, reappear when scrolling up
- Global toggle to enable/disable auto-hide behavior
- Maximizes reading space while keeping navigation accessible

### Sticky Resize Handles
- Green vertical resize handles between vyākhyānas
- Always visible for easy adjustment of column widths
- Smooth resizing experience

### Footer Timestamp
- Displays last build date/time in Indian Standard Time (IST)
- Auto-updates during build process
- Helps users know when content was last updated

### Dynamic Watermark System
- Displays सूत्र number as watermark behind text
- Bottom title toggle for additional context
- Hybrid pagination improvements

---

## December 24, 2025

### 'All' Mode for Vyākhyāna Selection
- Select "All" to view every available commentary simultaneously
- Maintains selection state when navigating between sūtras
- Track by key names instead of positions for reliable persistence

### Code Refactoring
- Improved code structure for better maintainability
- Enhanced readability across modules

---

## December 23, 2025 - Version 1.0.0

### Transliteration System
- Complete transliteration support with Kannada script
- Toggle between Devanagari and regional scripts
- Instant script switching

### Telugu Language Support
- Added Telugu script mapping
- UI translations for Telugu
- Full Telugu interface support

### Enhanced Search Features
- Support for searching transliterated text
- Unicode normalization for accurate matching
- Works across both Devanagari and transliterated content

### UI Improvements
- Disabled dropdowns in detail view for cleaner interface
- Hidden search box when not needed
- Removed duplicate files

---

## December 21, 2025

### Initial Release
- Multi-commentary display system
- Basic Sanskrit search functionality
- Pagination support for long commentaries
- Data corrections for Adhyāya 1 sūtras

# Release Notes

## Version 1.0.3 - January 1, 2026

### Vyākhyāna Resize Handle Fix
- **Fixed**: Green resize handles between vyākhyānas now always visible (30% opacity)
- **Fixed**: Changed positioning from sticky to relative for better reliability
- **Enhanced**: Handles easier to find and interact with when multiple vyākhyānas are open
- Full opacity on hover for clear visual feedback

### Personal Notes Feature
- **New**: Added personal study notes functionality at sutra level
- Notes appear as first commentary item with customizable heading
- Click header to open popup modal with full notes content
- **Enhanced**: Wider popup (1400px) for better readability
- **Enhanced**: Draggable popup - click and hold header to move
- **Enhanced**: Resizable popup - drag from bottom-right corner
- **Enhanced**: Auto-updates when language is changed
- Supports multi-language translations with automatic transliteration fallback
- Flexible heading names - displays as defined in data
- Always visible regardless of vyākhyāna selection

### UI/UX Refinements
- **Updated**: Next Sutra button (>>) tooltip changed from "Next Vyakhyana" to "Next Sutra" for clarity

### Adhikarana Popup Enhancements
- **New**: Interactive glossary with info icons (ℹ️) for philosophical terms
- **New**: Tooltips for Sanskrit terminology sections
- **New**: Info icon next to adhikarana name indicating clickable content
- **Enhanced**: Wider popup (900px) for better readability
- Responsive design adapts to screen size

### Text Corrections
- **Fixed**: Sanskrit spelling corrected from "संस्कृतभ" to "संस्कृतम्" in language dropdown
- **Fixed**: Commentary name corrected from "तत्वप्रकाशः" to "तत्त्वप्रकाशिका"

### Navigation Improvements
- **Fixed**: Navigation buttons now properly enable/disable based on position
- First/last position detection works correctly across all parts
- Visual feedback (reduced opacity) for disabled buttons

### Cross-Reference Highlighting
- Select text in one commentary to automatically highlight it across all open commentaries
- Perfect for comparative study across multiple vyākhyānas
- **Fixed**: Highlights now properly clear when clicking elsewhere

### Search Persistence
- Search terms remain active when navigating between pages

### Library Organization
- Renamed libraries for consistency and better organization
- Configured as git submodules for dependency management

### Bug Fixes
- **Fixed**: Search transliteration now works correctly in all languages
- **Fixed**: Page navigation buttons update correctly
- **Fixed**: Search text no longer clears when clicking in search box
- **Fixed**: Pagination corruption during search
- **Fixed**: Search highlighting persists across page navigation
- **Fixed**: Boundary errors with different page counts

---

## December 25, 2025

### Auto-Hide Headers
- Headers auto-hide when scrolling down, reappear when scrolling up
- Global toggle to enable/disable behavior
- Maximizes reading space

### Sticky Resize Handles
- Vertical resize handles between vyākhyānas always visible
- Easy adjustment of column widths

### Footer Timestamp
- Displays last build date/time in IST
- Auto-updates during build process

### Dynamic Watermark System
- Displays सूत्र number as watermark
- Bottom title toggle for context

---

## December 24, 2025

### 'All' Mode for Vyākhyāna Selection
- Select "All" to view all available commentaries simultaneously
- Selection persists when navigating between sūtras

### Code Refactoring
- Improved code structure and readability

---

## December 23, 2025 - Version 1.0.0

### Transliteration System
- Complete transliteration support with multiple regional scripts
- Toggle between Devanagari and regional scripts
- Instant script switching

### Telugu Language Support
- Full Telugu script and interface support

### Enhanced Search Features
- Search works across both Devanagari and transliterated content
- Unicode normalization for accurate matching

### UI Improvements
- Cleaner interface in detail view
- Removed duplicate files

---

## December 21, 2025

### Initial Release
- Multi-commentary display system
- Basic Sanskrit search functionality
- Pagination support for long commentaries
- Data corrections for Adhyāya 1 sūtras

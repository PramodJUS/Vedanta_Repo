# Multi-Language Content Framework Documentation

## Last Updated
**Version 1.0.3** - January 1, 2026

---

## Overview
This framework provides a flexible, scalable solution for displaying multi-language content with dynamic structure detection, advanced navigation, and state management - all implemented in vanilla JavaScript without external dependencies.

---

## Core Features

### 1. Sanskrit Search System with Cross-Reference Highlighting

#### Overview
Advanced Sanskrit text search with sandhi-aware matching, precision controls, search persistence across pagination, and automatic cross-reference highlighting between multiple commentaries with proper cleanup on deselection.

#### Key Features

**1. Sandhi-Aware Search**
- Integrates with pre-existing ~900-line Sanskrit Search Module
- Handles 26+ sandhi transformation rules
- Finds variations: searching "नारायण" matches "नारायणं", "नारायणः", "नारायणस्य", etc.
- Smart ending detection with Sanskrit diacritic marks: `[ंःँािीुूेैोौृॄॢॣ्ᳵᳶ]`

**2. Precision Matching Mode**
- Search with ending marks = exact match only
- "नारायणं" (with anusvara) → matches only "नारायणं"
- "नारायण" (without ending) → matches all forms
- User-controlled precision via search term format

**3. Search Persistence Across Pagination**
- Search terms stored per vyakhyana in global state
- Automatically reapplied when navigating between pages
- Works with both arrow buttons and radio button page selection
- Highlights appear instantly on page change

**4. Cross-Reference Auto-Highlighting**
- Select text in one vyakhyana → automatically searches in all others
- 300ms debounce for stable text selection
- Populates search boxes automatically
- Real-time highlighting across multiple open commentaries
- Perfect for comparative textual analysis

**5. Highlight Cleanup on Deselection (NEW - Dec 26, 2025)**
- Clicking elsewhere automatically clears all cross-reference highlights
- Restores original unhighlighted text from sessionStorage
- Clears search boxes in all commentaries
- Complete bidirectional cycle: highlight on selection → clear on deselection

#### Implementation Architecture

**Global State Management:**
```javascript
// Search term storage (key: "vyakhyanaNum-vyakhyaKey")
let vyakhyanaSearchTerms = {}; 

// Pagination state
let vyakhyanaPagination = {};

// Example storage:
// vyakhyanaSearchTerms['1-भाष्यम्'] = 'नारायणं'
// vyakhyanaPagination['1-भाष्यम्'] = 0  // page index
```

**Data Attributes on DOM Elements:**
```html
<div class="commentary-item" 
     data-key="भाष्यम्" 
     data-vyakhyana-num="1" 
     data-vyakhya-key="भाष्यम्">
     
    <input class="vyakhyana-search-box"
           data-vyakhyana-num="1"
           data-vyakhya-key="भाष्यम्"
           oninput="searchInVyakhyana(this.dataset.vyakhyanaNum, 
                                      this.dataset.vyakhyaKey, 
                                      this.value)">
    
    <p class="commentary-text" 
       data-pages='["page1 content", "page2 content"]'>
        <!-- Content here -->
    </p>
</div>
```

**Search API Integration:**
```javascript
// Correct API usage (two-step process)
const results = sanskritSearcher.search(searchTerm, text);
// Returns: {count: number, matches: Array}

if (results.count > 0 && results.matches.length > 0) {
    const highlightedHTML = sanskritSearcher.highlightMatches(text, results.matches);
    contentElement.innerHTML = highlightedHTML;
}

// WRONG API (common mistake to avoid):
// const results = sanskritSearcher.directSearch(text, searchTerm);
// This returns empty array - wrong method for this use case
```

**Search Persistence Flow:**
```javascript
function searchInVyakhyana(vyakhyanaNum, vyakhyaKey, searchTerm) {
    const searchKey = `${vyakhyanaNum}-${vyakhyaKey}`;
    
    // Store search term
    if (searchTerm.trim()) {
        vyakhyanaSearchTerms[searchKey] = searchTerm.trim();
    } else {
        delete vyakhyanaSearchTerms[searchKey];
    }
    
    // Execute search on current page
    const results = sanskritSearcher.search(searchTerm, currentPageText);
    if (results.count > 0) {
        const highlighted = sanskritSearcher.highlightMatches(
            currentPageText, 
            results.matches
        );
        updateDisplay(highlighted);
    }
}

// When user navigates to different page
function changeVyakhyanaPage(sutraNum, vyakhyaKey, direction) {
    // ... pagination logic ...
    
    // Reapply stored search term
    const searchKey = `${sutraNum}-${vyakhyaKey}`;
    const activeSearchTerm = vyakhyanaSearchTerms[searchKey];
    
    if (activeSearchTerm && sanskritSearcher) {
        const results = sanskritSearcher.search(activeSearchTerm, pages[newPage]);
        if (results && results.count > 0 && results.matches.length > 0) {
            const highlightedText = sanskritSearcher.highlightMatches(
                pages[newPage], 
                results.matches
            );
            contentElement.innerHTML = highlightedText.replace(/<PB>/g, '');
        }
    }
}
```

**Cross-Reference Highlighting with Cleanup:**
```javascript
// Clear all highlights and restore original text
function clearCrossReferenceHighlights() {
    const allVyakhyanaItems = document.querySelectorAll('.commentary-item');
    
    allVyakhyanaItems.forEach(item => {
        const vyakhyanaNum = item.dataset.vyakhyanaNum;
        const vyakhyaKey = item.dataset.vyakhyaKey;
        const textElem = item.querySelector('.commentary-text');
        
        if (!textElem) return;
        
        // Get the storage key for this vyakhyana
        const currentPage = window.vyakhyanaStates?.[vyakhyanaNum]?.currentPage || 0;
        const storageKey = `vyakhyana_${vyakhyaKey}_page${currentPage}_original`;
        
        // Restore original text from storage
        const originalText = sessionStorage.getItem(storageKey);
        if (originalText) {
            textElem.innerHTML = originalText;
        }
        
        // Clear search box
        const searchBox = item.querySelector('.vyakhyana-search-box input');
        if (searchBox) {
            searchBox.value = '';
        }
    });
}

function setupCrossReferenceHighlighting() {
    let selectionTimeout;
    
    document.addEventListener('mouseup', function(e) {
        if (selectionTimeout) {
            clearTimeout(selectionTimeout);
        }
        
        // Wait for selection to stabilize
        selectionTimeout = setTimeout(() => {
            const selection = window.getSelection();
            const selectedText = selection.toString().trim();
            
            if (selectedText.length >= 2) {
                let targetElement = selection.anchorNode;
                if (targetElement.nodeType === Node.TEXT_NODE) {
                    targetElement = targetElement.parentElement;
                }
                
                // Find which vyakhyana the selection is in
                const vyakhyanaTextDiv = targetElement?.closest('.commentary-text');
                if (vyakhyanaTextDiv) {
                    const commentaryItem = vyakhyanaTextDiv.closest('.commentary-item');
                    const sourceVyakhyanaNum = commentaryItem?.dataset.vyakhyanaNum;
                    const sourceVyakhyaKey = commentaryItem?.dataset.vyakhyaKey;
                    
                    // Search in all OTHER vyakhyanas
                    const allVyakhyanaItems = document.querySelectorAll('.commentary-item');
                    allVyakhyanaItems.forEach(item => {
                        const vyakhyanaNum = item.dataset.vyakhyanaNum;
                        const vyakhyaKey = item.dataset.vyakhyaKey;
                        
                        // Skip source vyakhyana
                        if (vyakhyanaNum === sourceVyakhyanaNum) return;
                        
                        // Auto-populate search box and execute search
                        const searchBox = item.querySelector('.vyakhyana-search-box input');
                        if (searchBox) {
                            searchBox.value = selectedText;
                            searchInVyakhyana(vyakhyanaNum, vyakhyaKey, selectedText);
                        }
                    });
                }
            } else {
                // Selection cleared - remove all cross-reference highlights
                clearCrossReferenceHighlights();
            }
        }, 300); // 300ms debounce
    });
}
```

**Note**: The highlighting function now saves original text to `sessionStorage` before applying highlights, enabling proper cleanup when the user deselects text.

**CSS Highlighting:**
```css
.search-highlight {
    background-color: yellow;
    font-weight: bold;
}
```

#### Critical Bug Fixes Implemented

**1. Pagination Key Format Mismatch**
- **Problem**: Search created keys like "1.1.1-भाष्यम्" but pagination used "1-भाष्यम्"
- **Symptom**: Searching on page 2 for page 1 content corrupted page 2 display
- **Solution**: Standardized to `${vyakhyanaNum}-${vyakhyaKey}` format throughout
- **Impact**: Eliminated pagination corruption completely

**2. Wrong API Method Usage**
- **Problem**: Used `directSearch()` which returned empty array `[]`
- **Symptom**: Search persistence didn't work - highlights disappeared on page change
- **Solution**: Changed to correct two-step process: `search()` + `highlightMatches()`
- **Impact**: Search persistence now works perfectly

**3. Selector Mismatch**
- **Problem**: Code looked for `.commentary-section` but DOM used `.commentary-item`
- **Symptom**: Cross-reference feature couldn't find parent containers
- **Solution**: Updated selectors to `.commentary-item` and added `data-vyakhyana-num` attribute
- **Impact**: Cross-reference auto-highlighting now functional

**4. Search Box Selector**
- **Problem**: Selected `.vyakhyana-search-box` (div) instead of the input element
- **Symptom**: Couldn't set `value` property on div
- **Solution**: Changed to `.vyakhyana-search-box input`
- **Impact**: Search boxes now populate correctly

**5. Pagination Boundary Protection**
- **Problem**: Navigating to content with fewer pages caused array index out of bounds
- **Symptom**: `Cannot read properties of undefined (reading 'replace')` errors
- **Solution**: Added bounds checking before accessing page arrays
```javascript
let currentPage = vyakhyanaPagination[paginationKey];
if (currentPage >= totalPages) {
    currentPage = 0;
    vyakhyanaPagination[paginationKey] = 0;
}
// Now safe to access pages[currentPage]
```

**6. JavaScript Syntax Errors**
- **Problem**: Unclosed comment block and orphaned event listener code
- **Symptom**: Console errors, features not working
- **Solution**: Removed orphaned 70 lines of code, fixed comment syntax
- **Impact**: Clean console, all features operational

#### User Experience Benefits

1. **Comparative Study**: Select word in one commentary, see it highlighted in all others
2. **Contextual Reading**: Search persists as you navigate through pages
3. **Flexible Precision**: Control match accuracy via search term format
4. **No Data Loss**: Pagination changes don't clear your searches
5. **Multi-Commentary Analysis**: Study word usage across different authors simultaneously
6. **Sandhi Intelligence**: Find words even when they change form due to sandhi rules

#### Performance Considerations

- **Debounced Selection**: 300ms timeout prevents performance issues with rapid mouse movements
- **Efficient Highlighting**: Uses DOM innerHTML replacement, not node-by-node manipulation
- **State Persistence**: localStorage prevents repeated searches on page reload
- **Lazy Search**: Only executes when search term changes or page changes
- **Selective Targeting**: Only searches in commentary text, not headers or metadata

#### Integration Requirements

**Required Files:**
```
sanskrit-search/
  ├── sandhi-rules.js       (~400 lines - sandhi transformation rules)
  └── sanskrit-search.js     (~500 lines - search engine and highlighter)

index.html:
  <script src="sanskrit-search-library/sandhi-rules.js"></script>
  <script src="sanskrit-search-library/sanskrit-search.js"></script>
```

**Global Objects:**
```javascript
// Instantiated in bs.js
const sanskritSearcher = new SanskritSearcher();

// State containers
let vyakhyanaSearchTerms = {};    // Line 16
let vyakhyanaPagination = {};      // Line 15
```

**DOM Structure Requirements:**
- `.commentary-item` containers with `data-vyakhyana-num` and `data-vyakhya-key`
- `.commentary-text` elements containing the actual text content
- `.vyakhyana-search-box input` elements for search input fields
- Proper parent-child hierarchy for `.closest()` traversal

#### Testing Checklist

- [x] Search in one vyakhyana while on page 1
- [x] Navigate to page 2 - search persists
- [x] Navigate back to page 1 - search still active
- [x] Search with ending mark (exact match) - only exact matches highlighted
- [x] Search without ending (fuzzy match) - all variations highlighted
- [x] Select text in vyakhyana 1 - automatically highlights in vyakhyana 2
- [x] Select text in vyakhyana 2 - automatically highlights in vyakhyana 1
- [x] Open 3 vyakhyanas - selection highlights in all except source
- [x] Pagination at boundaries - no corruption of content
- [x] Navigate between different sutras - search state independent per sutra
- [x] Clear search box - highlights removed immediately

---

### 2. Dynamic Multi-Language Support System

#### Transliteration Engine
- Real-time conversion between scripts (Devanagari ↔ Kannada/Telugu/Tamil/Malayalam/Gujarati/Odia/Bengali)
- Bidirectional text transformation
- Character mapping tables for each script
- Support for combining marks and ligatures

#### Language Switching
- Seamless UI and content language changes
- No page reload required
- Instant content re-rendering
- Synchronized dropdown and button text updates

#### Translation Fallback Chain
1. Primary language-specific translation
2. English translation
3. Sanskrit (Devanagari) original text
4. Transliterated Sanskrit to target script

**Implementation:**
```javascript
function getLocalizedContent(data, language) {
    const langMap = {
        'kn': 'Ka_Translation',
        'te': 'Te_Translation',
        'en': 'En_Translation',
        'sa': 'moola'
    };
    const translationKey = langMap[language];
    
    if (translationKey && data[translationKey]) {
        return data[translationKey];
    } else if (data['moola']) {
        return language !== 'sa' ? 
               transliterateText(data['moola'], language) : 
               data['moola'];
    }
    return '';
}
```

---

### 2. Intelligent Content Detection & Auto-Discovery

#### Structure-Based Detection
- Identifies content sections by examining object properties
- No dependency on specific key names or naming patterns
- Works with any JSON structure that follows consistent property patterns

#### Key Features:
- **Property-Based Validation**: Uses `hasOwnProperty()` checks
- **Exclude List Pattern**: Filters out metadata/configuration keys
- **Flexible Schema**: Adapts to different content structures
- **No Hard-Coded Patterns**: Works with arbitrary key names

**Implementation Pattern:**
```javascript
function detectContentSections(data) {
    const excludeKeys = [
        'meaning', 'meaningKn', 'meaningTe', 
        'meaningDetails', 'meaningDetailsKn', 'meaningDetailsTe',
        'commentary', 'commentaryKn', 'commentaryTe'
    ];
    
    const contentKeys = Object.keys(data).filter(key => {
        if (excludeKeys.includes(key)) return false;
        const value = data[key];
        return value && typeof value === 'object' && 
               (value.hasOwnProperty('moola') || 
                value.hasOwnProperty('Ka_Translation') || 
                value.hasOwnProperty('Te_Translation') || 
                value.hasOwnProperty('En_Translation'));
    });
    
    return contentKeys.map((key, index) => ({
        num: index + 1,
        key: key
    }));
}
```

---

### 3. Advanced Navigation System

#### Features:
- **Bidirectional Navigation**: Previous/Next buttons with boundary detection
- **State Persistence**: Remembers which sections were open
- **Name-Based State Tracking**: Tracks by actual key names, not positions
- **View-Dependent UI**: Shows/hides navigation based on current view
- **Auto-Scroll**: Focuses on previously opened content after navigation
- **Disabled States**: Buttons disabled at first/last items

#### State Preservation Pattern:
```javascript
function navigateToNext() {
    // Capture current state by key names
    const openSectionsSnapshot = Array.from(openSections);
    
    // Navigate to new content
    showContent(nextItem);
    
    // Restore state after DOM renders
    setTimeout(() => {
        const newData = getCurrentData();
        const availableKeys = detectContentSections(newData);
        
        openSectionsSnapshot.forEach(keyName => {
            if (newData[keyName]) {
                const position = availableKeys.findIndex(k => k.key === keyName) + 1;
                openSection(position, keyName);
            }
        });
    }, 100);
}
```

---

### 4. Multi-Select Filtering System

#### Features:
- **"All" Checkbox**: Master control with visual distinction (grey background)
- **Dynamic Options**: Auto-populates based on available content
- **Synchronized State**: "All" checkbox reflects individual selections
- **Selection Persistence**: Maintains choices via localStorage
- **Real-Time Updates**: Immediate content filtering

#### Master Checkbox Pattern:
```javascript
function setupMasterCheckbox(allCheckbox, individualCheckboxes) {
    // Master controls individuals
    allCheckbox.addEventListener('change', () => {
        const isChecked = allCheckbox.checked;
        individualCheckboxes.forEach(cb => {
            cb.checked = isChecked;
        });
        updateContent();
    });
    
    // Individuals update master
    individualCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            const allChecked = Array.from(individualCheckboxes)
                .every(cb => cb.checked);
            allCheckbox.checked = allChecked;
            updateContent();
        });
    });
}
```

#### CSS Styling:
```css
.dropdown-content label {
    background-color: white;
}

.dropdown-content label.all-checkbox {
    background-color: #e8e8e8;
}

.dropdown-content label.all-checkbox:hover {
    background-color: #d8d8d8;
}
```

---

### 5. Collapsible Content Sections

#### Features:
- **Toggle Mechanism**: Click to expand/collapse
- **Visual Indicators**: ▼ (collapsed) / ▲ (expanded)
- **State Tracking**: Maintains open/closed state
- **Smooth Animations**: CSS transitions
- **Multiple Sections**: Independent state for each
- **Auto-Restore**: Reopens previously viewed sections

#### Implementation:
```javascript
// Global state
const openSections = new Set(); // Stores key names

function toggleSection(position, keyName) {
    const content = document.getElementById(`section-${position}`);
    const toggle = document.getElementById(`toggle-${position}`);
    
    if (content.style.display === 'none') {
        content.style.display = 'block';
        toggle.textContent = '▲';
        openSections.add(keyName);
    } else {
        content.style.display = 'none';
        toggle.textContent = '▼';
        openSections.delete(keyName);
    }
}
```

---

### 6. Responsive Multi-View Interface

#### View Types:
1. **List View**: Grid-based content browser with filtering
2. **Detail View**: Focused single-item display

#### Features:
- **Header Collapse**: Expandable/collapsible header
- **Conditional Elements**: UI components show/hide based on view
- **State Management**: Different UI states for different views
- **Smooth Transitions**: CSS animations between views

#### View Switching Pattern:
```javascript
function showDetailView(item) {
    currentView = 'detail';
    
    // Hide list elements
    listContainer.style.display = 'none';
    filterDropdowns.style.display = 'none';
    searchInput.style.display = 'none';
    
    // Show detail elements
    detailContainer.style.display = 'block';
    navigationButtons.style.display = 'flex';
    
    // Render content
    renderDetailContent(item);
}

function showListView() {
    currentView = 'list';
    openSections.clear();
    
    // Show list elements
    listContainer.style.display = 'flex';
    filterDropdowns.style.display = 'flex';
    searchInput.style.display = 'block';
    
    // Hide detail elements
    detailContainer.style.display = 'none';
    navigationButtons.style.display = 'none';
}
```

---

## Critical Technical Implementation Areas

### 1. State Management Without Framework

**Challenge**: Managing complex application state in vanilla JavaScript without React/Vue/Angular

**Solution Components**:
- Global state objects (Set, Array, Object)
- State capture before operations
- State restoration with DOM synchronization
- LocalStorage integration for persistence
- Event-driven state updates

**Key Pattern**:
```javascript
// State containers
const openSections = new Set();
const selectedFilters = [];
let currentView = 'list';
let currentItem = null;

// State capture
function captureState() {
    return {
        openSections: Array.from(openSections),
        selectedFilters: [...selectedFilters],
        currentView: currentView
    };
}

// State restoration
function restoreState(snapshot) {
    openSections.clear();
    snapshot.openSections.forEach(key => openSections.add(key));
    selectedFilters = [...snapshot.selectedFilters];
    currentView = snapshot.currentView;
    
    // Sync with DOM
    syncDOMWithState();
}

// Persist to localStorage
function saveState() {
    localStorage.setItem('appState', JSON.stringify({
        selectedFilters: selectedFilters
    }));
}
```

---

### 2. Dynamic Object Structure Detection

**Challenge**: Detect content sections without knowing key names in advance, supporting any naming convention

**Solution**:
```javascript
function detectDynamicContent(data, config = {}) {
    const {
        excludeKeys = [],
        requiredProperties = ['moola', 'translation'],
        metadataPattern = /^(meaning|commentary|metadata)/
    } = config;
    
    return Object.keys(data).filter(key => {
        // Skip excluded keys
        if (excludeKeys.includes(key)) return false;
        
        // Skip metadata patterns
        if (metadataPattern.test(key)) return false;
        
        const value = data[key];
        
        // Check if it's an object with required properties
        if (!value || typeof value !== 'object') return false;
        
        // Check for at least one required property
        return requiredProperties.some(prop => 
            value.hasOwnProperty(prop)
        );
    });
}
```

**Reusable Pattern**:
1. Define exclusion criteria (explicit list + regex patterns)
2. Check object structure, not key names
3. Build index mapping (key name → display position)
4. Use position for DOM element IDs
5. Use key names for state tracking

---

### 3. Cross-Script Text Processing

**Challenge**: Handle multiple writing systems with different character encodings and rendering requirements

**Components**:

#### Character Mapping Tables
```javascript
const scriptMappings = {
    devanagari: {
        'क': 0x0915, 'ख': 0x0916, 'ग': 0x0917,
        // ... complete character set
    },
    kannada: {
        'ಕ': 0x0C95, 'ಖ': 0x0C96, 'ಗ': 0x0C97,
        // ... complete character set
    }
};
```

#### Transliteration Engine
```javascript
function transliterateText(text, targetScript) {
    if (!text) return '';
    
    // Get source and target mappings
    const sourceMap = detectScript(text);
    const targetMap = scriptMappings[targetScript];
    
    // Character-by-character conversion
    let result = '';
    for (let char of text) {
        const unicode = char.charCodeAt(0);
        const sourceChar = findCharInMapping(unicode, sourceMap);
        
        if (sourceChar) {
            const targetChar = targetMap[sourceChar.key];
            result += String.fromCharCode(targetChar);
        } else {
            result += char; // Keep non-translatable chars
        }
    }
    
    return result;
}
```

#### Translation Resolution
```javascript
function getTranslatedText(key, language) {
    // Check translation lookup table
    if (translationLookup[key] && translationLookup[key][language]) {
        return translationLookup[key][language];
    }
    
    // Fallback to transliteration
    const sanskritText = translationLookup[key]['sa'];
    if (sanskritText && language !== 'sa') {
        return transliterateText(sanskritText, language);
    }
    
    return key; // Ultimate fallback
}
```

---

### 4. Event Listener Management in Dynamic Content

**Challenge**: Properly attach and clean up event handlers for dynamically generated elements

**Solutions**:

#### Pattern 1: setTimeout for DOM Ready
```javascript
function renderDynamicContent(data) {
    container.innerHTML = generateHTML(data);
    
    // Wait for DOM to be ready
    setTimeout(() => {
        const elements = document.querySelectorAll('.dynamic-element');
        elements.forEach(el => {
            el.addEventListener('click', handleClick);
        });
    }, 0);
}
```

#### Pattern 2: Event Delegation
```javascript
// Attach once to parent
container.addEventListener('click', (e) => {
    if (e.target.matches('.dynamic-element')) {
        handleClick(e.target);
    }
});
```

#### Pattern 3: Cleanup on View Change
```javascript
function cleanupEventListeners() {
    // Remove specific listeners
    oldElements.forEach(el => {
        el.removeEventListener('click', oldHandler);
    });
    
    // Or replace entire container
    const oldContainer = document.getElementById('container');
    const newContainer = oldContainer.cloneNode(false);
    oldContainer.parentNode.replaceChild(newContainer, oldContainer);
}
```

---

### 5. Name-Based vs Position-Based State Tracking

**Challenge**: Maintain state when content order or availability changes between views

**Evolution**:
1. **Initial**: Position-based (1, 2, 3...) - brittle, breaks when order changes
2. **Improved**: Name-based (actual key names) - stable across changes
3. **Final**: Name-based tracking with position mapping for DOM access

**Critical Issue Solved**:
When tracking by position (e.g., selecting vyakhyana #2), the system would incorrectly maintain that position across different sutras. If sutra 1.1.1 has "तत्वप्रकाशः" at position 2, and sutra 1.1.3 has "व्यख्यानम्-२" at position 2, selecting the first would incorrectly show the second.

**Solution**: Track by actual key names, not positions.

**Implementation**:
```javascript
// Store state by name (stable across navigation)
const selectedVyakhyanaKeys = new Set(['तत्वप्रकाशः', 'भाष्यम्']);

// When rendering new content
function renderSections(data) {
    // Detect available sections dynamically
    const availableSections = detectContentSections(data); // [{num: 1, key: 'भाष्यम्'}, ...]
    
    // Build HTML with data-key attribute for tracking
    const html = availableSections.map(section => `
        <div class="section-item" data-key="${section.key}">
            <input type="checkbox" 
                   value="${section.num}" 
                   data-key="${section.key}"
                   ${selectedVyakhyanaKeys.has(section.key) ? 'checked' : ''}>
            ${section.displayName}
        </div>
    `).join('');
    
    // When user changes selection
    checkboxes.forEach(cb => {
        cb.addEventListener('change', () => {
            if (cb.checked) {
                selectedVyakhyanaKeys.add(cb.dataset.key);
            } else {
                selectedVyakhyanaKeys.delete(cb.dataset.key);
            }
        });
    });
}

// Filter/show content based on key names
function updateVisibility() {
    document.querySelectorAll('.section-item').forEach(item => {
        const key = item.dataset.key;
        item.style.display = selectedVyakhyanaKeys.has(key) ? 'block' : 'none';
    });
}
```

**Why This Matters**:
- Position changes when filtering/sorting
- Different items may have different sections with different names
- "तत्वप्रकाशः" selected in one sutra stays selected in others
- "व्यख्यानम्-२" is a different entity and won't be incorrectly selected
- State must survive content updates
- User experience: remembered preferences persist accurately

---

### 6. Multi-Language Dropdown with Master Control

**Challenge**: Create synchronized multi-select dropdown with "All" checkbox that properly reflects state

**Algorithm**:
```javascript
function updateDropdown(availableItems) {
    const dropdownHTML = `
        <label for="all" class="all-checkbox">
            <input type="checkbox" id="all" value="all" checked>
            ${getAllText()}
        </label>
        ${availableItems.map(item => `
            <label>
                <input type="checkbox" value="${item.num}" checked>
                ${item.displayName}
            </label>
        `).join('')}
    `;
    
    dropdown.innerHTML = dropdownHTML;
    
    // Setup master control
    const allCheckbox = document.getElementById('all');
    const individuals = dropdown.querySelectorAll('input:not(#all)');
    
    allCheckbox.addEventListener('change', () => {
        individuals.forEach(cb => cb.checked = allCheckbox.checked);
        updateState();
    });
    
    individuals.forEach(cb => {
        cb.addEventListener('change', () => {
            allCheckbox.checked = Array.from(individuals).every(c => c.checked);
            updateState();
        });
    });
}
```

**Visual Distinction**:
```css
/* Regular checkboxes - white */
.dropdown-content label {
    background-color: white;
    padding: 10px 15px;
}

/* "All" checkbox - grey */
.dropdown-content label.all-checkbox {
    background-color: #e8e8e8;
    font-weight: 500;
}

.dropdown-content label:hover {
    background-color: #f1f1f1;
}

.dropdown-content label.all-checkbox:hover {
    background-color: #d8d8d8;
}
```

---

### 7. Selection State Persistence with "All Mode" Tracking

**Challenge**: Maintain selection state across navigation while properly handling "select all" scenarios

**Key Concept**: Track both individual selections AND whether "all mode" is active

**Implementation**:
```javascript
// Global state
let selectedVyakhyanaKeys = new Set(); // Individual key names
let selectAllVyakhyanas = true; // Whether "All" mode is active

// Update selection when user changes checkboxes
function updateSelectedVyakhyanas(skipRerender = false) {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]:not(#all)');
    
    // Rebuild selected keys
    selectedVyakhyanaKeys.clear();
    checkboxes.forEach(cb => {
        if (cb.checked) {
            selectedVyakhyanaKeys.add(cb.dataset.key);
        }
    });
    
    // Detect if all are selected
    const totalAvailable = checkboxes.length;
    selectAllVyakhyanas = (selectedVyakhyanaKeys.size === totalAvailable && totalAvailable > 0);
    
    // Persist to localStorage
    localStorage.setItem('selectedVyakhyanaKeys', JSON.stringify(Array.from(selectedVyakhyanaKeys)));
    localStorage.setItem('selectAllVyakhyanas', selectAllVyakhyanas);
}

// When navigating to new content
function updateDropdownForNewContent(availableKeys) {
    // If "All" mode is active, select everything
    if (selectAllVyakhyanas) {
        selectedVyakhyanaKeys = new Set(availableKeys);
    } else {
        // Keep only valid selections
        const validKeys = Array.from(selectedVyakhyanaKeys).filter(key => 
            availableKeys.includes(key)
        );
        selectedVyakhyanaKeys = new Set(validKeys);
        
        // If nothing remains, activate "All" mode
        if (selectedVyakhyanaKeys.size === 0) {
            selectedVyakhyanaKeys = new Set(availableKeys);
            selectAllVyakhyanas = true;
        }
    }
}
```

**Use Cases**:
- User selects specific items → Navigate → Only those items stay selected
- User clicks "All" → Navigate → All available items in new view are selected
- User deselects some items → "All" mode is deactivated
- User manually selects all items → "All" mode is activated

**Benefits**:
- Intuitive behavior: "All" means all in every context
- Partial selections persist correctly by key name
- Graceful handling when selected items don't exist in new context
- State restoration works seamlessly across page reloads

---

### 7. Auto-Hide Headers with Overlay System

#### Features:
- **Global Toggle Control**: User-configurable checkbox in toolbar
- **Smart Overlay**: Headers appear as transparent overlay on hover
- **Position-Sticky Implementation**: Header stays accessible while scrolling content
- **Conditional Hiding**: Only applies when explicitly enabled by user
- **LocalStorage Persistence**: Remembers user preference across sessions
- **Non-Intrusive Hover**: Overlay doesn't shift content below

#### Implementation Pattern:
```javascript
// Global state with localStorage persistence
let autoHideHeaders = localStorage.getItem('autoHideHeaders') === 'true';

// Apply auto-hide class when toggling commentary
function toggleCommentary(num, vyakhyanaKey) {
    const item = content.closest('.commentary-item');
    
    if (content.style.display === 'none') {
        item.classList.add('open');
        if (autoHideHeaders) {
            item.classList.add('auto-hide-enabled');
        }
    } else {
        item.classList.remove('open', 'auto-hide-enabled');
    }
}

// Global toggle function
function toggleAutoHide(checked) {
    autoHideHeaders = checked;
    localStorage.setItem('autoHideHeaders', autoHideHeaders);
    
    // Update all currently open sections
    document.querySelectorAll('.commentary-item.open').forEach(item => {
        if (autoHideHeaders) {
            item.classList.add('auto-hide-enabled');
        } else {
            item.classList.remove('auto-hide-enabled');
        }
    });
}
```

#### CSS Overlay Pattern:
```css
/* Position header absolutely for overlay effect */
.commentary-item.open.auto-hide-enabled .commentary-header {
    position: absolute;
    top: 0;
    left: 10px;
    right: 0;
    z-index: 100;
    min-height: 35px;
    padding: 0 10px 0 0;
    opacity: 0;
    background: transparent;
    transition: all 0.2s ease;
    pointer-events: auto;
}

/* Hide child elements */
.commentary-item.open.auto-hide-enabled .commentary-header > * {
    opacity: 0;
    transition: opacity 0.2s ease;
}

/* Show on hover with semi-transparent background */
.commentary-item.open.auto-hide-enabled .commentary-header:hover {
    opacity: 1;
    padding: 6px 10px 6px 0;
    background: rgba(230, 255, 230, 0.85);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border-radius: 4px;
}

.commentary-item.open.auto-hide-enabled .commentary-header:hover > * {
    opacity: 1;
}
```

**Key Benefits**:
- Content doesn't jump when header appears
- User can scroll and access header without interruption
- Clear visual feedback with greenish transparent background
- Works independently for each section
- Fully optional user preference

---

### 8. Context-Aware Pagination Behavior

#### Features:
- **Dual Pagination Controls**: Top (in header) and bottom (in content)
- **Smart Scrolling**: Only bottom controls trigger scroll-to-top
- **Focus Preservation**: Top controls maintain current scroll position
- **Consistent State**: Both controls stay synchronized
- **Optional Scroll Parameter**: Single function handles both behaviors

#### Implementation:
```javascript
function navigateVyakhyanaPage(sutraNum, vyakhyaKey, direction, event, shouldScroll = false) {
    // ... pagination logic ...
    
    // Update content
    contentElement.innerHTML = pages[newPage].replace(/<PB>/g, '');
    
    // Sync all controls (top and bottom)
    updatePaginationControls(newPage, totalPages);
    
    // Scroll only if requested (from bottom controls)
    if (shouldScroll && commentaryItem) {
        commentaryItem.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// Top controls - no scroll
<button onclick="navigateVyakhyanaPage(${num}, '${key}', -1, event)">

// Bottom controls - with scroll
<button onclick="navigateVyakhyanaPage(${num}, '${key}', -1, event, true)">
```

**User Experience**:
- User navigating from auto-hide header → stays in reading position
- User navigating from bottom → scrolls to top to see new content
- Radio buttons work same way as arrow buttons
- Consistent, predictable behavior

---

### 9. Sticky Resize Handles with Auto-Hide

#### Features:
- **Position Sticky**: Handle stays at top of scrollable content
- **Auto-Hide on Default**: Hidden until user hovers
- **Visual Feedback**: Gradient intensifies on hover
- **High Z-Index**: Always accessible above content
- **Smooth Transitions**: 0.2s opacity fade

#### Implementation:
```css
.resize-handle-top {
    height: 12px;
    width: 100%;
    background: linear-gradient(
        to bottom, 
        transparent 30%, 
        #4CAF50 50%, 
        transparent 70%
    );
    cursor: ns-resize;
    position: relative;  /* Changed from sticky for better reliability */
    top: 0;
    left: 0;
    opacity: 0.3;  /* Always visible at 30% opacity */
    transition: opacity 0.2s;
    z-index: 150;
}

.resize-handle-top:hover {
    opacity: 1;  /* Full opacity on hover */
    background: linear-gradient(
        to bottom, 
        transparent 20%, 
        #4CAF50 50%, 
        transparent 80%
    );
}
```

**Benefits**:
- Always Visible: Subtle 30% opacity ensures users can find resize handles
- Clear Affordance: Green line with cursor change indicates draggability
- Enhanced Hover: Full opacity on hover provides clear visual feedback
- Reliable Positioning: Relative positioning prevents sticky behavior issues with stacked vyākhyānas

---

### 10. Pagination Boundary Protection

#### Challenge:
Navigation between different content items can cause pagination state to become invalid if the new content has fewer pages than the current page index.

#### Solution:
```javascript
// Split content into pages
const pages = splitTextIntoPages(commentaryText, CHARS_PER_PAGE);
const totalPages = pages.length;
const paginationKey = `${num}-${vyakhyaKey}`;

// Initialize pagination state
if (!vyakhyanaPagination[paginationKey]) {
    vyakhyanaPagination[paginationKey] = 0;
}

// Ensure currentPage is within bounds
let currentPage = vyakhyanaPagination[paginationKey];
if (currentPage >= totalPages) {
    currentPage = 0;
    vyakhyanaPagination[paginationKey] = 0;
}

// Now safe to access pages[currentPage]
contentElement.innerHTML = pages[currentPage].replace(/<PB>/g, '');
```

**Why This Matters**:
- Prevents `Cannot read properties of undefined (reading 'replace')` errors
- Gracefully handles content structure changes
- Resets to first page when navigating to shorter content
- Maintains pagination state within valid bounds

---

### 11. Dynamic Watermark System

#### Features:
- **Author-Based**: Automatically loads watermark based on commentary author
- **No CSS Needed**: Watermark applied via JavaScript and inline styles
- **Low Opacity**: Subtle background (0.08) doesn't interfere with reading
- **Absolute Positioning**: Overlays content without affecting layout
- **Conditional Loading**: Only appears when author metadata exists

#### Implementation:
```javascript
// Get author from metadata
const author = vyakhyaData && vyakhyaData.author ? 
               vyakhyaData.author.toLowerCase() : '';

// Create watermark div with inline background-image
const watermarkDiv = author ? 
    `<div class="watermark" style="background-image: url('images/${author}.jpg');"></div>` : 
    '';

// Include in rendered HTML
return `
    <div class="commentary-content">
        ${watermarkDiv}
        <p class="commentary-text">${content}</p>
    </div>
`;
```

```css
.commentary-content .watermark {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-size: contain;
    background-position: center;
    background-repeat: no-repeat;
    opacity: 0.08;
    z-index: 0;
    pointer-events: none;
}
```

**Adding New Authors**:
1. Add author name to JSON metadata: `"author": "AuthorName"`
2. Place image at: `images/authorname.jpg` (lowercase)
3. Watermark appears automatically

**Benefits**:
- No CSS rules needed per author
- Scalable to any number of authors
- Consistent opacity and positioning
- Simple image-based system

---

## Critical Technical Implementation Areas

### Pattern 1: Content Auto-Discovery
**Use Case**: Detect and process content sections with unknown structure

```javascript
class ContentDetector {
    constructor(config = {}) {
        this.excludeKeys = config.excludeKeys || [];
        this.requiredProps = config.requiredProps || ['content'];
        this.metadataPattern = config.metadataPattern || /^_/;
    }
    
    detect(data) {
        return Object.keys(data).filter(key => {
            if (this.excludeKeys.includes(key)) return false;
            if (this.metadataPattern.test(key)) return false;
            
            const value = data[key];
            if (!value || typeof value !== 'object') return false;
            
            return this.requiredProps.some(prop => 
                value.hasOwnProperty(prop)
            );
        });
    }
    
    buildIndex(data) {
        const keys = this.detect(data);
        return keys.map((key, index) => ({
            position: index + 1,
            keyName: key,
            data: data[key]
        }));
    }
}

// Usage
const detector = new ContentDetector({
    excludeKeys: ['metadata', 'config'],
    requiredProps: ['content', 'translation'],
    metadataPattern: /^(meta|config|_)/
});

const sections = detector.buildIndex(myData);
```

---

### Pattern 2: State Persistence with Navigation
**Use Case**: Maintain user preferences when navigating between items

```javascript
class NavigationStateManager {
    constructor() {
        this.stateKey = 'navState';
        this.currentState = new Map();
    }
    
    captureState(itemId) {
        const state = {
            openSections: Array.from(this.currentState.get('open') || []),
            scrollPosition: window.scrollY,
            timestamp: Date.now()
        };
        
        sessionStorage.setItem(
            `${this.stateKey}_${itemId}`, 
            JSON.stringify(state)
        );
    }
    
    restoreState(itemId, availableSections) {
        const saved = sessionStorage.getItem(`${this.stateKey}_${itemId}`);
        if (!saved) return;
        
        const state = JSON.parse(saved);
        const validSections = state.openSections.filter(
            section => availableSections.includes(section)
        );
        
        return {
            sectionsToOpen: validSections,
            scrollPosition: state.scrollPosition
        };
    }
    
    navigate(fromId, toId, renderCallback) {
        this.captureState(fromId);
        
        const newContent = renderCallback(toId);
        const availableSections = newContent.sections;
        
        setTimeout(() => {
            const restored = this.restoreState(toId, availableSections);
            if (restored) {
                this.applyState(restored);
            }
        }, 100);
    }
    
    applyState(state) {
        state.sectionsToOpen.forEach(sectionKey => {
            this.openSection(sectionKey);
        });
        
        window.scrollTo({
            top: state.scrollPosition,
            behavior: 'smooth'
        });
    }
}
```

---

### Pattern 3: Multi-Language Content Resolution
**Use Case**: Display content in user's preferred language with fallbacks

```javascript
class MultiLanguageResolver {
    constructor(config = {}) {
        this.fallbackChain = config.fallbackChain || [
            'userLanguage',
            'english',
            'default',
            'transliterate'
        ];
        this.transliterator = config.transliterator;
    }
    
    resolve(data, language) {
        // Try direct translation
        const langKey = this.getLanguageKey(language);
        if (data[langKey]) {
            return data[langKey];
        }
        
        // Try fallback chain
        for (const fallback of this.fallbackChain) {
            if (fallback === 'transliterate' && this.transliterator) {
                const source = data['original'] || data['default'];
                if (source) {
                    return this.transliterator(source, language);
                }
            } else {
                const key = this.getLanguageKey(fallback);
                if (data[key]) {
                    return data[key];
                }
            }
        }
        
        return ''; // Ultimate fallback
    }
    
    getLanguageKey(language) {
        const mappings = {
            'kn': 'Ka_Translation',
            'te': 'Te_Translation',
            'en': 'En_Translation',
            'sa': 'moola',
            'english': 'En_Translation',
            'default': 'moola'
        };
        return mappings[language] || language;
    }
}

// Usage
const resolver = new MultiLanguageResolver({
    fallbackChain: ['kn', 'en', 'sa', 'transliterate'],
    transliterator: transliterateText
});

const displayText = resolver.resolve(contentData, userLanguage);
```

---

### Pattern 4: Dynamic Dropdown Builder
**Use Case**: Create filterable dropdowns that adapt to available content

```javascript
class DynamicDropdown {
    constructor(container, config = {}) {
        this.container = container;
        this.config = {
            showAll: config.showAll !== false,
            allText: config.allText || 'All',
            allClass: config.allClass || 'all-checkbox',
            onChange: config.onChange || (() => {}),
            itemRenderer: config.itemRenderer || (item => item.toString())
        };
        this.selectedItems = new Set();
    }
    
    build(items) {
        let html = '';
        
        // Add "All" option
        if (this.config.showAll) {
            html += `
                <label class="${this.config.allClass}">
                    <input type="checkbox" id="all-checkbox" 
                           value="all" checked>
                    ${this.config.allText}
                </label>
            `;
        }
        
        // Add individual items
        html += items.map((item, index) => `
            <label>
                <input type="checkbox" 
                       value="${index}" 
                       data-key="${item.key || index}"
                       checked>
                ${this.config.itemRenderer(item)}
            </label>
        `).join('');
        
        this.container.innerHTML = html;
        this.attachListeners();
        
        // Initialize selected items
        this.selectedItems = new Set(items.map(i => i.key || i));
    }
    
    attachListeners() {
        const all = this.container.querySelector('#all-checkbox');
        const individuals = this.container.querySelectorAll(
            'input[type="checkbox"]:not(#all-checkbox)'
        );
        
        if (all) {
            all.addEventListener('change', () => {
                individuals.forEach(cb => cb.checked = all.checked);
                this.updateSelection(individuals);
            });
        }
        
        individuals.forEach(cb => {
            cb.addEventListener('change', () => {
                if (all) {
                    all.checked = Array.from(individuals).every(c => c.checked);
                }
                this.updateSelection(individuals);
            });
        });
    }
    
    updateSelection(checkboxes) {
        this.selectedItems.clear();
        checkboxes.forEach(cb => {
            if (cb.checked) {
                this.selectedItems.add(cb.dataset.key || cb.value);
            }
        });
        this.config.onChange(Array.from(this.selectedItems));
    }
    
    getSelected() {
        return Array.from(this.selectedItems);
    }
}

// Usage
const dropdown = new DynamicDropdown(
    document.getElementById('filter-dropdown'),
    {
        showAll: true,
        allText: 'Select All',
        allClass: 'master-checkbox',
        onChange: (selected) => {
            filterContent(selected);
        },
        itemRenderer: (item) => {
            return transliterateText(item.name, currentLanguage);
        }
    }
);

dropdown.build(availableItems);
```

---

### Pattern 5: Collapsible Section Manager
**Use Case**: Manage multiple expandable/collapsible content sections

```javascript
class CollapsibleSectionManager {
    constructor(config = {}) {
        this.openSections = new Set();
        this.config = {
            expandIcon: config.expandIcon || '▼',
            collapseIcon: config.collapseIcon || '▲',
            animationDuration: config.animationDuration || 300,
            onToggle: config.onToggle || (() => {})
        };
    }
    
    render(sections, container) {
        const html = sections.map(section => `
            <div class="section-item">
                <div class="section-header" 
                     onclick="sectionManager.toggle('${section.key}', ${section.position})">
                    <span class="section-title">${section.title}</span>
                    <span class="section-toggle" 
                          id="toggle-${section.position}">
                        ${this.config.expandIcon}
                    </span>
                </div>
                <div class="section-content" 
                     id="content-${section.position}" 
                     style="display: none;">
                    ${section.content}
                </div>
            </div>
        `).join('');
        
        container.innerHTML = html;
    }
    
    toggle(sectionKey, position) {
        const content = document.getElementById(`content-${position}`);
        const toggle = document.getElementById(`toggle-${position}`);
        
        if (!content || !toggle) return;
        
        const isOpen = content.style.display !== 'none';
        
        if (isOpen) {
            this.close(sectionKey, position, content, toggle);
        } else {
            this.open(sectionKey, position, content, toggle);
        }
        
        this.config.onToggle(sectionKey, !isOpen);
    }
    
    open(sectionKey, position, content, toggle) {
        content.style.display = 'block';
        toggle.textContent = this.config.collapseIcon;
        this.openSections.add(sectionKey);
    }
    
    close(sectionKey, position, content, toggle) {
        content.style.display = 'none';
        toggle.textContent = this.config.expandIcon;
        this.openSections.delete(sectionKey);
    }
    
    openByKey(sectionKey, allSections) {
        const section = allSections.find(s => s.key === sectionKey);
        if (section) {
            this.open(sectionKey, section.position,
                     document.getElementById(`content-${section.position}`),
                     document.getElementById(`toggle-${section.position}`));
        }
    }
    
    closeAll() {
        this.openSections.forEach(key => {
            // Find and close each section
        });
        this.openSections.clear();
    }
    
    getOpenSections() {
        return Array.from(this.openSections);
    }
    
    restoreState(sectionKeys, allSections) {
        sectionKeys.forEach(key => {
            this.openByKey(key, allSections);
        });
    }
}

// Usage
const sectionManager = new CollapsibleSectionManager({
    expandIcon: '▼',
    collapseIcon: '▲',
    onToggle: (key, isOpen) => {
        console.log(`Section ${key} is now ${isOpen ? 'open' : 'closed'}`);
    }
});

sectionManager.render(contentSections, containerElement);
```

---

## Integration Example

Here's how to integrate all patterns for a complete multi-language content system:

```javascript
class MultiLanguageContentApp {
    constructor(config) {
        this.contentDetector = new ContentDetector(config.detector);
        this.languageResolver = new MultiLanguageResolver(config.language);
        this.navigationManager = new NavigationStateManager();
        this.sectionManager = new CollapsibleSectionManager(config.sections);
        this.filterDropdown = new DynamicDropdown(
            config.filterContainer, 
            config.dropdown
        );
        
        this.currentLanguage = config.defaultLanguage || 'en';
        this.currentItem = null;
    }
    
    loadItem(itemId, data) {
        // Capture state before navigating
        if (this.currentItem) {
            this.navigationManager.captureState(this.currentItem);
        }
        
        // Detect content sections
        const sectionIndex = this.contentDetector.buildIndex(data);
        
        // Resolve content for current language
        const sections = sectionIndex.map(section => ({
            key: section.keyName,
            position: section.position,
            title: this.languageResolver.resolve(
                section.data, 
                this.currentLanguage
            ),
            content: this.renderContent(section.data)
        }));
        
        // Update filter dropdown
        this.filterDropdown.build(sections);
        
        // Render sections
        this.sectionManager.render(
            sections, 
            document.getElementById('content-container')
        );
        
        // Restore previous state
        const restored = this.navigationManager.restoreState(
            itemId, 
            sections.map(s => s.key)
        );
        
        if (restored) {
            setTimeout(() => {
                this.sectionManager.restoreState(
                    restored.sectionsToOpen, 
                    sections
                );
            }, 100);
        }
        
        this.currentItem = itemId;
    }
    
    changeLanguage(newLanguage) {
        this.currentLanguage = newLanguage;
        // Reload current item with new language
        if (this.currentItem) {
            this.loadItem(this.currentItem, this.getCurrentData());
        }
    }
    
    renderContent(data) {
        return this.languageResolver.resolve(data, this.currentLanguage);
    }
}

// Initialize app
const app = new MultiLanguageContentApp({
    defaultLanguage: 'en',
    detector: {
        excludeKeys: ['metadata', 'config'],
        requiredProps: ['moola', 'Ka_Translation']
    },
    language: {
        fallbackChain: ['kn', 'en', 'sa', 'transliterate']
    },
    sections: {
        expandIcon: '▼',
        collapseIcon: '▲'
    },
    dropdown: {
        showAll: true,
        allText: 'All Sections'
    },
    filterContainer: document.getElementById('filter-dropdown')
});
```

---

## Best Practices

### 1. State Management
- Use Sets for unique collections (open sections)
- Use Maps for key-value lookups (key → position)
- Always capture state before navigation
- Use setTimeout for DOM-dependent operations
- Persist critical state to localStorage/sessionStorage
- **Validate state bounds**: Always check array/object access is within valid range
- **Class-based state**: Use CSS classes (`auto-hide-enabled`, `open`) to represent state
- **Centralized toggles**: Global functions that update all affected elements

### 2. Event Handling
- Use event delegation for dynamic content
- Clean up listeners when removing elements
- Debounce frequent operations (search, filter)
- Use setTimeout(0) for post-render operations
- **stopPropagation**: Prevent events bubbling to parent handlers
- **Conditional parameters**: Pass behavior flags (`shouldScroll`) for context-aware actions

### 3. Performance
- Cache DOM queries in variables
- Use DocumentFragment for bulk insertions
- Minimize reflows/repaints
- Lazy load content when possible
- Use CSS transforms for animations
- **Position sticky**: Better performance than scroll listeners
- **CSS transitions**: Smoother than JavaScript animations
- **Opacity changes**: More performant than display toggle for hover effects

### 4. Maintainability
- Use configuration objects for flexibility
- Create reusable class-based components
- Document state changes
- Use meaningful variable names
- Keep functions focused and small
- **Single source of truth**: One function with parameters vs multiple similar functions
- **localStorage keys**: Consistent naming pattern for persisted state
- **Inline documentation**: Comment why, not what

### 5. Error Handling
- Validate data structure before processing
- Provide fallbacks for missing translations
- Handle missing DOM elements gracefully
- Log errors for debugging
- **Boundary checks**: Validate pagination indices before array access
- **Null coalescing**: Use `data?.property` or default values
- **Try-catch for async**: Wrap fetch/async operations in error handlers

### 6. UI/UX Patterns
- **Progressive disclosure**: Hide complexity until needed (auto-hide)
- **Visual feedback**: Clear hover states and transitions
- **Consistent behavior**: Same controls work the same way everywhere
- **Smart defaults**: Off for intrusive features, on for helpful ones
- **Context-aware actions**: Different behavior based on user location (top vs bottom pagination)
- **Overlay vs reflow**: Use overlays to avoid content jumping

---

## Adaptation Checklist

When adapting this framework for a new project:

**Core Setup**
- [ ] Define your content structure and required properties
- [ ] Create exclude list for metadata keys
- [ ] Set up language mapping for your supported languages
- [ ] Configure transliteration if needed
- [ ] Define what constitutes a "section" in your data

**State Management**
- [ ] Determine state that needs persistence
- [ ] Identify which state should use Sets vs Arrays vs Objects
- [ ] Plan localStorage schema for user preferences
- [ ] Define boundary conditions for pagination/navigation

**UI Components**
- [ ] Design your multi-view structure (list/detail)
- [ ] Set up navigation requirements
- [ ] Configure filtering/search needs
- [ ] Decide on auto-hide/overlay features
- [ ] Plan resize/drag-to-adjust interfaces
- [ ] Customize UI components and styling

**User Experience**
- [ ] Define smart defaults for all toggleable features
- [ ] Determine context-aware behaviors (e.g., scroll vs no-scroll)
- [ ] Plan hover states and visual feedback
- [ ] Design responsive layouts for different screen sizes
- [ ] Configure transition timings and animation smoothness

**Performance & Optimization**
- [ ] Identify DOM-heavy operations to optimize
- [ ] Plan lazy loading strategy
- [ ] Use position:sticky vs scroll listeners
- [ ] Minimize reflows with overlay patterns

**Data & Content**
- [ ] Set up dynamic watermark/background system
- [ ] Configure pagination chunking (CHARS_PER_PAGE)
- [ ] Plan for missing translations/fallbacks
- [ ] Define metadata structure (authors, categories, etc.)

**Testing & Edge Cases**
- [ ] Test with empty data
- [ ] Test with missing translations
- [ ] Test pagination at boundaries
- [ ] Test navigation at first/last items
- [ ] Test state restoration after page reload
- [ ] Test with very long/short content
- [ ] Test rapid state changes (debouncing)
- [ ] Verify localStorage quota handling

**Accessibility & Polish**
- [ ] Keyboard navigation support
- [ ] Screen reader compatibility
- [ ] Focus management
- [ ] Loading states
- [ ] Error messages
- [ ] Mobile touch interactions

---

## Key Technical Achievements

### 1. Zero Content Jumping
Achieved through overlay patterns and absolute positioning:
- Auto-hide headers use `position: absolute` with overlay
- Content below stays in place during hover
- Sticky resize handles use `position: sticky`
- No reflow/repaint when showing hidden elements

### 2. Context-Aware Behavior
Single functions with smart parameter handling:
- `navigateVyakhyanaPage(num, key, direction, event, shouldScroll = false)`
- Same function, different behavior based on call site
- Cleaner than duplicating logic in separate functions
- Easy to extend with additional context flags

### 3. State Synchronization
Keeping multiple UI elements in sync:
- Top and bottom pagination controls
- "All" checkbox with individual checkboxes
- Open/closed state with visual indicators
- LocalStorage with in-memory state

### 4. Progressive Enhancement
Features that enhance without breaking:
- Auto-hide is opt-in, not forced
- Resize handles appear only when needed
- Pagination only shows when content is long enough
- Watermarks only load when author exists

### 5. Performance-First CSS
Using modern CSS features for smooth UX:
- `position: sticky` instead of scroll listeners
- CSS transitions instead of JavaScript animations
- `opacity` changes instead of `display` toggles
- Hardware-accelerated properties (transform, opacity)

### 6. Fail-Safe Error Handling
Graceful degradation at every level:
- Pagination boundary checks prevent crashes
- Missing translations fall back to alternatives
- Invalid localStorage values use sensible defaults
- Null checks before accessing nested properties

---

## Section 12: Footer Timestamp with Build Automation

### Overview
Automated version tracking system that displays last update timestamp in the footer without relying on server-side headers (GitHub Pages compatible).

### Implementation

#### HTML Structure
```html
<footer>
    <p>Based on Madhvacharya's Brahma Sutra Bhashya | For educational purposes</p>
    <p class="last-updated" id="lastUpdated">
        Updated on: <span id="updateDate">Loading...</span>
    </p>
</footer>
```

#### CSS Positioning
```css
footer {
    background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
    color: white;
    text-align: center;
    padding: 20px;
    margin-top: auto;
    position: relative; /* For absolute child positioning */
}

footer .last-updated {
    position: absolute;
    bottom: 10px;
    right: 20px;
    font-size: 0.85rem;
    color: rgba(255, 255, 255, 0.7);
    margin: 0;
}

footer .last-updated span {
    font-weight: 600;
    color: rgba(255, 255, 255, 0.9);
}
```

#### JavaScript Display Function
```javascript
async function updateLastModifiedDate() {
    const updateDateElement = document.getElementById('updateDate');
    if (!updateDateElement) return;
    
    // Hard-coded version date - updated by build script
    const VERSION_DATE = '2025-12-25T23:04:00+05:30';
    
    try {
        const versionDate = new Date(VERSION_DATE);
        updateDateElement.textContent = versionDate.toLocaleString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (error) {
        console.error('Error formatting version date:', error);
        // Fallback display
        updateDateElement.textContent = 'Dec 25, 2025, 11:04 PM';
    }
}

// Call on page load
document.addEventListener('DOMContentLoaded', () => {
    updateLastModifiedDate();
    // ... other initialization
});
```

#### Build Script (PowerShell)
**File: `update-version.ps1`**
```powershell
# Update version date in bs.js
$jsFile = "js\bs.js"
$currentDateTime = Get-Date -Format "yyyy-MM-ddTHH:mm:sszzz"
$displayDateTime = Get-Date -Format "MMM dd, yyyy, h:mm tt"

Write-Host "Updating version date to: $displayDateTime" -ForegroundColor Green

# Read the file content
$content = Get-Content $jsFile -Raw

# Update the VERSION_DATE line using regex
$content = $content -replace "const VERSION_DATE = '[^']+';", "const VERSION_DATE = '$currentDateTime';"

# Write back to file
Set-Content $jsFile -Value $content -NoNewline

Write-Host "Version date updated successfully!" -ForegroundColor Green
Write-Host "Don't forget to commit and push the changes." -ForegroundColor Yellow
```

### Usage Workflow

**Before Each Deployment:**
```powershell
# 1. Run the update script
powershell -ExecutionPolicy Bypass -File update-version.ps1

# 2. Stage and commit changes
git add .
git commit -m "Your commit message"

# 3. Push to repository
git push origin branch-name
```

### Design Decisions

#### Why Hard-Coded Constant vs Server Headers?
1. **GitHub Pages Limitation**: Doesn't reliably send `Last-Modified` headers
2. **Simplicity**: No async fetch calls, instant display
3. **Reliability**: Works in all deployment environments
4. **Performance**: No network requests needed

#### Why Build Script vs Manual Updates?
1. **Automation**: Eliminates human error
2. **Consistency**: Same format every time
3. **Integration**: Fits naturally into git workflow
4. **Reminder**: Script displays confirmation message

#### Why PowerShell Script?
1. **Cross-Platform**: Works on Windows (primary development environment)
2. **Simple**: Regex replacement in 11 lines
3. **No Dependencies**: Uses built-in PowerShell features
4. **Readable**: Easy to understand and modify

### Display Format
- **Locale**: `en-IN` (Indian English)
- **Date Format**: "Dec 25, 2025"
- **Time Format**: "11:04 PM" (12-hour with AM/PM)
- **Full Example**: "Dec 25, 2025, 11:04 PM"

### Error Handling
```javascript
try {
    const versionDate = new Date(VERSION_DATE);
    updateDateElement.textContent = versionDate.toLocaleString('en-IN', {...});
} catch (error) {
    console.error('Error formatting version date:', error);
    // Fallback to static display if date parsing fails
    updateDateElement.textContent = 'Dec 25, 2025, 11:04 PM';
}
```

### Best Practices

1. **Run Before Every Commit**: Make it part of your pre-commit routine
2. **Verify Changes**: Check that VERSION_DATE was updated in bs.js
3. **Commit Included Files**: Ensure updated bs.js is in the commit
4. **Meaningful Commit Messages**: Describe what changed, not just "update version"
5. **Test Locally**: Verify footer displays correctly before pushing

### Alternative Approaches Considered

#### Approach 1: Fetch Last-Modified Headers
```javascript
// NOT USED - Doesn't work on GitHub Pages
const response = await fetch('js/bs.js');
const lastModified = response.headers.get('Last-Modified');
```
**Why Not**: GitHub Pages doesn't send reliable Last-Modified headers

#### Approach 2: Manual VERSION_DATE Updates
```javascript
// Manual update required before each deployment
const VERSION_DATE = '2025-12-25T23:04:00+05:30';
```
**Why Not**: Easy to forget, prone to human error

#### Approach 3: Git Pre-Commit Hook ❌
```bash
#!/usr/bin/env pwsh
# Pre-commit hook to auto-update version
```
**Why Not**: Windows Git doesn't execute PowerShell hooks reliably

### Adaptation for Other Projects

**For npm-based projects:**
```json
{
  "scripts": {
    "version": "node update-version.js",
    "precommit": "npm run version && git add ."
  }
}
```

**For Python projects:**
```python
# update_version.py
import re
from datetime import datetime

with open('app.js', 'r') as f:
    content = f.read()

now = datetime.now().isoformat()
content = re.sub(r"VERSION_DATE = '[^']+'", f"VERSION_DATE = '{now}'", content)

with open('app.js', 'w') as f:
    f.write(content)
```

**For deployment pipelines (CI/CD):**
```yaml
# .github/workflows/deploy.yml
- name: Update version
  run: |
    sed -i "s/VERSION_DATE = '.*'/VERSION_DATE = '$(date -Iseconds)'/" js/app.js
    git add js/app.js
```

---

## Conclusion

This framework provides a robust foundation for building multi-language content applications with complex state management, dynamic content detection, and sophisticated UI interactions. All patterns are designed to be:

- **Reusable**: Adapt to different projects with minimal changes
- **Maintainable**: Clean code with clear patterns and documentation
- **Performant**: Optimized for smooth user experience
- **Resilient**: Graceful handling of edge cases and errors
- **User-Centric**: Features that enhance UX without intrusion

The implementation demonstrates that vanilla JavaScript can deliver framework-quality features when architected thoughtfully, with proper state management, performance optimization, and attention to user experience details.

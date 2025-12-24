# Multi-Language Content Framework Documentation

## Overview
This framework provides a flexible, scalable solution for displaying multi-language content with dynamic structure detection, advanced navigation, and state management - all implemented in vanilla JavaScript without external dependencies.

---

## Core Features

### 1. Dynamic Multi-Language Support System

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

## Reusable Framework Patterns

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

### 2. Event Handling
- Use event delegation for dynamic content
- Clean up listeners when removing elements
- Debounce frequent operations (search, filter)
- Use setTimeout(0) for post-render operations

### 3. Performance
- Cache DOM queries in variables
- Use DocumentFragment for bulk insertions
- Minimize reflows/repaints
- Lazy load content when possible
- Use CSS transforms for animations

### 4. Maintainability
- Use configuration objects for flexibility
- Create reusable class-based components
- Document state changes
- Use meaningful variable names
- Keep functions focused and small

### 5. Error Handling
- Validate data structure before processing
- Provide fallbacks for missing translations
- Handle missing DOM elements gracefully
- Log errors for debugging

---

## Adaptation Checklist

When adapting this framework for a new project:

- [ ] Define your content structure and required properties
- [ ] Create exclude list for metadata keys
- [ ] Set up language mapping for your supported languages
- [ ] Configure transliteration if needed
- [ ] Define what constitutes a "section" in your data
- [ ] Determine state that needs persistence
- [ ] Design your multi-view structure
- [ ] Set up navigation requirements
- [ ] Configure filtering/search needs
- [ ] Customize UI components and styling
- [ ] Test with edge cases (empty data, missing translations, etc.)
- [ ] Optimize for your specific performance needs

---

## Conclusion

This framework provides a robust foundation for building multi-language content applications with complex state management and dynamic content detection. All patterns are designed to be reusable and adaptable to different project requirements while maintaining clean, maintainable code.

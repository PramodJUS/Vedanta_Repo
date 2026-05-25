# Brahmasūtras Explorer - Integration Guide

## Current Status: Standalone (Option A) ✅

The explorer is currently a **standalone page** (`brahma-explorer.html`) that works independently.

**Access:**
- Direct: `http://localhost:8000/brahma-explorer.html`
- Link: "⚲ Explorer View" button in main header

---

## Future Goal: Mode Toggle (Option B)

Integrate the explorer as an alternative view mode within `index.html` with a toggle button.

### Integration Strategy

#### 1. **HTML Structure**

Add explorer markup to `index.html`:

```html
<!-- Inside <main> tag, after current .container -->
<div id="explorer-container" style="display: none;">
    <!-- Copy entire explorer structure from brahma-explorer.html -->
    <!-- (Everything inside <div id="app">) -->
</div>

<!-- View toggle button in header -->
<button id="viewToggleBtn" class="view-toggle-btn">
    <span id="viewToggleIcon">⚲</span>
    <span id="viewToggleText">Explorer View</span>
</button>
```

#### 2. **CSS Integration**

**Option A: Separate file (cleaner)**
```html
<link rel="stylesheet" href="css/explorer.css">
```

**Option B: Conditional loading**
```javascript
// In bs.js
function loadExplorerStyles() {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'css/explorer.css';
    document.head.appendChild(link);
}
```

#### 3. **JavaScript Integration**

**Approach: Modular**

```javascript
// In bs.js, add view mode state
let currentView = 'traditional'; // or 'explorer'

// Toggle function
function toggleView() {
    if (currentView === 'traditional') {
        // Hide traditional view
        document.querySelector('.container').style.display = 'none';

        // Show explorer
        document.getElementById('explorer-container').style.display = 'flex';

        // Initialize explorer if not already
        if (!window.explorerInitialized) {
            initExplorer(); // Call from explorer.js
            window.explorerInitialized = true;
        }

        currentView = 'explorer';
        updateToggleButton('⚲', 'Traditional View');
    } else {
        // Hide explorer
        document.getElementById('explorer-container').style.display = 'none';

        // Show traditional
        document.querySelector('.container').style.display = 'flex';

        currentView = 'traditional';
        updateToggleButton('☰', 'Explorer View');
    }
}

// Add to existing DOMContentLoaded
document.getElementById('viewToggleBtn').addEventListener('click', toggleView);
```

#### 4. **Shared Data Loading**

Both views need the same data. Refactor data loading:

```javascript
// In bs.js - make data globally accessible
window.vedantaData = {
    sutras: null,
    adhikaranas: null,
    sutraDetails: null,
    authorMap: null
};

// Modify loadSutraList() to populate window.vedantaData
async function loadSutraList() {
    const response = await fetch('sutra/bs.csv');
    const csvText = await response.text();
    allSutras = parseCSV(csvText);
    window.vedantaData.sutras = allSutras; // Share with explorer
    // ... rest of existing code
}

// In explorer.js - use shared data if available
async function init() {
    if (window.vedantaData && window.vedantaData.sutras) {
        // Data already loaded, use it
        state.data = buildHierarchy(
            window.vedantaData.sutras,
            window.vedantaData.adhikaranas,
            window.vedantaData.sutraDetails
        );
    } else {
        // Load fresh (standalone mode)
        // ... existing loading code
    }
}
```

#### 5. **Header Adjustments**

Hide/show header elements based on view:

```javascript
function toggleView() {
    const traditionalControls = document.querySelectorAll(
        '#adhyayaSelector, #padaSelector, #adhikaranaSelector, #searchInput'
    );

    if (currentView === 'explorer') {
        // Hide traditional navigation
        traditionalControls.forEach(el => el.parentElement.style.display = 'none');

        // Optionally collapse header
        document.getElementById('mainHeader').classList.add('explorer-mode');
    } else {
        // Show traditional navigation
        traditionalControls.forEach(el => el.parentElement.style.display = '');
        document.getElementById('mainHeader').classList.remove('explorer-mode');
    }
}
```

#### 6. **CSS Namespace (Prevent Conflicts)**

Add namespace to explorer styles:

```css
/* In explorer.css - wrap everything */
#explorer-container .explorer { /* ... */ }
#explorer-container .column { /* ... */ }
/* etc. */
```

#### 7. **URL State (Optional)**

Preserve view mode in URL:

```javascript
function toggleView() {
    // ... existing toggle code ...

    // Update URL
    const url = new URL(window.location);
    url.searchParams.set('view', currentView);
    history.pushState({}, '', url);
}

// On page load, check URL
window.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const viewMode = urlParams.get('view');

    if (viewMode === 'explorer') {
        toggleView();
    }
});
```

---

## File Organization

### Current (Option A - Standalone)
```
vedanta/
├── index.html              # Main traditional view
├── brahma-explorer.html    # Standalone explorer ⭐
├── css/
│   ├── bs.css              # Traditional styles
│   └── explorer.css        # Explorer styles ⭐
└── js/
    ├── bs.js               # Traditional logic
    └── explorer.js         # Explorer logic ⭐
```

### Future (Option B - Integrated)
```
vedanta/
├── index.html              # Both views integrated
├── css/
│   ├── bs.css              # Traditional styles
│   └── explorer.css        # Explorer styles (namespaced)
└── js/
    ├── bs.js               # Traditional + view toggle
    ├── explorer.js         # Explorer module
    └── shared-data.js      # Optional: shared data utilities
```

---

## Migration Checklist

When ready to integrate (Option B):

- [ ] Copy explorer HTML into `index.html` `<main>` section
- [ ] Add view toggle button to header
- [ ] Ensure `explorer.css` is loaded
- [ ] Modify `explorer.js` to work as a module (wrap in function, export `initExplorer()`)
- [ ] Add view toggle logic to `bs.js`
- [ ] Share data between views via `window.vedantaData`
- [ ] Add CSS namespacing to prevent conflicts
- [ ] Test: Traditional view → Explorer view → back
- [ ] Test: Direct load with `?view=explorer` URL param
- [ ] Test: Data consistency between views
- [ ] Update navigation (hide/show appropriate controls)
- [ ] Optional: Add keyboard shortcut (e.g., `Ctrl+E` for Explorer)

---

## Benefits of Current Standalone Approach

✅ **Faster development** - Build and test independently
✅ **No conflicts** - Separate CSS/JS namespaces
✅ **Easy testing** - Direct URL access
✅ **Future-ready** - Designed for easy integration
✅ **Fallback option** - Can keep both standalone + integrated

---

## Technical Notes

### Data Loading Performance
- Explorer loads ~525 sutras + adhikarana data on init
- Consider lazy-loading sutra commentary (only load when clicked)
- Cache built hierarchy in `sessionStorage` for faster re-init

### Memory Management
- When switching views, explorer's DOM stays in memory
- To free memory, could destroy and recreate on each toggle
- Current approach: Keep initialized, minimal overhead

### Browser Compatibility
- Tested in modern Chrome/Firefox/Edge
- Uses ES6+ features (arrow functions, async/await, template literals)
- CSS animations use `transform` for performance
- No polyfills needed for target browsers

---

## Next Steps

1. **Test standalone explorer** thoroughly
2. **Gather feedback** on interaction model
3. **Refine animations** and transitions
4. **Add deep-linking** to specific sutras (optional)
5. **Integrate into main app** when ready

---

*Created: April 7, 2026*
*Status: Standalone working, integration guide ready*

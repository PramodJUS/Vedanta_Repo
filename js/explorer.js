/**
 * Brahmasūtras Explorer - Vanilla JavaScript
 * Three-column hierarchical browser: Adhyāya → Adhikaraṇa → Sūtra
 */

// State management
const state = {
    data: null,
    hover: { adhyaya: null, adhikarana: null, sutra: null },
    pinned: { adhyaya: null, adhikarana: null, sutra: null },
    leaveTimer: null,
    meaningHeight: 220
};

// Color configuration
const COLORS = {
    1: {
        bg: '#A87018', dim: 'rgba(168,112,24,0.08)', glow: 'rgba(168,112,24,0.15)',
        pada: {
            1: { bg: '#A87018', dim: 'rgba(168,112,24,0.15)' },  // Original gold
            2: { bg: '#B8843C', dim: 'rgba(184,132,60,0.15)' },  // Lighter gold
            3: { bg: '#C89850', dim: 'rgba(200,152,80,0.15)' },  // Even lighter
            4: { bg: '#D8AC64', dim: 'rgba(216,172,100,0.15)' }  // Lightest gold
        }
    },
    2: {
        bg: '#6030A0', dim: 'rgba(96,48,160,0.08)', glow: 'rgba(96,48,160,0.15)',
        pada: {
            1: { bg: '#6030A0', dim: 'rgba(96,48,160,0.15)' },   // Original purple
            2: { bg: '#7848B0', dim: 'rgba(120,72,176,0.15)' },  // Lighter purple
            3: { bg: '#9060C0', dim: 'rgba(144,96,192,0.15)' },  // Even lighter
            4: { bg: '#A878D0', dim: 'rgba(168,120,208,0.15)' }  // Lightest purple
        }
    },
    3: {
        bg: '#206830', dim: 'rgba(32,104,48,0.08)', glow: 'rgba(32,104,48,0.15)',
        pada: {
            1: { bg: '#206830', dim: 'rgba(32,104,48,0.15)' },   // Original green
            2: { bg: '#388048', dim: 'rgba(56,128,72,0.15)' },   // Lighter green
            3: { bg: '#509860', dim: 'rgba(80,152,96,0.15)' },   // Even lighter
            4: { bg: '#68B078', dim: 'rgba(104,176,120,0.15)' }  // Lightest green
        }
    },
    4: {
        bg: '#A02020', dim: 'rgba(160,32,32,0.08)', glow: 'rgba(160,32,32,0.15)',
        pada: {
            1: { bg: '#A02020', dim: 'rgba(160,32,32,0.15)' },   // Original crimson
            2: { bg: '#B03838', dim: 'rgba(176,56,56,0.15)' },   // Lighter crimson
            3: { bg: '#C05050', dim: 'rgba(192,80,80,0.15)' },   // Even lighter
            4: { bg: '#D06868', dim: 'rgba(208,104,104,0.15)' }  // Lightest crimson
        }
    }
};

// Utility: Parse CSV (handles quoted fields and BOM)
function parseCSV(text) {
    // Remove BOM if present
    text = text.replace(/^\uFEFF/, '');

    const lines = text.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));

    return lines.slice(1).map(line => {
        // Simple CSV parsing (handles basic quoted fields)
        const values = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];

            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                values.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        values.push(current.trim()); // Last value

        const obj = {};
        headers.forEach((header, i) => {
            obj[header] = (values[i] || '').replace(/^"|"$/g, '');
        });
        return obj;
    }).filter(row => row[headers[0]]); // Filter empty rows
}

// Utility: Load JSON
async function loadJSON(path) {
    const response = await fetch(path);
    return response.json();
}

// Utility: Load CSV
async function loadCSV(path) {
    const response = await fetch(path);
    const text = await response.text();
    return parseCSV(text);
}

// Build hierarchical data structure
function buildHierarchy(sutras, adhikaranaDetails, sutraDetails) {
    const hierarchy = {};

    // Create a lookup map by adhikarana name (from Adhikarana_X keys)
    const adhikaranaByName = {};
    Object.values(adhikaranaDetails).forEach(details => {
        if (details.name) {
            adhikaranaByName[details.name] = details;
        }
    });

    // Group sutras by adhyaya
    sutras.forEach(sutra => {
        const adhyaya = parseInt(sutra.adhyaya);
        const pada = parseInt(sutra.pada);
        const num = parseInt(sutra.sutra_number); // Note: underscore in CSV
        const id = `${adhyaya}.${pada}.${num}`;

        if (!hierarchy[adhyaya]) {
            hierarchy[adhyaya] = {
                id: adhyaya,
                roman: ['I', 'II', 'III', 'IV'][adhyaya - 1],
                name: `Adhyāya ${adhyaya}`,
                title: ['Samanvaya', 'Avirodha', 'Sādhana', 'Phala'][adhyaya - 1],
                desc: '',
                adhikaranas: {}
            };
        }

        // Group by adhikarana (unique per pada to avoid mixing same-named adhikaranas in different padas)
        const adhikaranaName = sutra.adhikarana || 'Unknown';
        const adhikaranaKey = `${pada}_${adhikaranaName}`; // Make unique by pada

        if (!hierarchy[adhyaya].adhikaranas[adhikaranaKey]) {
            const adhDetails = adhikaranaByName[adhikaranaName] || {};
            hierarchy[adhyaya].adhikaranas[adhikaranaKey] = {
                id: `${adhyaya}_${pada}_${adhikaranaName}`,
                name: adhikaranaName,
                full: adhDetails.name || adhikaranaName,
                topic: adhDetails['विषयः - Topic'] || '',
                samshaya: adhDetails['संशयः - Samshaya'] || '',
                purvapaksha: adhDetails['पूर्वपक्षः - Purvapaksha'] || '',
                siddhanta: adhDetails['सिध्दन्तः - Siddhanta'] || '',
                notes: adhDetails.notes || '',
                references: adhDetails.references || '',
                pada: pada,  // Track pada for color differentiation
                sutras: []
            };
        }

        // Add sutra
        hierarchy[adhyaya].adhikaranas[adhikaranaKey].sutras.push({
            id: id,
            text: sutra.sutra_text || '', // Note: underscore in CSV
            meaning: getMeaning(id, sutraDetails),
            adhyaya: adhyaya
        });
    });

    // Convert adhikaranas objects to arrays and calculate ranges
    Object.values(hierarchy).forEach(adhyaya => {
        const adhikaranaArray = Object.values(adhyaya.adhikaranas);
        adhikaranaArray.forEach(adh => {
            if (adh.sutras.length > 0) {
                const first = adh.sutras[0].id;
                const last = adh.sutras[adh.sutras.length - 1].id;
                adh.range = first === last ? first : `${first}–${last}`;
            }
        });
        adhyaya.adhikaranas = adhikaranaArray;
    });

    const result = Object.values(hierarchy);

    // Debug logging
    console.log('Hierarchy built:', result.length, 'adhyayas');
    result.forEach(adh => {
        console.log(`  Adhyaya ${adh.id}:`, adh.adhikaranas.length, 'adhikaranas');
        adh.adhikaranas.forEach(adhik => {
            console.log(`    ${adhik.name}:`, adhik.sutras.length, 'sutras');
        });
    });

    return result;
}

// Extract meaning from sutra details
function getMeaning(sutraId, sutraDetails) {
    const details = sutraDetails[sutraId];
    if (!details) return 'No commentary available.';

    // Extract first vyakhyana as summary
    for (const partKey in details) {
        if (partKey.startsWith('Part#')) {
            const part = details[partKey];
            const vyakhyanas = Object.keys(part);
            if (vyakhyanas.length > 0) {
                const first = part[vyakhyanas[0]];
                if (first && first.moola) {
                    // Get first 500 characters as preview
                    const text = first.moola.substring(0, 500);
                    return text + (first.moola.length > 500 ? '...' : '');
                }
            }
        }
    }
    return 'Commentary available.';
}

// Initialize app
async function init() {
    try {
        // Load data files
        const [sutras, adhikaranaDetails, sutraDetails] = await Promise.all([
            loadCSV('sutra/bs.csv'),
            loadJSON('sutra/adhikarana-details.json'),
            loadJSON('sutra/sutra-details.json')
        ]);

        // Build hierarchy
        state.data = buildHierarchy(sutras, adhikaranaDetails, sutraDetails);

        // Hide loading, show explorer
        document.getElementById('loading').style.display = 'none';
        document.getElementById('explorer').style.display = 'flex';

        // Render
        renderAdhyayas();
        setupEventListeners();

    } catch (error) {
        console.error('Failed to load data:', error);
        document.getElementById('loading').innerHTML = `
            <div class="loading-spinner"></div>
            <p style="color: #A02020;">Error loading data. Please check console.</p>
        `;
    }
}

// Render Adhyāyas column
function renderAdhyayas() {
    const col = document.getElementById('adhyaya-col');
    col.innerHTML = '';

    state.data.forEach((adhyaya, index) => {
        const row = document.createElement('div');
        row.className = 'adhyaya-row';
        row.dataset.adhyaya = adhyaya.id;

        row.innerHTML = `
            <div class="adhyaya-row-content">
                <span class="adhyaya-pin-icon">⚲</span>
                <span class="adhyaya-roman">${adhyaya.roman}</span>
                <div class="adhyaya-info">
                    <p class="adhyaya-name">${adhyaya.name}</p>
                    <p class="adhyaya-title">${adhyaya.title.toUpperCase()}</p>
                </div>
                <span class="adhyaya-arrow">›</span>
            </div>
        `;

        row.addEventListener('mouseenter', () => handleAdhyayaHover(adhyaya));
        row.addEventListener('mousemove', (e) => handle3DTilt(e, row));
        row.addEventListener('mouseleave', (e) => reset3DTilt(row));
        row.addEventListener('click', () => handleAdhyayaClick(adhyaya));

        col.appendChild(row);
    });
}

// Handle Adhyāya hover
function handleAdhyayaHover(adhyaya) {
    clearLeaveTimer();

    // If an adhyaya is pinned, ignore hovers on other adhyayas
    if (state.pinned.adhyaya && state.pinned.adhyaya.id !== adhyaya.id) {
        return;
    }

    state.hover.adhyaya = adhyaya;

    if (!state.pinned.adhikarana) {
        state.hover.adhikarana = null;
        state.hover.sutra = null;
    }

    updateUI();
    renderAdhikaranas(adhyaya);
}

// Handle Adhyāya click (pin/unpin)
function handleAdhyayaClick(adhyaya) {
    if (state.pinned.adhyaya && state.pinned.adhyaya.id === adhyaya.id) {
        // Unpin
        state.pinned.adhyaya = null;
        state.pinned.adhikarana = null;
        state.pinned.sutra = null;
    } else {
        // Pin
        state.pinned.adhyaya = adhyaya;
        state.pinned.adhikarana = null;
        state.pinned.sutra = null;
    }
    updateUI();
}

// Render Adhikaraṇas for active adhyāya
function renderAdhikaranas(adhyaya) {
    const col = document.getElementById('adhikarana-col');

    // Hide empty state
    const emptyState = col.querySelector('.empty-state');
    if (emptyState) emptyState.classList.add('hidden');

    // Remove old panels
    col.querySelectorAll('.panel').forEach(p => p.remove());

    // Create panel for this adhyaya
    const panel = document.createElement('div');
    panel.className = 'panel visible';
    panel.dataset.adhyaya = adhyaya.id;

    const header = document.createElement('div');
    header.className = 'panel-header';
    header.innerHTML = `<span>${adhyaya.adhikaranas.length} ADHIKARAṆAS</span>`;
    panel.appendChild(header);

    let currentPada = null;
    adhyaya.adhikaranas.forEach((adh, index) => {
        // Add pada separator when pada changes
        if (currentPada !== adh.pada) {
            currentPada = adh.pada;
            const separator = document.createElement('div');
            separator.className = 'pada-separator';

            const colors = COLORS[adhyaya.id];
            const padaColors = colors.pada[adh.pada];
            if (padaColors) {
                separator.style.borderTopColor = padaColors.bg;
            }

            panel.appendChild(separator);
        }

        const item = document.createElement('div');
        item.className = 'list-item';
        item.dataset.adhikarana = adh.id;
        item.dataset.pada = adh.pada;
        item.style.animationDelay = `${index * 0.045}s`;

        // Apply pada-based colors
        const colors = COLORS[adhyaya.id];
        const padaColors = colors.pada[adh.pada];
        if (padaColors) {
            item.style.setProperty('--pada-color', padaColors.bg);
            item.style.setProperty('--pada-dim', padaColors.dim);
        }

        item.innerHTML = `
            <span class="pin-icon">⚲</span>
            <span class="item-name">${adh.name}</span>
            <span class="item-range">${adh.range}</span>
            <span class="item-arrow">›</span>
        `;

        item.addEventListener('mouseenter', () => handleAdhikaranaHover(adh, adhyaya));
        item.addEventListener('click', () => handleAdhikaranaClick(adh, adhyaya));

        panel.appendChild(item);
    });

    col.appendChild(panel);
}

// Handle Adhikaraṇa hover
function handleAdhikaranaHover(adhikarana, adhyaya) {
    clearLeaveTimer();

    // If an adhikarana is pinned, ignore hovers on other adhikaranas
    if (state.pinned.adhikarana && state.pinned.adhikarana.id !== adhikarana.id) {
        return;
    }

    state.hover.adhikarana = adhikarana;
    state.hover.sutra = null;

    updateUI();
    renderSutras(adhikarana, adhyaya);
}

// Handle Adhikaraṇa click (pin/unpin)
function handleAdhikaranaClick(adhikarana, adhyaya) {
    if (state.pinned.adhikarana && state.pinned.adhikarana.id === adhikarana.id) {
        // Unpin
        state.pinned.adhikarana = null;
        state.pinned.adhyaya = null;
        state.pinned.sutra = null;
    } else {
        // Pin
        state.pinned.adhikarana = adhikarana;
        state.pinned.adhyaya = adhyaya;
        state.pinned.sutra = null;
    }
    updateUI();
}

// Render Sūtras for active adhikaraṇa
function renderSutras(adhikarana, adhyaya) {
    const col = document.getElementById('sutra-col');

    // Hide empty state
    const emptyState = col.querySelector('.empty-state');
    if (emptyState) emptyState.classList.add('hidden');

    // Remove old panels
    col.querySelectorAll('.panel').forEach(p => p.remove());

    // Create panel
    const panel = document.createElement('div');
    panel.className = 'panel visible';
    panel.dataset.adhikarana = adhikarana.id;

    const header = document.createElement('div');
    header.className = 'panel-header';
    header.innerHTML = `<span>${adhikarana.sutras.length} SŪTRA${adhikarana.sutras.length > 1 ? 'S' : ''}</span>`;
    panel.appendChild(header);

    adhikarana.sutras.forEach((sutra, index) => {
        const item = document.createElement('div');
        item.className = 'list-item';
        item.dataset.sutra = sutra.id;
        item.style.animationDelay = `${index * 0.055}s`;

        item.innerHTML = `
            <span class="pin-icon">⚲</span>
            <span class="sutra-text">${sutra.text}</span>
            <span class="sutra-id">${sutra.id}</span>
        `;

        item.addEventListener('mouseenter', () => handleSutraHover(sutra));
        item.addEventListener('click', () => handleSutraClick(sutra));

        panel.appendChild(item);
    });

    col.appendChild(panel);
}

// Handle Sūtra hover
function handleSutraHover(sutra) {
    clearLeaveTimer();

    // If a sutra is pinned, ignore hovers on other sutras
    if (state.pinned.sutra && state.pinned.sutra.id !== sutra.id) {
        return;
    }

    state.hover.sutra = sutra;
    updateUI();
}

// Handle Sūtra click (pin/unpin)
function handleSutraClick(sutra) {
    if (state.pinned.sutra && state.pinned.sutra.id === sutra.id) {
        state.pinned.sutra = null;
    } else {
        state.pinned.sutra = sutra;
    }
    updateUI();
}

// Update UI based on state
function updateUI() {
    const activeAdh = state.pinned.adhyaya || state.hover.adhyaya;
    const activeAdhikarana = state.pinned.adhikarana || state.hover.adhikarana;
    const activeSutra = state.pinned.sutra || state.hover.sutra;

    // Update adhyaya rows
    document.querySelectorAll('.adhyaya-row').forEach(row => {
        const isActive = activeAdh && row.dataset.adhyaya == activeAdh.id;
        const isPinned = state.pinned.adhyaya && row.dataset.adhyaya == state.pinned.adhyaya.id;
        row.classList.toggle('active', isActive);
        row.classList.toggle('pinned', isPinned);

        if (isActive) {
            const colors = COLORS[activeAdh.id];
            row.style.setProperty('--active-color', colors.bg);
            row.style.setProperty('--active-dim', colors.dim);
            row.style.setProperty('--active-glow', colors.glow);
        }
    });

    // Update adhikarana items
    document.querySelectorAll('#adhikarana-col .list-item').forEach(item => {
        const isActive = activeAdhikarana && item.dataset.adhikarana === activeAdhikarana.id;
        const isPinned = state.pinned.adhikarana && item.dataset.adhikarana === state.pinned.adhikarana.id;
        item.classList.toggle('active', isActive);
        item.classList.toggle('pinned', isPinned);
    });

    // Update sutra items
    document.querySelectorAll('#sutra-col .list-item').forEach(item => {
        const isActive = activeSutra && item.dataset.sutra === activeSutra.id;
        const isPinned = state.pinned.sutra && item.dataset.sutra === state.pinned.sutra.id;
        item.classList.toggle('active', isActive);
        item.classList.toggle('pinned', isPinned);
    });

    // Update explorer glow
    const explorer = document.getElementById('explorer');
    ['adhyaya1', 'adhyaya2', 'adhyaya3', 'adhyaya4'].forEach(cls => {
        explorer.classList.remove(`glow-${cls}`);
    });
    if (activeAdh) {
        explorer.classList.add(`glow-adhyaya${activeAdh.id}`);
    }

    // Update meaning window
    updateMeaningWindow(activeSutra, activeAdhikarana, activeAdh);

    // Set CSS variables for active colors
    if (activeAdh) {
        const colors = COLORS[activeAdh.id];
        document.querySelectorAll('.panel').forEach(panel => {
            panel.style.setProperty('--active-color', colors.bg);
            panel.style.setProperty('--active-dim', colors.dim);
        });
    }
}

// Update meaning window
function updateMeaningWindow(sutra, adhikarana, adhyaya) {
    const window = document.getElementById('meaning-window');
    const content = document.getElementById('meaning-content');

    // Update accent class
    ['adhyaya1', 'adhyaya2', 'adhyaya3', 'adhyaya4'].forEach(cls => {
        window.classList.remove(`accent-${cls}`);
    });
    if (adhyaya) {
        window.classList.add(`accent-adhyaya${adhyaya.id}`);
    }

    if (sutra) {
        // Show sutra meaning
        const colors = COLORS[adhyaya.id];
        const isPinned = state.pinned.sutra && state.pinned.sutra.id === sutra.id;

        content.innerHTML = `
            <div class="meaning-display">
                <div class="meaning-meta">
                    <span class="meaning-type-badge" style="border-color: ${colors.bg}; color: ${colors.bg};">SŪTRA</span>
                    <span class="meaning-parent">in ${adhikarana.name || adhikarana.full}</span>
                    ${isPinned ? `<span class="meaning-pinned-badge" style="background: ${colors.bg};">PINNED · click to release</span>` : ''}
                    <span class="meaning-id" style="color: ${colors.bg};">${sutra.id}</span>
                </div>
                <p class="meaning-title">${adhikarana.full || adhikarana.name}</p>
                <p class="meaning-sutra-text" style="color: ${colors.bg};">${sutra.text}</p>
                <p class="meaning-description">${sutra.meaning}</p>
            </div>
        `;
    } else if (adhikarana) {
        // Show adhikarana description with full details
        const colors = COLORS[adhyaya.id];
        const isPinned = state.pinned.adhikarana && state.pinned.adhikarana.id === adhikarana.id;

        let detailsHTML = '';

        if (adhikarana.topic) {
            detailsHTML += `
                <div style="margin: 12px 0;">
                    <strong style="color: ${colors.bg};">विषयः (Topic):</strong>
                    <p style="margin: 4px 0 0; line-height: 1.7;">${adhikarana.topic}</p>
                </div>
            `;
        }

        if (adhikarana.samshaya) {
            detailsHTML += `
                <div style="margin: 12px 0;">
                    <strong style="color: ${colors.bg};">संशयः (Doubt):</strong>
                    <p style="margin: 4px 0 0; line-height: 1.7;">${adhikarana.samshaya}</p>
                </div>
            `;
        }

        if (adhikarana.purvapaksha) {
            detailsHTML += `
                <div style="margin: 12px 0;">
                    <strong style="color: ${colors.bg};">पूर्वपक्षः (Objection):</strong>
                    <p style="margin: 4px 0 0; line-height: 1.7;">${adhikarana.purvapaksha}</p>
                </div>
            `;
        }

        if (adhikarana.siddhanta) {
            detailsHTML += `
                <div style="margin: 12px 0;">
                    <strong style="color: ${colors.bg};">सिध्दन्तः (Conclusion):</strong>
                    <p style="margin: 4px 0 0; line-height: 1.7;">${adhikarana.siddhanta}</p>
                </div>
            `;
        }

        if (adhikarana.notes) {
            detailsHTML += `
                <div style="margin: 12px 0;">
                    <strong style="color: ${colors.bg};">Notes:</strong>
                    <p style="margin: 4px 0 0; line-height: 1.7; font-style: italic;">${adhikarana.notes}</p>
                </div>
            `;
        }

        if (adhikarana.references) {
            detailsHTML += `
                <div style="margin: 12px 0;">
                    <strong style="color: ${colors.bg};">References:</strong>
                    <p style="margin: 4px 0 0; line-height: 1.7; font-size: 12px;">${adhikarana.references}</p>
                </div>
            `;
        }

        content.innerHTML = `
            <div class="meaning-display">
                <div class="meaning-meta">
                    <span class="meaning-type-badge" style="border-color: ${colors.bg}; color: ${colors.bg};">ADHIKARAṆA</span>
                    <span class="meaning-parent">in ${adhyaya.name}</span>
                    ${isPinned ? `<span class="meaning-pinned-badge" style="background: ${colors.bg};">PINNED · click to release</span>` : ''}
                    <span class="meaning-id" style="color: ${colors.bg};">${adhikarana.range}</span>
                </div>
                <p class="meaning-title">${adhikarana.name}</p>
                ${detailsHTML || '<p class="meaning-description">Adhikaraṇa details loading...</p>'}
            </div>
        `;
    } else if (adhyaya) {
        // Show adhyaya description
        const colors = COLORS[adhyaya.id];

        content.innerHTML = `
            <div class="meaning-display">
                <div class="meaning-meta">
                    <span class="meaning-type-badge" style="border-color: ${colors.bg}; color: ${colors.bg};">ADHYĀYA</span>
                </div>
                <p class="meaning-title">
                    ${adhyaya.name}
                    <span class="meaning-title-accent" style="color: ${colors.bg};">${adhyaya.title.toUpperCase()}</span>
                </p>
                <p class="meaning-description">${adhyaya.desc || 'Adhyāya description.'}</p>
            </div>
        `;
    } else {
        // Show empty state
        content.innerHTML = `
            <div class="meaning-empty">
                <span>MEANING · OBJECTIVE · COMMENTARY</span>
            </div>
        `;
    }
}

// 3D tilt effect on adhyaya hover
function handle3DTilt(event, element) {
    const rect = element.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;

    const isActive = element.classList.contains('active');
    const z = isActive ? 16 : 8;

    element.style.transition = 'background 0.2s';
    element.style.transform = `perspective(560px) rotateX(${-y * 9}deg) rotateY(${x * 6}deg) translateZ(${z}px)`;
}

function reset3DTilt(element) {
    element.style.transition = 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.25s';
    element.style.transform = 'perspective(560px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
}

// Leave timer management
function clearLeaveTimer() {
    if (state.leaveTimer) {
        clearTimeout(state.leaveTimer);
        state.leaveTimer = null;
    }
}

function startLeaveTimer() {
    state.leaveTimer = setTimeout(() => {
        state.hover.adhyaya = null;
        state.hover.adhikarana = null;
        state.hover.sutra = null;
        updateUI();
    }, 120);
}

// Setup global event listeners
function setupEventListeners() {
    // Columns container leave event
    const container = document.querySelector('.columns-container');
    container.addEventListener('mouseleave', startLeaveTimer);

    // Each column keep event
    ['adhyaya-col', 'adhikarana-col', 'sutra-col'].forEach(id => {
        document.getElementById(id).addEventListener('mouseenter', clearLeaveTimer);
    });

    // Meaning window events
    const meaningWindow = document.getElementById('meaning-window');
    meaningWindow.addEventListener('mouseenter', clearLeaveTimer);
    meaningWindow.addEventListener('mouseleave', startLeaveTimer);

    // Resize handle
    setupResizeHandle();
}

// Setup resize handle for meaning window
function setupResizeHandle() {
    const handle = document.getElementById('resize-handle');
    const content = document.getElementById('meaning-content');

    handle.addEventListener('mousedown', (e) => {
        e.preventDefault();
        const startY = e.clientY;
        const startH = state.meaningHeight;

        function onMove(ev) {
            const delta = startY - ev.clientY;
            const newHeight = startH + delta;
            const clamped = Math.max(60, Math.min(420, newHeight));

            state.meaningHeight = clamped;
            content.style.height = `${clamped}px`;
        }

        function onUp() {
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', onUp);
        }

        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
    });
}

// Start the app
window.addEventListener('DOMContentLoaded', init);

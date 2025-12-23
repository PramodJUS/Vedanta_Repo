// Global variables
let allSutras = [];
let filteredSutras = [];
let sutraDetails = {};
let currentView = 'list'; // 'list' or 'detail'
let currentSpeech = null; // Track current speech synthesis
let currentAudio = null; // Track current audio element
let isSpeaking = false;
let currentLanguage = 'sa'; // Default language (Sanskrit)
let currentSutra = null; // Track current sutra in detail view

// Language translations
const languages = {
    sa: {
        title: 'Brahma Sutras with Madhvacharya\'s Dvaita Vedanta Commentary',
        adhyaya: 'अध्यायः:',
        pada: 'पादः:',
        adhikarana: 'अधिकरणम्:',
        allTopics: 'सर्वम्',
        searchPlaceholder: 'Search sutras...',
        vedantaPhilosophy: 'वेदान्त दर्शनम्',
        infoText: 'The Brahma Sutras (ब्रह्मसूत्राणि), also known as Vedanta Sutras, are foundational texts of Vedanta philosophy composed by Sage Badarayana (Vyasa). This presentation follows <strong>Madhvacharya\'s Dvaita (Dualistic) Vedanta</strong> interpretation.',
        dvaitaPrinciples: 'द्वैत वेदान्त सिद्धान्ताः',
        backToList: '← Back to List',
        meaning: 'अर्थः (Meaning)',
        commentary: 'द्वैत वेदान्त व्याख्या (Dvaita Vedanta Commentary)',
        references: 'References:',
        loading: 'Loading sutras...',
        noResults: 'No sutras found for the selected criteria.',
        footer: 'Based on Madhvacharya\'s Brahma Sutra Bhashya | For educational purposes',
        sutraLabel: 'Sutra',
        adhyayaNames: {
            '1': 'प्रथमाध्यायः',
            '2': 'द्वितीयाध्यायः',
            '3': 'तृतीयाध्यायः',
            '4': 'चतुर्थाध्यायः'
        },
        padaNames: {
            '1': 'प्रथमः पादः',
            '2': 'द्वितीयः पादः',
            '3': 'तृतीयः पादः',
            '4': 'चतुर्थः पादः'
        },
        adhyayaOptions: {
            '1': 'प्रथमः (Samanvaya - Harmony)',
            '2': 'द्वितीयः (Avirodha - Non-Conflict)',
            '3': 'तृतीयः (Sadhana - Means)',
            '4': 'चतुर्थः (Phala - Result)'
        },
        padaOptions: {
            '1': 'प्रथमः',
            '2': 'द्वितीयः',
            '3': 'तृतीयः',
            '4': 'चतुर्थः'
        }
    },
    kn: {
        // Only actual Kannada UI translations (not Sanskrit transliterations)
        title: 'ಮಧ್ವಾಚಾರ್ಯರ ದ್ವೈತ ವೇದಾಂತ ವ್ಯಾಖ್ಯಾನದೊಂದಿಗೆ ಬ್ರಹ್ಮಸೂತ್ರಗಳು',
        allTopics: 'ಎಲ್ಲಾ ವಿಷಯಗಳು',
        searchPlaceholder: 'ಸೂತ್ರಗಳನ್ನು ಹುಡುಕಿ...',
        infoText: 'ಬ್ರಹ್ಮಸೂತ್ರಗಳು (ब्रह्मसूत्राणि), ವೇದಾಂತ ಸೂತ್ರಗಳು ಎಂದೂ ಕರೆಯಲ್ಪಡುತ್ತವೆ, ಇವು ಮಹರ್ಷಿ ಬಾದರಾಯಣರು (ವ್ಯಾಸರು) ರಚಿಸಿದ ವೇದಾಂತ ತತ್ತ್ವಶಾಸ್ತ್ರದ ಮೂಲಗ್ರಂಥಗಳು. ಈ ಪ್ರಸ್ತುತಿಯು <strong>ಮಧ್ವಾಚಾರ್ಯರ ದ್ವೈತ ವೇದಾಂತ</strong> ವ್ಯಾಖ್ಯಾನವನ್ನು ಅನುಸರಿಸುತ್ತದೆ.',
        backToList: '← ಪಟ್ಟಿಗೆ ಹಿಂತಿರುಗಿ',
        references: 'ಉಲ್ಲೇಖಗಳು:',
        loading: 'ಸೂತ್ರಗಳನ್ನು ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ...',
        noResults: 'ಆಯ್ದ ಮಾನದಂಡಕ್ಕಾಗಿ ಯಾವುದೇ ಸೂತ್ರಗಳು ಕಂಡುಬಂದಿಲ್ಲ.',
        footer: 'ಮಧ್ವಾಚಾರ್ಯರ ಬ್ರಹ್ಮಸೂತ್ರ ಭಾಷ್ಯವನ್ನು ಆಧರಿಸಿ | ಶೈಕ್ಷಣಿಕ ಉದ್ದೇಶಗಳಿಗಾಗಿ',
        // Kannada explanations for adhyaya/pada options
        adhyayaExplanations: {
            '1': 'ಸಮನ್ವಯ',
            '2': 'ಅವಿರೋಧ',
            '3': 'ಸಾಧನ',
            '4': 'ಫಲ'
        }
    },
    te: {
        // Telugu UI translations
        title: 'మధ్వాచార్యుల ద్వైత వేదాంత వ్యాఖ్యానంతో బ్రహ్మసూత్రాలు',
        allTopics: 'అన్ని విషయాలు',
        searchPlaceholder: 'సూత్రాలను వెతకండి...',
        infoText: 'బ్రహ్మసూత్రాలు (ब्रह्मसूत्राणि), వేదాంత సూత్రాలు అని కూడా పిలుస్తారు, ఇవి మహర్షి బాదరాయణుడు (వ్యాసుడు) రచించిన వేదాంత తత్వశాస్త్ర మూల గ్రంథాలు. ఈ ప్రదర్శన <strong>మధ్వాచార్యుల ద్వైత వేదాంత</strong> వ్యాఖ్యానాన్ని అనుసరిస్తుంది.',
        backToList: '← జాబితాకు తిరిగి వెళ్ళండి',
        references: 'సూచనలు:',
        loading: 'సూత్రాలు లోడ్ అవుతున్నాయి...',
        noResults: 'ఎంచుకున్న ప్రమాణాల కోసం సూత్రాలు కనుగొనబడలేదు.',
        footer: 'మధ్వాచార్యుల బ్రహ్మసూత్ర భాష్యం ఆధారంగా | విద్యా ప్రయోజనాల కోసం',
        // Telugu explanations for adhyaya/pada options
        adhyayaExplanations: {
            '1': 'సమన్వయ',
            '2': 'అవిరోధ',
            '3': 'సాధన',
            '4': 'ఫల'
        }
    }
};

// DOM Elements
const languageSelect = document.getElementById('language');
const adhyayaSelect = document.getElementById('adhyaya');
const padaSelect = document.getElementById('pada');
const adhikaranaSelect = document.getElementById('adhikarana');
const searchInput = document.getElementById('searchInput');
const sutraList = document.getElementById('sutraList');
const sutraDetail = document.getElementById('sutraDetail');
const detailContent = document.getElementById('detailContent');
const backButton = document.getElementById('backButton');
const sectionHeading = document.getElementById('sectionHeading');
const sectionTitle = document.getElementById('sectionTitle');
const collapseIcon = document.getElementById('collapseIcon');

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    // Load saved language preference
    const savedLanguage = localStorage.getItem('vedantaLanguage') || 'sa';
    currentLanguage = savedLanguage;
    if (languageSelect) {
        languageSelect.value = savedLanguage;
    }
    
    loadSutras();
    setupEventListeners();
    updateUILanguage();
    
    // Load voices for speech synthesis
    if ('speechSynthesis' in window) {
        // Voices load asynchronously, wait for them
        window.speechSynthesis.onvoiceschanged = () => {
            const voices = window.speechSynthesis.getVoices();
            console.log('=== Available Voices ===');
            voices.forEach(v => console.log(v.name, v.lang));
            console.log('========================');
        };
        // Trigger immediately in case voices are already loaded
        setTimeout(() => {
            const voices = window.speechSynthesis.getVoices();
            if (voices.length > 0) {
                console.log('=== Available Voices ===');
                voices.forEach(v => console.log(v.name, v.lang));
                console.log('========================');
            }
        }, 100);
    }
});

// Setup event listeners
function setupEventListeners() {
    if (languageSelect) {
        languageSelect.addEventListener('change', onLanguageChange);
    }
    adhyayaSelect.addEventListener('change', onAdhyayaChange);
    padaSelect.addEventListener('change', onPadaChange);
    adhikaranaSelect.addEventListener('change', filterSutras);
    searchInput.addEventListener('input', debounce(searchSutras, 300));
    backButton.addEventListener('click', showListView);
    sectionHeading.addEventListener('click', toggleSutraList);
    
    // Heading audio button
    const headingAudioBtn = document.getElementById('headingAudioBtn');
    if (headingAudioBtn) {
        headingAudioBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent collapse/expand
            playAllSutras();
        });
    }
    
    // Speed slider
    const speedSlider = document.getElementById('speedSlider');
    const speedValue = document.getElementById('speedValue');
    if (speedSlider && speedValue) {
        speedSlider.addEventListener('input', (e) => {
            e.stopPropagation(); // Prevent collapse/expand
            speedValue.textContent = parseFloat(e.target.value).toFixed(2) + 'x';
        });
        // Prevent mousedown/click from toggling collapse
        speedSlider.addEventListener('mousedown', (e) => {
            e.stopPropagation();
        });
        speedSlider.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }
}

// Handle language change
function onLanguageChange() {
    currentLanguage = languageSelect.value;
    localStorage.setItem('vedantaLanguage', currentLanguage);
    updateUILanguage();
    
    // Refresh adhikarana dropdown in both views
    populateAdhikaranaDropdown();
    
    // Refresh current view
    if (currentView === 'list') {
        filterSutras();
    } else if (currentView === 'detail' && currentSutra) {
        // Refresh detail view with new language
        showSutraDetail(currentSutra);
    }
}

// Get language-specific text (with transliteration for Sanskrit terms)
function getLocalizedText(key, targetLang = currentLanguage) {
    const baseLang = languages['sa'];
    const langOverrides = languages[targetLang];
    
    // If key exists in language-specific overrides, use it
    if (langOverrides && langOverrides[key]) {
        return langOverrides[key];
    }
    
    // Otherwise, transliterate from Sanskrit
    if (baseLang[key]) {
        return targetLang !== 'sa' ? transliterateText(baseLang[key], targetLang) : baseLang[key];
    }
    
    return '';
}

// Update all UI text based on selected language
function updateUILanguage() {
    const lang = languages[currentLanguage];
    const baseLang = languages['sa'];
    
    // Update page title and subtitle
    const subtitle = document.querySelector('.subtitle');
    if (subtitle) {
        subtitle.textContent = lang.title || baseLang.title;
    }
    
    // Update navigation labels (transliterate Sanskrit terms)
    const adhyayaLabel = document.querySelector('.adhyaya-selector label');
    if (adhyayaLabel) adhyayaLabel.textContent = getLocalizedText('adhyaya');
    
    const padaLabel = document.querySelector('.pada-selector label');
    if (padaLabel) padaLabel.textContent = getLocalizedText('pada');
    
    const adhikaranaLabel = document.querySelector('.adhikarana-selector label');
    if (adhikaranaLabel) adhikaranaLabel.textContent = getLocalizedText('adhikarana');
    
    // Update search placeholder
    if (searchInput) {
        searchInput.placeholder = lang.searchPlaceholder || baseLang.searchPlaceholder;
    }
    
    // Update adhyaya options (transliterate + add Kannada explanation if available)
    if (adhyayaSelect) {
        const selectedValue = adhyayaSelect.value;
        adhyayaSelect.innerHTML = '';
        Object.keys(baseLang.adhyayaOptions).forEach(key => {
            const option = document.createElement('option');
            option.value = key;
            const baseOption = baseLang.adhyayaOptions[key];
            if (currentLanguage !== 'sa') {
                // Extract Sanskrit part and English part
                const match = baseOption.match(/^(.+?)\s*\((.+)\)$/);
                if (match) {
                    const sanskritPart = transliterateText(match[1], currentLanguage);
                    const explanation = lang.adhyayaExplanations?.[key] || match[2];
                    option.textContent = `${sanskritPart} (${explanation})`;
                } else {
                    option.textContent = transliterateText(baseOption, currentLanguage);
                }
            } else {
                option.textContent = baseOption;
            }
            adhyayaSelect.appendChild(option);
        });
        adhyayaSelect.value = selectedValue;
    }
    
    // Update pada options (transliterate)
    if (padaSelect) {
        const selectedValue = padaSelect.value;
        padaSelect.innerHTML = '';
        Object.keys(baseLang.padaOptions).forEach(key => {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = currentLanguage !== 'sa' ? transliterateText(baseLang.padaOptions[key], currentLanguage) : baseLang.padaOptions[key];
            padaSelect.appendChild(option);
        });
        padaSelect.value = selectedValue;
    }
    
    // Update info panel
    const infoPanelH2 = document.querySelector('.info-panel h2');
    if (infoPanelH2) infoPanelH2.textContent = getLocalizedText('vedantaPhilosophy');
    
    const infoText = document.querySelector('.info-text');
    if (infoText) infoText.innerHTML = lang.infoText || baseLang.infoText;
    
    const philosophyBoxH3 = document.querySelector('.philosophy-box h3');
    if (philosophyBoxH3) philosophyBoxH3.textContent = getLocalizedText('dvaitaPrinciples');
    
    // Update philosophy box list items (transliterate Sanskrit terms)
    const philosophyItems = document.querySelectorAll('.philosophy-box li');
    const sanskritTerms = [
        'पञ्चभेद:',
        'स्वतन्त्र-परतन्त्र:',
        'विष्णु-सर्वोत्तमता:',
        'तत्त्ववाद:'
    ];
    const englishDescriptions = [
        'Five-fold eternal difference',
        'Independent Brahman, dependent jīva',
        'Supremacy of Vishnu',
        'Realism - differences are real'
    ];
    
    philosophyItems.forEach((item, index) => {
        if (index < sanskritTerms.length) {
            const transliteratedTerm = currentLanguage !== 'sa' ? 
                transliterateText(sanskritTerms[index], currentLanguage) : 
                sanskritTerms[index];
            item.innerHTML = `<strong>${transliteratedTerm}</strong> ${englishDescriptions[index]}`;
        }
    });
    
    // Update back button
    if (backButton) {
        backButton.textContent = lang.backToList || baseLang.backToList;
    }
    
    // Update footer
    const footer = document.querySelector('footer p');
    if (footer) {
        footer.textContent = lang.footer || baseLang.footer;
    }
}

// Load sutras from CSV and JSON
async function loadSutras() {
    try {
        showLoading();
        
        // Load CSV data
        const csvResponse = await fetch('sutra/bs.csv');
        const csvText = await csvResponse.text();
        allSutras = parseCSV(csvText);
        
        // Load JSON details
        try {
            const jsonResponse = await fetch('sutra/sutra-details.json');
            sutraDetails = await jsonResponse.json();
        } catch (jsonError) {
            console.warn('Sutra details JSON not found, using placeholders:', jsonError);
            sutraDetails = {};
        }
        
        populateAdhikaranaDropdown();
        filterSutras();
    } catch (error) {
        console.error('Error loading sutras:', error);
        showError('Error loading sutras. Please check if the CSV file exists.');
    }
}

// Parse CSV data
function parseCSV(csvText) {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',');
    const sutras = [];

    for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        if (values.length === headers.length) {
            const sutra = {};
            headers.forEach((header, index) => {
                sutra[header.trim()] = values[index].trim();
            });
            sutras.push(sutra);
        }
    }

    return sutras;
}

// Parse a single CSV line (handles quotes and commas)
function parseCSVLine(line) {
    const values = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            values.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    
    values.push(current);
    return values;
}

// Handle adhyaya change
function onAdhyayaChange() {
    onPadaChange();
}

// Handle pada change
function onPadaChange() {
    populateAdhikaranaDropdown();
    filterSutras();
}

// Populate adhikarana dropdown based on selected adhyaya and pada
function populateAdhikaranaDropdown() {
    const selectedAdhyaya = adhyayaSelect.value;
    const selectedPada = padaSelect.value;
    const lang = languages[currentLanguage];
    const baseLang = languages['sa'];
    
    // Get unique adhikaranas for the selected adhyaya and pada
    const adhikaranas = [...new Set(
        allSutras
            .filter(sutra => sutra.adhyaya === selectedAdhyaya && sutra.pada === selectedPada)
            .map(sutra => sutra.adhikarana)
    )];
    
    // Clear and populate adhikarana dropdown
    adhikaranaSelect.innerHTML = `<option value="all">${lang.allTopics || baseLang.allTopics}</option><option disabled>──────────</option>`;
    adhikaranas.forEach(adhikarana => {
        const option = document.createElement('option');
        option.value = adhikarana;
        option.textContent = currentLanguage !== 'sa' ? transliterateText(adhikarana, currentLanguage) : adhikarana;
        adhikaranaSelect.appendChild(option);
    });
}

// Filter sutras based on selected adhyaya, pada, and adhikarana
function filterSutras() {
    const selectedAdhyaya = adhyayaSelect.value;
    const selectedPada = padaSelect.value;
    const selectedAdhikarana = adhikaranaSelect.value;

    filteredSutras = allSutras.filter(sutra => {
        const matchesAdhyayaPada = sutra.adhyaya === selectedAdhyaya && sutra.pada === selectedPada;
        const matchesAdhikarana = selectedAdhikarana === 'all' || sutra.adhikarana === selectedAdhikarana;
        return matchesAdhyayaPada && matchesAdhikarana;
    });

    searchInput.value = ''; // Clear search when filtering
    updateSectionHeading(selectedAdhyaya, selectedPada);
    displaySutras(filteredSutras);
}

// Update section heading with Sanskrit names
function updateSectionHeading(adhyaya, pada) {
    const baseLang = languages['sa'];
    const adhyayaName = currentLanguage !== 'sa' ? 
                        transliterateText(baseLang.adhyayaNames[adhyaya], currentLanguage) : 
                        baseLang.adhyayaNames[adhyaya];
    const padaName = currentLanguage !== 'sa' ? 
                     transliterateText(baseLang.padaNames[pada], currentLanguage) : 
                     baseLang.padaNames[pada];
    sectionTitle.textContent = `${adhyayaName}, ${padaName}`;
}

// Toggle sutra list visibility
function toggleSutraList() {
    if (currentView !== 'list') return; // Only toggle in list view
    
    if (sutraList.style.display === 'none') {
        sutraList.style.display = 'flex';
        collapseIcon.textContent = '▼';
    } else {
        sutraList.style.display = 'none';
        collapseIcon.textContent = '▶';
    }
}

// Search sutras
function searchSutras() {
    const searchTerm = searchInput.value.trim();

    if (searchTerm === '') {
        filterSutras();
        return;
    }

    // Normalize search term (remove zero-width characters and normalize Unicode)
    const normalizedSearchTerm = searchTerm
        .replace(/[\u200B-\u200D\uFEFF]/g, '') // Remove zero-width characters
        .normalize('NFC'); // Normalize Unicode to composed form

    const searchResults = allSutras.filter(sutra => {
        // Remove ॐ symbols and normalize text for cleaner search
        const cleanSutraText = sutra.sutra_text
            .replace(/ॐ/g, '')
            .replace(/[\u200B-\u200D\uFEFF]/g, '')
            .normalize('NFC')
            .trim();
        const cleanAdhikarana = sutra.adhikarana
            .replace(/ॐ/g, '')
            .replace(/[\u200B-\u200D\uFEFF]/g, '')
            .normalize('NFC')
            .trim();
        
        // Also search in transliterated text if in non-Sanskrit language
        let transliteratedSutraText = cleanSutraText;
        let transliteratedAdhikarana = cleanAdhikarana;
        if (currentLanguage !== 'sa') {
            transliteratedSutraText = transliterateText(cleanSutraText, currentLanguage);
            transliteratedAdhikarana = transliterateText(cleanAdhikarana, currentLanguage);
        }
        
        return (
            cleanSutraText.includes(normalizedSearchTerm) ||
            cleanAdhikarana.includes(normalizedSearchTerm) ||
            transliteratedSutraText.includes(normalizedSearchTerm) ||
            transliteratedAdhikarana.includes(normalizedSearchTerm) ||
            sutra.sutra_number.toString().includes(normalizedSearchTerm)
        );
    });

    displaySutras(searchResults);
}

// Display sutras in the UI
function displaySutras(sutras) {
    if (sutras.length === 0) {
        showNoResults();
        return;
    }

    const html = sutras.map((sutra, index) => createSutraLink(sutra, index)).join('');
    sutraList.innerHTML = html;
    
    // Add click listeners to all sutra links
    document.querySelectorAll('.sutra-link').forEach((link, index) => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            showSutraDetail(sutras[index]);
        });
    });
}

// Create a clickable sutra link
function createSutraLink(sutra, index) {
    const sutraText = currentLanguage !== 'sa' ? transliterateText(sutra.sutra_text, currentLanguage) : sutra.sutra_text;
    const adhikaranaText = currentLanguage !== 'sa' ? transliterateText(sutra.adhikarana, currentLanguage) : sutra.adhikarana;
    
    return `
        <a href="#" class="sutra-link" data-index="${index}">
            <div class="sutra-link-number">
                ${sutra.adhyaya}.${sutra.pada}.${sutra.sutra_number}
            </div>
            <div class="sutra-link-text">
                ${sutraText}
            </div>
            <div class="sutra-link-adhikarana">
                ${adhikaranaText}
            </div>
            <div class="arrow">→</div>
        </a>
    `;
}

// Show detailed view of a sutra
function showSutraDetail(sutra) {
    currentView = 'detail';
    currentSutra = sutra; // Store current sutra
    sutraList.style.display = 'none';
    sutraDetail.style.display = 'block';
    
    // Hide heading controls and search in detail view
    const headingControls = document.querySelector('.heading-controls');
    if (headingControls) {
        headingControls.style.display = 'none';
    }
    if (searchInput) {
        searchInput.style.display = 'none';
    }
    
    // Disable dropdowns in detail view
    if (adhyayaSelect) adhyayaSelect.disabled = true;
    if (padaSelect) padaSelect.disabled = true;
    if (adhikaranaSelect) adhikaranaSelect.disabled = true;
    
    // Stop any playing speech when switching views
    stopSpeech();
    
    // Get details from JSON using sutra key
    const sutraKey = `${sutra.adhyaya}.${sutra.pada}.${sutra.sutra_number}`;
    const details = sutraDetails[sutraKey] || {};
    
    const lang = languages[currentLanguage] || languages['sa'];
    const baseLang = languages['sa'];
    
    // Get language-specific content
    // For Kannada and Telugu: use manual translation if available, otherwise show English
    let meaning, meaningDetails, commentary;
    if (currentLanguage === 'kn') {
        meaning = details.meaningKn || details.meaning;
        meaningDetails = details.meaningDetailsKn || details.meaningDetails;
        commentary = details.commentaryKn || details.commentary;
    } else if (currentLanguage === 'te') {
        meaning = details.meaningTe || details.meaning;
        meaningDetails = details.meaningDetailsTe || details.meaningDetails;
        commentary = details.commentaryTe || details.commentary;
    } else {
        meaning = details.meaning;
        meaningDetails = details.meaningDetails;
        commentary = details.commentary;
    }
    
    // Transliterate text based on selected language
    const sutraText = currentLanguage !== 'sa' ? transliterateText(sutra.sutra_text, currentLanguage) : sutra.sutra_text;
    const adhikaranaText = currentLanguage !== 'sa' ? transliterateText(sutra.adhikarana, currentLanguage) : sutra.adhikarana;
    
    // Build meaning section
    const meaningLabel = currentLanguage !== 'sa' ? 
                         transliterateText('अर्थः', currentLanguage) + ' (Meaning)' : 
                         baseLang.meaning;
    let meaningHTML = `<h3>${meaningLabel}</h3>`;
    if (meaning) {
        meaningHTML += `<div class="audio-controls"><button class="audio-btn" id="meaningAudio" title="Play meaning">🔊</button></div>`;
        meaningHTML += `<p class="main-meaning">${meaning}</p>`;
        if (meaningDetails && meaningDetails.length > 0) {
            meaningHTML += '<ul class="meaning-details">';
            meaningDetails.forEach(detail => {
                meaningHTML += `<li>${detail}</li>`;
            });
            meaningHTML += '</ul>';
        }
    } else {
        meaningHTML += '<p class="placeholder">The meaning of the sutra comes here</p>';
    }
    
    // Build commentary section
    const commentaryLabel = currentLanguage !== 'sa' ? 
                           transliterateText('द्वैत वेदान्त व्याख्या', currentLanguage) + ' (Dvaita Vedanta Commentary)' : 
                           baseLang.commentary;
    const referencesLabel = lang.references || baseLang.references;
    let commentaryHTML = `<h3>${commentaryLabel}</h3>`;
    if (commentary) {
        commentaryHTML += `<div class="audio-controls"><button class="audio-btn" id="commentaryAudio" title="Play commentary">🔊</button></div>`;
        commentaryHTML += `<p>${commentary}</p>`;
        if (details.references && details.references.length > 0) {
            commentaryHTML += `<div class="references"><strong>${referencesLabel}</strong> `;
            commentaryHTML += details.references.join(', ');
            commentaryHTML += '</div>';
        }
    } else {
        commentaryHTML += '<p class="placeholder">The Madhva commentary on this sutra comes here</p>';
    }
    
    const sutraLabel = currentLanguage !== 'sa' ? 
                       transliterateText('सूत्रम्', currentLanguage) : 
                       baseLang.sutraLabel;
    detailContent.innerHTML = `
        <div class="detail-header">
            <div class="detail-number">
                ${sutra.adhyaya}.${sutra.pada}.${sutra.sutra_number}
            </div>
            <div class="detail-adhikarana">
                ${adhikaranaText}
            </div>
        </div>
        <div class="detail-sutra">
            <h3>${sutraLabel}</h3>
            <div class="audio-controls">
                <button class="audio-btn" id="sutraAudio" title="Play sutra">🔊</button>
            </div>
            <p class="sutra-text">${sutraText}</p>
        </div>
        <div class="detail-meaning">
            ${meaningHTML}
        </div>
        <div class="detail-commentary">
            ${commentaryHTML}
        </div>
    `;
    
    // Add event listeners for audio buttons
    setTimeout(() => {
        const sutraAudioBtn = document.getElementById('sutraAudio');
        if (sutraAudioBtn) {
            sutraAudioBtn.addEventListener('click', () => {
                const audioFile = `sutra/audio/${sutra.adhyaya}.${sutra.pada}.${sutra.sutra_number}.mp3`;
                playAudio(sutra.sutra_text, 'hi-IN', 'sutraAudio', audioFile);
            });
        }
        
        const meaningAudioBtn = document.getElementById('meaningAudio');
        if (meaningAudioBtn && details.meaning) {
            meaningAudioBtn.addEventListener('click', () => {
                playAudio(details.meaning, 'en-US', 'meaningAudio');
            });
        }
        
        const commentaryAudioBtn = document.getElementById('commentaryAudio');
        if (commentaryAudioBtn && details.commentary) {
            commentaryAudioBtn.addEventListener('click', () => {
                playAudio(details.commentary, 'en-US', 'commentaryAudio');
            });
        }
    }, 0);
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Show list view
function showListView() {
    currentView = 'list';
    currentSutra = null; // Clear current sutra
    sutraDetail.style.display = 'none';
    sutraList.style.display = 'flex';
    
    // Show heading controls and search in list view
    const headingControls = document.querySelector('.heading-controls');
    if (headingControls) {
        headingControls.style.display = 'flex';
    }
    if (searchInput) {
        searchInput.style.display = 'block';
    }
    
    // Enable dropdowns in list view
    if (adhyayaSelect) adhyayaSelect.disabled = false;
    if (padaSelect) padaSelect.disabled = false;
    if (adhikaranaSelect) adhikaranaSelect.disabled = false;
    
    // Refresh the list with current language
    displaySutras(filteredSutras);
    
    stopSpeech(); // Stop any playing audio
}

// Show loading message
function showLoading() {
    const lang = languages[currentLanguage];
    const baseLang = languages['sa'];
    sutraList.innerHTML = `<div class="loading">${lang.loading || baseLang.loading}</div>`;
}

// Show error message
function showError(message) {
    sutraList.innerHTML = `<div class="no-results">${message}</div>`;
}

// Show no results message
function showNoResults() {
    const lang = languages[currentLanguage];
    const baseLang = languages['sa'];
    sutraList.innerHTML = `<div class="no-results">${lang.noResults || baseLang.noResults}</div>`;
}

// Debounce function for search
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Text-to-Speech and Audio functions
async function playAudio(text, lang = 'hi-IN', buttonId = null, audioFile = null) {
    // Stop any ongoing playback
    if (isSpeaking || currentAudio) {
        stopSpeech();
        if (buttonId) {
            updateSpeechButton(buttonId, false);
        }
        return;
    }
    
    // Try to play MP3 file first if provided
    if (audioFile) {
        try {
            currentAudio = new Audio(audioFile);
            
            currentAudio.onloadeddata = () => {
                isSpeaking = true;
                if (buttonId) {
                    updateSpeechButton(buttonId, true);
                }
                currentAudio.play();
            };
            
            currentAudio.onended = () => {
                isSpeaking = false;
                currentAudio = null;
                if (buttonId) {
                    updateSpeechButton(buttonId, false);
                }
            };
            
            currentAudio.onerror = () => {
                // MP3 failed, fall back to TTS
                console.log(`MP3 file not found: ${audioFile}, using TTS`);
                currentAudio = null;
                speakText(text, lang, buttonId);
            };
            
            return; // Exit if MP3 loading started
        } catch (error) {
            console.log('Error loading MP3, using TTS:', error);
            currentAudio = null;
        }
    }
    
    // Fall back to TTS
    speakText(text, lang, buttonId);
}

// Text-to-Speech functions
function speakText(text, lang = 'hi-IN', buttonId = null) {
    // Stop any ongoing speech
    if (isSpeaking) {
        stopSpeech();
        if (buttonId) {
            updateSpeechButton(buttonId, false);
        }
        return;
    }
    
    if ('speechSynthesis' in window) {
        currentSpeech = new SpeechSynthesisUtterance(text);
        currentSpeech.lang = lang;
        // Get speed from slider
        const speedSlider = document.getElementById('speedSlider');
        currentSpeech.rate = speedSlider ? parseFloat(speedSlider.value) : 1.0;
        currentSpeech.pitch = 0.5; // Lower pitch for masculine voice
        
        // Get available voices and select a male voice
        const voices = window.speechSynthesis.getVoices();
        let selectedVoice = null;
        
        if (voices.length > 0) {
            // For Hindi, prefer Google Hindi voice
            if (lang.startsWith('hi')) {
                selectedVoice = voices.find(voice => 
                    voice.name.includes('Google हिन्दी') || 
                    voice.name.includes('Google Hindi') ||
                    voice.lang === 'hi-IN' ||
                    voice.lang.startsWith('hi')
                );
            }
            
            // For English, prefer Google US English Male or David
            if (!selectedVoice && lang.startsWith('en')) {
                selectedVoice = voices.find(voice => 
                    voice.name.includes('Google US English Male') ||
                    voice.name.includes('Microsoft David')
                );
            }
            
            // First fallback: Look for explicitly male voices
            if (!selectedVoice) {
                selectedVoice = voices.find(voice => 
                    voice.lang.startsWith(lang.split('-')[0]) && 
                    (voice.name.toLowerCase().includes('male') || 
                     voice.name.toLowerCase().includes('man'))
                );
            }
            
            // Second fallback: Look for specific male voice names
            if (!selectedVoice) {
                selectedVoice = voices.find(voice => 
                    voice.lang.startsWith(lang.split('-')[0]) && 
                    (voice.name.toLowerCase().includes('david') ||
                     voice.name.toLowerCase().includes('james') ||
                     voice.name.toLowerCase().includes('mark') ||
                     voice.name.toLowerCase().includes('rishi') ||
                     voice.name.toLowerCase().includes('hemant'))
                );
            }
            
            // Final fallback: Any voice for the language
            if (!selectedVoice) {
                selectedVoice = voices.find(voice => voice.lang.startsWith(lang.split('-')[0]));
            }
            
            if (selectedVoice) {
                currentSpeech.voice = selectedVoice;
                console.log('Using voice:', selectedVoice.name, selectedVoice.lang);
            }
        }
        
        currentSpeech.onstart = () => {
            isSpeaking = true;
            if (buttonId) {
                updateSpeechButton(buttonId, true);
            }
        };
        
        currentSpeech.onend = () => {
            isSpeaking = false;
            currentSpeech = null;
            if (buttonId) {
                updateSpeechButton(buttonId, false);
            }
        };
        
        currentSpeech.onerror = () => {
            isSpeaking = false;
            currentSpeech = null;
            if (buttonId) {
                updateSpeechButton(buttonId, false);
            }
        };
        
        window.speechSynthesis.speak(currentSpeech);
    } else {
        alert('Text-to-speech is not supported in your browser.');
    }
}

function stopSpeech() {
    if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
    }
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        currentAudio = null;
    }
    isSpeaking = false;
    currentSpeech = null;
    
    // Reset the heading audio button state
    const headingBtn = document.getElementById('headingAudioBtn');
    if (headingBtn) {
        headingBtn.textContent = '🔊';
        headingBtn.title = 'Play all sutras';
    }
    
    // Reset playback state
    isPlayingSequence = false;
    currentPlaybackIndex = 0;
    currentRepeatCount = 0;
}

function updateSpeechButton(buttonId, isPlaying) {
    const button = document.getElementById(buttonId);
    if (button) {
        button.textContent = isPlaying ? '⏸️' : '🔊';
        button.title = isPlaying ? 'Stop' : 'Play';
    }
}

// Play all sutras in sequence
let currentPlaybackIndex = 0;
let currentRepeatCount = 0;
let isPlayingSequence = false;

function playAllSutras() {
    const headingBtn = document.getElementById('headingAudioBtn');
    const repeatSelect = document.getElementById('repeatSelect');
    
    // Stop if already playing
    if (isPlayingSequence) {
        stopSequentialPlayback();
        return;
    }
    
    if (filteredSutras.length === 0) {
        alert('No sutras to play');
        return;
    }
    
    isPlayingSequence = true;
    currentPlaybackIndex = 0;
    currentRepeatCount = 0;
    
    if (headingBtn) {
        headingBtn.textContent = '⏸️';
        headingBtn.title = 'Stop playback';
    }
    
    playNextSutra();
}

function playNextSutra() {
    if (!isPlayingSequence || currentPlaybackIndex >= filteredSutras.length) {
        stopSequentialPlayback();
        return;
    }
    
    // Remove highlight from all sutras
    document.querySelectorAll('.sutra-link').forEach(link => {
        link.classList.remove('playing');
    });
    
    // Highlight current sutra
    const currentSutraLink = document.querySelectorAll('.sutra-link')[currentPlaybackIndex];
    if (currentSutraLink) {
        currentSutraLink.classList.add('playing');
        // Scroll into view
        currentSutraLink.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    
    const repeatSelect = document.getElementById('repeatSelect');
    const maxRepeats = parseInt(repeatSelect?.value || '1');
    
    const sutra = filteredSutras[currentPlaybackIndex];
    const audioFile = `sutra/audio/${sutra.adhyaya}.${sutra.pada}.${sutra.sutra_number}.mp3`;
    
    // Check if MP3 exists
    const audio = new Audio(audioFile);
    
    audio.onloadeddata = () => {
        audio.play();
    };
    
    audio.onended = () => {
        currentRepeatCount++;
        const speedSlider = document.getElementById('speedSlider');
        const speed = speedSlider ? parseFloat(speedSlider.value) : 1.0;
        const delay = 500 / speed; // Adjust gap based on speed
        
        if (currentRepeatCount < maxRepeats) {
            // Repeat the same sutra
            setTimeout(() => playNextSutra(), delay);
        } else {
            // Move to next sutra
            currentRepeatCount = 0;
            currentPlaybackIndex++;
            setTimeout(() => playNextSutra(), delay);
        }
    };
    
    audio.onerror = () => {
        // Use TTS if MP3 not found
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(sutra.sutra_text);
            utterance.lang = 'hi-IN';
            const speedSlider = document.getElementById('speedSlider');
            utterance.rate = speedSlider ? parseFloat(speedSlider.value) : 1.0;
            utterance.pitch = 0.5;
            
            const voices = window.speechSynthesis.getVoices();
            const hindiVoice = voices.find(v => 
                v.name.includes('Google हिन्दी') || 
                v.name.includes('Google Hindi')
            );
            if (hindiVoice) {
                utterance.voice = hindiVoice;
            }
            
            utterance.onend = () => {
                currentRepeatCount++;
                const speedSlider = document.getElementById('speedSlider');
                const speed = speedSlider ? parseFloat(speedSlider.value) : 1.0;
                const delay = 500 / speed; // Adjust gap based on speed
                
                if (currentRepeatCount < maxRepeats) {
                    // Repeat the same sutra
                    setTimeout(() => playNextSutra(), delay);
                } else {
                    // Move to next sutra
                    currentRepeatCount = 0;
                    currentPlaybackIndex++;
                    setTimeout(() => playNextSutra(), delay);
                }
            };
            
            window.speechSynthesis.speak(utterance);
        } else {
            currentRepeatCount = 0;
            currentPlaybackIndex++;
            playNextSutra();
        }
    };
}

function stopSequentialPlayback() {
    isPlayingSequence = false;
    currentPlaybackIndex = 0;
    currentRepeatCount = 0;
    
    // Remove highlight from all sutras
    document.querySelectorAll('.sutra-link').forEach(link => {
        link.classList.remove('playing');
    });
    
    const headingBtn = document.getElementById('headingAudioBtn');
    if (headingBtn) {
        headingBtn.textContent = '🔊';
        headingBtn.title = 'Play all sutras';
    }
    
    stopSpeech();
}

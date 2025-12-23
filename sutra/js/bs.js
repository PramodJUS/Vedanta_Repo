// Global variables
let allSutras = [];
let filteredSutras = [];
let sutraDetails = {};
let currentView = 'list'; // 'list' or 'detail'
let currentSpeech = null; // Track current speech synthesis
let currentAudio = null; // Track current audio element
let isSpeaking = false;

// DOM Elements
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
    loadSutras();
    setupEventListeners();
    
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

// Load sutras from CSV file
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
    
    // Get unique adhikaranas for the selected adhyaya and pada
    const adhikaranas = [...new Set(
        allSutras
            .filter(sutra => sutra.adhyaya === selectedAdhyaya && sutra.pada === selectedPada)
            .map(sutra => sutra.adhikarana)
    )];
    
    // Clear and populate adhikarana dropdown
    adhikaranaSelect.innerHTML = '<option value="all">सर्वाणि (All Topics)</option><option disabled>──────────</option>';
    adhikaranas.forEach(adhikarana => {
        const option = document.createElement('option');
        option.value = adhikarana;
        option.textContent = adhikarana;
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
    const adhyayaNames = {
        '1': 'प्रथमाध्यायः',
        '2': 'द्वितीयाध्यायः',
        '3': 'तृतीयाध्यायः',
        '4': 'चतुर्थाध्यायः'
    };
    
    const padaNames = {
        '1': 'प्रथमः पादः',
        '2': 'द्वितीयः पादः',
        '3': 'तृतीयः पादः',
        '4': 'चतुर्थः पादः'
    };
    
    const selectedAdhikarana = adhikaranaSelect.value;
    let headingText = `${adhyayaNames[adhyaya]} ${padaNames[pada]}`;
    
    // Add adhikarana to heading if a specific one is selected
    if (selectedAdhikarana !== 'all') {
        headingText += ` - <span class="adhikarana-name">${selectedAdhikarana}</span>`;
    }
    
    sectionTitle.innerHTML = headingText;
}

// Toggle sutra list collapse/expand
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
    const searchTerm = searchInput.value.toLowerCase();

    if (searchTerm === '') {
        filterSutras();
        return;
    }

    const searchResults = allSutras.filter(sutra => {
        return (
            sutra.sutra_text.toLowerCase().includes(searchTerm) ||
            sutra.adhikarana.toLowerCase().includes(searchTerm) ||
            sutra.sutra_number.toString().includes(searchTerm)
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
    return `
        <a href="#" class="sutra-link" data-index="${index}">
            <div class="sutra-link-number">
                ${sutra.adhyaya}.${sutra.pada}.${sutra.sutra_number}
            </div>
            <div class="sutra-link-text">
                ${sutra.sutra_text}
            </div>
            <div class="sutra-link-adhikarana">
                ${sutra.adhikarana}
            </div>
            <div class="arrow">→</div>
        </a>
    `;
}

// Show detailed view of a sutra
function showSutraDetail(sutra) {
    currentView = 'detail';
    sutraList.style.display = 'none';
    sutraDetail.style.display = 'block';
    
    // Hide heading controls in detail view
    const headingControls = document.querySelector('.heading-controls');
    if (headingControls) {
        headingControls.style.display = 'none';
    }
    
    // Stop any playing speech when switching views
    stopSpeech();
    
    // Get details from JSON using sutra key
    const sutraKey = `${sutra.adhyaya}.${sutra.pada}.${sutra.sutra_number}`;
    const details = sutraDetails[sutraKey] || {};
    
    // Build meaning section
    let meaningHTML = '<h3>अर्थः (Meaning)</h3>';
    if (details.meaning) {
        meaningHTML += `<div class="audio-controls"><button class="audio-btn" id="meaningAudio" title="Play meaning">🔊</button></div>`;
        meaningHTML += `<p class="main-meaning">${details.meaning}</p>`;
        if (details.meaningDetails && details.meaningDetails.length > 0) {
            meaningHTML += '<ul class="meaning-details">';
            details.meaningDetails.forEach(detail => {
                meaningHTML += `<li>${detail}</li>`;
            });
            meaningHTML += '</ul>';
        }
    } else {
        meaningHTML += '<p class="placeholder">The meaning of the sutra comes here</p>';
    }
    
    // Build commentary section
    let commentaryHTML = '<h3>द्वैत वेदान्त व्याख्या (Dvaita Vedanta Commentary)</h3>';
    if (details.commentary) {
        commentaryHTML += `<div class="audio-controls"><button class="audio-btn" id="commentaryAudio" title="Play commentary">🔊</button></div>`;
        commentaryHTML += `<p>${details.commentary}</p>`;
        if (details.references && details.references.length > 0) {
            commentaryHTML += '<div class="references"><strong>References:</strong> ';
            commentaryHTML += details.references.join(', ');
            commentaryHTML += '</div>';
        }
    } else {
        commentaryHTML += '<p class="placeholder">The Madhva commentary on this sutra comes here</p>';
    }
    
    detailContent.innerHTML = `
        <div class="detail-header">
            <div class="detail-number">
                Sutra ${sutra.adhyaya}.${sutra.pada}.${sutra.sutra_number}
            </div>
            <div class="detail-adhikarana">
                ${sutra.adhikarana}
            </div>
        </div>
        <div class="detail-sutra-text">
            ${sutra.sutra_text}
            <button class="audio-btn audio-btn-large" id="sutraAudio" title="Play sutra">🔊</button>
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
    sutraDetail.style.display = 'none';
    sutraList.style.display = 'flex';
    
    // Show heading controls in list view
    const headingControls = document.querySelector('.heading-controls');
    if (headingControls) {
        headingControls.style.display = 'flex';
    }
    
    stopSpeech(); // Stop any playing audio
}

// Show loading message
function showLoading() {
    sutraList.innerHTML = '<div class="loading">Loading sutras...</div>';
}

// Show error message
function showError(message) {
    sutraList.innerHTML = `<div class="no-results">${message}</div>`;
}

// Show no results message
function showNoResults() {
    sutraList.innerHTML = '<div class="no-results">No sutras found for the selected criteria.</div>';
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

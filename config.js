// ========================================
// 🕉️ BRAHMA SUTRA ADMIN - CONFIGURATION
// ========================================
// Centralized configuration file for the admin panel
// Modify these settings to customize the application

// ========================================
// 📝 EDITOR CONFIGURATION
// ========================================
const EDITOR_CONFIG = {
    // Text Colors (shown in color palette)
    textColors: [
        {hex: '#000000', name: 'Black', emoji: '⬛'},
        {hex: '#dc2626', name: 'Red', emoji: '🟥'},
        {hex: '#16a34a', name: 'Green', emoji: '🟩'},
        {hex: '#2563eb', name: 'Blue', emoji: '🟦'},
        {hex: '#ea580c', name: 'Orange', emoji: '🟧'},
        {hex: '#9333ea', name: 'Purple', emoji: '🟪'},
        {hex: '#eab308', name: 'Yellow', emoji: '🟨'},
        {hex: '#0891b2', name: 'Cyan', emoji: '🔷'},
        {hex: '#ffffff', name: 'White', emoji: '⬜'}
    ],
    
    // Background Colors (shown in color palette)
    bgColors: [
        {hex: 'transparent', name: 'None', emoji: '⬜'},
        {hex: '#fef2f2', name: 'Light Red', emoji: '🔴'},
        {hex: '#f0fdf4', name: 'Light Green', emoji: '🟢'},
        {hex: '#eff6ff', name: 'Light Blue', emoji: '🔵'},
        {hex: '#fff7ed', name: 'Light Orange', emoji: '🟠'},
        {hex: '#faf5ff', name: 'Light Purple', emoji: '🟣'},
        {hex: '#fefce8', name: 'Light Yellow', emoji: '🟡'},
        {hex: '#ecfeff', name: 'Light Cyan', emoji: '🔷'},
        {hex: '#000000', name: 'Black', emoji: '⬛'}
    ],
    
    // Font Size Options
    fontSizes: [
        {value: '1', label: 'Small'},
        {value: '3', label: 'Normal'},
        {value: '5', label: 'Large'},
        {value: '7', label: 'Huge'}
    ],
    
    // Default Colors (used when editor loads)
    defaultTextColor: '#000000',
    defaultBgColor: 'transparent',
    
    // Toolbar Features (true = show, false = hide)
    features: {
        bold: true,
        italic: true,
        underline: true,
        fontSize: false,
        textColor: true,
        bgColor: true,
        alignLeft: true,
        alignCenter: true,
        alignRight: true,
        bulletList: true,
        numberedList: true,
        clearFormat: true
    },
    
    // Editor Behavior Settings
    minHeight: '200px',      // Minimum editor height
    maxHeight: '500px',      // Maximum editor height
    defaultFontSize: '3',    // Default font size (1-7)
    lineHeight: '1.6',       // Line spacing
    
    // Button Symbols/Labels
    symbols: {
        bold: 'B',
        italic: 'I',
        underline: 'U',
        alignLeft: '⬅',
        alignCenter: '↔',
        alignRight: '➡',
        bulletList: '•',
        numberedList: '1.',
        clearFormat: '✖'
    }
};

// ========================================
// 📚 VYAKHYANA CONFIGURATION
// ========================================
// Standard vyakhyanas that are auto-created for every part
// NOTE: This is now loaded from Author.csv at runtime
// This object is kept for backward compatibility
const STANDARD_VYAKHYANAS = {
    'भाष्यम्': 'madhwacharya',
    'तत्त्वप्रकाशिका': 'jayateerth',
    'गुर्वर्थदीपिका': 'Vadiraja',
    'भावबोधः': 'Raghuttama',
    'भावदीपा': 'Raghavendra',
    'अभिनवचन्द्रिका': 'satyanathateertha',
    'वाक्यार्थमुक्तावली': 'shreenivasa',
    'तत्त्वसुबोधिनी': 'unknown',
    'वाक्यार्थविवरणम्': 'unknown',
    'वाक्यार्थमञ्जरी': 'unknown'
};

// ========================================
// 🔐 AUTHENTICATION CONFIGURATION
// ========================================
// Admin password (SHA-256 hash)
// To generate a new password hash:
// 1. Open browser console
// 2. Run: hashPassword('your_password_here').then(h => console.log(h))
// 3. Copy the hash and replace ADMIN_PASSWORD_HASH below
const ADMIN_PASSWORD_HASH = 'f72201a9605320877118c45b7d843d9ff88c61ad2ba89f4eaa1ce068e00fdfa2';

// ========================================
// 🎨 UI CONFIGURATION
// ========================================
const UI_CONFIG = {
    // Personal Notes Section
    personalNotes: {
        displayName: 'व्यक्तिगत-टिपाणी',
        backgroundColor: '#fef3c7',  // Yellow/amber background
        borderColor: '#f59e0b'
    },
    
    // Part Section
    part: {
        backgroundColor: '#f3f4f6',  // Gray background
        borderColor: '#9ca3af'
    },
    
    // Sidebar
    sidebar: {
        width: '280px',
        backgroundColor: '#f9fafb'
    },
    
    // Search
    search: {
        placeholder: 'Search sutras...',
        debounceMs: 300  // Delay before search triggers
    },
    
    // Status Messages
    status: {
        successDuration: 3000,  // How long success messages show (ms)
        errorDuration: 5000     // How long error messages show (ms)
    }
};

// ========================================
// 📁 DATA CONFIGURATION
// ========================================
const DATA_CONFIG = {
    // Data file locations
    dataPath: 'sutra/sutra-details.json',
    personalNotesPath: 'sutra/personal-notes.json',
    csvPath: 'sutra/bs.csv',
    adhikaranaPath: 'sutra/adhikarana-details.json',
    authorCsvPath: 'sutra/Author.csv',
    
    // CSV column mapping (0-indexed)
    csvColumns: {
        adhyaya: 0,
        pada: 1,
        sutraNumber: 2,
        sutraText: 3,
        adhikarana: 4
    },
    
    // Auto-save settings (future feature)
    autoSave: {
        enabled: false,
        intervalMs: 30000  // Auto-save every 30 seconds
    },
    
    // Backup settings (future feature)
    backup: {
        enabled: false,
        keepVersions: 5  // Keep last 5 versions
    }
};

// ========================================
// 🌐 EXPORT CONFIGURATION
// ========================================
// Make config available globally
if (typeof window !== 'undefined') {
    window.EDITOR_CONFIG = EDITOR_CONFIG;
    window.STANDARD_VYAKHYANAS = STANDARD_VYAKHYANAS;
    window.ADMIN_PASSWORD_HASH = ADMIN_PASSWORD_HASH;
    window.UI_CONFIG = UI_CONFIG;
    window.DATA_CONFIG = DATA_CONFIG;
}

// English/IAST (International Alphabet of Sanskrit Transliteration) mapping for Devanagari
SCRIPT_MAPPINGS.en = {
    isRomanization: true,  // Flag to enable proper inherent 'a' handling
    mapping: {
        // Vowels
        'अ': 'a',
        'आ': 'ā',
        'इ': 'i',
        'ई': 'ī',
        'उ': 'u',
        'ऊ': 'ū',
        'ऋ': 'ṛ',
        'ॠ': 'ṝ',
        'ऌ': 'ḷ',
        'ॡ': 'ḹ',
        'ए': 'e',
        'ऐ': 'ai',
        'ओ': 'o',
        'औ': 'au',
        
        // Consonants
        'क': 'ka',
        'ख': 'kha',
        'ग': 'ga',
        'घ': 'gha',
        'ङ': 'ṅa',
        
        'च': 'ca',
        'छ': 'cha',
        'ज': 'ja',
        'झ': 'jha',
        'ञ': 'ña',
        
        'ट': 'ṭa',
        'ठ': 'ṭha',
        'ड': 'ḍa',
        'ढ': 'ḍha',
        'ण': 'ṇa',
        
        'त': 'ta',
        'थ': 'tha',
        'द': 'da',
        'ध': 'dha',
        'न': 'na',
        
        'प': 'pa',
        'फ': 'pha',
        'ब': 'ba',
        'भ': 'bha',
        'म': 'ma',
        
        'य': 'ya',
        'र': 'ra',
        'ल': 'la',
        'व': 'va',
        
        'श': 'śa',
        'ष': 'ṣa',
        'स': 'sa',
        'ह': 'ha',
        
        // Vowel marks (matras)
        'ा': 'ā',
        'ि': 'i',
        'ी': 'ī',
        'ु': 'u',
        'ू': 'ū',
        'ृ': 'ṛ',
        'ॄ': 'ṝ',
        'ॢ': 'ḷ',
        'ॣ': 'ḹ',
        'े': 'e',
        'ै': 'ai',
        'ो': 'o',
        'ौ': 'au',
        
        // Special symbols
        'ं': 'ṃ',
        'ः': 'ḥ',
        '्': '',  // Virama removes inherent 'a'
        'ँ': 'm̐',
        'ॐ': 'oṃ',
        '।': '|',
        '॥': '||',
        
        // Numbers
        '०': '0',
        '१': '1',
        '२': '2',
        '३': '3',
        '४': '4',
        '५': '5',
        '६': '6',
        '७': '7',
        '८': '8',
        '९': '9'
    },
    
    specialCombinations: {
        'क्ष': 'kṣa',
        'ज्ञ': 'jña',
        'त्र': 'tra',
        'श्र': 'śra'
    },
    
    anusvaraNormalization: {
        enabled: false  // IAST uses ṃ for all anusvara
    }
};

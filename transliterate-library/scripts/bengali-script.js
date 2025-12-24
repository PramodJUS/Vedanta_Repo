// Bengali script mapping and rules
SCRIPT_MAPPINGS.bn = {
    mapping: {
        'ॐ': 'ওঁ',
        'अ': 'অ', 'आ': 'আ', 'इ': 'ই', 'ई': 'ঈ', 'उ': 'উ', 'ऊ': 'ঊ',
        'ऋ': 'ঋ', 'ॠ': 'ৠ', 'ऌ': 'ঌ', 'ए': 'এ', 'ऐ': 'ঐ', 'ओ': 'ও', 'औ': 'ঔ',
        'क': 'ক', 'ख': 'খ', 'ग': 'গ', 'घ': 'ঘ', 'ङ': 'ঙ',
        'च': 'চ', 'छ': 'ছ', 'ज': 'জ', 'झ': 'ঝ', 'ञ': 'ঞ',
        'ट': 'ট', 'ठ': 'ঠ', 'ड': 'ড', 'ढ': 'ঢ', 'ण': 'ণ',
        'त': 'ত', 'थ': 'থ', 'द': 'দ', 'ध': 'ধ', 'न': 'ন',
        'प': 'প', 'फ': 'ফ', 'ब': 'ব', 'भ': 'ভ', 'म': 'ম',
        'य': 'য', 'र': 'র', 'ल': 'ল', 'व': 'ব',
        'श': 'শ', 'ष': 'ষ', 'स': 'স', 'ह': 'হ', 'ळ': 'ল',
        'ा': 'া', 'ि': 'ি', 'ी': 'ী', 'ु': 'ু', 'ू': 'ূ',
        'ृ': 'ৃ', 'ॄ': 'ৄ', 'ॢ': 'ৢ', 'े': 'ে', 'ै': 'ৈ',
        'ो': 'ো', 'ौ': 'ৌ', '्': '্', 'ं': 'ং', 'ः': 'ঃ',
        'ँ': 'ঁ', 'ऽ': 'ঽ',
        '०': '০', '१': '১', '२': '২', '३': '৩', '④': '৪',
        '५': '৫', '६': '৬', '७': '৭', '८': '৮', '९': '৯'
    },
    
    // Special character combinations
    specialCombinations: {
        'क्ष': 'ক্ষ',
        'ज्ञ': 'জ্ঞ',
        'श्र': 'শ্র'
    },
    
    // Anusvara normalization rules
    anusvaraNormalization: {
        enabled: true,
        anusvara: 'ং',  // The anusvara character for this script
        nasalsWithHalant: ['ঙ্', 'ঞ্', 'ণ্', 'ন্', 'ম্'],
        // Consonants where compound form should be kept (not converted to anusvara)
        compoundConsonants: ['ঙ', 'ঞ', 'ণ', 'ন', 'ম', 'য', 'র', 'ল', 'ব'],
        allConsonants: ['ক', 'খ', 'গ', 'ঘ', 'ঙ', 'চ', 'ছ', 'জ', 'ঝ', 'ঞ', 'ট', 'ঠ', 'ড', 'ঢ', 'ণ', 
                       'ত', 'থ', 'দ', 'ধ', 'ন', 'প', 'ফ', 'ব', 'ভ', 'ম', 'য', 'র', 'ল', 
                       'শ', 'ষ', 'স', 'হ'],
        // Convert final nasal consonants with halant to anusvara
        finalNasalToAnusvara: true
    }
};

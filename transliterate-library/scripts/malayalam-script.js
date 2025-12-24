// Malayalam script mapping and rules
SCRIPT_MAPPINGS.ml = {
    mapping: {
        'ॐ': 'ഓം',
        'अ': 'അ', 'आ': 'ആ', 'इ': 'ഇ', 'ई': 'ഈ', 'उ': 'ഉ', 'ऊ': 'ഊ',
        'ऋ': 'ഋ', 'ॠ': 'ൠ', 'ऌ': 'ഌ', 'ए': 'ഏ', 'ऐ': 'ഐ', 'ओ': 'ഓ', 'औ': 'ഔ',
        'क': 'ക', 'ख': 'ഖ', 'ग': 'ഗ', 'घ': 'ഘ', 'ङ': 'ങ',
        'च': 'ച', 'छ': 'ഛ', 'ज': 'ജ', 'झ': 'ഝ', 'ञ': 'ഞ',
        'ट': 'ട', 'ठ': 'ഠ', 'ड': 'ഡ', 'ढ': 'ഢ', 'ण': 'ണ',
        'त': 'ത', 'थ': 'ഥ', 'द': 'ദ', 'ध': 'ധ', 'न': 'ന',
        'प': 'പ', 'फ': 'ഫ', 'ब': 'ബ', 'भ': 'ഭ', 'म': 'മ',
        'य': 'യ', 'र': 'ര', 'ल': 'ല', 'व': 'വ',
        'श': 'ശ', 'ष': 'ഷ', 'स': 'സ', 'ह': 'ഹ', 'ळ': 'ള',
        'ा': 'ാ', 'ि': 'ി', 'ी': 'ീ', 'ु': 'ു', 'ू': 'ൂ',
        'ृ': 'ൃ', 'ॄ': 'ൄ', 'ॢ': 'ൢ', 'े': 'േ', 'ै': 'ൈ',
        'ो': 'ോ', 'ौ': 'ൌ', '्': '്', 'ं': 'ം', 'ः': 'ഃ',
        'ँ': 'ँ', 'ऽ': 'ഽ',
        '०': '൦', '१': '൧', '२': '൨', '३': '൩', '④': '൪',
        '५': '൫', '६': '൬', '७': '൭', '८': '൮', '९': '൯'
    },
    
    // Special character combinations
    specialCombinations: {
        'क्ष': 'ക്ഷ',
        'ज्ञ': 'ജ്ഞ',
        'श्र': 'ശ്ര'
    },
    
    // Anusvara normalization rules
    anusvaraNormalization: {
        enabled: true,
        anusvara: 'ം',  // The anusvara character for this script
        nasalsWithHalant: ['ങ്', 'ഞ്', 'ണ്', 'ന്', 'മ്'],
        // Consonants where compound form should be kept (not converted to anusvara)
        compoundConsonants: ['ങ', 'ഞ', 'ണ', 'ന', 'മ', 'യ', 'ര', 'ല', 'വ'],
        allConsonants: ['ക', 'ഖ', 'ഗ', 'ഘ', 'ങ', 'ച', 'ഛ', 'ജ', 'ഝ', 'ഞ', 'ട', 'ഠ', 'ഡ', 'ഢ', 'ണ', 
                       'ത', 'ഥ', 'ദ', 'ധ', 'ന', 'പ', 'ഫ', 'ബ', 'ഭ', 'മ', 'യ', 'ര', 'ല', 'വ', 
                       'ശ', 'ഷ', 'സ', 'ഹ', 'ള'],
        // Convert final nasal consonants with halant to anusvara
        finalNasalToAnusvara: true
    }
};

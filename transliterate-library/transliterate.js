// Generic transliteration engine for Devanagari to Indic scripts
// Language-specific mappings are loaded from separate files in js/scripts/

// Registry for all script mappings (populated by individual script files)
const SCRIPT_MAPPINGS = {};

// Transliterate Devanagari text to target script
function transliterateText(text, targetLang) {
    if (!text || targetLang === 'sa') return text; // Return as-is for Sanskrit
    
    const scriptConfig = SCRIPT_MAPPINGS[targetLang];
    if (!scriptConfig || !scriptConfig.mapping) return text; // No mapping available
    
    let result = text;
    
    // Handle special combinations first (if defined)
    if (scriptConfig.specialCombinations) {
        for (const [source, target] of Object.entries(scriptConfig.specialCombinations)) {
            result = result.split(source).join(target);
        }
    }
    
    // For romanization (English/IAST), handle inherent 'a' removal before matras
    if (scriptConfig.isRomanization) {
        // List of consonants with inherent 'a' (all Devanagari consonants)
        const consonants = ['क', 'ख', 'ग', 'घ', 'ङ', 'च', 'छ', 'ज', 'झ', 'ञ', 
                           'ट', 'ठ', 'ड', 'ढ', 'ण', 'त', 'थ', 'द', 'ध', 'न',
                           'प', 'फ', 'ब', 'भ', 'म', 'य', 'र', 'ल', 'व',
                           'श', 'ष', 'स', 'ह'];
        
        // List of matras (vowel marks) - these should replace inherent 'a'
        const matras = ['ा', 'ि', 'ी', 'ु', 'ू', 'ृ', 'ॄ', 'ॢ', 'ॣ', 'े', 'ै', 'ो', 'ौ'];
        
        // Halant/virama removes inherent 'a'
        const halant = '्';
        
        // First pass: Handle consonant + halant (removes inherent 'a')
        for (const cons of consonants) {
            const romanCons = scriptConfig.mapping[cons];
            if (!romanCons) continue;
            
            // Remove inherent 'a' from romanized consonant
            const consWithoutA = romanCons.endsWith('a') ? romanCons.slice(0, -1) : romanCons;
            
            // Replace consonant+halant with consonant without 'a'
            const devaHalantPattern = cons + halant;
            result = result.split(devaHalantPattern).join(consWithoutA);
        }
        
        // Second pass: Handle consonant + matra (matra replaces inherent 'a')
        for (const cons of consonants) {
            const romanCons = scriptConfig.mapping[cons];
            if (!romanCons) continue;
            
            // Remove inherent 'a' from romanized consonant
            const consWithoutA = romanCons.endsWith('a') ? romanCons.slice(0, -1) : romanCons;
            
            for (const matra of matras) {
                const romanMatra = scriptConfig.mapping[matra];
                if (!romanMatra) continue;
                
                // Replace consonant+matra with consonant(without 'a')+matra
                const devaPattern = cons + matra;
                const romanPattern = consWithoutA + romanMatra;
                result = result.split(devaPattern).join(romanPattern);
            }
        }
    }
    
    // Character-by-character replacement
    for (const [source, target] of Object.entries(scriptConfig.mapping)) {
        result = result.split(source).join(target);
    }
    
    // Apply anusvara normalization (if enabled for this script)
    if (scriptConfig.anusvaraNormalization && scriptConfig.anusvaraNormalization.enabled) {
        const rules = scriptConfig.anusvaraNormalization;
        
        for (const nasal of rules.nasalsWithHalant) {
            for (const consonant of rules.allConsonants) {
                // Keep compound form for specific consonants, use anusvara for others
                if (!rules.compoundConsonants.includes(consonant)) {
                    result = result.replace(new RegExp(nasal + consonant, 'g'), rules.anusvara + consonant);
                }
            }
        }
        
        // Convert final nasal consonants with halant to anusvara (e.g., अधिकरणम् -> ಅಧಿಕರಣಂ)
        if (rules.finalNasalToAnusvara) {
            for (const nasal of rules.nasalsWithHalant) {
                // Match nasal+halant at end of word (before space, punctuation, or end of string)
                result = result.replace(new RegExp(nasal + '(?=\\s|[।॥,.;:!?()\\[\\]{}"\']|$)', 'g'), rules.anusvara);
            }
        }
    }
    
    return result;
}

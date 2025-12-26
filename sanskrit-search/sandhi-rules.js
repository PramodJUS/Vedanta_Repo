/**
 * Sanskrit Sandhi Rules Module
 * Generates variations of search terms based on sandhi rules
 * 
 * @version 1.0.0
 * @license MIT
 */

class SanskritSandhiRules {
    constructor() {
        // Vowel combinations (स्वरसन्धि)
        this.vowelSandhi = [
            // अ + अ = आ
            { pattern: 'अ', following: 'अ', result: 'आ', rule: 'a+a=ā' },
            // अ + इ = ए
            { pattern: 'अ', following: 'इ', result: 'ए', rule: 'a+i=e' },
            // अ + उ = ओ
            { pattern: 'अ', following: 'उ', result: 'ओ', rule: 'a+u=o' },
            // अ + ऋ = अर्
            { pattern: 'अ', following: 'ऋ', result: 'अर्', rule: 'a+ṛ=ar' },
            // आ + इ = ऐ (sometimes ए)
            { pattern: 'आ', following: 'इ', result: 'ऐ', rule: 'ā+i=ai' },
            // आ + उ = औ (sometimes ओ)
            { pattern: 'आ', following: 'उ', result: 'औ', rule: 'ā+u=au' },
            // इ + अ = य
            { pattern: 'इ', following: 'अ', result: 'य', rule: 'i+a=ya' },
            // उ + अ = व
            { pattern: 'उ', following: 'अ', result: 'व', rule: 'u+a=va' },
            // ऋ + अ = र
            { pattern: 'ऋ', following: 'अ', result: 'र', rule: 'ṛ+a=ra' },
            // ए + अ = ए
            { pattern: 'ए', following: 'अ', result: 'ए', rule: 'e+a=e' },
            // ओ + अ = ओ
            { pattern: 'ओ', following: 'अ', result: 'ओ', rule: 'o+a=o' }
        ];

        // Consonant sandhi (व्यञ्जनसन्धि)
        this.consonantSandhi = [
            // त् + च = च्च
            { pattern: 'त्', following: 'च', result: 'च्च', rule: 't+c=cc' },
            // त् + ज = ज्ज
            { pattern: 'त्', following: 'ज', result: 'ज्ज', rule: 't+j=jj' },
            // त् + श = च्छ
            { pattern: 'त्', following: 'श', result: 'च्छ', rule: 't+ś=cch' },
            // द् + च = च्च
            { pattern: 'द्', following: 'च', result: 'च्च', rule: 'd+c=cc' },
            // न् + च = ञ्च
            { pattern: 'न्', following: 'च', result: 'ञ्च', rule: 'n+c=ñc' },
            // न् + ज = ञ्ज
            { pattern: 'न्', following: 'ज', result: 'ञ्ज', rule: 'n+j=ñj' },
            // म् + प = म्प
            { pattern: 'म्', following: 'प', result: 'म्प', rule: 'm+p=mp' },
            // म् + ब = म्ब
            { pattern: 'म्', following: 'ब', result: 'म्ब', rule: 'm+b=mb' }
        ];

        // Visarga sandhi (विसर्गसन्धि)
        this.visargaSandhi = [
            // ः + क = ष्क
            { pattern: 'ः', following: 'क', result: 'ष्क', rule: 'ḥ+k=ṣk' },
            // ः + प = ष्प
            { pattern: 'ः', following: 'प', result: 'ष्प', rule: 'ḥ+p=ṣp' },
            // ः + त = स्त
            { pattern: 'ः', following: 'त', result: 'स्त', rule: 'ḥ+t=st' },
            // ः + च = श्च
            { pattern: 'ः', following: 'च', result: 'श्च', rule: 'ḥ+c=śc' },
            // अः + अ = ओ
            { pattern: 'ः', following: 'अ', result: 'ओ', rule: 'aḥ+a=o' },
            // ः + vowel often = र् or dropped
            { pattern: 'ः', following: '[अइउऋएओ]', result: 'र्', rule: 'ḥ+vowel=r' },
            { pattern: 'ः', following: '[अइउऋएओ]', result: '', rule: 'ḥ+vowel=drop' }
        ];

        // Common ending variations
        this.endingVariations = [
            // Nominative singular variations
            { pattern: 'ः$', variations: ['', 'ह्'], rule: 'nom-sg-visarga' },
            { pattern: 'म्$', variations: ['', 'न्'], rule: 'acc-sg-anusvara' },
            { pattern: 'अ$', variations: ['ो', 'ं'], rule: 'ending-a' }
        ];
    }

    /**
     * Generate variations of a search term considering sandhi
     * @param {string} term - The search term
     * @returns {Array} - Array of {text, rule} variations
     */
    generateVariations(term) {
        const variations = new Set();
        variations.add({ text: term, rule: 'original' });

        // 1. Try splitting the term (reverse sandhi)
        const splits = this.trySplitSandhi(term);
        splits.forEach(split => variations.add(split));

        // 2. Try adding common ending variations
        const endings = this.tryEndingVariations(term);
        endings.forEach(ending => variations.add(ending));

        // 3. Try vowel sandhi combinations
        const vowelCombos = this.tryVowelCombinations(term);
        vowelCombos.forEach(combo => variations.add(combo));

        // Convert Set to Array and deduplicate by text
        const uniqueVariations = Array.from(variations);
        const seen = new Map();
        return uniqueVariations.filter(v => {
            if (seen.has(v.text)) return false;
            seen.set(v.text, true);
            return true;
        });
    }

    /**
     * Try to split a term by reversing sandhi
     * @private
     */
    trySplitSandhi(term) {
        const results = [];

        // Try all sandhi rules in reverse
        [...this.vowelSandhi, ...this.consonantSandhi, ...this.visargaSandhi].forEach(rule => {
            const index = term.indexOf(rule.result);
            if (index !== -1) {
                // Found a potential sandhi, try to split it
                const before = term.substring(0, index);
                const after = term.substring(index + rule.result.length);
                
                // Create variation with split
                const split = before + rule.pattern + rule.following + after;
                results.push({
                    text: split,
                    rule: `reverse-${rule.rule}`
                });
            }
        });

        return results;
    }

    /**
     * Try common ending variations
     * @private
     */
    tryEndingVariations(term) {
        const results = [];

        this.endingVariations.forEach(ending => {
            const regex = new RegExp(ending.pattern);
            if (regex.test(term)) {
                ending.variations.forEach(variant => {
                    const newTerm = term.replace(regex, variant);
                    if (newTerm !== term) {
                        results.push({
                            text: newTerm,
                            rule: ending.rule
                        });
                    }
                });
            }
        });

        return results;
    }

    /**
     * Try vowel combinations
     * @private
     */
    tryVowelCombinations(term) {
        const results = [];

        this.vowelSandhi.forEach(rule => {
            // Look for the result in term and try to expand it
            const index = term.indexOf(rule.result);
            if (index !== -1) {
                const before = term.substring(0, index);
                const after = term.substring(index + rule.result.length);
                const expanded = before + rule.pattern + rule.following + after;
                
                results.push({
                    text: expanded,
                    rule: `expand-${rule.rule}`
                });
            }
        });

        return results;
    }

    /**
     * Check if a term might need sandhi processing
     * @param {string} term - Term to check
     * @returns {boolean}
     */
    needsSandhiProcessing(term) {
        // Check if term contains common sandhi indicators
        const indicators = ['्', 'ं', 'ः', 'आ', 'ए', 'ओ', 'ौ', 'ै'];
        return indicators.some(ind => term.includes(ind));
    }

    /**
     * Get all possible forms of a word ending
     * Used for flexible matching
     * @param {string} stem - Word stem without ending
     * @returns {Array} - Possible complete forms
     */
    getEndingForms(stem) {
        const forms = [stem];
        
        // Add common case endings
        const endings = ['', 'ः', 'म्', 'ा', 'ि', 'ी', 'े', 'ो', 'ौ', 'ै', 'ं', 'न्'];
        endings.forEach(ending => {
            forms.push(stem + ending);
        });

        return forms;
    }
}

// Export for use in Node.js or browser
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SanskritSandhiRules;
}
if (typeof window !== 'undefined') {
    window.SanskritSandhiRules = SanskritSandhiRules;
}

/**
 * Sanskrit Search Engine - Standalone Module
 * Handles compound word search with sandhi awareness
 * 
 * @version 1.0.0
 * @license MIT
 */

class SanskritSearch {
    constructor(config = {}) {
        this.config = {
            caseSensitive: config.caseSensitive || false,
            highlightClass: config.highlightClass || 'search-highlight',
            contextLength: config.contextLength || 50,
            enableSandhi: config.enableSandhi !== false, // enabled by default
            maxResults: config.maxResults || 100
        };
        
        // Create instance of sandhi rules if available
        this.sandhiRules = window.SanskritSandhiRules ? new window.SanskritSandhiRules() : null;
        
        // Iti-quotation sandhi mapping (प्रतीकग्रहण)
        this.itiSandhiMap = this.createItiSandhiMap();
    }

    /**
     * Create mapping of iti-quotation sandhi patterns
     * Maps endings to possible base forms and vice versa
     * @private
     */
    createItiSandhiMap() {
        return {
            // REVERSE: Detect iti-ending → generate possible base endings
            reverse: {
                // Vowel endings
                'ेति': ['', 'अ', 'आ'],           // एति ← stem/अ/आ + इति
                'ीति': ['इ', 'ई'],               // ईति ← इ/ई + इति
                'ूति': ['उ', 'ऊ'],               // ूति ← उ/ऊ + इति (rare)
                'वीति': ['उ', 'ऊ'],              // वीति ← उ/ऊ + इति
                'विति': ['उ', 'ऊ'],              // विति ← उ/ऊ + इति (alternate)
                'रिति': ['ऋ', 'ॠ'],              // रिति ← ऋ/ॠ + इति
                'लिति': ['ऌ', 'ॡ'],              // लिति ← ऌ/ॡ + इति
                'ैति': ['ए', 'ै'],               // ैति ← ए/ऐ + इति
                'ावीति': ['ओ', 'औ'],            // आवीति ← ओ/औ + इति
                'ाविति': ['ओ', 'औ'],            // आविति ← ओ/औ + इति (alternate)
                'ोऽति': ['ओ'],                   // ओऽति ← ओ + इति (with avagraha)
                
                // Case endings - Singular
                'येति': ['य', 'या', 'ाय'],      // येति ← य/या(ins-f)/आय(dat) + इति
                'ेणेति': ['ेण'],                 // एणेति ← एण(ins) + इति
                'ादिति': ['ात्'],                // आदिति ← आत्(abl) + इति
                'स्येति': ['स्य'],                // स्येति ← स्य(gen) + इति
                'मिति': ['म्', 'ाम्'],           // मिति ← म्/आम्(acc) + इति
                'यामिति': ['याम्'],              // यामिति ← याम्(loc-f) + इति
                
                // Case endings - Dual
                'ौति': ['औ'],                    // औति ← औ(dual) + इति
                'ोरिति': ['योः'],                // ओरिति ← योः(dual-gen/loc) + इति
                'भ्यामिति': ['भ्याम्'],          // भ्यामिति ← भ्याम्(dual-ins/dat/abl) + इति
                
                // Case endings - Plural
                'ानिति': ['ान्'],                // आनिति ← आन्(acc-pl) + इति
                'ैरिति': ['ैः'],                 // ऐरिति ← ऐः(ins-pl) + इति
                'भिरिति': ['भिः'],               // भिरिति ← भिः(ins-pl) + इति
                'ेभ्यरिति': ['ेभ्यः'],           // एभ्यरिति ← एभ्यः(dat/abl-pl) + इति
                'ानामिति': ['ानाम्'],            // आनामिति ← आनाम्(gen-pl) + इति
                'णामिति': ['णाम्'],              // णामिति ← णाम्(gen-pl-f) + इति
                'ष्विति': ['ेषु'],                // ष्विति ← एषु(loc-pl) + इति
                'स्विति': ['सु'],                 // स्विति ← सु(loc-pl-f) + इति
                'यारिति': ['याः'],               // यारिति ← याः(gen/abl-f) + इति
                'ाः इति': ['ाः'],                // आः इति ← आः(nom/acc-pl) (visarga retained)
                'ा इति': ['ाः']                  // आ इति ← आः(nom/acc-pl) (visarga dropped)
            },
            
            // FORWARD: Base ending → iti-quotation form
            forward: {
                // Vowel endings
                '': 'ेति',
                'अ': 'ेति',
                'आ': 'ेति',
                'इ': 'ीति',
                'ई': 'ीति',
                'उ': 'वीति',
                'ऊ': 'वीति',
                'ऋ': 'रिति',
                'ॠ': 'रिति',
                'ऌ': 'लिति',
                'ॡ': 'लिति',
                'ए': 'ैति',
                'े': 'ैति',
                'ऐ': 'ैति',
                'ै': 'ैति',
                'ओ': 'ावीति',
                'औ': 'ावीति',
                
                // Case endings - Singular
                'य': 'येति',
                'या': 'येति',
                'ाय': 'ायेति',
                'ेण': 'ेणेति',
                'ात्': 'ादिति',
                'स्य': 'स्येति',
                'म्': 'मिति',
                'ाम्': 'मिति',
                'याम्': 'यामिति',
                
                // Case endings - Dual
                'औ': 'ौति',
                'योः': 'ोरिति',
                'भ्याम्': 'भ्यामिति',
                
                // Case endings - Plural
                'ान्': 'ानिति',
                'ैः': 'ैरिति',
                'भिः': 'भिरिति',
                'ेभ्यः': 'ेभ्यरिति',
                'ानाम्': 'ानामिति',
                'णाम्': 'णामिति',
                'ेषु': 'ष्विति',
                'सु': 'स्विति',
                'याः': 'यारिति',
                'ाः': 'ाः इति'
            }
        };
    }

    /**
     * Search for a term in text
     * @param {string} searchTerm - The term to search for
     * @param {string} text - The text to search in
     * @returns {Object} - Search results with matches and metadata
     */
    search(searchTerm, text) {
        if (!searchTerm || !text) {
            return { matches: [], count: 0 };
        }

        const results = {
            matches: [],
            count: 0,
            searchTerm: searchTerm,
            timestamp: Date.now()
        };

        // 1. Direct substring search
        const directMatches = this.directSearch(searchTerm, text);
        results.matches.push(...directMatches);

        // 2. Sandhi-aware search (if enabled)
        if (this.config.enableSandhi && this.sandhiRules) {
            const sandhiMatches = this.sandhiAwareSearch(searchTerm, text);
            // Merge and deduplicate
            sandhiMatches.forEach(match => {
                if (!this.isDuplicate(match, results.matches)) {
                    results.matches.push(match);
                }
            });
        }

        // Sort by position and limit results
        results.matches.sort((a, b) => a.position - b.position);
        if (this.config.maxResults) {
            results.matches = results.matches.slice(0, this.config.maxResults);
        }

        results.count = results.matches.length;
        return results;
    }

    /**
     * Pratika Grahana Search - For cross-reference between commentaries
     * Finds quotations of source text in commentary using Sanskrit quotation patterns
     * Example: नारायण (in moola) ↔ नारायणेति (in vyakhyana)
     * 
     * @param {string} searchTerm - The term to search for
     * @param {string} text - The text to search in
     * @returns {Object} - Search results with pratika grahana matches
     */
    searchWithPratikaGrahana(searchTerm, text) {
        if (!searchTerm || !text) {
            return { matches: [], count: 0 };
        }

        const results = {
            matches: [],
            count: 0,
            searchTerm: searchTerm,
            timestamp: Date.now()
        };

        // 1. Regular search first
        const regularResults = this.search(searchTerm, text);
        results.matches.push(...regularResults.matches);

        // 2. Pratika grahana (iti-quotation) search
        const pratikaMatches = this.pratikaGrahanaSearch(searchTerm, text);
        pratikaMatches.forEach(match => {
            if (!this.isDuplicate(match, results.matches)) {
                results.matches.push(match);
            }
        });

        // Sort by position and limit results
        results.matches.sort((a, b) => a.position - b.position);
        if (this.config.maxResults) {
            results.matches = results.matches.slice(0, this.config.maxResults);
        }

        results.count = results.matches.length;
        return results;
    }

    /**
     * Direct substring search
     * @private
     */
    directSearch(searchTerm, text) {
        const matches = [];
        const searchStr = this.config.caseSensitive ? searchTerm : searchTerm.toLowerCase();
        const textStr = this.config.caseSensitive ? text : text.toLowerCase();

        // Sanskrit ending characters that should be included in highlighting
        const sanskritEndings = /[ंःँािीुूेैोौृॄॢॣ्ᳵᳶ]/;
        
        // Check if search term already ends with a Sanskrit ending
        const searchEndsWithMark = sanskritEndings.test(searchTerm[searchTerm.length - 1]);

        let pos = 0;
        while ((pos = textStr.indexOf(searchStr, pos)) !== -1) {
            let matchLength = searchTerm.length;
            
            // Only extend to include Sanskrit endings if search term doesn't already have one
            // This ensures "नारायणं" won't match "नारायणो" but "नारायण" will match both
            if (!searchEndsWithMark) {
                let nextCharPos = pos + matchLength;
                while (nextCharPos < text.length && sanskritEndings.test(text[nextCharPos])) {
                    matchLength++;
                    nextCharPos++;
                }
            }
            
            matches.push({
                position: pos,
                length: matchLength,
                matchedText: text.substr(pos, matchLength),
                context: this.getContext(text, pos, matchLength),
                type: 'direct'
            });
            pos += searchTerm.length; // Move by search term length, not match length
        }

        return matches;
    }

    /**
     * Sandhi-aware search
     * @private
     */
    sandhiAwareSearch(searchTerm, text) {
        if (!this.sandhiRules) return [];

        const matches = [];
        const variations = this.sandhiRules.generateVariations(searchTerm);

        variations.forEach(variant => {
            const variantMatches = this.directSearch(variant.text, text);
            variantMatches.forEach(match => {
                match.type = 'sandhi';
                match.sandhiRule = variant.rule;
                match.originalTerm = searchTerm;
                matches.push(match);
            });
        });

        return matches;
    }

    /**
     * Pratika Grahana (प्रतीकग्रहण) - Sanskrit quotation pattern search
     * Detects when a commentary quotes the source text using "iti" pattern
     * Bidirectional: base word ↔ word + iti (with sandhi)
     * @private
     */
    pratikaGrahanaSearch(searchTerm, text) {
        const matches = [];
        const variations = this.generatePratikaVariations(searchTerm);

        console.log('Pratika grahana variations for "' + searchTerm + '":', variations);

        variations.forEach(variant => {
            const variantMatches = this.directSearch(variant.text, text);
            console.log('Searching for variant "' + variant.text + '" (pattern: ' + variant.pattern + '):', variantMatches.length, 'matches');
            variantMatches.forEach(match => {
                match.type = 'pratika-grahana';
                match.pratikaPattern = variant.pattern;
                match.originalTerm = searchTerm;
                matches.push(match);
            });
        });

        console.log('Total pratika grahana matches:', matches.length);
        return matches;
    }

    /**
     * Generate pratika grahana variations using sandhi mapping
     * Handles Sanskrit quotation patterns: base word + iti with sandhi
     * Uses pre-defined mapping for accuracy and performance
     * @private
     */
    generatePratikaVariations(searchTerm) {
        const variations = [];
        const reverseMap = this.itiSandhiMap.reverse;
        const forwardMap = this.itiSandhiMap.forward;

        // REVERSE PATTERNS: Detect iti-quotation → generate base forms
        // Check each reverse pattern from longest to shortest (to match correctly)
        const reversePatterns = Object.keys(reverseMap).sort((a, b) => b.length - a.length);
        
        for (const pattern of reversePatterns) {
            if (searchTerm.endsWith(pattern)) {
                const base = searchTerm.slice(0, -pattern.length);
                const possibleEndings = reverseMap[pattern];
                
                for (const ending of possibleEndings) {
                    variations.push({
                        text: base + ending,
                        pattern: `${pattern}->${ending || 'stem'}`
                    });
                }
                // Don't break - might match multiple patterns (e.g., येति and ेति)
            }
        }

        // FORWARD PATTERNS: Generate iti-quotations from base forms
        // Only if doesn't already end with ति (to avoid double processing)
        if (!searchTerm.endsWith('ति')) {
            // Check endings from longest to shortest
            const forwardPatterns = Object.keys(forwardMap).sort((a, b) => b.length - a.length);
            
            for (const ending of forwardPatterns) {
                if (ending === '') {
                    // Implicit 'a' ending - only if no vowel matra at end
                    const lastChar = searchTerm[searchTerm.length - 1];
                    if (lastChar && !/[ंःँािीुूेैोौृॄॢॣ्ᳵᳶ]/.test(lastChar)) {
                        variations.push({
                            text: searchTerm + forwardMap[ending],
                            pattern: `stem->${forwardMap[ending]}`
                        });
                    }
                } else if (searchTerm.endsWith(ending)) {
                    const base = searchTerm.slice(0, -ending.length);
                    variations.push({
                        text: base + forwardMap[ending],
                        pattern: `${ending}->${forwardMap[ending]}`
                    });
                    // Don't break - check for nested patterns
                }
            }
        }

        return variations;
    }

    /**
     * Get context around a match
     * @private
     */
    getContext(text, position, length) {
        const start = Math.max(0, position - this.config.contextLength);
        const end = Math.min(text.length, position + length + this.config.contextLength);
        
        return {
            before: text.substring(start, position),
            match: text.substr(position, length),
            after: text.substring(position + length, end),
            full: text.substring(start, end)
        };
    }

    /**
     * Check if a match is duplicate
     * @private
     */
    isDuplicate(match, existingMatches) {
        return existingMatches.some(existing => 
            existing.position === match.position && 
            existing.length === match.length
        );
    }

    /**
     * Highlight matches in text
     * @param {string} text - Original text
     * @param {Array} matches - Array of match objects
     * @returns {string} - HTML string with highlighted matches
     */
    highlightMatches(text, matches) {
        if (!matches || matches.length === 0) return text;

        // Sort matches by position in reverse to avoid position shifts
        const sortedMatches = [...matches].sort((a, b) => b.position - a.position);

        let result = text;
        sortedMatches.forEach(match => {
            const before = result.substring(0, match.position);
            const matchText = result.substr(match.position, match.length);
            const after = result.substring(match.position + match.length);
            
            const highlighted = `<span class="${this.config.highlightClass}" data-type="${match.type}">${matchText}</span>`;
            result = before + highlighted + after;
        });

        return result;
    }

    /**
     * Search in multiple texts/documents
     * @param {string} searchTerm - Term to search
     * @param {Array} documents - Array of {id, text, metadata} objects
     * @returns {Array} - Array of results per document
     */
    searchMultiple(searchTerm, documents) {
        return documents.map(doc => {
            const results = this.search(searchTerm, doc.text);
            return {
                id: doc.id,
                metadata: doc.metadata || {},
                ...results
            };
        }).filter(result => result.count > 0);
    }

    /**
     * Search in structured data (e.g., JSON with multiple fields)
     * @param {string} searchTerm - Term to search
     * @param {Object} data - Object with searchable fields
     * @param {Array} searchFields - Array of field names to search in
     * @returns {Object} - Results grouped by field
     */
    searchStructured(searchTerm, data, searchFields) {
        const results = {};

        searchFields.forEach(field => {
            const text = this.getNestedValue(data, field);
            if (text && typeof text === 'string') {
                const fieldResults = this.search(searchTerm, text);
                if (fieldResults.count > 0) {
                    results[field] = fieldResults;
                }
            }
        });

        return results;
    }

    /**
     * Get nested value from object using dot notation
     * @private
     */
    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => current?.[key], obj);
    }

    /**
     * Create a search index for faster searches
     * @param {Array} documents - Documents to index
     * @returns {Object} - Search index
     */
    createIndex(documents) {
        const index = {
            documents: [],
            terms: new Map()
        };

        documents.forEach((doc, docIndex) => {
            index.documents.push({
                id: doc.id,
                metadata: doc.metadata
            });

            // Extract all unique terms (words)
            const words = this.extractWords(doc.text);
            words.forEach(word => {
                if (!index.terms.has(word)) {
                    index.terms.set(word, new Set());
                }
                index.terms.get(word).add(docIndex);
            });
        });

        return index;
    }

    /**
     * Extract words from text
     * @private
     */
    extractWords(text) {
        // Split on whitespace and punctuation, keeping Devanagari intact
        const words = text.split(/[\s.,;!?()[\]{}।॥]+/).filter(w => w.length > 0);
        return [...new Set(words)]; // unique words
    }

    /**
     * Search using pre-built index (faster for multiple searches)
     * @param {string} searchTerm - Term to search
     * @param {Object} index - Pre-built search index
     * @param {Array} documents - Original documents
     * @returns {Array} - Search results
     */
    searchWithIndex(searchTerm, index, documents) {
        const relevantDocIndices = new Set();

        // Find documents containing the term or similar terms
        const words = this.extractWords(searchTerm);
        words.forEach(word => {
            if (index.terms.has(word)) {
                index.terms.get(word).forEach(docIdx => relevantDocIndices.add(docIdx));
            }
        });

        // Search only in relevant documents
        const relevantDocs = Array.from(relevantDocIndices).map(idx => documents[idx]);
        return this.searchMultiple(searchTerm, relevantDocs);
    }
}

// Export for use in Node.js or browser
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SanskritSearch;
}
if (typeof window !== 'undefined') {
    window.SanskritSearch = SanskritSearch;
}

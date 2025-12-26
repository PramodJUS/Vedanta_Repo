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
     * Generate pratika grahana variations
     * Handles Sanskrit quotation patterns: base word ↔ word + iti
     * @private
     */
    generatePratikaVariations(searchTerm) {
        const variations = [];

        // Pattern 1: If searchTerm ends with ेति, generate base forms
        if (searchTerm.endsWith('ेति')) {
            const base = searchTerm.slice(0, -3); // Remove ेति (3 characters: े + त + ि)
            // Base word could end in अ or आ before sandhi
            variations.push({ text: base, pattern: 'eti->base-a' });
            variations.push({ text: base + 'अ', pattern: 'eti->base-a' });
            variations.push({ text: base + 'आ', pattern: 'eti->base-aa' });
        }

        // Pattern 2: If searchTerm ends with ोति, generate base forms  
        if (searchTerm.endsWith('ोति')) {
            const base = searchTerm.slice(0, -3); // Remove ोति (3 characters: ो + त + ि)
            // Base word ended in ओ before sandhi (o + iti = oti)
            variations.push({ text: base, pattern: 'oti->base' });
            variations.push({ text: base + 'ओ', pattern: 'oti->base-o' });
        }

        // Pattern 3: If searchTerm ends with ावति, generate base forms
        if (searchTerm.endsWith('ावति')) {
            const base = searchTerm.slice(0, -4); // Remove ावति (4 characters: ा + व + त + ि)
            // Base word ended in औ before sandhi (au + iti = āviti)
            variations.push({ text: base, pattern: 'aviti->base' });
            variations.push({ text: base + 'औ', pattern: 'aviti->base-au' });
        }

        // Pattern 4: If searchTerm is a regular word, generate quoted forms
        // Only if it doesn't already end with ति (to avoid double processing)
        if (!searchTerm.endsWith('ति')) {
            const lastChar = searchTerm[searchTerm.length - 1];
            
            // अ/आ + इति = एति
            if (lastChar === 'अ' || lastChar === 'आ') {
                const base = searchTerm.slice(0, -1);
                variations.push({ text: base + 'ेति', pattern: 'base-a->eti' });
            } 
            // If word doesn't end in matras, try adding एति directly
            else if (!/[ंःँािीुूेैोौृॄॢॣ्ᳵᳶ]/.test(lastChar)) {
                // Could be implicit 'a' ending
                variations.push({ text: searchTerm + 'ेति', pattern: 'base->eti' });
            }

            // ओ + इति = ओति (with avagraha usually, but sometimes direct)
            if (lastChar === 'ओ') {
                const base = searchTerm.slice(0, -1);
                variations.push({ text: base + 'ोति', pattern: 'base-o->oti' });
            }

            // औ + इति = आवति
            if (lastChar === 'औ') {
                const base = searchTerm.slice(0, -1);
                variations.push({ text: base + 'ावति', pattern: 'base-au->aviti' });
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

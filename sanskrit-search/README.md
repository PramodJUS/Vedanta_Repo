# Sanskrit Search Module

A standalone, reusable JavaScript library for searching Sanskrit text with compound word awareness and sandhi rule handling.

## Features

- ✅ **Direct substring search** - Find exact matches in compounds
- ✅ **Sandhi-aware search** - Handles vowel, consonant, and visarga sandhi
- ✅ **Context extraction** - Get surrounding text for each match
- ✅ **Highlight support** - Generate HTML with highlighted matches
- ✅ **Multi-document search** - Search across multiple texts
- ✅ **Structured data search** - Search in JSON objects with nested fields
- ✅ **Search indexing** - Create indexes for faster repeated searches
- ✅ **Configurable** - Case sensitivity, max results, context length, etc.
- ✅ **Zero dependencies** - Pure JavaScript, works anywhere

## Installation

### Browser
```html
<!-- Load sandhi rules (optional but recommended) -->
<script src="sanskrit-search/sandhi-rules.js"></script>

<!-- Load main search module -->
<script src="sanskrit-search/sanskrit-search.js"></script>
```

### Node.js
```javascript
const SanskritSearch = require('./sanskrit-search/sanskrit-search');
const SanskritSandhiRules = require('./sanskrit-search/sandhi-rules');
```

## Quick Start

### Basic Search

```javascript
// Create search engine instance
const searcher = new SanskritSearch();

// Search for a term
const text = "घटाभाववद्भूतलम् इति उदाहरणम्";
const results = searcher.search("अभाव", text);

console.log(results);
// {
//   matches: [
//     {
//       position: 3,
//       length: 5,
//       matchedText: "अभाव",
//       type: "direct",
//       context: { before: "घट", match: "अभाव", after: "वद्भूतलम्", ... }
//     }
//   ],
//   count: 1,
//   searchTerm: "अभाव",
//   timestamp: 1703587200000
// }
```

### Search with Highlighting

```javascript
const searcher = new SanskritSearch({
    highlightClass: 'highlight'
});

const text = "ब्रह्मसूत्रभाष्यम् मध्वाचार्यविरचितम्";
const results = searcher.search("भाष्य", text);

const highlighted = searcher.highlightMatches(text, results.matches);
console.log(highlighted);
// ब्रह्मसूत्र<span class="highlight" data-type="direct">भाष्य</span>म् मध्वाचार्यविरचितम्
```

### Multi-Document Search

```javascript
const documents = [
    { id: 1, text: "अथातो ब्रह्मजिज्ञासा", metadata: { chapter: 1, sutra: 1 } },
    { id: 2, text: "जन्माद्यस्य यतः", metadata: { chapter: 1, sutra: 2 } },
    { id: 3, text: "शास्त्रयोनित्वात्", metadata: { chapter: 1, sutra: 3 } }
];

const results = searcher.searchMultiple("ब्रह्म", documents);
console.log(results);
// [
//   { id: 1, metadata: { chapter: 1, sutra: 1 }, matches: [...], count: 1 }
// ]
```

### Structured Data Search

```javascript
const sutraData = {
    number: 1,
    moola: "अथातो ब्रह्मजिज्ञासा",
    anvaya: "अथ अतः ब्रह्मणः जिज्ञासा",
    Ka_Translation: "ಈಗ ಆದ್ದರಿಂದ ಬ್ರಹ್ಮವನ್ನು ತಿಳಿಯಬೇಕು",
    En_Translation: "Now, therefore, the inquiry into Brahman"
};

const results = searcher.searchStructured(
    "ब्रह्म",
    sutraData,
    ['moola', 'anvaya', 'Ka_Translation', 'En_Translation']
);

console.log(results);
// {
//   moola: { matches: [...], count: 1 },
//   anvaya: { matches: [...], count: 1 }
// }
```

### Search with Indexing (for large datasets)

```javascript
// Create index once
const index = searcher.createIndex(documents);

// Search using index (much faster for repeated searches)
const results1 = searcher.searchWithIndex("ब्रह्म", index, documents);
const results2 = searcher.searchWithIndex("जिज्ञासा", index, documents);
const results3 = searcher.searchWithIndex("शास्त्र", index, documents);
```

## Configuration Options

```javascript
const searcher = new SanskritSearch({
    caseSensitive: false,           // Case-sensitive search (default: false)
    highlightClass: 'highlight',    // CSS class for highlights (default: 'search-highlight')
    contextLength: 50,              // Characters of context around match (default: 50)
    enableSandhi: true,             // Enable sandhi-aware search (default: true)
    maxResults: 100                 // Maximum results to return (default: 100)
});
```

## Sandhi Rules

The module includes comprehensive sandhi rule handling:

### Vowel Sandhi (स्वरसन्धि)
- अ + अ = आ (a+a=ā)
- अ + इ = ए (a+i=e)
- अ + उ = ओ (a+u=o)
- इ + अ = य (i+a=ya)
- उ + अ = व (u+a=va)
- And more...

### Consonant Sandhi (व्यञ्जनसन्धि)
- त् + च = च्च (t+c=cc)
- त् + ज = ज्ज (t+j=jj)
- न् + च = ञ्च (n+c=ñc)
- And more...

### Visarga Sandhi (विसर्गसन्धि)
- ः + क = ष्क (ḥ+k=ṣk)
- ः + त = स्त (ḥ+t=st)
- अः + अ = ओ (aḥ+a=o)
- And more...

### Example

```javascript
// Searching for "देव" will also find:
// - "देवः" (with visarga)
// - "देवो" (sandhi form)
// - "देवे" (locative)
// - "देवा" (plural)

const results = searcher.search("देव", "देवोऽसुरेभ्यो बलमददात्");
// Will find "देवो" even though you searched for "देव"
```

## API Reference

### SanskritSearch Class

#### Constructor
```javascript
new SanskritSearch(config)
```

#### Methods

##### search(searchTerm, text)
Search for a term in text.
- Returns: `{ matches: Array, count: Number, searchTerm: String, timestamp: Number }`

##### highlightMatches(text, matches)
Generate HTML with highlighted matches.
- Returns: `String` (HTML)

##### searchMultiple(searchTerm, documents)
Search across multiple documents.
- Returns: `Array` of results per document

##### searchStructured(searchTerm, data, searchFields)
Search in structured JSON data.
- Returns: `Object` with results per field

##### createIndex(documents)
Create a search index for faster searches.
- Returns: `Object` (search index)

##### searchWithIndex(searchTerm, index, documents)
Search using pre-built index.
- Returns: `Array` of results

### SanskritSandhiRules Class

#### Methods

##### generateVariations(term)
Generate sandhi variations of a term.
- Returns: `Array` of `{ text: String, rule: String }`

##### needsSandhiProcessing(term)
Check if term needs sandhi processing.
- Returns: `Boolean`

##### getEndingForms(stem)
Get all possible case ending forms.
- Returns: `Array` of possible forms

## CSS for Highlighting

```css
.search-highlight {
    background-color: #ffff00;
    color: #000000;
    font-weight: bold;
    padding: 2px 4px;
    border-radius: 3px;
}

.search-highlight[data-type="sandhi"] {
    background-color: #ffa500;
}

.search-highlight[data-type="direct"] {
    background-color: #90ee90;
}
```

## Use Cases

### 1. Brahma Sutra Search
```javascript
const sutraSearcher = new SanskritSearch();

function searchInSutras(searchTerm, sutraData) {
    const results = [];
    
    sutraData.forEach(sutra => {
        const sutraResults = searcher.searchStructured(
            searchTerm,
            sutra,
            ['moola', 'anvaya', 'Bhashya_Text']
        );
        
        if (Object.keys(sutraResults).length > 0) {
            results.push({
                sutraNumber: sutra.number,
                ...sutraResults
            });
        }
    });
    
    return results;
}
```

### 2. Vyakhyana Search
```javascript
function searchInVyakhyanas(searchTerm, vyakhyanas) {
    const docs = Object.entries(vyakhyanas).map(([key, value]) => ({
        id: key,
        text: value,
        metadata: { type: 'vyakhyana', key }
    }));
    
    return searcher.searchMultiple(searchTerm, docs);
}
```

### 3. Real-time Search UI
```javascript
const searchInput = document.getElementById('search-input');
const resultsDiv = document.getElementById('results');

searchInput.addEventListener('input', (e) => {
    const term = e.target.value;
    if (term.length < 2) return;
    
    const results = searcher.searchMultiple(term, allDocuments);
    displayResults(results, resultsDiv);
});

function displayResults(results, container) {
    container.innerHTML = results.map(result => `
        <div class="result-item">
            <h4>Document ${result.id}</h4>
            <p>${searcher.highlightMatches(result.text, result.matches)}</p>
            <span class="match-count">${result.count} matches</span>
        </div>
    `).join('');
}
```

## Browser Compatibility

- Chrome/Edge: ✅
- Firefox: ✅
- Safari: ✅
- IE11: ⚠️ (requires polyfills for Set, Map)

## Performance

- **Direct search**: O(n·m) where n = text length, m = search term length
- **With indexing**: O(k·m) where k = matching documents (much faster)
- **Sandhi variations**: Adds ~5-10 variations per search term
- **Memory**: ~1-2KB per document in index

## License

MIT License - Free to use in any project

## Contributing

This is a standalone module designed for reuse. To extend:

1. Add new sandhi rules in `sandhi-rules.js`
2. Add new search strategies in `sanskrit-search.js`
3. Update tests and documentation

## Version History

- **1.0.0** (2025-12-26): Initial release
  - Basic substring search
  - Sandhi-aware search
  - Multi-document support
  - Search indexing
  - Structured data search

## Author

Created for the Vedanta Project
Reusable across any Sanskrit text application

# Devanagari Transliterate

A lightweight, zero-dependency JavaScript library for accurately transliterating Devanagari (Sanskrit) text to 8 different scripts including 7 Indic languages and IAST romanization. Perfect for digital Vedanta texts, Sanskrit educational materials, and multilingual religious/philosophical content.

## 🌏 Supported Scripts

| Language | Code | Native Name | Example (ॐ) |
|----------|------|-------------|-------------|
| Kannada | `kn` | ಕನ್ನಡ | ಓಂ |
| Telugu | `te` | తెలుగు | ఓం |
| Tamil | `ta` | தமிழ் | ஓம் |
| Malayalam | `ml` | മലയാളം | ഓം |
| Gujarati | `gu` | ગુજરાતી | ૐ |
| Odia/Oriya | `or` | ଓଡ଼ିଆ | ଓଁ |
| Bengali | `bn` | বাংলা | ওঁ |
| English (IAST) | `en` | English | oṃ |
| Sanskrit/Devanagari | `sa` | संस्कृतम् | ॐ |

## ✨ Features

- ✅ **Zero dependencies** - Pure JavaScript, no external libraries
- ✅ **CDN ready** - Free global hosting via jsDelivr
- ✅ **Node.js compatible** - Works in any JavaScript environment
- ✅ **Intelligent anusvara normalization** - Proper म्/ं handling based on phonetic context
- ✅ **Special combination handling** - Accurate rendering of क्ष, ज्ञ, त्र, and other conjuncts
- ✅ **IAST romanization** - International standard transliteration with proper diacritics
- ✅ **8 script support** - 7 Indic scripts + English romanization
- ✅ **Modular loading** - Load only the scripts you need
- ✅ **Lightweight** - ~12KB total for all scripts
- ✅ **Production ready** - Used in live Vedanta study applications

## 🚀 Quick Start

### Via CDN (Recommended)

The fastest way to get started - no installation required!

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Devanagari Transliterate Demo</title>
</head>
<body>
    <!-- Load core engine -->
    <script src="https://cdn.jsdelivr.net/gh/PramodJUS/devanagari-transliterate@main/transliterate.js"></script>
    
    <!-- Load only the scripts you need -->
    <script src="https://cdn.jsdelivr.net/gh/PramodJUS/devanagari-transliterate@main/scripts/kannada-script.js"></script>
    <script src="https://cdn.jsdelivr.net/gh/PramodJUS/devanagari-transliterate@main/scripts/telugu-script.js"></script>
    
    <script>
        // Transliterate Sanskrit to Kannada
        const result = transliterateText("ब्रह्मसूत्राणि", "kn");
        console.log(result); // Output: ಬ್ರಹ್ಮಸೂತ್ರಾಣಿ
    </script>
</body>
</html>
```

## 📦 Installation

### CDN Usage (jsDelivr - Free Global CDN)

### Available Scripts

Load only the language scripts you need:

```html
<!-- Kannada -->
<script src="https://cdn.jsdelivr.net/gh/PramodJUS/devanagari-transliterate@main/scripts/kannada-script.js"></script>

<!-- Telugu -->
<script src="https://cdn.jsdelivr.net/gh/PramodJUS/devanagari-transliterate@main/scripts/telugu-script.js"></script>

<!-- Tamil -->
<script src="https://cdn.jsdelivr.net/gh/PramodJUS/devanagari-transliterate@main/scripts/tamil-script.js"></script>

<!-- Malayalam -->
<script src="https://cdn.jsdelivr.net/gh/PramodJUS/devanagari-transliterate@main/scripts/malayalam-script.js"></script>

<!-- Gujarati -->
<script src="https://cdn.jsdelivr.net/gh/PramodJUS/devanagari-transliterate@main/scripts/gujarati-script.js"></script>

<!-- Odia/Oriya -->
<script src="https://cdn.jsdelivr.net/gh/PramodJUS/devanagari-transliterate@main/scripts/odia-script.js"></script>

<!-- Bengali -->
<script src="https://cdn.jsdelivr.net/gh/PramodJUS/devanagari-transliterate@main/scripts/bengali-script.js"></script>

<!-- English/IAST Romanization -->
<script src="https://cdn.jsdelivr.net/gh/PramodJUS/devanagari-transliterate@main/scripts/english-script.js"></script>
```

### Basic Usage Example
### Basic Usage Example

```javascript
// Transliterate to different scripts
const kannadaText = transliterateText("ब्रह्मसूत्राणि", "kn");
console.log(kannadaText); // ಬ್ರಹ್ಮಸೂತ್ರಾಣಿ

const teluguText = transliterateText("अधिकरणम्", "te");
console.log(teluguText); // అధికరణం

const tamilText = transliterateText("ज्ञानम्", "ta");
console.log(tamilText); // ஜ்ஞானம்

const malayalamText = transliterateText("वेदान्तः", "ml");
console.log(malayalamText); // വേദാന്തഃ

const gujaratiText = transliterateText("शारीरकम्", "gu");
console.log(gujaratiText); // શારીરકમ્

const odiaText = transliterateText("ब्रह्म", "or");
console.log(odiaText); // ବ୍ରହ୍ମ

const bengaliText = transliterateText("वेदान्तः", "bn");
console.log(bengaliText); // বেদান্তঃ

const englishText = transliterateText("वेदान्तः", "en");
console.log(englishText); // vedāntaḥ
```

### Version Pinning (Recommended for Production)

For production use, pin to a specific commit hash to ensure stability:

```html
<!-- Pin to latest commit (safer than @main) -->
<script src="https://cdn.jsdelivr.net/gh/PramodJUS/devanagari-transliterate@b53e751/transliterate.js"></script>
<script src="https://cdn.jsdelivr.net/gh/PramodJUS/devanagari-transliterate@b53e751/scripts/kannada-script.js"></script>
```

### NPM Installation (Coming Soon)

### NPM Installation (Coming Soon)

```bash
npm install devanagari-transliterate
```

*Note: NPM package is planned for future release. Currently use CDN for best experience.*

### Local/Self-Hosted Usage

### Local/Self-Hosted Usage

Download files from GitHub and host them yourself:

```html
<script src="./transliterate.js"></script>
<script src="./scripts/kannada-script.js"></script>
<script src="./scripts/telugu-script.js"></script>
<!-- Add other scripts as needed -->
```

## 📖 API Reference

### `transliterateText(text, targetLang)`

Transliterates Devanagari text to the target script.

**Parameters:**
- `text` (string): The Devanagari text to transliterate
- `targetLang` (string): Target language code - `'kn'`, `'te'`, `'ta'`, `'ml'`, `'gu'`, `'or'`, `'bn'`, `'en'`, or `'sa'`

**Returns:** 
- (string): Transliterated text in the target script

## 💡 Usage Examples

## 💡 Usage Examples

### Common Sanskrit Terms

```javascript
// Sacred syllable ॐ
transliterateText("ॐ", "kn");          // ಓಂ (Kannada)
transliterateText("ॐ", "te");          // ఓం (Telugu)
transliterateText("ॐ", "ta");          // ஓம் (Tamil)
transliterateText("ॐ", "ml");          // ഓം (Malayalam)
transliterateText("ॐ", "gu");          // ૐ (Gujarati)
transliterateText("ॐ", "or");          // ଓଁ (Odia)
transliterateText("ॐ", "bn");          // ওঁ (Bengali)
transliterateText("ॐ", "en");          // oṃ (English/IAST)

// Namah (नमः)
transliterateText("नमः", "kn");         // ನಮಃ
transliterateText("नमः", "te");         // నమః

// Vedanta (वेदान्तः)
transliterateText("वेदान्तः", "ml");    // വേദാന്തഃ
transliterateText("वेदान्तः", "bn");    // বেদান্তঃ
```

### Brahma Sutra Text

```javascript
// Complete phrases from Brahma Sutras
transliterateText("ब्रह्मसूत्राणि", "kn"); // ಬ್ರಹ್ಮಸೂತ್ರಾಣಿ
transliterateText("अधिकरणम्", "te");      // అధికరణం
transliterateText("शारीरकम्", "gu");       // શારીરકમ્
```

### Special Combinations

The library handles special conjuncts accurately:

```javascript
// ज्ञ (jña)
transliterateText("ज्ञानम्", "kn");     // ಜ್ಞಾನಂ
transliterateText("ज्ञानम्", "te");     // జ్ఞానం
transliterateText("ज्ञानम्", "ta");     // ஜ்ஞானம்

// क्ष (kṣa)
transliterateText("क्षत्रिय", "ml");    // ക്ഷത്രിയ
transliterateText("क्षत्रिय", "gu");    // ક્ષત્રિય

// त्र (tra)
transliterateText("सूत्रम्", "ml");     // സൂത്രം
transliterateText("ब्रह्म", "or");      // ବ୍ରହ୍ମ
```

### Language-Specific Examples
### Language-Specific Examples

#### Kannada (ಕನ್ನಡ)
```javascript
transliterateText("ॐ", "kn");          // ಓಂ
transliterateText("नमः", "kn");         // ನಮಃ
transliterateText("ज्ञानम्", "kn");     // ಜ್ಞಾನಂ
```

#### Telugu (తెలుగు)
```javascript
transliterateText("ॐ", "te");          // ఓం
transliterateText("नमः", "te");         // నమః
transliterateText("ज्ञानम्", "te");     // జ్ఞానం
```

#### Tamil (தமிழ்)
```javascript
transliterateText("ॐ", "ta");          // ஓம்
transliterateText("वेदम्", "ta");       // வேதம்
transliterateText("ब्रह्म", "ta");      // ப்ரஹ்ம
```

#### Malayalam (മലയാളം)
```javascript
transliterateText("ॐ", "ml");          // ഓം
transliterateText("वेदान्तः", "ml");    // വേദാന്തഃ
transliterateText("सूत्रम्", "ml");     // സൂത്രം
```

#### Gujarati (ગુજરાતી)
```javascript
transliterateText("ॐ", "gu");          // ૐ
transliterateText("ज्ञानम्", "gu");     // જ્ઞાનમ્
transliterateText("शान्तिः", "gu");     // શાન્તિઃ
```

#### Odia/Oriya (ଓଡ଼ିଆ)
```javascript
transliterateText("ॐ", "or");          // ଓଁ
transliterateText("वेदः", "or");        // ବେଦଃ
transliterateText("ब्रह्म", "or");      // ବ୍ରହ୍ମ
```

#### Bengali (বাংলা)
```javascript
transliterateText("ॐ", "bn");          // ওঁ
transliterateText("वेदान्तः", "bn");    // বেদান্তঃ
transliterateText("ब्रह्मसूत्रम्", "bn"); // ব্রহ্মসূত্রম্
```

#### English - IAST Romanization
```javascript
transliterateText("ॐ", "en");              // oṃ
transliterateText("वेदान्तः", "en");        // vedāntaḥ
transliterateText("ब्रह्मसूत्रम्", "en");    // brahmasūtram
transliterateText("अद्वैतम्", "en");        // advaitam
transliterateText("शङ्करः", "en");         // śaṅkaraḥ
```

#### Sanskrit (संस्कृतम्) - Passthrough
```javascript
transliterateText("ॐ", "sa");          // ॐ
```

## 🛠️ Advanced Features

### Anusvara Normalization

The library automatically normalizes anusvara (ं) to the appropriate nasal consonant based on the following consonant:

```javascript
// संस्कृतम् → The ं before स is handled correctly
transliterateText("संस्कृतम्", "kn"); // ಸಂಸ್ಕೃತಂ

// शान्तिः → The न् is properly rendered
transliterateText("शान्तिः", "te");   // శాన్తిః
```

### Special Conjunct Combinations

Predefined mappings for common Sanskrit conjuncts:
- **क्ष** (kṣa) - क् + ष
- **ज्ञ** (jña) - ज् + ञ
- **त्र** (tra) - त् + र
- **श्र** (śra) - श् + र

```javascript
transliterateText("क्षेत्रज्ञ", "kn"); // ಕ್ಷೇತ್ರಜ್ಞ
```

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

### Adding New Scripts

To add support for a new Indic script:

1. **Create script file**: Add `scripts/[language]-script.js`

1. **Create script file**: Add `scripts/[language]-script.js`

2. **Define mapping structure**:
```javascript
SCRIPT_MAPPINGS.xx = {  // Use ISO 639-1 language code
    mapping: {
        // Vowels
        'अ': 'X',
        'आ': 'X',
        // ... all Devanagari characters
        
        // Consonants
        'क': 'X',
        'ख': 'X',
        // ... complete mappings
    },
    specialCombinations: {
        'क्ष': 'XX',  // kṣa
        'ज्ञ': 'XX',  // jña
        // ... language-specific conjuncts
    },
    anusvaraNormalization: {
        enabled: true,
        anusvara: 'ं',
        nasals: {
            'क': 'ङ्',
            'त': 'न्',
            // ... nasal mappings
        }
    }
};
```

3. **Test thoroughly** with common Sanskrit texts
4. **Update README.md** with language details
5. **Submit pull request** to the repository

### Reporting Issues

Found a bug or incorrect transliteration? [Open an issue](https://github.com/PramodJUS/devanagari-transliterate/issues) with:
- Source Devanagari text
- Target language code
- Expected output
- Actual output

## 📝 Use Cases

Perfect for:
- 📿 Digital Vedanta study platforms
- 📚 Sanskrit educational materials
- 🕉️ Religious/spiritual content websites
- 📖 Multilingual scripture publications
- 🎓 Academic Sanskrit research tools
- 📱 Bhakti/devotional apps

## 🌐 Browser Compatibility

Works in all modern browsers:
- ✅ Chrome/Edge 60+
- ✅ Firefox 60+
- ✅ Safari 12+
- ✅ Opera 47+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

Requires ES6+ support (released 2015+).

## 📄 License

MIT License - Free for personal and commercial use.

See [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

Built with devotion for Sanskrit scholars, Vedanta students, and all who wish to share ancient wisdom in modern Indic scripts.

Special thanks to the global Sanskrit and Indic language communities.

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/PramodJUS/devanagari-transliterate/issues)
- **Repository**: [github.com/PramodJUS/devanagari-transliterate](https://github.com/PramodJUS/devanagari-transliterate)

## 🗺️ Roadmap

Future enhancements planned:
- [ ] ES6 module support
- [ ] NPM package publication
- [ ] TypeScript definitions
- [ ] Additional scripts (Sinhala, Grantha, Tibetan)
- [x] **IAST/romanization support** ✅ (Completed)
- [ ] Bi-directional transliteration (IAST → Devanagari)
- [ ] Performance optimizations for large texts
- [ ] Harvard-Kyoto and SLP1 romanization schemes

---

**Made with ❤️ for Sanskrit scholars and Indic language enthusiasts**

*Sarve bhavantu sukhinaḥ* | सर्वे भवन्तु सुखिनः | May all beings be happy

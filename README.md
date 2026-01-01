# Vedanta Project

**Version 1.0.3** | Last Updated: January 1, 2026

A comprehensive web-based resource for studying Vedanta philosophy, specifically the **Brahma Sutras** with **Madhvacharya's Dvaita Vedanta** commentary.

## Project Structure

```
vedanta/
├── index.html              # Main HTML page
├── css/
│   └── bs.css             # Styles for the application
├── js/
│   ├── bs.js              # Main application logic
│   ├── transliterate.js   # Generic transliteration engine
│   └── scripts/
│       └── kannada-script.js  # Kannada script configuration
├── sutra/
│   ├── bs.csv             # CSV data with all 136 sutras
│   ├── sutra-details.json # Extended details (meanings, commentary)
│   └── audio/             # Audio files for sutra recitation
└── README.md              # This file
```

## Features

- **Multi-Language Support**: View sutras in Sanskrit (Devanagari) or Kannada script
- **Dynamic Transliteration**: Real-time script conversion with intelligent rules
  - Anusvara normalization for proper compound letters
  - Special character combinations (क्ष, ज्ञ, श्र)
  - Final nasal to anusvara conversion
- **Interactive Navigation**: Browse sutras by Adhyaya (chapter), Pada (section), and Adhikarana (topic)
- **Audio Playback**: Listen to sutra recitations
- **Text-to-Speech**: Hear pronunciations for any sutra
- **Responsive Design**: Works on desktop and mobile devices
- **Dvaita Vedanta Focus**: All explanations follow Madhvacharya's dualistic interpretation
- **Extensible Architecture**: Easy to add new languages (Tamil, Telugu, etc.)

## Running the Application

Since the application loads data from a CSV file, you need to run it through a local web server:

### Using Python:
```bash
cd vedanta
python -m http.server 8000
```

Then open: http://localhost:8000/

### Using Node.js (npx):
```bash
cd vedanta
npx http-server -p 8000
```

### Using VS Code Live Server:
Install the "Live Server" extension and right-click on `index.html` > "Open with Live Server"

## Current Status

- ✅ All 136 sutras of Adhyaya 1 completed (across 4 Padas)
- ✅ Sanskrit-Kannada transliteration system implemented
- ✅ Audio playback and text-to-speech integrated
- 🔄 Extended meanings and commentary being added
- 🔄 Remaining Adhyayas 2-4 to be added (419 sutras remaining)

## Dvaita Vedanta Philosophy

This project presents sutras according to **Madhvacharya's Dvaita (Dualistic) Vedanta**:

- **पञ्चभेद (Five-fold Difference)**: Eternal distinctions between God-soul, God-matter, soul-soul, soul-matter, and matter-matter
- **स्वतन्त्र-परतन्त्र**: Brahman (Vishnu) is independent; souls and matter are dependent
- *Transliteration System

The application uses a modular transliteration architecture:

- **Generic Engine** (`transliterate.js`): Language-agnostic transliteration logic
- **Script Configurations** (`scripts/*.js`): Language-specific mappings and rules
- **Adding New Languages**: Create a new file `scripts/{language}-script.js` with character mappings

### Supported Languages
- **Sanskrit (sa)**: Default Devanagari script
- **Kannada (kn)**: Full transliteration with smart anusvara handling

## Future Enhancements

- Add remaining sutras for Adhyayas 2-4
- Add Tamil and Telugu script support
- Include Sanskrit word-by-word analysis (pada-viccheda)
- Add cross-references to Upanishads
- Complete detailed meanings and commentary for all sutras
- Bookmark and favorites functionality
- Offline support with service workerso Upanishads
- Multi-commentary support (Shankara's Advaita, Ramanuja's Vishishtadvaita)
- Audio pronunciation guide
- Bookmark functionality

## Credits

Based on Madhvacharya's Brahma Sutra Bhashya (commentary)

## License

For educational purposes

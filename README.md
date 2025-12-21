# Vedanta Project

A comprehensive web-based resource for studying Vedanta philosophy, specifically the **Brahma Sutras** with **Madhvacharya's Dvaita Vedanta** commentary.

## Project Structure

```
vedanta/
├── index.html              # Main HTML page
├── css/
│   └── bs.css    # Styles for the application
├── js/
│   └── bs.js     # JavaScript for data loading and interactivity
├── sutra/
│   └── bs.csv    # CSV data with sutras and explanations
└── README.md              # This file
```

## Features

- **Interactive Navigation**: Browse sutras by Adhyaya (chapter) and Pada (section)
- **Search Functionality**: Search across Sanskrit text, translations, and explanations
- **Responsive Design**: Works on desktop and mobile devices
- **Dvaita Vedanta Focus**: All explanations follow Madhvacharya's dualistic interpretation

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

- ✅ First 30 sutras of Adhyaya 1, Pada 1 completed
- 🔄 Remaining 525 sutras to be added (555 total in Brahma Sutras)

## Dvaita Vedanta Philosophy

This project presents sutras according to **Madhvacharya's Dvaita (Dualistic) Vedanta**:

- **पञ्चभेद (Five-fold Difference)**: Eternal distinctions between God-soul, God-matter, soul-soul, soul-matter, and matter-matter
- **स्वतन्त्र-परतन्त्र**: Brahman (Vishnu) is independent; souls and matter are dependent
- **विष्णु-सर्वोत्तमता**: Vishnu is the Supreme Being
- **तत्त्ववाद**: Realism - the world and differences are real, not illusory

## Future Enhancements

- Add remaining sutras for all 4 Adhyayas
- Include Sanskrit word-by-word analysis
- Add cross-references to Upanishads
- Multi-commentary support (Shankara's Advaita, Ramanuja's Vishishtadvaita)
- Audio pronunciation guide
- Bookmark functionality

## Credits

Based on Madhvacharya's Brahma Sutra Bhashya (commentary)

## License

For educational purposes

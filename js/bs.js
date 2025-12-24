// Global variables
let allSutras = [];
let filteredSutras = [];
let sutraDetails = {};
let currentView = 'list'; // 'list' or 'detail'
let currentSpeech = null; // Track current speech synthesis
let currentAudio = null; // Track current audio element
let isSpeaking = false;
let currentLanguage = 'sa'; // Default language (Sanskrit)
let currentSutra = null; // Track current sutra in detail view
let selectedVyakhyanaKeys = new Set(); // Track selected vyakhyana KEY NAMES, not positions
let selectAllVyakhyanas = true; // Track if "All" is selected (default: true)
let openVyakhyanas = new Set(); // Track which vyakhyanas are currently open/expanded

// Translation lookup table for common Sanskrit terms
const translationLookup = {
    'सूत्रम्': {
        sa: 'सूत्रम्',
        kn: 'ಸೂತ್ರ',
        te: 'సూత్రం',
        ta: 'சூத்திரம்',
        ml: 'സൂത്രം',
        gu: 'સૂત્ર',
        or: 'ସୂତ୍ର',
        bn: 'সূত্র',
        en: 'Sutra'
    },
    'अधिकरणम्': {
        sa: 'अधिकरणम्',
        kn: 'ಅಧಿಕರಣ',
        te: 'అధికరణం',
        ta: 'அதிகரணம்',
        ml: 'അധികരണം',
        gu: 'અધિકરણ',
        or: 'ଅଧିକରଣ',
        bn: 'অধিকরণ',
        en: 'Topic'
    },
    'अर्थः': {
        sa: 'अर्थः',
        kn: 'ಅರ್ಥ',
        te: 'అర్థం',
        ta: 'பொருள்',
        ml: 'അർത്ഥം',
        gu: 'અર્થ',
        or: 'ଅର୍ଥ',
        bn: 'অর্থ',
        en: 'Meaning'
    },
    'व्याख्यानम्': {
        sa: 'व्याख्यानम्',
        kn: 'ವ್ಯಾಖ್ಯಾನ',
        te: 'వ్యాఖ్యానం',
        ta: 'விளக்கம்',
        ml: 'വ്യാഖ്യാനം',
        gu: 'વ્યાખ્યાન',
        or: 'ବ୍ୟାଖ୍ୟାନ',
        bn: 'ব্যাখ্যান',
        en: 'Commentary'
    },
    'व्याख्यान': {
        sa: 'व्याख्यान',
        kn: 'ವ್ಯಾಖ್ಯಾನ',
        te: 'వ్యాఖ్యాన',
        ta: 'விளக்கம்',
        ml: 'വ്യാഖ്യാന',
        gu: 'વ્યાખ્યાન',
        or: 'ବ୍ୟାଖ୍ୟାନ',
        bn: 'ব্যাখ্যান',
        en: 'Commentary'
    },
    'सर्वम्': {
        sa: 'सर्वम्',
        kn: 'ಎಲ್ಲಾ',
        te: 'అన్నీ',
        ta: 'அனைத்தும்',
        ml: 'എല്ലാം',
        gu: 'બધા',
        or: 'ସମସ୍ତ',
        bn: 'সব',
        en: 'All'
    },
    'वेदान्तदर्शनम्': {
        sa: 'वेदान्तदर्शनम्',
        kn: 'ವೇದಾಂತ ದರ್ಶನ',
        te: 'వేదాంత దర్శనం',
        ta: 'வேதாந்த தரிசனம்',
        ml: 'വേദാന്ത ദർശനം',
        gu: 'વેદાંત દર્શન',
        or: 'ବେଦାନ୍ତ ଦର୍ଶନ',
        bn: 'বেদান্ত দর্শন',
        en: 'Vedanta Philosophy'
    },
    'द्वैत वेदान्त सिद्धान्ताः': {
        sa: 'द्वैत वेदान्त सिद्धान्ताः',
        kn: 'ದ್ವೈತ ವೇದಾಂತ ಸಿದ್ಧಾಂತಗಳು',
        te: 'ద్వైత వేదాంత సిద్ధాంతాలు',
        ta: 'த்வைத வேதாந்த கொள்கைகள்',
        ml: 'ദ്വൈത വേദാന്ത സിദ്ധാന്തങ്ങൾ',
        gu: 'દ્વૈત વેદાંત સિદ્ધાંતો',
        or: 'ଦ୍ୱୈତ ବେଦାନ୍ତ ସିଦ୍ଧାନ୍ତ',
        bn: 'দ্বৈত বেদান্ত সিদ্ধান্ত',
        en: 'Dvaita Vedanta Principles'
    },
    'मुख्यपृष्ठम्': {
        sa: 'मुख्यपृष्ठम्',
        kn: 'ಮುಖ್ಯ ಪುಟ',
        te: 'ముఖ్య పేజీ',
        ta: 'முகப்பு பக்கம்',
        ml: 'മുഖ്യ പേജ്',
        gu: 'મુખ્ય પૃષ્ઠ',
        or: 'ମୁଖ୍ୟ ପୃଷ୍ଠା',
        bn: 'মুখ্য পৃষ্ঠা',
        en: 'Home'
    }
};

// Helper function to get translated text with fallback to transliteration
function getTranslatedText(sanskritText, targetLanguage = currentLanguage) {
    // If Sanskrit, return as is
    if (targetLanguage === 'sa') {
        return sanskritText;
    }
    
    // Check if translation exists in lookup table
    if (translationLookup[sanskritText] && translationLookup[sanskritText][targetLanguage]) {
        return translationLookup[sanskritText][targetLanguage];
    }
    
    // Fallback to transliteration
    return transliterateText(sanskritText, targetLanguage);
}

// Language translations
const languages = {
    sa: {
        title: 'Brahma Sutras with Madhvacharya\'s Dvaita Vedanta Commentary',
        adhyaya: 'अध्यायः:',
        pada: 'पादः:',
        adhikarana: 'अधिकरणम्:',
        allTopics: 'सर्वम्',
        searchPlaceholder: 'Search sutras...',
        vedantaPhilosophy: 'वेदान्तदर्शनम्',
        infoText: 'The Brahma Sutras (ब्रह्मसूत्राणि), also known as Vedanta Sutras, are foundational texts of Vedanta philosophy composed by Sage Badarayana (Vyasa). This presentation follows <strong>Madhvacharya\'s Dvaita (Dualistic) Vedanta</strong> interpretation.',
        dvaitaPrinciples: 'द्वैत वेदान्त सिद्धान्ताः',
        backToList: '← Back to List',
        backToHome: 'मुख्यपृष्ठम्',
        meaning: 'अर्थः (Meaning)',
        commentary: 'द्वैत वेदान्त व्याख्या (Dvaita Vedanta Commentary)',
        references: 'References:',
        loading: 'Loading sutras...',
        noResults: 'No sutras found for the selected criteria.',
        footer: 'Based on Madhvacharya\'s Brahma Sutra Bhashya | For educational purposes',
        sutraLabel: 'Sutra',
        adhyayaNames: {
            '1': 'प्रथमाध्यायः',
            '2': 'द्वितीयाध्यायः',
            '3': 'तृतीयाध्यायः',
            '4': 'चतुर्थाध्यायः'
        },
        padaNames: {
            '1': 'प्रथमः पादः',
            '2': 'द्वितीयः पादः',
            '3': 'तृतीयः पादः',
            '4': 'चतुर्थः पादः'
        },
        adhyayaOptions: {
            '1': 'प्रथमः (Samanvaya - Harmony)',
            '2': 'द्वितीयः (Avirodha - Non-Conflict)',
            '3': 'तृतीयः (Sadhana - Means)',
            '4': 'चतुर्थः (Phala - Result)'
        },
        padaOptions: {
            '1': 'प्रथमः',
            '2': 'द्वितीयः',
            '3': 'तृतीयः',
            '4': 'चतुर्थः'
        }
    },
    kn: {
        // Only actual Kannada UI translations (not Sanskrit transliterations)
        title: 'ಮಧ್ವಾಚಾರ್ಯರ ದ್ವೈತ ವೇದಾಂತ ವ್ಯಾಖ್ಯಾನದೊಂದಿಗೆ ಬ್ರಹ್ಮಸೂತ್ರಗಳು',
        allTopics: 'ಎಲ್ಲಾ ವಿಷಯಗಳು',
        searchPlaceholder: 'ಸೂತ್ರಗಳನ್ನು ಹುಡುಕಿ...',
        infoText: 'ಬ್ರಹ್ಮಸೂತ್ರಗಳು (ब्रह्मसूत्राणि), ವೇದಾಂತ ಸೂತ್ರಗಳು ಎಂದೂ ಕರೆಯಲ್ಪಡುತ್ತವೆ, ಇವು ಮಹರ್ಷಿ ಬಾದರಾಯಣರು (ವ್ಯಾಸರು) ರಚಿಸಿದ ವೇದಾಂತ ತತ್ತ್ವಶಾಸ್ತ್ರದ ಮೂಲಗ್ರಂಥಗಳು. ಈ ಪ್ರಸ್ತುತಿಯು <strong>ಮಧ್ವಾಚಾರ್ಯರ ದ್ವೈತ ವೇದಾಂತ</strong> ವ್ಯಾಖ್ಯಾನವನ್ನು ಅನುಸರಿಸುತ್ತದೆ.',
        backToList: '← ಪಟ್ಟಿಗೆ ಹಿಂತಿರುಗಿ',
        backToHome: 'ಮುಖ್ಯ ಪುಟ',
        references: 'ಉಲ್ಲೇಖಗಳು:',
        loading: 'ಸೂತ್ರಗಳನ್ನು ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ...',
        noResults: 'ಆಯ್ದ ಮಾನದಂಡಕ್ಕಾಗಿ ಯಾವುದೇ ಸೂತ್ರಗಳು ಕಂಡುಬಂದಿಲ್ಲ.',
        footer: 'ಮಧ್ವಾಚಾರ್ಯರ ಬ್ರಹ್ಮಸೂತ್ರ ಭಾಷ್ಯವನ್ನು ಆಧರಿಸಿ | ಶೈಕ್ಷಣಿಕ ಉದ್ದೇಶಗಳಿಗಾಗಿ',
        // Kannada explanations for adhyaya/pada options
        adhyayaExplanations: {
            '1': 'ಸಮನ್ವಯ',
            '2': 'ಅವಿರೋಧ',
            '3': 'ಸಾಧನ',
            '4': 'ಫಲ'
        }
    },
    te: {
        // Telugu UI translations
        title: 'మధ్వాచార్యుల ద్వైత వేదాంత వ్యాఖ్యానంతో బ్రహ్మసూత్రాలు',
        allTopics: 'అన్ని విషయాలు',
        searchPlaceholder: 'సూత్రాలను వెతకండి...',
        infoText: 'బ్రహ్మసూత్రాలు (ब्रह्मसूत्राणि), వేదాంత సూత్రాలు అని కూడా పిలుస్తారు, ఇవి మహర్షి బాదరాయణుడు (వ్యాసుడు) రచించిన వేదాంత తత్వశాస్త్ర మూల గ్రంథాలు. ఈ ప్రదర్శన <strong>మధ్వాచార్యుల ద్వైత వేదాంత</strong> వ్యాఖ్యానాన్ని అనుసరిస్తుంది.',
        backToList: '← జాబితాకు తిరిగి వెళ్ళండి',
        backToHome: 'ముఖ్య పేజీ',
        references: 'సూచనలు:',
        loading: 'సూత్రాలు లోడ్ అవుతున్నాయి...',
        noResults: 'ఎంచుకున్న ప్రమాణాల కోసం సూత్రాలు కనుగొనబడలేదు.',
        footer: 'మధ్వాచార్యుల బ్రహ్మసూత్ర భాష్యం ఆధారంగా | విద్యా ప్రయోజనాల కోసం',
        // Telugu explanations for adhyaya/pada options
        adhyayaExplanations: {
            '1': 'సమన్వయ',
            '2': 'అవిరోధ',
            '3': 'సాధన',
            '4': 'ఫల'
        }
    },
    ta: {
        // Tamil UI translations
        title: 'மத்வாச்சார்யாவின் த்வைத வேதாந்த விளக்கத்துடன் பிரம்ம சூத்திரங்கள்',
        allTopics: 'அனைத்து தலைப்புகள்',
        searchPlaceholder: 'சூத்திரங்களைத் தேடு...',
        infoText: 'பிரம்ம சூத்திரங்கள் (ब्रह्मसूत्राणि), வேதாந்த சூத்திரங்கள் என்றும் அழைக்கப்படுகின்றன, இவை மகரிஷி பாதராயணரால் (வியாசர்) இயற்றப்பட்ட வேதாந்த தத்துவத்தின் அடிப்படை நூல்கள். இந்த விளக்கக்காட்சி <strong>மத்வாச்சார்யாவின் த்வைத வேதாந்த</strong> விளக்கத்தைப் பின்பற்றுகிறது.',
        backToList: '← பட்டியலுக்குத் திரும்பு',
        backToHome: 'முகப்பு பக்கம்',
        references: 'குறிப்புகள்:',
        loading: 'சூத்திரங்கள் ஏற்றப்படுகின்றன...',
        noResults: 'தேர்ந்தெடுக்கப்பட்ட அளவுகோல்களுக்கு சூத்திரங்கள் இல்லை.',
        footer: 'மத்வாச்சார்யாவின் பிரம்ம சூத்திர பாஷ்யத்தை அடிப்படையாகக் கொண்டது | கல்வி நோக்கங்களுக்காக',
        adhyayaExplanations: {
            '1': 'சமன்வய',
            '2': 'அவிரோத',
            '3': 'சாதன',
            '4': 'பல'
        }
    },
    ml: {
        // Malayalam UI translations
        title: 'മധ്വാചാര്യരുടെ ദ്വൈത വേദാന്ത വ്യാഖ്യാനത്തോടുകൂടിയ ബ്രഹ്മസൂത്രങ്ങൾ',
        allTopics: 'എല്ലാ വിഷയങ്ങളും',
        searchPlaceholder: 'സൂത്രങ്ങൾ തിരയുക...',
        infoText: 'ബ്രഹ്മസൂത്രങ്ങൾ (ब्रह्मसूत्राणि), വേദാന്ത സൂത്രങ്ങൾ എന്നും അറിയപ്പെടുന്നു, മഹർഷി ബാദരായണൻ (വ്യാസൻ) രചിച്ച വേദാന്ത തത്ത്വചിന്തയുടെ അടിസ്ഥാന ഗ്രന്ഥങ്ങളാണ്. ഈ അവതരണം <strong>മധ്വാചാര്യരുടെ ദ്വൈത വേദാന്ത</strong> വ്യാഖ്യാനം പിന്തുടരുന്നു.',
        backToList: '← പട്ടികയിലേക്ക് മടങ്ങുക',
        backToHome: 'മുഖ്യ പേജ്',
        references: 'അവലംബങ്ങൾ:',
        loading: 'സൂത്രങ്ങൾ ലോഡ് ചെയ്യുന്നു...',
        noResults: 'തിരഞ്ഞെടുത്ത മാനദണ്ഡങ്ങൾക്ക് സൂത്രങ്ങളൊന്നും കണ്ടെത്തിയില്ല.',
        footer: 'മധ്വാചാര്യരുടെ ബ്രഹ്മസൂത്ര ഭാഷ്യം അടിസ്ഥാനമാക്കി | വിദ്യാഭ്യാസ ആവശ്യങ്ങൾക്ക്'
    },
    gu: {
        // Gujarati UI translations
        title: 'મધ્વાચાર્યના દ્વૈત વેદાંત ભાષ્ય સાથે બ્રહ્મસૂત્રો',
        allTopics: 'બધા વિષયો',
        searchPlaceholder: 'સૂત્રો શોધો...',
        infoText: 'બ્રહ્મસૂત્રો (ब्रह्मसूत्राणि), વેદાંત સૂત્રો તરીકે પણ ઓળખાય છે, મહર્ષિ બાદરાયણ (વ્યાસ) દ્વારા રચિત વેદાંત તત્ત્વજ્ઞાનના મૂળભૂત ગ્રંથો છે. આ પ્રસ્તુતિ <strong>મધ્વાચાર્યના દ્વૈત વેદાંત</strong> ભાષ્યને અનુસરે છે.',
        backToList: '← યાદી પર પાછા ફરો',
        backToHome: 'મુખ્ય પૃષ્ઠ',
        references: 'સંદર્ભો:',
        loading: 'સૂત્રો લોડ થઈ રહ્યાં છે...',
        noResults: 'પસંદ કરેલા માપદંડો માટે કોઈ સૂત્રો મળ્યાં નથી.',
        footer: 'મધ્વાચાર્યના બ્રહ્મસૂત્ર ભાષ્ય પર આધારિત | શૈક્ષણિક હેતુઓ માટે'
    },
    or: {
        // Odia UI translations
        title: 'ମଧ୍ୱାଚାର୍ଯ୍ୟଙ୍କ ଦ୍ୱୈତ ବେଦାନ୍ତ ଭାଷ୍ୟ ସହିତ ବ୍ରହ୍ମସୂତ୍ର',
        allTopics: 'ସମସ୍ତ ବିଷୟ',
        searchPlaceholder: 'ସୂତ୍ର ଖୋଜନ୍ତୁ...',
        infoText: 'ବ୍ରହ୍ମସୂତ୍ର (ब्रह्मसूत्राणि), ବେଦାନ୍ତ ସୂତ୍ର ଭାବରେ ମଧ୍ୟ ଜଣାଶୁଣା, ମହର୍ଷି ବାଦରାୟଣ (ବ୍ୟାସ) ଦ୍ୱାରା ରଚିତ ବେଦାନ୍ତ ଦର୍ଶନର ମୂଳଭୂତ ଗ୍ରନ୍ଥ। ଏହି ଉପସ୍ଥାପନା <strong>ମଧ୍ୱାଚାର୍ଯ୍ୟଙ୍କ ଦ୍ୱୈତ ବେଦାନ୍ତ</strong> ଭାଷ୍ୟ ଅନୁସରଣ କରେ।',
        backToList: '← ତାଲିକାକୁ ଫେରନ୍ତୁ',
        backToHome: 'ମୁଖ୍ୟ ପୃଷ୍ଠା',
        references: 'ସନ୍ଦର୍ଭ:',
        loading: 'ସୂତ୍ର ଲୋଡ୍ ହେଉଛି...',
        noResults: 'ମନୋନୀତ ମାନଦଣ୍ଡ ପାଇଁ କୌଣସି ସୂତ୍ର ମିଳିଲା ନାହିଁ।',
        footer: 'ମଧ୍ୱାଚାର୍ଯ୍ୟଙ୍କ ବ୍ରହ୍ମସୂତ୍ର ଭାଷ୍ୟ ଉପରେ ଆଧାରିତ | ଶିକ୍ଷାଗତ ଉଦ୍ଦେଶ୍ୟ ପାଇଁ'
    },
    bn: {
        // Bengali UI translations
        title: 'মধ্বাচার্যের দ্বৈত বেদান্ত ভাষ্য সহ ব্রহ্মসূত্র',
        allTopics: 'সমস্ত বিষয়',
        searchPlaceholder: 'সূত্র খুঁজুন...',
        infoText: 'ব্রহ্মসূত্র (ब्रह्मसूत्राणि), বেদান্ত সূত্র নামেও পরিচিত, মহর্ষি বাদরায়ণ (ব্যাস) রচিত বেদান্ত দর্শনের মূল গ্রন্থ। এই উপস্থাপনা <strong>মধ্বাচার্যের দ্বৈত বেদান্ত</strong> ভাষ্য অনুসরণ করে।',
        backToList: '← তালিকায় ফিরে যান',
        backToHome: 'মুখ্য পৃষ্ঠা',
        references: 'তথ্যসূত্র:',
        loading: 'সূত্র লোড হচ্ছে...',
        noResults: 'নির্বাচিত মানদণ্ডের জন্য কোনো সূত্র পাওয়া যায়নি।',
        footer: 'মধ্বাচার্যের ব্রহ্মসূত্র ভাষ্যের উপর ভিত্তি করে | শিক্ষাগত উদ্দেশ্যে'
    },
    en: {
        // English UI translations (no transliteration, just English UI)
        title: 'Brahma Sutras with Madhvacharya\'s Dvaita Vedanta Commentary',
        adhyaya: 'Chapter:',
        pada: 'Section:',
        adhikarana: 'Topic:',
        allTopics: 'All Topics',
        searchPlaceholder: 'Search sutras...',
        vedantaPhilosophy: 'Vedanta Philosophy',
        infoText: 'The Brahma Sutras (brahmasūtrāṇi), also known as Vedanta Sutras, are foundational texts of Vedanta philosophy composed by Sage Badarayana (Vyasa). This presentation follows <strong>Madhvacharya\'s Dvaita (Dualistic) Vedanta</strong> interpretation.',
        dvaitaPrinciples: 'Dvaita Vedanta Principles',
        backToList: '← Back to List',
        backToHome: 'Home',
        meaning: 'Meaning',
        commentary: 'Dvaita Vedanta Commentary',
        references: 'References:',
        loading: 'Loading sutras...',
        noResults: 'No sutras found for the selected criteria.',
        footer: 'Based on Madhvacharya\'s Brahma Sutra Bhashya | For educational purposes',
        sutraLabel: 'Sutra',
        adhyayaNames: {
            '1': 'First Chapter',
            '2': 'Second Chapter',
            '3': 'Third Chapter',
            '4': 'Fourth Chapter'
        },
        padaNames: {
            '1': 'First Section',
            '2': 'Second Section',
            '3': 'Third Section',
            '4': 'Fourth Section'
        },
        adhyayaOptions: {
            '1': 'First (Samanvaya - Harmony)',
            '2': 'Second (Avirodha - Non-Conflict)',
            '3': 'Third (Sadhana - Means)',
            '4': 'Fourth (Phala - Result)'
        },
        padaOptions: {
            '1': 'First',
            '2': 'Second',
            '3': 'Third',
            '4': 'Fourth'
        }
    }
};

// DOM Elements
const languageSelect = document.getElementById('language');
const adhyayaSelect = document.getElementById('adhyaya');
const padaSelect = document.getElementById('pada');
const adhikaranaSelect = document.getElementById('adhikarana');
const searchInput = document.getElementById('searchInput');
const sutraList = document.getElementById('sutraList');
const sutraDetail = document.getElementById('sutraDetail');
const detailContent = document.getElementById('detailContent');
const sectionHeading = document.getElementById('sectionHeading');
const sectionTitle = document.getElementById('sectionTitle');
const adhyayaSelector = document.getElementById('adhyayaSelector');
const padaSelector = document.getElementById('padaSelector');
const adhikaranaSelector = document.getElementById('adhikaranaSelector');
const sutraNavigationHeader = document.getElementById('sutraNavigationHeader');
const previousHeaderBtn = document.getElementById('previousSutraHeaderBtn');
const nextHeaderBtn = document.getElementById('nextSutraHeaderBtn');
const collapseIcon = document.getElementById('collapseIcon');

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    // Load saved language preference
    const savedLanguage = localStorage.getItem('vedantaLanguage') || 'sa';
    currentLanguage = savedLanguage;
    if (languageSelect) {
        languageSelect.value = savedLanguage;
    }
    
    // Load saved vyakhyana selections
    const savedVyakhyanas = localStorage.getItem('selectedVyakhyanas');
    if (savedVyakhyanas) {
        selectedVyakhyanas = JSON.parse(savedVyakhyanas);
        // Update checkboxes
        const checkboxes = document.querySelectorAll('#vyakhyanaDropdownContent input[type="checkbox"]');
        checkboxes.forEach(cb => {
            cb.checked = selectedVyakhyanas.includes(parseInt(cb.value));
        });
        updateSelectedVyakhyanas();
    }
    
    loadSutras();
    setupEventListeners();
    updateUILanguage();
    
    // Load voices for speech synthesis
    if ('speechSynthesis' in window) {
        // Voices load asynchronously, wait for them
        window.speechSynthesis.onvoiceschanged = () => {
            const voices = window.speechSynthesis.getVoices();
            console.log('=== Available Voices ===');
            voices.forEach(v => console.log(v.name, v.lang));
            console.log('========================');
        };
        // Trigger immediately in case voices are already loaded
        setTimeout(() => {
            const voices = window.speechSynthesis.getVoices();
            if (voices.length > 0) {
                console.log('=== Available Voices ===');
                voices.forEach(v => console.log(v.name, v.lang));
                console.log('========================');
            }
        }, 100);
    }
});

// Setup event listeners
function setupEventListeners() {
    if (languageSelect) {
        languageSelect.addEventListener('change', onLanguageChange);
    }
    adhyayaSelect.addEventListener('change', onAdhyayaChange);
    padaSelect.addEventListener('change', onPadaChange);
    adhikaranaSelect.addEventListener('change', filterSutras);
    searchInput.addEventListener('input', debounce(searchSutras, 300));
    sectionHeading.addEventListener('click', toggleSutraList);
    
    // Navigation buttons in header
    if (previousHeaderBtn) {
        previousHeaderBtn.addEventListener('click', navigateToPrevious);
    }
    if (nextHeaderBtn) {
        nextHeaderBtn.addEventListener('click', navigateToNext);
    }
    
    // Panel toggle button
    const panelToggleBtn = document.getElementById('panelToggleBtn');
    if (panelToggleBtn) {
        panelToggleBtn.addEventListener('click', toggleInfoPanel);
    }
    
    // Heading audio button
    const headingAudioBtn = document.getElementById('headingAudioBtn');
    if (headingAudioBtn) {
        headingAudioBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent collapse/expand
            playAllSutras();
        });
    }
    
    // Speed slider
    const speedSlider = document.getElementById('speedSlider');
    const speedValue = document.getElementById('speedValue');
    if (speedSlider && speedValue) {
        speedSlider.addEventListener('input', (e) => {
            e.stopPropagation(); // Prevent collapse/expand
            speedValue.textContent = parseFloat(e.target.value).toFixed(2) + 'x';
        });
        // Prevent mousedown/click from toggling collapse
        speedSlider.addEventListener('mousedown', (e) => {
            e.stopPropagation();
        });
        speedSlider.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }
    
    // Header toggle button
    const headerToggleBtn = document.getElementById('headerToggleBtn');
    const mainHeader = document.getElementById('mainHeader');
    if (headerToggleBtn && mainHeader) {
        headerToggleBtn.addEventListener('click', () => {
            mainHeader.classList.toggle('header-collapsed');
            if (mainHeader.classList.contains('header-collapsed')) {
                headerToggleBtn.textContent = '▼';
                headerToggleBtn.title = 'Show header';
            } else {
                headerToggleBtn.textContent = '▲';
                headerToggleBtn.title = 'Hide header';
            }
        });
    }
    
    // Logo image as home button
    const logoImg = document.getElementById('logoImg');
    if (logoImg) {
        logoImg.addEventListener('click', () => {
            showListView();
        });
    }
    
    // Vyakhyana selector dropdown
    const vyakhyanaDropdownBtn = document.getElementById('vyakhyanaDropdownBtn');
    const vyakhyanaDropdownContent = document.getElementById('vyakhyanaDropdownContent');
    
    if (vyakhyanaDropdownBtn && vyakhyanaDropdownContent) {
        // Toggle dropdown
        vyakhyanaDropdownBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            vyakhyanaDropdownContent.classList.toggle('show');
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.dropdown-checkbox')) {
                vyakhyanaDropdownContent.classList.remove('show');
            }
        });
        
        // Handle checkbox changes
        const checkboxes = vyakhyanaDropdownContent.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                updateSelectedVyakhyanas();
                if (currentView === 'detail' && currentSutra) {
                    showSutraDetail(currentSutra);
                }
            });
        });
    }
}

// Update selected vyakhyanas based on checkboxes
function updateSelectedVyakhyanas(skipRerender = false) {
    const checkboxes = document.querySelectorAll('#vyakhyanaDropdownContent input[type="checkbox"]:not(#vyakhyana-checkbox-all)');
    
    // Clear and rebuild selected keys set
    selectedVyakhyanaKeys.clear();
    checkboxes.forEach(cb => {
        if (cb.checked) {
            selectedVyakhyanaKeys.add(cb.dataset.key);
        }
    });
    
    // Check if all are selected
    const totalAvailable = checkboxes.length;
    selectAllVyakhyanas = (selectedVyakhyanaKeys.size === totalAvailable && totalAvailable > 0);
    
    // Update button text
    const selectedText = document.getElementById('vyakhyanaSelectedText');
    if (selectedText) {
        if (selectAllVyakhyanas) {
            const allText = getTranslatedText('सर्वम्', currentLanguage);
            selectedText.textContent = allText;
        } else if (selectedVyakhyanaKeys.size === 0) {
            const noneText = currentLanguage === 'en' ? 'None Selected' : 
                            transliterateText('न किमपि', currentLanguage);
            selectedText.textContent = noneText;
        } else {
            selectedText.textContent = `${selectedVyakhyanaKeys.size} selected`;
        }
    }
    
    // Save to localStorage
    localStorage.setItem('selectedVyakhyanaKeys', JSON.stringify(Array.from(selectedVyakhyanaKeys)));
    localStorage.setItem('selectAllVyakhyanas', selectAllVyakhyanas);
    
    // Update visibility of vyakhyana sections without full re-render
    if (!skipRerender && currentView === 'detail') {
        updateVyakhyanaVisibility();
    }
}

// Update visibility of vyakhyana sections based on selection
function updateVyakhyanaVisibility() {
    // Get all commentary items
    const commentaryItems = document.querySelectorAll('.commentary-item');
    
    commentaryItems.forEach((item) => {
        const vyakhyanaKey = item.dataset.key;
        if (selectedVyakhyanaKeys.has(vyakhyanaKey)) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

// Handle language change
function onLanguageChange() {
    currentLanguage = languageSelect.value;
    localStorage.setItem('vedantaLanguage', currentLanguage);
    updateUILanguage();
    
    // Update vyakhyana dropdown labels
    updateVyakhyanaDropdownLabels();
    
    // Update navigation button text
    updateNavigationButtonText();
    
    // Refresh adhikarana dropdown in both views
    populateAdhikaranaDropdown();
    
    // Refresh current view
    if (currentView === 'list') {
        filterSutras();
    } else if (currentView === 'detail' && currentSutra) {
        // Refresh detail view with new language
        showSutraDetail(currentSutra);
    }
}

// Update vyakhyana dropdown labels based on language
function updateVyakhyanaDropdownLabels() {
    // Update the main label - keep it in English
    const vyakhyanaLabel = document.querySelector('.vyakhyana-selector > label');
    if (vyakhyanaLabel) {
        vyakhyanaLabel.textContent = 'Vyakhyana:';
        vyakhyanaLabel.setAttribute('for', 'vyakhyanaDropdown');
    }
    
    // Update dropdown item labels
    const labels = document.querySelectorAll('#vyakhyanaDropdownContent label');
    
    labels.forEach((label, index) => {
        const num = index + 1;
        const numDevanagari = ['१', '२', '३', '४', '५'][num - 1];
        const checkbox = label.querySelector('input');
        const isChecked = checkbox.checked;
        
        const vyakhyanaWord = getTranslatedText('व्याख्यान', currentLanguage);
        const transliteratedNum = transliterateText(numDevanagari, currentLanguage);
        const labelText = `${vyakhyanaWord} ${transliteratedNum}`;
        
        // Preserve checkbox state and update text
        const newCheckbox = checkbox.cloneNode(true);
        newCheckbox.checked = isChecked;
        
        label.innerHTML = '';
        label.appendChild(newCheckbox);
        label.appendChild(document.createTextNode(' ' + labelText));
    });
    
    // Re-attach event listeners
    const checkboxes = document.querySelectorAll('#vyakhyanaDropdownContent input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            updateSelectedVyakhyanas();
            if (currentView === 'detail' && currentSutra) {
                showSutraDetail(currentSutra);
            }
        });
    });
    
    // Update button text
    updateSelectedVyakhyanas();
}

// Navigate to previous sutra
function navigateToPrevious() {
    if (!currentSutra || filteredSutras.length === 0) return;
    
    const currentIndex = filteredSutras.findIndex(s => 
        s.adhyaya === currentSutra.adhyaya && 
        s.pada === currentSutra.pada && 
        s.sutra_number === currentSutra.sutra_number
    );
    
    if (currentIndex > 0) {
        // Keep track of which vyakhyanas are currently open (by key name)
        const openVyakhyanasArray = Array.from(openVyakhyanas);
        const previousSutra = filteredSutras[currentIndex - 1];
        showSutraDetail(previousSutra);
        
        // After navigation, open the same vyakhyanas (only if they exist in new sutra) and scroll to first one
        setTimeout(() => {
            // Get available vyakhyanas for the new sutra to check which ones exist
            const sutraKey = `${previousSutra.adhyaya}.${previousSutra.pada}.${previousSutra.sutra_number}`;
            const details = sutraDetails[sutraKey] || {};
            
            let firstOpenedVyakhyana = null;
            openVyakhyanasArray.forEach(vyakhyanaKey => {
                // Only try to open if this vyakhyana key exists in the new sutra
                if (details[vyakhyanaKey]) {
                    // Find the index of this vyakhyana in the new sutra
                    const vyakhyanaKeys = Object.keys(details).filter(key => {
                        const excludeKeys = ['meaning', 'meaningKn', 'meaningTe', 'meaningDetails', 'meaningDetailsKn', 'meaningDetailsTe', 
                                             'commentary', 'commentaryKn', 'commentaryTe'];
                        if (excludeKeys.includes(key)) return false;
                        const value = details[key];
                        return value && typeof value === 'object' && 
                               (value.hasOwnProperty('moola') || value.hasOwnProperty('Ka_Translation') || 
                                value.hasOwnProperty('Te_Translation') || value.hasOwnProperty('En_Translation'));
                    });
                    const num = vyakhyanaKeys.indexOf(vyakhyanaKey) + 1;
                    
                    if (num > 0) {
                        const toggle = document.getElementById(`toggle-${num}`);
                        const content = document.getElementById(`commentary-${num}`);
                        if (toggle && content) {
                            content.style.display = 'block';
                            toggle.textContent = '▲';
                            openVyakhyanas.add(vyakhyanaKey);
                            if (!firstOpenedVyakhyana) firstOpenedVyakhyana = content;
                        }
                    }
                }
            });
            
            // Scroll to first opened vyakhyana
            if (firstOpenedVyakhyana) {
                firstOpenedVyakhyana.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 100);
    }
}

// Navigate to next sutra
function navigateToNext() {
    if (!currentSutra || filteredSutras.length === 0) return;
    
    const currentIndex = filteredSutras.findIndex(s => 
        s.adhyaya === currentSutra.adhyaya && 
        s.pada === currentSutra.pada && 
        s.sutra_number === currentSutra.sutra_number
    );
    
    if (currentIndex < filteredSutras.length - 1) {
        // Keep track of which vyakhyanas are currently open (by key name)
        const openVyakhyanasArray = Array.from(openVyakhyanas);
        const nextSutra = filteredSutras[currentIndex + 1];
        showSutraDetail(nextSutra);
        
        // After navigation, open the same vyakhyanas (only if they exist in new sutra) and scroll to first one
        setTimeout(() => {
            // Get available vyakhyanas for the new sutra to check which ones exist
            const sutraKey = `${nextSutra.adhyaya}.${nextSutra.pada}.${nextSutra.sutra_number}`;
            const details = sutraDetails[sutraKey] || {};
            
            let firstOpenedVyakhyana = null;
            openVyakhyanasArray.forEach(vyakhyanaKey => {
                // Only try to open if this vyakhyana key exists in the new sutra
                if (details[vyakhyanaKey]) {
                    // Find the index of this vyakhyana in the new sutra
                    const vyakhyanaKeys = Object.keys(details).filter(key => {
                        const excludeKeys = ['meaning', 'meaningKn', 'meaningTe', 'meaningDetails', 'meaningDetailsKn', 'meaningDetailsTe', 
                                             'commentary', 'commentaryKn', 'commentaryTe'];
                        if (excludeKeys.includes(key)) return false;
                        const value = details[key];
                        return value && typeof value === 'object' && 
                               (value.hasOwnProperty('moola') || value.hasOwnProperty('Ka_Translation') || 
                                value.hasOwnProperty('Te_Translation') || value.hasOwnProperty('En_Translation'));
                    });
                    const num = vyakhyanaKeys.indexOf(vyakhyanaKey) + 1;
                    
                    if (num > 0) {
                        const toggle = document.getElementById(`toggle-${num}`);
                        const content = document.getElementById(`commentary-${num}`);
                        if (toggle && content) {
                            content.style.display = 'block';
                            toggle.textContent = '▲';
                            openVyakhyanas.add(vyakhyanaKey);
                            if (!firstOpenedVyakhyana) firstOpenedVyakhyana = content;
                        }
                    }
                }
            });
            
            // Scroll to first opened vyakhyana
            if (firstOpenedVyakhyana) {
                firstOpenedVyakhyana.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 100);
    }
}

// Update navigation button states and text
function updateNavigationButtons() {
    // Get buttons from header
    const previousBtn = document.getElementById('previousSutraHeaderBtn');
    const nextBtn = document.getElementById('nextSutraHeaderBtn');
    
    if (!currentSutra || filteredSutras.length === 0) {
        if (previousBtn) previousBtn.disabled = true;
        if (nextBtn) nextBtn.disabled = true;
        return;
    }
    
    const currentIndex = filteredSutras.findIndex(s => 
        s.adhyaya === currentSutra.adhyaya && 
        s.pada === currentSutra.pada && 
        s.sutra_number === currentSutra.sutra_number
    );
    
    if (previousBtn) {
        previousBtn.disabled = currentIndex <= 0;
    }
    if (nextBtn) {
        nextBtn.disabled = currentIndex >= filteredSutras.length - 1;
    }
}

// Update navigation button text based on language
function updateNavigationButtonText() {
    const previousTextSpan = document.getElementById('previousBtnText');
    const nextTextSpan = document.getElementById('nextBtnText');
    
    const previousText = currentLanguage === 'en' ? 'Previous' : transliterateText('पूर्वम्', currentLanguage);
    const nextText = currentLanguage === 'en' ? 'Next' : transliterateText('परम्', currentLanguage);
    
    if (previousTextSpan) previousTextSpan.textContent = previousText;
    if (nextTextSpan) nextTextSpan.textContent = nextText;
}

// Update vyakhyana dropdown based on available vyakhyanas for current sutra
function updateVyakhyanaDropdownForSutra(availableVyakhyanas) {
    const dropdownContent = document.getElementById('vyakhyanaDropdownContent');
    if (!dropdownContent) return;
    
    const availableKeys = availableVyakhyanas.map(v => v.key);
    
    // If "All" mode is active, select all available vyakhyanas
    if (selectAllVyakhyanas) {
        selectedVyakhyanaKeys = new Set(availableKeys);
    } else {
        // Keep only selections that are still available in the new sutra
        const validKeys = Array.from(selectedVyakhyanaKeys).filter(key => availableKeys.includes(key));
        selectedVyakhyanaKeys = new Set(validKeys);
        
        // If nothing is selected, select all
        if (selectedVyakhyanaKeys.size === 0) {
            selectedVyakhyanaKeys = new Set(availableKeys);
            selectAllVyakhyanas = true;
        }
    }
    
    // Rebuild the dropdown with only available vyakhyanas
    const allText = getTranslatedText('सर्वम्', currentLanguage);
    
    // Check if all are selected
    const allSelected = availableKeys.every(key => selectedVyakhyanaKeys.has(key));
    
    // Add "All" checkbox first with grey background class
    let checkboxesHTML = `<label for="vyakhyana-checkbox-all" class="all-checkbox"><input type="checkbox" id="vyakhyana-checkbox-all" value="all" ${allSelected ? 'checked' : ''}> ${allText}</label>`;
    
    // Add individual vyakhyana checkboxes with actual names
    checkboxesHTML += availableVyakhyanas.map(item => {
        const checkboxId = `vyakhyana-checkbox-${item.num}`;
        const labelText = currentLanguage !== 'sa' ? 
                         transliterateText(item.key, currentLanguage) : 
                         item.key;
        const isChecked = selectedVyakhyanaKeys.has(item.key);
        return `<label for="${checkboxId}"><input type="checkbox" id="${checkboxId}" value="${item.num}" data-key="${item.key}" ${isChecked ? 'checked' : ''}> ${labelText}</label>`;
    }).join('');
    
    dropdownContent.innerHTML = checkboxesHTML;
    
    // Re-attach event listeners
    const allCheckbox = document.getElementById('vyakhyana-checkbox-all');
    const checkboxes = dropdownContent.querySelectorAll('input[type="checkbox"]:not(#vyakhyana-checkbox-all)');
    
    // Handle "All" checkbox
    if (allCheckbox) {
        allCheckbox.addEventListener('change', () => {
            const isChecked = allCheckbox.checked;
            checkboxes.forEach(cb => cb.checked = isChecked);
            updateSelectedVyakhyanas();
        });
    }
    
    // Handle individual checkboxes
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            // Update "All" checkbox state based on individual checkboxes
            const allChecked = Array.from(checkboxes).every(cb => cb.checked);
            if (allCheckbox) allCheckbox.checked = allChecked;
            updateSelectedVyakhyanas();
        });
    });
    
    // Update the button text to reflect the current selection (skip rerender during setup)
    updateSelectedVyakhyanas(true);
}

// Get language-specific text (with transliteration for Sanskrit terms)
function getLocalizedText(key, targetLang = currentLanguage) {
    const baseLang = languages['sa'];
    const langOverrides = languages[targetLang];
    
    // If key exists in language-specific overrides, use it
    if (langOverrides && langOverrides[key]) {
        return langOverrides[key];
    }
    
    // Otherwise, transliterate from Sanskrit
    if (baseLang[key]) {
        return targetLang !== 'sa' ? transliterateText(baseLang[key], targetLang) : baseLang[key];
    }
    
    return '';
}

// Update all UI text based on selected language
function updateUILanguage() {
    const lang = languages[currentLanguage];
    const baseLang = languages['sa'];
    
    // Update page title and subtitle
    const subtitle = document.querySelector('.subtitle');
    if (subtitle) {
        subtitle.textContent = lang.title || baseLang.title;
    }
    
    // Update navigation labels (transliterate Sanskrit terms)
    const adhyayaLabel = document.querySelector('.adhyaya-selector label');
    if (adhyayaLabel) adhyayaLabel.textContent = getLocalizedText('adhyaya');
    
    const padaLabel = document.querySelector('.pada-selector label');
    if (padaLabel) padaLabel.textContent = getLocalizedText('pada');
    
    const adhikaranaLabel = document.querySelector('.adhikarana-selector label');
    if (adhikaranaLabel) adhikaranaLabel.textContent = getLocalizedText('adhikarana');
    
    // Update search placeholder
    if (searchInput) {
        searchInput.placeholder = lang.searchPlaceholder || baseLang.searchPlaceholder;
    }
    
    // Update adhyaya options (transliterate + add Kannada explanation if available)
    if (adhyayaSelect) {
        const selectedValue = adhyayaSelect.value;
        adhyayaSelect.innerHTML = '';
        Object.keys(baseLang.adhyayaOptions).forEach(key => {
            const option = document.createElement('option');
            option.value = key;
            const baseOption = baseLang.adhyayaOptions[key];
            if (currentLanguage !== 'sa') {
                // Extract Sanskrit part and English part
                const match = baseOption.match(/^(.+?)\s*\((.+)\)$/);
                if (match) {
                    const sanskritPart = transliterateText(match[1], currentLanguage);
                    const explanation = lang.adhyayaExplanations?.[key] || match[2];
                    option.textContent = `${sanskritPart} (${explanation})`;
                } else {
                    option.textContent = transliterateText(baseOption, currentLanguage);
                }
            } else {
                option.textContent = baseOption;
            }
            adhyayaSelect.appendChild(option);
        });
        adhyayaSelect.value = selectedValue;
    }
    
    // Update pada options (transliterate)
    if (padaSelect) {
        const selectedValue = padaSelect.value;
        padaSelect.innerHTML = '';
        Object.keys(baseLang.padaOptions).forEach(key => {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = currentLanguage !== 'sa' ? transliterateText(baseLang.padaOptions[key], currentLanguage) : baseLang.padaOptions[key];
            padaSelect.appendChild(option);
        });
        padaSelect.value = selectedValue;
    }
    
    // Update info panel
    const infoPanelH2 = document.querySelector('.info-panel h2');
    if (infoPanelH2) infoPanelH2.textContent = getLocalizedText('vedantaPhilosophy');
    
    const infoText = document.querySelector('.info-text');
    if (infoText) infoText.innerHTML = lang.infoText || baseLang.infoText;
    
    const philosophyBoxH3 = document.querySelector('.philosophy-box h3');
    if (philosophyBoxH3) philosophyBoxH3.textContent = getLocalizedText('dvaitaPrinciples');
    
    // Update philosophy box list items (transliterate Sanskrit terms)
    const philosophyItems = document.querySelectorAll('.philosophy-box li');
    const sanskritTerms = [
        'पञ्चभेद:',
        'स्वतन्त्र-परतन्त्र:',
        'विष्णु-सर्वोत्तमता:',
        'तत्त्ववाद:'
    ];
    const englishDescriptions = [
        'Five-fold eternal difference',
        'Independent Brahman, dependent jīva',
        'Supremacy of Vishnu',
        'Realism - differences are real'
    ];
    
    philosophyItems.forEach((item, index) => {
        if (index < sanskritTerms.length) {
            const transliteratedTerm = currentLanguage !== 'sa' ? 
                transliterateText(sanskritTerms[index], currentLanguage) : 
                sanskritTerms[index];
            item.innerHTML = `<strong>${transliteratedTerm}</strong> ${englishDescriptions[index]}`;
        }
    });
    
    // Update footer
    const footer = document.querySelector('footer p');
    if (footer) {
        footer.textContent = lang.footer || baseLang.footer;
    }
}

// Load sutras from CSV and JSON
async function loadSutras() {
    try {
        showLoading();
        
        // Load CSV data
        const csvResponse = await fetch('sutra/bs.csv');
        const csvText = await csvResponse.text();
        allSutras = parseCSV(csvText);
        
        // Load JSON details
        try {
            const jsonResponse = await fetch('sutra/sutra-details.json');
            sutraDetails = await jsonResponse.json();
        } catch (jsonError) {
            console.warn('Sutra details JSON not found, using placeholders:', jsonError);
            sutraDetails = {};
        }
        
        populateAdhikaranaDropdown();
        filterSutras();
    } catch (error) {
        console.error('Error loading sutras:', error);
        showError('Error loading sutras. Please check if the CSV file exists.');
    }
}

// Parse CSV data
function parseCSV(csvText) {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',');
    const sutras = [];

    for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        if (values.length === headers.length) {
            const sutra = {};
            headers.forEach((header, index) => {
                sutra[header.trim()] = values[index].trim();
            });
            sutras.push(sutra);
        }
    }

    return sutras;
}

// Parse a single CSV line (handles quotes and commas)
function parseCSVLine(line) {
    const values = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            values.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    
    values.push(current);
    return values;
}

// Handle adhyaya change
function onAdhyayaChange() {
    onPadaChange();
}

// Handle pada change
function onPadaChange() {
    populateAdhikaranaDropdown();
    filterSutras();
}

// Populate adhikarana dropdown based on selected adhyaya and pada
function populateAdhikaranaDropdown() {
    const selectedAdhyaya = adhyayaSelect.value;
    const selectedPada = padaSelect.value;
    const lang = languages[currentLanguage];
    const baseLang = languages['sa'];
    
    // Get unique adhikaranas for the selected adhyaya and pada
    const adhikaranas = [...new Set(
        allSutras
            .filter(sutra => sutra.adhyaya === selectedAdhyaya && sutra.pada === selectedPada)
            .map(sutra => sutra.adhikarana)
    )];
    
    // Clear and populate adhikarana dropdown
    adhikaranaSelect.innerHTML = `<option value="all">${lang.allTopics || baseLang.allTopics}</option><option disabled>──────────</option>`;
    adhikaranas.forEach(adhikarana => {
        const option = document.createElement('option');
        option.value = adhikarana;
        option.textContent = currentLanguage !== 'sa' ? transliterateText(adhikarana, currentLanguage) : adhikarana;
        adhikaranaSelect.appendChild(option);
    });
}

// Filter sutras based on selected adhyaya, pada, and adhikarana
function filterSutras() {
    const selectedAdhyaya = adhyayaSelect.value;
    const selectedPada = padaSelect.value;
    const selectedAdhikarana = adhikaranaSelect.value;

    filteredSutras = allSutras.filter(sutra => {
        const matchesAdhyayaPada = sutra.adhyaya === selectedAdhyaya && sutra.pada === selectedPada;
        const matchesAdhikarana = selectedAdhikarana === 'all' || sutra.adhikarana === selectedAdhikarana;
        return matchesAdhyayaPada && matchesAdhikarana;
    });

    searchInput.value = ''; // Clear search when filtering
    updateSectionHeading(selectedAdhyaya, selectedPada);
    displaySutras(filteredSutras);
}

// Update section heading with Sanskrit names
function updateSectionHeading(adhyaya, pada) {
    const baseLang = languages['sa'];
    const adhyayaName = currentLanguage !== 'sa' ? 
                        transliterateText(baseLang.adhyayaNames[adhyaya], currentLanguage) : 
                        baseLang.adhyayaNames[adhyaya];
    const padaName = currentLanguage !== 'sa' ? 
                     transliterateText(baseLang.padaNames[pada], currentLanguage) : 
                     baseLang.padaNames[pada];
    sectionTitle.textContent = `${adhyayaName}, ${padaName}`;
}

// Toggle sutra list visibility
function toggleSutraList() {
    if (currentView !== 'list') return; // Only toggle in list view
    
    if (sutraList.style.display === 'none') {
        sutraList.style.display = 'flex';
        collapseIcon.textContent = '▼';
    } else {
        sutraList.style.display = 'none';
        collapseIcon.textContent = '▶';
    }
}

// Toggle info panel collapse/expand
function toggleInfoPanel() {
    const infoPanel = document.getElementById('infoPanel');
    const toggleBtn = document.getElementById('panelToggleBtn');
    
    if (infoPanel && toggleBtn) {
        infoPanel.classList.toggle('collapsed');
        
        if (infoPanel.classList.contains('collapsed')) {
            toggleBtn.textContent = '»';
            toggleBtn.title = 'Show panel';
        } else {
            toggleBtn.textContent = '«';
            toggleBtn.title = 'Hide panel';
        }
    }
}

// Search sutras
function searchSutras() {
    const searchTerm = searchInput.value.trim();

    if (searchTerm === '') {
        filterSutras();
        return;
    }

    // Normalize search term (remove zero-width characters and normalize Unicode)
    const normalizedSearchTerm = searchTerm
        .replace(/[\u200B-\u200D\uFEFF]/g, '') // Remove zero-width characters
        .normalize('NFC'); // Normalize Unicode to composed form

    const searchResults = allSutras.filter(sutra => {
        // Remove ॐ symbols and normalize text for cleaner search
        const cleanSutraText = sutra.sutra_text
            .replace(/ॐ/g, '')
            .replace(/[\u200B-\u200D\uFEFF]/g, '')
            .normalize('NFC')
            .trim();
        const cleanAdhikarana = sutra.adhikarana
            .replace(/ॐ/g, '')
            .replace(/[\u200B-\u200D\uFEFF]/g, '')
            .normalize('NFC')
            .trim();
        
        // Also search in transliterated text if in non-Sanskrit language
        let transliteratedSutraText = cleanSutraText;
        let transliteratedAdhikarana = cleanAdhikarana;
        if (currentLanguage !== 'sa') {
            transliteratedSutraText = transliterateText(cleanSutraText, currentLanguage);
            transliteratedAdhikarana = transliterateText(cleanAdhikarana, currentLanguage);
        }
        
        return (
            cleanSutraText.includes(normalizedSearchTerm) ||
            cleanAdhikarana.includes(normalizedSearchTerm) ||
            transliteratedSutraText.includes(normalizedSearchTerm) ||
            transliteratedAdhikarana.includes(normalizedSearchTerm) ||
            sutra.sutra_number.toString().includes(normalizedSearchTerm)
        );
    });

    displaySutras(searchResults);
}

// Display sutras in the UI
function displaySutras(sutras) {
    if (sutras.length === 0) {
        showNoResults();
        return;
    }

    const html = sutras.map((sutra, index) => createSutraLink(sutra, index)).join('');
    sutraList.innerHTML = html;
    
    // Add click listeners to all sutra links
    document.querySelectorAll('.sutra-link').forEach((link, index) => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            showSutraDetail(sutras[index]);
        });
    });
}

// Create a clickable sutra link
function createSutraLink(sutra, index) {
    const sutraText = currentLanguage !== 'sa' ? transliterateText(sutra.sutra_text, currentLanguage) : sutra.sutra_text;
    const adhikaranaText = currentLanguage !== 'sa' ? transliterateText(sutra.adhikarana, currentLanguage) : sutra.adhikarana;
    
    return `
        <a href="#" class="sutra-link" data-index="${index}">
            <div class="sutra-link-number">
                ${sutra.adhyaya}.${sutra.pada}.${sutra.sutra_number}
            </div>
            <div class="sutra-link-text">
                ${sutraText}
            </div>
            <div class="sutra-link-adhikarana">
                ${adhikaranaText}
            </div>
            <div class="arrow">→</div>
        </a>
    `;
}

// Update info panel for sutra detail view
function updateInfoPanelForSutra(sutra) {
    const infoPanelContent = document.getElementById('infoPanelContent');
    if (!infoPanelContent) return;
    
    const lang = languages[currentLanguage];
    const baseLang = languages['sa'];
    
    const sutraKey = `${sutra.adhyaya}.${sutra.pada}.${sutra.sutra_number}`;
    const sutraText = currentLanguage !== 'sa' ? 
                      transliterateText(sutra.sutra_text, currentLanguage) : 
                      sutra.sutra_text;
    
    const sutraLabel = getTranslatedText('सूत्रम्', currentLanguage);
    const adhikaranaLabel = getTranslatedText('अधिकरणम्', currentLanguage);
    
    const adhikaranaText = sutra.adhikarana ? 
                          (currentLanguage !== 'sa' ? 
                           transliterateText(sutra.adhikarana, currentLanguage) : 
                           sutra.adhikarana) :
                          '';
    
    const backToMainText = lang.backToHome || baseLang.backToHome;
    
    infoPanelContent.innerHTML = `
        <div class="sutra-info-panel">
            <div class="sutra-info-number">${sutraKey}</div>
            <div class="sutra-header-with-audio">
                <h3>${sutraLabel}</h3>
                <button class="info-audio-round-btn" id="infoPanelAudio" title="Play sutra">🔊</button>
            </div>
            <div class="sutra-info-text">${sutraText}</div>
            ${adhikaranaText ? `
                <h4 class="adhikarana-label">${adhikaranaLabel}</h4>
                <div class="sutra-info-adhikarana">${adhikaranaText}</div>
            ` : ''}
            <div class="sutra-info-controls">
                <button class="info-back-btn" id="infoPanelBack" title="Back to main page">← ${backToMainText}</button>
            </div>
        </div>
    `;
    
    // Add event listeners
    setTimeout(() => {
        const audioBtn = document.getElementById('infoPanelAudio');
        if (audioBtn) {
            audioBtn.addEventListener('click', () => {
                // Always use Sanskrit text with Hindi voice for audio
                speakText(sutra.sutra_text, 'hi-IN', 'infoPanelAudio');
            });
        }
        
        const backBtn = document.getElementById('infoPanelBack');
        if (backBtn) {
            backBtn.addEventListener('click', showListView);
        }
    }, 0);
}

// Restore info panel to default view
function restoreInfoPanel() {
    const infoPanelContent = document.getElementById('infoPanelContent');
    if (!infoPanelContent) return;
    
    const lang = languages[currentLanguage];
    const baseLang = languages['sa'];
    
    const vedantaText = getTranslatedText('वेदान्तदर्शनम्', currentLanguage);
    const dvaitaTitle = getTranslatedText('द्वैत वेदान्त सिद्धान्ताः', currentLanguage);
    
    infoPanelContent.innerHTML = `
        <h2>${vedantaText}</h2>
        <p class="info-text">
            The Brahma Sutras (ब्रह्मसूत्राणि), also known as Vedanta Sutras, are foundational texts 
            of Vedanta philosophy composed by Sage Badarayana (Vyasa). This presentation follows 
            <strong>Madhvacharya's Dvaita (Dualistic) Vedanta</strong> interpretation.
        </p>
        <div class="philosophy-box">
            <h3>${dvaitaTitle}</h3>
            <ul>
                <li><strong>पञ्चभेद:</strong> Five-fold eternal difference</li>
                <li><strong>स्वतन्त्र-परतन्त्र:</strong> Independent Brahman, dependent jīva</li>
                <li><strong>विष्णु-सर्वोत्तमता:</strong> Supremacy of Vishnu</li>
                <li><strong>तत्त्ववाद:</strong> Realism - differences are real</li>
            </ul>
        </div>
    `;
}

// Show detailed view of a sutra
function showSutraDetail(sutra) {
    // Check if we're switching to a different sutra
    const isDifferentSutra = !currentSutra || 
                             currentSutra.adhyaya !== sutra.adhyaya || 
                             currentSutra.pada !== sutra.pada || 
                             currentSutra.sutra_number !== sutra.sutra_number;
    
    // Clear open vyakhyanas only when switching to a different sutra
    if (isDifferentSutra) {
        openVyakhyanas.clear();
    }
    
    currentView = 'detail';
    currentSutra = sutra; // Store current sutra
    sutraList.style.display = 'none';
    sutraDetail.style.display = 'block';
    
    // Update info panel with sutra info
    updateInfoPanelForSutra(sutra);
    
    // Hide section heading in detail view
    if (sectionHeading) {
        sectionHeading.style.display = 'none';
    }
    
    // Hide heading controls and search in detail view
    const headingControls = document.querySelector('.heading-controls');
    if (headingControls) {
        headingControls.style.display = 'none';
    }
    if (searchInput) {
        searchInput.style.display = 'none';
    }
    
    // Show vyakhyana selector in detail view
    const vyakhyanaSelector = document.getElementById('vyakhyanaSelector');
    if (vyakhyanaSelector) {
        vyakhyanaSelector.style.display = 'inline-flex';
    }
    
    // Disable dropdowns in detail view
    if (adhyayaSelect) adhyayaSelect.disabled = true;
    if (padaSelect) padaSelect.disabled = true;
    if (adhikaranaSelect) adhikaranaSelect.disabled = true;
    
    // Hide dropdown selectors and show navigation buttons in header in detail view
    if (adhyayaSelector) adhyayaSelector.style.display = 'none';
    if (padaSelector) padaSelector.style.display = 'none';
    if (adhikaranaSelector) adhikaranaSelector.style.display = 'none';
    if (sutraNavigationHeader) sutraNavigationHeader.style.display = 'flex';
    
    // Stop any playing speech when switching views
    stopSpeech();
    
    // Get details from JSON using sutra key
    const sutraKey = `${sutra.adhyaya}.${sutra.pada}.${sutra.sutra_number}`;
    const details = sutraDetails[sutraKey] || {};
    
    // Dynamically detect available vyakhyanas by checking structure
    // A vyakhyana is any key whose value is an object with moola or translation keys
    const excludeKeys = ['meaning', 'meaningKn', 'meaningTe', 'meaningDetails', 'meaningDetailsKn', 'meaningDetailsTe', 
                         'commentary', 'commentaryKn', 'commentaryTe'];
    const vyakhyanaKeys = Object.keys(details).filter(key => {
        if (excludeKeys.includes(key)) return false;
        const value = details[key];
        return value && typeof value === 'object' && 
               (value.hasOwnProperty('moola') || value.hasOwnProperty('Ka_Translation') || 
                value.hasOwnProperty('Te_Translation') || value.hasOwnProperty('En_Translation'));
    });
    const availableVyakhyanas = vyakhyanaKeys.map((key, index) => ({
        num: index + 1,
        key: key
    }));
    
    const dropdownContent = document.getElementById('vyakhyanaDropdownContent');
    if (availableVyakhyanas.length > 0 && dropdownContent) {
        updateVyakhyanaDropdownForSutra(availableVyakhyanas);
    }
    
    const lang = languages[currentLanguage] || languages['sa'];
    const baseLang = languages['sa'];
    
    // Get language-specific content
    // For Kannada and Telugu: use manual translation if available, otherwise show English
    let meaning, meaningDetails, commentary;
    if (currentLanguage === 'kn') {
        meaning = details.meaningKn || details.meaning;
        meaningDetails = details.meaningDetailsKn || details.meaningDetails;
        commentary = details.commentaryKn || details.commentary;
    } else if (currentLanguage === 'te') {
        meaning = details.meaningTe || details.meaning;
        meaningDetails = details.meaningDetailsTe || details.meaningDetails;
        commentary = details.commentaryTe || details.commentary;
    } else {
        meaning = details.meaning;
        meaningDetails = details.meaningDetails;
        commentary = details.commentary;
    }
    
    // Transliterate text based on selected language
    const sutraText = currentLanguage !== 'sa' ? transliterateText(sutra.sutra_text, currentLanguage) : sutra.sutra_text;
    const adhikaranaText = currentLanguage !== 'sa' ? transliterateText(sutra.adhikarana, currentLanguage) : sutra.adhikarana;
    
    // Build meaning section
    const meaningLabel = currentLanguage !== 'sa' ? 
                         transliterateText('अर्थः', currentLanguage) + ' (Meaning)' : 
                         baseLang.meaning;
    let meaningHTML = `<h3>${meaningLabel}</h3>`;
    if (meaning) {
        meaningHTML += `<div class="audio-controls"><button class="audio-btn" id="meaningAudio" title="Play meaning">🔊</button></div>`;
        meaningHTML += `<p class="main-meaning">${meaning}</p>`;
        if (meaningDetails && meaningDetails.length > 0) {
            meaningHTML += '<ul class="meaning-details">';
            meaningDetails.forEach(detail => {
                meaningHTML += `<li>${detail}</li>`;
            });
            meaningHTML += '</ul>';
        }
    } else {
        meaningHTML += '<p class="placeholder">The meaning of the sutra comes here</p>';
    }
    
    // Build commentary section
    const commentaryLabel = currentLanguage !== 'sa' ? 
                           transliterateText('द्वैत वेदान्त व्याख्या', currentLanguage) + ' (Dvaita Vedanta Commentary)' : 
                           baseLang.commentary;
    const referencesLabel = lang.references || baseLang.references;
    let commentaryHTML = `<h3>${commentaryLabel}</h3>`;
    if (commentary) {
        commentaryHTML += `<div class="audio-controls"><button class="audio-btn" id="commentaryAudio" title="Play commentary">🔊</button></div>`;
        commentaryHTML += `<p>${commentary}</p>`;
        if (details.references && details.references.length > 0) {
            commentaryHTML += `<div class="references"><strong>${referencesLabel}</strong> `;
            commentaryHTML += details.references.join(', ');
            commentaryHTML += '</div>';
        }
    } else {
        commentaryHTML += '<p class="placeholder">The Madhva commentary on this sutra comes here</p>';
    }
    
    // Build additional commentaries section (collapsible) - show all available vyakhyanas
    // Detect vyakhyanas by structure instead of key name pattern
    const excludeKeys2 = ['meaning', 'meaningKn', 'meaningTe', 'meaningDetails', 'meaningDetailsKn', 'meaningDetailsTe', 
                          'commentary', 'commentaryKn', 'commentaryTe'];
    const vyakhyanaKeys2 = Object.keys(details).filter(key => {
        if (excludeKeys2.includes(key)) return false;
        const value = details[key];
        return value && typeof value === 'object' && 
               (value.hasOwnProperty('moola') || value.hasOwnProperty('Ka_Translation') || 
                value.hasOwnProperty('Te_Translation') || value.hasOwnProperty('En_Translation'));
    });
    const availableVyakhyanas2 = vyakhyanaKeys2.map((key, index) => ({
        num: index + 1,
        key: key
    }));
    
    // Render ALL available vyakhyanas, then control visibility with CSS
    let additionalCommentariesHTML = `
        <div class="commentary-items">
            ${availableVyakhyanas2
                .map(item => {
                const num = item.num;
                const vyakhyaKey = item.key;
                // Display the actual key name from JSON (transliterated if needed)
                const titleText = currentLanguage !== 'sa' ? 
                                 transliterateText(vyakhyaKey, currentLanguage) : 
                                 vyakhyaKey;
                
                // Get language-specific commentary from vyakhya structure
                let commentaryText;
                const vyakhyaData = details[vyakhyaKey];
                
                if (!vyakhyaData) {
                    // If vyakhyana data doesn't exist, show placeholder
                    const numPart = vyakhyaKey.split('-')[1];
                    commentaryText = currentLanguage !== 'sa' ? 
                                    transliterateText(`अत्र व्याख्यान ${numPart} भविष्यति`, currentLanguage) : 
                                    `अत्र व्याख्यान ${numPart} भविष्यति`;
                } else {
                    // Map language codes to translation keys
                    const langMap = {
                        'kn': 'Ka_Translation',
                        'te': 'Te_Translation',
                        'ta': 'Ta_Translation',
                        'ml': 'Ml_Translation',
                        'gu': 'Gu_Translation',
                        'or': 'Or_Translation',
                        'bn': 'Bn_Translation',
                        'en': 'En_Translation',
                        'sa': 'moola'
                    };
                    
                    const translationKey = langMap[currentLanguage];
                    
                    // Check if translation exists for current language
                    if (translationKey && vyakhyaData[translationKey]) {
                        commentaryText = vyakhyaData[translationKey];
                    } else if (vyakhyaData['moola']) {
                        // Fallback to moola (Sanskrit) and transliterate
                        commentaryText = currentLanguage !== 'sa' ? 
                                        transliterateText(vyakhyaData['moola'], currentLanguage) : 
                                        vyakhyaData['moola'];
                    } else {
                        // Show placeholder if no moola available
                        const numPart = vyakhyaKey.split('-')[1];
                        commentaryText = currentLanguage !== 'sa' ? 
                                        transliterateText(`अत्र व्याख्यान ${numPart} भविष्यति`, currentLanguage) : 
                                        `अत्र व्याख्यान ${numPart} भविष्यति`;
                    }
                }
                
                return `
                    <div class="commentary-item" data-key="${vyakhyaKey}">
                        <div class="commentary-header" onclick="toggleCommentary(${num}, '${vyakhyaKey}')">
                            <span class="commentary-title">${titleText}</span>
                            <span class="commentary-toggle" id="toggle-${num}">▼</span>
                        </div>
                        <div class="commentary-content" id="commentary-${num}" style="display: none;">
                            <p>${commentaryText}</p>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
    
    const sutraLabel = currentLanguage !== 'sa' ? 
                       transliterateText('सूत्रम्', currentLanguage) : 
                       baseLang.sutraLabel;
    
    detailContent.innerHTML = `
        <div class="detail-additional-commentaries">
            ${additionalCommentariesHTML}
        </div>
    `;
    
    // Update navigation button states after rendering
    updateNavigationButtons();
    
    // Apply vyakhyana visibility based on selection
    setTimeout(() => {
        updateVyakhyanaVisibility();
    }, 0);
    
    // Restore previously open vyakhyanas
    setTimeout(() => {
        openVyakhyanas.forEach(vyakhyanaKey => {
            // Find the position of this vyakhyana in the current sutra
            const excludeKeys = ['meaning', 'meaningKn', 'meaningTe', 'meaningDetails', 'meaningDetailsKn', 'meaningDetailsTe', 
                                 'commentary', 'commentaryKn', 'commentaryTe'];
            const vyakhyanaKeys = Object.keys(details).filter(key => {
                if (excludeKeys.includes(key)) return false;
                const value = details[key];
                return value && typeof value === 'object' && 
                       (value.hasOwnProperty('moola') || value.hasOwnProperty('Ka_Translation') || 
                        value.hasOwnProperty('Te_Translation') || value.hasOwnProperty('En_Translation'));
            });
            const num = vyakhyanaKeys.indexOf(vyakhyanaKey) + 1;
            
            if (num > 0) {
                const content = document.getElementById(`commentary-${num}`);
                const toggle = document.getElementById(`toggle-${num}`);
                if (content && toggle) {
                    content.style.display = 'block';
                    toggle.textContent = '▲';
                }
            }
        });
    }, 0);
    
    // Add event listeners for audio buttons
    setTimeout(() => {
        const sutraAudioBtn = document.getElementById('sutraAudio');
        if (sutraAudioBtn) {
            sutraAudioBtn.addEventListener('click', () => {
                const audioFile = `sutra/audio/${sutra.adhyaya}.${sutra.pada}.${sutra.sutra_number}.mp3`;
                // Determine appropriate language for speech synthesis
                let speechLang = 'hi-IN'; // Default for Sanskrit
                if (currentLanguage === 'en') {
                    speechLang = 'en-US';
                } else if (currentLanguage === 'kn') {
                    speechLang = 'kn-IN';
                } else if (currentLanguage === 'te') {
                    speechLang = 'te-IN';
                } else if (currentLanguage === 'ta') {
                    speechLang = 'ta-IN';
                } else if (currentLanguage === 'ml') {
                    speechLang = 'ml-IN';
                } else if (currentLanguage === 'gu') {
                    speechLang = 'gu-IN';
                } else if (currentLanguage === 'or') {
                    speechLang = 'or-IN';
                } else if (currentLanguage === 'bn') {
                    speechLang = 'bn-IN';
                }
                playAudio(sutra.sutra_text, speechLang, 'sutraAudio', audioFile);
            });
        }
        
        const meaningAudioBtn = document.getElementById('meaningAudio');
        if (meaningAudioBtn && details.meaning) {
            meaningAudioBtn.addEventListener('click', () => {
                playAudio(details.meaning, 'en-US', 'meaningAudio');
            });
        }
        
        const commentaryAudioBtn = document.getElementById('commentaryAudio');
        if (commentaryAudioBtn && details.commentary) {
            commentaryAudioBtn.addEventListener('click', () => {
                playAudio(details.commentary, 'en-US', 'commentaryAudio');
            });
        }
    }, 0);
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Show list view
function showListView() {
    currentView = 'list';
    currentSutra = null; // Clear current sutra
    openVyakhyanas.clear(); // Clear open vyakhyanas state when leaving detail view
    sutraDetail.style.display = 'none';
    sutraList.style.display = 'flex';
    
    // Restore info panel to default
    restoreInfoPanel();
    
    // Show section heading in list view
    if (sectionHeading) {
        sectionHeading.style.display = 'flex';
    }
    
    // Show heading controls and search in list view
    const headingControls = document.querySelector('.heading-controls');
    if (headingControls) {
        headingControls.style.display = 'flex';
    }
    if (searchInput) {
        searchInput.style.display = 'block';
    }
    
    // Hide vyakhyana selector in list view
    const vyakhyanaSelector = document.getElementById('vyakhyanaSelector');
    if (vyakhyanaSelector) {
        vyakhyanaSelector.style.display = 'none';
    }
    
    // Enable dropdowns in list view
    if (adhyayaSelect) adhyayaSelect.disabled = false;
    if (padaSelect) padaSelect.disabled = false;
    if (adhikaranaSelect) adhikaranaSelect.disabled = false;
    
    // Show dropdown selectors and hide navigation buttons in list view
    if (adhyayaSelector) adhyayaSelector.style.display = 'flex';
    if (padaSelector) padaSelector.style.display = 'flex';
    if (adhikaranaSelector) adhikaranaSelector.style.display = 'flex';
    if (sutraNavigationHeader) sutraNavigationHeader.style.display = 'none';
    
    // Refresh the list with current language
    displaySutras(filteredSutras);
    
    stopSpeech(); // Stop any playing audio
}

// Show loading message
function showLoading() {
    const lang = languages[currentLanguage];
    const baseLang = languages['sa'];
    sutraList.innerHTML = `<div class="loading">${lang.loading || baseLang.loading}</div>`;
}

// Show error message
function showError(message) {
    sutraList.innerHTML = `<div class="no-results">${message}</div>`;
}

// Show no results message
function showNoResults() {
    const lang = languages[currentLanguage];
    const baseLang = languages['sa'];
    sutraList.innerHTML = `<div class="no-results">${lang.noResults || baseLang.noResults}</div>`;
}

// Debounce function for search
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Text-to-Speech and Audio functions
async function playAudio(text, lang = 'hi-IN', buttonId = null, audioFile = null) {
    // Stop any ongoing playback
    if (isSpeaking || currentAudio) {
        stopSpeech();
        if (buttonId) {
            updateSpeechButton(buttonId, false);
        }
        return;
    }
    
    // Try to play MP3 file first if provided
    if (audioFile) {
        try {
            currentAudio = new Audio(audioFile);
            
            currentAudio.onloadeddata = () => {
                isSpeaking = true;
                if (buttonId) {
                    updateSpeechButton(buttonId, true);
                }
                currentAudio.play();
            };
            
            currentAudio.onended = () => {
                isSpeaking = false;
                currentAudio = null;
                if (buttonId) {
                    updateSpeechButton(buttonId, false);
                }
            };
            
            currentAudio.onerror = () => {
                // MP3 failed, fall back to TTS
                console.log(`MP3 file not found: ${audioFile}, using TTS`);
                currentAudio = null;
                speakText(text, lang, buttonId);
            };
            
            return; // Exit if MP3 loading started
        } catch (error) {
            console.log('Error loading MP3, using TTS:', error);
            currentAudio = null;
        }
    }
    
    // Fall back to TTS
    speakText(text, lang, buttonId);
}

// Text-to-Speech functions
function speakText(text, lang = 'hi-IN', buttonId = null) {
    // Stop any ongoing speech
    if (isSpeaking) {
        stopSpeech();
        if (buttonId) {
            updateSpeechButton(buttonId, false);
        }
        return;
    }
    
    // For English language, transliterate Devanagari to IAST for better pronunciation
    let textToSpeak = text;
    if (lang.startsWith('en') && typeof transliterateText === 'function') {
        textToSpeak = transliterateText(text, 'en');
    }
    
    if ('speechSynthesis' in window) {
        currentSpeech = new SpeechSynthesisUtterance(textToSpeak);
        currentSpeech.lang = lang;
        // Get speed from slider
        const speedSlider = document.getElementById('speedSlider');
        currentSpeech.rate = speedSlider ? parseFloat(speedSlider.value) : 1.0;
        currentSpeech.pitch = 0.5; // Lower pitch for masculine voice
        
        // Get available voices and select a male voice
        const voices = window.speechSynthesis.getVoices();
        let selectedVoice = null;
        
        if (voices.length > 0) {
            // For Hindi, prefer Google Hindi voice
            if (lang.startsWith('hi')) {
                selectedVoice = voices.find(voice => 
                    voice.name.includes('Google हिन्दी') || 
                    voice.name.includes('Google Hindi') ||
                    voice.lang === 'hi-IN' ||
                    voice.lang.startsWith('hi')
                );
            }
            
            // For English, prefer Google US English Male or David
            if (!selectedVoice && lang.startsWith('en')) {
                selectedVoice = voices.find(voice => 
                    voice.name.includes('Google US English Male') ||
                    voice.name.includes('Microsoft David')
                );
            }
            
            // First fallback: Look for explicitly male voices
            if (!selectedVoice) {
                selectedVoice = voices.find(voice => 
                    voice.lang.startsWith(lang.split('-')[0]) && 
                    (voice.name.toLowerCase().includes('male') || 
                     voice.name.toLowerCase().includes('man'))
                );
            }
            
            // Second fallback: Look for specific male voice names
            if (!selectedVoice) {
                selectedVoice = voices.find(voice => 
                    voice.lang.startsWith(lang.split('-')[0]) && 
                    (voice.name.toLowerCase().includes('david') ||
                     voice.name.toLowerCase().includes('james') ||
                     voice.name.toLowerCase().includes('mark') ||
                     voice.name.toLowerCase().includes('rishi') ||
                     voice.name.toLowerCase().includes('hemant'))
                );
            }
            
            // Final fallback: Any voice for the language
            if (!selectedVoice) {
                selectedVoice = voices.find(voice => voice.lang.startsWith(lang.split('-')[0]));
            }
            
            if (selectedVoice) {
                currentSpeech.voice = selectedVoice;
                console.log('Using voice:', selectedVoice.name, selectedVoice.lang);
            }
        }
        
        currentSpeech.onstart = () => {
            isSpeaking = true;
            if (buttonId) {
                updateSpeechButton(buttonId, true);
            }
        };
        
        currentSpeech.onend = () => {
            isSpeaking = false;
            currentSpeech = null;
            if (buttonId) {
                updateSpeechButton(buttonId, false);
            }
        };
        
        currentSpeech.onerror = () => {
            isSpeaking = false;
            currentSpeech = null;
            if (buttonId) {
                updateSpeechButton(buttonId, false);
            }
        };
        
        window.speechSynthesis.speak(currentSpeech);
    } else {
        alert('Text-to-speech is not supported in your browser.');
    }
}

function stopSpeech() {
    if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
    }
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        currentAudio = null;
    }
    isSpeaking = false;
    currentSpeech = null;
    
    // Reset the heading audio button state
    const headingBtn = document.getElementById('headingAudioBtn');
    if (headingBtn) {
        headingBtn.textContent = '🔊';
        headingBtn.title = 'Play all sutras';
    }
    
    // Reset playback state
    isPlayingSequence = false;
    currentPlaybackIndex = 0;
    currentRepeatCount = 0;
}

function updateSpeechButton(buttonId, isPlaying) {
    const button = document.getElementById(buttonId);
    if (button) {
        button.textContent = isPlaying ? '⏸️' : '🔊';
        button.title = isPlaying ? 'Stop' : 'Play';
    }
}

// Play all sutras in sequence
let currentPlaybackIndex = 0;
let currentRepeatCount = 0;
let isPlayingSequence = false;

function playAllSutras() {
    const headingBtn = document.getElementById('headingAudioBtn');
    const repeatSelect = document.getElementById('repeatSelect');
    
    // Stop if already playing
    if (isPlayingSequence) {
        stopSequentialPlayback();
        return;
    }
    
    if (filteredSutras.length === 0) {
        alert('No sutras to play');
        return;
    }
    
    isPlayingSequence = true;
    currentPlaybackIndex = 0;
    currentRepeatCount = 0;
    
    if (headingBtn) {
        headingBtn.textContent = '⏸️';
        headingBtn.title = 'Stop playback';
    }
    
    playNextSutra();
}

function playNextSutra() {
    if (!isPlayingSequence || currentPlaybackIndex >= filteredSutras.length) {
        stopSequentialPlayback();
        return;
    }
    
    // Remove highlight from all sutras
    document.querySelectorAll('.sutra-link').forEach(link => {
        link.classList.remove('playing');
    });
    
    // Highlight current sutra
    const currentSutraLink = document.querySelectorAll('.sutra-link')[currentPlaybackIndex];
    if (currentSutraLink) {
        currentSutraLink.classList.add('playing');
        // Scroll into view
        currentSutraLink.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    
    const repeatSelect = document.getElementById('repeatSelect');
    const maxRepeats = parseInt(repeatSelect?.value || '1');
    
    const sutra = filteredSutras[currentPlaybackIndex];
    const audioFile = `sutra/audio/${sutra.adhyaya}.${sutra.pada}.${sutra.sutra_number}.mp3`;
    
    // Check if MP3 exists
    const audio = new Audio(audioFile);
    
    audio.onloadeddata = () => {
        audio.play();
    };
    
    audio.onended = () => {
        currentRepeatCount++;
        const speedSlider = document.getElementById('speedSlider');
        const speed = speedSlider ? parseFloat(speedSlider.value) : 1.0;
        const delay = 500 / speed; // Adjust gap based on speed
        
        if (currentRepeatCount < maxRepeats) {
            // Repeat the same sutra
            setTimeout(() => playNextSutra(), delay);
        } else {
            // Move to next sutra
            currentRepeatCount = 0;
            currentPlaybackIndex++;
            setTimeout(() => playNextSutra(), delay);
        }
    };
    
    audio.onerror = () => {
        // Use TTS if MP3 not found - always use Sanskrit text with Hindi voice
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(sutra.sutra_text);
            utterance.lang = 'hi-IN';
            const speedSlider = document.getElementById('speedSlider');
            utterance.rate = speedSlider ? parseFloat(speedSlider.value) : 1.0;
            utterance.pitch = 0.5;
            
            const voices = window.speechSynthesis.getVoices();
            const hindiVoice = voices.find(v => 
                v.name.includes('Google हिन्दी') || 
                v.name.includes('Google Hindi')
            );
            if (hindiVoice) {
                utterance.voice = hindiVoice;
            }
            
            utterance.onend = () => {
                currentRepeatCount++;
                const speedSlider = document.getElementById('speedSlider');
                const speed = speedSlider ? parseFloat(speedSlider.value) : 1.0;
                const delay = 500 / speed; // Adjust gap based on speed
                
                if (currentRepeatCount < maxRepeats) {
                    // Repeat the same sutra
                    setTimeout(() => playNextSutra(), delay);
                } else {
                    // Move to next sutra
                    currentRepeatCount = 0;
                    currentPlaybackIndex++;
                    setTimeout(() => playNextSutra(), delay);
                }
            };
            
            window.speechSynthesis.speak(utterance);
        } else {
            currentRepeatCount = 0;
            currentPlaybackIndex++;
            playNextSutra();
        }
    };
}

function stopSequentialPlayback() {
    isPlayingSequence = false;
    currentPlaybackIndex = 0;
    currentRepeatCount = 0;
    
    // Remove highlight from all sutras
    document.querySelectorAll('.sutra-link').forEach(link => {
        link.classList.remove('playing');
    });
    
    const headingBtn = document.getElementById('headingAudioBtn');
    if (headingBtn) {
        headingBtn.textContent = '🔊';
        headingBtn.title = 'Play all sutras';
    }
    
    stopSpeech();
}

// Toggle commentary collapse/expand
function toggleCommentary(num, vyakhyanaKey) {
    const content = document.getElementById(`commentary-${num}`);
    const toggle = document.getElementById(`toggle-${num}`);
    
    if (content.style.display === 'none') {
        content.style.display = 'block';
        toggle.textContent = '▲';
        openVyakhyanas.add(vyakhyanaKey);
    } else {
        content.style.display = 'none';
        toggle.textContent = '▼';
        openVyakhyanas.delete(vyakhyanaKey);
    }
}

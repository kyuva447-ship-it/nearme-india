import type { SupportedLang } from './autonomousStore';

export const LANGUAGES: Array<{ code: SupportedLang; label: string; native: string }> = [
  { code: 'EN', label: 'EN', native: 'English' },
  { code: 'HI', label: 'HI', native: 'हिन्दी' },
  { code: 'KN', label: 'KN', native: 'ಕನ್ನಡ' },
  { code: 'TA', label: 'TA', native: 'தமிழ்' },
  { code: 'TE', label: 'TE', native: 'తెలుగు' },
  { code: 'MR', label: 'MR', native: 'मराठी' },
];

export interface LocalizedCopy {
  heroTitle: string;
  heroSubtitle: string;
  searchPlaceholder: string;
  searchCta: string;
  step1Title: string;
  step1Desc: string;
  step2Title: string;
  step2Desc: string;
  step3Title: string;
  step3Desc: string;
  tab1: string;
  tab2: string;
  tab3: string;
  tab4: string;
  loopsTitle: string;
  syndicatesTitle: string;
  cashOrdersTitle: string;
  supportButton: string;
  supportGreeting: string;
}

export const COPY_BY_LANG: Record<SupportedLang, LocalizedCopy> = {
  EN: {
    heroTitle: 'Strip Overcharges. Lock Wholesale Prices Across India.',
    heroSubtitle:
      'Upload any hospital bill, medicine receipt, or supplier quote (1 to 500+ pages). We find hidden extra charges in 60 seconds, show fair wholesale prices, and protect your money until delivery.',
    searchPlaceholder: 'Search city or pincode, hospital bill check, cement, or medicines...',
    searchCta: 'Search',
    step1Title: '1. Upload Bill or Photo',
    step1Desc: 'Drop any PDF (1–500+ pages), Excel sheet, or bill photo — or try a 1-click sample.',
    step2Title: '2. Spot Extra Charges',
    step2Desc: 'See line-by-line overcharges, fair wholesale prices, and insurance claim letters.',
    step3Title: '3. Pay Safely After OTP',
    step3Desc: 'Your money stays protected in escrow until delivery OTP — with a 48h refund guarantee.',
    tab1: 'Check Any Bill (500+p)',
    tab2: 'Safe Escrow Pay (48h)',
    tab3: 'Check Shop GST (Trust)',
    tab4: 'Shops & Deals (₹99/Day)',
    loopsTitle: 'Real Savings Examples Across India',
    syndicatesTitle: 'Group-Buy Pools Near You (Save Together)',
    cashOrdersTitle: 'Live Wholesale Orders Waiting for Local Shops',
    supportButton: '24/7 AI Self-Support',
    supportGreeting:
      '24/7 Self-Support is ready in 6 languages. Ask for a bill re-unlock, 48-hour escrow refund, OTP help, or GST check right here.',
  },
  HI: {
    heroTitle: 'अधिक बिल हटाएं। पूरे भारत में थोक रेट लॉक करें।',
    heroSubtitle:
      'कोई भी अस्पताल बिल, दवाई रसीद या सप्लायर कोटेशन (1 से 500+ पेज) अपलोड करें। 60 सेकंड में अतिरिक्त शुल्क पकड़ें, सही थोक दाम जानें और डिलीवरी तक अपना पैसा सुरक्षित रखें।',
    searchPlaceholder: 'शहर, पिनकोड, हॉस्पिटल बिल जांच, सीमेंट या दवाई खोजें...',
    searchCta: 'खोजें',
    step1Title: '1. बिल या फोटो अपलोड करें',
    step1Desc: 'कोई भी PDF (1–500+ पेज), Excel या बिल फोटो डालें — या 1-क्लिक सैंपल देखें।',
    step2Title: '2. अतिरिक्त चार्ज पहचानें',
    step2Desc: 'हर आइटम का सही थोक रेट, हटाए गए चार्ज और बीमा क्लेम पत्र तुरंत पाएं।',
    step3Title: '3. डिलीवरी OTP पर सुरक्षित पेमेंट',
    step3Desc: 'डिलीवरी OTP तक पैसा सुरक्षित रहता है — 48 घंटे में आसान रिफंड गारंटी के साथ।',
    tab1: 'बिल जांचें (500+ पेज)',
    tab2: 'सुरक्षित एस्क्रो पे (48h)',
    tab3: 'दुकान GST जांचें',
    tab4: 'दुकान AI व कैश ऑर्डर',
    loopsTitle: 'भारत भर में असली बचत के उदाहरण',
    syndicatesTitle: 'आपके पास ग्रुप-बाय डील्स (साथ मिलकर बचत)',
    cashOrdersTitle: 'लोकल दुकानदारों के लिए लाइव थोक ऑर्डर',
    supportButton: '24/7 AI सेल्फ-सपोर्ट',
    supportGreeting:
      '24/7 सेल्फ-सपोर्ट डेस्क 6 भाषाओं में तैयार है। बिल अनलॉक, 48-घंटे रिफंड, OTP या GST जांच यहीं तुरंत करें।',
  },
  KN: {
    heroTitle: 'ಹೆಚ್ಚುವರಿ ಶುಲ್ಕ ತೆಗೆಯಿರಿ. ಭಾರತದಾದ್ಯಂತ ಹೋಲ್‌ಸೇಲ್ ದರ ಲಾಕ್ ಮಾಡಿ.',
    heroSubtitle:
      'ಯಾವುದೇ ಆಸ್ಪತ್ರೆ ಬಿಲ್, ಔಷಧಿ ರಸೀದಿ ಅಥವಾ ಸಪ್ಲೈಯರ್ ಬಿಲ್ (1–500+ ಪುಟ) ಅಪ್‌ಲೋಡ್ ಮಾಡಿ. 60 ಸೆಕೆಂಡುಗಳಲ್ಲಿ ಹೆಚ್ಚುವರಿ ಶುಲ್ಕ ಪತ್ತೆಹಚ್ಚಿ, ನ್ಯಾಯಯುತ ಹೋಲ್‌ಸೇಲ್ ದರ ಪಡೆಯಿರಿ.',
    searchPlaceholder: 'ಪಿನ್‌ಕೋಡ್, ಆಸ್ಪತ್ರೆ ಬಿಲ್ ಪರಿಶೀಲನೆ ಅಥವಾ ಹೋಲ್‌ಸೇಲ್ ದರ ಹುಡುಕಿ...',
    searchCta: 'ಹುಡುಕಿ',
    step1Title: '1. ಬಿಲ್ ಅಥವಾ ಫೋಟೋ ಹಾಕಿ',
    step1Desc: 'PDF (1–500+ ಪುಟ), Excel ಅಥವಾ ಬಿಲ್ ಫೋಟೋ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ ಅಥವಾ ಸ್ಯಾಂಪಲ್ ನೋಡಿ.',
    step2Title: '2. ಹೆಚ್ಚುವರಿ ಶುಲ್ಕ ನೋಡಿ',
    step2Desc: 'ಪ್ರತಿ ಐಟಂನ ನಿಜವಾದ ಹೋಲ್‌ಸೇಲ್ ಬೆಲೆ ಮತ್ತು ಉಳಿತಾಯವನ್ನು ತಕ್ಷಣ ತಿಳಿಯಿರಿ.',
    step3Title: '3. OTP ನಂತರ ಸುರಕ್ಷಿತ ಪಾವತಿ',
    step3Desc: 'ಡೆಲಿವರಿ OTP ತನಕ ಹಣ ಸುರಕ್ಷಿತವಾಗಿರುತ್ತದೆ — 48 ಗಂಟೆಗಳ ಮರುಪಾವತಿ ಭರವಸೆ ಇದೆ.',
    tab1: 'ಬಿಲ್ ಪರಿಶೀಲಿಸಿ (500+p)',
    tab2: 'ಸುರಕ್ಷಿತ ಎಸ್ಕ್ರೋ ಪೇ',
    tab3: 'ಅಂಗಡಿ GST ಪರಿಶೀಲಿಸಿ',
    tab4: 'ಅಂಗಡಿ AI & ನಗದು ಆರ್ಡರ್',
    loopsTitle: 'ಭಾರತದಾದ್ಯಂತ ನಿಜವಾದ ಉಳಿತಾಯ ಉದಾಹರಣೆಗಳು',
    syndicatesTitle: 'ನಿಮ್ಮ ಹತ್ತಿರದ ಗ್ರೂಪ್-ಬೈ ಡೀಲ್‌ಗಳು',
    cashOrdersTitle: 'ಸ್ಥಳೀಯ ಅಂಗಡಿಗಳಿಗೆ ನೇರ ಹೋಲ್‌ಸೇಲ್ ಆರ್ಡರ್‌ಗಳು',
    supportButton: '24/7 AI ಸ್ವಯಂ-ಸಹಾಯ',
    supportGreeting:
      '24/7 ಸ್ವಯಂ-ಸಹಾಯ ಕೇಂದ್ರ 6 ಭಾಷೆಗಳಲ್ಲಿ ಸಿದ್ಧವಾಗಿದೆ. ಬಿಲ್ ಅನ್‌ಲಾಕ್, 48-ಗಂಟೆ ಮರುಪಾವತಿ ಅಥವಾ GST ಪರಿಶೀಲನೆ ಇಲ್ಲೇ ಮಾಡಿ.',
  },
  TA: {
    heroTitle: 'அதிகக் கட்டணத்தை நீக்குங்கள். இந்தியா முழுவதும் மொத்த விலையைப் பெறுங்கள்.',
    heroSubtitle:
      'மருத்துவமனை பில், மருந்து ரசீது அல்லது சப்ளையர் பில்லை (1–500+ பக்கம்) பதிவேற்றுங்கள். 60 நொடிகளில் கூடுதல் கட்டணத்தைக் கண்டுபிடித்து நியாயமான மொத்த விலையைப் பெறுங்கள்.',
    searchPlaceholder: 'பின்கோடு, மருத்துவ பில் சரிபார்ப்பு அல்லது மொத்த விலை தேடுங்கள்...',
    searchCta: 'தேடு',
    step1Title: '1. பில் அல்லது புகைப்படம் பதிவேற்றவும்',
    step1Desc: 'PDF (1–500+ பக்கம்), Excel அல்லது பில் புகைப்படத்தை பதிவேற்றவும்.',
    step2Title: '2. கூடுதல் கட்டணத்தைக் காண்க',
    step2Desc: 'நியாயமான மொத்த விலை மற்றும் சேமிப்பை உடனடியாகப் பாருங்கள்.',
    step3Title: '3. OTP-க்குப் பிறகு பாதுகாப்பான கட்டணம்',
    step3Desc: 'டெலிவரி OTP வரை பணம் பாதுகாப்பாக இருக்கும் — 48 மணி நேர ரீஃபண்ட் உண்டு.',
    tab1: 'பில் சரிபார் (500+p)',
    tab2: 'பாதுகாப்பான எஸ்க்ரோ பே',
    tab3: 'கடை GST சரிபார்',
    tab4: 'கடை AI & கேஷ் ஆர்டர்',
    loopsTitle: 'இந்தியா முழுவதும் உள்ள உண்மையான சேமிப்பு உதாரணங்கள்',
    syndicatesTitle: 'உங்கள் அருகிலுள்ள குழு கொள்முதல் சலுகைகள்',
    cashOrdersTitle: 'உள்ளூர் கடைகளுக்கான நேரடி மொத்த ஆர்டர்கள்',
    supportButton: '24/7 AI சுய-உதவி',
    supportGreeting:
      '24/7 சுய-உதவி மையம் 6 மொழிகளில் தயார். ரீஃபண்ட், அன்லாக் அல்லது GST சரிபார்ப்பை இங்கேயே செய்யலாம்.',
  },
  TE: {
    heroTitle: 'అధిక ఛార్జీలను తొలగించండి. భారతదేశమంతటా హోల్‌సేల్ ధరలు లాక్ చేయండి.',
    heroSubtitle:
      'ఏదైనా ఆసుపత్రి బిల్లు, మందుల రసీదు లేదా సప్లయర్ కోట్ (1–500+ పేజీలు) అప్‌లోడ్ చేయండి. 60 సెకన్లలో అదనపు ఛార్జీలను గుర్తించి సరైన హోల్‌సేల్ ధరను పొందండి.',
    searchPlaceholder: 'పిన్‌కోడ్, హాస్పిటల్ బిల్ చెక్ లేదా హోల్‌సేల్ ధర వెతకండి...',
    searchCta: 'వెతకండి',
    step1Title: '1. బిల్లు లేదా ఫోటో అప్‌లోడ్ చేయండి',
    step1Desc: 'PDF (1–500+ పేజీలు), Excel లేదా బిల్లు ఫోటో వేయండి లేదా శాంపిల్ చూడండి.',
    step2Title: '2. అదనపు ఛార్జీలను చూడండి',
    step2Desc: 'ప్రతి వస్తువు అసలు హోల్‌సేల్ ధర మరియు ఆదా అయ్యే మొత్తాన్ని వెంటనే తెలుసుకోండి.',
    step3Title: '3. OTP తర్వాత సురక్షిత చెల్లింపు',
    step3Desc: 'డెలివరీ OTP వరకు మీ డబ్బు సురక్షితంగా ఉంటుంది — 48 గంటల రీఫండ్ హామీతో.',
    tab1: 'బిల్లు చెక్ (500+p)',
    tab2: 'సురక్షిత ఎస్క్రో పే',
    tab3: 'షాప్ GST చెక్',
    tab4: 'షాప్ AI & క్యాష్ ఆర్డర్లు',
    loopsTitle: 'భారతదేశమంతటా నిజమైన ఆదా ఉదాహరణలు',
    syndicatesTitle: 'మీ దగ్గరలో గ్రూప్-బై ఆఫర్లు',
    cashOrdersTitle: 'స్థానిక షాపుల కోసం లైవ్ హోల్‌సేల్ ఆర్డర్లు',
    supportButton: '24/7 AI సెల్ఫ్-సపోర్ట్',
    supportGreeting:
      '24/7 సెల్ఫ్-సపోర్ట్ 6 భాషలలో సిద్ధంగా ఉంది. బిల్ అన్‌లాక్, 48-గంటల రీఫండ్ లేదా GST తనిఖీ ఇక్కడే చేయండి.',
  },
  MR: {
    heroTitle: 'जादा बिल आकारणी काढा. संपूर्ण भारतात घाऊक दर लॉक करा.',
    heroSubtitle:
      'कोणतेही हॉस्पिटल बिल, औषध पावती किंवा सप्लायर कोटेशन (1–500+ पाने) अपलोड करा. 60 सेकंदांत जादा शुल्क शोधा, योग्य घाऊक दर पहा आणि डिलिव्हरीपर्यंत पैसे सुरक्षित ठेवा.',
    searchPlaceholder: 'पिनकोड, हॉस्पिटल बिल तपासणी किंवा घाऊक दर शोधा...',
    searchCta: 'शोधा',
    step1Title: '1. बिल किंवा फोटो अपलोड करा',
    step1Desc: 'PDF (1–500+ पाने), Excel किंवा बिलाचा फोटो टाका — किंवा 1-क्लिक सॅम्पल पहा.',
    step2Title: '2. जादा शुल्क ओळखा',
    step2Desc: 'प्रत्येक वस्तूचा योग्य घाऊक दर आणि वाचवलेली रक्कम लगेच पहा.',
    step3Title: '3. OTP नंतर सुरक्षित पेमेंट',
    step3Desc: 'डिलिव्हरी OTP पर्यंत पैसे सुरक्षित राहतात — 48 तासांच्या रिफंड हमीसह.',
    tab1: 'बिल तपासा (500+p)',
    tab2: 'सुरक्षित एस्क्रो पे',
    tab3: 'दुकान GST तपासा',
    tab4: 'दुकान AI व कॅश ऑर्डर',
    loopsTitle: 'भारतभरातील खरी बचत उदाहरणे',
    syndicatesTitle: 'तुमच्या भागातील ग्रुप-बाय ऑफर्स',
    cashOrdersTitle: 'स्थानिक दुकानांसाठी थेट घाऊक ऑर्डर्स',
    supportButton: '24/7 AI सेल्फ-सपोर्ट',
    supportGreeting:
      '24/7 सेल्फ-सपोर्ट 6 भाषांमध्ये तयार आहे. बिल अनलॉक, 48-तास रिफंड किंवा GST तपासणी येथेच करा.',
  },
};

export function normalizeLang(val: string | null | undefined): SupportedLang {
  const upper = (val || 'EN').toUpperCase();
  if (upper === 'HI' || upper === 'KN' || upper === 'TA' || upper === 'TE' || upper === 'MR') {
    return upper;
  }
  return 'EN';
}

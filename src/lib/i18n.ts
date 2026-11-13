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
      'Audit 1 to 500+ page hospital ICU bills & BOQs in 60 seconds, lock 15/85 UPI Escrow deals, verify GSTIN Mod-36 trust, and resolve support 24/7 with zero human delay.',
    searchPlaceholder: 'Search pincode, hospital bill audit, OPC-53 cement, or Jan Aushadhi...',
    searchCta: 'Search',
    tab1: 'Bill Stripper (500+p)',
    tab2: '15/85 Escrow & MSME',
    tab3: 'e-Court & GST Shield',
    tab4: 'AI Twin, Cash & QR',
    loopsTitle: 'Regional Price-Slash Loops',
    syndicatesTitle: 'Active Neighborhood Group-Buy Syndicates',
    cashOrdersTitle: 'Pan-India Cash Orders Waiting for Suppliers',
    supportButton: '24/7 AI Self-Support',
    supportGreeting:
      'Autonomous 24/7 Support Desk ready in 6 languages. Paste any transaction ID, Escrow ID, GSTIN, or refund request for instant automated execution.',
  },
  HI: {
    heroTitle: 'अधिक बिल हटाएं। पूरे भारत में थोक रेट लॉक करें।',
    heroSubtitle:
      '1 से 500+ पेज के अस्पताल ICU बिल और BOQ 60 सेकंड में ऑडिट करें, 15/85 UPI एस्क्रो से डील लॉक करें और 24/7 स्वचालित सहायता पाएं।',
    searchPlaceholder: 'पिनकोड, हॉस्पिटल बिल ऑडिट, सीमेंट या जन औषधि खोजें...',
    searchCta: 'खोजें',
    tab1: 'बिल ऑडिटर (500+ पेज)',
    tab2: '15/85 एस्क्रो व MSME',
    tab3: 'ई-कोर्ट व GST शील्ड',
    tab4: 'AI ट्विन, कैश व QR',
    loopsTitle: 'क्षेत्रीय प्राइस-स्लैश लूप्स',
    syndicatesTitle: 'सक्रिय नेबरहुड ग्रुप-बाय सिंडिकेट्स',
    cashOrdersTitle: 'पैन-इंडिया कैश ऑर्डर (सप्लायर्स के लिए)',
    supportButton: '24/7 AI सेल्फ-सपोर्ट',
    supportGreeting:
      '24/7 स्वायत्त सहायता डेस्क तैयार है। रसीद अनलॉक, 48-घंटे एस्क्रो रिफंड या OTP सहायता के लिए तुरंत संदेश भेजें।',
  },
  KN: {
    heroTitle: 'ಹೆಚ್ಚುವರಿ ಶುಲ್ಕ ತೆಗೆಯಿರಿ. ಭಾರತದಾದ್ಯಂತ ಹೋಲ್‌ಸೇಲ್ ದರ ಲಾಕ್ ಮಾಡಿ.',
    heroSubtitle:
      '1 ರಿಂದ 500+ ಪುಟಗಳ ಆಸ್ಪತ್ರೆ ICU ಬಿಲ್ ಮತ್ತು BOQ 60 ಸೆಕೆಂಡುಗಳಲ್ಲಿ ಆಡಿಟ್ ಮಾಡಿ, 15/85 UPI ಎಸ್ಕ್ರೋ ಸುರಕ್ಷತೆ ಪಡೆಯಿರಿ.',
    searchPlaceholder: 'ಪಿನ್‌ಕೋಡ್, ಆಸ್ಪತ್ರೆ ಬಿಲ್ ಆಡಿಟ್ ಅಥವಾ ಹೋಲ್‌ಸೇಲ್ ದರ ಹುಡುಕಿ...',
    searchCta: 'ಹುಡುಕಿ',
    tab1: 'ಬಿಲ್ ಸ್ಟ್ರಿಪ್ಪರ್ (500+p)',
    tab2: '15/85 ಎಸ್ಕ್ರೋ & MSME',
    tab3: 'ಇ-ಕೋರ್ಟ್ & GST ಶೀಲ್ಡ್',
    tab4: 'AI ಟ್ವಿನ್, ಕ್ಯಾಶ್ & QR',
    loopsTitle: 'ಪ್ರಾದೇಶಿಕ ಬೆಲೆ ಕಡಿತ ಲೂಪ್‌ಗಳು',
    syndicatesTitle: 'ಸಕ್ರಿಯ ನೆರೆಹೊರೆ ಗ್ರೂಪ್-ಬೈ ಸಿಂಡಿಕೇಟ್‌ಗಳು',
    cashOrdersTitle: 'ಪ್ಯಾನ್-ಇಂಡಿಯಾ ನಗದು ಆರ್ಡರ್‌ಗಳು',
    supportButton: '24/7 AI ಸ್ವಯಂ-ಸಹಾಯ',
    supportGreeting:
      '24/7 ಸ್ವಯಂಚಾಲಿತ ಬೆಂಬಲ ಕೇಂದ್ರ ಸಿದ್ಧವಾಗಿದೆ. ಪಾವತಿ ಅನ್‌ಲಾಕ್, 48-ಗಂಟೆಗಳ ಎಸ್ಕ್ರೋ ಮರುಪಾವತಿ ಅಥವಾ OTP ಸಹಾಯಕ್ಕಾಗಿ ಕೇಳಿ.',
  },
  TA: {
    heroTitle: 'அதிகக் கட்டணத்தை நீக்குங்கள். இந்தியா முழுவதும் மொத்த விலையைப் பெறுங்கள்.',
    heroSubtitle:
      '1 முதல் 500+ பக்க மருத்துவமனை ICU பில்களை 60 நொடிகளில் தணிக்கை செய்து 15/85 UPI எஸ்க்ரோ பாதுகாப்புடன் சேமியுங்கள்.',
    searchPlaceholder: 'பின்கோடு, மருத்துவ பில் தணிக்கை அல்லது மொத்த விலையைத் தேடுங்கள்...',
    searchCta: 'தேடு',
    tab1: 'பில் ஆடிட்டர் (500+p)',
    tab2: '15/85 எஸ்க்ரோ & MSME',
    tab3: 'இ-கோர்ட் & GST கவசம்',
    tab4: 'AI ட்வின், கேஷ் & QR',
    loopsTitle: 'பிராந்திய விலை குறைப்பு சுழல்கள்',
    syndicatesTitle: 'செயலில் உள்ள குழு கொள்முதல் சிண்டிகேட்கள்',
    cashOrdersTitle: 'இந்தியா முழுவதுமான நேரடி பண ஆர்டர்கள்',
    supportButton: '24/7 AI சுய-உதவி',
    supportGreeting:
      '24/7 தன்னியக்க உதவி மையம் தயார். கட்டண திறப்பு, 48-மணி நேர எஸ்க்ரோ ரீஃபண்ட் அல்லது OTP உதவிக்கு உடனே கேட்கவும்.',
  },
  TE: {
    heroTitle: 'అధిక ఛార్జీలను తొలగించండి. భారతదేశమంతటా హోల్‌సేల్ ధరలు లాక్ చేయండి.',
    heroSubtitle:
      '1 నుండి 500+ పేజీల ఆసుపత్రి ICU బిల్లులు & BOQలను 60 సెకన్లలో ఆడిట్ చేసి 15/85 UPI ఎస్క్రో రక్షణ పొందండి.',
    searchPlaceholder: 'పిన్‌కోడ్, హాస్పిటల్ బిల్ ఆడిట్ లేదా హోల్‌సేల్ ధర శోధించండి...',
    searchCta: 'వెతకండి',
    tab1: 'బిల్ స్ట్రిప్పర్ (500+p)',
    tab2: '15/85 ఎస్క్రో & MSME',
    tab3: 'ఇ-కోర్ట్ & GST షీల్డ్',
    tab4: 'AI ట్విన్, క్యాష్ & QR',
    loopsTitle: 'ప్రాంతీయ ధర తగ్గింపు లూప్‌లు',
    syndicatesTitle: 'యాక్టివ్ నైబర్‌హుడ్ గ్రూప్-బై సిండికేట్‌లు',
    cashOrdersTitle: 'పాన్-ఇండియా నగదు ఆర్డర్లు',
    supportButton: '24/7 AI సెల్ఫ్-సపోర్ట్',
    supportGreeting:
      '24/7 స్వయంచాలక సహాయ డెస్క్ సిద్ధంగా ఉంది. చెల్లింపు అన్‌లాక్, 48-గంటల ఎస్క్రో రీఫండ్ లేదా OTP సహాయం కోసం ఇప్పుడే అడగండి.',
  },
  MR: {
    heroTitle: 'जादा बिल आकारणी काढा. संपूर्ण भारतात घाऊक दर लॉक करा.',
    heroSubtitle:
      '1 ते 500+ पानांची हॉस्पिटल ICU बिले आणि BOQ 60 सेकंदात ऑडिट करा आणि 15/85 UPI एस्क्रो सुरक्षा मिळवा.',
    searchPlaceholder: 'पिनकोड, हॉस्पिटल बिल ऑडिट किंवा घाऊक दर शोधा...',
    searchCta: 'शोधा',
    tab1: 'बिल ऑडिटर (500+p)',
    tab2: '15/85 एस्क्रो व MSME',
    tab3: 'ई-कोर्ट व GST शिल्ड',
    tab4: 'AI ट्विन, कॅश व QR',
    loopsTitle: 'प्रादेशिक दर-कपात लूप्स',
    syndicatesTitle: 'सक्रिय नेबरहुड ग्रुप-बाय सिंडिकेट्स',
    cashOrdersTitle: 'पॅन-इंडिया कॅश ऑर्डर्स',
    supportButton: '24/7 AI सेल्फ-सपोर्ट',
    supportGreeting:
      '24/7 स्वयंचलित सहाय्य केंद्र सज्ज आहे. पेमेंट अनलॉक, 48-तास एस्क्रो रिफंड किंवा OTP मदतीसाठी लगेच विचारा.',
  },
};

export function normalizeLang(val: string | null | undefined): SupportedLang {
  const upper = (val || 'EN').toUpperCase();
  if (upper === 'HI' || upper === 'KN' || upper === 'TA' || upper === 'TE' || upper === 'MR') {
    return upper;
  }
  return 'EN';
}

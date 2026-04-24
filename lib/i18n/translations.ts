export type Language = 'en' | 'hi' | 'kn' | 'te' | 'ta'

export interface LanguageConfig {
  code: Language
  name: string
  nativeName: string
}

export const SUPPORTED_LANGUAGES: LanguageConfig[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
]

// Map language codes to BCP 47 / Web Speech API codes
export const SPEECH_LANG_MAP: Record<Language, string> = {
  en: 'en-IN',
  hi: 'hi-IN',
  kn: 'kn-IN',
  te: 'te-IN',
  ta: 'ta-IN',
}

// Map language codes to Whisper API codes
export const WHISPER_LANG_MAP: Record<Language, string> = {
  en: 'en',
  hi: 'hi',
  kn: 'kn',
  te: 'te',
  ta: 'ta',
}

type TranslationKeys = {
  // Navigation & Header
  'nav.title': string
  'nav.subtitle': string
  'nav.documents': string
  'nav.sos': string

  // Welcome Screen
  'welcome.title': string
  'welcome.subtitle': string
  'welcome.suggested': string

  // Chat Input
  'chat.placeholder': string
  'chat.disclaimer': string
  'chat.thinking': string
  'chat.voiceNotSupported': string
  'chat.listening': string
  'chat.speakNow': string

  // Quick Action Prompts
  'prompt.landlord': string
  'prompt.salary': string
  'prompt.police': string
  'prompt.rights': string

  // Sidebar
  'sidebar.history': string
  'sidebar.newChat': string
  'sidebar.noChats': string
  'sidebar.footer': string
  'sidebar.deleteConfirm': string
  'sidebar.deleteTitle': string
  'sidebar.cancel': string
  'sidebar.delete': string

  // SOS Modal
  'sos.title': string
  'sos.subtitle': string
  'sos.womenSafety': string
  'sos.immediateEmergency': string
  'sos.otherContacts': string
  'sos.immediate': string
  'sos.footer': string
  'sos.callOnMobile': string

  // Document Generator
  'doc.title': string
  'doc.subtitle': string
  'doc.selectType': string
  'doc.typeLabel': string
  'doc.detailsLabel': string
  'doc.detailsPlaceholder': string
  'doc.generate': string
  'doc.generating': string
  'doc.generated': string
  'doc.copy': string
  'doc.copied': string
  'doc.download': string
  'doc.print': string
  'doc.createNew': string

  // Document Types
  'docType.fir': string
  'docType.rti': string
  'docType.consumer': string
  'docType.legalNotice': string
  'docType.affidavit': string

  // Emergency Categories
  'category.police': string
  'category.women': string
  'category.child': string
  'category.medical': string
  'category.emergency': string
  'category.cyber': string
  'category.senior': string
  'category.mentalHealth': string
  'category.legal': string

  // Loading
  'loading.app': string

  // TTS
  'tts.play': string
  'tts.stop': string
}

type Translations = Record<Language, TranslationKeys>

export const translations: Translations = {
  en: {
    'nav.title': 'Sahara',
    'nav.subtitle': 'Your Legal Assistant',
    'nav.documents': 'Documents',
    'nav.sos': 'SOS',

    'welcome.title': 'Namaste! I am Sahara',
    'welcome.subtitle': 'Tell me your legal problem in your own language — I will explain your rights in simple words and help you take action.',
    'welcome.suggested': 'Suggested',

    'chat.placeholder': 'Tell me your legal problem...',
    'chat.disclaimer': 'Sahara is for informational purposes only. Consult a lawyer for complex matters.',
    'chat.thinking': 'Sahara is thinking',
    'chat.voiceNotSupported': 'Voice not supported',
    'chat.listening': 'Listening...',
    'chat.speakNow': 'Speak now',

    'prompt.landlord': 'My landlord is evicting me',
    'prompt.salary': "My employer hasn't paid my salary",
    'prompt.police': 'I need to file a police complaint',
    'prompt.rights': 'What are my fundamental rights?',

    'sidebar.history': 'Chat History',
    'sidebar.newChat': 'New Chat',
    'sidebar.noChats': 'No chats yet',
    'sidebar.footer': 'Indian Law Assistance',
    'sidebar.deleteConfirm': 'Are you sure you want to delete this chat?',
    'sidebar.deleteTitle': 'Delete Chat',
    'sidebar.cancel': 'Cancel',
    'sidebar.delete': 'Delete',

    'sos.title': 'Emergency Contacts',
    'sos.subtitle': 'Tap to call immediately',
    'sos.womenSafety': 'Women Safety',
    'sos.immediateEmergency': 'Immediate Emergency',
    'sos.otherContacts': 'Other Contacts',
    'sos.immediate': 'Immediate',
    'sos.footer': 'For life-threatening emergencies, call 112 immediately.',
    'sos.callOnMobile': 'Calling works only on mobile devices 📱',

    'doc.title': 'Document Generator',
    'doc.subtitle': 'Enter your details and get AI-powered legal documents',
    'doc.selectType': 'Select document type',
    'doc.typeLabel': 'Document Type',
    'doc.detailsLabel': 'Incident/Case Details',
    'doc.detailsPlaceholder': 'Provide complete details: what happened, when, where, who was involved...',
    'doc.generate': 'Generate Document',
    'doc.generating': 'Generating...',
    'doc.generated': 'Generated Document',
    'doc.copy': 'Copy',
    'doc.copied': 'Copied',
    'doc.download': 'Download',
    'doc.print': 'Print',
    'doc.createNew': 'Create New Document',

    'docType.fir': 'First Information Report (FIR)',
    'docType.rti': 'RTI Application',
    'docType.consumer': 'Consumer Complaint',
    'docType.legalNotice': 'Legal Notice',
    'docType.affidavit': 'Affidavit',

    'category.police': 'Police',
    'category.women': 'Women Helpline',
    'category.child': 'Child Helpline',
    'category.medical': 'Medical',
    'category.emergency': 'Emergency',
    'category.cyber': 'Cyber Crime',
    'category.senior': 'Senior Citizens',
    'category.mentalHealth': 'Mental Health',
    'category.legal': 'Legal Aid',

    'loading.app': 'Loading Sahara...',

    'tts.play': 'Listen',
    'tts.stop': 'Stop',
  },

  hi: {
    'nav.title': 'सहारा',
    'nav.subtitle': 'आपका कानूनी सहायक',
    'nav.documents': 'दस्तावेज़',
    'nav.sos': 'SOS',

    'welcome.title': 'नमस्ते! मैं सहारा हूँ',
    'welcome.subtitle': 'अपनी कानूनी समस्या अपनी भाषा में बताएं — मैं आपके अधिकार सरल शब्दों में समझाऊंगा और कार्रवाई में मदद करूंगा।',
    'welcome.suggested': 'सुझाव',

    'chat.placeholder': 'अपनी समस्या यहां बताएं...',
    'chat.disclaimer': 'सहारा केवल सूचनात्मक उद्देश्यों के लिए है। जटिल मामलों के लिए वकील से परामर्श करें।',
    'chat.thinking': 'सहारा सोच रहा है',
    'chat.voiceNotSupported': 'आवाज़ समर्थित नहीं',
    'chat.listening': 'सुन रहा हूँ...',
    'chat.speakNow': 'अब बोलें',

    'prompt.landlord': 'मेरा मकान मालिक मुझे निकाल रहा है',
    'prompt.salary': 'मेरे नियोक्ता ने मेरा वेतन नहीं दिया',
    'prompt.police': 'मुझे पुलिस शिकायत दर्ज करनी है',
    'prompt.rights': 'मेरे मौलिक अधिकार क्या हैं?',

    'sidebar.history': 'चैट इतिहास',
    'sidebar.newChat': 'नई चैट',
    'sidebar.noChats': 'कोई चैट नहीं',
    'sidebar.footer': 'भारतीय कानून सहायता',
    'sidebar.deleteConfirm': 'क्या आप इस चैट को हटाना चाहते हैं?',
    'sidebar.deleteTitle': 'चैट हटाएं',
    'sidebar.cancel': 'रद्द करें',
    'sidebar.delete': 'हटाएं',

    'sos.title': 'आपातकालीन संपर्क',
    'sos.subtitle': 'तत्काल कॉल करने के लिए टैप करें',
    'sos.womenSafety': 'महिला सुरक्षा',
    'sos.immediateEmergency': 'तत्काल आपातकाल',
    'sos.otherContacts': 'अन्य संपर्क',
    'sos.immediate': 'तत्काल',
    'sos.footer': 'जीवन के लिए खतरनाक आपातकाल में, तुरंत 112 पर कॉल करें।',
    'sos.callOnMobile': 'कॉलिंग केवल मोबाइल पर काम करती है 📱',

    'doc.title': 'दस्तावेज़ जनरेटर',
    'doc.subtitle': 'अपने विवरण दर्ज करें और AI-संचालित कानूनी दस्तावेज़ प्राप्त करें',
    'doc.selectType': 'दस्तावेज़ प्रकार चुनें',
    'doc.typeLabel': 'दस्तावेज़ प्रकार',
    'doc.detailsLabel': 'घटना/मामले का विवरण',
    'doc.detailsPlaceholder': 'घटना का पूरा विवरण दें: क्या हुआ, कब हुआ, कहां हुआ, कौन शामिल था...',
    'doc.generate': 'दस्तावेज़ जनरेट करें',
    'doc.generating': 'जनरेट हो रहा है...',
    'doc.generated': 'जनरेट किया गया दस्तावेज़',
    'doc.copy': 'कॉपी',
    'doc.copied': 'कॉपी हुआ',
    'doc.download': 'डाउनलोड',
    'doc.print': 'प्रिंट',
    'doc.createNew': 'नया दस्तावेज़ बनाएं',

    'docType.fir': 'प्रथम सूचना रिपोर्ट (FIR)',
    'docType.rti': 'RTI आवेदन',
    'docType.consumer': 'उपभोक्ता शिकायत',
    'docType.legalNotice': 'कानूनी नोटिस',
    'docType.affidavit': 'शपथ पत्र',

    'category.police': 'पुलिस',
    'category.women': 'महिला हेल्पलाइन',
    'category.child': 'बाल हेल्पलाइन',
    'category.medical': 'चिकित्सा',
    'category.emergency': 'आपातकाल',
    'category.cyber': 'साइबर अपराध',
    'category.senior': 'वरिष्ठ नागरिक',
    'category.mentalHealth': 'मानसिक स्वास्थ्य',
    'category.legal': 'कानूनी सहायता',

    'loading.app': 'सहारा लोड हो रहा है...',

    'tts.play': 'सुनें',
    'tts.stop': 'रोकें',
  },

  kn: {
    'nav.title': 'ಸಹಾರಾ',
    'nav.subtitle': 'ನಿಮ್ಮ ಕಾನೂನು ಸಹಾಯಕ',
    'nav.documents': 'ದಾಖಲೆಗಳು',
    'nav.sos': 'SOS',

    'welcome.title': 'ನಮಸ್ಕಾರ! ನಾನು ಸಹಾರಾ',
    'welcome.subtitle': 'ನಿಮ್ಮ ಕಾನೂನು ಸಮಸ್ಯೆಯನ್ನು ನಿಮ್ಮ ಭಾಷೆಯಲ್ಲಿ ಹೇಳಿ — ನಾನು ನಿಮ್ಮ ಹಕ್ಕುಗಳನ್ನು ಸರಳ ಪದಗಳಲ್ಲಿ ವಿವರಿಸುತ್ತೇನೆ ಮತ್ತು ಕ್ರಮ ತೆಗೆದುಕೊಳ್ಳಲು ಸಹಾಯ ಮಾಡುತ್ತೇನೆ.',
    'welcome.suggested': 'ಸಲಹೆಗಳು',

    'chat.placeholder': 'ನಿಮ್ಮ ಕಾನೂನು ಸಮಸ್ಯೆಯನ್ನು ಹೇಳಿ...',
    'chat.disclaimer': 'ಸಹಾರಾ ಮಾಹಿತಿ ಉದ್ದೇಶಗಳಿಗಾಗಿ ಮಾತ್ರ. ಸಂಕೀರ್ಣ ವಿಷಯಗಳಿಗೆ ವಕೀಲರನ್ನು ಸಂಪರ್ಕಿಸಿ.',
    'chat.thinking': 'ಸಹಾರಾ ಯೋಚಿಸುತ್ತಿದೆ',
    'chat.voiceNotSupported': 'ಧ್ವನಿ ಬೆಂಬಲಿತವಾಗಿಲ್ಲ',
    'chat.listening': 'ಕೇಳುತ್ತಿದ್ದೇನೆ...',
    'chat.speakNow': 'ಈಗ ಮಾತನಾಡಿ',

    'prompt.landlord': 'ನನ್ನ ಮನೆಮಾಲೀಕ ನನ್ನನ್ನು ಹೊರಹಾಕುತ್ತಿದ್ದಾರೆ',
    'prompt.salary': 'ನನ್ನ ಉದ್ಯೋಗದಾತ ಸಂಬಳ ಕೊಟ್ಟಿಲ್ಲ',
    'prompt.police': 'ನಾನು ಪೊಲೀಸ್ ದೂರು ದಾಖಲಿಸಬೇಕು',
    'prompt.rights': 'ನನ್ನ ಮೂಲಭೂತ ಹಕ್ಕುಗಳು ಯಾವುವು?',

    'sidebar.history': 'ಚಾಟ್ ಇತಿಹಾಸ',
    'sidebar.newChat': 'ಹೊಸ ಚಾಟ್',
    'sidebar.noChats': 'ಯಾವುದೇ ಚಾಟ್ ಇಲ್ಲ',
    'sidebar.footer': 'ಭಾರತೀಯ ಕಾನೂನು ಸಹಾಯ',
    'sidebar.deleteConfirm': 'ಈ ಚಾಟ್ ಅನ್ನು ಅಳಿಸಲು ನೀವು ಖಚಿತವಾಗಿದ್ದೀರಾ?',
    'sidebar.deleteTitle': 'ಚಾಟ್ ಅಳಿಸಿ',
    'sidebar.cancel': 'ರದ್ದುಮಾಡಿ',
    'sidebar.delete': 'ಅಳಿಸಿ',

    'sos.title': 'ತುರ್ತು ಸಂಪರ್ಕಗಳು',
    'sos.subtitle': 'ತಕ್ಷಣ ಕರೆ ಮಾಡಲು ಟ್ಯಾಪ್ ಮಾಡಿ',
    'sos.womenSafety': 'ಮಹಿಳಾ ಸುರಕ್ಷತೆ',
    'sos.immediateEmergency': 'ತಕ್ಷಣದ ತುರ್ತು',
    'sos.otherContacts': 'ಇತರ ಸಂಪರ್ಕಗಳು',
    'sos.immediate': 'ತಕ್ಷಣ',
    'sos.footer': 'ಜೀವಕ್ಕೆ ಅಪಾಯಕಾರಿ ತುರ್ತು ಪರಿಸ್ಥಿತಿಯಲ್ಲಿ, ತಕ್ಷಣ 112 ಗೆ ಕರೆ ಮಾಡಿ.',
    'sos.callOnMobile': 'ಕರೆ ಮಾಡುವುದು ಮೊಬೈಲ್‌ನಲ್ಲಿ ಮಾತ್ರ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತದೆ 📱',

    'doc.title': 'ದಾಖಲೆ ಜನರೇಟರ್',
    'doc.subtitle': 'ನಿಮ್ಮ ವಿವರಗಳನ್ನು ನಮೂದಿಸಿ ಮತ್ತು AI-ಆಧಾರಿತ ಕಾನೂನು ದಾಖಲೆಗಳನ್ನು ಪಡೆಯಿರಿ',
    'doc.selectType': 'ದಾಖಲೆ ಪ್ರಕಾರವನ್ನು ಆಯ್ಕೆಮಾಡಿ',
    'doc.typeLabel': 'ದಾಖಲೆ ಪ್ರಕಾರ',
    'doc.detailsLabel': 'ಘಟನೆ/ಪ್ರಕರಣದ ವಿವರಗಳು',
    'doc.detailsPlaceholder': 'ಸಂಪೂರ್ಣ ವಿವರಗಳನ್ನು ನೀಡಿ: ಏನಾಯಿತು, ಯಾವಾಗ, ಎಲ್ಲಿ, ಯಾರು ಒಳಗೊಂಡಿದ್ದರು...',
    'doc.generate': 'ದಾಖಲೆ ರಚಿಸಿ',
    'doc.generating': 'ರಚಿಸಲಾಗುತ್ತಿದೆ...',
    'doc.generated': 'ರಚಿಸಲಾದ ದಾಖಲೆ',
    'doc.copy': 'ನಕಲಿಸಿ',
    'doc.copied': 'ನಕಲಿಸಲಾಗಿದೆ',
    'doc.download': 'ಡೌನ್‌ಲೋಡ್',
    'doc.print': 'ಮುದ್ರಿಸಿ',
    'doc.createNew': 'ಹೊಸ ದಾಖಲೆ ರಚಿಸಿ',

    'docType.fir': 'ಪ್ರಥಮ ಮಾಹಿತಿ ವರದಿ (FIR)',
    'docType.rti': 'RTI ಅರ್ಜಿ',
    'docType.consumer': 'ಗ್ರಾಹಕ ದೂರು',
    'docType.legalNotice': 'ಕಾನೂನು ನೋಟೀಸ್',
    'docType.affidavit': 'ಅಫಿಡವಿಟ್',

    'category.police': 'ಪೊಲೀಸ್',
    'category.women': 'ಮಹಿಳಾ ಹೆಲ್ಪ್‌ಲೈನ್',
    'category.child': 'ಮಕ್ಕಳ ಹೆಲ್ಪ್‌ಲೈನ್',
    'category.medical': 'ವೈದ್ಯಕೀಯ',
    'category.emergency': 'ತುರ್ತು',
    'category.cyber': 'ಸೈಬರ್ ಅಪರಾಧ',
    'category.senior': 'ಹಿರಿಯ ನಾಗರಿಕರು',
    'category.mentalHealth': 'ಮಾನಸಿಕ ಆರೋಗ್ಯ',
    'category.legal': 'ಕಾನೂನು ನೆರವು',

    'loading.app': 'ಸಹಾರಾ ಲೋಡ್ ಆಗುತ್ತಿದೆ...',

    'tts.play': 'ಆಲಿಸಿ',
    'tts.stop': 'ನಿಲ್ಲಿಸಿ',
  },

  te: {
    'nav.title': 'సహారా',
    'nav.subtitle': 'మీ చట్ట సహాయకుడు',
    'nav.documents': 'పత్రాలు',
    'nav.sos': 'SOS',

    'welcome.title': 'నమస్తే! నేను సహారా',
    'welcome.subtitle': 'మీ చట్టపరమైన సమస్యను మీ భాషలో చెప్పండి — నేను మీ హక్కులను సరళమైన పదాలలో వివరిస్తాను మరియు చర్య తీసుకోవడంలో సహాయం చేస్తాను.',
    'welcome.suggested': 'సూచనలు',

    'chat.placeholder': 'మీ చట్టపరమైన సమస్యను చెప్పండి...',
    'chat.disclaimer': 'సహారా సమాచార ప్రయోజనాల కోసం మాత్రమే. సంక్లిష్ట విషయాలకు న్యాయవాదిని సంప్రదించండి.',
    'chat.thinking': 'సహారా ఆలోచిస్తోంది',
    'chat.voiceNotSupported': 'వాయిస్ మద్దతు లేదు',
    'chat.listening': 'వింటున్నాను...',
    'chat.speakNow': 'ఇప్పుడు మాట్లాడండి',

    'prompt.landlord': 'నా ఇంటి యజమాని నన్ను బయటకు పంపుతున్నారు',
    'prompt.salary': 'నా యజమాని జీతం ఇవ్వలేదు',
    'prompt.police': 'నాకు పోలీసు ఫిర్యాదు చేయాలి',
    'prompt.rights': 'నా ప్రాథమిక హక్కులు ఏమిటి?',

    'sidebar.history': 'చాట్ చరిత్ర',
    'sidebar.newChat': 'కొత్త చాట్',
    'sidebar.noChats': 'చాట్‌లు లేవు',
    'sidebar.footer': 'భారతీయ చట్ట సహాయం',
    'sidebar.deleteConfirm': 'ఈ చాట్‌ను తొలగించాలనుకుంటున్నారా?',
    'sidebar.deleteTitle': 'చాట్ తొలగించు',
    'sidebar.cancel': 'రద్దు',
    'sidebar.delete': 'తొలగించు',

    'sos.title': 'అత్యవసర సంప్రదింపులు',
    'sos.subtitle': 'వెంటనే కాల్ చేయడానికి ట్యాప్ చేయండి',
    'sos.womenSafety': 'మహిళా భద్రత',
    'sos.immediateEmergency': 'తక్షణ అత్యవసరం',
    'sos.otherContacts': 'ఇతర సంప్రదింపులు',
    'sos.immediate': 'తక్షణం',
    'sos.footer': 'ప్రాణాపాయ అత్యవసర పరిస్థితిలో, వెంటనే 112 కు కాల్ చేయండి.',
    'sos.callOnMobile': 'కాలింగ్ మొబైల్‌లో మాత్రమే పనిచేస్తుంది 📱',

    'doc.title': 'పత్ర జనరేటర్',
    'doc.subtitle': 'మీ వివరాలను నమోదు చేసి AI-ఆధారిత చట్ట పత్రాలను పొందండి',
    'doc.selectType': 'పత్ర రకాన్ని ఎంచుకోండి',
    'doc.typeLabel': 'పత్ర రకం',
    'doc.detailsLabel': 'సంఘటన/కేసు వివరాలు',
    'doc.detailsPlaceholder': 'పూర్తి వివరాలు ఇవ్వండి: ఏమి జరిగింది, ఎప్పుడు, ఎక్కడ, ఎవరు పాల్గొన్నారు...',
    'doc.generate': 'పత్రం రూపొందించండి',
    'doc.generating': 'రూపొందిస్తోంది...',
    'doc.generated': 'రూపొందించిన పత్రం',
    'doc.copy': 'కాపీ',
    'doc.copied': 'కాపీ అయింది',
    'doc.download': 'డౌన్‌లోడ్',
    'doc.print': 'ప్రింట్',
    'doc.createNew': 'కొత్త పత్రం రూపొందించండి',

    'docType.fir': 'ప్రథమ సమాచార నివేదిక (FIR)',
    'docType.rti': 'RTI దరఖాస్తు',
    'docType.consumer': 'వినియోగదారు ఫిర్యాదు',
    'docType.legalNotice': 'చట్టపరమైన నోటీసు',
    'docType.affidavit': 'అఫిడవిట్',

    'category.police': 'పోలీసులు',
    'category.women': 'మహిళా హెల్ప్‌లైన్',
    'category.child': 'బాలల హెల్ప్‌లైన్',
    'category.medical': 'వైద్యం',
    'category.emergency': 'అత్యవసరం',
    'category.cyber': 'సైబర్ నేరం',
    'category.senior': 'వృద్ధ పౌరులు',
    'category.mentalHealth': 'మానసిక ఆరోగ్యం',
    'category.legal': 'చట్ట సహాయం',

    'loading.app': 'సహారా లోడ్ అవుతోంది...',

    'tts.play': 'వినండి',
    'tts.stop': 'ఆపండి',
  },

  ta: {
    'nav.title': 'சஹாரா',
    'nav.subtitle': 'உங்கள் சட்ட உதவியாளர்',
    'nav.documents': 'ஆவணங்கள்',
    'nav.sos': 'SOS',

    'welcome.title': 'வணக்கம்! நான் சஹாரா',
    'welcome.subtitle': 'உங்கள் சட்டப் பிரச்சனையை உங்கள் மொழியில் சொல்லுங்கள் — நான் உங்கள் உரிமைகளை எளிய வார்த்தைகளில் விளக்கி நடவடிக்கை எடுக்க உதவுவேன்.',
    'welcome.suggested': 'பரிந்துரைகள்',

    'chat.placeholder': 'உங்கள் சட்டப் பிரச்சனையைச் சொல்லுங்கள்...',
    'chat.disclaimer': 'சஹாரா தகவல் நோக்கங்களுக்காக மட்டுமே. சிக்கலான விஷயங்களுக்கு வழக்கறிஞரை அணுகுங்கள்.',
    'chat.thinking': 'சஹாரா யோசிக்கிறது',
    'chat.voiceNotSupported': 'குரல் ஆதரிக்கப்படவில்லை',
    'chat.listening': 'கேட்கிறேன்...',
    'chat.speakNow': 'இப்போது பேசுங்கள்',

    'prompt.landlord': 'என் வீட்டு உரிமையாளர் என்னை வெளியேற்றுகிறார்',
    'prompt.salary': 'என் முதலாளி சம்பளம் கொடுக்கவில்லை',
    'prompt.police': 'எனக்கு காவல் புகார் பதிவு செய்ய வேண்டும்',
    'prompt.rights': 'என் அடிப்படை உரிமைகள் என்ன?',

    'sidebar.history': 'உரையாடல் வரலாறு',
    'sidebar.newChat': 'புதிய உரையாடல்',
    'sidebar.noChats': 'உரையாடல்கள் இல்லை',
    'sidebar.footer': 'இந்திய சட்ட உதவி',
    'sidebar.deleteConfirm': 'இந்த உரையாடலை நீக்க விரும்புகிறீர்களா?',
    'sidebar.deleteTitle': 'உரையாடல் நீக்கு',
    'sidebar.cancel': 'ரத்து',
    'sidebar.delete': 'நீக்கு',

    'sos.title': 'அவசர தொடர்புகள்',
    'sos.subtitle': 'உடனடியாக அழைக்க தட்டவும்',
    'sos.womenSafety': 'பெண்கள் பாதுகாப்பு',
    'sos.immediateEmergency': 'உடனடி அவசரநிலை',
    'sos.otherContacts': 'இதர தொடர்புகள்',
    'sos.immediate': 'உடனடி',
    'sos.footer': 'உயிருக்கு ஆபத்தான அவசரநிலையில், உடனடியாக 112 ஐ அழைக்கவும்.',
    'sos.callOnMobile': 'அழைப்பு மொபைலில் மட்டுமே செயல்படும் 📱',

    'doc.title': 'ஆவண உருவாக்கி',
    'doc.subtitle': 'உங்கள் விவரங்களை உள்ளிட்டு AI-இயங்கும் சட்ட ஆவணங்களைப் பெறுங்கள்',
    'doc.selectType': 'ஆவண வகையைத் தேர்ந்தெடுக்கவும்',
    'doc.typeLabel': 'ஆவண வகை',
    'doc.detailsLabel': 'சம்பவம்/வழக்கு விவரங்கள்',
    'doc.detailsPlaceholder': 'முழு விவரங்களை அளிக்கவும்: என்ன நடந்தது, எப்போது, எங்கே, யார் சம்பந்தப்பட்டனர்...',
    'doc.generate': 'ஆவணத்தை உருவாக்கு',
    'doc.generating': 'உருவாக்கப்படுகிறது...',
    'doc.generated': 'உருவாக்கப்பட்ட ஆவணம்',
    'doc.copy': 'நகலெடு',
    'doc.copied': 'நகலெடுக்கப்பட்டது',
    'doc.download': 'பதிவிறக்கம்',
    'doc.print': 'அச்சிடு',
    'doc.createNew': 'புதிய ஆவணம் உருவாக்கு',

    'docType.fir': 'முதல் தகவல் அறிக்கை (FIR)',
    'docType.rti': 'RTI விண்ணப்பம்',
    'docType.consumer': 'நுகர்வோர் புகார்',
    'docType.legalNotice': 'சட்ட நோட்டீஸ்',
    'docType.affidavit': 'சத்தியப் பிரமாணம்',

    'category.police': 'காவல்',
    'category.women': 'பெண்கள் உதவி எண்',
    'category.child': 'குழந்தை உதவி எண்',
    'category.medical': 'மருத்துவம்',
    'category.emergency': 'அவசரநிலை',
    'category.cyber': 'சைபர் குற்றம்',
    'category.senior': 'மூத்த குடிமக்கள்',
    'category.mentalHealth': 'மன நலம்',
    'category.legal': 'சட்ட உதவி',

    'loading.app': 'சஹாரா ஏற்றப்படுகிறது...',

    'tts.play': 'கேளுங்கள்',
    'tts.stop': 'நிறுத்து',
  },
}

export type TranslationKey = keyof TranslationKeys

export function getTranslation(lang: Language, key: TranslationKey): string {
  return translations[lang]?.[key] || translations.en[key] || key
}

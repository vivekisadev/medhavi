export type Language = 'en' | 'hi';

type Translations = Record<string, Record<Language, string>>;

export const t: Translations = {
  'nav.signin': { en: 'Sign in', hi: 'साइन इन करें' },
  'nav.getstarted': { en: 'Get Started', hi: 'शुरू करें' },
  'hero.title1': { en: 'Scholarship Management', hi: 'छात्रवृत्ति प्रबंधन' },
  'hero.title2': { en: 'for Scheduled Tribes', hi: 'अनुसूचित जनजातियों के लिए' },
  'hero.subtitle': { 
    en: 'AI-powered platform enabling seamless scholarship and fellowship applications for ST students under the Ministry of Tribal Affairs.', 
    hi: 'जनजातीय कार्य मंत्रालय के तहत एसटी छात्रों के लिए निर्बाध छात्रवृत्ति और फेलोशिप आवेदन सक्षम करने वाला एआई-संचालित प्लेटफॉर्म।' 
  },
  'hero.cta1': { en: 'Start Application', hi: 'आवेदन शुरू करें' },
  'hero.cta2': { en: 'View Schemes', hi: 'योजनाएं देखें' },
  'stats.students': { en: 'Students Supported', hi: 'समर्थित छात्र' },
  'stats.disbursed': { en: 'Amount disbursed', hi: 'वितरित राशि' },
  'stats.universities': { en: 'Partner Universities', hi: 'भागीदार विश्वविद्यालय' },
  'stats.accuracy': { en: 'Verification Accuracy', hi: 'सत्यापन सटीकता' },
  'features.title': { en: 'Built for Trust', hi: 'विश्वास के लिए निर्मित' },
  'features.subtitle': { en: 'Enterprise-grade AI verification meets student-first design', hi: 'एंटरप्राइज़-ग्रेड एआई सत्यापन के साथ छात्र-प्रथम डिज़ाइन' },
  'dashboard.title': { en: 'Student Dashboard', hi: 'छात्र डैशबोर्ड' },
  'dashboard.welcome': { en: 'Welcome back!', hi: 'वापसी पर स्वागत है!' },
  'lang.en': { en: 'English', hi: 'अंग्रेज़ी' },
  'lang.hi': { en: 'Hindi', hi: 'हिंदी' }
};

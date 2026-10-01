import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SupportedLanguage, SUPPORTED_LANGUAGES } from './types';
import { translations } from './translations';

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  dir: 'ltr' | 'rtl';
  isRTL: boolean;
  t: (key: string, params?: Record<string, string | number>) => string;
  translateCategory: (category: string | null | undefined) => string;
  translateBin: (category: string | null | undefined) => string;
  translateDynamicText: (text: string | null | undefined) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'smartwaste-lang';

// Common dynamic pattern translations for AI outputs across Marathi, Hindi, and Urdu
const DYNAMIC_PHRASES: Record<string, Record<SupportedLanguage, string>> = {
  // Common Items
  'PET Beverage Bottle': {
    en: 'PET Beverage Bottle',
    mr: 'पीईटी पाण्याची बाटली',
    hi: 'पीईटी पानी की बोतल',
    ur: 'پی ای ٹی پانی کی بوتل',
  },
  'Plastic Bottle': {
    en: 'Plastic Bottle',
    mr: 'प्लास्टिकची बाटली',
    hi: 'प्लास्टिक की बोतल',
    ur: 'پلاسٹک کی بوتل',
  },
  'PET Water Bottle': {
    en: 'PET Water Bottle',
    mr: 'पीईटी पाण्याची बाटली',
    hi: 'पीईटी पानी की बोतल',
    ur: 'پی ای ٹی پانی کی بوتل',
  },
  'Corrugated Shipping Box': {
    en: 'Corrugated Shipping Box',
    mr: 'पुठ्ठ्याचा पार्सल बॉक्स (खोका)',
    hi: 'कार्डबोर्ड शिपिंग बॉक्स (डिब्बा)',
    ur: 'گتے کا ڈبہ',
  },
  'Cardboard Box': {
    en: 'Cardboard Box',
    mr: 'पुठ्ठ्याचा बॉक्स (खोका)',
    hi: 'कार्डबोर्ड बॉक्स (डिब्बा)',
    ur: 'گتے کا ڈبہ',
  },
  'Aluminum Beverage Can': {
    en: 'Aluminum Beverage Can',
    mr: 'अल्युमिनियम शीतपेय कॅन',
    hi: 'एल्युमिनियम पेय कैन',
    ur: 'ایلومینیم بیوریج کین',
  },
  'Soda Can': {
    en: 'Soda Can',
    mr: 'सोड्याचा अल्युमिनियम कॅन',
    hi: 'सोडा का एल्युमिनियम कैन',
    ur: 'سوڈا کین',
  },
  'Fresh Banana Peel': {
    en: 'Fresh Banana Peel',
    mr: 'केळाची साल',
    hi: 'केले का छिलका',
    ur: 'کیلے کا چھلکا',
  },
  'Banana Peel': {
    en: 'Banana Peel',
    mr: 'केळाची साल',
    hi: 'केले का छिलका',
    ur: 'کیلے کا چھلکا',
  },
  'Clear Glass Condiment Jar': {
    en: 'Clear Glass Condiment Jar',
    mr: 'काचेची पारदर्शक बरणी',
    hi: 'कांच का पारदर्शी जार',
    ur: 'شیشے کا مرتبان',
  },
  'Glass Jar': {
    en: 'Glass Jar',
    mr: 'काचेची बरणी',
    hi: 'कांच का जार',
    ur: 'شیشے کا مرتبان',
  },
  'Used Smartphone / Mobile Device': {
    en: 'Used Smartphone / Mobile Device',
    mr: 'जुना स्मार्टफोन / मोबाईल (ई-कचरा)',
    hi: 'पुराना स्मार्टफोन / मोबाइल (ई-कचरा)',
    ur: 'پرانا اسمارٹ فون (ای-ویسٹ)',
  },
  'Old Phone': {
    en: 'Old Phone (E-Waste)',
    mr: 'जुना फोन (ई-कचरा)',
    hi: 'पुराना फोन (ई-कचरा)',
    ur: 'پرانا فون (ای-ویسٹ)',
  },
  'Cotton Graphic T-Shirt': {
    en: 'Cotton Graphic T-Shirt',
    mr: 'सुती टी-शर्ट (कापड)',
    hi: 'सूती टी-शर्ट (कपड़ा)',
    ur: 'سوتی ٹی شرٹ (کپڑے)',
  },
  'T-Shirt': {
    en: 'T-Shirt (Textile)',
    mr: 'टी-शर्ट (कापड कचरा)',
    hi: 'टी-शर्ट (कपड़ा कचरा)',
    ur: 'ٹی شرٹ (کپڑے)',
  },
  'Alkaline AA Battery Cell': {
    en: 'Alkaline AA Battery Cell',
    mr: 'अल्कधर्मी एए बॅटरी सेल',
    hi: 'एए एल्कलाइन बैटरी सेल',
    ur: 'اے اے الکلائن بیٹری',
  },
  'AA Battery': {
    en: 'AA Battery',
    mr: 'एए बॅटरी (घातक)',
    hi: 'एए बैटरी (खतरनाक)',
    ur: 'اے اے بیٹری (خطرناک)',
  },
  'Industrial Paint / Solvent Canister': {
    en: 'Industrial Paint / Solvent Canister',
    mr: 'रंग / सॉल्व्हेंटचा डबा (घातक)',
    hi: 'पेंट / विलायक का डिब्बा (खतरनाक)',
    ur: 'پینٹ / کیمیکل ڈبہ (خطرناک)',
  },
  'Paint Can': {
    en: 'Paint Can (Hazardous)',
    mr: 'रंगाचा डबा (घातक कचरा)',
    hi: 'पेंट का डिब्बा (खतरनाक कचरा)',
    ur: 'پینٹ کا ڈبہ (خطرناک فضلہ)',
  },
  // Contamination notes
  'Possible food residue appears to be present': {
    en: 'Possible food residue appears to be present. Rinse before placing in recycling stream.',
    mr: 'अन्नाचे संभाव्य अवशेष आढळले आहेत. पुनर्वापरात टाकण्यापूर्वी कृपया स्वच्छ धुवून घ्या.',
    hi: 'भोजन के संभावित अवशेष मौजूद हैं। पुनर्चक्रण में डालने से पहले धो लें।',
    ur: 'کھانے کے ممکنہ ذرات موجود ہیں۔ ری سائیکلنگ میں ڈالنے سے پہلے دھو لیں۔',
  },
  'No obvious contamination detected': {
    en: 'No obvious contamination detected. Suitable for designated segregation stream.',
    mr: 'कोणतीही दूषितता आढळली नाही. नियुक्त पुनर्वापर प्रवाहासाठी योग्य.',
    hi: 'कोई स्पष्ट संदूषण नहीं मिला। निर्दिष्ट पृथक्करण धारा के लिए उपयुक्त।',
    ur: 'کوئی ظاہری آلودگی نہیں پائی گئی۔ نامزد علیحدگی کے لیے موزوں ہے۔',
  },
  'Possible contamination detected': {
    en: 'Possible contamination detected',
    mr: 'संभाव्य दूषितता आढळली',
    hi: 'संभावित संदूषण का पता चला',
    ur: 'ممکنہ آلودگی کا پتہ چلا',
  }
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && (saved === 'en' || saved === 'mr' || saved === 'hi' || saved === 'ur')) {
        return saved as SupportedLanguage;
      }
    }
    return 'en';
  });

  const currentLangInfo = SUPPORTED_LANGUAGES.find(l => l.code === language) || SUPPORTED_LANGUAGES[0];
  const dir = currentLangInfo.dir;
  const isRTL = dir === 'rtl';

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, language);
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
      document.documentElement.dir = dir;
      // Add or remove rtl class on body for Tailwind directional styling
      if (isRTL) {
        document.body.classList.add('rtl-mode');
      } else {
        document.body.classList.remove('rtl-mode');
      }
    }
  }, [language, dir, isRTL]);

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
  };

  const t = (key: string, params?: Record<string, string | number>): string => {
    const langDict = translations[language] || translations.en;
    let text = langDict[key] || translations.en[key] || key;

    if (params) {
      Object.entries(params).forEach(([paramKey, val]) => {
        text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(val));
      });
    }

    return text;
  };

  const translateCategory = (cat: string | null | undefined): string => {
    if (!cat) return t('cat.other');
    const key = `cat.${cat.toLowerCase()}`;
    return t(key);
  };

  const translateBin = (cat: string | null | undefined): string => {
    if (!cat) return t('bin.other');
    const key = `bin.${cat.toLowerCase()}`;
    return t(key);
  };

  const translateDynamicText = (text: string | null | undefined): string => {
    if (!text) return '';
    if (language === 'en') return text;

    // Check exact or partial match in dynamic phrases
    for (const [phrase, transObj] of Object.entries(DYNAMIC_PHRASES)) {
      if (text.toLowerCase().includes(phrase.toLowerCase())) {
        return transObj[language] || text;
      }
    }

    return text;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        dir,
        isRTL,
        t,
        translateCategory,
        translateBin,
        translateDynamicText,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

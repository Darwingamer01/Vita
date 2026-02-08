'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'hi';

type Translations = {
    [key in Language]: {
        heroTitle: string;
        heroSubtitle: string;
        heroDesc: string;
        ctaStart: string;
        ctaMap: string;
        trustedBy: string;
        featureMapTitle: string;
        featureMapDesc: string;
        featureAITitle: string;
        featureAIDesc: string;
        featureEcoTitle: string;
        featureEcoDesc: string;
        emergencyTitle: string;
        emergencyDesc: string;
        sosButton: string;
    };
};

const translations: Translations = {
    en: {
        heroTitle: "Vita Saves",
        heroSubtitle: "Lives Fast.",
        heroDesc: "One unified network for every emergency. Real-time. Intelligent. Verified.",
        ctaStart: "Get Started Now",
        ctaMap: "Explore Master Map",
        trustedBy: "TRUSTED BY 50+ NETWORKS",
        featureMapTitle: "God-Mode Visibility.",
        featureMapDesc: "The fog of war is gone. Identify critical resources with sub-second latency across 18 infrastructure layers.",
        featureAITitle: "Neural Prediction.",
        featureAIDesc: "Processing millions of data points to predict shortages and triage patients before they even reach the ER.",
        featureEcoTitle: "The Complete Ecosystem",
        featureEcoDesc: "Connected intelligence for every stakeholder.",
        emergencyTitle: "Emergency? Don't Wait.",
        emergencyDesc: "Skip the login. Trigger the network immediately.",
        sosButton: "TRIGGER SOS",
    },
    hi: {
        heroTitle: "वीटा बचाता है",
        heroSubtitle: "जीवन तेज़ी से।",
        heroDesc: "हर आपात स्थिति के लिए एक एकीकृत नेटवर्क। वास्तविक समय। बुद्धिमान। सत्यापित।",
        ctaStart: "अभी शुरू करें",
        ctaMap: "मास्टर मैप देखें",
        trustedBy: "50+ नेटवर्क द्वारा विश्वसनीय",
        featureMapTitle: "संपूर्ण दृश्यता।",
        featureMapDesc: "अनिश्चितता खत्म। 18 इंफ्रास्ट्रक्चर लेयर्स पर महत्वपूर्ण संसाधनों की तुरंत पहचान करें।",
        featureAITitle: "न्यूरल प्रेडिक्शन।",
        featureAIDesc: "अस्पताल पहुंचने से पहले ही मरीजों की ट्राइएज और कमी की भविष्यवाणी करने के लिए डेटा का विश्लेषण।",
        featureEcoTitle: "पूर्ण पारिस्थितिकी तंत्र",
        featureEcoDesc: "हर हितधारक के लिए जुड़ी हुई बुद्धिमत्ता।",
        emergencyTitle: "आपातकाल? प्रतीक्षा न करें।",
        emergencyDesc: "लॉगिन छोड़ें। नेटवर्क को तुरंत ट्रिगर करें।",
        sosButton: "SOS भेजें",
    }
};

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: Translations['en'];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguage] = useState<Language>('en');

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t: translations[language] }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}

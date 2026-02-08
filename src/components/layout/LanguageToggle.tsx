'use client';

import { useLanguage } from '@/lib/i18n';

export default function LanguageToggle() {
    const { language, setLanguage } = useLanguage();

    return (
        <div className="fixed top-6 right-6 z-50 flex items-center bg-black/30 backdrop-blur-md rounded-full border border-white/10 p-1">
            <button
                onClick={() => setLanguage('en')}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${language === 'en'
                        ? 'bg-white text-black shadow-lg'
                        : 'text-gray-400 hover:text-white'
                    }`}
            >
                EN
            </button>
            <button
                onClick={() => setLanguage('hi')}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${language === 'hi'
                        ? 'bg-white text-black shadow-lg'
                        : 'text-gray-400 hover:text-white'
                    }`}
            >
                HI
            </button>
        </div>
    );
}

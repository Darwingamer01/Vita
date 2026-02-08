'use client';

import { useState, useEffect } from 'react';
import { Mic, X, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function VoiceSearch() {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (!isOpen) {
            setTranscript('');
            setIsListening(false);
            return;
        }

        let recognition: any;
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = true;
            recognition.lang = 'en-US';

            recognition.onstart = () => setIsListening(true);
            recognition.onresult = (event: any) => {
                const current = event.resultIndex;
                const transcriptText = event.results[current][0].transcript;
                setTranscript(transcriptText);
            };
            recognition.onend = () => {
                setIsListening(false);
                if (transcript) {
                    handleSearch(transcript);
                }
            };

            recognition.start();
        } else {
            alert('Voice recognition not supported in this browser.');
            setIsOpen(false);
        }

        return () => {
            if (recognition) recognition.stop();
        };
    }, [isOpen]);

    const handleSearch = (query: string) => {
        // Simple keyword mapping for v4.0 demo
        const lower = query.toLowerCase();
        if (lower.includes('hospital') || lower.includes('bed')) router.push('/hospital');
        else if (lower.includes('doctor')) router.push('/doctor');
        else if (lower.includes('medicine')) router.push('/medicine');
        else if (lower.includes('ambulance')) router.push('/map'); // Map shows ambulances
        else if (lower.includes('police')) router.push('/services');
        else if (lower.includes('blood')) router.push('/bloodbank');
        else {
            // Fallback to map search or specialized search page (stub for now)
            alert(`Searching for: ${query}`);
        }
        setIsOpen(false);
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="btn btn-ghost btn-circle text-[var(--foreground)]"
                aria-label="Voice Search"
            >
                <Mic size={20} />
            </button>

            {isOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl flex flex-col items-center animate-in fade-in zoom-in duration-200">
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            <X size={20} />
                        </button>

                        <div className={`p-4 rounded-full mb-4 transition-colors duration-500 ${isListening ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-gray-100 text-gray-500'}`}>
                            {isListening ? <Mic size={48} /> : <Loader2 size={48} className="animate-spin" />}
                        </div>

                        <h3 className="text-xl font-bold mb-2">
                            {isListening ? 'Listening...' : 'Processing...'}
                        </h3>

                        <p className="text-center text-gray-500 min-h-[1.5em] text-lg font-medium">
                            {transcript || "Speak now..."}
                        </p>

                        <p className="text-xs text-gray-400 mt-6">
                            Try saying "Find hospitals nearby" or "I need oxygen"
                        </p>
                    </div>
                </div>
            )}
        </>
    );
}

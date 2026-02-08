'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type Message = {
    id: string;
    text: string;
    sender: 'user' | 'bot';
    timestamp: Date;
    actions?: { label: string; url: string }[];
};

interface ChatWidgetProps {
    isOpen?: boolean;
    onClose?: () => void;
    showTrigger?: boolean;
}

export default function ChatWidget({ isOpen: externalIsOpen, onClose, showTrigger = true }: ChatWidgetProps = {}) {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', text: 'Hi there! I\'m Vee, your personal health assistant. How can I help you? (Try "Need blood", "oxygen", or "ambulance")', sender: 'bot', timestamp: new Date() }
    ]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Sync external state if provided
    useEffect(() => {
        if (typeof externalIsOpen === 'boolean') {
            setIsOpen(externalIsOpen);
        }
    }, [externalIsOpen]);

    const toggleOpen = () => {
        const newState = !isOpen;
        setIsOpen(newState);
        if (!newState && onClose) onClose();
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, loading]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            text: input,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMsg.text })
            });

            if (!res.ok) throw new Error('API Error');

            const data = await res.json();

            const botMsg: Message = {
                id: (Date.now() + 1).toString(),
                text: data.reply,
                sender: 'bot',
                timestamp: new Date(),
                actions: data.actions
            };

            setMessages(prev => [...prev, botMsg]);
        } catch (error) {
            const errorMsg: Message = {
                id: (Date.now() + 1).toString(),
                text: "I'm having trouble connecting to the server. Please try again later.",
                sender: 'bot',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Toggle Button */}
            {showTrigger && (
                <button
                    onClick={toggleOpen}
                    className="fixed bottom-6 right-6 z-[100] group"
                >
                    <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-20 group-hover:opacity-40 transition-opacity"></div>
                    <div className="relative p-4 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-full shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center">
                        {isOpen ? <X size={24} /> : <Bot size={26} className="animate-pulse" />}
                    </div>
                </button>
            )}

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 40, scale: 0.9, rotateX: 10 }}
                        animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
                        exit={{ opacity: 0, y: 40, scale: 0.9, rotateX: 10 }}
                        transition={{ type: "spring", duration: 0.6, bounce: 0.25 }}
                        className="fixed bottom-24 right-6 z-[100] w-80 md:w-[24rem] h-[600px] max-h-[80vh] bg-white/95 backdrop-blur-xl rounded-[32px] shadow-2xl border border-white/20 flex flex-col overflow-hidden ring-1 ring-black/5"
                    >
                        {/* Header with Pattern */}
                        <div className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 p-6 flex items-center justify-between shrink-0 overflow-hidden">
                            {/* Decorative Circles */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                            <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-400/20 rounded-full blur-xl translate-y-1/2 -translate-x-1/2"></div>

                            <div className="relative flex items-center gap-4">
                                <div className="relative">
                                    <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20 shadow-inner">
                                        <Bot size={24} className="drop-shadow-sm" />
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-[3px] border-indigo-600 rounded-full"></div>
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-xl tracking-tight leading-none">Vee</h3>
                                    <p className="text-blue-100 text-xs font-medium mt-1 opacity-90">Medical Assistant</p>
                                </div>
                            </div>
                            <button
                                onClick={toggleOpen}
                                className="relative text-white/80 hover:text-white transition-colors bg-white/10 hover:bg-white/20 p-2 rounded-full backdrop-blur-md group"
                            >
                                <X size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                            </button>
                        </div>

                        {/* Messages Area with BG Pattern */}
                        <div className="flex-1 overflow-y-auto p-5 space-y-6 scroll-smooth custom-scrollbar relative">
                            {/* Subtle Grid Pattern Background */}
                            <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
                                style={{
                                    backgroundImage: 'radial-gradient(circle, #3b82f6 1px, transparent 1px)',
                                    backgroundSize: '20px 20px'
                                }}
                            ></div>

                            {messages.map(msg => (
                                <motion.div
                                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    key={msg.id}
                                    className={`relative flex items-end gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
                                >
                                    {msg.sender === 'bot' && (
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-blue-500 flex-shrink-0 flex items-center justify-center text-white shadow-md text-[10px] font-bold border-2 border-white ring-1 ring-blue-100">
                                            Vee
                                        </div>
                                    )}
                                    <div
                                        className={`max-w-[75%] p-4 rounded-2xl text-[14px] leading-relaxed shadow-sm relative group ${msg.sender === 'user'
                                            ? 'bg-gradient-to-tr from-blue-600 to-blue-500 text-white rounded-br-none'
                                            : 'bg-white border border-gray-100 text-gray-700 rounded-bl-none shadow-[0_2px_8px_rgba(0,0,0,0.04)]'
                                            }`}
                                    >
                                        <div dangerouslySetInnerHTML={{ __html: msg.text }} />

                                        {msg.actions && msg.actions.length > 0 && (
                                            <div className="mt-4 flex flex-wrap gap-2">
                                                {msg.actions.map((action, idx) => (
                                                    <a
                                                        key={idx}
                                                        href={action.url}
                                                        className="flex-1 min-w-[120px] text-center py-2.5 px-3 bg-blue-50/80 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl transition-all border border-blue-100 hover:border-blue-200 hover:shadow-sm"
                                                    >
                                                        {action.label}
                                                    </a>
                                                ))}
                                            </div>
                                        )}

                                        <span className={`text-[10px] absolute -bottom-5 ${msg.sender === 'user' ? 'right-0' : 'left-0'} text-gray-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap`}>
                                            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </motion.div>
                            ))}
                            {loading && (
                                <div className="flex items-end gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-blue-500 flex items-center justify-center text-white shadow-md text-[10px] border-2 border-white">
                                        Vee
                                    </div>
                                    <div className="bg-white border border-gray-100 p-4 rounded-2xl rounded-bl-none shadow-sm">
                                        <div className="flex gap-1.5">
                                            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDuration: '0.8s', animationDelay: '0ms' }}></span>
                                            <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDuration: '0.8s', animationDelay: '150ms' }}></span>
                                            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDuration: '0.8s', animationDelay: '300ms' }}></span>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-white/80 backdrop-blur-md border-t border-gray-100 flex items-center gap-2 shrink-0">
                            <form
                                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                                className="flex-1 flex items-center gap-2 bg-gray-100 hover:bg-white focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100 transition-all rounded-full px-2 py-2 border border-transparent focus-within:border-blue-200 focus-within:shadow-sm"
                            >
                                <div className="pl-3 text-gray-400">
                                    <Bot size={16} />
                                </div>
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Type your emergency..."
                                    className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-gray-800 placeholder-gray-400 px-2"
                                />
                                <button
                                    type="submit"
                                    disabled={!input.trim()}
                                    className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md hover:scale-105 transition-all active:scale-95"
                                >
                                    <Send size={16} />
                                </button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence >
        </>
    );
}

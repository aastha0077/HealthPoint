import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const HOSPITAL_SYSTEM_PROMPT = `You are the AI assistant for HealthPoint Medical Center. 
Respond helpfully, politely, and extremely concisely. 
Limit your response to 2-3 sentences max.
For medical emergencies, always visit the ER immediately.`;

const QUICK_QUESTIONS = [
    "What departments are available?",
    "How do I book an appointment?",
    "What are the visiting hours?",
    "Is there emergency service?",
    "What are the lab test services?",
    "How do I contact the hospital?",
    "What is the hospital location?",
    "Are doctors available on weekends?",
];

export function GeminiChatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<{ sender: 'user' | 'bot'; text: string }[]>([
        { sender: 'bot', text: '👋 Hello! I\'m the assistant at **HealthPoint Medical Center**. How can I help you today? You can also tap a quick question below!' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showQuickQ, setShowQuickQ] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    const sendMessage = async (text: string) => {
        if (!text.trim()) return;
        setShowQuickQ(false);

        const userMsg = text.trim();
        setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
        setInput('');
        setIsLoading(true);

        try {
            const fullPrompt = `${HOSPITAL_SYSTEM_PROMPT}\n\nUser question: ${userMsg}`;
            const res = await axios.post('http://localhost:8000/api/chat/gemini', { prompt: fullPrompt });
            setMessages(prev => [...prev, { sender: 'bot', text: res.data.reply || 'I\'m sorry, I couldn\'t get a response.' }]);
        } catch {
            setMessages(prev => [...prev, {
                sender: 'bot',
                text: 'I\'m having trouble connecting right now. For urgent queries, please call **071-XXXXXX** or visit our reception desk.'
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const renderText = (text: string) => {
        // Simple bold markdown renderer
        return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
            part.startsWith('**') && part.endsWith('**')
                ? <strong key={i}>{part.slice(2, -2)}</strong>
                : part
        );
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        transition={{ duration: 0.2 }}
                        className="mb-4 bg-white rounded-2xl shadow-2xl border border-rose-100 overflow-hidden flex flex-col"
                        style={{ width: '360px', height: '520px' }}
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-rose-600 to-rose-500 text-white p-4 flex justify-between items-center flex-shrink-0">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                                    <MessageCircle size={18} />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-sm">Hospital Assistant</h3>
                                    <p className="text-xs text-rose-100">HealthPoint Medical Center</p>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1.5 rounded-full transition-colors">
                                <X size={18} />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-rose-50/30">
                            {messages.map((msg, i) => (
                                <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    {msg.sender === 'bot' && (
                                        <div className="w-7 h-7 rounded-full bg-rose-500 flex items-center justify-center text-white text-xs mr-2 flex-shrink-0 mt-1">🏥</div>
                                    )}
                                    <div className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed
                    ${msg.sender === 'user'
                                            ? 'bg-rose-500 text-white rounded-tr-sm'
                                            : 'bg-white text-slate-700 rounded-tl-sm border border-rose-100 shadow-sm'}`}>
                                        {renderText(msg.text)}
                                    </div>
                                </div>
                            ))}

                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="w-7 h-7 rounded-full bg-rose-500 flex items-center justify-center text-white text-xs mr-2 flex-shrink-0">🏥</div>
                                    <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 border border-rose-100 shadow-sm">
                                        <div className="flex gap-1.5 items-center h-4">
                                            <div className="w-2 h-2 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                            <div className="w-2 h-2 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                            <div className="w-2 h-2 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Quick Questions */}
                        {showQuickQ && (
                            <div className="px-3 py-2 bg-white border-t border-rose-50 flex-shrink-0">
                                <button
                                    onClick={() => setShowQuickQ(false)}
                                    className="text-xs text-rose-400 flex items-center gap-1 mb-2 hover:text-rose-600 transition-colors"
                                >
                                    <ChevronDown size={12} /> Quick questions
                                </button>
                                <div className="flex gap-1.5 flex-wrap max-h-20 overflow-y-auto pb-1">
                                    {QUICK_QUESTIONS.map((q, i) => (
                                        <button
                                            key={i}
                                            onClick={() => sendMessage(q)}
                                            className="text-xs px-2.5 py-1 bg-rose-50 border border-rose-200 text-rose-600 rounded-full hover:bg-rose-100 transition-colors whitespace-nowrap"
                                        >
                                            {q}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Input */}
                        <div className="p-3 bg-white border-t border-rose-100 flex gap-2 flex-shrink-0">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
                                placeholder="Type your question..."
                                className="flex-1 py-2 px-4 bg-rose-50 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 border border-rose-100 transition-all"
                            />
                            <button
                                onClick={() => sendMessage(input)}
                                disabled={isLoading || !input.trim()}
                                className="bg-rose-500 text-white p-2.5 rounded-full hover:bg-rose-600 disabled:opacity-50 transition-all hover:scale-105"
                            >
                                <Send size={16} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toggle button */}
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(v => !v)}
                className="bg-gradient-to-br from-rose-500 to-rose-600 text-white p-4 rounded-full shadow-lg shadow-rose-300 flex items-center gap-2 hover:shadow-rose-400 transition-shadow"
            >
                {isOpen ? <X size={22} /> : <MessageCircle size={22} />}
                {!isOpen && <span className="text-sm font-semibold pr-1">Ask Us</span>}
            </motion.button>
        </div>
    );
}

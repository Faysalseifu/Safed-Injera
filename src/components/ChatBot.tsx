import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// API Key - In production this should be in .env, using here for demo as requested
const GEMINI_API_KEY = "AIzaSyC49Gt3KjfkCe3aEyEHSBAY-JRH9vUOa7U";

const SYSTEM_PROMPT = `
You are the helpful AI customer support assistant for "Safed Injera".
Your goal is to answer questions about our product, pricing, and services.

KEY INFORMATION:
- Product: Premium Quality Pure Teff Injera (100% Teff).
- Price: 1 Injera = 25 ETB (Ethiopian Birr).
- Discounts: We offer discounts for bulk orders (Hotels, Restaurants, Supermarkets). The specific discount depends on the volume.
- Services: We provide delivery for bulk orders. We accept international orders for export.
- Location: Ethiopia.
- Contact: +251 92 221 2161 or +251 95 386 6041.

GUIDELINES:
- Be polite, professional, and concise.
- If asked about specific bulk discount rates, ask them to contact our sales team at the provided phone numbers for a quote.
- Emphasize the "Pure Teff" and "Quality" aspects.
- Do not make up facts not listed here.
`;

const ChatBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, text: "👋 Hi there! I'm your Safed Assistant. Ask me about our pure teff injera or pricing!", isUser: false }
    ]);
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim() || isLoading) return;

        // Add user message
        const userMsg = { id: Date.now(), text: inputValue, isUser: true };
        setMessages(prev => [...prev, userMsg]);
        setInputValue("");
        setIsLoading(true);

        try {
            // Prepare context history for the API
            // We pass the system prompt first, then recent conversation history
            const history = messages.slice(-6).map(m => ({
                role: m.isUser ? "user" : "model",
                parts: [{ text: m.text }]
            }));

            const payload = {
                contents: [
                    ...history,
                    {
                        role: "user",
                        parts: [{ text: SYSTEM_PROMPT + "\n\nUser Question: " + (history.length === 0 ? userMsg.text : userMsg.text + " (Answer based on system context provided earlier)") }]
                    }
                ]
            };

            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(payload)
                }
            );

            const data = await response.json();

            if (data.error) {
                throw new Error(data.error.message);
            }

            const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry, I couldn't process that request properly. Please try again.";

            const aiMsg = {
                id: Date.now() + 1,
                text: aiText,
                isUser: false
            };
            setMessages(prev => [...prev, aiMsg]);

        } catch (error) {
            console.error("Chat Error:", error);
            const errorMsg = {
                id: Date.now() + 1,
                text: "I'm having trouble connecting to the server right now. For immediate assistance, please call +251 92 221 2161.",
                isUser: false
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="mb-4 w-[350px] max-w-[calc(100vw-48px)] h-[500px] max-h-[80vh] flex flex-col glass-card-dark rounded-2xl shadow-2xl overflow-hidden border border-white/20"
                    >
                        {/* Header */}
                        <div className="p-4 bg-gradient-to-r from-ethiopian-earth to-injera-maroon text-cloud-white flex justify-between items-center shadow-md">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm border border-white/10">
                                        <span className="text-xl">✨</span>
                                    </div>
                                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-ethiopian-earth"></span>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">Safed AI Support</h3>
                                    <p className="text-xs text-white/70">Online & Ready to Help</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-white/80 hover:text-white transition-colors p-1"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-cloud-white/5 scrollbar-thin scrollbar-thumb-sefed-sand/50">
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[85%] p-3 rounded-2xl ${msg.isUser
                                            ? 'bg-ethiopian-earth text-white rounded-br-none shadow-md'
                                            : 'bg-white text-ethiopian-earth rounded-bl-none shadow-sm border border-sefed-sand/20'
                                            }`}
                                    >
                                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                                        <span className="text-[10px] opacity-70 mt-1 block w-full text-right">
                                            {new Date(msg.id).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-white p-3 rounded-2xl rounded-bl-none shadow-sm border border-sefed-sand/20">
                                        <div className="flex gap-1">
                                            <span className="w-2 h-2 bg-ethiopian-earth/40 rounded-full animate-bounce"></span>
                                            <span className="w-2 h-2 bg-ethiopian-earth/40 rounded-full animate-bounce delay-100"></span>
                                            <span className="w-2 h-2 bg-ethiopian-earth/40 rounded-full animate-bounce delay-200"></span>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-white/10 border-t border-white/10 backdrop-blur-md">
                            <form onSubmit={handleSendMessage} className="flex gap-2">
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder="Ask about prices..."
                                    className="flex-1 bg-white/50 border border-white/20 text-ethiopian-earth placeholder-ethiopian-earth/50 text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-ethiopian-earth/20 transition-all shadow-inner"
                                />
                                <button
                                    type="submit"
                                    disabled={!inputValue.trim() || isLoading}
                                    className="bg-ethiopian-earth text-white p-3 rounded-xl hover:bg-ethiopian-earth/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg active:scale-95"
                                >
                                    <svg className="w-5 h-5 transform rotate-45 -ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                    </svg>
                                </button>
                            </form>
                            <div className="mt-2 text-center">
                                <p className="text-[10px] text-ethiopian-earth/60">Powered by Gemini AI</p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                className="group relative flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-ethiopian-earth to-injera-maroon text-white shadow-lg hover:shadow-2xl transition-all duration-300 z-50 ring-4 ring-white/20"
            >
                <span className="absolute inset-0 rounded-full bg-white/20 animate-ping opacity-75"></span>
                <div className={`transition-transform duration-300 ${isOpen ? 'rotate-90 scale-0' : 'rotate-0 scale-100'} absolute`}>
                    <svg className="w-7 h-7 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                </div>
                <div className={`transition-transform duration-300 ${isOpen ? 'rotate-0 scale-100' : '-rotate-90 scale-0'} absolute`}>
                    <svg className="w-7 h-7 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </div>
            </motion.button>
        </div>
    );
};

export default ChatBot;

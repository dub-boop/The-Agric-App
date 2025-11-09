import React, { useState, useRef, useEffect } from 'react';
// FIX: Correctly import GoogleGenAI and GenerateContentResponse as per the new API guidelines.
import { GoogleGenerativeAI, GenerateContentResponse } from '@google/generative-ai';
import { MenuIcon, CloseIcon } from '../constants';

// --- Helper Functions & Types ---

type Message = {
    id: number;
    sender: 'user' | 'ai';
    text: string;
    image?: string; // base64 string
    isLoading?: boolean;
};

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

// --- Icons (self-contained for this component) ---
const PaperclipIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>;
const CameraIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const SendIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>;
const DownloadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>;

// --- Simple Markdown Renderer ---
const SimpleMarkdownRenderer = ({ text }: { text: string }) => {
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let listItems: React.ReactNode[] = [];

    const flushList = () => {
        if (listItems.length > 0) {
            elements.push(<ul key={`ul-${elements.length}`} className="list-disc list-inside space-y-1 my-2">{listItems}</ul>);
            listItems = [];
        }
    };

    lines.forEach((line, index) => {
        // Handle bold text with regex
        const renderLineWithBold = (lineText: string) => {
            const parts = lineText.split(/(\*\*.*?\*\*)/g);
            return parts.map((part, i) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                    return <strong key={i}>{part.slice(2, -2)}</strong>;
                }
                return part;
            });
        };

        if (line.startsWith('## ')) {
            flushList();
            elements.push(<h2 key={index} className="text-xl font-bold mt-4 mb-2">{renderLineWithBold(line.substring(3))}</h2>);
        } else if (line.startsWith('* ')) {
            listItems.push(<li key={index}>{renderLineWithBold(line.substring(2))}</li>);
        } else {
            flushList();
            if (line.trim() !== '') {
                 elements.push(<p key={index}>{renderLineWithBold(line)}</p>);
            }
        }
    });

    flushList(); // Add any remaining list items
    
    return <div className="space-y-2">{elements}</div>;
};

const TalkToFarmrPage = ({ setSidebarOpen }: { setSidebarOpen: (isOpen: boolean) => void }) => {
    const [messages, setMessages] = useState<Message[]>([
        { id: 1, sender: 'ai', text: 'Hello! I am Farmr, your AI-powered agricultural assistant. How can I help you today? You can ask me about crop diseases, livestock health, or general farming advice. Feel free to upload a photo for analysis.' }
    ]);
    const [input, setInput] = useState('');
    const [image, setImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [isLoading, setIsLoading] = useState(false);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const base64Image = await fileToBase64(file);
            setImage(base64Image);
        }
    };

    const handleSendMessage = async () => {
        const trimmedInput = input.trim();
        if (!trimmedInput && !image) return;

        // Add user message
        const userMessage: Message = {
            id: Date.now(),
            sender: 'user',
            text: trimmedInput,
            image: image || undefined,
        };
        setMessages(prev => [...prev, userMessage]);

        // Add loading message
        const loadingMessageId = Date.now() + 1;
        const loadingMessage: Message = {
            id: loadingMessageId,
            sender: 'ai',
            text: '',
            isLoading: true,
        };
        setMessages(prev => [...prev, loadingMessage]);

        // Clear input fields
        setInput('');
        setImage(null);
        if(fileInputRef.current) fileInputRef.current.value = '';

        setIsLoading(true);

        try {
            // FIX: Initialize GoogleGenAI with the new API key format.
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
            
            const contents: any[] = [];
            
            if (image) {
                const mimeType = image.substring(image.indexOf(':') + 1, image.indexOf(';'));
                const base64Data = image.split(',')[1];
                contents.push({
                    inlineData: {
                        mimeType: mimeType,
                        data: base64Data
                    }
                });
            }

            if (trimmedInput) {
                contents.push({ text: trimmedInput });
            }


            // FIX: Use the correct method `ai.models.generateContent` and pass the model name.
            const response: GenerateContentResponse = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                // The `contents` field expects `GenerateContentParameters`.
                // For multimodal input, it should be an object with a `parts` array.
                contents: { parts: contents },
                config: {
                    systemInstruction: "You are Farmr, a specialized AI assistant for farmers. Your expertise is in diagnosing crop diseases, offering livestock health advice, and providing practical, actionable farming solutions. When an image is provided, your primary goal is to analyze it for signs of disease or pests. Provide a potential diagnosis, suggest treatments, and offer preventive measures. If no image is provided, answer farming-related questions concisely and clearly. Format your responses using simple markdown (e.g., **bold** for titles, `*` for list items)."
                }
            });

            // FIX: Access the generated text directly via the `.text` property.
            const aiText = response.text;

            const aiMessage: Message = {
                id: Date.now() + 2,
                sender: 'ai',
                text: aiText || 'Sorry, I could not process that request. Please try again.',
            };
            setMessages(prev => prev.filter(m => m.id !== loadingMessageId));
            setMessages(prev => [...prev, aiMessage]);

        } catch (error) {
            console.error('Error with Generative AI:', error);
            const errorMessage: Message = {
                id: Date.now() + 2,
                sender: 'ai',
                text: 'Sorry, I encountered an error. Please check your API key and try again.',
            };
            setMessages(prev => prev.filter(m => m.id !== loadingMessageId));
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <main className="flex-1 w-full flex flex-col bg-slate-100 overflow-hidden">
            <header className="flex-shrink-0 mb-4 md:mb-8 flex items-center justify-between p-4 md:p-0 md:pt-8 md:pl-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-700">Talk to Farmr</h2>
                <button
                    onClick={() => setSidebarOpen(true)}
                    className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-200 md:hidden"
                    aria-label="Open sidebar"
                >
                    <MenuIcon />
                </button>
            </header>
            
            <div className="flex-grow flex flex-col bg-white rounded-t-xl md:rounded-xl shadow-lg mx-0 md:mx-8 md:mb-8 overflow-hidden">
                {/* Chat Messages */}
                <div className="flex-grow p-6 space-y-6 overflow-y-auto">
                    {messages.map(msg => (
                        <div key={msg.id} className={`flex items-end gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                            {msg.sender === 'ai' && <div className="w-8 h-8 rounded-full bg-green-200 text-green-700 flex items-center justify-center font-bold flex-shrink-0">F</div>}
                            <div className={`max-w-xl p-4 rounded-xl shadow-sm ${
                                msg.sender === 'ai' ? 'bg-gray-100 text-gray-800' : 'bg-green-600 text-white'
                            }`}>
                                {msg.isLoading ? (
                                    <div className="flex items-center space-x-2">
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                                    </div>
                                ) : (
                                    <>
                                        {msg.image && <img src={msg.image} alt="User upload" className="rounded-lg mb-2 max-w-xs" />}
                                        <div className="prose prose-sm max-w-none text-inherit">
                                            <SimpleMarkdownRenderer text={msg.text} />
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>
                
                {/* Input Area */}
                <div className="flex-shrink-0 p-4 bg-gray-50 border-t">
                    {image && (
                        <div className="mb-2 relative w-24">
                            <img src={image} alt="Preview" className="w-24 h-24 object-cover rounded-lg" />
                            <button onClick={() => { setImage(null); if(fileInputRef.current) fileInputRef.current.value = ''; }} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md">
                                <CloseIcon className="h-4 w-4" />
                            </button>
                        </div>
                    )}
                    <div className="flex items-center space-x-3">
                        <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageChange} className="hidden" />
                        <button onClick={() => fileInputRef.current?.click()} className="p-2 text-gray-500 hover:text-green-600 transition-colors">
                            <PaperclipIcon />
                        </button>
                         <button className="p-2 text-gray-500 hover:text-green-600 transition-colors">
                            <CameraIcon />
                        </button>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
                            placeholder="Ask about crops, livestock, or upload an image..."
                            className="flex-grow px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500"
                            disabled={isLoading}
                        />
                        <button
                            onClick={handleSendMessage}
                            disabled={isLoading}
                            className="p-3 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors disabled:bg-gray-400"
                        >
                            <SendIcon />
                        </button>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default TalkToFarmrPage;
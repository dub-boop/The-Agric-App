import React, { useState, useRef, useEffect } from 'react';
// FIX: Correctly import GoogleGenAI and GenerateContentResponse as per the new API guidelines.
import { GoogleGenAI, GenerateContentResponse } from '@google/genai';
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

interface TalkToFarmrPageProps {
    setSidebarOpen: (isOpen: boolean) => void;
    userProfile?: any;
    businessProfile?: any;
    farmLocations?: any[];
    animals?: any[];
    cropPlans?: any[];
    inputsInventory?: any[];
}

const TalkToFarmrPage = ({
    setSidebarOpen,
    userProfile,
    businessProfile,
    farmLocations,
    animals,
    cropPlans,
    inputsInventory
}: TalkToFarmrPageProps) => {
    const [messages, setMessages] = useState<Message[]>([
        { id: 1, sender: 'ai', text: `Hello! I am Farmr, your AI-powered agricultural assistant. I am now fully synchronized with your live farm records and ready to help! You can ask me about crop disease management for your crops, livestock veterinary health advice, or general operational strategy. Feel free to upload a photo of a leaf, pest, or animal for high-precision diagnostic analysis.` }
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

            // Build dynamic context string to provide Gemini with real farm records context
            const farmContext = `
FARMER & BUSINESS CONTEXT:
- Farmer Name: ${userProfile?.name || 'N/A'}
- Business Name: ${businessProfile?.businessName || 'N/A'}
- Primary Enterprise Focus: ${businessProfile?.primaryFocus || 'N/A'}

REGISTERED FARM LOCATIONS:
${farmLocations && farmLocations.length > 0 ? farmLocations.map((loc: any) => `- ${loc.name || 'Location'}: Size ${loc.size || 0} ${loc.unit || 'ha'}, Coordinates (${loc.lat || 0}, ${loc.lon || 0})`).join('\n') : 'No registered farm locations.'}

REGISTERED LIVESTOCK RECORDS:
${animals && animals.length > 0 ? animals.map((ani: any) => `- Breed/Tag: ${ani.breed || ani.name || 'N/A'} (Type: ${ani.type}), Tracking Type: ${ani.trackingType || 'INDIVIDUAL'}, Stock/Quantity: ${ani.quantity || 1}, Status: ${ani.healthStatus || 'Healthy'}`).join('\n') : 'No registered livestock.'}

ACTIVE CROP PLANS:
${cropPlans && cropPlans.length > 0 ? cropPlans.map((cp: any) => `- Crop Type: ${cp.cropType}, Location: ${cp.locationName || 'N/A'}, Stage: ${cp.currentStage || 'Planning'}, Target Yield: ${cp.targetYield || 'N/A'}, Status: ${cp.status || 'Active'}`).join('\n') : 'No active crop plans.'}

INPUTS INVENTORY:
${inputsInventory && inputsInventory.length > 0 ? inputsInventory.map((item: any) => `- Item Name: ${item.name}, Category: ${item.category}, Stock Level: ${item.quantity} ${item.unit || 'units'}`).join('\n') : 'No inventory records.'}
`;

            // Use the correct method `ai.models.generateContent` and pass the model name.
            const response: GenerateContentResponse = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                // The `contents` field expects `GenerateContentParameters`.
                // For multimodal input, it should be an object with a `parts` array.
                contents: { parts: contents },
                config: {
                    systemInstruction: `You are Farmr, a specialized, context-aware AI assistant for farmers. You have access to the user's real-time farm records.
When responding, reference their specific crops, livestock records, and locations if they are relevant to their question, to provide highly customized, context-rich advice.

Here is the user's current farm profile and data:
${farmContext}

Your expertise is in diagnosing crop diseases, offering livestock health advice, and providing practical, actionable farming solutions. When an image is provided, your primary goal is to analyze it for signs of disease or pests. Provide a potential diagnosis, suggest treatments, and offer preventive measures. If no image is provided, answer farming-related questions concisely and clearly. Format your responses using simple markdown (e.g., **bold** for titles, \`*\` for list items).`
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
                <div>
                    <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Talk to Farmr</h2>
                    <p className="text-xs text-slate-500 mt-1">AI-powered assistant synced with your farm records.</p>
                </div>
                <button
                    onClick={() => setSidebarOpen(true)}
                    className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-200 md:hidden"
                    aria-label="Open sidebar"
                >
                    <MenuIcon />
                </button>
            </header>
            
            <div className="flex-grow flex flex-col bg-white rounded-t-xl md:rounded-xl shadow-lg mx-0 md:mx-8 md:mb-8 overflow-hidden">
                {/* Live Context Sync Header */}
                <div className="bg-emerald-50 border-b border-emerald-100 px-6 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-emerald-800">
                    <div className="flex items-center gap-2 font-bold">
                        <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span>Farmr AI Synced with Live Farm Records</span>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-slate-600 font-semibold">
                        <span>📍 <strong>{farmLocations?.length || 0}</strong> Locations</span>
                        <span>🐄 <strong>{animals?.length || 0}</strong> Livestock records</span>
                        <span>🌱 <strong>{cropPlans?.length || 0}</strong> Crop Plans</span>
                    </div>
                </div>

                {/* Chat Messages */}
                <div className="flex-grow p-6 space-y-6 overflow-y-auto">
                    {messages.map(msg => (
                        <div key={msg.id} className={`flex items-end gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                            {msg.sender === 'ai' && <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-extrabold flex-shrink-0 text-xs">F</div>}
                            <div className={`max-w-xl p-4 rounded-2xl shadow-sm ${
                                msg.sender === 'ai' ? 'bg-slate-100 text-slate-800 rounded-bl-none' : 'bg-emerald-700 text-white rounded-br-none'
                            }`}>
                                {msg.isLoading ? (
                                    <div className="flex items-center space-x-2 py-1">
                                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"></div>
                                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                                    </div>
                                ) : (
                                    <>
                                        {msg.image && <img src={msg.image} alt="User upload" className="rounded-xl mb-3 max-w-xs border border-white/20 shadow-sm" />}
                                        <div className="prose prose-sm max-w-none text-inherit leading-relaxed">
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
                <div className="flex-shrink-0 p-4 bg-slate-50 border-t border-slate-100">
                    {image && (
                        <div className="mb-3 relative inline-block">
                            <img src={image} alt="Preview" className="w-24 h-24 object-cover rounded-xl border border-slate-200" />
                            <button onClick={() => { setImage(null); if(fileInputRef.current) fileInputRef.current.value = ''; }} className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-md border-0 cursor-pointer">
                                <CloseIcon className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    )}
                    <div className="flex items-center space-x-3">
                        <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageChange} className="hidden" />
                        <button onClick={() => fileInputRef.current?.click()} className="p-2 text-slate-500 hover:text-emerald-700 hover:bg-slate-100 rounded-xl transition-colors border-0 bg-transparent cursor-pointer" title="Attach Image">
                            <PaperclipIcon />
                        </button>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
                            placeholder="Ask about your crops, your livestock, or diagnose a picture..."
                            className="flex-grow px-5 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent bg-white text-sm"
                            disabled={isLoading}
                        />
                        <button
                            onClick={handleSendMessage}
                            disabled={isLoading}
                            className="p-3 bg-emerald-700 text-white rounded-2xl hover:bg-emerald-800 transition-colors disabled:bg-slate-300 disabled:text-slate-500 cursor-pointer border-0 shadow-sm flex-shrink-0"
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
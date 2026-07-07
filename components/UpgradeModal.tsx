import React, { useState } from 'react';
import { CloseIcon, CheckIcon, ArrowUpIcon } from '../constants';

interface UpgradeModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentPlan: 'Starter' | 'Pro' | 'Premium';
    onUpgrade: (plan: 'Starter' | 'Pro' | 'Premium') => void;
}

export default function UpgradeModal({ isOpen, onClose, currentPlan, onUpgrade }: UpgradeModalProps) {
    const [selectedPlan, setSelectedPlan] = useState<'Starter' | 'Pro' | 'Premium' | null>(null);
    const [checkoutStep, setCheckoutStep] = useState<'plans' | 'payment' | 'success'>('plans');
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvv, setCvv] = useState('');
    const [cardName, setCardName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const plansInfo = [
        {
            name: 'Starter' as const,
            price: '$0',
            period: 'Free Forever',
            description: 'Essential tools for small-scale operations and hobbyists.',
            color: 'border-slate-200 bg-white hover:border-slate-300',
            buttonStyle: 'bg-slate-100 hover:bg-slate-200 text-slate-700',
            badge: null,
            features: [
                'Basic livestock & crop tracking',
                '1 farm location mapping',
                'Standard weather forecast',
                'Manual store inventory',
            ]
        },
        {
            name: 'Pro' as const,
            price: '$19',
            period: 'per month',
            description: 'Advanced farm records and team coordination for scaling family farms.',
            color: 'border-blue-500 bg-white ring-2 ring-blue-500/20 shadow-lg',
            buttonStyle: 'bg-blue-600 hover:bg-blue-700 text-white',
            badge: 'Popular',
            features: [
                'Advanced financial reports & charts',
                'Up to 5 farm locations mapping',
                'Detailed agricultural weather indicators',
                'Up to 3 team members with custom permissions',
                'Receipt generator with CSV export',
                'Comprehensive livestock health events logs'
            ]
        },
        {
            name: 'Premium' as const,
            price: '$49',
            period: 'per month',
            description: 'Uncapped capability, custom automation, and AI-powered agronomy.',
            color: 'border-amber-500 bg-amber-50/20 ring-2 ring-amber-500/20 shadow-xl',
            buttonStyle: 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white shadow-md',
            badge: 'Best Value',
            features: [
                'Unlimited farm locations mapping',
                'Uncapped team members onboarding',
                'AI-Powered "Talk to Farmr" voice & text helper',
                'Full automated receipt PDF extraction',
                'Priority Gov/NGO support facilitation',
                'Live breeding alerts and heat records',
                'Standard API developer access'
            ]
        }
    ];

    const handleSelectPlan = (planName: 'Starter' | 'Pro' | 'Premium') => {
        if (planName === currentPlan) return;
        
        if (planName === 'Starter') {
            // Instant downgrade (no checkout needed)
            onUpgrade('Starter');
            setCheckoutStep('success');
            setSelectedPlan('Starter');
        } else {
            setSelectedPlan(planName);
            setCheckoutStep('payment');
        }
    };

    const handlePaymentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        // Simulate a secure bank processing delay
        setTimeout(() => {
            if (selectedPlan) {
                onUpgrade(selectedPlan);
            }
            setIsSubmitting(false);
            setCheckoutStep('success');
        }, 1500);
    };

    const formatCardNumber = (value: string) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        const matches = v.match(/\d{4,16}/g);
        const match = (matches && matches[0]) || '';
        const parts = [];

        for (let i = 0, len = match.length; i < len; i += 4) {
            parts.push(match.substring(i, i + 4));
        }

        if (parts.length > 0) {
            return parts.join(' ');
        } else {
            return v;
        }
    };

    const formatExpiry = (value: string) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        if (v.length >= 2) {
            return `${v.slice(0, 2)}/${v.slice(2, 4)}`;
        }
        return v;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="relative w-full max-w-5xl bg-slate-50 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                
                {/* Header */}
                <div className="flex justify-between items-center px-6 py-4 bg-white border-b border-slate-200">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">
                            {checkoutStep === 'plans' && 'Upgrade Your Account Plan'}
                            {checkoutStep === 'payment' && `Upgrade to ${selectedPlan} Plan`}
                            {checkoutStep === 'success' && 'Upgrade Successful! 🎉'}
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                            {checkoutStep === 'plans' && 'Unlock advanced agricultural management parameters and unlimited collaboration.'}
                            {checkoutStep === 'payment' && 'Complete your simulated subscription payment safely.'}
                            {checkoutStep === 'success' && 'Your account permissions have been updated.'}
                        </p>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                        aria-label="Close modal"
                    >
                        <CloseIcon className="h-6 w-6" />
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-6">
                    {checkoutStep === 'plans' && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
                            {plansInfo.map((plan) => {
                                const isCurrent = plan.name === currentPlan;
                                return (
                                    <div 
                                        key={plan.name} 
                                        className={`flex flex-col border rounded-2xl p-6 transition-all relative ${plan.color}`}
                                    >
                                        {plan.badge && (
                                            <span className={`absolute -top-3 left-6 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                                                plan.name === 'Premium' 
                                                    ? 'bg-amber-500 text-white' 
                                                    : 'bg-blue-600 text-white'
                                            }`}>
                                                {plan.badge}
                                            </span>
                                        )}
                                        
                                        <div className="mb-4">
                                            <h3 className="text-lg font-bold text-slate-800">{plan.name}</h3>
                                            <p className="text-xs text-slate-500 mt-1 min-h-[32px]">{plan.description}</p>
                                        </div>

                                        <div className="flex items-baseline space-x-1 mb-6">
                                            <span className="text-3xl font-extrabold text-slate-900">{plan.price}</span>
                                            <span className="text-sm font-medium text-slate-500">{plan.period}</span>
                                        </div>

                                        <button
                                            type="button"
                                            disabled={isCurrent}
                                            onClick={() => handleSelectPlan(plan.name)}
                                            className={`w-full py-2.5 px-4 rounded-xl font-semibold transition-all mb-6 text-sm ${
                                                isCurrent 
                                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default flex items-center justify-center space-x-1' 
                                                    : plan.buttonStyle
                                            }`}
                                        >
                                            {isCurrent ? (
                                                <>
                                                    <CheckIcon className="h-4 w-4 text-emerald-600 inline" />
                                                    <span>Your Current Plan</span>
                                                </>
                                            ) : (
                                                `Upgrade to ${plan.name}`
                                            )}
                                        </button>

                                        <div className="border-t border-slate-100 pt-6 flex-grow">
                                            <p className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-3">Key Features</p>
                                            <ul className="space-y-2 text-sm text-slate-600">
                                                {plan.features.map((feat) => (
                                                    <li key={feat} className="flex items-start">
                                                        <CheckIcon className="h-4 w-4 text-emerald-500 mr-2 flex-shrink-0 mt-0.5" />
                                                        <span>{feat}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {checkoutStep === 'payment' && selectedPlan && (
                        <div className="max-w-md mx-auto bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                            <h3 className="text-lg font-bold text-slate-800 mb-1">Simulated Secure Checkout</h3>
                            <p className="text-xs text-slate-500 mb-6">Experience a simulated checkout flow to test the upgrading capabilities of The Agric App.</p>
                            
                            <div className="bg-slate-50 rounded-xl p-4 mb-6 border border-slate-100 flex justify-between items-center text-sm">
                                <div>
                                    <p className="font-semibold text-slate-800">{selectedPlan} Subscription</p>
                                    <p className="text-xs text-slate-500">Billed monthly</p>
                                </div>
                                <span className="text-xl font-bold text-slate-900">
                                    {selectedPlan === 'Pro' ? '$19' : '$49'}
                                    <span className="text-xs font-medium text-slate-500">/mo</span>
                                </span>
                            </div>

                            <form onSubmit={handlePaymentSubmit} className="space-y-4">
                                <div>
                                    <label htmlFor="cardName" className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">Cardholder Name</label>
                                    <input 
                                        type="text" 
                                        id="cardName" 
                                        required
                                        placeholder="John Doe"
                                        value={cardName}
                                        onChange={(e) => setCardName(e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm bg-slate-50/50"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="cardNumber" className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">Card Number</label>
                                    <input 
                                        type="text" 
                                        id="cardNumber" 
                                        required
                                        maxLength={19}
                                        placeholder="4000 1234 5678 9010"
                                        value={cardNumber}
                                        onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm bg-slate-50/50"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="expiry" className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">Expiration (MM/YY)</label>
                                        <input 
                                            type="text" 
                                            id="expiry" 
                                            required
                                            maxLength={5}
                                            placeholder="12/28"
                                            value={expiry}
                                            onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm bg-slate-50/50"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="cvv" className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">CVC / CVV</label>
                                        <input 
                                            type="password" 
                                            id="cvv" 
                                            required
                                            maxLength={4}
                                            placeholder="•••"
                                            value={cvv}
                                            onChange={(e) => setCvv(e.target.value.replace(/[^0-9]/g, ''))}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm bg-slate-50/50"
                                        />
                                    </div>
                                </div>

                                <div className="pt-4 flex items-center space-x-3">
                                    <button
                                        type="button"
                                        onClick={() => setCheckoutStep('plans')}
                                        className="flex-1 py-2.5 px-4 rounded-xl text-slate-600 font-semibold border border-slate-200 hover:bg-slate-50 transition-colors text-sm"
                                    >
                                        Back to Plans
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors text-sm disabled:opacity-50 flex items-center justify-center space-x-2 shadow-sm"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                </svg>
                                                <span>Processing...</span>
                                            </>
                                        ) : (
                                            <span>Simulate Payment</span>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {checkoutStep === 'success' && selectedPlan && (
                        <div className="max-w-md mx-auto text-center py-12 px-6">
                            <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 ring-8 ring-emerald-500/10">
                                <CheckIcon className="h-10 w-10" />
                            </div>
                            
                            <h3 className="text-2xl font-bold text-slate-800 mb-2">Plan Upgraded successfully!</h3>
                            <p className="text-sm text-slate-500 mb-8 leading-relaxed">
                                Congratulations! You are now subscribed to the <span className="font-bold text-slate-800">{selectedPlan}</span> tier. Enjoy immediate access to all unlocked capabilities and tools.
                            </p>

                            <button
                                onClick={onClose}
                                className="w-full py-3 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-colors text-sm shadow-md"
                            >
                                Get Started
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

import React, { useState, useEffect } from 'react';
import { 
    MenuIcon, CloseIcon, CheckIcon, TalkToFarmrIcon, WeatherNavIcon, GovNgoSupportIcon, 
    FarmRecordsIcon, ReceiptGeneratorIcon, CroppingPlannerIcon, LivestockPlannerIcon, StoreManagementIcon, generateAvatar 
} from '../constants';


// --- SUB-COMPONENTS for the new design ---

const WhyChooseCard = ({ icon, title, children }: { icon: React.ReactNode, title: string, children: React.ReactNode }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200/80 text-center">
        <div className="inline-block bg-green-100 p-4 rounded-full text-[#1E5631] mb-4">
            {icon}
        </div>
        <h3 className="text-xl font-bold text-gray-800">{title}</h3>
        <p className="text-gray-600 mt-2">{children}</p>
    </div>
);

const FeatureShowcaseItem = ({ title, children, imageUrl, reverse = false }: { title: string, children: React.ReactNode, imageUrl: string, reverse?: boolean }) => (
    <div className={`flex flex-col md:flex-row items-center gap-8 md:gap-12 ${reverse ? 'md:flex-row-reverse' : ''}`}>
        <div className="md:w-1/2">
            <h3 className="text-3xl font-bold text-gray-900 leading-tight">{title}</h3>
            <p className="mt-4 text-lg text-gray-600">{children}</p>
        </div>
        <div className="md:w-1/2">
            <img src={imageUrl} alt={title} className="rounded-xl shadow-2xl object-cover w-full h-auto" />
        </div>
    </div>
);

const PricingTier = ({ title, price, priceSuffix, features, popular, onStartTrial, description }: { title: string, price: string, priceSuffix?: string, features: string[], popular?: boolean, onStartTrial: () => void, description: string }) => (
    <div className={`border rounded-xl p-8 flex flex-col ${popular ? 'border-green-500 relative shadow-xl bg-white' : 'border-gray-300 bg-gray-50'}`}>
        {popular && <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">MOST POPULAR</div>}
        <h3 className="text-2xl font-bold text-gray-800">{title}</h3>
        <p className="text-sm text-gray-500 mt-1">{description}</p>
        <p className="mt-6">
            <span className="text-4xl font-extrabold text-gray-900">{price}</span>
            {priceSuffix && <span className="text-base font-medium text-gray-500">{priceSuffix}</span>}
        </p>
        <ul className="mt-8 space-y-4 text-gray-600 flex-grow">
            {features.map(feature => (
                <li key={feature} className="flex items-start">
                    <CheckIcon className="h-6 w-6 text-green-500 mr-2 flex-shrink-0" />
                    <span>{feature}</span>
                </li>
            ))}
        </ul>
        <button
            onClick={onStartTrial}
            className={`mt-10 w-full py-3 px-6 rounded-lg font-semibold transition-colors ${popular ? 'bg-[#4C9A2A] text-white hover:bg-[#1E5631]' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
        >
            {title === 'Starter' ? 'Get Started' : 'Get Started'}
        </button>
    </div>
);

const MailIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
);

const PhoneIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
);

const TwitterIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
);

const FacebookIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M9 8h-3v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.378 14.192 5 15.115 5H18V0H14.192C10.596 0 9 1.583 9 4.615z" />
    </svg>
);

const LinkedInIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M0 1.146C0 .513.526 0 1.17 0h21.66C23.474 0 24 .513 24 1.146v21.708c0 .633-.526 1.146-1.17 1.146H1.17C.526 24 0 23.487 0 22.854zM4 20V9h4v11zm2-13c-1.105 0-2-.895-2-2s.895-2 2-2 2 .895 2 2-.895 2-2 2zM20 20h-4v-5.61c0-1.58-.937-2.37-2.148-2.37-.936 0-1.63.483-1.895 1.115-.1.225-.1.54-.1.855V20H8V9h4v1.857c.45-.78 1.4-1.557 3.2-1.557C18.6 9.3 20 10.99 20 13.9z"/>
    </svg>
);

const QuoteIcon = () => (
    <svg className="h-12 w-12 text-green-100" fill="currentColor" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <path d="M9.33,12.44H3.22a3,3,0,0,0-3,3V25.22a3,3,0,0,0,3,3H9.33a3,3,0,0,0,3-3V15.44A3,3,0,0,0,9.33,12.44Zm0,12.78H3.22V15.44H9.33Z" />
        <path d="M25.33,12.44H19.22a3,3,0,0,0-3,3V25.22a3,3,0,0,0,3,3h6.11a3,3,0,0,0,3-3V15.44A3,3,0,0,0,25.33,12.44Zm0,12.78H19.22V15.44h6.11Z" />
    </svg>
);

const TestimonialCard = ({ quote, name, role, avatar }: { quote: string, name: string, role: string, avatar: string }) => (
    <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200/80 flex flex-col">
        <div className="flex-grow relative">
            <div className="absolute -top-4 -left-4">
                <QuoteIcon />
            </div>
            <p className="text-gray-600 italic">"{quote}"</p>
        </div>
        <div className="flex items-center mt-6 pt-6 border-t border-gray-200">
            <img src={avatar} alt={name} className="w-12 h-12 rounded-full object-cover" />
            <div className="ml-4">
                <p className="font-bold text-gray-800">{name}</p>
                <p className="text-sm text-gray-500">{role}</p>
            </div>
        </div>
    </div>
);


// --- MAIN LANDING PAGE COMPONENT ---

const LandingPage = ({ onStartTrial, onNavigateToPrivacy, onNavigateToTerms }: { onStartTrial: () => void; onNavigateToPrivacy: () => void; onNavigateToTerms: () => void; }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);
    
    const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
        e.preventDefault();
        const element = document.getElementById(targetId);
        if (element) {
            const headerOffset = isScrolled ? 70 : 80;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
        if (isMenuOpen) {
            setIsMenuOpen(false);
        }
    };

    return (
        <div id="top" className="bg-gray-50 font-sans text-gray-800">
            {/* Header */}
            <header className={`fixed top-0 left-0 right-0 z-30 flex justify-between items-center transition-all duration-300 ${
                isScrolled ? 'bg-white shadow-md p-4' : 'bg-transparent p-6'
            }`}>
                <a href="#top" onClick={(e) => handleNavClick(e, 'top')} className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-[#1E5631]/80 rounded-full flex items-center justify-center">
                        <div className="w-6 h-6 bg-white/20 rounded-full"></div>
                    </div>
                    <h1 
                        className={`text-lg font-bold tracking-wider transition-colors ${isScrolled ? 'text-gray-800' : 'text-white'}`}
                        style={!isScrolled ? { textShadow: '0 1px 3px rgba(0,0,0,0.5)' } : {}}
                    >
                        THE AGRIC APP
                    </h1>
                </a>
                 <nav className="hidden md:flex items-center space-x-6 font-semibold" style={!isScrolled ? { textShadow: '0 1px 3px rgba(0,0,0,0.5)' } : {}}>
                    <a href="#features" onClick={(e) => handleNavClick(e, 'features')} className={`transition-colors ${isScrolled ? 'text-gray-700 hover:text-green-600' : 'text-white hover:text-green-300'}`}>Features</a>
                    <a href="#testimonials" onClick={(e) => handleNavClick(e, 'testimonials')} className={`transition-colors ${isScrolled ? 'text-gray-700 hover:text-green-600' : 'text-white hover:text-green-300'}`}>Testimonials</a>
                    <a href="#pricing" onClick={(e) => handleNavClick(e, 'pricing')} className={`transition-colors ${isScrolled ? 'text-gray-700 hover:text-green-600' : 'text-white hover:text-green-300'}`}>Pricing</a>
                    <a href="#contact" onClick={(e) => handleNavClick(e, 'contact')} className={`transition-colors ${isScrolled ? 'text-gray-700 hover:text-green-600' : 'text-white hover:text-green-300'}`}>Contact</a>
                </nav>
                 <div className="flex items-center space-x-4">
                     <button onClick={onStartTrial} className={`hidden md:block px-4 py-2 rounded-lg font-semibold transition-colors ${
                        isScrolled ? 'text-gray-700 hover:text-green-600' : 'text-white hover:text-green-300'
                    }`}>
                        Login / Sign up
                    </button>
                    <div className="md:hidden">
                        <button onClick={() => setIsMenuOpen(true)} className={`${isScrolled ? 'text-gray-800' : 'text-white'} p-2 rounded-md`} aria-label="Open menu">
                            <MenuIcon />
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Menu */}
            <div className={`fixed inset-0 bg-gray-900 bg-opacity-95 z-50 transform transition-transform duration-300 ease-in-out md:hidden ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="flex justify-end p-6">
                    <button onClick={() => setIsMenuOpen(false)} className="text-white p-2" aria-label="Close menu">
                        <CloseIcon className="h-8 w-8" />
                    </button>
                </div>
                <nav className="flex flex-col items-center justify-center h-full -mt-16 space-y-8 text-white text-2xl font-semibold">
                    <a href="#features" onClick={(e) => handleNavClick(e, 'features')} className="hover:text-green-300">Features</a>
                    <a href="#testimonials" onClick={(e) => handleNavClick(e, 'testimonials')} className="hover:text-green-300">Testimonials</a>
                    <a href="#pricing" onClick={(e) => handleNavClick(e, 'pricing')} className="hover:text-green-300">Pricing</a>
                    <a href="#contact" onClick={(e) => handleNavClick(e, 'contact')} className="hover:text-green-300">Contact</a>
                    <button 
                        onClick={() => { onStartTrial(); setIsMenuOpen(false); }} 
                        className="bg-[#4C9A2A] text-white px-8 py-3 rounded-lg font-semibold text-xl hover:bg-[#1E5631] transition-colors shadow-lg mt-8"
                    >
                        Get Started For Free
                    </button>
                </nav>
            </div>

            {/* Hero Section */}
            <section 
                className="relative bg-cover bg-center pt-48 pb-32 text-center" 
                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1560493676-04071c5f467b?q=80&w=2874&auto=format&fit=crop')" }}
            >
                <div className="absolute inset-0 bg-black/60"></div>
                <div className="relative container mx-auto px-6">
                    <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>Stop Guessing, Start Growing.</h1>
                    <p className="mt-6 text-lg md:text-xl text-gray-200 max-w-3xl mx-auto" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
                       The all-in-one digital assistant for modern farmers. Manage operations, get AI-powered advice, and unlock your farm's true potential.
                    </p>
                    <div className="mt-10">
                        <button onClick={onStartTrial} className="bg-[#4C9A2A] text-white px-10 py-4 rounded-lg font-semibold text-lg hover:bg-[#1E5631] transition-colors shadow-lg">
                            Get Started For Free
                        </button>
                        <p className="mt-3 text-sm text-gray-300">No credit card required.</p>
                    </div>
                </div>
            </section>
            
             {/* Why Choose Us Section */}
            <section id="why-us" className="py-20 bg-white">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900">A Smarter Way to Farm</h2>
                        <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">The Agric App is more than just a record book. It's an integrated platform built on three core pillars to drive your success.</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        <WhyChooseCard icon={<CroppingPlannerIcon className="h-8 w-8" />} title="Organize & Optimize">
                            Digitize your entire workflow, from crop and livestock planning to inventory and financial records, all in one place.
                        </WhyChooseCard>
                         <WhyChooseCard icon={<TalkToFarmrIcon className="h-8 w-8" />} title="Diagnose & Decide">
                            Leverage AI and real-time data. Get instant pest & disease analysis, and farm-specific weather insights to make informed decisions.
                        </WhyChooseCard>
                         <WhyChooseCard icon={<GovNgoSupportIcon />} title="Connect & Grow">
                            Access a curated database of government and NGO support programs to find the funding and training you need to expand.
                        </WhyChooseCard>
                    </div>
                </div>
            </section>

            {/* Partners Section */}
            <section id="partners" className="py-12 bg-slate-100">
                <div className="container mx-auto px-6 text-center">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Trusted by Farmers and Organizations Across Nigeria</h3>
                    <div className="mt-8 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-y-8 gap-x-4 items-center max-w-5xl mx-auto">
                        <div className="grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300">
                            <p className="text-xl font-bold text-gray-500">AgroLink</p>
                        </div>
                        <div className="grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300">
                            <p className="text-xl font-bold text-gray-500">FarmFresh Co-op</p>
                        </div>
                        <div className="grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300">
                            <p className="text-xl font-bold text-gray-500">HarvestPlus</p>
                        </div>
                        <div className="grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300">
                            <p className="text-xl font-bold text-gray-500">Greenova Hub</p>
                        </div>
                        <div className="grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300 col-span-2 md:col-span-4 lg:col-span-1">
                            <p className="text-xl font-bold text-gray-500">Naija Farmers Union</p>
                        </div>
                    </div>
                </div>
            </section>


            {/* Features Section */}
            <section id="features" className="py-20 bg-white">
                <div className="container mx-auto px-6 space-y-24">
                    <FeatureShowcaseItem
                        title="All-in-One Farm Management"
                        imageUrl="https://images.unsplash.com/photo-1615897135436-51a836336114?q=80&w=2940&auto=format&fit=crop"
                    >
                        Say goodbye to scattered notebooks. Our integrated planners for <strong className="text-green-700">Cropping</strong> and <strong className="text-green-700">Livestock</strong> let you track every detail from planting schedules to animal health. The <strong className="text-green-700">Store Management</strong> tool keeps your inventory in check, ensuring you never run low on critical supplies.
                    </FeatureShowcaseItem>

                    <FeatureShowcaseItem
                        title="An Agronomist in Your Pocket"
                        imageUrl="https://images.unsplash.com/photo-1601699323389-9a6d4791e878?q=80&w=2940&auto=format&fit=crop"
                        reverse
                    >
                        Uncertain about a pest or disease? Our groundbreaking <strong className="text-green-700">"Talk to Farmr"</strong> feature uses AI to analyze photos of your crops or livestock. Get instant potential diagnoses, treatment suggestions, and prevention tips right when you need them.
                    </FeatureShowcaseItem>

                    <FeatureShowcaseItem
                        title="Hyper-Local Weather Center"
                        imageUrl="https://images.unsplash.com/photo-1585038596075-515456f709c8?q=80&w=2874&auto=format&fit=crop"
                    >
                        Make decisions based on the weather at your specific farm location, not the nearest city. Our dashboard provides real-time conditions, hourly and daily forecasts, and crucial <strong className="text-green-700">agricultural metrics</strong> like soil moisture and growing degree days.
                    </FeatureShowcaseItem>
                    
                     <FeatureShowcaseItem
                        title="Unlock Growth with the Support Hub"
                        imageUrl="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=2940&auto=format&fit=crop"
                        reverse
                    >
                        Finding funding and training is hard. We make it easy. Our <strong className="text-green-700">Gov/NGO Support Hub</strong> is a curated, filterable database of available grants, loans, and training programs, complete with eligibility criteria and application links.
                    </FeatureShowcaseItem>

                     <FeatureShowcaseItem
                        title="Master Your Farm's Finances"
                        imageUrl="https://images.unsplash.com/photo-1554224155-1696413565d3?q=80&w=2940&auto=format&fit=crop"
                    >
                        Take control of your cash flow. The <strong className="text-green-700">Farm Records</strong> tool simplifies income and expenditure tracking, while the <strong className="text-green-700">Receipt Generator</strong> helps you create professional documents in seconds. Get the insights you need to build a more profitable business.
                    </FeatureShowcaseItem>

                </div>
            </section>
            
            {/* Testimonials Section */}
            <section id="testimonials" className="py-20 bg-gray-50">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900">What Our Farmers Are Saying</h2>
                        <p className="mt-4 text-lg text-gray-600">Real stories from farmers transforming their operations with The Agric App.</p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        <TestimonialCard
                            quote="The AI disease diagnosis is a game-changer. I saved my tomato crop this season thanks to a quick photo upload and the advice I got. It's like having an agronomist on call 24/7."
                            name="Aisha Bello"
                            role="Tomato Farmer, Kaduna"
                            avatar={generateAvatar('Aisha Bello', '#9A3412')}
                        />
                        <TestimonialCard
                            quote="Managing my poultry records used to be a nightmare of notebooks and spreadsheets. Now, everything from feed inventory to vaccination schedules is in one place. My efficiency has skyrocketed."
                            name="Chidi Okoro"
                            role="Poultry Farm Owner, Oyo"
                            avatar={generateAvatar('Chidi Okoro', '#1E5631')}
                        />
                        <TestimonialCard
                            quote="As a cooperative manager, the ability to see everything in one dashboard is invaluable. The Gov/NGO Support Hub also helped us secure a grant we didn't even know we were eligible for. Highly recommended!"
                            name="Fatima Sani"
                            role="Cooperative Manager, Kano"
                            avatar={generateAvatar('Fatima Sani', '#5B21B6')}
                        />
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="py-20 bg-white">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Simple, Transparent Pricing</h2>
                        <p className="mt-4 text-lg text-gray-600">Choose the plan that's right for your farm's journey.</p>
                    </div>
                    <div className="grid lg:grid-cols-3 gap-8 max-w-5xl mx-auto items-start">
                        <PricingTier 
                            title="Starter" 
                            price="Free"
                            description="For Students & Smallholders" 
                            features={[
                                'Up to 5 active crop plans',
                                'Up to 20 animals or 2 batches',
                                'Up to 10 store items per category',
                                '50 financial entries per month',
                                '5 AI queries per month',
                                '1 Farm Location & 1 User',
                                'View Gov/NGO Programs',
                                'Standard Weather & Basic Analytics',
                                'Community & Email Support'
                            ]} 
                            onStartTrial={onStartTrial} 
                        />
                        <PricingTier 
                            title="Pro" 
                            price="$19" 
                            priceSuffix="/month or $190/year"
                            description="For Growth Farmers" 
                            features={[
                                'Unlimited Crop & Livestock Plans',
                                'Unlimited Financial Documents',
                                '75 AI queries per month',
                                'Up to 2 Farm Locations',
                                'Up to 3 Team Members',
                                'Track Gov/NGO Applications',
                                'Data Export (CSV) for all modules',
                                'Advanced Agricultural Weather',
                                'Full Financial Analytics Suite',
                                'Priority Email Support'
                            ]} 
                            popular 
                            onStartTrial={onStartTrial} 
                        />
                        <PricingTier 
                            title="Premium" 
                            price="$10"
                            priceSuffix="/user/month"
                            description="For Large Farms & Coops" 
                            features={[
                                'Everything in Pro, plus:',
                                'Unlimited AI Queries',
                                'Unlimited Farm Locations',
                                'Unlimited Team Members',
                                'Dedicated Account Manager',
                                'Phone Support'
                            ]} 
                            onStartTrial={onStartTrial} 
                        />
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section id="contact" className="py-20 bg-gray-50">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Get in Touch</h2>
                        <p className="mt-4 text-lg text-gray-600">Have questions? We're here to help.</p>
                    </div>
                    <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
                        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200/80 flex items-start space-x-4">
                            <MailIcon />
                            <div>
                                <h3 className="text-xl font-bold text-gray-800">Email Us</h3>
                                <p className="text-gray-600 mt-1">For support, sales, or any other inquiries.</p>
                                <a href="mailto:support@agricapp.com" className="text-green-600 font-semibold hover:underline mt-2 inline-block">support@agricapp.com</a>
                            </div>
                        </div>
                        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200/80 flex items-start space-x-4">
                            <PhoneIcon />
                            <div>
                                <h3 className="text-xl font-bold text-gray-800">Call Us</h3>
                                <p className="text-gray-600 mt-1">Our team is available Mon-Fri, 9am-5pm.</p>
                                <a href="tel:+2348012345678" className="text-green-600 font-semibold hover:underline mt-2 inline-block">+234 801 234 5678</a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-[#1E5631] text-white">
                <div className="container mx-auto px-6 py-12">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        <div>
                            <h4 className="font-bold mb-4">The Agric App</h4>
                            <p className="text-sm text-gray-300">Empowering farmers with technology.</p>
                        </div>
                         <div>
                            <h4 className="font-bold mb-4">Navigation</h4>
                            <ul className="space-y-2 text-sm text-gray-300">
                                <li><a href="#features" onClick={(e) => handleNavClick(e, 'features')} className="hover:text-white">Features</a></li>
                                <li><a href="#testimonials" onClick={(e) => handleNavClick(e, 'testimonials')} className="hover:text-white">Testimonials</a></li>
                                <li><a href="#pricing" onClick={(e) => handleNavClick(e, 'pricing')} className="hover:text-white">Pricing</a></li>
                                <li><a href="#contact" onClick={(e) => handleNavClick(e, 'contact')} className="hover:text-white">Contact</a></li>
                            </ul>
                        </div>
                         <div>
                            <h4 className="font-bold mb-4">Legal</h4>
                            <ul className="space-y-2 text-sm text-gray-300">
                                <li><a href="#" onClick={(e) => { e.preventDefault(); onNavigateToPrivacy(); }} className="hover:text-white">Privacy Policy</a></li>
                                <li><a href="#" onClick={(e) => { e.preventDefault(); onNavigateToTerms(); }} className="hover:text-white">Terms of Service</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold mb-4">Follow Us</h4>
                            <div className="flex space-x-4">
                                <a href="#" className="text-gray-300 hover:text-white"><TwitterIcon /></a>
                                <a href="#" className="text-gray-300 hover:text-white"><FacebookIcon /></a>
                                <a href="#" className="text-gray-300 hover:text-white"><LinkedInIcon /></a>
                            </div>
                        </div>
                    </div>
                     <div className="mt-12 pt-8 border-t border-white/20 text-center text-sm text-gray-400">
                        &copy; {new Date().getFullYear()} The Agric App. All Rights Reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
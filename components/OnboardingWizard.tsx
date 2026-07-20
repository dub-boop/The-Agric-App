import React, { useState } from 'react';
import type { UserProfile, FarmLocation, BusinessProfile } from '../types';
import { SUPPORTED_ENTERPRISE_CROPS, SUPPORTED_LIVESTOCK } from '../constants';

// Reusable MultiSelectPills component (local to this wizard)
const MultiSelectPills = ({ title, options, selected, onToggle }: {
  title: string;
  options: string[];
  selected: string[];
  onToggle: (option: string) => void;
}) => (
    <div>
        <h5 className="text-gray-700 font-semibold mb-3 text-base">{title}</h5>
        <div className="flex flex-wrap gap-2">
            {options.map(option => {
                const isSelected = selected.includes(option);
                return (
                    <button
                        key={option}
                        type="button"
                        onClick={() => onToggle(option)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                            isSelected 
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                        }`}
                    >
                        {option}
                    </button>
                )
            })}
        </div>
    </div>
);


interface OnboardingWizardProps {
    userProfile: UserProfile;
    setUserProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
    businessProfile: BusinessProfile;
    setBusinessProfile: React.Dispatch<React.SetStateAction<BusinessProfile>>;
    selectedCrops: string[];
    setSelectedCrops: React.Dispatch<React.SetStateAction<string[]>>;
    selectedLivestock: string[];
    setSelectedLivestock: React.Dispatch<React.SetStateAction<string[]>>;
    farmLocations: FarmLocation[];
    setFarmLocations: React.Dispatch<React.SetStateAction<FarmLocation[]>>;
    onComplete: () => void;
}

const OnboardingWizard = ({
    userProfile,
    setUserProfile,
    businessProfile,
    setBusinessProfile,
    selectedCrops,
    setSelectedCrops,
    selectedLivestock,
    setSelectedLivestock,
    farmLocations,
    setFarmLocations,
    onComplete
}: OnboardingWizardProps) => {
    const [step, setStep] = useState(1);
    
    // Local form states
    const [profileData, setProfileData] = useState({ name: userProfile.name, farmName: businessProfile.name });
    const [firstLocation, setFirstLocation] = useState({ name: 'Main Farm', size: '10', lat: '', lon: '' });

    const [isLocating, setIsLocating] = useState(false);
    const [locationError, setLocationError] = useState<string | null>(null);

    const handleCaptureCoordinates = () => {
        if (!navigator.geolocation) {
            setLocationError("Geolocation is not supported by your browser");
            return;
        }
        setIsLocating(true);
        setLocationError(null);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setFirstLocation(l => ({
                    ...l,
                    lat: latitude.toFixed(6),
                    lon: longitude.toFixed(6)
                }));
                setIsLocating(false);
            },
            (error) => {
                console.error("Error getting location:", error);
                setLocationError("Unable to retrieve location. Please check permissions.");
                setIsLocating(false);
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    const handleNextStep = () => {
        if (step === 1) {
            setUserProfile(prev => ({ ...prev, name: profileData.name }));
            setBusinessProfile(prev => ({ ...prev, name: profileData.farmName }));
        }
        setStep(prev => prev + 1);
    };

    const handleFinish = () => {
        const newLocation: FarmLocation = {
            id: Date.now(),
            name: firstLocation.name,
            size: firstLocation.size,
            unit: 'Hectares',
            lat: firstLocation.lat,
            lon: firstLocation.lon
        };
        setFarmLocations([newLocation]);
        onComplete();
    };

    const ProgressBar = () => (
        <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
                {[
                    { num: 1, name: 'Phase 1: Profile' },
                    { num: 2, name: 'Phase 2: Enterprise' },
                    { num: 3, name: 'Phase 3: Location' }
                ].map(p => (
                    <div key={p.num} className="flex flex-col items-center flex-1">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                            step >= p.num ? 'bg-[#4C9A2A] text-white shadow-md scale-110' : 'bg-gray-200 text-gray-500'
                        }`}>
                            {p.num}
                        </div>
                        <span className={`text-[11px] font-semibold mt-1.5 transition-colors ${
                            step >= p.num ? 'text-[#1E5631]' : 'text-gray-400'
                        }`}>
                            {p.name}
                        </span>
                    </div>
                ))}
            </div>
            <div className="relative w-full h-1.5 bg-gray-200 rounded-full overflow-hidden mt-3">
                <div 
                    className="absolute top-0 left-0 h-full bg-[#4C9A2A] transition-all duration-500 ease-out"
                    style={{ width: `${((step - 1) / 2) * 100}%` }}
                ></div>
            </div>
        </div>
    );
    
    const inputClasses = "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-gray-700 bg-gray-50";

    return (
        <div className="fixed inset-0 bg-slate-100 z-50 flex justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-6 sm:p-8 my-auto transform transition-all">
                <h2 className="text-xl sm:text-2xl font-bold text-center text-gray-800 mb-2">Welcome to The Agric App!</h2>
                <p className="text-center text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">Let's complete your account opening in 3 quick phases.</p>
                
                {/* Starter Tier Setup Notice */}
                <div className="bg-[#EAF5E5] border border-green-200 rounded-xl p-4 mb-6 flex flex-col items-center text-center">
                    <span className="bg-[#4C9A2A] text-white text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full mb-2">
                        Starter Tier Active
                    </span>
                    <p className="text-xs text-green-800 font-medium leading-relaxed">
                        Every new sign-up starts on our free <strong>Starter Tier</strong>. These 3 account opening phases set up your initial profile, enterprises, and first location mapping. Upgrade anytime from your dashboard after completing this basic setup!
                    </p>
                </div>
                
                <ProgressBar />

                {step === 1 && (
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-gray-700 text-center">Phase 1: Your Profile Details</h3>
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-600 mb-1">Your Full Name</label>
                            <input
                                id="name"
                                type="text"
                                value={profileData.name}
                                onChange={e => setProfileData(p => ({ ...p, name: e.target.value }))}
                                className={inputClasses}
                                placeholder="e.g., John Doe"
                            />
                        </div>
                        <div>
                            <label htmlFor="farmName" className="block text-sm font-medium text-gray-600 mb-1">Your Farm's Name</label>
                            <input
                                id="farmName"
                                type="text"
                                value={profileData.farmName}
                                onChange={e => setProfileData(p => ({ ...p, farmName: e.target.value }))}
                                className={inputClasses}
                                placeholder="e.g., Green Valley Farms"
                            />
                        </div>
                         <div className="text-right pt-2">
                             <button onClick={handleNextStep} className="bg-[#4C9A2A] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#1E5631] transition-colors w-full sm:w-auto">Next</button>
                        </div>
                    </div>
                )}
                
                {step === 2 && (
                    <div className="space-y-6">
                         <h3 className="text-lg font-semibold text-gray-700 text-center">Phase 2: Your Agricultural Enterprise Selection</h3>
                         <p className="text-center text-gray-500 text-sm -mt-4">What do you grow or raise? Select all that apply.</p>
                         <MultiSelectPills
                            title="Crops Produced"
                            options={SUPPORTED_ENTERPRISE_CROPS}
                            selected={selectedCrops}
                            onToggle={(crop) => setSelectedCrops(prev => prev.includes(crop) ? prev.filter(c => c !== crop) : [...prev, crop])}
                         />
                         <MultiSelectPills
                            title="Livestock Reared"
                            options={SUPPORTED_LIVESTOCK}
                            selected={selectedLivestock}
                            onToggle={(animal) => setSelectedLivestock(prev => prev.includes(animal) ? prev.filter(a => a !== animal) : [...prev, animal])}
                         />
                         <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-3 pt-2">
                            <button onClick={() => setStep(1)} className="w-full sm:w-auto bg-gray-200 text-gray-800 px-6 py-2 rounded-lg font-semibold hover:bg-gray-300">Back</button>
                            <button onClick={handleNextStep} className="w-full sm:w-auto bg-[#4C9A2A] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#1E5631]">Next</button>
                         </div>
                    </div>
                )}
                
                {step === 3 && (
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-gray-700 text-center">Phase 3: Digital Farm Location & Size</h3>
                        <p className="text-center text-gray-500 text-sm -mt-4">Let's add your first field or pasture.</p>
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-center">
                            <p className="text-xs text-amber-700 font-semibold">
                                ⚠️ Starter Tier limit: 1 farm location mapping allowed. Additional locations can be mapped after upgrading.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                             <div className="sm:col-span-2">
                                <label htmlFor="locationName" className="block text-sm font-medium text-gray-600 mb-1">Location Name</label>
                                <input
                                    id="locationName"
                                    type="text"
                                    value={firstLocation.name}
                                    onChange={e => setFirstLocation(l => ({ ...l, name: e.target.value }))}
                                    className={inputClasses}
                                    placeholder="e.g., North Field"
                                />
                            </div>
                            <div className="sm:col-span-2">
                                <label htmlFor="locationSize" className="block text-sm font-medium text-gray-600 mb-1">Size (in Hectares)</label>
                                <input
                                    id="locationSize"
                                    type="number"
                                    value={firstLocation.size}
                                    onChange={e => setFirstLocation(l => ({ ...l, size: e.target.value }))}
                                    className={inputClasses}
                                    placeholder="e.g., 10"
                                />
                            </div>
                            <div className="sm:col-span-2 flex flex-col gap-2">
                                <button
                                    type="button"
                                    onClick={handleCaptureCoordinates}
                                    disabled={isLocating}
                                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-[#4C9A2A] rounded-lg text-[#4C9A2A] hover:bg-green-50 font-semibold transition-colors disabled:opacity-50 cursor-pointer"
                                >
                                    {isLocating ? (
                                        <>
                                            <svg className="animate-spin h-4 w-4 text-[#4C9A2A]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            <span>Fetching coordinates...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-icons-outlined text-sm">my_location</span>
                                            <span>Auto-Detect My Farm Coordinates</span>
                                        </>
                                    )}
                                </button>
                                {locationError && (
                                    <p className="text-xs text-red-500 text-center font-medium">{locationError}</p>
                                )}
                            </div>
                            <div>
                                <label htmlFor="latitude" className="block text-sm font-medium text-gray-600 mb-1">Latitude (Optional)</label>
                                <input
                                    id="latitude"
                                    type="text"
                                    value={firstLocation.lat}
                                    onChange={e => setFirstLocation(l => ({ ...l, lat: e.target.value }))}
                                    className={inputClasses}
                                    placeholder="e.g., 6.1234"
                                />
                            </div>
                            <div>
                                <label htmlFor="longitude" className="block text-sm font-medium text-gray-600 mb-1">Longitude (Optional)</label>
                                <input
                                    id="longitude"
                                    type="text"
                                    value={firstLocation.lon}
                                    onChange={e => setFirstLocation(l => ({ ...l, lon: e.target.value }))}
                                    className={inputClasses}
                                    placeholder="e.g., 7.4567"
                                />
                            </div>
                        </div>
                         <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-3 pt-2">
                            <button onClick={() => setStep(2)} className="w-full sm:w-auto bg-gray-200 text-gray-800 px-6 py-2 rounded-lg font-semibold hover:bg-gray-300">Back</button>
                            <button onClick={handleFinish} className="w-full sm:w-auto bg-[#4C9A2A] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#1E5631]">Finish & Go to Dashboard</button>
                         </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OnboardingWizard;
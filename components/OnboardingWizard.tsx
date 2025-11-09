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
        <div className="flex items-center justify-center space-x-2 sm:space-x-4 mb-6 sm:mb-8">
            {[1, 2, 3].map(s => (
                <React.Fragment key={s}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold transition-colors flex-shrink-0 ${
                        step >= s ? 'bg-[#4C9A2A] text-white' : 'bg-gray-200 text-gray-500'
                    }`}>
                        {s}
                    </div>
                    {s < 3 && <div className={`h-1 flex-grow ${step > s ? 'bg-[#4C9A2A]' : 'bg-gray-200'}`}></div>}
                </React.Fragment>
            ))}
        </div>
    );
    
    const inputClasses = "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-gray-700 bg-gray-50";

    return (
        <div className="fixed inset-0 bg-slate-100 z-50 flex justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-6 sm:p-8 my-auto transform transition-all">
                <h2 className="text-xl sm:text-2xl font-bold text-center text-gray-800 mb-2">Welcome to The Agric App!</h2>
                <p className="text-center text-gray-600 mb-6 sm:mb-8 text-sm sm:text-base">Let's get your digital farm set up in a few quick steps.</p>
                
                <ProgressBar />

                {step === 1 && (
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-gray-700 text-center">Step 1: Your Profile</h3>
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
                         <h3 className="text-lg font-semibold text-gray-700 text-center">Step 2: Your Enterprise Line</h3>
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
                        <h3 className="text-lg font-semibold text-gray-700 text-center">Step 3: Your First Location</h3>
                        <p className="text-center text-gray-500 text-sm -mt-4">Let's add your first field or pasture.</p>
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
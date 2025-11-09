import html2canvas from 'html2canvas';
import React, { useEffect, useMemo, useRef, useState } from 'react';

import {
    ClipboardIcon, CroppingPlannerIcon, EditIcon, ExpenditureIcon, HeartIcon, IncomeIcon,
    LivestockPlannerIcon, LocationMarkerIcon, MailIcon, MenuIcon, PhoneIcon, ReceiptGeneratorIcon,
    ShareIcon, StethoscopeIcon, StoreManagementIcon, UserIcon
} from '../constants';

import type { 
    UserProfile, BusinessProfile, FinancialDocument, ActivityLog, TeamMember, LivestockRecord, HealthEvent, CropPlan, LivestockTask, InputInventoryItem, ToolEquipmentItem, BreedingRecord, CroppingActivity, FarmLocation
} from '../types';


// --- Helper Functions ---
const formatRelativeTime = (date: Date): string => {
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 5) return "just now";

    let interval = seconds / 31536000;
    if (interval > 1) return `${Math.floor(interval)} years ago`;
    
    interval = seconds / 2592000;
    if (interval > 1) return `${Math.floor(interval)} months ago`;
    
    interval = seconds / 86400;
    if (interval > 1) return `${Math.floor(interval)} days ago`;
    
    interval = seconds / 3600;
    if (interval > 1) return `${Math.floor(interval)} hours ago`;
    
    interval = seconds / 60;
    if (interval > 1) return `${Math.floor(interval)} minutes ago`;
    
    return `${Math.floor(seconds)} seconds ago`;
};


// Reusable Components
const InfoCard = ({ title, children }: { title: string, children?: React.ReactNode }) => (
    <div className="bg-white p-6 rounded-xl shadow-md">
        <h3 className="text-lg font-bold text-gray-800 mb-4">{title}</h3>
        {children}
    </div>
);

const StatCard = ({ title, value, icon, color }: { title: string, value: string | number, icon: React.ReactNode, color: string }) => (
    <div className={`p-4 rounded-lg flex items-center space-x-3 ${color}`}>
        <div className="flex-shrink-0">{icon}</div>
        <div>
            <p className="text-xl font-bold text-gray-800">{value}</p>
            <p className="text-sm font-medium text-gray-600">{title}</p>
        </div>
    </div>
);

const inputClasses = "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-gray-700 bg-gray-50";
const textareaClasses = `${inputClasses} min-h-[100px]`;


// Shareable Profile Card Component
type ActivityStat = {
    title: string;
    value: string | number;
    icon: React.ReactElement<{ className?: string }>;
    color: string;
}

const ShareableProfileCard = React.forwardRef<HTMLDivElement, { userProfile: UserProfile, businessProfile: BusinessProfile, stats: ActivityStat[] }>(
    ({ userProfile, businessProfile, stats }, ref) => {
        return (
            <div ref={ref} style={{ width: '600px', height: 'auto', fontFamily: "'Inter', sans-serif" }} className="p-8 bg-white font-sans text-gray-800">
                <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                        <div className="relative flex-shrink-0">
                          <div className="w-10 h-10 bg-[#1E5631]/10 rounded-full flex items-center justify-center">
                             <div className="w-6 h-6 bg-[#1E5631]/20 rounded-full"></div>
                          </div>
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-green-500 rounded-full shadow-[0_0_12px_4px] shadow-green-400/50"></div>
                        </div>
                        <h1 className="text-lg font-bold text-gray-800 tracking-wider whitespace-nowrap">THE AGRIC APP</h1>
                    </div>
                </div>

                <div className="flex items-start gap-6 mt-8">
                    <img src={userProfile.avatar} alt="User Avatar" className="w-28 h-28 rounded-full object-cover border-4 border-gray-100 flex-shrink-0" />
                    <div className="grid grid-cols-[auto_1px_1fr] gap-x-6 flex-grow pt-2">
                        {/* User Info */}
                        <div>
                            <h3 className="text-2xl font-bold text-gray-900">{userProfile.name}</h3>
                            <p className="text-base text-gray-600 font-medium">{userProfile.role}</p>
                            <p className="text-sm text-gray-500 mt-1">{businessProfile.name}</p>
                        </div>
                
                        {/* Vertical Divider */}
                        <div className="w-px bg-gray-200"></div>
                
                        {/* Contact Info */}
                        <div className="space-y-2 text-sm text-gray-700 pt-1">
                             <div className="flex items-start gap-3">
                                <MailIcon className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                                <span>{userProfile.email}</span>
                            </div>
                            <div className="flex items-start gap-3">
                                <PhoneIcon className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                                <span>{userProfile.phone}</span>
                            </div>
                            <div className="flex items-start gap-3">
                                <LocationMarkerIcon className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                                <span className="break-words">{businessProfile.address}</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="mt-8">
                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Activity Stats</h4>
                    <div className="grid grid-cols-3 gap-4">
                        {stats.map(stat => (
                            <div key={stat.title} className={`${stat.color} p-4 rounded-lg flex flex-col items-center justify-center text-center`}>
                                {React.cloneElement(stat.icon, { className: 'h-8 w-8 mx-auto mb-2 opacity-80' })}
                                <div className="text-2xl font-bold text-gray-800">{stat.value}</div>
                                <div className="text-xs font-medium text-gray-600 mt-1">{stat.title}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-8 pt-4 border-t border-gray-200 text-center">
                    <p className="text-xs text-gray-400">Profile generated by The Agric App | &copy; {new Date().getFullYear()}</p>
                </div>
            </div>
        );
    }
);


interface UserProfilePageProps {
    setSidebarOpen: (isOpen: boolean) => void;
    userProfile: UserProfile;
    setUserProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
    businessProfile: BusinessProfile;
    incomeRecords: FinancialDocument[];
    expenditureRecords: FinancialDocument[];
    currentUser: TeamMember;
    activityLog: ActivityLog[];
    animals: LivestockRecord[];
    healthEvents: HealthEvent[];
    cropPlans: CropPlan[];
    livestockTasks: LivestockTask[];
    croppingActivities: CroppingActivity[];
    inputsInventory: InputInventoryItem[];
    toolsEquipment: ToolEquipmentItem[];
    breedingRecords: BreedingRecord[];
    farmLocations: FarmLocation[];
}

const UserProfilePage = ({ 
    setSidebarOpen, 
    userProfile, 
    setUserProfile, 
    businessProfile, 
    incomeRecords, 
    expenditureRecords,
    currentUser,
    activityLog,
    animals,
    healthEvents,
    cropPlans,
    livestockTasks,
    croppingActivities,
    inputsInventory,
    toolsEquipment,
    breedingRecords,
    farmLocations,
}: UserProfilePageProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<UserProfile>(userProfile);
    const [isGenerating, setIsGenerating] = useState(false);
    const shareableProfileRef = useRef<HTMLDivElement>(null);

    // Sync form data when editing starts or profile data changes
    useEffect(() => {
        setFormData(userProfile);
    }, [userProfile, isEditing]);

    const activityStats: ActivityStat[] = useMemo(() => {
        const role = userProfile.role;

        // Common calculations
        const totalLivestockCount = animals.reduce((acc, animal) => {
            if (animal.trackingType === 'BATCH') return acc + animal.quantity;
            if (animal.trackingType === 'INDIVIDUAL' && animal.healthStatus !== 'Dead') return acc + 1;
            return acc;
        }, 0);

        const totalFinancialDocs = incomeRecords.length + expenditureRecords.length;
        
        const today = new Date();
        today.setHours(0,0,0,0);
        const activeCropPlans = cropPlans.filter(p => {
            const plantingDate = new Date(p.plantingDate);
            plantingDate.setHours(0,0,0,0);
            const harvestDate = new Date(p.harvestDate);
            harvestDate.setHours(23,59,59,999);
            return plantingDate <= today && harvestDate >= today;
        });
        const activeCropPlansCount = activeCropPlans.length;
        
        const completedLivestockTasksCount = livestockTasks.filter(t => t.status === 'Done').length;
        
        const completedTasksAndActivities = 
            croppingActivities.filter(a => a.status === 'Done').length +
            livestockTasks.filter(t => t.status === 'Done').length +
            cropPlans.flatMap(p => p.tasks).filter(t => t.completed).length;


        switch (role) {
            case 'Farm Manager':
                const totalFarmSize = (farmLocations || []).reduce((sum, loc) => sum + (parseFloat(loc.size) || 0), 0);
                return [
                    { title: "Crops Managed", value: cropPlans.length, icon: <CroppingPlannerIcon className="h-8 w-8 text-green-700" />, color: "bg-green-100" },
                    { title: "Livestock Count", value: totalLivestockCount, icon: <LivestockPlannerIcon className="h-8 w-8 text-blue-700" />, color: "bg-blue-100" },
                    { title: "Farm Size", value: `${totalFarmSize.toFixed(2)} Ha`, icon: <LocationMarkerIcon className="h-8 w-8 text-amber-700" />, color: "bg-amber-100" }
                ];

            case 'Accountant':
                const totalIncome = '₦' + incomeRecords.reduce((sum, r) => sum + r.totalAmount, 0).toLocaleString();
                const customerBase = new Set([...incomeRecords.map(r => r.customerName), ...expenditureRecords.map(r => r.customerName)]).size;
                return [
                    { title: "Financial Documents", value: totalFinancialDocs, icon: <ReceiptGeneratorIcon className="h-8 w-8 text-red-700" />, color: "bg-red-100" },
                    { title: "Total Income Logged", value: totalIncome, icon: <IncomeIcon className="h-8 w-8 text-green-700"/>, color: "bg-green-100" },
                    { title: "Customer Base", value: customerBase, icon: <UserIcon className="h-8 w-8 text-sky-700"/>, color: "bg-sky-100" }
                ];

            case 'Store Manager':
                return [
                    { title: "Input Items Managed", value: inputsInventory.length, icon: <StoreManagementIcon className="h-8 w-8 text-orange-700" />, color: "bg-orange-100" },
                    { title: "Tools & Equipment", value: toolsEquipment.length, icon: <ClipboardIcon className="h-8 w-8 text-slate-700"/>, color: "bg-slate-100" },
                    { title: "Documents Processed", value: totalFinancialDocs, icon: <ReceiptGeneratorIcon className="h-8 w-8 text-red-700" />, color: "bg-red-100" }
                ];

            case 'Field Officer':
            case 'Agronomist':
                const cultivatedLand = activeCropPlans.reduce((sum, p) => sum + p.landSize, 0);
                return [
                     { title: "Active Crop Plans", value: activeCropPlansCount, icon: <CroppingPlannerIcon className="h-8 w-8 text-green-700" />, color: "bg-green-100" },
                     { title: "Cultivated Land", value: `${cultivatedLand.toFixed(2)} Ha`, icon: <CroppingPlannerIcon className="h-8 w-8 text-amber-700" />, color: "bg-amber-100" },
                     { title: "Completed Tasks & Activities", value: completedTasksAndActivities, icon: <ClipboardIcon className="h-8 w-8 text-purple-700"/>, color: "bg-purple-100" }
                ];

            case 'Livestock Officer':
                return [
                    { title: "Livestock Count", value: totalLivestockCount, icon: <LivestockPlannerIcon className="h-8 w-8 text-blue-700" />, color: "bg-blue-100" },
                    { title: "Health Events Logged", value: healthEvents.length, icon: <StethoscopeIcon className="h-8 w-8 text-red-700" />, color: "bg-red-100" },
                    { title: "Completed Tasks", value: completedLivestockTasksCount, icon: <ClipboardIcon className="h-8 w-8 text-purple-700"/>, color: "bg-purple-100" }
                ];
                
            case 'Veterinary Officer':
                 const completedBreedingRecords = breedingRecords.filter(b => b.status === 'Completed').length;
                return [
                    { title: "Livestock Count", value: totalLivestockCount, icon: <LivestockPlannerIcon className="h-8 w-8 text-blue-700" />, color: "bg-blue-100" },
                    { title: "Health Events Logged", value: healthEvents.length, icon: <StethoscopeIcon className="h-8 w-8 text-red-700" />, color: "bg-red-100" },
                    { title: "Breeding Activity", value: completedBreedingRecords, icon: <HeartIcon className="h-8 w-8 text-pink-700" />, color: "bg-pink-100" }
                ];
            
            default: // Fallback to Farm Manager stats
                 const totalFarmSizeDefault = (farmLocations || []).reduce((sum, loc) => sum + (parseFloat(loc.size) || 0), 0);
                return [
                    { title: "Crops Managed", value: cropPlans.length, icon: <CroppingPlannerIcon className="h-8 w-8 text-green-700" />, color: "bg-green-100" },
                    { title: "Livestock Count", value: totalLivestockCount, icon: <LivestockPlannerIcon className="h-8 w-8 text-blue-700" />, color: "bg-blue-100" },
                    { title: "Farm Size", value: `${totalFarmSizeDefault.toFixed(2)} Ha`, icon: <LocationMarkerIcon className="h-8 w-8 text-amber-700" />, color: "bg-amber-100" }
                ];
        }
    }, [userProfile.role, incomeRecords, expenditureRecords, animals, healthEvents, cropPlans, livestockTasks, croppingActivities, inputsInventory, toolsEquipment, breedingRecords, farmLocations]);

    const userActivity = useMemo(() => {
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

        if (!currentUser || !activityLog) return [];

        return activityLog
            .filter(log => log.userId === currentUser.id && log.date >= oneMonthAgo)
            .sort((a, b) => b.date.getTime() - a.date.getTime())
            .slice(0, 50);
    }, [activityLog, currentUser]);

    const handleEditToggle = () => {
        setIsEditing(prev => !prev);
    };

    const handleSave = () => {
        setUserProfile(formData);
        setIsEditing(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({...prev, [e.target.name]: e.target.value }));
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setFormData(prev => ({ ...prev, avatar: event.target?.result as string }));
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const handleShareProfile = async () => {
        if (!shareableProfileRef.current || isGenerating) return;

        setIsGenerating(true);

        try {
            const canvas = await html2canvas(shareableProfileRef.current, {
                useCORS: true, // For external images like the avatar
                scale: 2, // For better resolution
                backgroundColor: null,
            });
            const dataUrl = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = 'the-agric-app-profile.png';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error("Failed to generate profile image:", error);
            alert("Sorry, there was an error generating your profile image. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <main className="flex-1 w-full p-4 md:p-6 lg:p-8 bg-slate-100 overflow-y-auto">
            <header className="mb-8 flex items-center justify-between">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-700">User Profile</h2>
                <button
                    onClick={() => setSidebarOpen(true)}
                    className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-200 md:hidden"
                    aria-label="Open sidebar"
                >
                    <MenuIcon />
                </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Profile Header */}
                    <div className="bg-white p-6 rounded-xl shadow-md flex flex-col sm:flex-row items-center gap-6">
                        <div className="relative flex-shrink-0">
                            <img src={formData.avatar} alt="User Avatar" className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg" />
                            {isEditing && (
                                <label htmlFor="avatar-upload" className="absolute bottom-1 right-1 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
                                    <EditIcon className="h-4 w-4" />
                                    <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                                </label>
                            )}
                        </div>
                        <div className="flex-grow text-center sm:text-left">
                            {isEditing ? (
                                <input type="text" name="name" value={formData.name} onChange={handleChange} className={`${inputClasses} text-2xl font-bold`} />
                            ) : (
                                <h3 className="text-2xl md:text-3xl font-bold text-gray-800">{userProfile.name}</h3>
                            )}
                             <div className="mt-1">
                                {isEditing ? (
                                     <input type="text" name="role" value={formData.role} readOnly className={`${inputClasses} bg-gray-200 cursor-not-allowed`} title="Role is managed by administrator in Settings."/>
                                ) : (
                                    <p className="text-gray-500 font-medium">{userProfile.role}</p>
                                )}
                            </div>
                        </div>
                        <div className="flex-shrink-0">
                           {isEditing ? (
                                <div className="flex gap-2">
                                    <button onClick={handleEditToggle} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold text-sm">Cancel</button>
                                    <button onClick={handleSave} className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold text-sm">Save</button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 flex-col sm:flex-row">
                                     <button
                                        onClick={handleShareProfile}
                                        disabled={isGenerating}
                                        className="flex w-full sm:w-auto items-center justify-center space-x-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-sm disabled:bg-gray-200 disabled:cursor-wait"
                                    >
                                        <ShareIcon />
                                        <span>{isGenerating ? 'Generating...' : 'Share Profile'}</span>
                                    </button>
                                    <button onClick={handleEditToggle} className="flex w-full sm:w-auto items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-sm">
                                        <EditIcon />
                                        <span>Edit Profile</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Activity Stats */}
                     <InfoCard title="Activity Stats">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {activityStats.map(stat => (
                                // FIX: Added a unique key prop to the StatCard component.
                                <StatCard 
                                    key={stat.title}
                                    title={stat.title} 
                                    value={stat.value} 
                                    icon={stat.icon} 
                                    color={stat.color} 
                                />
                            ))}
                        </div>
                    </InfoCard>

                    {/* Recent Activity */}
                    <InfoCard title="Recent Activity">
                        <ul className="space-y-4">
                           {userActivity.length > 0 ? (
                                userActivity.map(log => (
                                    <li key={log.id} className="flex items-center space-x-4">
                                        <div className="bg-gray-100 p-2 rounded-full">{React.cloneElement(log.icon, { className: 'h-5 w-5 text-gray-500' })}</div>
                                        <div className="flex-grow">
                                            <p className="text-sm text-gray-800">{log.text}</p>
                                            <p className="text-xs text-gray-400">{formatRelativeTime(log.date)}</p>
                                        </div>
                                    </li>
                                ))
                            ) : (
                                <p className="text-sm text-gray-500 text-center py-4">No recent activity in the last month.</p>
                            )}
                        </ul>
                    </InfoCard>
                </div>
                {/* Right Column */}
                <div className="lg:col-span-1 space-y-8">
                    <InfoCard title="About">
                         {isEditing ? (
                            <textarea name="bio" value={formData.bio} onChange={handleChange} className={textareaClasses}></textarea>
                        ) : (
                           <p className="text-gray-600 text-sm leading-relaxed">{userProfile.bio || 'No bio available.'}</p>
                        )}
                    </InfoCard>
                     <InfoCard title="Contact & Farm Info">
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between items-center">
                                <span className="font-medium text-gray-500">Email</span>
                                {isEditing ? (
                                    <input type="email" name="email" value={formData.email} onChange={handleChange} className={`${inputClasses} text-right w-2/3`} />
                                ) : (
                                    <span className="text-gray-800 font-semibold text-right truncate">{userProfile.email}</span>
                                )}
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="font-medium text-gray-500">Phone</span>
                                {isEditing ? (
                                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className={`${inputClasses} text-right w-2/3`} />
                                ) : (
                                    <span className="text-gray-800 font-semibold text-right">{userProfile.phone}</span>
                                )}
                            </div>
                            
                            <div className="pt-3 mt-2 border-t">
                                <div className="flex justify-between items-start">
                                    <span className="font-medium text-gray-500">Farm Info <span className="text-xs font-normal">(from Settings)</span></span>
                                    <div className="text-right">
                                        <p className="text-gray-800 font-semibold">{businessProfile.name}</p>
                                        <p className="text-gray-500 text-xs">{businessProfile.address}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </InfoCard>
                </div>
            </div>
            
            {/* Hidden Shareable Profile Card, positioned off-screen */}
            <div className="absolute -left-[9999px] top-0" aria-hidden="true">
                <ShareableProfileCard
                    ref={shareableProfileRef}
                    userProfile={userProfile}
                    businessProfile={businessProfile}
                    stats={activityStats}
                />
            </div>
        </main>
    );
};

export default UserProfilePage;
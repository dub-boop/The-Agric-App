
import React, { useState, useEffect, useMemo } from 'react';
import { MenuIcon, PERMISSIONS, TrashIcon, SUPPORTED_ENTERPRISE_CROPS, SUPPORTED_LIVESTOCK, ChevronDownIcon, EditIcon, DEFAULT_PERMISSIONS, MailIcon, TEAM_MEMBER_ROLES, ArrowUpIcon, generateAvatar, SettingsIcon } from '../constants';
import type { BusinessProfile, FarmLocation, TeamMember, TeamMemberRole, UserProfile } from '../types';

// Reusable sub-components for the settings page

const SettingsCard = ({ title, children, className = '', isOpen, onToggle }: {
    title: string;
    children?: React.ReactNode;
    className?: string;
    isOpen: boolean;
    onToggle: () => void;
}) => (
    <div className={`bg-white rounded-xl shadow-md transition-all duration-300 ${className}`}>
        {/* Clickable Header */}
        <button
            type="button"
            onClick={onToggle}
            className="w-full flex justify-between items-center p-6 md:p-8 text-left"
            aria-expanded={isOpen}
            aria-controls={`section-${title.replace(/\s/g, '-')}`}
        >
            <h3 className="text-xl font-bold text-gray-800">{title}</h3>
            <ChevronDownIcon className={`h-6 w-6 text-gray-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        
        {/* Collapsible Content */}
        <div
            id={`section-${title.replace(/\s/g, '-')}`}
            className={`transition-[max-height] duration-500 ease-in-out overflow-hidden ${isOpen ? 'max-h-[2000px]' : 'max-h-0'}`}
        >
            <div className="px-6 md:px-8 pb-6 md:pb-8">
                {children}
            </div>
        </div>
    </div>
);


const InputField = ({ label, id, type = 'text', placeholder = '', value = '' }: { label: string, id: string, type?: string, placeholder?: string, value?: string }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
    <input 
      type={type} 
      id={id} 
      placeholder={placeholder} 
      defaultValue={value} 
      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-gray-700 bg-gray-50"
    />
  </div>
);

// Controlled versions of inputs for dynamic forms
const ControlledInputField = ({ label, id, type = 'text', placeholder = '', value, onChange, name }: { label: string, id: string, type?: string, placeholder?: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, name?: string }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
    <input 
      type={type} 
      id={id} 
      name={name || id}
      placeholder={placeholder} 
      value={value}
      onChange={onChange}
      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-gray-700 bg-gray-50"
    />
  </div>
);

const ControlledFileInput = ({ label, id, onChange }: { label: string, id: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) => (
     <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
        <input 
            type="file" 
            id={id}
            name={id}
            accept="image/*"
            onChange={onChange} 
            className="block w-full text-sm text-gray-700 border border-gray-300 rounded-md cursor-pointer bg-gray-50 file:border-0 file:bg-gray-100 file:mr-4 file:py-2 file:px-4"
        />
    </div>
);


const ControlledSelectField = ({ label, id, value, onChange, children, name }: { label: string, id: string, value: string, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void, children?: React.ReactNode, name?: string }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
        <select 
            id={id} 
            name={name || id} 
            value={value}
            onChange={onChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-gray-700 bg-gray-50 h-[42px]"
        >
            {children}
        </select>
    </div>
);

const PermissionCheckbox = ({ label, id, checked, onChange }: { label: string, id: string, checked: boolean, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) => (
  <div className="flex items-center">
    <input id={id} name={id} type="checkbox" checked={checked} onChange={onChange} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
    <label htmlFor={id} className="ml-3 block text-sm text-gray-700">{label}</label>
  </div>
);

const ActionButton = ({ children, onClick, variant = 'primary', type = 'button', disabled = false }: { children?: React.ReactNode, onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void, variant?: 'primary' | 'danger' | 'secondary', type?: 'button' | 'submit' | 'reset', disabled?: boolean }) => {
    const baseClasses = "px-5 py-2 rounded-md text-sm font-semibold transition-colors shadow-sm disabled:bg-gray-300 disabled:cursor-not-allowed";
    const variantClasses = {
        primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
        danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-2 focus:ring-offset-2 focus:ring-red-500",
        secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-2 focus:ring-offset-2 focus:ring-gray-400",
    }
    return <button type={type} onClick={onClick} disabled={disabled} className={`${baseClasses} ${variantClasses[variant]}`}>{children}</button>
}

// Multi-select component for Enterprise Line
const MultiSelectPills = ({ title, options, selected, onToggle }: {
  title: string;
  options: string[];
  selected: string[];
  onToggle: (option: string) => void;
}) => (
    <div>
        <h5 className="text-gray-700 font-semibold mb-3">{title}</h5>
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

interface SettingsPageProps {
  setSidebarOpen: (isOpen: boolean) => void;
  selectedLivestock: string[];
  setSelectedLivestock: React.Dispatch<React.SetStateAction<string[]>>;
  selectedCrops: string[];
  setSelectedCrops: React.Dispatch<React.SetStateAction<string[]>>;
  businessProfile: BusinessProfile;
  setBusinessProfile: React.Dispatch<React.SetStateAction<BusinessProfile>>;
  farmLocations: FarmLocation[];
  setFarmLocations: React.Dispatch<React.SetStateAction<FarmLocation[]>>;
  teamMembers: TeamMember[];
  setTeamMembers: React.Dispatch<React.SetStateAction<TeamMember[]>>;
  currentUserPlan: 'Starter' | 'Pro' | 'Premium';
  onUpgradePlan?: () => void;
  onLogout?: () => void;
  onDeleteAccount?: () => void;
  onDeleteFarmLocation?: (id: number) => void;
  userProfile: UserProfile;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  onAddActivity?: (text: string, icon: string) => void;
}

// Main Settings Page Component
const SettingsPage = ({ 
  setSidebarOpen, 
  selectedLivestock, 
  setSelectedLivestock, 
  selectedCrops, 
  setSelectedCrops, 
  businessProfile, 
  setBusinessProfile, 
  farmLocations, 
  setFarmLocations,
  teamMembers,
  setTeamMembers,
  currentUserPlan,
  onUpgradePlan,
  onLogout,
  onDeleteAccount,
  onDeleteFarmLocation,
  userProfile,
  setUserProfile,
  onAddActivity
}: SettingsPageProps) => {
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
    const [memberToDelete, setMemberToDelete] = useState<TeamMember | null>(null);
    const [farmToDelete, setFarmToDelete] = useState<FarmLocation | null>(null);
    const [openSections, setOpenSections] = useState({
        'Profile': true,
        'Business Profile': true,
        'Farm Preferences': true,
        'Subscription & Billing': true,
        'Team Management': true,
    });
    const [enterpriseDomains, setEnterpriseDomains] = useState({ crop: true, livestock: true });
    
    const [profileForm, setProfileForm] = useState(businessProfile);
    const [userProfileForm, setUserProfileForm] = useState(userProfile);
    const [userPassword, setUserPassword] = useState('');

    useEffect(() => {
        setUserProfileForm(userProfile);
    }, [userProfile]);

    const handleUserProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setUserProfileForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveUserProfile = () => {
        setUserProfile(userProfileForm);
        if (onAddActivity) {
            onAddActivity('Updated user profile details', 'settings');
        }
        if (userPassword) {
            alert('Profile and password saved successfully!');
            setUserPassword('');
        } else {
            alert('Profile saved successfully!');
        }
    };

    const handleSavePreferences = () => {
        if (onAddActivity) {
            onAddActivity('Updated farm preferences and production settings', 'settings');
        }
        alert('Farm preferences saved successfully!');
    };
    
    // Team Management State
    const [newMemberEmail, setNewMemberEmail] = useState('');
    const [newMemberRole, setNewMemberRole] = useState<TeamMemberRole>('Field Officer');
    const [newMemberFarmId, setNewMemberFarmId] = useState<string>('all');
    const [newMemberPermissions, setNewMemberPermissions] = useState<string[]>(DEFAULT_PERMISSIONS['Field Officer']);
    const [editingMemberId, setEditingMemberId] = useState<string | null>(null);

    const farmLocationMap = useMemo(() => new Map(farmLocations.map(loc => [loc.id, loc.name])), [farmLocations]);

    useEffect(() => {
        setProfileForm(businessProfile);
    }, [businessProfile]);

    // Effect to set default permissions when role changes for a new member
    useEffect(() => {
        if (!editingMemberId) {
            setNewMemberPermissions(DEFAULT_PERMISSIONS[newMemberRole] || []);
        }
    }, [newMemberRole, editingMemberId]);

    const toggleSection = (sectionTitle: string) => {
        setOpenSections(prev => ({ ...prev, [sectionTitle]: !prev[sectionTitle] }));
    };

    const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setProfileForm(prev => ({ ...prev, [name]: value }));
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setProfileForm(prev => ({ ...prev, logo: event.target?.result as string }));
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const handleSaveBusinessInfo = () => {
        setBusinessProfile(profileForm);
        alert('Business profile saved!');
    };


    const handleFarmChange = (id: number, field: keyof Omit<FarmLocation, 'id'>, value: string) => {
        setFarmLocations(currentFarms =>
            currentFarms.map(farm => (farm.id === id ? { ...farm, [field]: value, unit: 'Hectares' } : farm))
        );
    };

    const handleAddFarm = () => {
        setFarmLocations(currentFarms => [
            ...currentFarms,
            { id: Date.now(), name: '', lat: '', lon: '', size: '', unit: 'Hectares' },
        ]);
    };

    const handleRemoveFarm = (id: number) => {
        const farm = farmLocations.find(f => f.id === id);
        if (farm) {
            setFarmToDelete(farm);
        }
    };
    
    const handleDomainChange = (domain: 'crop' | 'livestock') => {
        setEnterpriseDomains(prev => ({ ...prev, [domain]: !prev[domain] }));
    };

    const handleToggleCrop = (crop: string) => {
        setSelectedCrops(prev => 
            prev.includes(crop) 
                ? prev.filter(c => c !== crop) 
                : [...prev, crop]
        );
    };

    const handleToggleLivestock = (animal: string) => {
        setSelectedLivestock(prev => 
            prev.includes(animal) 
                ? prev.filter(a => a !== animal) 
                : [...prev, animal]
        );
    };

    // --- Team Management Handlers ---

    const generateAndLogInvite = (email: string) => {
        const inviteToken = `MOCK_TOKEN_FOR_${email.replace(/@/g, '_AT_')}`;
        const inviteUrl = `${window.location.origin}${window.location.pathname}?invite_token=${inviteToken}`;
        console.log(`%c[SIMULATED INVITATION]`, 'color: #4CAF50; font-weight: bold;', `Share this link with ${email} to have them set up their account:`);
        console.log(inviteUrl);
        alert(`Invitation link for ${email} has been logged to the browser console.`);
    };

    const resetTeamForm = () => {
        setNewMemberEmail('');
        setNewMemberRole('Field Officer');
        setNewMemberFarmId('all');
        setNewMemberPermissions(DEFAULT_PERMISSIONS['Field Officer']);
        setEditingMemberId(null);
    };

    const handlePermissionToggle = (permission: string) => {
        setNewMemberPermissions(prev =>
            prev.includes(permission)
                ? prev.filter(p => p !== permission)
                : [...prev, permission]
        );
    };

    const handleAddOrUpdateMember = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (!newMemberEmail.trim()) {
            alert('Please enter a team member\'s email.');
            return;
        }

        const isEmailInUse = teamMembers.some(
            member => member.email.toLowerCase() === newMemberEmail.toLowerCase() && member.id !== editingMemberId
        );

        if (isEmailInUse) {
            alert('A team member with this email already exists.');
            return;
        }

        const memberFarmId = newMemberFarmId === 'all' ? undefined : Number(newMemberFarmId);

        if (editingMemberId) {
            // Update existing member
            setTeamMembers(prev =>
                prev.map(member =>
                    member.id === editingMemberId
                        ? { ...member, email: newMemberEmail, role: newMemberRole, permissions: newMemberPermissions, farmId: memberFarmId }
                        : member
                )
            );
        } else {
            // Add new member
            const nameFromEmail = newMemberEmail.split('@')[0]
                .replace(/[._]/g, ' ')
                .replace(/\b\w/g, l => l.toUpperCase());
            
            const avatarColors = ['#1E5631', '#9A3412', '#5B21B6', '#0D8ABC', '#B91C1C', '#047857', '#6D28D9'];
            const randomColor = avatarColors[Math.floor(Math.random() * avatarColors.length)];

            const newMember: TeamMember = {
                id: `user-${Date.now()}`,
                email: newMemberEmail,
                role: newMemberRole,
                permissions: newMemberPermissions,
                avatar: generateAvatar(nameFromEmail, randomColor, '#fff'),
                status: 'Pending Invitation',
                farmId: memberFarmId,
            };
            setTeamMembers(prev => [...prev, newMember]);
            generateAndLogInvite(newMember.email);
        }
        resetTeamForm();
    };

    const handleStartEdit = (member: TeamMember) => {
        setEditingMemberId(member.id);
        setNewMemberEmail(member.email);
        setNewMemberRole(member.role);
        setNewMemberPermissions(member.permissions);
        setNewMemberFarmId(member.farmId ? String(member.farmId) : 'all');
    };

    const handleDeleteMember = (id: string) => {
        const member = teamMembers.find(m => m.id === id);
        if (member) {
            setMemberToDelete(member);
        }
    };

    const getStatusBadge = (status: TeamMember['status']) => {
        const baseClasses = 'px-2 py-0.5 text-xs font-semibold rounded-full';
        if (status === 'Active') {
            return <span className={`${baseClasses} bg-green-100 text-green-800`}>Active</span>;
        }
        return <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>Pending</span>;
    };


    return (
        <main className="flex-1 w-full p-4 md:p-6 lg:p-8 bg-slate-100 overflow-y-auto">
            <header className="mb-8 flex items-center justify-between">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-700">Settings</h2>
                <button
                    onClick={() => setSidebarOpen(true)}
                    className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-200 md:hidden"
                    aria-label="Open sidebar"
                >
                    <MenuIcon />
                </button>
            </header>
            
            <div className="max-w-3xl mx-auto space-y-8">
                <SettingsCard 
                    title="Profile"
                    isOpen={openSections['Profile']}
                    onToggle={() => toggleSection('Profile')}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <ControlledInputField 
                            label="Full Name" 
                            id="userFullName" 
                            name="name" 
                            value={userProfileForm.name} 
                            onChange={handleUserProfileChange} 
                        />
                        <ControlledInputField 
                            label="Email Address" 
                            id="userEmail" 
                            name="email" 
                            type="email" 
                            value={userProfileForm.email} 
                            onChange={handleUserProfileChange} 
                        />
                        <ControlledInputField 
                            label="Phone Number" 
                            id="userPhone" 
                            name="phone" 
                            type="tel" 
                            value={userProfileForm.phone || ''} 
                            onChange={handleUserProfileChange} 
                        />
                        <ControlledInputField 
                            label="Change Password" 
                            id="userPassword" 
                            name="password" 
                            type="password" 
                            placeholder="New password" 
                            value={userPassword} 
                            onChange={(e) => setUserPassword(e.target.value)} 
                        />
                    </div>
                    <div className="mt-6 text-right">
                        <ActionButton onClick={handleSaveUserProfile}>Save Profile</ActionButton>
                    </div>
                </SettingsCard>
                
                <SettingsCard 
                    title="Business Profile"
                    isOpen={openSections['Business Profile']}
                    onToggle={() => toggleSection('Business Profile')}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <ControlledInputField label="Business Name" id="name" name="name" value={profileForm.name} onChange={handleProfileChange} />
                        <ControlledInputField label="Business Email" id="email" name="email" type="email" value={profileForm.email} onChange={handleProfileChange} />
                        <ControlledInputField label="Phone Number" id="phone" name="phone" type="tel" value={profileForm.phone} onChange={handleProfileChange} />
                        <ControlledInputField label="Address" id="address" name="address" value={profileForm.address} onChange={handleProfileChange} />
                        <div className="md:col-span-2">
                             <ControlledFileInput label="Upload Logo" id="logo" onChange={handleLogoChange} />
                             {profileForm.logo && <img src={profileForm.logo} alt="logo preview" className="mt-4 h-16 w-auto object-contain rounded-md border p-1" />}
                        </div>
                    </div>
                     <div className="mt-6 text-right">
                        <ActionButton onClick={handleSaveBusinessInfo}>Save Business Info</ActionButton>
                    </div>
                </SettingsCard>
                
                <SettingsCard 
                    title="Farm Preferences"
                    isOpen={openSections['Farm Preferences']}
                    onToggle={() => toggleSection('Farm Preferences')}
                >
                    <div className="space-y-6">
                        {farmLocations.map((farm, index) => (
                            <div key={farm.id} className="space-y-4 rounded-lg border border-gray-200 p-4 pt-6 relative">
                                <p className="absolute -top-3 left-3 bg-white px-2 text-sm font-medium text-gray-500">Farm #{index + 1}</p>
                                {farmLocations.length > 1 && (
                                    <button 
                                        onClick={() => handleRemoveFarm(farm.id)}
                                        className="absolute top-3 right-3 p-1 text-gray-400 hover:text-red-600 transition-colors"
                                        aria-label="Remove farm"
                                    >
                                        <TrashIcon />
                                    </button>
                                )}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                                    <div className="md:col-span-2">
                                        <ControlledInputField 
                                            label="Farm Name / Location"
                                            id={`farmName-${farm.id}`} 
                                            value={farm.name}
                                            onChange={(e) => handleFarmChange(farm.id, 'name', e.target.value)}
                                            placeholder="e.g., North Field"
                                        />
                                    </div>
                                    <ControlledInputField 
                                        label="Latitude"
                                        id={`farmLat-${farm.id}`} 
                                        value={farm.lat}
                                        onChange={(e) => handleFarmChange(farm.id, 'lat', e.target.value)}
                                        placeholder="e.g., 6.454066"
                                    />
                                    <ControlledInputField 
                                        label="Longitude"
                                        id={`farmLon-${farm.id}`} 
                                        value={farm.lon}
                                        onChange={(e) => handleFarmChange(farm.id, 'lon', e.target.value)}
                                        placeholder="e.g., 7.424088"
                                    />
                                    <div>
                                        <label htmlFor={`farmSize-${farm.id}`} className="block text-sm font-medium text-gray-600 mb-1">Size (Hectares)</label>
                                        <input 
                                            type="number"
                                            id={`farmSize-${farm.id}`}
                                            name="size"
                                            placeholder="e.g., 10"
                                            value={farm.size}
                                            onChange={(e) => handleFarmChange(farm.id, 'size', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-gray-700 bg-gray-50"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6">
                        <button 
                            onClick={handleAddFarm}
                            className="w-full text-blue-600 border-2 border-dashed border-gray-300 rounded-md py-2 font-semibold hover:bg-blue-50 hover:border-blue-500 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            + Add Another Farm
                        </button>
                    </div>

                    <hr className="my-8 border-t border-gray-200" />
                    
                    <div>
                        <h4 className="text-md font-semibold text-gray-800 mb-2">Enterprise Line</h4>
                        <p className="text-sm text-gray-500 mb-4">Select your domains and list the products you produce.</p>
                        
                        <div className="flex space-x-8 mb-6">
                            <div className="flex items-center">
                                <input id="domain-crop" name="domain-crop" type="checkbox" checked={enterpriseDomains.crop} onChange={() => handleDomainChange('crop')} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                                <label htmlFor="domain-crop" className="ml-3 block text-sm font-medium text-gray-700">Crop</label>
                            </div>
                            <div className="flex items-center">
                                <input id="domain-livestock" name="domain-livestock" type="checkbox" checked={enterpriseDomains.livestock} onChange={() => handleDomainChange('livestock')} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                                <label htmlFor="domain-livestock" className="ml-3 block text-sm font-medium text-gray-700">Livestock</label>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {enterpriseDomains.crop && (
                                 <MultiSelectPills 
                                    title="Crops Produced"
                                    options={SUPPORTED_ENTERPRISE_CROPS}
                                    selected={selectedCrops}
                                    onToggle={handleToggleCrop}
                                />
                            )}

                            {enterpriseDomains.livestock && (
                                 <MultiSelectPills 
                                    title="Livestock Reared"
                                    options={SUPPORTED_LIVESTOCK}
                                    selected={selectedLivestock}
                                    onToggle={handleToggleLivestock}
                                />
                            )}
                        </div>
                    </div>


                    <div className="mt-8 text-right">
                        <ActionButton onClick={handleSavePreferences}>Save Preferences</ActionButton>
                    </div>
                </SettingsCard>
                
                <SettingsCard 
                    title="Subscription & Billing"
                    isOpen={openSections['Subscription & Billing']}
                    onToggle={() => toggleSection('Subscription & Billing')}
                >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <p className="font-semibold text-gray-800">Your Current Plan: <span className="text-blue-600 font-bold">{currentUserPlan}</span></p>
                            {currentUserPlan !== 'Premium' && (
                                <p className="text-sm text-gray-500 mt-1">You are on the {currentUserPlan} plan. Upgrade to unlock more features.</p>
                            )}
                            {currentUserPlan === 'Premium' && (
                                <p className="text-sm text-gray-500 mt-1">You have access to all features. Thank you!</p>
                            )}
                        </div>
                        {currentUserPlan !== 'Premium' && (
                             <button 
                                onClick={onUpgradePlan}
                                className="flex items-center space-x-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 rounded-lg font-semibold hover:from-amber-600 hover:to-orange-600 transition-colors shadow-md text-sm flex-shrink-0"
                            >
                                <ArrowUpIcon className="h-4 w-4" />
                                <span>Upgrade Plan</span>
                            </button>
                        )}
                    </div>
                </SettingsCard>

                <SettingsCard 
                    title="Team Management"
                    isOpen={openSections['Team Management']}
                    onToggle={() => toggleSection('Team Management')}
                >
                    <form>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                            <ControlledInputField label="Team Member Email" id="teamEmail" type="email" placeholder="user@example.com" value={newMemberEmail} onChange={(e) => setNewMemberEmail(e.target.value)} />
                            <ControlledSelectField label="Role" id="role" value={newMemberRole} onChange={(e) => setNewMemberRole(e.target.value as TeamMemberRole)}>
                                {TEAM_MEMBER_ROLES.map(role => (
                                    <option key={role} value={role}>{role}</option>
                                ))}
                            </ControlledSelectField>
                            <ControlledSelectField label="Assigned Location" id="farmId" value={newMemberFarmId} onChange={(e) => setNewMemberFarmId(e.target.value)}>
                                <option value="all">All Locations (Global Access)</option>
                                {farmLocations.map(loc => (
                                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                                ))}
                            </ControlledSelectField>
                        </div>

                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <h4 className="text-md font-semibold text-gray-800 mb-4">Assign Access Permissions</h4>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4">
                                {PERMISSIONS.map(permission => (
                                    <React.Fragment key={permission}>
                                    <PermissionCheckbox 
                                        id={permission.toLowerCase().replace(/ /g, '-')} 
                                        label={permission}
                                        checked={newMemberPermissions.includes(permission)}
                                        onChange={() => handlePermissionToggle(permission)}
                                    />
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>

                        <div className="mt-6 pt-6 border-t border-gray-200 flex items-center space-x-3">
                            <ActionButton onClick={handleAddOrUpdateMember} disabled={!newMemberEmail.trim()}>{editingMemberId ? 'Update Member' : 'Add Member'}</ActionButton>
                             {editingMemberId && (
                                <ActionButton onClick={resetTeamForm} variant="secondary">Cancel</ActionButton>
                            )}
                        </div>
                    </form>
                    
                    <div className="mt-6 pt-6 border-t border-gray-200">
                         <h4 className="text-md font-semibold text-gray-800 mb-4">Current Team</h4>
                         <div className="space-y-4">
                            {teamMembers.length > 0 ? (
                                teamMembers.map(member => (
                                    <div key={member.id} className="bg-gray-50 p-4 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <img src={member.avatar} alt={member.email} className="w-10 h-10 rounded-full object-cover"/>
                                            <div>
                                                <p className="font-semibold text-gray-800 flex items-center gap-2">{member.email} {getStatusBadge(member.status)}</p>
                                                <p className="text-sm text-gray-500">
                                                    {member.role}
                                                    {member.farmId && farmLocationMap.get(member.farmId) ? (
                                                        <span className="ml-2 pl-2 border-l border-gray-300 font-normal">
                                                            {farmLocationMap.get(member.farmId)}
                                                        </span>
                                                    ) : !member.farmId && (
                                                        <span className="ml-2 pl-2 border-l border-gray-300 font-normal">
                                                            Global Access
                                                        </span>
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                         <div className="flex items-center space-x-2 flex-shrink-0 self-end sm:self-center">
                                            {member.status === 'Pending Invitation' && (
                                                 <button onClick={() => generateAndLogInvite(member.email)} className="p-2 text-gray-600 hover:bg-gray-200 rounded-full transition-colors" aria-label={`Resend invitation to ${member.email}`} title="Resend Invitation"><MailIcon /></button>
                                            )}
                                            <button onClick={() => handleStartEdit(member)} disabled={member.status === 'Pending Invitation'} className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed" aria-label={`Edit ${member.email}`}><EditIcon /></button>
                                            <button onClick={() => handleDeleteMember(member.id)} className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors" aria-label={`Delete ${member.email}`}><TrashIcon /></button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 text-sm">No team members added yet.</p>
                            )}
                         </div>
                    </div>
                </SettingsCard>

                <footer className="py-4 flex justify-between items-center">
                    <ActionButton variant="danger" onClick={() => setIsDeleteConfirmOpen(true)}>Delete Account</ActionButton>
                    <button onClick={() => setIsLogoutConfirmOpen(true)} className="font-medium text-gray-600 hover:text-gray-900 text-sm">Log Out</button>
                </footer>
            </div>

            {isDeleteConfirmOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 border border-slate-100 text-left">
                        <div className="flex items-center space-x-3 text-red-600 mb-4">
                            <span className="material-icons-outlined text-3xl">warning</span>
                            <h3 className="text-lg font-bold">Permanently Delete Account?</h3>
                        </div>
                        <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                            This action is <strong className="text-red-600">irreversible</strong>. This will permanently delete your farm business profile, user profile, all financial records (income and expenditures), crop plans, livestock records, activity logs, and reset the application back to its default state.
                        </p>
                        <div className="flex space-x-3">
                            <button 
                                type="button"
                                onClick={() => setIsDeleteConfirmOpen(false)}
                                className="flex-1 py-2 px-4 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                            >
                                Cancel, Keep Account
                            </button>
                            <button 
                                type="button"
                                onClick={() => {
                                    setIsDeleteConfirmOpen(false);
                                    if (onDeleteAccount) onDeleteAccount();
                                }}
                                className="flex-1 py-2 px-4 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-sm"
                            >
                                Yes, Delete Everything
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {memberToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 border border-slate-100 text-left">
                        <div className="flex items-center space-x-3 text-red-600 mb-4">
                            <span className="material-icons-outlined text-3xl">warning</span>
                            <h3 className="text-lg font-bold">Remove Team Member?</h3>
                        </div>
                        <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                            Are you sure you want to remove <strong className="text-slate-800">{memberToDelete.email}</strong> from your team? They will immediately lose access to the farm management records and tools.
                        </p>
                        <div className="flex space-x-3">
                            <button 
                                type="button"
                                onClick={() => setMemberToDelete(null)}
                                className="flex-1 py-2 px-4 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                type="button"
                                onClick={() => {
                                    setTeamMembers(prev => prev.filter(member => member.id !== memberToDelete.id));
                                    setMemberToDelete(null);
                                }}
                                className="flex-1 py-2 px-4 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-sm"
                            >
                                Yes, Remove
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {farmToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 border border-slate-100 text-left">
                        <div className="flex items-center space-x-3 text-red-600 mb-4">
                            <span className="material-icons-outlined text-3xl">warning</span>
                            <h3 className="text-lg font-bold">Delete Farm Location?</h3>
                        </div>
                        <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                            Are you sure you want to delete <strong className="text-slate-800">{farmToDelete.name || `Farm #${farmLocations.findIndex(f => f.id === farmToDelete.id) + 1}`}</strong>? This will also permanently delete all associated data including crop plans, animals/livestock records, inventory, equipment, activities, and tasks assigned to this location.
                        </p>
                        <div className="flex space-x-3">
                            <button 
                                type="button"
                                onClick={() => setFarmToDelete(null)}
                                className="flex-1 py-2 px-4 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                type="button"
                                onClick={() => {
                                    if (onDeleteFarmLocation) {
                                        onDeleteFarmLocation(farmToDelete.id);
                                    } else {
                                        setFarmLocations(currentFarms => currentFarms.filter(farm => farm.id !== farmToDelete.id));
                                    }
                                    setFarmToDelete(null);
                                }}
                                className="flex-1 py-2 px-4 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-sm"
                            >
                                Yes, Delete Farm
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isLogoutConfirmOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 border border-slate-100 text-left">
                        <div className="flex items-center space-x-3 text-gray-700 mb-4">
                            <span className="material-icons-outlined text-3xl text-gray-500">logout</span>
                            <h3 className="text-lg font-bold">Log Out?</h3>
                        </div>
                        <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                            Are you sure you want to log out of your farm management account? Any unsaved changes may be lost.
                        </p>
                        <div className="flex space-x-3">
                            <button 
                                type="button"
                                onClick={() => setIsLogoutConfirmOpen(false)}
                                className="flex-1 py-2 px-4 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                type="button"
                                onClick={() => {
                                    setIsLogoutConfirmOpen(false);
                                    if (onLogout) onLogout();
                                }}
                                className="flex-1 py-2 px-4 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-sm"
                            >
                                Yes, Log Out
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    )
}

export default SettingsPage;

import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import SettingsPage from './components/SettingsPage';
import FarmRecordsPage from './components/FarmRecordsPage';
import CroppingPlannerPage from './components/CroppingPlannerPage';
import LivestockPlannerPage from './components/LivestockPlannerPage';
import StoreManagementPage from './components/StoreManagementPage';
import ReceiptGeneratorPage from './components/ReceiptGeneratorPage';
import UserProfilePage from './components/UserProfilePage';
import WeatherPage from './components/WeatherPage';
import LandingPage from './components/LandingPage';
import OnboardingWizard from './components/OnboardingWizard';
import TalkToFarmrPage from './components/TalkToFarmrPage';
import GovNgoSupportPage from './components/GovNgoSupportPage';
import AuthPage from './components/AuthPage';
import PrivacyPolicyPage from './components/PrivacyPolicyPage';
import TermsOfServicePage from './components/TermsOfServicePage';
import { PENDING_DOCUMENTS_DATA, REJECTED_DATA, BUSINESS_PROFILE_DATA, USER_PROFILE_DATA, TEAM_MEMBERS_DATA, GLOBAL_ACTIVITY_LOG, HEALTH_EVENTS, LIVESTOCK_DATA, CROP_PLANS, LIVESTOCK_TASKS, INPUT_INVENTORY_DATA, TOOLS_EQUIPMENT_DATA, BREEDING_RECORDS } from './constants';
import type { ActivityLog, FinancialDocument, RejectedFinancialDocument, BusinessProfile, UserProfile, FarmLocation, Payment, TeamMember, HealthEvent, LivestockRecord, CropPlan, LivestockTask, InputInventoryItem, ToolEquipmentItem, BreedingRecord, CroppingActivity } from './types';

// Initial farm locations data - Standardized to Hectares
const INITIAL_FARM_LOCATIONS: FarmLocation[] = [
    { id: 1, name: 'Field A, North Zone', lat: '6.1234', lon: '7.4567', size: '10', unit: 'Hectares' },
    { id: 2, name: 'Lower East Pasture', lat: '6.1230', lon: '7.4580', size: '6.07', unit: 'Hectares' }, // Was 15 Acres
    { id: 3, name: 'Irrigated Vegetable Patch', lat: '6.1225', lon: '7.4572', size: '5', unit: 'Hectares' },
];

function App() {
  const [appState, setAppState] = useState<'landing' | 'auth' | 'onboarding' | 'dashboard' | 'privacy' | 'terms'>('landing');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePage, setActivePage] = useState('Farm House');
  const [selectedCrops, setSelectedCrops] = useState<string[]>(['Maize', 'Cassava', 'Yam']);
  const [selectedLivestock, setSelectedLivestock] = useState<string[]>(['Cattle', 'Goat', 'Sheep', 'Chicken', 'Fish', 'Pig']);
  const [pendingDocuments, setPendingDocuments] = useState<FinancialDocument[]>(PENDING_DOCUMENTS_DATA);
  const [rejectedDocuments, setRejectedDocuments] = useState<RejectedFinancialDocument[]>(REJECTED_DATA);
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile>(BUSINESS_PROFILE_DATA);
  const [userProfile, setUserProfile] = useState<UserProfile>(USER_PROFILE_DATA);
  const [incomeRecords, setIncomeRecords] = useState<FinancialDocument[]>([]);
  const [expenditureRecords, setExpenditureRecords] = useState<FinancialDocument[]>([]);
  const [farmLocations, setFarmLocations] = useState<FarmLocation[]>(INITIAL_FARM_LOCATIONS);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(TEAM_MEMBERS_DATA);
  const [selectedLocationId, setSelectedLocationId] = useState<number | 'all'>('all');
  const [currentUserPlan, setCurrentUserPlan] = useState<'Starter' | 'Pro' | 'Premium'>('Starter');
  const [healthEvents, setHealthEvents] = useState<HealthEvent[]>(HEALTH_EVENTS);
  const [animals, setAnimals] = useState<LivestockRecord[]>(LIVESTOCK_DATA);
  const [cropPlans, setCropPlans] = useState<CropPlan[]>(CROP_PLANS);
  const [livestockTasks, setLivestockTasks] = useState<LivestockTask[]>(LIVESTOCK_TASKS);
  const [croppingActivities, setCroppingActivities] = useState<CroppingActivity[]>([]);
  const [inputsInventory, setInputsInventory] = useState<InputInventoryItem[]>(INPUT_INVENTORY_DATA);
  const [toolsEquipment, setToolsEquipment] = useState<ToolEquipmentItem[]>(TOOLS_EQUIPMENT_DATA);
  const [breedingRecords, setBreedingRecords] = useState<BreedingRecord[]>(BREEDING_RECORDS);
  const [activityLog, setActivityLog] = useState<ActivityLog[]>(GLOBAL_ACTIVITY_LOG);
  
  const currentUser = teamMembers.find(member => member.email.toLowerCase() === userProfile.email.toLowerCase()) || teamMembers[0];

  const addActivityLog = (text: string, icon: React.ReactElement<{ className?: string }>) => {
    if (!currentUser) return;
    const newLog: ActivityLog = {
        id: `log-${Date.now()}`,
        userId: currentUser.id,
        icon,
        text,
        date: new Date(),
    };
    // Add to the beginning of the array and keep the list from getting too long
    setActivityLog(prev => [newLog, ...prev].slice(0, 100)); 
  };

  const handleAddPayment = (documentId: string, paymentData: Omit<Payment, 'id'>) => {
      const newPayment: Payment = { id: `PAY-${Date.now()}`, ...paymentData };

      const updateRecords = (records: FinancialDocument[]) => {
          return records.map(doc => {
              if (doc.id === documentId) {
                  const existingPayments = doc.payments || [];
                  const updatedPayments = [...existingPayments, newPayment];
                  const newAmountPaid = updatedPayments.reduce((sum, p) => sum + p.amount, 0);
                  const newBalance = doc.totalAmount - newAmountPaid;

                  return {
                      ...doc,
                      payments: updatedPayments,
                      amountPaid: newAmountPaid,
                      balance: newBalance,
                  };
              }
              return doc;
          });
      };

      setIncomeRecords(updateRecords);
      setExpenditureRecords(updateRecords);
  };
  
  const handleAcceptInvitation = (email: string) => {
    setTeamMembers(prev => prev.map(member => 
        member.email.toLowerCase() === email.toLowerCase() 
            ? { ...member, status: 'Active' }
            : member
    ));
  };

  const renderPage = () => {
    if (!currentUser.permissions.includes(activePage)) {
        const canSeeDashboard = currentUser.permissions.includes('Farm House');

        if (canSeeDashboard) {
            // Silently redirect to dashboard if current page is not allowed
            return <Dashboard 
                      setSidebarOpen={setSidebarOpen} 
                      setActivePage={setActivePage}
                      userProfile={userProfile}
                      farmLocations={farmLocations}
                      businessProfile={businessProfile}
                      pendingDocuments={pendingDocuments}
                      rejectedDocuments={rejectedDocuments}
                      currentUserPlan={currentUserPlan}
                      healthEvents={healthEvents}
                      currentUser={currentUser}
                   />;
        } else {
             // If user can't even see the dashboard, show an access denied message
             return (
                <main className="flex-1 w-full p-8 bg-slate-100 flex items-center justify-center">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-700">Access Denied</h2>
                        <p className="text-gray-500 mt-2">You do not have permission to view this page. Contact your administrator.</p>
                    </div>
                </main>
            );
        }
    }

    switch (activePage) {
      case 'Settings':
        return <SettingsPage 
                  setSidebarOpen={setSidebarOpen} 
                  selectedLivestock={selectedLivestock}
                  setSelectedLivestock={setSelectedLivestock}
                  selectedCrops={selectedCrops}
                  setSelectedCrops={setSelectedCrops}
                  businessProfile={businessProfile}
                  setBusinessProfile={setBusinessProfile}
                  farmLocations={farmLocations}
                  setFarmLocations={setFarmLocations}
                  teamMembers={teamMembers}
                  setTeamMembers={setTeamMembers}
                  currentUserPlan={currentUserPlan}
                />;
      case 'Farm Records':
        return <FarmRecordsPage 
                 setSidebarOpen={setSidebarOpen}
                 incomeRecords={incomeRecords}
                 expenditureRecords={expenditureRecords}
                 businessProfile={businessProfile}
                 onAddPayment={handleAddPayment}
                 farmLocations={farmLocations}
                 selectedLocationId={selectedLocationId}
                 setSelectedLocationId={setSelectedLocationId}
               />;
      case 'Cropping Planner':
        return <CroppingPlannerPage 
                  setSidebarOpen={setSidebarOpen} 
                  availableCrops={selectedCrops} 
                  farmLocations={farmLocations}
                  selectedLocationId={selectedLocationId}
                  setSelectedLocationId={setSelectedLocationId}
                  plans={cropPlans}
                  setPlans={setCropPlans}
                  croppingActivities={croppingActivities}
                  setCroppingActivities={setCroppingActivities}
                  onAddActivity={addActivityLog}
                />;
      case 'Livestock Planner':
        return <LivestockPlannerPage 
                  setSidebarOpen={setSidebarOpen} 
                  availableSpecies={selectedLivestock}
                  farmLocations={farmLocations}
                  selectedLocationId={selectedLocationId}
                  setSelectedLocationId={setSelectedLocationId}
                  healthEvents={healthEvents}
                  setHealthEvents={setHealthEvents}
                  animals={animals}
                  setAnimals={setAnimals}
                  tasks={livestockTasks}
                  setTasks={setLivestockTasks}
                  breedingRecords={breedingRecords}
                  setBreedingRecords={setBreedingRecords}
                  onAddActivity={addActivityLog}
               />;
      case 'Store Management':
        return <StoreManagementPage 
                  setSidebarOpen={setSidebarOpen}
                  pendingDocuments={pendingDocuments}
                  setPendingDocuments={setPendingDocuments}
                  setRejectedDocuments={setRejectedDocuments}
                  setIncomeRecords={setIncomeRecords}
                  setExpenditureRecords={setExpenditureRecords}
                  farmLocations={farmLocations}
                  selectedLocationId={selectedLocationId}
                  setSelectedLocationId={setSelectedLocationId}
                  inputsInventory={inputsInventory}
                  setInputsInventory={setInputsInventory}
                  toolsEquipment={toolsEquipment}
                  setToolsEquipment={setToolsEquipment}
               />;
      case 'Receipt Generator':
        return <ReceiptGeneratorPage 
                  setSidebarOpen={setSidebarOpen}
                  pendingDocuments={pendingDocuments}
                  setPendingDocuments={setPendingDocuments}
                  rejectedDocuments={rejectedDocuments}
                  setRejectedDocuments={setRejectedDocuments}
                  businessProfile={businessProfile}
                  farmLocations={farmLocations}
                  selectedLocationId={selectedLocationId}
                  setSelectedLocationId={setSelectedLocationId}
                  onAddActivity={addActivityLog}
               />;
      case 'User Profile':
        return <UserProfilePage
                  setSidebarOpen={setSidebarOpen}
                  userProfile={userProfile}
                  setUserProfile={setUserProfile}
                  businessProfile={businessProfile}
                  incomeRecords={incomeRecords}
                  expenditureRecords={expenditureRecords}
                  currentUser={currentUser}
                  activityLog={activityLog}
                  animals={animals}
                  healthEvents={healthEvents}
                  cropPlans={cropPlans}
                  livestockTasks={livestockTasks}
                  croppingActivities={croppingActivities}
                  inputsInventory={inputsInventory}
                  toolsEquipment={toolsEquipment}
                  breedingRecords={breedingRecords}
                  farmLocations={farmLocations}
                />;
      case 'Weather':
        return <WeatherPage
                  setSidebarOpen={setSidebarOpen}
                  farmLocations={farmLocations}
                />;
      case 'Talk to Farmr':
        return <TalkToFarmrPage
                  setSidebarOpen={setSidebarOpen}
                />;
      case 'Gov/NGO Support':
        return <GovNgoSupportPage
                  setSidebarOpen={setSidebarOpen}
                />;
      case 'Farm House':
      case 'Cooperatives':
      default:
        return <Dashboard 
                  setSidebarOpen={setSidebarOpen} 
                  setActivePage={setActivePage}
                  userProfile={userProfile}
                  farmLocations={farmLocations}
                  businessProfile={businessProfile}
                  pendingDocuments={pendingDocuments}
                  rejectedDocuments={rejectedDocuments}
                  currentUserPlan={currentUserPlan}
                  healthEvents={healthEvents}
                  currentUser={currentUser}
               />;
    }
  };
  
  if (appState === 'landing') {
    return <LandingPage 
              onStartTrial={() => setAppState('auth')}
              onNavigateToPrivacy={() => setAppState('privacy')}
              onNavigateToTerms={() => setAppState('terms')}
           />;
  }
  
  if (appState === 'privacy') {
    return <PrivacyPolicyPage onBack={() => setAppState('landing')} />;
  }

  if (appState === 'terms') {
    return <TermsOfServicePage onBack={() => setAppState('landing')} />;
  }
  
  if (appState === 'auth') {
    return (
        <AuthPage
            onLogin={() => setAppState('dashboard')}
            onSignUp={() => setAppState('onboarding')}
            onAcceptInvitation={handleAcceptInvitation}
        />
    );
  }

  if (appState === 'onboarding') {
      return (
          <OnboardingWizard
              userProfile={userProfile}
              setUserProfile={setUserProfile}
              businessProfile={businessProfile}
              setBusinessProfile={setBusinessProfile}
              selectedCrops={selectedCrops}
              setSelectedCrops={setSelectedCrops}
              selectedLivestock={selectedLivestock}
              setSelectedLivestock={setSelectedLivestock}
              farmLocations={farmLocations}
              setFarmLocations={setFarmLocations}
              onComplete={() => setAppState('dashboard')}
          />
      );
  }

  return (
    <div className="relative flex w-full h-screen bg-slate-100 font-sans overflow-hidden">
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        ></div>
      )}
      <Sidebar 
        isOpen={sidebarOpen} 
        setIsOpen={setSidebarOpen} 
        activePage={activePage}
        setActivePage={setActivePage}
        currentUser={currentUser}
      />
      {renderPage()}
    </div>
  );
}

export default App;
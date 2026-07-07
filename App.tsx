import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, getDocFromCache } from 'firebase/firestore';
import { auth, db } from './firebase';
import { convertTimestampsToDates, sanitizeForFirestore } from './firestoreService';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import UpgradeModal from './components/UpgradeModal';
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
import PaymentPage from './components/PaymentPage';
import { PENDING_DOCUMENTS_DATA, REJECTED_DATA, BUSINESS_PROFILE_DATA, USER_PROFILE_DATA, TEAM_MEMBERS_DATA, GLOBAL_ACTIVITY_LOG, HEALTH_EVENTS, LIVESTOCK_DATA, CROP_PLANS, LIVESTOCK_TASKS, INPUT_INVENTORY_DATA, TOOLS_EQUIPMENT_DATA, BREEDING_RECORDS } from './constants';
import type { ActivityLog, FinancialDocument, RejectedFinancialDocument, BusinessProfile, UserProfile, FarmLocation, Payment, TeamMember, HealthEvent, LivestockRecord, CropPlan, LivestockTask, InputInventoryItem, ToolEquipmentItem, BreedingRecord, CroppingActivity } from './types';

// Initial farm locations data - Standardized to Hectares
const INITIAL_FARM_LOCATIONS: FarmLocation[] = [
    { id: 1, name: 'Field A, North Zone', lat: '6.1234', lon: '7.4567', size: '10', unit: 'Hectares' },
    { id: 2, name: 'Lower East Pasture', lat: '6.1230', lon: '7.4580', size: '6.07', unit: 'Hectares' }, // Was 15 Acres
    { id: 3, name: 'Irrigated Vegetable Patch', lat: '6.1225', lon: '7.4572', size: '5', unit: 'Hectares' },
];

function App() {
  const [appState, setAppState] = useState<'landing' | 'auth' | 'payment' | 'onboarding' | 'dashboard' | 'privacy' | 'terms'>('landing');
  const [selectedPlan, setSelectedPlan] = useState<'Starter' | 'Pro' | 'Premium'>('Starter');
  const [isNewUser, setIsNewUser] = useState<boolean>(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePage, setActivePage] = useState('Farm House');
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
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
  
  const [currentUserAuth, setCurrentUserAuth] = useState<any>(null);
  const [loadingData, setLoadingData] = useState(true);

  // Listen to Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUserAuth(user);
      if (user) {
        setLoadingData(true);
        try {
          const userDocRef = doc(db, 'users', user.uid);
          let docSnap;
          try {
            docSnap = await getDoc(userDocRef);
          } catch (fetchErr: any) {
            const isOffline = fetchErr && (
              String(fetchErr.message || fetchErr).toLowerCase().includes('offline') || 
              String(fetchErr.message || fetchErr).toLowerCase().includes('failed to get document') || 
              String(fetchErr.message || fetchErr).toLowerCase().includes('unavailable')
            );
            if (isOffline) {
              console.warn("Client offline. Attempting to load user data from Firestore cache...", fetchErr);
              docSnap = await getDocFromCache(userDocRef);
            } else {
              throw fetchErr;
            }
          }

          if (docSnap.exists()) {
            const rawData = docSnap.data();
            const data = convertTimestampsToDates(rawData);

            if (data.selectedCrops) setSelectedCrops(data.selectedCrops);
            if (data.selectedLivestock) setSelectedLivestock(data.selectedLivestock);
            if (data.pendingDocuments) setPendingDocuments(data.pendingDocuments);
            if (data.rejectedDocuments) setRejectedDocuments(data.rejectedDocuments);
            if (data.businessProfile) setBusinessProfile(data.businessProfile);
            if (data.userProfile) {
              setUserProfile(data.userProfile);
            } else {
              setUserProfile(prev => ({ ...prev, email: user.email || '' }));
            }
            if (data.incomeRecords) setIncomeRecords(data.incomeRecords);
            if (data.expenditureRecords) setExpenditureRecords(data.expenditureRecords);
            if (data.farmLocations) setFarmLocations(data.farmLocations);
            if (data.teamMembers) setTeamMembers(data.teamMembers);
            if (data.currentUserPlan) setCurrentUserPlan(data.currentUserPlan);
            if (data.healthEvents) setHealthEvents(data.healthEvents);
            if (data.animals) setAnimals(data.animals);
            if (data.cropPlans) setCropPlans(data.cropPlans);
            if (data.livestockTasks) setLivestockTasks(data.livestockTasks);
            if (data.croppingActivities) setCroppingActivities(data.croppingActivities);
            if (data.inputsInventory) setInputsInventory(data.inputsInventory);
            if (data.toolsEquipment) setToolsEquipment(data.toolsEquipment);
            if (data.breedingRecords) setBreedingRecords(data.breedingRecords);
            if (data.activityLog) {
              const sanitizedLogs = Array.isArray(data.activityLog)
                ? data.activityLog.map((log: any) => ({
                    ...log,
                    icon: (log && typeof log.icon === 'string') ? log.icon : 'assignment'
                  }))
                : [];
              setActivityLog(sanitizedLogs);
            }
            
            const loadedPlan = data.currentUserPlan || 'Starter';
            if ((selectedPlan === 'Pro' || selectedPlan === 'Premium') && loadedPlan === 'Starter') {
              setIsNewUser(false);
              setAppState('payment');
            } else {
              setAppState('dashboard');
            }
          } else {
            // Document doesn't exist yet, we'll create it upon first state change or onboarding completion
            setUserProfile(prev => ({ 
              ...prev, 
              email: user.email || '',
              name: user.displayName || prev.name || ''
            }));
            setIsNewUser(true);
            if (selectedPlan === 'Pro' || selectedPlan === 'Premium') {
              setAppState('payment');
            } else {
              setAppState('onboarding');
            }
          }
        } catch (err: any) {
          const isOffline = err && (
            String(err.message || err).toLowerCase().includes('offline') || 
            String(err.message || err).toLowerCase().includes('failed to get document') || 
            String(err.message || err).toLowerCase().includes('unavailable')
          );
          if (isOffline) {
            console.warn("Offline loading mode: Using default local values.", err);
          } else {
            console.error("Error loading user data from Firestore:", err);
          }
          // Graceful fallback for offline mode or network errors
          setUserProfile(prev => ({ 
            ...prev, 
            email: user.email || '',
            name: user.displayName || prev.name || ''
          }));
          setIsNewUser(false);
          setAppState('dashboard');
        } finally {
          setLoadingData(false);
        }
      } else {
        setLoadingData(false);
        // If logged out, only redirect to landing from private sections
        setAppState(prev => (prev === 'dashboard' || prev === 'onboarding') ? 'landing' : prev);
      }
    });
    return () => unsubscribe();
  }, []);

  // Debounced auto-save to Firestore when any state updates
  useEffect(() => {
    if (!currentUserAuth || loadingData) return;

    const timeoutId = setTimeout(async () => {
      try {
        const userDocRef = doc(db, 'users', currentUserAuth.uid);
        const payload = sanitizeForFirestore({
          email: currentUserAuth.email || '',
          selectedCrops,
          selectedLivestock,
          pendingDocuments,
          rejectedDocuments,
          businessProfile,
          userProfile,
          incomeRecords,
          expenditureRecords,
          farmLocations,
          teamMembers,
          currentUserPlan,
          healthEvents,
          animals,
          cropPlans,
          livestockTasks,
          croppingActivities,
          inputsInventory,
          toolsEquipment,
          breedingRecords,
          activityLog,
          updatedAt: new Date()
        });
        await setDoc(userDocRef, payload, { merge: true });
        console.log("Farm state auto-saved to Firestore.");
      } catch (err: any) {
        const isOffline = err && (
          String(err.message || err).toLowerCase().includes('offline') || 
          String(err.message || err).toLowerCase().includes('failed to get document') || 
          String(err.message || err).toLowerCase().includes('unavailable')
        );
        if (isOffline) {
          console.warn("Unable to auto-save farm state: Client is offline.");
        } else {
          console.error("Error auto-saving farm state to Firestore:", err);
        }
      }
    }, 1500);

    return () => clearTimeout(timeoutId);
  }, [
    currentUserAuth,
    loadingData,
    selectedCrops,
    selectedLivestock,
    pendingDocuments,
    rejectedDocuments,
    businessProfile,
    userProfile,
    incomeRecords,
    expenditureRecords,
    farmLocations,
    teamMembers,
    currentUserPlan,
    healthEvents,
    animals,
    cropPlans,
    livestockTasks,
    croppingActivities,
    inputsInventory,
    toolsEquipment,
    breedingRecords,
    activityLog
  ]);

  const currentUser = teamMembers.find(member => member.email.toLowerCase() === userProfile.email.toLowerCase()) || teamMembers[0];

  const addActivityLog = (text: string, icon: string) => {
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

  const handleDeleteAccount = () => {
    signOut(auth);
    setAppState('landing');
    setActivePage('Farm House');
    setSelectedCrops(['Maize', 'Cassava', 'Yam']);
    setSelectedLivestock(['Cattle', 'Goat', 'Sheep', 'Chicken', 'Fish', 'Pig']);
    setPendingDocuments(PENDING_DOCUMENTS_DATA);
    setRejectedDocuments(REJECTED_DATA);
    setBusinessProfile(BUSINESS_PROFILE_DATA);
    setUserProfile(USER_PROFILE_DATA);
    setIncomeRecords([]);
    setExpenditureRecords([]);
    setFarmLocations(INITIAL_FARM_LOCATIONS);
    setTeamMembers(TEAM_MEMBERS_DATA);
    setSelectedLocationId('all');
    setCurrentUserPlan('Starter');
    setHealthEvents(HEALTH_EVENTS);
    setAnimals(LIVESTOCK_DATA);
    setCropPlans(CROP_PLANS);
    setLivestockTasks(LIVESTOCK_TASKS);
    setCroppingActivities([]);
    setInputsInventory(INPUT_INVENTORY_DATA);
    setToolsEquipment(TOOLS_EQUIPMENT_DATA);
    setBreedingRecords(BREEDING_RECORDS);
    setActivityLog(GLOBAL_ACTIVITY_LOG);
  };

  const handleDeleteFarmLocation = (id: number) => {
    setFarmLocations(current => current.filter(farm => farm.id !== id));
    setCropPlans(current => current.filter(plan => plan.farmId !== id));
    setAnimals(current => current.filter(animal => animal.farmId !== id));
    setBreedingRecords(current => current.filter(record => record.farmId !== id));
    setInputsInventory(current => current.filter(item => item.farmId !== id));
    setToolsEquipment(current => current.filter(item => item.farmId !== id));
    setCroppingActivities(current => current.filter(activity => activity.farmId !== id));
    setLivestockTasks(current => current.filter(task => task.farmId !== id));
    setIncomeRecords(current => current.filter(doc => doc.farmId !== id));
    setExpenditureRecords(current => current.filter(doc => doc.farmId !== id));
    setTeamMembers(current => current.map(member => member.farmId === id ? { ...member, farmId: undefined } : member));
    if (selectedLocationId === id) {
      setSelectedLocationId('all');
    }
  };

  const handleLogout = () => {
    signOut(auth);
    setAppState('landing');
    setActivePage('Farm House');
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
                      onUpgradePlan={() => setIsUpgradeModalOpen(true)}
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
                  onUpgradePlan={() => setIsUpgradeModalOpen(true)}
                  onDeleteAccount={handleDeleteAccount}
                  onLogout={handleLogout}
                  onDeleteFarmLocation={handleDeleteFarmLocation}
                  userProfile={userProfile}
                  setUserProfile={setUserProfile}
                  onAddActivity={addActivityLog}
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
                  onUpgradePlan={() => setIsUpgradeModalOpen(true)}
               />;
    }
  };
  
  if (loadingData) {
    return (
      <div className="min-h-screen bg-[#1E5631] flex flex-col items-center justify-center p-4 font-sans text-white">
        <div className="relative flex-shrink-0 mb-6">
          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center">
            <div className="w-10 h-10 bg-white/20 rounded-full animate-pulse"></div>
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-green-300 rounded-full shadow-[0_0_16px_6px] shadow-green-400/80 animate-pulse"></div>
        </div>
        <h1 className="text-xl font-bold tracking-wider mb-2">THE AGRIC APP</h1>
        <p className="text-sm opacity-80 animate-pulse">Synchronizing with cloud database...</p>
      </div>
    );
  }

  if (appState === 'landing') {
    return <LandingPage 
              onStartTrial={(plan) => {
                setSelectedPlan(plan || 'Starter');
                setAppState('auth');
              }}
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

  if (appState === 'payment') {
    return (
      <PaymentPage
        selectedPlan={selectedPlan === 'Starter' ? 'Pro' : selectedPlan}
        onPaymentSuccess={(plan) => {
          setCurrentUserPlan(plan);
          setAppState(isNewUser ? 'onboarding' : 'dashboard');
        }}
        onCancel={() => {
          setAppState('landing');
        }}
      />
    );
  }
  
  if (appState === 'auth') {
    return (
        <AuthPage
            onLogin={() => {}}
            onSignUp={() => {}}
            onAcceptInvitation={handleAcceptInvitation}
            onGoToLanding={() => setAppState('landing')}
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
        onGoToLanding={() => setAppState('landing')}
      />
      {renderPage()}
      
      <UpgradeModal 
        isOpen={isUpgradeModalOpen} 
        onClose={() => setIsUpgradeModalOpen(false)} 
        currentPlan={currentUserPlan} 
        onUpgrade={setCurrentUserPlan} 
      />
    </div>
  );
}

export default App;
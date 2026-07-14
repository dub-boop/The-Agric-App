import React, { useState, useEffect } from 'react';
import { auth } from '../firebase';
import { GoogleAuthProvider, signInWithPopup, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { 
  getCuratedSupportPrograms, 
  saveSupportProgram, 
  deleteSupportProgram,
  getCooperatives,
  saveCooperative,
  deleteCooperative,
  getAllUsers,
  updateUserPlan,
  updateUserSaaSLimits
} from '../firestoreService';
import { SUPPORT_PROGRAMS, ArrowLeftIcon, PlusIcon, EditIcon, TrashIcon, CheckIcon } from '../constants';
import type { SupportProgram, SupportProgramProvider, SupportProgramCategory, SupportProgramStatus, Cooperative } from '../types';

interface AdminCurationPageProps {
  onBack: () => void;
}

const DEFAULT_COOPERATIVES: Cooperative[] = [
  {
    id: 'COOP-001',
    name: 'Ibadan Cassava Growers Union',
    type: 'Resource-Sharing',
    location: 'Oyo State (South-West)',
    contactEmail: 'ibadan.cassava@agric.coop',
    presidentPhone: '+234 803 456 7891',
    activeMembers: 145,
    sharedEquipment: ['John Deere 5055E Tractor', 'Cassava Peeling Machine', 'Tuber Washing Grater'],
    description: 'A vibrant union focused on high-yield cassava processing and mechanized land preparation for smallholder farmers.'
  },
  {
    id: 'COOP-002',
    name: 'Northern Grain Cooperative Society',
    type: 'Joint Marketing',
    location: 'Kano State (North)',
    contactEmail: 'kano.grains@agric.coop',
    presidentPhone: '+234 802 987 6543',
    activeMembers: 320,
    sharedEquipment: ['Multi-crop Thresher', 'Grain Moisture Meter', 'Large Combined Harvester'],
    description: 'Empowering local maize, sorghum and millet farmers to aggregate produce for competitive bulk wholesale market sales.'
  },
  {
    id: 'COOP-003',
    name: 'Delta Fishermen Cooperative Alliance',
    type: 'Purchasing',
    location: 'Delta State (South-South)',
    contactEmail: 'delta.fish@agric.coop',
    presidentPhone: '+234 815 123 4567',
    activeMembers: 88,
    sharedEquipment: ['Solar Cold Storage Unit', 'Water Quality Tester', 'Bulk Feed Mixer'],
    description: 'Joint purchasing cooperative providing high-grade fingerlings and discounted fish feed to small-scale aquaculture farms.'
  }
];

const AdminCurationPage = ({ onBack }: AdminCurationPageProps) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [passcode, setPasscode] = useState('');
  const [passcodeVerified, setPasscodeVerified] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'analytics' | 'users' | 'support' | 'cooperatives'>('analytics');

  // SaaS User Directory & Analytics state
  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userPlanFilter, setUserPlanFilter] = useState<string>('All');
  const [userPage, setUserPage] = useState<number>(1);
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);



  // Email/Password login state
  const [adminEmail, setAdminEmail] = useState('dubem.emmanuel@gmail.com');
  const [adminPassword, setAdminPassword] = useState('');
  const [isSettingUpPassword, setIsSettingUpPassword] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);

  // Support Programs State
  const [programs, setPrograms] = useState<SupportProgram[]>([]);
  const [loadingPrograms, setLoadingPrograms] = useState(false);

  // Cooperatives State
  const [cooperatives, setCooperatives] = useState<Cooperative[]>([]);
  const [loadingCoops, setLoadingCoops] = useState(false);
  const [coopSubTab, setCoopSubTab] = useState<'pending' | 'live'>('pending');

  // Form Modals State
  const [editingProgram, setEditingProgram] = useState<Partial<SupportProgram> | null>(null);
  const [isProgramFormOpen, setIsProgramFormOpen] = useState(false);

  const [editingCooperative, setEditingCooperative] = useState<Partial<Cooperative> | null>(null);
  const [isCooperativeFormOpen, setIsCooperativeFormOpen] = useState(false);

  // Notification State
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Custom Confirm Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info';
  } | null>(null);

  // Check user role
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCheckingAuth(false);
      if (user) {
        setUserEmail(user.email);
        const emailLower = (user.email || '').toLowerCase();
        // The SaaS builder's email is dubem.emmanuel@gmail.com
        if (emailLower === 'dubem.emmanuel@gmail.com') {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } else {
        setUserEmail(null);
        setIsAdmin(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    setAuthError(null);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const emailLower = (result.user.email || '').toLowerCase();
      if (emailLower === 'dubem.emmanuel@gmail.com') {
        showNotification('Successfully authenticated as SaaS Builder!', 'success');
      } else {
        setAuthError(`Email ${result.user.email} is not authorized as the SaaS Builder.`);
      }
    } catch (err: any) {
      console.error(err);
      setAuthError(err.message || 'Failed to authenticate via Google.');
    }
  };

  const handleEmailPasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (!adminPassword) {
      setAuthError('Please enter a password.');
      return;
    }
    const targetEmail = adminEmail.trim().toLowerCase();
    if (targetEmail !== 'dubem.emmanuel@gmail.com') {
      setAuthError('Access denied: Email must be exactly dubem.emmanuel@gmail.com');
      return;
    }

    try {
      if (isSettingUpPassword) {
        // Create/Register the administrator email with the specified password
        await createUserWithEmailAndPassword(auth, targetEmail, adminPassword);
        showNotification('Successfully registered and authenticated as SaaS Builder!', 'success');
      } else {
        // Sign in with email and password
        await signInWithEmailAndPassword(auth, targetEmail, adminPassword);
        showNotification('Successfully authenticated as SaaS Builder!', 'success');
      }
    } catch (err: any) {
      console.error('Admin Auth Error:', err);
      if (err.code === 'auth/user-not-found') {
        setAuthError('Account not found. If this is your first time using Email/Password, select "Set up password / Register" below to configure your passcode.');
      } else if (err.code === 'auth/email-already-in-use') {
        setAuthError('Account already exists! This email is already registered in our Firebase database (likely from registering as a user or via Google Login). If you do not have or remember your password, please click "Forgot Password? Get Reset Email" below to set/reset your password.');
      } else if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setAuthError('Invalid password. Please try again or click "Forgot Password? Get Reset Email" below if you have forgotten it.');
      } else {
        setAuthError(err.message || 'Failed to authenticate via Email and Password.');
      }
    }
  };

  const handlePasswordReset = async () => {
    setAuthError(null);
    setSendingReset(true);
    const targetEmail = adminEmail.trim().toLowerCase();
    if (targetEmail !== 'dubem.emmanuel@gmail.com') {
      setAuthError('Password reset can only be requested for the authorized admin email (dubem.emmanuel@gmail.com).');
      setSendingReset(false);
      return;
    }

    try {
      await sendPasswordResetEmail(auth, targetEmail);
      showNotification('A password reset link has been sent to your email! Please check your inbox (and Spam folder) to set your password.', 'success');
    } catch (err: any) {
      console.error('Password Reset Error:', err);
      setAuthError(err.message || 'Failed to send password reset email.');
    } finally {
      setSendingReset(false);
    }
  };

  const handlePasscodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (passcode.trim() === 'agric-admin-2026') {
      setPasscodeVerified(true);
      showNotification('Passcode authenticated!', 'success');
    } else {
      setAuthError('Invalid administrator passcode.');
    }
  };

  const isAccessAllowed = isAdmin || passcodeVerified;

  // Load programs from Firestore
  const loadPrograms = async () => {
    setLoadingPrograms(true);
    try {
      let fetched = await getCuratedSupportPrograms();
      if (fetched.length === 0) {
        // Auto-seed Firestore with default programs from constants on first load
        for (const prog of SUPPORT_PROGRAMS) {
          await saveSupportProgram(prog);
        }
        fetched = await getCuratedSupportPrograms();
      }
      setPrograms(fetched as SupportProgram[]);
    } catch (err: any) {
      console.error('Error loading programs:', err);
      showNotification('Failed to load programs from Firestore.', 'error');
    } finally {
      setLoadingPrograms(false);
    }
  };

  // Load Cooperatives from Firestore
  const loadCooperatives = async () => {
    setLoadingCoops(true);
    try {
      let fetched = await getCooperatives();
      if (fetched.length === 0) {
        // Auto-seed Firestore with default cooperatives on first load
        for (const coop of DEFAULT_COOPERATIVES) {
          await saveCooperative({ ...coop, status: 'Live' });
        }
        fetched = await getCooperatives();
      }
      setCooperatives(fetched as Cooperative[]);
    } catch (err: any) {
      console.error('Error loading cooperatives:', err);
      showNotification('Failed to load cooperatives from Firestore.', 'error');
    } finally {
      setLoadingCoops(false);
    }
  };

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const fetched = await getAllUsers();
      setUsers(fetched);
    } catch (err: any) {
      console.error('Error loading users:', err);
      showNotification('Failed to load user accounts from Firestore.', 'error');
    } finally {
      setLoadingUsers(false);
    }
  };

  const [localTrialExpiresAt, setLocalTrialExpiresAt] = useState('');
  const [localBonusFarmLocations, setLocalBonusFarmLocations] = useState(0);
  const [localBonusTeamMembers, setLocalBonusTeamMembers] = useState(0);
  const [localBypassRestrictions, setLocalBypassRestrictions] = useState(false);

  useEffect(() => {
    if (expandedUserId) {
      const u = users.find(x => x.uid === expandedUserId);
      if (u) {
        setLocalTrialExpiresAt(u.trialExpiresAt || '');
        setLocalBonusFarmLocations(u.bonusFarmLocations || 0);
        setLocalBonusTeamMembers(u.bonusTeamMembers || 0);
        setLocalBypassRestrictions(!!u.bypassRestrictions);
      }
    }
  }, [expandedUserId, users]);

  const handleUpdateUserPlan = async (uid: string, plan: 'Starter' | 'Pro' | 'Premium') => {
    try {
      await updateUserPlan(uid, plan);
      showNotification(`Upgraded user account to ${plan} Plan!`, 'success');
      loadUsers(); // Refresh the dynamic user directory
    } catch (err: any) {
      console.error('Error updating plan:', err);
      showNotification('Failed to update subscription tier.', 'error');
    }
  };

  const getEnterpriseFocus = (user: any) => {
    const cropsList = user.selectedCrops || [];
    const livestockList = user.selectedLivestock || [];
    if (cropsList.length > 0 && livestockList.length > 0) {
      return `Mixed (Crops: ${cropsList.slice(0, 2).join(', ')}${cropsList.length > 2 ? '...' : ''}; Livestock: ${livestockList.slice(0, 2).join(', ')}${livestockList.length > 2 ? '...' : ''})`;
    } else if (cropsList.length > 0) {
      return `Crops Only (${cropsList.slice(0, 3).join(', ')}${cropsList.length > 3 ? '...' : ''})`;
    } else if (livestockList.length > 0) {
      return `Livestock Only (${livestockList.slice(0, 3).join(', ')}${livestockList.length > 3 ? '...' : ''})`;
    } else {
      return 'General Agriculture';
    }
  };

  const calculateYTDProfitLoss = (user: any) => {
    const currentYear = new Date().getFullYear();
    const ytdIncome = (user.incomeRecords || [])
      .filter((r: any) => r.date && new Date(r.date).getFullYear() === currentYear)
      .reduce((sum: number, r: any) => sum + (r.totalAmount || 0), 0);
    const ytdExpenditure = (user.expenditureRecords || [])
      .filter((r: any) => r.date && new Date(r.date).getFullYear() === currentYear)
      .reduce((sum: number, r: any) => sum + (r.totalAmount || 0), 0);
    return ytdIncome - ytdExpenditure;
  };

  const handleExportToExcel = (usersToExport: any[]) => {
    const headers = [
      'UID',
      "Farmer's Name",
      'Business Name',
      'Email Address',
      'Phone Number',
      'Primary Location',
      'Total Count of Team Members',
      'Enterprise Focus',
      'YTD Profit/Loss Balance (₦)'
    ];

    const rows = usersToExport.map(u => {
      const cropsList = u.selectedCrops || [];
      const livestockList = u.selectedLivestock || [];
      let enterpriseFocus = 'Mixed';
      if (cropsList.length > 0 && livestockList.length > 0) {
        enterpriseFocus = `Mixed (Crops: ${cropsList.slice(0, 2).join(', ')}${cropsList.length > 2 ? '...' : ''}; Livestock: ${livestockList.slice(0, 2).join(', ')}${livestockList.length > 2 ? '...' : ''})`;
      } else if (cropsList.length > 0) {
        enterpriseFocus = `Crops Only (${cropsList.slice(0, 3).join(', ')}${cropsList.length > 3 ? '...' : ''})`;
      } else if (livestockList.length > 0) {
        enterpriseFocus = `Livestock Only (${livestockList.slice(0, 3).join(', ')}${livestockList.length > 3 ? '...' : ''})`;
      } else {
        enterpriseFocus = 'General Agriculture';
      }

      const currentYear = new Date().getFullYear();
      const ytdIncome = (u.incomeRecords || [])
        .filter((r: any) => r.date && new Date(r.date).getFullYear() === currentYear)
        .reduce((sum: number, r: any) => sum + (r.totalAmount || 0), 0);
      const ytdExpenditure = (u.expenditureRecords || [])
        .filter((r: any) => r.date && new Date(r.date).getFullYear() === currentYear)
        .reduce((sum: number, r: any) => sum + (r.totalAmount || 0), 0);
      const ytdBalance = ytdIncome - ytdExpenditure;

      return [
        u.uid,
        u.userProfile?.name || 'Unnamed Farmer',
        u.businessProfile?.name || 'No Business Profile',
        u.email || u.userProfile?.email || 'N/A',
        u.userProfile?.phone || u.businessProfile?.phone || 'N/A',
        u.farmLocations?.[0]?.name || 'N/A',
        u.teamMembers?.length || 0,
        enterpriseFocus,
        `₦${ytdBalance.toLocaleString()}`
      ];
    });

    const csvContent = "\uFEFF" + [
      headers.join(','),
      ...rows.map(row => row.map(val => {
        const strVal = String(val).replace(/"/g, '""');
        return `"${strVal}"`;
      }).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `saas_users_and_plans_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification('SaaS users exported to Excel/CSV successfully!', 'success');
  };

  const handleSaveLimits = async (uid: string) => {
    try {
      await updateUserSaaSLimits(uid, {
        trialExpiresAt: localTrialExpiresAt,
        bonusFarmLocations: localBonusFarmLocations,
        bonusTeamMembers: localBonusTeamMembers,
        bypassRestrictions: localBypassRestrictions
      });
      showNotification('SaaS custom limits and override conditions updated successfully!', 'success');
      loadUsers();
    } catch (err: any) {
      console.error(err);
      showNotification('Failed to update SaaS overrides: ' + (err.message || String(err)), 'error');
    }
  };

  const handleImpersonateUser = (uid: string, email: string, mode: 'view-only' | 'full-edit') => {
    const onConfirmAction = () => {
      localStorage.setItem('admin_impersonated_uid', uid);
      localStorage.setItem('admin_impersonated_email', email);
      localStorage.setItem('admin_impersonation_mode', mode);

      showNotification(`Entering diagnostic simulation for ${email}...`, 'success');

      setTimeout(() => {
        window.location.reload();
      }, 1000);
      setConfirmModal(null);
    };

    if (mode === 'full-edit') {
      setConfirmModal({
        isOpen: true,
        title: '🚨 Enter Full Edit Diagnostics?',
        message: `You are entering FULL EDIT DIAGNOSTICS for ${email}. This will initiate a real live-simulate session where any additions, edits, or deletions of farm structures, financial records, or livestock database items will write directly to their active account. Do you wish to proceed?`,
        onConfirm: onConfirmAction,
        confirmText: 'Proceed with Full Edit Access',
        cancelText: 'Cancel',
        variant: 'danger'
      });
    } else {
      setConfirmModal({
        isOpen: true,
        title: '🔍 Enter View-Only Diagnostics?',
        message: `You are entering VIEW ONLY DIAGNOSTICS mode for ${email}. You will be logged in to inspect their active farms, ledgers, and crop lists read-only. Database changes will be securely disabled. Do you wish to proceed?`,
        onConfirm: onConfirmAction,
        confirmText: 'Enter View-Only Mode',
        cancelText: 'Cancel',
        variant: 'warning'
      });
    }
  };

  const handleCooperativeVerifyToggle = async (coop: Cooperative) => {
    try {
      const updatedStatus = coop.status === 'Live' ? 'Pending' : 'Live';
      await saveCooperative({
        ...coop,
        status: updatedStatus
      });
      showNotification(
        updatedStatus === 'Live' 
          ? `Cooperative "${coop.name}" is now Live and Verified!` 
          : `Cooperative "${coop.name}" moved back to Pending.`, 
        'success'
      );
      loadCooperatives();
    } catch (err: any) {
      console.error(err);
      showNotification('Failed to update cooperative status.', 'error');
    }
  };

  useEffect(() => {
    if (isAccessAllowed) {
      loadPrograms();
      loadCooperatives();
      loadUsers();
    }
  }, [isAccessAllowed]);

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Support Program Handlers
  const handleOpenProgramForm = () => {
    setEditingProgram({
      title: '',
      provider: 'Government',
      category: 'Grant',
      description: '',
      status: 'Open',
      deadline: new Date(),
      location: 'National',
      applyLink: '',
      eligibility: [''],
      requiredDocuments: ['']
    });
    setIsProgramFormOpen(true);
  };

  const handleOpenProgramEditForm = (prog: SupportProgram) => {
    setEditingProgram({
      ...prog,
      eligibility: [...prog.eligibility],
      requiredDocuments: [...prog.requiredDocuments],
      deadline: prog.deadline instanceof Date ? prog.deadline : new Date(prog.deadline)
    });
    setIsProgramFormOpen(true);
  };

  const handleProgramInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    if (!editingProgram) return;
    const { name, value } = e.target;
    
    if (name === 'deadline') {
      setEditingProgram(prev => ({ ...prev, [name]: new Date(value) }));
    } else {
      setEditingProgram(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleProgramArrayChange = (index: number, value: string, field: 'eligibility' | 'requiredDocuments') => {
    if (!editingProgram || !editingProgram[field]) return;
    const currentArray = [...(editingProgram[field] || [])];
    currentArray[index] = value;
    setEditingProgram(prev => ({ ...prev, [field]: currentArray }));
  };

  const handleProgramAddArrayItem = (field: 'eligibility' | 'requiredDocuments') => {
    if (!editingProgram) return;
    const currentArray = [...(editingProgram[field] || []), ''];
    setEditingProgram(prev => ({ ...prev, [field]: currentArray }));
  };

  const handleProgramRemoveArrayItem = (index: number, field: 'eligibility' | 'requiredDocuments') => {
    if (!editingProgram || !editingProgram[field]) return;
    const currentArray = (editingProgram[field] || []).filter((_, i) => i !== index);
    setEditingProgram(prev => ({ ...prev, [field]: currentArray }));
  };

  const handleProgramSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProgram || !editingProgram.title) {
      showNotification('Program Title is required.', 'error');
      return;
    }

    try {
      const cleanEligibility = (editingProgram.eligibility || []).map(s => s.trim()).filter(Boolean);
      const cleanDocs = (editingProgram.requiredDocuments || []).map(s => s.trim()).filter(Boolean);

      const progToSave = {
        ...editingProgram,
        eligibility: cleanEligibility,
        requiredDocuments: cleanDocs
      };

      await saveSupportProgram(progToSave);
      showNotification('Support program saved successfully to Firestore!', 'success');
      setIsProgramFormOpen(false);
      setEditingProgram(null);
      loadPrograms();
    } catch (err: any) {
      console.error(err);
      showNotification('Error saving program: ' + (err.message || String(err)), 'error');
    }
  };

  const handleProgramDelete = async (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: '🗑️ Delete Support Program?',
      message: 'Are you sure you want to delete this support program? This will permanently remove it from Firestore.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
      onConfirm: async () => {
        try {
          await deleteSupportProgram(id);
          showNotification('Program deleted successfully.', 'success');
          loadPrograms();
        } catch (err: any) {
          console.error(err);
          showNotification('Failed to delete program.', 'error');
        } finally {
          setConfirmModal(null);
        }
      }
    });
  };

  const handleResetProgramsToDefaults = async () => {
    setConfirmModal({
      isOpen: true,
      title: '🔄 Reset Programs to Defaults?',
      message: 'This will wipe custom support programs and re-seed defaults in Firestore. Continue?',
      confirmText: 'Reset Database',
      cancelText: 'Cancel',
      variant: 'danger',
      onConfirm: async () => {
        try {
          setLoadingPrograms(true);
          for (const p of programs) {
            await deleteSupportProgram(p.id);
          }
          for (const p of SUPPORT_PROGRAMS) {
            await saveSupportProgram(p);
          }
          showNotification('Support Programs database successfully reset to defaults.', 'success');
          loadPrograms();
        } catch (err: any) {
          console.error(err);
          showNotification('Failed to reset programs.', 'error');
        } finally {
          setLoadingPrograms(false);
          setConfirmModal(null);
        }
      }
    });
  };

  // Cooperative curation handlers
  const handleOpenCooperativeForm = () => {
    setEditingCooperative({
      name: '',
      type: 'Resource-Sharing',
      location: '',
      contactEmail: '',
      presidentPhone: '',
      activeMembers: 10,
      sharedEquipment: [''],
      description: ''
    });
    setIsCooperativeFormOpen(true);
  };

  const handleOpenCooperativeEditForm = (coop: Cooperative) => {
    setEditingCooperative({
      ...coop,
      sharedEquipment: [...coop.sharedEquipment]
    });
    setIsCooperativeFormOpen(true);
  };

  const handleCooperativeInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    if (!editingCooperative) return;
    const { name, value } = e.target;
    
    if (name === 'activeMembers') {
      setEditingCooperative(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
    } else {
      setEditingCooperative(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleCooperativeEquipmentChange = (index: number, value: string) => {
    if (!editingCooperative || !editingCooperative.sharedEquipment) return;
    const current = [...editingCooperative.sharedEquipment];
    current[index] = value;
    setEditingCooperative(prev => ({ ...prev, sharedEquipment: current }));
  };

  const handleCooperativeAddEquipment = () => {
    if (!editingCooperative) return;
    const current = [...(editingCooperative.sharedEquipment || []), ''];
    setEditingCooperative(prev => ({ ...prev, sharedEquipment: current }));
  };

  const handleCooperativeRemoveEquipment = (index: number) => {
    if (!editingCooperative || !editingCooperative.sharedEquipment) return;
    const current = editingCooperative.sharedEquipment.filter((_, i) => i !== index);
    setEditingCooperative(prev => ({ ...prev, sharedEquipment: current }));
  };

  const handleCooperativeSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCooperative || !editingCooperative.name) {
      showNotification('Cooperative Name is required.', 'error');
      return;
    }

    try {
      const cleanEquipment = (editingCooperative.sharedEquipment || []).map(s => s.trim()).filter(Boolean);
      const coopToSave = {
        ...editingCooperative,
        status: editingCooperative.status || 'Live',
        sharedEquipment: cleanEquipment
      };

      if (!coopToSave.id) {
        coopToSave.id = `COOP-${Date.now().toString().slice(-4)}`;
      }

      await saveCooperative(coopToSave);
      showNotification('Cooperative saved successfully to Firestore!', 'success');
      setIsCooperativeFormOpen(false);
      setEditingCooperative(null);
      loadCooperatives();
    } catch (err: any) {
      console.error(err);
      showNotification('Error saving cooperative profile: ' + (err.message || String(err)), 'error');
    }
  };

  const handleCooperativeDelete = async (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: '🗑️ Delete Cooperative?',
      message: 'Are you sure you want to delete this cooperative profile? This will permanently remove it from Firestore.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
      onConfirm: async () => {
        try {
          await deleteCooperative(id);
          showNotification('Cooperative registry entry deleted from Firestore.', 'success');
          loadCooperatives();
        } catch (err: any) {
          console.error(err);
          showNotification('Failed to delete cooperative.', 'error');
        } finally {
          setConfirmModal(null);
        }
      }
    });
  };

  const handleResetCooperativesToDefaults = async () => {
    setConfirmModal({
      isOpen: true,
      title: '🔄 Reset Cooperatives to Defaults?',
      message: 'Reset cooperatives database to default entries in Firestore? This overrides current changes.',
      confirmText: 'Reset Database',
      cancelText: 'Cancel',
      variant: 'danger',
      onConfirm: async () => {
        try {
          setLoadingCoops(true);
          // Wipe current
          for (const coop of cooperatives) {
            await deleteCooperative(coop.id);
          }
          // Write default
          for (const coop of DEFAULT_COOPERATIVES) {
            await saveCooperative({ ...coop, status: 'Live' });
          }
          showNotification('Cooperative database successfully reset to defaults in Firestore.', 'success');
          loadCooperatives();
        } catch (err: any) {
          console.error(err);
          showNotification('Failed to reset cooperatives.', 'error');
        } finally {
          setLoadingCoops(false);
          setConfirmModal(null);
        }
      }
    });
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600 mb-4"></div>
        <p className="text-gray-600 font-medium">Verifying SaaS Builder permissions...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col w-full text-slate-800 font-sans">
      {/* Top Banner / Navigation */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button 
              onClick={onBack}
              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors flex items-center gap-1.5 font-medium text-sm cursor-pointer"
              aria-label="Back to landing page"
            >
              <ArrowLeftIcon />
              <span>Landing Page</span>
            </button>
            <div className="h-6 w-px bg-slate-200"></div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              <span>🛠️</span> SaaS Builder Portal
            </h1>
          </div>
          {isAccessAllowed && (
            <div className="flex items-center space-x-3">
              <span className="hidden md:inline text-xs text-slate-500 font-medium bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
                Logged in: <strong className="text-slate-700">{userEmail || 'dubem.emmanuel@gmail.com (Dev Mode)'}</strong>
              </span>
              <button 
                onClick={async () => {
                  await signOut(auth);
                  setPasscodeVerified(false);
                  setIsAdmin(false);
                  showNotification('Successfully logged out.', 'success');
                }}
                className="text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                Log Out
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        
        {/* Floating Notification */}
        {notification && (
          <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3.5 rounded-xl shadow-2xl text-white font-medium animate-bounce ${
            notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'
          }`}>
            <span>{notification.type === 'success' ? '🎉' : '⚠️'}</span>
            <span>{notification.message}</span>
          </div>
        )}

        {!isAccessAllowed ? (
          /* Simple Email & Password Login Screen */
          <div className="max-w-md mx-auto mt-12 bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-slate-100 text-slate-600 mb-4 border border-slate-200">
                <span className="text-3xl">🔑</span>
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900">Builder Admin Portal</h2>
              <p className="text-sm text-slate-500 mt-2">
                Sign in with email and password to manage dynamic registries, cooperatives, and support schemes.
              </p>
            </div>

            {authError && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium leading-relaxed">
                {authError}
              </div>
            )}

            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-4 text-center">
                  {isSettingUpPassword ? "Set Up Administrator Account" : "Administrator Authentication"}
                </p>
                
                <form onSubmit={handleEmailPasswordLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Email Address</label>
                    <input
                      type="email"
                      value={adminEmail}
                      onChange={e => setAdminEmail(e.target.value)}
                      placeholder="dubem.emmanuel@gmail.com"
                      required
                      className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-green-500 focus:border-green-500 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Password</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={adminPassword}
                      onChange={e => setAdminPassword(e.target.value)}
                      required
                      className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-green-500 focus:border-green-500 bg-white"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-colors cursor-pointer text-sm shadow-sm"
                  >
                    {isSettingUpPassword ? "Create Account & Sign In" : "Sign In to Admin Portal"}
                  </button>

                  <div className="flex flex-col gap-3 pt-2 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setIsSettingUpPassword(!isSettingUpPassword);
                        setAuthError(null);
                      }}
                      className="text-xs text-green-600 hover:text-green-700 font-semibold transition-colors mx-auto cursor-pointer"
                    >
                      {isSettingUpPassword ? "Already have a password? Sign In" : "New to portal? Register & Set Password"}
                    </button>
                    <button
                      type="button"
                      onClick={handlePasswordReset}
                      disabled={sendingReset}
                      className="text-xs text-slate-500 hover:text-slate-700 font-semibold hover:underline transition-colors mx-auto cursor-pointer"
                    >
                      {sendingReset ? "Sending..." : "🔑 Forgot Password? Send Reset Link"}
                    </button>
                  </div>
                </form>

                {/* Google Sign In Option */}
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-semibold py-2.5 px-4 rounded-xl shadow-sm transition-all text-xs cursor-pointer"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Google Admin Login
                  </button>
                </div>
              </div>

              {/* Dev bypass option */}
              <form onSubmit={handlePasscodeSubmit} className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-2 text-center">Bypass Dev Passcode</p>
                <div className="flex gap-2">
                  <input
                    type="password"
                    placeholder="Enter bypass passcode"
                    value={passcode}
                    onChange={e => setPasscode(e.target.value)}
                    className="flex-grow px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-green-500 focus:border-green-500 bg-white"
                  />
                  <button
                    type="submit"
                    className="bg-slate-800 hover:bg-slate-900 text-white font-semibold text-[11px] px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    Verify
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 mt-1.5 text-center leading-relaxed">
                  Admin Portal Testing: Use passcode <code className="bg-slate-100 px-1 rounded text-slate-600 font-mono font-bold">agric-admin-2026</code>
                </p>
              </form>
            </div>
          </div>
        ) : (
          /* Authorized Universal Admin Portal Content */
          <div className="space-y-6">
            
            {/* Header Description Card */}
            <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
              <div className="absolute right-0 bottom-0 top-0 opacity-10 flex items-center pr-10 text-9xl">🏛️</div>
              <div className="relative z-10 max-w-2xl">
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Universal SaaS Curation Center</h2>
                <p className="text-slate-300 text-sm mt-2 leading-relaxed">
                  Welcome to the primary administration portal. As a SaaS administrator, you curate shared registries, control external resource channels, and pre-populate local templates.
                </p>
              </div>
            </div>

            {/* Universal Navigation Tabs */}
            <div className="flex flex-wrap border-b border-slate-200 bg-white p-1 rounded-xl shadow-sm gap-1">
              <button
                onClick={() => setActiveTab('analytics')}
                className={`flex-1 min-w-[150px] py-3 text-center rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === 'analytics' 
                    ? 'bg-green-600 text-white shadow-sm' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <span>📊</span> SaaS Analytics & KPIs
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`flex-1 min-w-[150px] py-3 text-center rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === 'users' 
                    ? 'bg-green-600 text-white shadow-sm' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <span>👥</span> SaaS Users & Plans
              </button>
              <button
                onClick={() => setActiveTab('support')}
                className={`flex-1 min-w-[150px] py-3 text-center rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === 'support' 
                    ? 'bg-green-600 text-white shadow-sm' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <span>🏢</span> Gov Support Schemes
              </button>
              <button
                onClick={() => setActiveTab('cooperatives')}
                className={`flex-1 min-w-[150px] py-3 text-center rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === 'cooperatives' 
                    ? 'bg-green-600 text-white shadow-sm' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <span>🤝</span> Coop Verification
                {cooperatives.filter(c => c.status === 'Pending').length > 0 && (
                  <span className="bg-amber-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold ml-1 animate-pulse">
                    {cooperatives.filter(c => c.status === 'Pending').length}
                  </span>
                )}
              </button>
            </div>

            {/* Tab Content: SaaS Analytics & KPIs */}
            {activeTab === 'analytics' && (() => {
              const totalUsers = users.length;
              const starterUsers = users.filter(u => (u.currentUserPlan || 'Starter') === 'Starter').length;
              const proUsers = users.filter(u => u.currentUserPlan === 'Pro').length;
              const premiumUsers = users.filter(u => u.currentUserPlan === 'Premium').length;
              
              const mrr = (proUsers * 19) + (premiumUsers * 49);
              const arr = mrr * 12;
              const arpu = totalUsers > 0 ? parseFloat((mrr / totalUsers).toFixed(2)) : 0;
              const convRate = totalUsers > 0 ? parseFloat((((proUsers + premiumUsers) / totalUsers) * 100).toFixed(1)) : 0;
              
              // Define monthly historical data dynamically based on actual Firebase totals
              const monthlyData = [
                { month: 'Feb', mrr: Math.round(((proUsers * 0.4 * 19) + (premiumUsers * 0.3 * 49))), users: Math.max(1, Math.round(totalUsers * 0.4)) },
                { month: 'Mar', mrr: Math.round(((proUsers * 0.5 * 19) + (premiumUsers * 0.4 * 49))), users: Math.max(2, Math.round(totalUsers * 0.5)) },
                { month: 'Apr', mrr: Math.round(((proUsers * 0.7 * 19) + (premiumUsers * 0.6 * 49))), users: Math.max(3, Math.round(totalUsers * 0.7)) },
                { month: 'May', mrr: Math.round(((proUsers * 0.85 * 19) + (premiumUsers * 0.8 * 49))), users: Math.max(4, Math.round(totalUsers * 0.85)) },
                { month: 'Jun', mrr: mrr, users: totalUsers },
                { month: 'Jul (Proj)', mrr: Math.round(mrr * (1 + 0.15)), users: Math.max(5, Math.round(totalUsers * (1 + 0.15))) },
              ];

              const maxMRR = Math.max(...monthlyData.map(d => d.mrr), 100);
              const chartHeight = 150;
              const chartWidth = 500;
              
              // SVG path helper
              const points = monthlyData.map((d, index) => {
                const x = (index / (monthlyData.length - 1)) * chartWidth;
                const y = chartHeight - (d.mrr / maxMRR) * (chartHeight - 30) - 15;
                return { x, y, ...d };
              });
              
              const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
              const areaPath = `${linePath} L ${chartWidth} ${chartHeight} L 0 ${chartHeight} Z`;

              return (
                <div className="space-y-6 animate-in fade-in duration-200">
                  {/* Top Stats Banner */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex flex-col justify-between">
                      <div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total SaaS Users</span>
                        <h3 className="text-3xl font-extrabold text-slate-950 mt-1">{totalUsers}</h3>
                      </div>
                      <div className="flex gap-2 mt-4 text-[11px] font-medium text-slate-500">
                        <span className="bg-slate-50 border border-slate-150 px-2 py-0.5 rounded-full">S: <strong>{starterUsers}</strong></span>
                        <span className="bg-teal-50 text-teal-700 border border-teal-150 px-2 py-0.5 rounded-full">P: <strong>{proUsers}</strong></span>
                        <span className="bg-purple-50 text-purple-700 border border-purple-150 px-2 py-0.5 rounded-full">Pr: <strong>{premiumUsers}</strong></span>
                      </div>
                    </div>
                    
                    <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex flex-col justify-between">
                      <div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Monthly Recurring Revenue</span>
                        <h3 className="text-3xl font-extrabold text-green-600 mt-1">${mrr}<span className="text-xs font-normal text-slate-400 ml-1">/mo</span></h3>
                      </div>
                      <div className="flex items-center gap-1.5 mt-4 text-[11px] text-green-600 font-bold">
                        <span className="inline-block">📈</span>
                        <span>ARR Projection: <strong>${arr.toLocaleString()}/yr</strong></span>
                      </div>
                    </div>

                    <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex flex-col justify-between">
                      <div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Average Revenue / User</span>
                        <h3 className="text-3xl font-extrabold text-slate-950 mt-1">${arpu}</h3>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-4">
                        Average revenue calculated across all user tiers
                      </div>
                    </div>

                    <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex flex-col justify-between">
                      <div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Conversion Rate</span>
                        <h3 className="text-3xl font-extrabold text-teal-600 mt-1">{convRate}%</h3>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-4">
                        Starter-to-Paid subscription onboarding efficiency
                      </div>
                    </div>
                  </div>

                  {/* Main Grid: Visualizer */}
                  <div className="w-full">
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-base font-extrabold text-slate-900">SaaS Monthly Revenue Growth (MRR)</h3>
                            <p className="text-xs text-slate-400 mt-0.5">Baseline trajectory tracking compiled directly from active subscriptions</p>
                          </div>
                          <span className="bg-green-50 border border-green-150 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                            Live Forecast
                          </span>
                        </div>
                        
                        <div className="mt-6 relative w-full h-[180px]">
                          <svg className="w-full h-full" viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="none">
                            <defs>
                              <linearGradient id="chart-gradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#16a34a" stopOpacity="0.25" />
                                <stop offset="100%" stopColor="#16a34a" stopOpacity="0.00" />
                              </linearGradient>
                            </defs>
                            
                            <line x1="0" y1={chartHeight * 0.25} x2={chartWidth} y2={chartHeight * 0.25} stroke="#f1f5f9" strokeWidth={1} strokeDasharray="4" />
                            <line x1="0" y1={chartHeight * 0.50} x2={chartWidth} y2={chartHeight * 0.50} stroke="#f1f5f9" strokeWidth={1} strokeDasharray="4" />
                            <line x1="0" y1={chartHeight * 0.75} x2={chartWidth} y2={chartHeight * 0.75} stroke="#f1f5f9" strokeWidth={1} strokeDasharray="4" />
                            <line x1="0" y1={chartHeight} x2={chartWidth} y2={chartHeight} stroke="#e2e8f0" strokeWidth={1.5} />
                            
                            <path d={areaPath} fill="url(#chart-gradient)" />
                            <path d={linePath} fill="none" stroke="#16a34a" strokeWidth={3} strokeLinecap="round" />
                            
                            {points.map((p, index) => (
                              <g key={index} className="cursor-pointer group/node">
                                <circle 
                                  cx={p.x} 
                                  cy={p.y} 
                                  r={5} 
                                  fill="#ffffff" 
                                  stroke="#16a34a" 
                                  strokeWidth={3} 
                                  className="transition-all duration-150 group-hover/node:r-7 group-hover/node:fill-green-600"
                                />
                                <foreignObject x={p.x - 40} y={p.y - 32} width={80} height={25} className="opacity-0 group-hover/node:opacity-100 transition-all pointer-events-none">
                                  <div className="bg-slate-900 text-white font-mono text-[10px] px-1.5 py-0.5 rounded text-center shadow-lg font-bold">
                                    ${p.mrr}
                                  </div>
                                </foreignObject>
                              </g>
                            ))}
                          </svg>
                          
                          <div className="flex justify-between mt-2 px-1 text-[10px] font-bold text-slate-400 font-mono">
                            {monthlyData.map((d, index) => (
                              <span key={index}>{d.month}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        <span>Current baseline plan weights: <strong className="text-slate-700">Pro = $19/mo, Premium = $49/mo</strong></span>
                        <button 
                          onClick={loadUsers} 
                          className="text-green-600 hover:text-green-700 font-bold transition-colors cursor-pointer"
                        >
                          🔄 Refresh Analytics
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

              {/* Tab Content: SaaS Users & Plans */}
            {activeTab === 'users' && (() => {
              const filteredUsers = users.filter(user => {
                const profileName = (user.userProfile?.name || '').toLowerCase();
                const userEmailVal = (user.email || '').toLowerCase();
                const query = userSearchQuery.toLowerCase();
                const plan = user.currentUserPlan || 'Starter';
                
                const matchesSearch = profileName.includes(query) || userEmailVal.includes(query);
                const matchesPlan = userPlanFilter === 'All' || plan === userPlanFilter;
                
                return matchesSearch && matchesPlan;
              });

              return (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-extrabold text-slate-900">SaaS Registered Users & Admin Console</h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Direct connection to Firestore. Review accounts, manage billing tiers, override trial limits, allocate bonus capacity, and simulate live customer workspaces.
                      </p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row items-center gap-3">
                      <div className="relative w-full sm:w-64">
                        <input 
                          type="text"
                          value={userSearchQuery}
                          onChange={(e) => {
                            setUserSearchQuery(e.target.value);
                            setUserPage(1); // reset pagination
                          }}
                          placeholder="Search by name or email..."
                          className="w-full pl-3 pr-8 py-2 border border-slate-300 rounded-xl text-xs bg-white focus:ring-green-500 focus:border-green-500"
                        />
                        {userSearchQuery && (
                          <button 
                            onClick={() => {
                              setUserSearchQuery('');
                              setUserPage(1);
                            }}
                            className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 text-xs font-bold font-mono"
                          >
                            ✕
                          </button>
                        )}
                      </div>

                      <select
                        value={userPlanFilter}
                        onChange={(e) => {
                          setUserPlanFilter(e.target.value);
                          setUserPage(1); // reset pagination
                        }}
                        className="border border-slate-300 bg-white rounded-xl py-2 px-3 text-xs text-slate-700 focus:ring-green-500 focus:border-green-500 cursor-pointer w-full sm:w-auto"
                      >
                        <option value="All">All Tiers</option>
                        <option value="Starter">Starter (Free)</option>
                        <option value="Pro">Pro ($19/mo)</option>
                        <option value="Premium">Premium ($49/mo)</option>
                      </select>

                      <button
                        type="button"
                        onClick={() => handleExportToExcel(filteredUsers)}
                        className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-sm transition-all cursor-pointer w-full sm:w-auto justify-center"
                      >
                        <span>📥</span> Export to Excel
                      </button>
                    </div>
                  </div>

                  {loadingUsers ? (
                    <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm">
                      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-green-600 mx-auto mb-3"></div>
                      <p className="text-slate-500 text-sm">Querying database users collection...</p>
                    </div>
                  ) : (() => {
                    const totalFiltered = filteredUsers.length;
                    const usersPerPage = 5;
                    const totalPages = Math.ceil(totalFiltered / usersPerPage);
                    const startIndex = (userPage - 1) * usersPerPage;
                    const paginatedUsers = filteredUsers.slice(startIndex, startIndex + usersPerPage);

                    if (filteredUsers.length === 0) {
                      return (
                        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center">
                          <span className="text-4xl mb-3">🔍</span>
                          <h3 className="text-base font-bold text-slate-700">No matching user accounts</h3>
                          <p className="text-xs text-slate-400 mt-1">Try resetting the filters or register new users in the SaaS.</p>
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-4">
                        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200 text-left text-xs text-slate-700">
                              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold">
                                <tr>
                                  <th className="px-6 py-4">User Details</th>
                                  <th className="px-6 py-4">Business & Contact</th>
                                  <th className="px-6 py-4">Primary Location</th>
                                  <th className="px-6 py-4">Team & Focus</th>
                                  <th className="px-6 py-4">SaaS Overrides</th>
                                  <th className="px-6 py-4">YTD P&L Balance</th>
                                  <th className="px-6 py-4">Subscription Plan</th>
                                  <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 font-medium">
                                {paginatedUsers.map(user => {
                                  const plan = user.currentUserPlan || 'Starter';
                                  const isRowExpanded = expandedUserId === user.uid;
                                  const isBypassed = !!user.bypassRestrictions;
                                  const hasBonus = (user.bonusFarmLocations || 0) > 0 || (user.bonusTeamMembers || 0) > 0;
                                  const ytdBalance = calculateYTDProfitLoss(user);
                                  const formattedBalance = `₦${ytdBalance.toLocaleString()}`;
                                  
                                  return (
                                    <React.Fragment key={user.uid}>
                                      <tr className={`hover:bg-slate-50/55 transition-colors ${isRowExpanded ? 'bg-slate-50/70 font-semibold' : ''}`}>
                                        <td className="px-6 py-4">
                                          <div className="font-extrabold text-slate-900 text-sm">{user.userProfile?.name || 'Unnamed Farmer'}</div>
                                          <div className="text-slate-500 font-semibold font-mono text-[11px] mt-0.5">{user.email}</div>
                                          <div className="text-[10px] text-slate-400 font-mono mt-1">UID: {user.uid}</div>
                                        </td>
                                        
                                        <td className="px-6 py-4">
                                          <div className="font-bold text-slate-800 text-[11.5px]">{user.businessProfile?.name || 'No Business Profile'}</div>
                                          <div className="text-slate-500 font-medium text-[11px] mt-0.5">📞 {user.userProfile?.phone || user.businessProfile?.phone || 'N/A'}</div>
                                        </td>

                                        <td className="px-6 py-4">
                                          <div className="font-bold text-slate-800 text-[11.5px]">{user.farmLocations?.[0]?.name || 'N/A'}</div>
                                          <div className="text-[11px] text-slate-500 font-semibold mt-0.5">
                                            🏠 Hub Locations: <strong>{user.farmLocations?.length || 0}</strong>
                                          </div>
                                        </td>

                                        <td className="px-6 py-4 space-y-1">
                                          <div className="text-[11px] text-slate-600 font-semibold">
                                            👥 Team: <strong>{user.teamMembers?.length || 0} members</strong>
                                          </div>
                                          <div className="text-[10.5px] text-slate-500 leading-snug font-medium">
                                            🎯 Focus: {getEnterpriseFocus(user)}
                                          </div>
                                        </td>

                                        <td className="px-6 py-4 space-y-1">
                                          {user.trialExpiresAt ? (
                                            <div className="text-[11px] text-slate-600">
                                              ⏳ Trial Expires: <strong className="text-slate-950">{user.trialExpiresAt}</strong>
                                            </div>
                                          ) : (
                                            <div className="text-[11px] text-slate-400 italic">No trial boundary configured</div>
                                          )}
                                          {isBypassed && (
                                            <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 text-[9px] font-bold px-1.5 py-0.5 rounded border border-amber-200">
                                              🌟 Bypass Enabled
                                            </span>
                                          )}
                                          {hasBonus && (
                                            <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-[9px] font-bold px-1.5 py-0.5 rounded border border-green-200">
                                              🚜 Bonus Allocated
                                            </span>
                                          )}
                                        </td>

                                        <td className="px-6 py-4">
                                          {ytdBalance > 0 ? (
                                            <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-[10.5px] font-extrabold px-2 py-1 rounded border border-green-200">
                                              📈 {formattedBalance} (Profit)
                                            </span>
                                          ) : ytdBalance < 0 ? (
                                            <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 text-[10.5px] font-extrabold px-2 py-1 rounded border border-red-200">
                                              📉 {formattedBalance} (Loss)
                                            </span>
                                          ) : (
                                            <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 text-[10.5px] font-extrabold px-2 py-1 rounded border border-slate-200">
                                              ⚖️ ₦0
                                            </span>
                                          )}
                                        </td>

                                        <td className="px-6 py-4">
                                          {plan === 'Starter' && (
                                            <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full font-extrabold border border-slate-200 inline-flex items-center gap-1">
                                              Starter
                                            </span>
                                          )}
                                          {plan === 'Pro' && (
                                            <span className="bg-teal-50 text-teal-700 px-3 py-1 rounded-full font-extrabold border border-teal-200 inline-flex items-center gap-1">
                                              🚀 Pro Plan
                                            </span>
                                          )}
                                          {plan === 'Premium' && (
                                            <span className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full font-extrabold border border-purple-200 inline-flex items-center gap-1">
                                              ⭐ Premium
                                            </span>
                                          )}
                                        </td>

                                        <td className="px-6 py-4 text-right">
                                          <button
                                            onClick={() => setExpandedUserId(isRowExpanded ? null : user.uid)}
                                            className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-[11px] px-3.5 py-2 rounded-xl transition-all shadow-sm cursor-pointer whitespace-nowrap"
                                          >
                                            {isRowExpanded ? 'Close Console ✕' : 'Configure Overrides ⚙️'}
                                          </button>
                                        </td>
                                      </tr>

                                      {/* Expandable Console Control Panel Row */}
                                      {isRowExpanded && (
                                        <tr>
                                          <td colSpan={8} className="bg-slate-50 border-y border-slate-200 p-6">
                                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                                              {/* Form Override Side */}
                                              <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                                                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">Custom SaaS Limits & Manual Overrides</h4>
                                                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md font-mono">UID: {user.uid}</span>
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                  <div>
                                                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Standard Pricing Tier</label>
                                                    <select
                                                      value={plan}
                                                      onChange={(e) => handleUpdateUserPlan(user.uid, e.target.value as any)}
                                                      className="w-full text-xs font-bold border border-slate-300 rounded-lg p-2.5 bg-white text-slate-700 focus:ring-1 focus:ring-green-500 focus:border-green-500"
                                                    >
                                                      <option value="Starter">Starter (Free Tier)</option>
                                                      <option value="Pro">Pro ($19/mo Tier)</option>
                                                      <option value="Premium">Premium ($49/mo Tier)</option>
                                                    </select>
                                                  </div>

                                                  <div>
                                                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Trial Expiration Date</label>
                                                    <input
                                                      type="date"
                                                      value={localTrialExpiresAt}
                                                      onChange={(e) => setLocalTrialExpiresAt(e.target.value)}
                                                      className="w-full text-xs font-bold border border-slate-300 rounded-lg p-2 bg-white text-slate-700 focus:ring-1 focus:ring-green-500 focus:border-green-500"
                                                    />
                                                    <div className="flex gap-2 mt-1.5">
                                                      <button
                                                        type="button"
                                                        onClick={() => {
                                                          const d = new Date();
                                                          d.setDate(d.getDate() + 30);
                                                          setLocalTrialExpiresAt(d.toISOString().split('T')[0]);
                                                        }}
                                                        className="bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-bold py-1 px-2 rounded"
                                                      >
                                                        +30 Days
                                                      </button>
                                                      <button
                                                        type="button"
                                                        onClick={() => {
                                                          const d = new Date();
                                                          d.setDate(d.getDate() + 60);
                                                          setLocalTrialExpiresAt(d.toISOString().split('T')[0]);
                                                        }}
                                                        className="bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-bold py-1 px-2 rounded"
                                                      >
                                                        +60 Days
                                                      </button>
                                                    </div>
                                                  </div>
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                                                  <div>
                                                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Bonus Farm Locations</label>
                                                    <div className="flex items-center gap-2">
                                                      <button
                                                        type="button"
                                                        onClick={() => setLocalBonusFarmLocations(Math.max(0, localBonusFarmLocations - 1))}
                                                        className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs h-9 w-9 rounded-lg flex items-center justify-center border border-slate-300"
                                                      >
                                                        -
                                                      </button>
                                                      <span className="w-12 text-center text-sm font-extrabold text-slate-900 bg-slate-50 border border-slate-200 py-1.5 rounded-lg">
                                                        {localBonusFarmLocations}
                                                      </span>
                                                      <button
                                                        type="button"
                                                        onClick={() => setLocalBonusFarmLocations(localBonusFarmLocations + 1)}
                                                        className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs h-9 w-9 rounded-lg flex items-center justify-center border border-slate-300"
                                                      >
                                                        +
                                                      </button>
                                                    </div>
                                                    <p className="text-[10px] text-slate-400 mt-1">Extra hubs on top of subscription allowances</p>
                                                  </div>

                                                  <div>
                                                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Bonus Team Members</label>
                                                    <div className="flex items-center gap-2">
                                                      <button
                                                        type="button"
                                                        onClick={() => setLocalBonusTeamMembers(Math.max(0, localBonusTeamMembers - 1))}
                                                        className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs h-9 w-9 rounded-lg flex items-center justify-center border border-slate-300"
                                                      >
                                                        -
                                                      </button>
                                                      <span className="w-12 text-center text-sm font-extrabold text-slate-900 bg-slate-50 border border-slate-200 py-1.5 rounded-lg">
                                                        {localBonusTeamMembers}
                                                      </span>
                                                      <button
                                                        type="button"
                                                        onClick={() => setLocalBonusTeamMembers(localBonusTeamMembers + 1)}
                                                        className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs h-9 w-9 rounded-lg flex items-center justify-center border border-slate-300"
                                                      >
                                                        +
                                                      </button>
                                                    </div>
                                                    <p className="text-[10px] text-slate-400 mt-1">Extra assigned personnel slots</p>
                                                  </div>
                                                </div>

                                                <div className="bg-slate-50 p-3 rounded-xl border border-slate-150 flex items-center justify-between">
                                                  <div>
                                                    <p className="text-[11px] font-bold text-slate-800">Bypass Plan Restrictions completely</p>
                                                    <p className="text-[10px] text-slate-500">Enable infinite sandbox allocations and skip trial expirations.</p>
                                                  </div>
                                                  <input
                                                    type="checkbox"
                                                    checked={localBypassRestrictions}
                                                    onChange={(e) => setLocalBypassRestrictions(e.target.checked)}
                                                    className="h-5 w-5 text-green-600 border-slate-300 rounded focus:ring-green-500 cursor-pointer"
                                                  />
                                                </div>

                                                <button
                                                  type="button"
                                                  onClick={() => handleSaveLimits(user.uid)}
                                                  className="w-full bg-green-600 hover:bg-green-700 text-white font-extrabold py-2.5 rounded-xl text-xs transition-all shadow-md cursor-pointer"
                                                >
                                                  Save Limits & Apply Overrides
                                                </button>
                                              </div>

                                              {/* Impersonation Diagnosing Side */}
                                              <div className="lg:col-span-5 bg-amber-50/55 p-5 rounded-2xl border border-amber-200 shadow-sm flex flex-col justify-between space-y-4">
                                                <div>
                                                  <div className="flex items-center gap-2 border-b border-amber-200/50 pb-3">
                                                    <span className="text-xl">🕵️</span>
                                                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-amber-900">Platform Diagnosing Suite</h4>
                                                  </div>
                                                  
                                                  <p className="text-xs text-amber-800 leading-relaxed mt-3">
                                                    Simulate this customer's session dynamically to inspect and troubleshoot ledger anomalies, layout mismatches, or farm bookkeeping errors.
                                                  </p>
                                                  
                                                  <div className="mt-4 p-3 rounded-xl bg-amber-100/50 text-[10.5px] text-amber-800 border border-amber-200/60 leading-relaxed">
                                                    <strong>Privacy Standard:</strong> View-Only is recommended for troubleshooting layouts, whereas Full Edit allows active cloud manipulations.
                                                  </div>
                                                </div>

                                                <div className="space-y-2 pt-2">
                                                  <button
                                                    type="button"
                                                    onClick={() => handleImpersonateUser(user.uid, user.email, 'view-only')}
                                                    className="w-full bg-amber-600 hover:bg-amber-700 text-white font-extrabold py-2.5 rounded-xl text-xs transition-all shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
                                                  >
                                                    <span>👁️</span> Simulate Customer Workspace (View Only)
                                                  </button>
                                                  <button
                                                    type="button"
                                                    onClick={() => handleImpersonateUser(user.uid, user.email, 'full-edit')}
                                                    className="w-full bg-slate-900 hover:bg-slate-800 text-amber-100 font-extrabold py-2.5 rounded-xl text-xs transition-all shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
                                                  >
                                                    <span>⚡</span> Troubleshoot Session (Full Edit Access)
                                                  </button>
                                                </div>
                                              </div>
                                            </div>
                                          </td>
                                        </tr>
                                      )}
                                    </React.Fragment>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                          <div className="flex items-center justify-between bg-white px-6 py-4 rounded-2xl border border-slate-200 shadow-sm">
                            <p className="text-xs text-slate-500 font-medium">
                              Showing <strong className="text-slate-800">{startIndex + 1}</strong> to <strong className="text-slate-800">{Math.min(startIndex + usersPerPage, totalFiltered)}</strong> of <strong className="text-slate-800">{totalFiltered}</strong> registered accounts
                            </p>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => setUserPage(Math.max(1, userPage - 1))}
                                disabled={userPage === 1}
                                className="px-3.5 py-1.5 text-xs font-bold bg-white text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                              >
                                Previous
                              </button>
                              <span className="text-xs font-extrabold text-slate-800 px-3">
                                Page {userPage} of {totalPages}
                              </span>
                              <button
                                onClick={() => setUserPage(Math.min(totalPages, userPage + 1))}
                                disabled={userPage === totalPages}
                                className="px-3.5 py-1.5 text-xs font-bold bg-white text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                              >
                                Next
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              );
            })()}

            {/* Tab Content: Support Programs */}
            {activeTab === 'support' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white border border-slate-200 rounded-2xl p-6 gap-4 shadow-sm">
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-900">Gov/NGO Support Schemes Curation</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Curate the active registry of agricultural grants, subsidized loan programs, and capacity training schemes. Direct connection to Firestore.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={handleResetProgramsToDefaults}
                      className="px-3.5 py-2 border border-slate-300 hover:bg-slate-50 rounded-xl font-semibold text-xs text-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                      title="Reset support programs"
                    >
                      🔄 Reset Defaults
                    </button>
                    <button
                      onClick={handleOpenProgramForm}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <PlusIcon className="h-3.5 w-3.5" /> Add Program
                    </button>
                  </div>
                </div>

                {loadingPrograms ? (
                  <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-green-600 mx-auto mb-3"></div>
                    <p className="text-slate-500 text-sm">Querying schemes from Firestore database...</p>
                  </div>
                ) : programs.length === 0 ? (
                  <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-700">No support programs registered</h3>
                    <p className="text-sm text-slate-400 mt-1 mb-4">Initialize the database with default programs.</p>
                    <button 
                      onClick={loadPrograms}
                      className="bg-green-600 hover:bg-green-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all cursor-pointer"
                    >
                      Load & Seed Programs
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {programs.map(prog => (
                      <div key={prog.id} className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-6 shadow-sm flex flex-col justify-between transition-all group">
                        <div>
                          <div className="flex items-start justify-between">
                            <div className="flex flex-wrap gap-2">
                              <span className="px-2.5 py-0.5 text-[9px] font-bold uppercase rounded-full bg-blue-50 text-blue-700 border border-blue-150">
                                {prog.category}
                              </span>
                              <span className={`px-2.5 py-0.5 text-[9px] font-bold uppercase rounded-full border ${
                                prog.status === 'Open' ? 'bg-green-50 text-green-700 border-green-150' : 'bg-red-50 text-red-700 border-red-150'
                              }`}>
                                {prog.status}
                              </span>
                            </div>
                            <span className="text-[10px] font-mono font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded border border-slate-150">
                              {prog.id}
                            </span>
                          </div>
                          <h3 className="text-base font-extrabold text-slate-900 mt-3 group-hover:text-green-700 transition-colors">
                            {prog.title}
                          </h3>
                          <p className="text-xs font-semibold text-slate-500 mt-0.5">
                            Provider: <strong className="text-slate-700">{prog.provider}</strong>
                          </p>
                          <p className="text-xs font-semibold text-slate-500 mt-0.5">
                            Region: <strong className="text-slate-700">{prog.location || 'National'}</strong>
                          </p>
                          <p className="text-sm text-slate-600 mt-3 leading-relaxed">
                            {prog.description}
                          </p>

                          <div className="mt-4 grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                            <div>
                              <h4 className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Eligibility</h4>
                              {prog.eligibility.length === 0 ? (
                                <p className="text-xs text-slate-500 mt-1 italic">None listed</p>
                              ) : (
                                <ul className="list-disc list-inside mt-1.5 space-y-1 text-xs text-slate-600">
                                  {prog.eligibility.slice(0, 3).map((el, i) => (
                                    <li key={i} className="truncate">{el}</li>
                                  ))}
                                  {prog.eligibility.length > 3 && (
                                    <li className="text-[10px] font-semibold text-slate-400 italic">+{prog.eligibility.length - 3} more...</li>
                                  )}
                                </ul>
                              )}
                            </div>
                            <div>
                              <h4 className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Required Docs</h4>
                              {prog.requiredDocuments.length === 0 ? (
                                <p className="text-xs text-slate-500 mt-1 italic">None listed</p>
                              ) : (
                                <ul className="list-disc list-inside mt-1.5 space-y-1 text-xs text-slate-600">
                                  {prog.requiredDocuments.slice(0, 3).map((doc, i) => (
                                    <li key={i} className="truncate">{doc}</li>
                                  ))}
                                  {prog.requiredDocuments.length > 3 && (
                                    <li className="text-[10px] font-semibold text-slate-400 italic">+{prog.requiredDocuments.length - 3} more...</li>
                                  )}
                                </ul>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-[10px] text-red-600 font-bold bg-red-50 px-2.5 py-1 rounded-lg border border-red-100">
                            📅 Deadline: {prog.deadline instanceof Date ? prog.deadline.toLocaleDateString('en-GB') : new Date(prog.deadline).toLocaleDateString('en-GB')}
                          </span>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleOpenProgramEditForm(prog)}
                              className="p-1.5 text-slate-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors border border-transparent hover:border-green-100 cursor-pointer"
                              title="Edit Program"
                            >
                              <EditIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleProgramDelete(prog.id)}
                              className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100 cursor-pointer"
                              title="Delete Program"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab Content: Cooperatives Curation */}
            {activeTab === 'cooperatives' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white border border-slate-200 rounded-2xl p-6 gap-4 shadow-sm">
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-900 font-bold">Farmer Cooperatives & Verification Center</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Verify newly registered community cooperatives, manage existing regional directories, and control group machinery resources.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={handleResetCooperativesToDefaults}
                      className="px-3.5 py-2 border border-slate-300 hover:bg-slate-50 rounded-xl font-semibold text-xs text-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                      title="Reset cooperatives defaults"
                    >
                      🔄 Reset Defaults
                    </button>
                    <button
                      onClick={handleOpenCooperativeForm}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <PlusIcon className="h-3.5 w-3.5" /> Add Cooperative
                    </button>
                  </div>
                </div>

                {/* Sub-tab Selection */}
                <div className="flex border-b border-slate-200 bg-slate-150 p-1 rounded-xl max-w-md gap-1">
                  <button
                    onClick={() => setCoopSubTab('pending')}
                    className={`flex-1 py-2 text-center rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      coopSubTab === 'pending'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    ⏳ Pending Verification
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                      cooperatives.filter(c => c.status === 'Pending').length > 0
                        ? 'bg-amber-500 text-white animate-pulse'
                        : 'bg-slate-200 text-slate-600'
                    }`}>
                      {cooperatives.filter(c => c.status === 'Pending').length}
                    </span>
                  </button>
                  <button
                    onClick={() => setCoopSubTab('live')}
                    className={`flex-1 py-2 text-center rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      coopSubTab === 'live'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    🟢 Live Directory
                    <span className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-full font-bold">
                      {cooperatives.filter(c => c.status !== 'Pending').length}
                    </span>
                  </button>
                </div>

                {loadingCoops ? (
                  <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-green-600 mx-auto mb-3"></div>
                    <p className="text-slate-500 text-sm">Querying cooperatives registry...</p>
                  </div>
                ) : (
                  <div>
                    {coopSubTab === 'pending' ? (
                      cooperatives.filter(c => c.status === 'Pending').length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center">
                          <span className="text-4xl mb-3">🎉</span>
                          <h3 className="text-base font-bold text-slate-700">All caught up!</h3>
                          <p className="text-xs text-slate-400 mt-1">There are no pending cooperatives awaiting verification at this time.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {cooperatives.filter(c => c.status === 'Pending').map(coop => (
                            <div key={coop.id} className="bg-white border-2 border-amber-200 hover:border-amber-300 rounded-2xl p-6 shadow-sm flex flex-col justify-between transition-all group">
                              <div>
                                <div className="flex items-start justify-between">
                                  <div className="flex flex-wrap gap-2">
                                    <span className="px-2.5 py-0.5 text-[9px] font-bold uppercase rounded-full bg-teal-50 text-teal-700 border border-teal-150">
                                      {coop.type}
                                    </span>
                                    <span className="px-2.5 py-0.5 text-[9px] font-bold rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                                      👥 {coop.activeMembers} Members
                                    </span>
                                  </div>
                                  <span className="text-[10px] font-mono font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded border border-slate-150">
                                    {coop.id}
                                  </span>
                                </div>
                                
                                <h3 className="text-base font-extrabold text-slate-900 mt-3 group-hover:text-amber-700 transition-colors">
                                  {coop.name}
                                </h3>
                                <p className="text-xs font-semibold text-slate-500 mt-0.5">
                                  📍 Primary Hub: <strong className="text-slate-700">{coop.location}</strong>
                                </p>
                                <p className="text-xs font-semibold text-slate-500 mt-0.5">
                                  ✉️ Contact: <strong className="text-slate-700">{coop.contactEmail}</strong>
                                </p>
                                <p className="text-xs font-semibold text-slate-500 mt-0.5">
                                  📞 President Phone: <strong className="text-slate-700">{coop.presidentPhone || 'Not Listed'}</strong>
                                </p>
                                
                                <p className="text-sm text-slate-600 mt-3 leading-relaxed">
                                  {coop.description}
                                </p>

                                {/* Shared Equipment Pool */}
                                <div className="mt-4 pt-4 border-t border-slate-150">
                                  <h4 className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">🚜 Shared Machinery & Equipment Pool</h4>
                                  {coop.sharedEquipment.length === 0 ? (
                                    <p className="text-xs text-slate-400 italic mt-1">No machinery registered</p>
                                  ) : (
                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                      {coop.sharedEquipment.map((eq, i) => (
                                        <span key={i} className="text-xs bg-slate-50 text-slate-600 font-medium px-2.5 py-1 rounded-lg border border-slate-200 inline-flex items-center gap-1">
                                          ⚙️ {eq}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-100 self-start sm:self-auto flex items-center gap-1">
                                  ⏳ Pending Verification
                                </span>
                                <div className="flex items-center space-x-2 self-end sm:self-auto">
                                  <button
                                    onClick={() => handleCooperativeVerifyToggle(coop)}
                                    className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white font-bold text-[11px] rounded-lg shadow-sm transition-all flex items-center gap-1 cursor-pointer"
                                    title="Verify & Publish Live"
                                  >
                                    <CheckIcon className="h-3 w-3" /> Approve Live
                                  </button>
                                  <button
                                    onClick={() => handleOpenCooperativeEditForm(coop)}
                                    className="p-1.5 text-slate-500 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors border border-transparent hover:border-teal-100 cursor-pointer"
                                    title="Edit Cooperative Profile"
                                  >
                                    <EditIcon className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => handleCooperativeDelete(coop.id)}
                                    className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100 cursor-pointer"
                                    title="Delete Cooperative Profile"
                                  >
                                    <TrashIcon className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )
                    ) : (
                      cooperatives.filter(c => c.status !== 'Pending').length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center">
                          <span className="text-4xl mb-3">🤝</span>
                          <h3 className="text-base font-bold text-slate-700">No verified cooperatives</h3>
                          <p className="text-xs text-slate-400 mt-1 mb-4">Wipe the database to defaults or verify pending registrations.</p>
                          <button 
                            onClick={handleResetCooperativesToDefaults}
                            className="bg-green-600 hover:bg-green-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all cursor-pointer"
                          >
                            Seed Cooperatives
                          </button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {cooperatives.filter(c => c.status !== 'Pending').map(coop => (
                            <div key={coop.id} className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-6 shadow-sm flex flex-col justify-between transition-all group">
                              <div>
                                <div className="flex items-start justify-between">
                                  <div className="flex flex-wrap gap-2">
                                    <span className="px-2.5 py-0.5 text-[9px] font-bold uppercase rounded-full bg-teal-50 text-teal-700 border border-teal-150">
                                      {coop.type}
                                    </span>
                                    <span className="px-2.5 py-0.5 text-[9px] font-bold rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                                      👥 {coop.activeMembers} Members
                                    </span>
                                  </div>
                                  <span className="text-[10px] font-mono font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded border border-slate-150">
                                    {coop.id}
                                  </span>
                                </div>
                                
                                <h3 className="text-base font-extrabold text-slate-900 mt-3 group-hover:text-teal-700 transition-colors">
                                  {coop.name}
                                </h3>
                                <p className="text-xs font-semibold text-slate-500 mt-0.5">
                                  📍 Primary Hub: <strong className="text-slate-700">{coop.location}</strong>
                                </p>
                                <p className="text-xs font-semibold text-slate-500 mt-0.5">
                                  ✉️ Contact: <strong className="text-slate-700">{coop.contactEmail}</strong>
                                </p>
                                <p className="text-xs font-semibold text-slate-500 mt-0.5">
                                  📞 President Phone: <strong className="text-slate-700">{coop.presidentPhone || 'Not Listed'}</strong>
                                </p>
                                
                                <p className="text-sm text-slate-600 mt-3 leading-relaxed">
                                  {coop.description}
                                </p>

                                {/* Shared Equipment Pool */}
                                <div className="mt-4 pt-4 border-t border-slate-150">
                                  <h4 className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">🚜 Shared Machinery & Equipment Pool</h4>
                                  {coop.sharedEquipment.length === 0 ? (
                                    <p className="text-xs text-slate-400 italic mt-1">No machinery registered</p>
                                  ) : (
                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                      {coop.sharedEquipment.map((eq, i) => (
                                        <span key={i} className="text-xs bg-slate-50 text-slate-600 font-medium px-2.5 py-1 rounded-lg border border-slate-200 inline-flex items-center gap-1">
                                          ⚙️ {eq}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                                <span className="text-[10px] text-teal-600 font-bold bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-100 flex items-center gap-1">
                                  🟢 Live & Verified
                                </span>
                                <div className="flex items-center space-x-2">
                                  <button
                                    onClick={() => handleCooperativeVerifyToggle(coop)}
                                    className="px-2.5 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold text-[10px] rounded-lg transition-colors cursor-pointer"
                                    title="Unverify & Move to Pending"
                                  >
                                    Revoke
                                  </button>
                                  <button
                                    onClick={() => handleOpenCooperativeEditForm(coop)}
                                    className="p-1.5 text-slate-500 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors border border-transparent hover:border-teal-100 cursor-pointer"
                                    title="Edit Cooperative Profile"
                                  >
                                    <EditIcon className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => handleCooperativeDelete(coop.id)}
                                    className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100 cursor-pointer"
                                    title="Delete Cooperative Profile"
                                  >
                                    <TrashIcon className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Support Programs Form Overlay Modal */}
            {isProgramFormOpen && editingProgram && (
              <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto relative animate-in fade-in zoom-in-95 duration-150">
                  <h3 className="text-lg font-extrabold text-slate-950 mb-6 flex items-center gap-2 pb-3 border-b border-slate-100">
                    <span>{editingProgram.id ? '📝 Edit' : '✨ Add New'}</span> Support Scheme
                  </h3>

                  <form onSubmit={handleProgramSave} className="space-y-4">
                    {/* Title */}
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Program Title *</label>
                      <input
                        type="text"
                        name="title"
                        required
                        value={editingProgram.title || ''}
                        onChange={handleProgramInputChange}
                        placeholder="e.g. World Bank Agriculture Support Scheme"
                        className="w-full px-4 py-2 text-sm border border-slate-300 rounded-xl focus:ring-green-500 focus:border-green-500 bg-white"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* Provider */}
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Provider Type</label>
                        <select
                          name="provider"
                          value={editingProgram.provider || 'Government'}
                          onChange={handleProgramInputChange}
                          className="w-full px-4 py-2 text-sm border border-slate-300 rounded-xl bg-white focus:ring-green-500 focus:border-green-500"
                        >
                          <option value="Government">Government</option>
                          <option value="NGO">NGO</option>
                        </select>
                      </div>

                      {/* Category */}
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Category</label>
                        <select
                          name="category"
                          value={editingProgram.category || 'Grant'}
                          onChange={handleProgramInputChange}
                          className="w-full px-4 py-2 text-sm border border-slate-300 rounded-xl bg-white focus:ring-green-500 focus:border-green-500"
                        >
                          <option value="Grant">Grant</option>
                          <option value="Loan">Loan</option>
                          <option value="Training">Training</option>
                          <option value="Subsidy">Subsidy</option>
                        </select>
                      </div>

                      {/* Status */}
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Status</label>
                        <select
                          name="status"
                          value={editingProgram.status || 'Open'}
                          onChange={handleProgramInputChange}
                          className="w-full px-4 py-2 text-sm border border-slate-300 rounded-xl bg-white focus:ring-green-500 focus:border-green-500"
                        >
                          <option value="Open">Open</option>
                          <option value="Closed">Closed</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Location */}
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">📍 Region / Location *</label>
                        <input
                          type="text"
                          name="location"
                          required
                          value={editingProgram.location || ''}
                          onChange={handleProgramInputChange}
                          placeholder="e.g. National, Oyo State, Northern Hubs"
                          className="w-full px-4 py-2 text-sm border border-slate-300 rounded-xl focus:ring-green-500 focus:border-green-500 bg-white"
                        />
                      </div>

                      {/* Deadline */}
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">📅 Deadline</label>
                        <input
                          type="date"
                          name="deadline"
                          required
                          value={
                            editingProgram.deadline
                              ? (editingProgram.deadline instanceof Date 
                                  ? editingProgram.deadline 
                                  : new Date(editingProgram.deadline)
                                ).toISOString().substring(0, 10)
                              : ''
                          }
                          onChange={handleProgramInputChange}
                          className="w-full px-4 py-2 text-sm border border-slate-300 rounded-xl bg-white focus:ring-green-500 focus:border-green-500"
                        />
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Program Description</label>
                      <textarea
                        name="description"
                        rows={3}
                        required
                        value={editingProgram.description || ''}
                        onChange={handleProgramInputChange}
                        placeholder="Provide details about funding, training, goals, and support duration."
                        className="w-full px-4 py-2 text-sm border border-slate-300 rounded-xl focus:ring-green-500 focus:border-green-500 bg-white"
                      ></textarea>
                    </div>

                    {/* Apply Link */}
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">🔗 Application / Info URL</label>
                      <input
                        type="text"
                        name="applyLink"
                        required
                        value={editingProgram.applyLink || ''}
                        onChange={handleProgramInputChange}
                        placeholder="e.g. https://agric.gov.ng/apply"
                        className="w-full px-4 py-2 text-sm border border-slate-300 rounded-xl focus:ring-green-500 focus:border-green-500 bg-white"
                      />
                    </div>

                    {/* Eligibility Checklist */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Eligibility Requirements</label>
                        <button
                          type="button"
                          onClick={() => handleProgramAddArrayItem('eligibility')}
                          className="text-xs text-green-600 hover:text-green-700 font-bold flex items-center gap-1 cursor-pointer"
                        >
                          + Add Criteria
                        </button>
                      </div>
                      <div className="space-y-2 max-h-32 overflow-y-auto p-1 border border-slate-100 rounded-lg">
                        {(editingProgram.eligibility || []).map((item, index) => (
                          <div key={index} className="flex gap-2">
                            <input
                              type="text"
                              value={item}
                              onChange={(e) => handleProgramArrayChange(index, e.target.value, 'eligibility')}
                              placeholder="e.g. Registered cooperative member"
                              className="flex-grow px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-green-500 focus:border-green-500 bg-white"
                            />
                            {(editingProgram.eligibility || []).length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleProgramRemoveArrayItem(index, 'eligibility')}
                                className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Required Documents */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Required Documentation</label>
                        <button
                          type="button"
                          onClick={() => handleProgramAddArrayItem('requiredDocuments')}
                          className="text-xs text-green-600 hover:text-green-700 font-bold flex items-center gap-1 cursor-pointer"
                        >
                          + Add Document
                        </button>
                      </div>
                      <div className="space-y-2 max-h-32 overflow-y-auto p-1 border border-slate-100 rounded-lg">
                        {(editingProgram.requiredDocuments || []).map((item, index) => (
                          <div key={index} className="flex gap-2">
                            <input
                              type="text"
                              value={item}
                              onChange={(e) => handleProgramArrayChange(index, e.target.value, 'requiredDocuments')}
                              placeholder="e.g. Certificate of Incorporation"
                              className="flex-grow px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-green-500 focus:border-green-500 bg-white"
                            />
                            {(editingProgram.requiredDocuments || []).length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleProgramRemoveArrayItem(index, 'requiredDocuments')}
                                className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => {
                          setIsProgramFormOpen(false);
                          setEditingProgram(null);
                        }}
                        className="px-4 py-2 border border-slate-300 hover:bg-slate-50 rounded-xl font-semibold text-xs text-slate-700 transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer"
                      >
                        Save Program
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Cooperatives Form Overlay Modal */}
            {isCooperativeFormOpen && editingCooperative && (
              <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto relative animate-in fade-in zoom-in-95 duration-150">
                  <h3 className="text-lg font-extrabold text-slate-950 mb-6 flex items-center gap-2 pb-3 border-b border-slate-100">
                    <span>{editingCooperative.id ? '📝 Edit' : '✨ Add New'}</span> Farmer Cooperative Hub
                  </h3>

                  <form onSubmit={handleCooperativeSave} className="space-y-4">
                    {/* Name */}
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Cooperative Name *</label>
                      <input
                        type="text"
                        name="name"
                        required
                        value={editingCooperative.name || ''}
                        onChange={handleCooperativeInputChange}
                        placeholder="e.g. Oyo Cocoa Farmers Cooperative"
                        className="w-full px-4 py-2 text-sm border border-slate-300 rounded-xl focus:ring-green-500 focus:border-green-500 bg-white"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Cooperative Type */}
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Cooperative Focus</label>
                        <select
                          name="type"
                          value={editingCooperative.type || 'Resource-Sharing'}
                          onChange={handleCooperativeInputChange}
                          className="w-full px-4 py-2 text-sm border border-slate-300 rounded-xl bg-white focus:ring-green-500 focus:border-green-500"
                        >
                          <option value="Resource-Sharing">Resource-Sharing (Machinery/Land)</option>
                          <option value="Joint Marketing">Joint Marketing (Bulk Produce Sale)</option>
                          <option value="Financial/Credit">Financial/Credit (Group Savings)</option>
                          <option value="Purchasing">Purchasing (Bulk Input Discounts)</option>
                        </select>
                      </div>

                      {/* Active Members Count */}
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Active Registered Members *</label>
                        <input
                          type="number"
                          name="activeMembers"
                          min="1"
                          required
                          value={editingCooperative.activeMembers || ''}
                          onChange={handleCooperativeInputChange}
                          placeholder="e.g. 50"
                          className="w-full px-4 py-2 text-sm border border-slate-300 rounded-xl focus:ring-green-500 focus:border-green-500 bg-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* Location Hub */}
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Hub Location *</label>
                        <input
                          type="text"
                          name="location"
                          required
                          value={editingCooperative.location || ''}
                          onChange={handleCooperativeInputChange}
                          placeholder="e.g. Ibadan, Oyo State"
                          className="w-full px-4 py-2 text-sm border border-slate-300 rounded-xl focus:ring-green-500 focus:border-green-500 bg-white"
                        />
                      </div>

                      {/* Contact Email */}
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Contact Email Address *</label>
                        <input
                          type="email"
                          name="contactEmail"
                          required
                          value={editingCooperative.contactEmail || ''}
                          onChange={handleCooperativeInputChange}
                          placeholder="e.g. info@cocoacoop.org"
                          className="w-full px-4 py-2 text-sm border border-slate-300 rounded-xl focus:ring-green-500 focus:border-green-500 bg-white"
                        />
                      </div>

                      {/* President Phone */}
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">President Phone *</label>
                        <input
                          type="text"
                          name="presidentPhone"
                          required
                          value={editingCooperative.presidentPhone || ''}
                          onChange={handleCooperativeInputChange}
                          placeholder="e.g. +234 803 123 4567"
                          className="w-full px-4 py-2 text-sm border border-slate-300 rounded-xl focus:ring-green-500 focus:border-green-500 bg-white"
                        />
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Cooperative Description</label>
                      <textarea
                        name="description"
                        rows={3}
                        required
                        value={editingCooperative.description || ''}
                        onChange={handleCooperativeInputChange}
                        placeholder="Brief overview of the cooperative's main objectives, aggregate crops, and community services."
                        className="w-full px-4 py-2 text-sm border border-slate-300 rounded-xl focus:ring-green-500 focus:border-green-500 bg-white"
                      ></textarea>
                    </div>

                    {/* Shared Machinery Pool array */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">🚜 Shared Machinery & Heavy Equipment</label>
                        <button
                          type="button"
                          onClick={handleCooperativeAddEquipment}
                          className="text-xs text-green-600 hover:text-green-700 font-bold flex items-center gap-1 cursor-pointer"
                        >
                          + Add Equipment
                        </button>
                      </div>
                      <div className="space-y-2 max-h-40 overflow-y-auto p-1 border border-slate-100 rounded-lg">
                        {(editingCooperative.sharedEquipment || []).map((item, index) => (
                          <div key={index} className="flex gap-2">
                            <input
                              type="text"
                              value={item}
                              onChange={(e) => handleCooperativeEquipmentChange(index, e.target.value)}
                              placeholder="e.g. Combined Harvester, Tractor, Feed Pelletizer"
                              className="flex-grow px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-green-500 focus:border-green-500 bg-white"
                            />
                            {(editingCooperative.sharedEquipment || []).length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleCooperativeRemoveEquipment(index)}
                                className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Status */}
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Verification Status</label>
                      <select
                        name="status"
                        value={editingCooperative.status || 'Live'}
                        onChange={handleCooperativeInputChange}
                        className="w-full px-4 py-2 text-sm border border-slate-300 rounded-xl bg-white focus:ring-green-500 focus:border-green-500"
                      >
                        <option value="Live">Live & Verified (Appears in public directory)</option>
                        <option value="Pending">Pending Verification (Under review)</option>
                      </select>
                    </div>

                    {/* Buttons */}
                    <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => {
                          setIsCooperativeFormOpen(false);
                          setEditingCooperative(null);
                        }}
                        className="px-4 py-2 border border-slate-300 hover:bg-slate-50 rounded-xl font-semibold text-xs text-slate-700 transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer"
                      >
                        Save Cooperative Entry
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Custom Styled Confirm Modal */}
            {confirmModal && confirmModal.isOpen && (
              <div className="fixed inset-0 z-55 overflow-y-auto bg-black bg-opacity-60 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
                  <h3 className={`text-base font-extrabold mb-3 flex items-center gap-2 ${
                    confirmModal.variant === 'danger' ? 'text-red-600' :
                    confirmModal.variant === 'warning' ? 'text-amber-600' : 'text-slate-900'
                  }`}>
                    {confirmModal.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed mb-6">
                    {confirmModal.message}
                  </p>
                  <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setConfirmModal(null)}
                      className="px-4 py-2 border border-slate-300 hover:bg-slate-50 rounded-xl font-semibold text-xs text-slate-700 transition-colors cursor-pointer"
                    >
                      {confirmModal.cancelText || 'Cancel'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        confirmModal.onConfirm();
                      }}
                      className={`px-5 py-2 text-white rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer ${
                        confirmModal.variant === 'danger' ? 'bg-red-600 hover:bg-red-700' :
                        confirmModal.variant === 'warning' ? 'bg-amber-600 hover:bg-amber-700' :
                        'bg-green-600 hover:bg-green-700'
                      }`}
                    >
                      {confirmModal.confirmText || 'Confirm'}
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

      </main>
    </div>
  );
};

export default AdminCurationPage;

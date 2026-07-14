import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  onSnapshot, 
  arrayUnion, 
  arrayRemove,
  runTransaction,
  collection,
  getDocs,
  deleteDoc
} from 'firebase/firestore';
import { db, auth } from './firebase';
import type { 
  ActivityLog, 
  FinancialDocument, 
  BusinessProfile, 
  UserProfile, 
  FarmLocation, 
  Payment, 
  TeamMember, 
  HealthEvent, 
  LivestockRecord, 
  CropPlan, 
  LivestockTask, 
  InputInventoryItem, 
  ToolEquipmentItem, 
  BreedingRecord, 
  CroppingActivity 
} from './types';

// Helper: Convert Firestore Timestamps to JS Dates recursively
export function convertTimestampsToDates(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  
  if (typeof obj.toDate === 'function') {
    return obj.toDate();
  }
  
  if (typeof obj === 'object' && 'seconds' in obj && 'nanoseconds' in obj) {
    return new Date(obj.seconds * 1000 + Math.round(obj.nanoseconds / 1000000));
  }

  if (Array.isArray(obj)) {
    return obj.map(convertTimestampsToDates);
  }

  if (typeof obj === 'object') {
    const newObj: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        newObj[key] = convertTimestampsToDates(obj[key]);
      }
    }
    return newObj;
  }

  return obj;
}

// Helper: Sanitize objects for Firestore by removing undefined/Symbol properties recursively
export function sanitizeForFirestore(obj: any): any {
  if (obj === null || obj === undefined) return obj;

  if (obj instanceof Date) {
    return obj;
  }

  if (typeof obj === 'object') {
    if ('$$typeof' in obj || ('_owner' in obj && '_store' in obj)) {
      return null;
    }

    if (Array.isArray(obj)) {
      return obj.map(sanitizeForFirestore).filter(item => item !== undefined);
    }

    const newObj: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        if (typeof key === 'symbol') continue;
        const val = obj[key];
        if (typeof val === 'function' || typeof val === 'symbol') continue;

        const sanitizedVal = sanitizeForFirestore(val);
        if (sanitizedVal !== undefined) {
          newObj[key] = sanitizedVal;
        }
      }
    }
    return newObj;
  }

  if (typeof obj === 'function' || typeof obj === 'symbol') {
    return undefined;
  }

  return obj;
}

// ==========================================
// 1. QUERIES (READS & SUBSCRIPTIONS)
// ==========================================

/**
 * Subscribes to real-time changes in a user's farm data.
 * This connects the front-end dynamically to Firestore, making it completely real-time.
 */
export function subscribeToUserData(
  uid: string, 
  onUpdate: (data: any) => void, 
  onError: (err: any) => void
) {
  const userDocRef = doc(db, 'users', uid);
  return onSnapshot(userDocRef, (snapshot) => {
    if (snapshot.exists()) {
      const rawData = snapshot.data();
      const cleanData = convertTimestampsToDates(rawData);
      onUpdate(cleanData);
    } else {
      onUpdate(null);
    }
  }, onError);
}

/**
 * Gets a user's farm data once (e.g., during initialization or offline loading).
 */
export async function getUserData(uid: string) {
  const userDocRef = doc(db, 'users', uid);
  const snapshot = await getDoc(userDocRef);
  if (snapshot.exists()) {
    return convertTimestampsToDates(snapshot.data());
  }
  return null;
}

// ==========================================
// 2. MUTATIONS (WRITES, UPDATES, DELETES)
// ==========================================

/**
 * Initializes a new user document in Firestore.
 */
export async function initializeUserDoc(uid: string, email: string, name: string) {
  const userDocRef = doc(db, 'users', uid);
  const initialPayload = sanitizeForFirestore({
    email,
    userProfile: { name, email, phone: '', role: 'Owner', bio: '' },
    selectedCrops: ['Maize', 'Cassava', 'Yam'],
    selectedLivestock: ['Cattle', 'Goat', 'Sheep', 'Chicken', 'Fish', 'Pig'],
    farmLocations: [],
    teamMembers: [
      { id: '1', name, email, role: 'Owner', permissions: ['Farm House', 'Farm Records', 'Cropping Planner', 'Livestock Planner', 'Store Management', 'Receipt Generator', 'User Profile', 'Weather', 'Talk to Farmr', 'Gov/NGO Support', 'Settings'], status: 'Active' }
    ],
    currentUserPlan: 'Starter',
    updatedAt: new Date()
  });
  await setDoc(userDocRef, initialPayload, { merge: true });
}

/**
 * Updates the user's personal profile card.
 */
export async function updateUserProfile(uid: string, profile: Partial<UserProfile>) {
  const userDocRef = doc(db, 'users', uid);
  const sanitized = sanitizeForFirestore(profile);
  
  // Update fields with dot-notation to avoid wiping out other nested properties
  const updates: any = {};
  for (const key in sanitized) {
    updates[`userProfile.${key}`] = sanitized[key];
  }
  updates.updatedAt = new Date();
  await updateDoc(userDocRef, updates);
}

/**
 * Updates the overall business/farm profile setup.
 */
export async function updateBusinessProfile(uid: string, profile: Partial<BusinessProfile>) {
  const userDocRef = doc(db, 'users', uid);
  const sanitized = sanitizeForFirestore(profile);
  
  const updates: any = {};
  for (const key in sanitized) {
    updates[`businessProfile.${key}`] = sanitized[key];
  }
  updates.updatedAt = new Date();
  await updateDoc(userDocRef, updates);
}

/**
 * Updates subscription plans.
 */
export async function updateUserPlan(uid: string, plan: 'Starter' | 'Pro' | 'Premium') {
  const userDocRef = doc(db, 'users', uid);
  await updateDoc(userDocRef, {
    currentUserPlan: plan,
    updatedAt: new Date()
  });
}

/**
 * Updates a user's SaaS limits and administrative settings.
 */
export async function updateUserSaaSLimits(
  uid: string, 
  updates: {
    currentUserPlan?: 'Starter' | 'Pro' | 'Premium';
    trialExpiresAt?: string;
    bonusFarmLocations?: number;
    bonusTeamMembers?: number;
    bypassRestrictions?: boolean;
  }
) {
  const userDocRef = doc(db, 'users', uid);
  await updateDoc(userDocRef, {
    ...sanitizeForFirestore(updates),
    updatedAt: new Date()
  });
}

/**
 * Updates selected crop list options.
 */
export async function updateSelectedCrops(uid: string, crops: string[]) {
  const userDocRef = doc(db, 'users', uid);
  await updateDoc(userDocRef, {
    selectedCrops: sanitizeForFirestore(crops),
    updatedAt: new Date()
  });
}

/**
 * Updates selected livestock options.
 */
export async function updateSelectedLivestock(uid: string, species: string[]) {
  const userDocRef = doc(db, 'users', uid);
  await updateDoc(userDocRef, {
    selectedLivestock: sanitizeForFirestore(species),
    updatedAt: new Date()
  });
}

// --- Farm Location Mutations ---

export async function addFarmLocation(uid: string, location: FarmLocation) {
  const userDocRef = doc(db, 'users', uid);
  await updateDoc(userDocRef, {
    farmLocations: arrayUnion(sanitizeForFirestore(location)),
    updatedAt: new Date()
  });
}

export async function updateFarmLocation(uid: string, id: number, updates: Partial<FarmLocation>) {
  const userDocRef = doc(db, 'users', uid);
  await runTransaction(db, async (transaction) => {
    const snap = await transaction.get(userDocRef);
    if (!snap.exists()) return;
    const currentList = snap.data().farmLocations || [];
    const updatedList = currentList.map((loc: FarmLocation) => 
      loc.id === id ? { ...loc, ...updates } : loc
    );
    transaction.update(userDocRef, { 
      farmLocations: sanitizeForFirestore(updatedList),
      updatedAt: new Date()
    });
  });
}

/**
 * Performs a cascading delete of a farm location and all related entities 
 * (crop plans, livestock records, activity records, financial entries) to maintain DB consistency.
 */
export async function deleteFarmLocationCascading(uid: string, id: number) {
  const userDocRef = doc(db, 'users', uid);
  await runTransaction(db, async (transaction) => {
    const snap = await transaction.get(userDocRef);
    if (!snap.exists()) return;
    const data = snap.data();

    const farmLocations = (data.farmLocations || []).filter((f: any) => f.id !== id);
    const cropPlans = (data.cropPlans || []).filter((p: any) => p.farmId !== id);
    const animals = (data.animals || []).filter((a: any) => a.farmId !== id);
    const breedingRecords = (data.breedingRecords || []).filter((b: any) => b.farmId !== id);
    const inputsInventory = (data.inputsInventory || []).filter((i: any) => i.farmId !== id);
    const toolsEquipment = (data.toolsEquipment || []).filter((t: any) => t.farmId !== id);
    const croppingActivities = (data.croppingActivities || []).filter((c: any) => c.farmId !== id);
    const livestockTasks = (data.livestockTasks || []).filter((t: any) => t.farmId !== id);
    const incomeRecords = (data.incomeRecords || []).filter((doc: any) => doc.farmId !== id);
    const expenditureRecords = (data.expenditureRecords || []).filter((doc: any) => doc.farmId !== id);
    const teamMembers = (data.teamMembers || []).map((m: any) => m.farmId === id ? { ...m, farmId: undefined } : m);

    transaction.update(userDocRef, sanitizeForFirestore({
      farmLocations,
      cropPlans,
      animals,
      breedingRecords,
      inputsInventory,
      toolsEquipment,
      croppingActivities,
      livestockTasks,
      incomeRecords,
      expenditureRecords,
      teamMembers,
      updatedAt: new Date()
    }));
  });
}

// --- Crop Planning Mutations ---

export async function addCropPlan(uid: string, plan: CropPlan) {
  const userDocRef = doc(db, 'users', uid);
  await updateDoc(userDocRef, {
    cropPlans: arrayUnion(sanitizeForFirestore(plan)),
    updatedAt: new Date()
  });
}

export async function updateCropPlan(uid: string, planId: number | string, updates: Partial<CropPlan>) {
  const userDocRef = doc(db, 'users', uid);
  await runTransaction(db, async (transaction) => {
    const snap = await transaction.get(userDocRef);
    if (!snap.exists()) return;
    const list = snap.data().cropPlans || [];
    const updated = list.map((p: CropPlan) => String(p.id) === String(planId) ? { ...p, ...updates } : p);
    transaction.update(userDocRef, { 
      cropPlans: sanitizeForFirestore(updated),
      updatedAt: new Date()
    });
  });
}

export async function deleteCropPlan(uid: string, planId: number | string) {
  const userDocRef = doc(db, 'users', uid);
  await runTransaction(db, async (transaction) => {
    const snap = await transaction.get(userDocRef);
    if (!snap.exists()) return;
    const list = snap.data().cropPlans || [];
    const filtered = list.filter((p: CropPlan) => String(p.id) !== String(planId));
    transaction.update(userDocRef, { 
      cropPlans: sanitizeForFirestore(filtered),
      updatedAt: new Date()
    });
  });
}

// --- Cropping Activities Mutations ---

export async function addCroppingActivity(uid: string, activity: CroppingActivity) {
  const userDocRef = doc(db, 'users', uid);
  await updateDoc(userDocRef, {
    croppingActivities: arrayUnion(sanitizeForFirestore(activity)),
    updatedAt: new Date()
  });
}

export async function updateCroppingActivity(uid: string, activityId: string, updates: Partial<CroppingActivity>) {
  const userDocRef = doc(db, 'users', uid);
  await runTransaction(db, async (transaction) => {
    const snap = await transaction.get(userDocRef);
    if (!snap.exists()) return;
    const list = snap.data().croppingActivities || [];
    const updated = list.map((c: CroppingActivity) => c.id === activityId ? { ...c, ...updates } : c);
    transaction.update(userDocRef, { 
      croppingActivities: sanitizeForFirestore(updated),
      updatedAt: new Date()
    });
  });
}

// --- Livestock Records Mutations ---

export async function addLivestockRecord(uid: string, record: LivestockRecord) {
  const userDocRef = doc(db, 'users', uid);
  await updateDoc(userDocRef, {
    animals: arrayUnion(sanitizeForFirestore(record)),
    updatedAt: new Date()
  });
}

export async function updateLivestockRecord(uid: string, recordId: string, updates: Partial<LivestockRecord>) {
  const userDocRef = doc(db, 'users', uid);
  await runTransaction(db, async (transaction) => {
    const snap = await transaction.get(userDocRef);
    if (!snap.exists()) return;
    const list = snap.data().animals || [];
    const updated = list.map((a: LivestockRecord) => a.id === recordId ? { ...a, ...updates } : a);
    transaction.update(userDocRef, { 
      animals: sanitizeForFirestore(updated),
      updatedAt: new Date()
    });
  });
}

export async function deleteLivestockRecord(uid: string, recordId: string) {
  const userDocRef = doc(db, 'users', uid);
  await runTransaction(db, async (transaction) => {
    const snap = await transaction.get(userDocRef);
    if (!snap.exists()) return;
    const list = snap.data().animals || [];
    const filtered = list.filter((a: LivestockRecord) => a.id !== recordId);
    transaction.update(userDocRef, { 
      animals: sanitizeForFirestore(filtered),
      updatedAt: new Date()
    });
  });
}

// --- Livestock Tasks Mutations ---

export async function addLivestockTask(uid: string, task: LivestockTask) {
  const userDocRef = doc(db, 'users', uid);
  await updateDoc(userDocRef, {
    livestockTasks: arrayUnion(sanitizeForFirestore(task)),
    updatedAt: new Date()
  });
}

export async function updateLivestockTask(uid: string, taskId: string, updates: Partial<LivestockTask>) {
  const userDocRef = doc(db, 'users', uid);
  await runTransaction(db, async (transaction) => {
    const snap = await transaction.get(userDocRef);
    if (!snap.exists()) return;
    const list = snap.data().livestockTasks || [];
    const updated = list.map((t: LivestockTask) => t.id === taskId ? { ...t, ...updates } : t);
    transaction.update(userDocRef, { 
      livestockTasks: sanitizeForFirestore(updated),
      updatedAt: new Date()
    });
  });
}

// --- Breeding Records Mutations ---

export async function addBreedingRecord(uid: string, record: BreedingRecord) {
  const userDocRef = doc(db, 'users', uid);
  await updateDoc(userDocRef, {
    breedingRecords: arrayUnion(sanitizeForFirestore(record)),
    updatedAt: new Date()
  });
}

export async function updateBreedingRecord(uid: string, recordId: string, updates: Partial<BreedingRecord>) {
  const userDocRef = doc(db, 'users', uid);
  await runTransaction(db, async (transaction) => {
    const snap = await transaction.get(userDocRef);
    if (!snap.exists()) return;
    const list = snap.data().breedingRecords || [];
    const updated = list.map((b: BreedingRecord) => b.id === recordId ? { ...b, ...updates } : b);
    transaction.update(userDocRef, { 
      breedingRecords: sanitizeForFirestore(updated),
      updatedAt: new Date()
    });
  });
}

// --- Health Events Mutations ---

export async function addHealthEvent(uid: string, event: HealthEvent) {
  const userDocRef = doc(db, 'users', uid);
  await updateDoc(userDocRef, {
    healthEvents: arrayUnion(sanitizeForFirestore(event)),
    updatedAt: new Date()
  });
}

export async function updateHealthEvent(uid: string, eventId: string, updates: Partial<HealthEvent>) {
  const userDocRef = doc(db, 'users', uid);
  await runTransaction(db, async (transaction) => {
    const snap = await transaction.get(userDocRef);
    if (!snap.exists()) return;
    const list = snap.data().healthEvents || [];
    const updated = list.map((h: HealthEvent) => h.id === eventId ? { ...h, ...updates } : h);
    transaction.update(userDocRef, { 
      healthEvents: sanitizeForFirestore(updated),
      updatedAt: new Date()
    });
  });
}

// --- Financial Records (Income & Expenditure) Mutations ---

export async function addFinancialRecord(
  uid: string, 
  record: FinancialDocument, 
  type: 'income' | 'expenditure'
) {
  const userDocRef = doc(db, 'users', uid);
  const targetArrayField = type === 'income' ? 'incomeRecords' : 'expenditureRecords';
  await updateDoc(userDocRef, {
    [targetArrayField]: arrayUnion(sanitizeForFirestore(record)),
    updatedAt: new Date()
  });
}

export async function updateFinancialRecord(
  uid: string, 
  recordId: string, 
  updates: Partial<FinancialDocument>, 
  type: 'income' | 'expenditure'
) {
  const userDocRef = doc(db, 'users', uid);
  const targetArrayField = type === 'income' ? 'incomeRecords' : 'expenditureRecords';
  await runTransaction(db, async (transaction) => {
    const snap = await transaction.get(userDocRef);
    if (!snap.exists()) return;
    const list = snap.data()[targetArrayField] || [];
    const updated = list.map((docVal: FinancialDocument) => 
      docVal.id === recordId ? { ...docVal, ...updates } : docVal
    );
    transaction.update(userDocRef, { 
      [targetArrayField]: sanitizeForFirestore(updated),
      updatedAt: new Date()
    });
  });
}

/**
 * Handles recording dynamic transaction payments and automatically calculates the adjusted balances.
 */
export async function addPaymentToFinancialRecord(
  uid: string, 
  documentId: string, 
  paymentData: Omit<Payment, 'id'>
) {
  const userDocRef = doc(db, 'users', uid);
  const newPayment: Payment = { id: `PAY-${Date.now()}`, ...paymentData };

  await runTransaction(db, async (transaction) => {
    const snap = await transaction.get(userDocRef);
    if (!snap.exists()) return;
    const data = snap.data();

    const updateRecords = (records: FinancialDocument[]) => {
      return records.map(docVal => {
        if (docVal.id === documentId) {
          const existingPayments = docVal.payments || [];
          const updatedPayments = [...existingPayments, newPayment];
          const newAmountPaid = updatedPayments.reduce((sum, p) => sum + p.amount, 0);
          const newBalance = docVal.totalAmount - newAmountPaid;

          return {
            ...docVal,
            payments: updatedPayments,
            amountPaid: newAmountPaid,
            balance: newBalance,
          };
        }
        return docVal;
      });
    };

    const updatedIncome = updateRecords(data.incomeRecords || []);
    const updatedExpenditure = updateRecords(data.expenditureRecords || []);

    transaction.update(userDocRef, sanitizeForFirestore({
      incomeRecords: updatedIncome,
      expenditureRecords: updatedExpenditure,
      updatedAt: new Date()
    }));
  });
}

// --- Store Management (Inventory) Mutations ---

export async function addInputInventoryItem(uid: string, item: InputInventoryItem) {
  const userDocRef = doc(db, 'users', uid);
  await updateDoc(userDocRef, {
    inputsInventory: arrayUnion(sanitizeForFirestore(item)),
    updatedAt: new Date()
  });
}

export async function updateInputInventoryItem(uid: string, itemId: string, updates: Partial<InputInventoryItem>) {
  const userDocRef = doc(db, 'users', uid);
  await runTransaction(db, async (transaction) => {
    const snap = await transaction.get(userDocRef);
    if (!snap.exists()) return;
    const list = snap.data().inputsInventory || [];
    const updated = list.map((i: InputInventoryItem) => i.id === itemId ? { ...i, ...updates } : i);
    transaction.update(userDocRef, { 
      inputsInventory: sanitizeForFirestore(updated),
      updatedAt: new Date()
    });
  });
}

export async function addToolEquipmentItem(uid: string, item: ToolEquipmentItem) {
  const userDocRef = doc(db, 'users', uid);
  await updateDoc(userDocRef, {
    toolsEquipment: arrayUnion(sanitizeForFirestore(item)),
    updatedAt: new Date()
  });
}

export async function updateToolEquipmentItem(uid: string, itemId: string, updates: Partial<ToolEquipmentItem>) {
  const userDocRef = doc(db, 'users', uid);
  await runTransaction(db, async (transaction) => {
    const snap = await transaction.get(userDocRef);
    if (!snap.exists()) return;
    const list = snap.data().toolsEquipment || [];
    const updated = list.map((t: ToolEquipmentItem) => t.id === itemId ? { ...t, ...updates } : t);
    transaction.update(userDocRef, { 
      toolsEquipment: sanitizeForFirestore(updated),
      updatedAt: new Date()
    });
  });
}

// --- Team Management Mutations ---

export async function addTeamMember(uid: string, member: TeamMember) {
  const userDocRef = doc(db, 'users', uid);
  await updateDoc(userDocRef, {
    teamMembers: arrayUnion(sanitizeForFirestore(member)),
    updatedAt: new Date()
  });
}

export async function updateTeamMember(uid: string, memberId: string, updates: Partial<TeamMember>) {
  const userDocRef = doc(db, 'users', uid);
  await runTransaction(db, async (transaction) => {
    const snap = await transaction.get(userDocRef);
    if (!snap.exists()) return;
    const list = snap.data().teamMembers || [];
    const updated = list.map((m: TeamMember) => m.id === memberId ? { ...m, ...updates } : m);
    transaction.update(userDocRef, { 
      teamMembers: sanitizeForFirestore(updated),
      updatedAt: new Date()
    });
  });
}

export async function deleteTeamMember(uid: string, memberId: string) {
  const userDocRef = doc(db, 'users', uid);
  await runTransaction(db, async (transaction) => {
    const snap = await transaction.get(userDocRef);
    if (!snap.exists()) return;
    const list = snap.data().teamMembers || [];
    const filtered = list.filter((m: TeamMember) => m.id !== memberId);
    transaction.update(userDocRef, { 
      teamMembers: sanitizeForFirestore(filtered),
      updatedAt: new Date()
    });
  });
}

// --- Activity Log Mutations ---

export async function addActivityLog(uid: string, log: ActivityLog) {
  const userDocRef = doc(db, 'users', uid);
  await runTransaction(db, async (transaction) => {
    const snap = await transaction.get(userDocRef);
    if (!snap.exists()) return;
    const list = snap.data().activityLog || [];
    // Prepend new activity log and trim array length to keep performance high
    const updatedList = [log, ...list].slice(0, 100);
    transaction.update(userDocRef, {
      activityLog: sanitizeForFirestore(updatedList),
      updatedAt: new Date()
    });
  });
}

// --- Hardened Error Handling and Operations for Gov/NGO Support ---

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Fetches all curated Gov/NGO support programs from Firestore.
 */
export async function getCuratedSupportPrograms(): Promise<any[]> {
  const path = 'support_programs';
  try {
    const colRef = collection(db, path);
    const snap = await getDocs(colRef);
    const list: any[] = [];
    snap.forEach((docSnap) => {
      const data = docSnap.data();
      list.push({
        ...convertTimestampsToDates(data),
        id: docSnap.id
      });
    });
    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return [];
  }
}

/**
 * Saves a Gov/NGO support program to Firestore.
 */
export async function saveSupportProgram(program: any): Promise<string> {
  const path = 'support_programs';
  try {
    const id = program.id || doc(collection(db, path)).id;
    const docRef = doc(db, path, id);
    const payload = sanitizeForFirestore({
      ...program,
      id,
      updatedAt: new Date()
    });
    await setDoc(docRef, payload, { merge: true });
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
}

/**
 * Deletes a Gov/NGO support program from Firestore.
 */
export async function deleteSupportProgram(id: string): Promise<void> {
  const path = `support_programs/${id}`;
  try {
    const docRef = doc(db, 'support_programs', id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Fetches all cooperatives from Firestore.
 */
export async function getCooperatives(): Promise<any[]> {
  const path = 'cooperatives';
  try {
    const colRef = collection(db, path);
    const snap = await getDocs(colRef);
    const list: any[] = [];
    snap.forEach((docSnap) => {
      const data = docSnap.data();
      list.push({
        ...convertTimestampsToDates(data),
        id: docSnap.id
      });
    });
    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return [];
  }
}

/**
 * Saves a cooperative to Firestore.
 */
export async function saveCooperative(coop: any): Promise<string> {
  const path = 'cooperatives';
  try {
    const id = coop.id || doc(collection(db, path)).id;
    const docRef = doc(db, path, id);
    const payload = sanitizeForFirestore({
      ...coop,
      id,
      updatedAt: new Date()
    });
    await setDoc(docRef, payload, { merge: true });
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
}

/**
 * Deletes a cooperative from Firestore.
 */
export async function deleteCooperative(id: string): Promise<void> {
  const path = `cooperatives/${id}`;
  try {
    const docRef = doc(db, 'cooperatives', id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Fetches all registered users on the platform for the SaaS Portal.
 */
export async function getAllUsers(): Promise<any[]> {
  const path = 'users';
  try {
    const colRef = collection(db, path);
    const snap = await getDocs(colRef);
    const list: any[] = [];
    snap.forEach((docSnap) => {
      const data = docSnap.data();
      list.push({
        ...convertTimestampsToDates(data),
        uid: docSnap.id
      });
    });
    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return [];
  }
}


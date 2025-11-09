import type React from 'react';

export interface NavItem {
  name: string;
  icon: React.ReactNode;
}

export interface ToolItem {
  name: string;
  icon: React.ReactNode;
  color: string;
}

export interface CropTask {
  id: number;
  name: string;
  completed: boolean;
  stageIndex: number;
}

export interface CropPlan {
  id: number;
  cropName: string;
  variety: string;
  field: string;
  plantingDate: Date;
  harvestDate: Date;
  color: string;
  tasks: CropTask[];
  currentStage: number; // index of the stage
  farmId: number;
  // New fields for land and yield
  landSize: number;
  landSizeUnit: 'Hectares';
  avgYield: number; // in avgYieldUnit per Hextrare
  avgYieldUnit: 'Tonnes';
  expectedYield: number; // total yield in avgYieldUnit
}

// --- Livestock Planner Types ---

export type HealthStatus = 'Healthy' | 'Sick' | 'Quarantined' | 'Vaccinated' | 'Dead';
export type LivestockTrackingType = 'INDIVIDUAL' | 'BATCH';

export interface BaseLivestock {
    id: string; // This will be the user-provided Tag Number for INDIVIDUAL type
    species: string; // From SUPPORTED_LIVESTOCK
    location: string; // Pen/Pasture/Pond
    farmId: number; // ID from FarmLocation
    trackingType: LivestockTrackingType;
    variety?: string; // e.g., Angus, Holstein, Duroc
    source?: string; // e.g., Local Market, Self-bred
    weightHistory?: { date: Date; weight: number }[];
}

export interface IndividualAnimal extends BaseLivestock {
    trackingType: 'INDIVIDUAL';
    healthStatus: HealthStatus;
    name?: string; // Optional familiar name (formerly 'tag')
    age: number; // months
    weight: number; // kg
    sex?: 'Male' | 'Female';
    sireId?: string;
    damId?: string;
    dateOfDeath?: Date;
}

export interface BatchAnimal extends BaseLivestock {
    trackingType: 'BATCH';
    batchName: string;
    quantity: number;
    acquisitionDate: Date;
    averageAge?: number; // months
    averageWeight?: number; // kg;
    statusCounts: Partial<Record<HealthStatus, number>>;
}

export type LivestockRecord = IndividualAnimal | BatchAnimal;

export interface AffectedAnimal {
  animalId: string;
  affectedCount?: number; // Optional, but used for BATCH type
  weight?: number; // For 'Weighing' events
}

export interface HealthEvent {
  id: string;
  type: 'Vaccination' | 'Deworming' | 'Treatment' | 'Check-up' | 'Weighing' | 'Dead';
  date: Date;
  description: string;
  animals: AffectedAnimal[];
  newStatus?: HealthStatus;
}

export interface BreedingRecord {
  id: string;
  sireId: string;
  damId: string;
  pairingDate: Date;
  expectedDueDate: Date;
  actualBirthDate?: Date;
  status: 'Active' | 'Completed';
  offspringIds?: string[];
  farmId: number;
}

export type TaskStatus = 'To Do' | 'In Progress' | 'Done';

export interface CroppingActivity {
  id: string;
  title: string;
  dueDate: Date;
  status: TaskStatus;
  farmId?: number;
  assignee?: string;
  archived?: boolean;
}

export interface LivestockTask {
  id: string;
  title: string;
  dueDate: Date;
  status: TaskStatus;
  farmId?: number; // Optional farm location ID
  assignee?: string;
  archived?: boolean;
}

export interface FeedInventory {
    id: string;
    name: string;
    quantity: number; // percentage
    color: string;
}

// --- Store Management & Receipt Generator Types ---
export type InputCategory = 'Seeds' | 'Fertilizers' | 'Pesticides' | 'Feed' | 'Other';

export interface InputInventoryItem {
  id: string;
  name: string;
  category: InputCategory;
  quantity: number;
  unit: string;
  supplier: string;
  purchaseDate: Date;
  expiryDate?: Date;
  lowStockThreshold: number;
  farmId: number;
}

export type EquipmentStatus = 'Operational' | 'In Repair' | 'Decommissioned';

export interface ToolEquipmentItem {
  id: string;
  name:string;
  type: 'Tool' | 'Equipment';
  purchaseDate: Date;
  purchaseValue: number;
  currentValue: number;
  status: EquipmentStatus;
  assignedTo?: string;
  lastMaintenance?: Date;
  usefulLifeInYears: number;
  salvageValue: number;
  farmId: number;
}

export interface ProduceInventoryItem {
  id: string;
  produceName: string;
  quantity: number;
  unit: string;
  harvestDate: Date;
  storageLocation: string;
  farmId: number;
}

export type StockOutReason = 'Sales' | 'Expired' | 'Damaged' | 'Internal Use';
export type Department = 'Livestock Dept.' | 'Crop Dept.' | 'Processing';

export interface DistributionRecord {
  id: string;
  produceId: string;
  produceName: string;
  quantity: number;
  unit: string;
  date: Date;
  reason: StockOutReason;
  department?: Department;
  responsiblePerson?: string;
  transactionType?: string;
  transactionNumber?: string;
}

export interface FinancialDocumentItem {
    name: string;
    unit: string;
    unitPrice: number;
    quantity: number;
    price: number;
}

export interface Payment {
  id: string;
  date: Date;
  amount: number;
  method: string;
}

export interface FinancialDocument {
    id: string; // Document Number
    documentType: 'Receipt' | 'Invoice';
    category: string;
    customerName: string;
    customerPhone: string;
    paymentMethod: string;
    date: Date;
    items: FinancialDocumentItem[];
    subtotal: number;
    discountPercent: number;
    discountAmount: number;
    taxPercent: number;
    taxAmount: number;
    totalAmount: number;
    amountPaid: number;
    balance: number;
    payments?: Payment[];
    farmId?: number;
}

export interface RejectedFinancialDocument extends FinancialDocument {
    reasonForRejection: string;
}

export interface StockOutRecord {
    id: string;
    inputId: string;
    inputName: string;
    quantityRemoved: number;
    reason: StockOutReason;
    transactionType?: string; // e.g., Cash, Transfer
    transactionNumber?: string;
    date: Date;
    department?: Department;
    responsiblePerson?: string;
}

// --- Weather Page Types ---
interface WeatherInfo {
    id: number;
    main: string;
    description: string;
    icon: string;
}

export interface CurrentWeatherData {
    dt: number;
    sunrise: number;
    sunset: number;
    temp: number;
    feels_like: number;
    humidity: number;
    uvi: number;
    clouds: number;
    wind_speed: number;
    wind_deg: number;
    weather: WeatherInfo[];
    rain?: { '1h': number };
}

export interface HourlyForecastData {
    dt: number;
    temp: number;
    weather: WeatherInfo[];
    pop: number; // Probability of precipitation
}

export interface DailyForecastData {
    dt: number;
    sunrise: number;
    sunset: number;
    temp: {
        day: number;
        min: number;
        max: number;
    };
    weather: WeatherInfo[];
    pop: number;
    rain?: number;
}

export interface WeatherAlert {
    sender_name: string;
    event: string;
    start: number;
    end: number;
    description: string;
}

// Mocked agricultural data
export interface AgriculturalData {
    soil_temp: number; // degrees C
    soil_moisture: number; // percentage
    gdd: number; // Growing Degree Days
    et: number; // Evapotranspiration (mm)
}

export interface AllWeatherData {
    current: CurrentWeatherData;
    hourly: HourlyForecastData[];
    daily: DailyForecastData[];
    alerts?: WeatherAlert[];
    agricultural: AgriculturalData;
}


// --- Settings Page and Shared Types ---
export interface BusinessProfile {
    name: string;
    email: string;
    phone: string;
    address: string;
    logo: string; // Will store as data URL
}

export interface UserProfile {
    name: string;
    role: string;
    email: string;
    phone: string;
    avatar: string; // URL or data URL
    bio: string;
}

export type TeamMemberRole = 'Farm Manager' | 'Accountant' | 'Store Manager' | 'Field Officer' | 'Agronomist' | 'Veterinary Officer' | 'Livestock Officer';

export interface TeamMember {
    id: string;
    email: string;
    role: TeamMemberRole;
    permissions: string[];
    avatar: string;
    status: 'Active' | 'Pending Invitation';
    farmId?: number;
}

export interface ActivityLog {
    id: string;
    userId: string;
    icon: React.ReactElement<{ className?: string }>;
    text: string;
    date: Date;
}

export interface FarmLocation {
  id: number;
  name: string;
  lat: string;
  lon: string;
  size: string;
  unit: string;
}

export interface CustomerLoyaltyData {
    customerName: string;
    totalVolume: number;
    transactionCount: number;
}

export interface AnalysisData {
    name: string;
    totalVolume: number;
    transactionCount: number;
}

// --- Gov/NGO Support Page Types ---
export type SupportProgramProvider = 'Government' | 'NGO';
export type SupportProgramCategory = 'Grant' | 'Training' | 'Subsidy' | 'Loan';
export type SupportProgramStatus = 'Open' | 'Closed';

export interface SupportProgram {
  id: string;
  title: string;
  provider: SupportProgramProvider;
  category: SupportProgramCategory;
  description: string;
  status: SupportProgramStatus;
  deadline: Date;
  eligibility: string[];
  requiredDocuments: string[];
  applyLink: string;
}
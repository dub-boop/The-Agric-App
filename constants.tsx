
import React from 'react';
import type { NavItem, ToolItem, CropPlan, CropTask, LivestockRecord, HealthEvent, BreedingRecord, LivestockTask, FeedInventory, LivestockTrackingType, AffectedAnimal, IndividualAnimal, InputInventoryItem, ToolEquipmentItem, ProduceInventoryItem, DistributionRecord, FinancialDocument, StockOutReason, RejectedFinancialDocument, BusinessProfile, UserProfile, ActivityLog, InputCategory, EquipmentStatus, SupportProgram, Payment, TeamMember, TeamMemberRole, Department } from './types';

// Generic Icon Wrapper for Material Icons
const Icon = ({ iconName, className }: { iconName: string; className?: string; }) => (
    <span className={`material-icons-outlined ${className}`}>
        {iconName}
    </span>
);

// New Avatar Generator Function
export const generateAvatar = (name: string, background = '#0D8ABC', color = '#fff'): string => {
    if (!name) name = '??';
    const initials = name
        .split(' ')
        .map(n => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
    
    const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="150" height="150" viewBox="0 0 150 150">
            <rect width="100%" height="100%" fill="${background}" />
            <text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="60" fill="${color}" font-weight="bold">
                ${initials}
            </text>
        </svg>
    `.trim();

    return `data:image/svg+xml;base64,${btoa(svg)}`;
};


// Sidebar Icons
const HomeIcon = () => <Icon iconName="home" className="h-6 w-6" />;
export const UserIcon = ({ className = "h-6 w-6" }: { className?: string }) => <Icon iconName="person_outline" className={className} />;
export const WeatherNavIcon = () => <Icon iconName="wb_sunny" className="h-6 w-6" />;
const CooperativesIcon = () => <Icon iconName="groups" className="h-6 w-6" />;
export const SettingsIcon = () => <Icon iconName="settings" className="h-6 w-6" />;


// Icons for responsive menu
export const MenuIcon = () => <Icon iconName="menu" className="h-6 w-6" />;
export const CloseIcon = ({ className = "h-6 w-6" }: { className?: string }) => <Icon iconName="close" className={className} />;


// Weather Icons
export const SunIcon = ({className = "h-10 w-10 text-yellow-400"}: {className?: string}) => <Icon iconName="light_mode" className={className} />;
export const CloudIcon = ({className = "h-10 w-10 text-gray-400"}: {className?: string}) => <Icon iconName="cloud" className={className} />;
export const RainIcon = ({className = "h-10 w-10 text-blue-500"}: {className?: string}) => <Icon iconName="rainy" className={className} />;
export const PartlyCloudyIcon = ({className = "h-10 w-10"}: {className?: string}) => <Icon iconName="partly_cloudy_day" className={className} />;
export const StormIcon = ({className = "h-10 w-10 text-gray-600"}: {className?: string}) => <Icon iconName="thunderstorm" className={className} />;
export const ThermometerIcon = ({className = "h-5 w-5"}: {className?: string}) => <Icon iconName="thermostat" className={className} />;
export const WindIcon = ({className = "h-5 w-5"}: {className?: string}) => <Icon iconName="air" className={className} />;
export const HumidityIcon = ({className = "h-5 w-5"}: {className?: string}) => <Icon iconName="water_drop" className={className} />;
export const SunriseIcon = ({className = "h-5 w-5"}: {className?: string}) => <Icon iconName="wb_twilight" className={className} />;
export const SunsetIcon = ({className = "h-5 w-5"}: {className?: string}) => <Icon iconName="wb_twilight" className={className} />;
export const UvIndexIcon = ({className = "h-5 w-5"}: {className?: string}) => <Icon iconName="wb_sunny" className={className} />;
export const SoilMoistureIcon = ({className = "h-5 w-5"}: {className?: string}) => <Icon iconName="water_drop" className={className} />;
export const GddIcon = ({className = "h-5 w-5"}: {className?: string}) => <Icon iconName="schedule" className={className} />;
export const EvapotranspirationIcon = ({className = "h-5 w-5"}: {className?: string}) => <Icon iconName="air" className={className} />;

// Generic Arrow Icon
export const ArrowRightIcon = () => <Icon iconName="arrow_forward" className="h-4 w-4 inline-block ml-2" />;
export const ArrowLeftIcon = ({ className = 'h-5 w-5' }: { className?: string }) => <Icon iconName="arrow_back" className={className} />;
export const ArrowUpIcon = ({ className }: { className?: string }) => <Icon iconName="arrow_upward" className={className} />;
export const ArrowDownIcon = ({ className }: { className?: string }) => <Icon iconName="arrow_downward" className={className} />;

// Generic Action Icon
export const TrashIcon = ({ className = "h-5 w-5" }: { className?: string }) => <Icon iconName="delete_outline" className={className} />;
export const PlusIcon = ({ className = "h-5 w-5" }: { className?: string }) => <Icon iconName="add" className={className} />;
export const EditIcon = ({ className = "h-5 w-5" }: { className?: string }) => <Icon iconName="edit" className={className} />;
export const ViewIcon = ({ className = "h-5 w-5" }: { className?: string }) => <Icon iconName="visibility" className={className} />;
export const PrinterIcon = ({ className = "h-5 w-5" }: { className?: string }) => <Icon iconName="print" className={className} />;
export const ArchiveIcon = ({ className = "h-5 w-5" }: { className?: string }) => <Icon iconName="archive" className={className} />;
export const HistoryIcon = ({ className = "h-5 w-5" }: { className?: string }) => <Icon iconName="history" className={className} />;
export const StockOutIcon = ({ className = "h-5 w-5" }: { className?: string }) => <Icon iconName="remove_circle_outline" className={className} />;
export const DownloadIcon = ({ className = "h-5 w-5" }: { className?: string }) => <Icon iconName="download" className={className} />;
export const CalendarIcon = ({ className = "h-4 w-4" }: { className?: string }) => <Icon iconName="calendar_today" className={className} />;
export const ChevronDownIcon = ({ className = "h-6 w-6" }: { className?: string }) => <Icon iconName="expand_more" className={className} />;
export const CheckIcon = ({ className = "h-6 w-6" }: { className?: string }) => <Icon iconName="check" className={className} />;
export const MailIcon = ({ className = 'h-5 w-5' }: { className?: string }) => <Icon iconName="mail_outline" className={className} />;
export const ShareIcon = ({ className = "h-5 w-5" }: { className?: string }) => <Icon iconName="share" className={className} />;
export const PhoneIcon = ({ className = 'h-5 w-5' }: { className?: string }) => <Icon iconName="phone" className={className} />;
export const LocationMarkerIcon = ({ className = 'h-5 w-5' }: { className?: string }) => <Icon iconName="location_on" className={className} />;


// View Toggle Icons
export const ChartPieIcon = () => <Icon iconName="pie_chart_outline" className="h-5 w-5" />;
export const TimelineIcon = () => <Icon iconName="timeline" className="h-5 w-5" />;
export const ListIcon = () => <Icon iconName="list" className="h-5 w-5" />;

// Farm Records Page Icons
export const IncomeIcon = (props: { className?: string }) => <Icon iconName="trending_up" className={props.className} />;
export const ExpenditureIcon = (props: { className?: string }) => <Icon iconName="trending_down" className={props.className} />;
export const ProfitLossIcon = (props: { className?: string }) => <Icon iconName="assessment" className={props.className} />;
export const TrophyIcon = (props: { className?: string }) => <Icon iconName="emoji_events" className={props.className} />;


// Livestock Planner Icons
export const BullIcon = (props: { className?: string }) => <Icon iconName="pets" {...props} />;
export const StethoscopeIcon = (props: { className?: string }) => <Icon iconName="medical_services" {...props} />;
export const HeartIcon = (props: { className?: string }) => <Icon iconName="favorite_border" {...props} />;
export const ClipboardIcon = (props: { className?: string }) => <Icon iconName="assignment" {...props} />;
export const WarningIcon = (props: { className?: string }) => <Icon iconName="warning_amber" {...props} />;


// Tool Icons
export const LivestockPlannerIcon = (props: { className?: string }) => <Icon iconName="pets" className={props.className || "h-8 w-8"} />;
export const CroppingPlannerIcon = (props: { className?: string }) => <Icon iconName="eco" className={props.className || "h-8 w-8"} />;
export const FarmRecordsIcon = (props: { className?: string }) => <Icon iconName="description" className={props.className || "h-8 w-8"} />;
export const ReceiptGeneratorIcon = (props: { className?: string }) => <Icon iconName="receipt_long" className={props.className || "h-8 w-8"} />;
export const TalkToFarmrIcon = (props: { className?: string }) => <Icon iconName="chat" className={props.className || "h-8 w-8"} />;
const SatelliteDataIcon = () => <Icon iconName="satellite_alt" className="h-8 w-8" />;
export const GovNgoSupportIcon = ({ className = "h-8 w-8" }: { className?: string }) => <Icon iconName="account_balance" className={className} />;
export const StoreManagementIcon = ({ className = "h-8 w-8" }: { className?: string }) => <Icon iconName="storefront" className={className} />;


export const NAV_ITEMS: NavItem[] = [
  { name: 'Farm House', icon: <HomeIcon /> },
  { name: 'User Profile', icon: <UserIcon /> },
  { name: 'Weather', icon: <WeatherNavIcon /> },
  { name: 'Cooperatives', icon: <CooperativesIcon /> },
  { name: 'Settings', icon: <SettingsIcon /> },
];

export const TOOL_ITEMS: ToolItem[] = [
  { name: 'Livestock Planner', icon: <LivestockPlannerIcon />, color: 'bg-gradient-to-br from-green-500 to-green-700' },
  { name: 'Cropping Planner', icon: <CroppingPlannerIcon />, color: 'bg-gradient-to-br from-blue-500 to-blue-700' },
  { name: 'Farm Records', icon: <FarmRecordsIcon />, color: 'bg-gradient-to-br from-purple-500 to-purple-700' },
  { name: 'Store Management', icon: <StoreManagementIcon />, color: 'bg-gradient-to-br from-orange-500 to-orange-700' },
  { name: 'Receipt Generator', icon: <ReceiptGeneratorIcon />, color: 'bg-gradient-to-br from-red-500 to-red-700' },
  { name: 'Talk to Farmr', icon: <TalkToFarmrIcon />, color: 'bg-gradient-to-br from-sky-500 to-sky-700' },
  { name: 'Gov/NGO Support', icon: <GovNgoSupportIcon />, color: 'bg-gradient-to-br from-amber-500 to-amber-700' },
  { name: 'Satellite Data', icon: <SatelliteDataIcon />, color: 'bg-gradient-to-br from-slate-500 to-slate-700' },
];

export const CROP_TASK_TEMPLATES: Record<string, CropTask[]> = {
    'Maize': [
        { id: 1, name: 'Land Preparation', completed: false, stageIndex: 0 },
        { id: 2, name: 'Planting', completed: false, stageIndex: 1 },
        { id: 3, name: 'First Fertilizer Application', completed: false, stageIndex: 2 },
        { id: 4, name: 'Weed Control', completed: false, stageIndex: 2 },
        { id: 5, name: 'Pest/Disease Scouting', completed: false, stageIndex: 3 },
        { id: 6, name: 'Second Fertilizer Application', completed: false, stageIndex: 3 },
        { id: 7, name: 'Harvesting', completed: false, stageIndex: 4 },
    ],
    'Cassava': [
        { id: 1, name: 'Land Preparation & Ridging', completed: false, stageIndex: 0 },
        { id: 2, name: 'Planting Cuttings', completed: false, stageIndex: 1 },
        { id: 3, name: 'First Weeding', completed: false, stageIndex: 2 },
        { id: 4, name: 'Second Weeding & Earthing Up', completed: false, stageIndex: 3 },
        { id: 5, name: 'Harvesting', completed: false, stageIndex: 4 },
    ],
    'Yam': [
        { id: 1, name: 'Land Preparation (Mounds/Ridges)', completed: false, stageIndex: 0 },
        { id: 2, name: 'Planting Setts', completed: false, stageIndex: 1 },
        { id: 3, name: 'Mulching', completed: false, stageIndex: 1 },
        { id: 4, name: 'Staking', completed: false, stageIndex: 2 },
        { id: 5, name: 'Weed Control', completed: false, stageIndex: 2 },
        { id: 6, name: 'Fertilizer Application', completed: false, stageIndex: 3 },
        { id: 7, name: 'Vine Training', completed: false, stageIndex: 3 },
        { id: 8, name: 'Harvesting', completed: false, stageIndex: 4 },
    ],
    'Rice': [
        { id: 1, name: 'Nursery Bed Preparation', completed: false, stageIndex: 0 },
        { id: 2, name: 'Sow Seeds in Nursery', completed: false, stageIndex: 0 },
        { id: 3, name: 'Main Field Preparation (Puddling)', completed: false, stageIndex: 0 },
        { id: 4, name: 'Transplanting Seedlings', completed: false, stageIndex: 1 },
        { id: 5, name: 'Water Management', completed: false, stageIndex: 2 },
        { id: 6, name: 'First Fertilizer Application', completed: false, stageIndex: 2 },
        { id: 7, name: 'Weed & Pest Control', completed: false, stageIndex: 2 },
        { id: 8, name: 'Second Fertilizer Application', completed: false, stageIndex: 3 },
        { id: 9, name: 'Harvesting', completed: false, stageIndex: 4 },
    ],
    'Sorghum': [
        { id: 1, name: 'Land Preparation', completed: false, stageIndex: 0 },
        { id: 2, name: 'Planting Seeds', completed: false, stageIndex: 1 },
        { id: 3, name: 'Thinning to desired plant population', completed: false, stageIndex: 2 },
        { id: 4, name: 'Weed Control', completed: false, stageIndex: 2 },
        { id: 5, name: 'Fertilizer Application', completed: false, stageIndex: 3 },
        { id: 6, name: 'Bird Scaring', completed: false, stageIndex: 3 },
        { id: 7, name: 'Harvesting', completed: false, stageIndex: 4 },
    ],
    'Millet': [
        { id: 1, name: 'Land Preparation', completed: false, stageIndex: 0 },
        { id: 2, name: 'Planting Seeds', completed: false, stageIndex: 1 },
        { id: 3, name: 'Thinning seedlings', completed: false, stageIndex: 2 },
        { id: 4, name: 'First Weeding', completed: false, stageIndex: 2 },
        { id: 5, name: 'Fertilizer Application', completed: false, stageIndex: 3 },
        { id: 6, name: 'Bird Scaring at grain filling stage', completed: false, stageIndex: 3 },
        { id: 7, name: 'Harvesting', completed: false, stageIndex: 4 },
    ],
    'Soyabeans': [
        { id: 1, name: 'Land Preparation', completed: false, stageIndex: 0 },
        { id: 2, name: 'Seed Inoculation (if needed)', completed: false, stageIndex: 1 },
        { id: 3, name: 'Planting Seeds', completed: false, stageIndex: 1 },
        { id: 4, name: 'Weed Control', completed: false, stageIndex: 2 },
        { id: 5, name: 'Pest/Disease Scouting', completed: false, stageIndex: 3 },
        { id: 6, name: 'Harvesting', completed: false, stageIndex: 4 },
    ],
    'Groundnut': [
        { id: 1, name: 'Land Preparation & Ridging', completed: false, stageIndex: 0 },
        { id: 2, name: 'Planting Seeds', completed: false, stageIndex: 1 },
        { id: 3, name: 'First Weeding', completed: false, stageIndex: 2 },
        { id: 4, name: 'Second Weeding & Earthing up', completed: false, stageIndex: 3 },
        { id: 5, name: 'Pest/Disease Control', completed: false, stageIndex: 3 },
        { id: 6, name: 'Harvesting', completed: false, stageIndex: 4 },
        { id: 7, name: 'Drying & Curing', completed: false, stageIndex: 4 },
    ],
    'Vegetables': [ // Generic template for fruiting vegetables like Tomato/Pepper
        { id: 1, name: 'Nursery Tray/Bed Preparation', completed: false, stageIndex: 0 },
        { id: 2, name: 'Sow Seeds in Nursery', completed: false, stageIndex: 0 },
        { id: 3, name: 'Main Field Preparation', completed: false, stageIndex: 0 },
        { id: 4, name: 'Transplanting Seedlings', completed: false, stageIndex: 1 },
        { id: 5, name: 'Staking/Trellising', completed: false, stageIndex: 2 },
        { id: 6, name: 'Fertilizer Application/Fertigation', completed: false, stageIndex: 2 },
        { id: 7, name: 'Weed & Pest Management', completed: false, stageIndex: 3 },
        { id: 8, name: 'Pruning and Training', completed: false, stageIndex: 3 },
        { id: 9, name: 'First Harvest', completed: false, stageIndex: 4 },
        { id: 10, name: 'Periodic Harvesting', completed: false, stageIndex: 4 },
    ],
    'Plantain': [
        { id: 1, name: 'Land Preparation & Hole Digging', completed: false, stageIndex: 0 },
        { id: 2, name: 'Planting Suckers', completed: false, stageIndex: 1 },
        { id: 3, name: 'Weed Control & Mulching', completed: false, stageIndex: 2 },
        { id: 4, name: 'Fertilizer/Manure Application', completed: false, stageIndex: 2 },
        { id: 5, name: 'De-suckering', completed: false, stageIndex: 3 },
        { id: 6, name: 'Propping bunches for support', completed: false, stageIndex: 3 },
        { id: 7, name: 'Harvesting Bunches', completed: false, stageIndex: 4 },
    ]
};

export const CROP_PLANS: CropPlan[] = [
    {
        id: 1,
        cropName: 'Maize',
        variety: 'Oba Super 2',
        field: 'Field A, North Zone',
        farmId: 1,
        plantingDate: new Date('2024-04-15'),
        harvestDate: new Date('2024-07-25'),
        color: 'bg-yellow-500',
        tasks: CROP_TASK_TEMPLATES['Maize'] || [],
        currentStage: 2,
        landSize: 5,
        landSizeUnit: 'Hectares',
        avgYield: 6,
        avgYieldUnit: 'Tonnes',
        expectedYield: 30,
    },
    {
        id: 2,
        cropName: 'Cassava',
        variety: 'TME 419',
        field: 'Lower East Pasture',
        farmId: 2,
        plantingDate: new Date('2024-03-20'),
        harvestDate: new Date('2025-01-20'),
        color: 'bg-lime-600',
        tasks: CROP_TASK_TEMPLATES['Cassava'] || [],
        currentStage: 1,
        landSize: 3,
        landSizeUnit: 'Hectares',
        avgYield: 25,
        avgYieldUnit: 'Tonnes',
        expectedYield: 75,
    },
];

export const LIVESTOCK_DATA: LivestockRecord[] = [
    {
        trackingType: 'INDIVIDUAL',
        id: 'NGA-34-001-1234',
        species: 'Cattle',
        farmId: 1,
        location: 'Pasture A',
        healthStatus: 'Healthy',
        name: 'Bessie',
        age: 24,
        weight: 350,
        sex: 'Female',
        variety: 'Sokoto Gudali',
        source: 'Self-bred',
        sireId: 'NGA-34-001-1235',
        weightHistory: [
            { date: new Date('2023-01-15'), weight: 150 },
            { date: new Date('2023-07-20'), weight: 250 },
            { date: new Date('2024-01-10'), weight: 350 },
        ],
    },
    {
        trackingType: 'BATCH',
        id: 'CH-BATCH-002',
        species: 'Chicken',
        farmId: 2,
        location: 'Coop 3',
        batchName: 'Broilers Batch #5',
        quantity: 500,
        acquisitionDate: new Date('2024-02-01'),
        statusCounts: { 'Healthy': 498, 'Sick': 2 },
    }
];

export const HEALTH_EVENTS: HealthEvent[] = [
    {
        id: 'HE-001',
        type: 'Vaccination',
        date: new Date('2024-02-15'),
        description: 'Gumboro vaccine administered.',
        animals: [{ animalId: 'CH-BATCH-002', affectedCount: 500 }],
    },
    {
        id: 'HE-002',
        type: 'Vaccination',
        date: new Date(new Date().setDate(new Date().getDate() + 14)), // 14 days from now
        description: 'Scheduled booster shot for Newcastle disease.',
        animals: [{ animalId: 'CH-BATCH-002', affectedCount: 498 }],
        newStatus: 'Vaccinated',
    },
];

export const BREEDING_RECORDS: BreedingRecord[] = [
    {
        id: 'BR-001',
        sireId: 'NGA-34-001-1235',
        damId: 'NGA-34-001-1234',
        pairingDate: new Date('2023-10-01'),
        expectedDueDate: new Date('2024-07-08'),
        status: 'Active',
        farmId: 1,
    }
];

export const LIVESTOCK_TASKS: LivestockTask[] = [
    { id: 'LT-001', title: 'Clean Coop 3', dueDate: new Date(), status: 'To Do', farmId: 2 },
    { id: 'LT-002', title: 'Check water for Pasture A', dueDate: new Date(), status: 'In Progress', farmId: 1 },
    { id: 'LT-003', title: 'Order new feed', dueDate: new Date('2024-03-01'), status: 'Done', farmId: 1, archived: false },
    { id: 'LT-004', title: 'Old task', dueDate: new Date('2024-01-01'), status: 'Done', farmId: 1, archived: true },
];

export const SUPPORTED_ENTERPRISE_CROPS: string[] = ['Maize', 'Cassava', 'Yam', 'Rice', 'Sorghum', 'Millet', 'Soyabeans', 'Groundnut', 'Vegetables', 'Plantain'];
export const SUPPORTED_LIVESTOCK: string[] = ['Cattle', 'Goat', 'Sheep', 'Chicken', 'Fish', 'Pig', 'Rabbit', 'Turkey'];

// All possible pages/tools that can be restricted.
export const PERMISSIONS: string[] = [
    'Farm House',
    'User Profile',
    'Weather',
    'Cooperatives',
    'Settings',
    'Livestock Planner',
    'Cropping Planner',
    'Farm Records',
    'Store Management',
    'Receipt Generator',
    'Talk to Farmr',
    'Gov/NGO Support',
    'Satellite Data',
];

export const TEAM_MEMBER_ROLES: TeamMemberRole[] = ['Farm Manager', 'Accountant', 'Store Manager', 'Field Officer', 'Agronomist', 'Veterinary Officer', 'Livestock Officer'];

export const DEFAULT_PERMISSIONS: Record<TeamMemberRole, string[]> = {
    'Farm Manager': PERMISSIONS, // Universal access
    'Accountant': [
        'Farm House',
        'Weather',
        'User Profile',
        'Farm Records',
        'Receipt Generator',
        'Gov/NGO Support',
    ],
    'Store Manager': [
        'Farm House',
        'Weather',
        'User Profile',
        'Store Management',
        'Gov/NGO Support',
    ],
    'Field Officer': [
        'Farm House',
        'Weather',
        'User Profile',
        'Livestock Planner',
        'Cropping Planner',
        'Talk to Farmr',
        'Gov/NGO Support',
    ],
    'Agronomist': [
        'Farm House',
        'Weather',
        'User Profile',
        'Cropping Planner',
        'Talk to Farmr',
        'Gov/NGO Support',
    ],
    'Veterinary Officer': [
        'Farm House',
        'Weather',
        'User Profile',
        'Livestock Planner',
        'Talk to Farmr',
        'Gov/NGO Support',
    ],
    'Livestock Officer': [
        'Farm House',
        'Weather',
        'User Profile',
        'Livestock Planner',
        'Talk to Farmr',
        'Gov/NGO Support',
    ],
};

export const LIVESTOCK_PLANNER_TABS: string[] = ['Overview', 'Inventory', 'Health', 'Breeding', 'Tasks'];

export const LIVESTOCK_CATEGORIES: Record<string, LivestockTrackingType> = {
    'Cattle': 'INDIVIDUAL',
    'Goat': 'INDIVIDUAL',
    'Sheep': 'INDIVIDUAL',
    'Pig': 'INDIVIDUAL',
    'Chicken': 'BATCH',
    'Fish': 'BATCH',
    'Rabbit': 'BATCH',
    'Turkey': 'BATCH',
};

export const GESTATION_PERIODS: Record<string, number> = { // in days
    'Cattle': 283,
    'Goat': 150,
    'Sheep': 152,
    'Pig': 114,
    'Rabbit': 31,
};

export const PAYMENT_METHODS: string[] = ['Cash', 'Bank Transfer', 'POS', 'Cheque'];
export const RECEIPT_CATEGORIES: string[] = ['Produce Sale', 'Livestock Sale', 'Asset Sale', 'Service Rendered'];
export const INVOICE_CATEGORIES: string[] = ['Fertilizer Purchase', 'Seed Purchase', 'Feed Purchase', 'Equipment Purchase', 'Repair & Maintenance', 'Utilities', 'Salaries'];
export const RECEIPT_UNITS: string[] = ['kg', 'g', 'Bag', 'Tonne', 'Head', 'Crate', 'Bunch', 'Piece'];
export const STOCK_OUT_REASONS: StockOutReason[] = ['Sales', 'Expired', 'Damaged', 'Internal Use'];
export const INPUT_CATEGORIES: InputCategory[] = ['Seeds', 'Fertilizers', 'Pesticides', 'Feed', 'Other'];
export const EQUIPMENT_STATUSES: EquipmentStatus[] = ['Operational', 'In Repair', 'Decommissioned'];
export const STORE_MANAGEMENT_TABS: string[] = ['Awaiting Confirmation', 'Inputs Inventory', 'Tools/Equipment', 'Produce Inventory'];

export const PENDING_DOCUMENTS_DATA: FinancialDocument[] = [
  {
    id: 'INV-12345',
    documentType: 'Invoice',
    category: 'Fertilizer Purchase',
    customerName: 'Agro Supplies Ltd.',
    customerPhone: '08012345678',
    paymentMethod: 'Bank Transfer',
    date: new Date('2024-03-10'),
    items: [
      { name: 'NPK 20-10-10', unit: '50kg Bag', unitPrice: 15000, quantity: 20, price: 300000 },
    ],
    subtotal: 300000,
    discountPercent: 0,
    discountAmount: 0,
    taxPercent: 0,
    taxAmount: 0,
    totalAmount: 300000,
    amountPaid: 0,
    balance: 300000,
    farmId: 1,
  },
];

export const REJECTED_DATA: RejectedFinancialDocument[] = [
  {
    id: 'REC-54321',
    documentType: 'Receipt',
    category: 'Produce Sale',
    customerName: 'Local Market Buyer',
    customerPhone: '09087654321',
    paymentMethod: 'Cash',
    date: new Date('2024-03-05'),
    items: [
      { name: 'Cassava', unit: 'Tonne', unitPrice: 80000, quantity: 2, price: 160000 },
    ],
    subtotal: 160000,
    discountPercent: 5,
    discountAmount: 8000,
    taxPercent: 0,
    taxAmount: 0,
    totalAmount: 152000,
    amountPaid: 152000,
    balance: 0,
    reasonForRejection: 'Incorrect discount percentage applied. Should be 2.5%.',
    farmId: 2,
  },
];

export const INPUT_INVENTORY_DATA: InputInventoryItem[] = [
  { id: 'INP-1', name: 'NPK 20-10-10 Fertilizer', category: 'Fertilizers', quantity: 50, unit: '50kg Bag', supplier: 'Agro Supplies Ltd.', purchaseDate: new Date('2024-03-10'), lowStockThreshold: 10, farmId: 1 },
  { id: 'INP-2', name: 'Oba Super 2 Maize Seed', category: 'Seeds', quantity: 5, unit: '10kg Bag', supplier: 'SeedCo', purchaseDate: new Date('2024-02-20'), lowStockThreshold: 2, farmId: 1 },
];

export const TOOLS_EQUIPMENT_DATA: ToolEquipmentItem[] = [
    { id: 'TE-1', name: 'Massey Ferguson Tractor', type: 'Equipment', purchaseDate: new Date('2022-01-15'), purchaseValue: 15000000, currentValue: 12000000, status: 'Operational', usefulLifeInYears: 10, salvageValue: 1500000, farmId: 1 },
    { id: 'TE-2', name: 'Cutlass', type: 'Tool', purchaseDate: new Date('2023-05-20'), purchaseValue: 5000, currentValue: 4000, status: 'Operational', usefulLifeInYears: 3, salvageValue: 500, farmId: 2 },
];

export const PRODUCE_INVENTORY_DATA: ProduceInventoryItem[] = [
    { id: 'PROD-1', produceName: 'Maize Grains', quantity: 15, unit: 'Tonnes', harvestDate: new Date('2023-11-20'), storageLocation: 'Silo 1', farmId: 1 },
];

export const DISTRIBUTION_HISTORY_DATA: DistributionRecord[] = [
    { id: 'DIST-1', produceId: 'PROD-1', produceName: 'Maize Grains', quantity: 5, unit: 'Tonnes', date: new Date('2023-12-01'), reason: 'Sales', transactionNumber: 'INV-1024' },
];

export const BUSINESS_PROFILE_DATA: BusinessProfile = {
  name: 'Green Valley Farms',
  email: 'contact@greenvalley.com',
  phone: '+234 801 234 5678',
  address: 'Km 5, Old Ibadan Road, Abeokuta, Ogun State',
  logo: '',
};

export const USER_PROFILE_DATA: UserProfile = {
  name: 'John Doe',
  role: 'Farm Manager',
  email: 'john.doe@greenvalley.com',
  phone: '08088888888',
  avatar: generateAvatar('John Doe'),
  bio: 'Dedicated farm manager with over 10 years of experience in mixed crop and livestock farming. Passionate about sustainable agriculture and leveraging technology to improve yields.',
};

export const TEAM_MEMBERS_DATA: TeamMember[] = [
  {
    id: 'user-1',
    email: 'john.doe@greenvalley.com',
    role: 'Farm Manager',
    permissions: PERMISSIONS,
    avatar: generateAvatar('John Doe', '#1E5631'),
    status: 'Active',
  },
  {
    id: 'user-2',
    email: 'jane.smith@greenvalley.com',
    role: 'Accountant',
    permissions: DEFAULT_PERMISSIONS['Accountant'],
    avatar: generateAvatar('Jane Smith', '#0D8ABC'),
    status: 'Active',
  },
  {
    id: 'user-3',
    email: 'new.user@example.com',
    role: 'Field Officer',
    permissions: DEFAULT_PERMISSIONS['Field Officer'],
    avatar: generateAvatar('New User', '#B91C1C'),
    status: 'Pending Invitation',
    farmId: 1,
  },
];

export const GLOBAL_ACTIVITY_LOG: ActivityLog[] = [
    { id: 'log-1', userId: 'user-1', icon: <ClipboardIcon />, text: 'Created a new cropping plan for Maize.', date: new Date(Date.now() - 2 * 60 * 60 * 1000) },
    { id: 'log-2', userId: 'user-2', icon: <ReceiptGeneratorIcon />, text: 'Confirmed receipt #REC-12346.', date: new Date(Date.now() - 5 * 60 * 60 * 1000) },
    { id: 'log-3', userId: 'user-1', icon: <LivestockPlannerIcon />, text: 'Logged vaccination event for Cattle.', date: new Date(Date.now() - 24 * 60 * 60 * 1000) },
];

export const SUPPORT_PROGRAMS: SupportProgram[] = [
    {
        id: 'SP-001',
        title: 'Anchor Borrowers\' Programme (ABP)',
        provider: 'Government',
        category: 'Loan',
        description: 'A Central Bank of Nigeria initiative to create economic linkages between smallholder farmers and processors to increase agricultural output.',
        status: 'Open',
        deadline: new Date('2024-12-31'),
        eligibility: ['Smallholder farmer', 'Member of a cooperative'],
        requiredDocuments: ['Bank Verification Number (BVN)', 'Cooperative Membership ID'],
        applyLink: '#'
    },
    {
        id: 'SP-002',
        title: 'Agro-Processing, Productivity Enhancement and Livelihood Improvement Support (APPEALS)',
        provider: 'Government',
        category: 'Grant',
        description: 'A World Bank-assisted project aimed at enhancing the productivity of small and medium-scale farmers and improving value addition along priority value chains.',
        status: 'Open',
        deadline: new Date('2024-10-31'),
        eligibility: ['Active in priority value chains (e.g., Cashew, Rice, Aquaculture)', 'Located in participating states'],
        requiredDocuments: ['Business Plan', 'Evidence of Land Ownership/Lease'],
        applyLink: '#'
    },
    {
        id: 'SP-003',
        title: 'Heifer International - Farmer Training Program',
        provider: 'NGO',
        category: 'Training',
        description: 'Provides training on sustainable farming practices, animal well-being, and business management to empower smallholder farmers.',
        status: 'Closed',
        deadline: new Date('2024-02-28'),
        eligibility: ['Rural smallholder farmer', 'Willingness to pass on the gift of training and livestock'],
        requiredDocuments: ['Community Leader Recommendation'],
        applyLink: '#'
    }
];
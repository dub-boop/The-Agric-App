

import React from 'react';
import type { NavItem, ToolItem, CropPlan, CropTask, LivestockRecord, HealthEvent, BreedingRecord, LivestockTask, FeedInventory, LivestockTrackingType, AffectedAnimal, IndividualAnimal, InputInventoryItem, ToolEquipmentItem, ProduceInventoryItem, DistributionRecord, FinancialDocument, StockOutReason, RejectedFinancialDocument, BusinessProfile, UserProfile, ActivityLog, InputCategory, EquipmentStatus, SupportProgram, Payment, TeamMember, TeamMemberRole, Department } from './types';

// Generic Icon Wrapper
const Icon = ({ children, className = "h-6 w-6", strokeWidth = 1.5 }: React.PropsWithChildren<{ className?: string; strokeWidth?: number; }>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={strokeWidth}
  >
    {children}
  </svg>
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
const HomeIcon = () => <Icon><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h7.5" /></Icon>;
export const UserIcon = ({ className = "h-6 w-6" }: { className?: string }) => <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></Icon>;
export const WeatherNavIcon = () => <Icon><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></Icon>;
const CooperativesIcon = () => <Icon><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m-7.5-2.28a3 3 0 00-4.682-2.72 8.986 8.986 0 003.741.479m7.5-2.28v-2.28m0 2.28a3 3 0 01-4.682-2.72 8.986 8.986 0 013.741.479m-7.5-2.28v-2.28m0 2.28a3 3 0 00-4.682-2.72 8.986 8.986 0 003.741.479M12 12.75a2.25 2.25 0 110-4.5 2.25 2.25 0 010 4.5z" /></Icon>;
export const SettingsIcon = () => <Icon><path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-1.003 1.11-1.226.55-.223 1.159-.223 1.71 0 .55.223 1.02.684 1.11 1.226l.078.429c.357.196.676.44 1.003.713l.412-.058c.562-.08 1.13.243 1.342.766l.218.538c.212.523.087 1.11-.293 1.485l-.345.345c.03.176.044.355.044.538s-.014.362-.044.538l.345.345c.38.375.505.962.293 1.485l-.218.538c-.212-.523-.78.846-1.342.766l-.412-.058a5.127 5.127 0 01-1.003.713l-.078.429c-.09.542-.56 1.003-1.11 1.226-.55-.223-1.159-.223-1.71 0-.55-.223-1.02.684-1.11-1.226l-.078-.429a5.126 5.126 0 01-1.003-.713l-.412.058c-.562.08-1.13-.243-1.342-.766l-.218-.538c-.212-.523-.087 1.11.293 1.485l.345.345a5.127 5.127 0 01-.044-.538s.014-.362.044.538l-.345.345c-.38-.375-.505-.962-.293-1.485l.218.538c.212-.523.78-.846 1.342.766l.412.058c.327-.273.646-.517 1.003-.713l.078-.429zM12 15a3 3 0 100-6 3 3 0 000 6z" /></Icon>;


// Icons for responsive menu
export const MenuIcon = () => <Icon className="h-6 w-6"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></Icon>;
export const CloseIcon = ({ className = "h-6 w-6" }: { className?: string }) => <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></Icon>;


// Weather Icons
export const SunIcon = ({className = "h-10 w-10 text-yellow-400"}: {className?: string}) => <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M12 12a5 5 0 100-10 5 5 0 000 10z" /></Icon>;
export const CloudIcon = ({className = "h-10 w-10 text-gray-400"}: {className?: string}) => <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-2.6-5.224 5.25 5.25 0 00-9.75 2.25 4.5 4.5 0 00-1.332 7.257 4.5 4.5 0 00-1.5 3.75z" /></Icon>;
export const RainIcon = ({className = "h-10 w-10 text-blue-500"}: {className?: string}) => <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5a.75.75 0 01.75-.75zM10.5 6a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5a.75.75 0 01.75-.75zM10.5 10.5a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5a.75.75 0 01.75-.75zM10.5 15a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5a.75.75 0 01.75-.75zM4.5 15.75a.75.75 0 01.75-.75h13.5a.75.75 0 010 1.5H5.25a.75.75 0 01-.75-.75z" /></Icon>;
export const PartlyCloudyIcon = ({className = "h-10 w-10"}: {className?: string}) => <div className={`relative ${className}`}><SunIcon className="w-full h-full" /><CloudIcon className="w-3/4 h-3/4 absolute bottom-0 right-0 text-gray-400/80" /></div>;
export const StormIcon = ({className = "h-10 w-10 text-gray-600"}: {className?: string}) => <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-2.6-5.224 5.25 5.25 0 00-9.75 2.25 4.5 4.5 0 00-1.332 7.257 4.5 4.5 0 00-1.5 3.75zM12 18.75a.375.375 0 00.375-.375v-1.5a.375.375 0 00-.75 0v1.5c0 .207.168.375.375.375zM12 12.75l.125.25.25.125-.25.125-.125.25-.125-.25-.25-.125.25-.125.125-.25z" /></Icon>;
export const ThermometerIcon = ({className = "h-5 w-5"}: {className?: string}) => <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5V3a1.5 1.5 0 00-3 0v7.5a3 3 0 103 0zm0 0a3 3 0 11-3 0m0 0H7.5m9 0H12m0 0a3 3 0 103 0m-3 0V3M7.5 12.75a4.5 4.5 0 109 0h-9z" /></Icon>;
export const WindIcon = ({className = "h-5 w-5"}: {className?: string}) => <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m0 0l6.75-6.75M12 19.5l-6.75-6.75" /></Icon>;
export const HumidityIcon = ({className = "h-5 w-5"}: {className?: string}) => <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></Icon>;
export const SunriseIcon = ({className = "h-5 w-5"}: {className?: string}) => <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1M3 12h1m16 0h-1M5.636 5.636l.707.707m12.022 12.022l-.707-.707M12 6a6 6 0 016 6h-3a3 3 0 00-3-3V6z" /></Icon>;
export const SunsetIcon = ({className = "h-5 w-5"}: {className?: string}) => <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-1m0-16v1M3 12h1m16 0h-1M5.636 18.364l.707-.707m12.022-12.022l-.707.707M12 18a6 6 0 006-6h-3a3 3 0 01-3 3v3z" /></Icon>;
export const UvIndexIcon = ({className = "h-5 w-5"}: {className?: string}) => <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" /></Icon>;
export const SoilMoistureIcon = ({className = "h-5 w-5"}: {className?: string}) => <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.21 1.025l-1.025.21a2.25 2.25 0 01-1.025-.21v-5.714M14.25 3.104v5.714a2.25 2.25 0 01-.21 1.025l-1.025.21a2.25 2.25 0 01-1.025-.21v-5.714M18.75 3.104v5.714c0 .621-.504 1.125-1.125 1.125h-1.5a1.125 1.125 0 01-1.125-1.125v-5.714" /></Icon>;
export const GddIcon = ({className = "h-5 w-5"}: {className?: string}) => <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18z" /></Icon>;
export const EvapotranspirationIcon = ({className = "h-5 w-5"}: {className?: string}) => <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M12 19.5v-15m0 0l-6.75 6.75M12 4.5l6.75 6.75M3 15h3m12 0h3" /></Icon>;

// Generic Arrow Icon
export const ArrowRightIcon = () => <Icon className="h-4 w-4 inline-block ml-2"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></Icon>;
export const ArrowLeftIcon = ({ className = 'h-5 w-5' }: { className?: string }) => <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></Icon>;
export const ArrowUpIcon = ({ className }: { className?: string }) => <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M12 19.5v-15m0 0l-6.75 6.75M12 4.5l6.75 6.75" /></Icon>;
export const ArrowDownIcon = ({ className }: { className?: string }) => <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m0 0l6.75-6.75M12 19.5l-6.75-6.75" /></Icon>;

// Generic Action Icon
export const TrashIcon = ({ className = "h-5 w-5" }: { className?: string }) => <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.134-2.036-2.134H8.718c-1.126 0-2.037.954-2.037 2.134v.916m7.5 0h-7.5" /></Icon>;
export const PlusIcon = ({ className = "h-5 w-5" }: { className?: string }) => <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></Icon>;
export const EditIcon = ({ className = "h-5 w-5" }: { className?: string }) => <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.786a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></Icon>;
export const ViewIcon = ({ className = "h-5 w-5" }: { className?: string }) => <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.432 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></Icon>;
export const PrinterIcon = ({ className = "h-5 w-5" }: { className?: string }) => <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231a1.125 1.125 0 01-1.12-1.227L6.34 18m11.32 0c0-1.24-.97-2.25-2.17-2.25H8.51c-1.2 0-2.17 1.01-2.17 2.25m11.32 0H6.34m11.32 0l-2.57-4.112a2.25 2.25 0 00-2.132-1.388H10.15a2.25 2.25 0 00-2.132 1.388L5.44 13.829m12.38 0L10.15 3.75m2.3-1.5l-2.3 1.5m-2.3-1.5l2.3 1.5M12 3.75l2.3 1.5m-4.6 0l2.3-1.5" /></Icon>;
export const ArchiveIcon = ({ className = "h-5 w-5" }: { className?: string }) => <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4" /></Icon>;
export const HistoryIcon = ({ className = "h-5 w-5" }: { className?: string }) => <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0011.664 0l3.181-3.183m-4.991-2.695v-4.992m0 0h-4.992m4.992 0l-3.181-3.183a8.25 8.25 0 00-11.664 0l-3.181 3.183" /></Icon>;
export const StockOutIcon = ({ className = "h-5 w-5" }: { className?: string }) => <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></Icon>;
export const DownloadIcon = ({ className = "h-5 w-5" }: { className?: string }) => <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></Icon>;
export const CalendarIcon = ({ className = "h-4 w-4" }: { className?: string }) => <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></Icon>;
export const ChevronDownIcon = ({ className = "h-6 w-6" }: { className?: string }) => <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></Icon>;
export const CheckIcon = ({ className = "h-6 w-6" }: { className?: string }) => <Icon className={className} strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></Icon>;
export const MailIcon = ({ className = 'h-5 w-5' }: { className?: string }) => <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></Icon>;
export const ShareIcon = ({ className = "h-5 w-5" }: { className?: string }) => <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186a2.25 2.25 0 112.186 0M7.217 10.907a2.25 2.25 0 002.186 0m-2.186 0l.001-.001M14.783 13.093a2.25 2.25 0 100-2.186m0 2.186a2.25 2.25 0 00-2.186 0m2.186 0l-.001.001M14.783 13.093l-2.186-3.825m0 0l-2.186 3.825m2.186-3.825V5.25A2.25 2.25 0 0010.5 3h-3a2.25 2.25 0 00-2.25 2.25v.75" /></Icon>;
export const PhoneIcon = ({ className = 'h-5 w-5' }: { className?: string }) => <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" /></Icon>;
export const LocationMarkerIcon = ({ className = 'h-5 w-5' }: { className?: string }) => <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></Icon>;


// View Toggle Icons
export const ChartPieIcon = () => <Icon className="h-5 w-5"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" /><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" /></Icon>;
export const TimelineIcon = () => <Icon className="h-5 w-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12H12m-8.25 5.25h16.5" /></Icon>;
export const ListIcon = () => <Icon className="h-5 w-5"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></Icon>;

// Farm Records Page Icons
export const IncomeIcon = (props: { className?: string }) => <Icon className={props.className}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375" /></Icon>;
export const ExpenditureIcon = (props: { className?: string }) => <Icon className={props.className}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></Icon>;
export const ProfitLossIcon = (props: { className?: string }) => <Icon className={props.className}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></Icon>;
export const TrophyIcon = (props: { className?: string }) => <Icon className={props.className}><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9a9.142 9.142 0 01-4.243-7.733 9.142 9.142 0 014.243-7.733h9a9.142 9.142 0 014.243 7.733 9.142 9.142 0 01-4.243 7.733zM12 1.5v4.5m0 16.5v-4.5m-3.375-10.5a4.5 4.5 0 017.5 0m-7.5 0h7.5m-3.75 0V15" /></Icon>;


// Livestock Planner Icons
export const BullIcon = (props: { className?: string }) => <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9 9.563a3.375 3.375 0 106 0V9a3.375 3.375 0 00-6 0v.563z" /></Icon>;
export const StethoscopeIcon = (props: { className?: string }) => <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M3.375 12h17.25m-17.25 0a3.375 3.375 0 10-6.75 0 3.375 3.375 0 006.75 0zM3.375 12a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM12 18.75a3.375 3.375 0 100-6.75 3.375 3.375 0 000 6.75z" /></Icon>;
export const HeartIcon = (props: { className?: string }) => <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></Icon>;
export const ClipboardIcon = (props: { className?: string }) => <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></Icon>;
export const WarningIcon = (props: { className?: string }) => <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></Icon>;


// Tool Icons
export const LivestockPlannerIcon = (props: { className?: string }) => <Icon className={props.className || "h-8 w-8"}><path strokeLinecap="round" strokeLinejoin="round" d="M10.125 2.25h-4.5c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125v-9M10.125 2.25h.375a9 9 0 019 9v.375M10.125 2.25A3.375 3.375 0 0113.5 5.625v1.5c0 .621.504 1.125 1.125 1.125h1.5a3.375 3.375 0 013.375 3.375M9 15l2.25 2.25L15 12" /></Icon>;
export const CroppingPlannerIcon = (props: { className?: string }) => <Icon className={props.className || "h-8 w-8"}><path strokeLinecap="round" strokeLinejoin="round" d="M5 21c.5-4.5 2.5-8 7-10" /><path d="M9 18c6.218 0 10.5-3.288 11-12v-1h-1c-1 0-3 1-4.5 4-1.5-1-2-2-4.5-4-2.5 2-3 4-3.5 6.5" /></Icon>;
export const FarmRecordsIcon = (props: { className?: string }) => <Icon className={props.className || "h-8 w-8"}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></Icon>;
export const ReceiptGeneratorIcon = (props: { className?: string }) => <Icon className={props.className || "h-8 w-8"}><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 3.75V16.5a2.25 2.25 0 01-2.25-2.25H5.25A2.25 2.25 0 013 16.5V3.75m13.5 0h-1.5m-12 0h1.5m9 0V3.375a.375.375 0 00-.375-.375h-9a.375.375 0 00-.375.375V3.75m9 0h1.5m-13.5 0h13.5" /></Icon>;
export const TalkToFarmrIcon = (props: { className?: string }) => <Icon className={props.className || "h-8 w-8"}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></Icon>;
const SatelliteDataIcon = () => <Icon className="h-8 w-8"><path strokeLinecap="round" strokeLinejoin="round" d="M8.288 15.038a5.25 5.25 0 017.424 0M5.136 11.886c3.87-3.87 10.154-3.87 14.024 0M1.984 8.734c6.953-6.953 18.286-6.953 25.238 0M21.75 12a9.75 9.75 0 11-19.5 0 9.75 9.75 0 0119.5 0z" /></Icon>;
export const GovNgoSupportIcon = ({ className = "h-8 w-8" }: { className?: string }) => <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" /></Icon>;
export const StoreManagementIcon = ({ className = "h-8 w-8" }: { className?: string }) => <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.25m11.25 0H21.75m-16.5 0q0 2.25 2.25 2.25h10.5a2.25 2.25 0 002.25-2.25m-16.5 0V7.5A2.25 2.25 0 014.5 5.25h15A2.25 2.25 0 0121.75 7.5v13.5M2.25 21h19.5M4.5 7.5v13.5m15-13.5v13.5" /></Icon>;


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

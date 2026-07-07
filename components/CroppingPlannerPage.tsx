import React, { useState, useMemo, useEffect } from 'react';
// FIX: Imported `PrinterIcon` to resolve a "Cannot find name" error.
import { MenuIcon, PlusIcon, CROP_PLANS, CloseIcon, TimelineIcon, ListIcon, ChartPieIcon, ArrowLeftIcon, ArrowRightIcon, CROP_TASK_TEMPLATES, EditIcon, TrashIcon, IncomeIcon, ClipboardIcon, DownloadIcon, CroppingPlannerIcon, CalendarIcon, CheckIcon, ArchiveIcon, HistoryIcon, PrinterIcon } from '../constants';
import type { CropPlan, CropTask, FarmLocation, CroppingActivity, TaskStatus } from '../types';

// --- Constants & Types ---
const HECTARES_PER_ACRE = 0.404686;
type ViewMode = 'overview' | 'timeline' | 'list' | 'tasks';
type FormMode = 'add' | 'edit';

// --- Helper Functions ---
const getDayOfYear = (date: Date): number => {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = (date.getTime() - start.getTime()) + ((start.getTimezoneOffset() - date.getTimezoneOffset()) * 60 * 1000);
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
};

// Fixes timezone issues where new Date('YYYY-MM-DD') can be off by a day.
const parseDateString = (dateString: string): Date => {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
};

const formatDateForInput = (date: Date): string => {
    return date.toISOString().split('T')[0];
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const STAGES = ['Preparation', 'Planting', 'Growing', 'Maturing', 'Harvesting'];

// --- Sub-components ---

const DetailPanel = ({ plan, isOpen, onClose, onUpdateTask, onEdit, onDelete }: { 
    plan: CropPlan | null;
    isOpen: boolean;
    onClose: () => void;
    onUpdateTask: (planId: number, taskId: number, completed: boolean) => void;
    onEdit: (plan: CropPlan) => void;
    onDelete: (planId: number) => void;
}) => {
    if (!plan) return null;

    return (
        <>
            {/* Overlay */}
            <div 
                className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            ></div>
            {/* Panel */}
            <aside className={`fixed top-0 right-0 h-full w-full max-w-lg bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="flex flex-col h-full">
                    <header className="p-6 border-b border-gray-200 flex items-center justify-between">
                        <h3 className="text-xl font-bold text-gray-800">Plan Details</h3>
                        <div className="flex items-center space-x-2">
                             <button onClick={() => onEdit(plan)} className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-blue-600 transition-colors" aria-label="Edit plan"><EditIcon /></button>
                             <button onClick={() => onDelete(plan.id)} className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-red-600 transition-colors" aria-label="Delete plan"><TrashIcon /></button>
                             <button onClick={onClose} className="p-2 rounded-full text-gray-500 hover:bg-gray-100" aria-label="Close panel"><CloseIcon /></button>
                        </div>
                    </header>
                    <div className="flex-grow p-6 overflow-y-auto">
                        {/* Summary */}
                        <div className="mb-6">
                            <h4 className="text-lg font-semibold text-gray-700">{plan.cropName} <span className="text-base font-normal text-gray-500">- {plan.variety}</span></h4>
                            <p className="text-gray-600">{plan.field}</p>
                            <p className="text-sm text-gray-500 mt-2">
                                {plan.plantingDate.toLocaleDateString('en-GB')} - {plan.harvestDate.toLocaleDateString('en-GB')}
                            </p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-6 text-center">
                            <div className="bg-gray-50 p-3 rounded-lg">
                                <p className="text-xs text-gray-500">Land Size</p>
                                <p className="text-lg font-bold text-gray-800">{plan.landSize} {plan.landSizeUnit}</p>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg">
                                <p className="text-xs text-gray-500">Expected Yield</p>
                                <p className="text-lg font-bold text-gray-800">{plan.expectedYield.toLocaleString()} {plan.avgYieldUnit}</p>
                            </div>
                        </div>


                        {/* Progress Tracker */}
                        <div className="mb-8">
                            <h4 className="text-md font-semibold text-gray-800 mb-4">Progress</h4>
                            <div className="flex items-center">
                                {STAGES.map((stage, index) => (
                                    <React.Fragment key={stage}>
                                        <div className="flex flex-col items-center">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${index <= plan.currentStage ? 'bg-green-600 border-green-600 text-white' : 'bg-gray-100 border-gray-300 text-gray-500'}`}>
                                                {index < plan.currentStage ? '✓' : index + 1}
                                            </div>
                                            <p className={`text-xs mt-2 text-center ${index <= plan.currentStage ? 'font-semibold text-gray-700' : 'text-gray-500'}`}>{stage}</p>
                                        </div>
                                        {index < STAGES.length - 1 && <div className={`flex-1 h-1 ${index < plan.currentStage ? 'bg-green-500' : 'bg-gray-200'}`}></div>}
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>

                        {/* Task List */}
                        <div>
                            <h4 className="text-md font-semibold text-gray-800 mb-4">Tasks</h4>
                            <ul className="space-y-3">
                                {plan.tasks.map(task => (
                                    <li key={task.id} className="flex items-center bg-gray-50 p-3 rounded-lg">
                                        <input 
                                            type="checkbox"
                                            id={`task-${plan.id}-${task.id}`}
                                            checked={task.completed}
                                            onChange={(e) => onUpdateTask(plan.id, task.id, e.target.checked)}
                                            className="h-5 w-5 rounded border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer"
                                        />
                                        <label htmlFor={`task-${plan.id}-${task.id}`} className={`ml-3 text-gray-700 flex-1 cursor-pointer ${task.completed ? 'line-through text-gray-400' : ''}`}>
                                            {task.name}
                                        </label>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
};

const inputClasses = "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-gray-700 bg-gray-50";
const selectClasses = `${inputClasses} h-[42px]`;

const FormField = ({ label, children }: { label: string, children: React.ReactNode }) => (
    <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
        {children}
    </div>
);

const PlanFormPanel = ({ isOpen, onClose, onSubmit, mode, initialData, farmLocations, availableCrops, plans }: {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (plan: Omit<CropPlan, 'id' | 'color' | 'tasks' | 'currentStage'> & { id?: number }) => void;
    mode: FormMode;
    initialData?: CropPlan | null;
    farmLocations: FarmLocation[];
    availableCrops: string[];
    plans: CropPlan[];
}) => {
    // Form state
    const [cropName, setCropName] = useState('');
    const [variety, setVariety] = useState('');
    const [field, setField] = useState('');
    const [plantingDate, setPlantingDate] = useState('');
    const [harvestDate, setHarvestDate] = useState('');
    const [landSize, setLandSize] = useState('0');
    const [avgYield, setAvgYield] = useState('0');

    // Derived state for validation
    const { availableAreaInHectares, sizeError } = useMemo(() => {
        const selectedFarmLocation = farmLocations.find(loc => loc.name === field);
        if (!selectedFarmLocation) return { availableAreaInHectares: 0, sizeError: null };

        // All farm locations are now in Hectares
        const totalArea = parseFloat(selectedFarmLocation.size) || 0;

        // All plans are now in Hectares
        const usedArea = plans
            .filter(p => p.field === field && p.id !== initialData?.id) // Exclude current plan if editing
            .reduce((sum, p) => sum + p.landSize, 0);

        const availableArea = totalArea - usedArea;
        const currentPlanArea = parseFloat(landSize) || 0;
        
        let error = null;
        if (currentPlanArea <= 0) {
            error = 'Land size must be greater than zero.';
        } else {
            // Round to a high precision to avoid floating point comparison issues
            const precision = 1000000;
            const roundedCurrentPlanArea = Math.round(currentPlanArea * precision);
            const roundedAvailableArea = Math.round(availableArea * precision);

            if (roundedCurrentPlanArea > roundedAvailableArea) {
                error = `Size cannot exceed available area: ${availableArea.toFixed(2)} Ha.`;
            }
        }
        
        return { availableAreaInHectares: availableArea, sizeError: error };
    }, [field, landSize, plans, initialData, farmLocations]);

    // Derived state for calculation
    const expectedYield = useMemo(() => {
        const sizeInHectares = parseFloat(landSize) || 0;
        const yieldRate = parseFloat(avgYield) || 0;
        return sizeInHectares * yieldRate;
    }, [landSize, avgYield]);


    useEffect(() => {
        if (isOpen) {
            if (mode === 'edit' && initialData) {
                setCropName(initialData.cropName);
                setVariety(initialData.variety);
                setField(initialData.field);
                setPlantingDate(formatDateForInput(initialData.plantingDate));
                setHarvestDate(formatDateForInput(initialData.harvestDate));
                setLandSize(String(initialData.landSize));
                setAvgYield(String(initialData.avgYield));
            } else {
                // Reset form for 'add' mode
                setCropName('');
                setVariety('');
                setField('');
                setPlantingDate('');
                setHarvestDate('');
                setLandSize('0');
                setAvgYield('0');
            }
        }
    }, [mode, initialData, isOpen]);


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (sizeError) {
            alert(sizeError);
            return;
        }
        if ((parseFloat(avgYield) || 0) <= 0) {
            alert("Average Yield must be greater than zero.");
            return;
        }
        if (!cropName || !field || !plantingDate || !harvestDate) {
            alert("Please fill out all required fields.");
            return;
        }
        
        const selectedFarm = farmLocations.find(loc => loc.name === field);
        if (!selectedFarm) {
            alert("Invalid farm location selected.");
            return;
        }

        const submissionData = {
            cropName,
            variety,
            field,
            farmId: selectedFarm.id,
            plantingDate: parseDateString(plantingDate),
            harvestDate: parseDateString(harvestDate),
            landSize: parseFloat(landSize) || 0,
            landSizeUnit: 'Hectares' as const,
            avgYield: parseFloat(avgYield) || 0,
            avgYieldUnit: 'Tonnes' as const,
            expectedYield: expectedYield,
        }

        if (mode === 'edit' && initialData) {
            onSubmit({ ...submissionData, id: initialData.id });
        } else {
            onSubmit(submissionData);
        }

        onClose();
    };

    const title = mode === 'edit' ? 'Edit Crop Plan' : 'Add New Crop Plan';
    const buttonText = mode === 'edit' ? 'Save Changes' : 'Save Plan';

    return (
        <>
            <div className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose}></div>
            <aside className={`fixed top-0 right-0 h-full w-full max-w-lg bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="flex flex-col h-full">
                    <header className="p-6 border-b border-gray-200 flex items-center justify-between">
                        <h3 className="text-xl font-bold text-gray-800">{title}</h3>
                        <button onClick={onClose} className="p-1 rounded-full text-gray-500 hover:bg-gray-100"><CloseIcon /></button>
                    </header>
                    <form onSubmit={handleSubmit} className="flex-grow p-6 overflow-y-auto space-y-6">
                        {/* FIX: The FormField component requires a child element to be passed to avoid type errors. */}
                        <FormField label="Crop Name">
                             <select value={cropName} onChange={(e) => setCropName(e.target.value)} className={selectClasses} required>
                                <option value="" disabled>Select a crop</option>
                                {availableCrops.length > 0 ? (
                                    availableCrops.map(crop => <option key={crop} value={crop}>{crop}</option>)
                                ) : (
                                    <option value="" disabled>No crops selected in Settings</option>
                                )}
                            </select>
                        </FormField>
                         <FormField label="Variety (Optional)">
                            <input type="text" value={variety} onChange={(e) => setVariety(e.target.value)} className={inputClasses} placeholder="e.g., Oba Super 2" />
                        </FormField>
                        <FormField label="Field / Location">
                             <select value={field} onChange={(e) => setField(e.target.value)} className={selectClasses} required>
                                <option value="" disabled>Select a field</option>
                                {farmLocations.map(f => <option key={f.id} value={f.name}>{f.name} ({f.size} {f.unit})</option>)}
                            </select>
                        </FormField>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField label="Planting Date">
                                <input type="date" value={plantingDate} onChange={(e) => setPlantingDate(e.target.value)} className={inputClasses} required />
                            </FormField>
                            <FormField label="Estimated Harvest Date">
                                <input type="date" value={harvestDate} onChange={(e) => setHarvestDate(e.target.value)} className={inputClasses} required />
                            </FormField>
                        </div>

                        <div className="border-t pt-6 space-y-6">
                          <h4 className="text-md font-semibold text-gray-700">Land & Yield Details (Required)</h4>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                                <div>
                                    <FormField label="Land Size (Hectares)">
                                        <input type="number" step="0.01" min="0" value={landSize} onChange={e => setLandSize(e.target.value)} className={inputClasses} required/>
                                    </FormField>
                                    {sizeError && <p className="text-red-500 text-xs mt-1">{sizeError}</p>}
                                    {field && !sizeError && <p className="text-gray-500 text-xs mt-1">Available: {availableAreaInHectares.toFixed(2)} Ha</p>}
                                </div>
                                <div>
                                    <FormField label="Average Yield (Tonnes/Hectare)">
                                         <input type="number" step="0.01" min="0" value={avgYield} onChange={e => setAvgYield(e.target.value)} className={inputClasses} required/>
                                    </FormField>
                                </div>
                            </div>
                          
                          <div className="bg-gray-50 p-4 rounded-lg">
                              <p className="font-medium text-gray-600">Calculated Expected Yield</p>
                              <p className="text-2xl font-bold text-green-600">{expectedYield.toLocaleString(undefined, {maximumFractionDigits: 2})} Tonnes</p>
                          </div>
                        </div>


                        <div className="pt-4 border-t border-gray-200 flex justify-end">
                            <button 
                                type="submit"
                                disabled={!!sizeError || (parseFloat(avgYield) || 0) <= 0}
                                className="bg-green-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors shadow-sm flex items-center disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                {buttonText}
                            </button>
                        </div>
                    </form>
                </div>
            </aside>
        </>
    );
};

// --- View Components ---

const OverviewView = ({ plans, farmLocations }: { plans: CropPlan[], farmLocations: FarmLocation[] }) => {
    // --- Memoized Calculations ---
    const HECTARES_PER_ACRE = 0.404686;

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize for date comparisons

    const {
        activePlans,
        totalLandUsed,
        totalExpectedYieldTonnes,
        pendingTasks,
        upcomingHarvests,
        cropDistribution
    } = useMemo(() => {
        const active = plans.filter(p => {
            const plantingDate = new Date(p.plantingDate);
            const harvestDate = new Date(p.harvestDate);
            plantingDate.setHours(0,0,0,0);
            harvestDate.setHours(23,59,59,999);
            return today >= plantingDate && today <= harvestDate;
        });

        const landUsed = active.reduce((sum, p) => sum + p.landSize, 0);
        
        const yieldSum = active.reduce((sum, p) => sum + p.expectedYield, 0);

        const tasks = active.flatMap(p => p.tasks).filter(t => !t.completed).length;

        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(today.getDate() + 30);

        const harvests = plans
            .filter(p => {
                 const harvestDate = new Date(p.harvestDate);
                 harvestDate.setHours(0,0,0,0);
                 return harvestDate >= today && harvestDate <= thirtyDaysFromNow;
            })
            .sort((a,b) => a.harvestDate.getTime() - b.harvestDate.getTime())
            .slice(0, 5); // Take top 5

        const distribution = active.reduce((acc, p) => {
            acc[p.cropName] = (acc[p.cropName] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return {
            activePlans: active,
            totalLandUsed: landUsed,
            totalExpectedYieldTonnes: yieldSum,
            pendingTasks: tasks,
            upcomingHarvests: harvests,
            cropDistribution: Object.entries(distribution).sort((a,b) => b[1] - a[1]),
        };
    }, [plans]);

    const totalAvailableLand = useMemo(() => {
        // All farm locations are in Hectares
        return farmLocations.reduce((sum, loc) => sum + (parseFloat(loc.size) || 0), 0);
    }, [farmLocations]);
    
    const landUtilizationPercentage = totalAvailableLand > 0 ? (totalLandUsed / totalAvailableLand) * 100 : 0;

    // --- Sub-components for cleaner JSX ---
    const MetricCard = ({ title, value, icon, className = '' }: { title: string, value: string | number, icon: React.ReactNode, className?: string }) => (
        <div className={`bg-white p-4 rounded-xl shadow-sm border border-gray-200/80 flex items-center space-x-4 ${className}`}>
            <div className="bg-gray-100 p-3 rounded-lg text-blue-600">{icon}</div>
            <div>
                <p className="text-2xl font-bold text-gray-800">{value}</p>
                <p className="text-sm font-medium text-gray-500">{title}</p>
            </div>
        </div>
    );

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard title="Active Crop Plans" value={activePlans.length} icon={<ListIcon />} />
                <MetricCard title="Total Land in Use" value={`${totalLandUsed.toFixed(2)} Ha`} icon={<ChartPieIcon />} />
                <MetricCard title="Est. Yield (Tonnes)" value={totalExpectedYieldTonnes.toLocaleString()} icon={<IncomeIcon className="h-6 w-6"/>} />
                <MetricCard title="Pending Tasks" value={pendingTasks} icon={<ClipboardIcon className="h-6 w-6"/>} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-gray-200/80">
                    <h4 className="font-semibold text-gray-800 mb-4 text-lg">Land Utilization</h4>
                    <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                        <div className="bg-green-600 h-4 rounded-full" style={{ width: `${landUtilizationPercentage}%` }}></div>
                    </div>
                    <p className="text-center text-sm text-gray-600">
                        <span className="font-bold text-gray-800">{totalLandUsed.toFixed(2)}</span> of 
                        <span className="font-bold text-gray-800"> {totalAvailableLand.toFixed(2)}</span> Ha used ({landUtilizationPercentage.toFixed(1)}%)
                    </p>
                    
                    <h4 className="font-semibold text-gray-800 mt-8 mb-4 text-lg">Active Crops by Type</h4>
                    {cropDistribution.length > 0 ? (
                        <ul className="space-y-2">
                            {cropDistribution.map(([name, count]) => (
                                <li key={name} className="flex justify-between items-center text-sm">
                                    <span className="font-medium text-gray-700">{name}</span>
                                    <span className="font-bold text-gray-800 bg-gray-100 px-2 py-0.5 rounded-full">{count} plan(s)</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                         <p className="text-gray-500 text-sm text-center py-4">No active crops.</p>
                    )}
                </div>
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-200/80">
                    <h4 className="font-semibold text-gray-800 mb-4 text-lg">Upcoming Harvests (Next 30 Days)</h4>
                     {upcomingHarvests.length > 0 ? (
                        <ul className="space-y-4">
                            {upcomingHarvests.map(plan => (
                                <li key={plan.id} className="flex items-start space-x-3">
                                    <div className={`bg-green-100 p-2 rounded-lg flex flex-col items-center justify-center h-12 w-12 text-center`}>
                                        <span className="text-xs font-bold uppercase text-green-700">{new Date(plan.harvestDate).toLocaleString('default', { month: 'short' })}</span>
                                        <span className="text-lg font-bold text-green-800">{new Date(plan.harvestDate).getDate()}</span>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-800">{plan.cropName} - {plan.variety}</p>
                                        <p className="text-sm text-gray-500">{plan.field}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                     ) : (
                         <p className="text-gray-500 text-sm text-center py-8">No harvests scheduled in the next 30 days.</p>
                     )}
                </div>
            </div>
        </div>
    );
}

const TimelineView = ({ plans, onSelectPlan, fields, selectedYear }: { plans: CropPlan[], onSelectPlan: (plan: CropPlan) => void, fields: string[], selectedYear: number }) => {
    const currentDate = new Date();
    const yearLength = 365; // Simple assumption
    const todayIndicatorPosition = selectedYear === currentDate.getFullYear()
        ? (getDayOfYear(currentDate) / yearLength) * 100
        : -1;

    return (
        <div className="overflow-x-auto p-6">
            <div className="min-w-[1200px] relative">
                {/* Timeline Header */}
                <div className="grid grid-cols-12 gap-px text-center font-semibold text-sm text-gray-600 border-b-2 border-gray-200 pb-2">
                    {MONTHS.map(month => <div key={month}>{month}</div>)}
                </div>

                {/* Timeline Body */}
                <div className="relative pt-4 space-y-3">
                    {/* Today Indicator */}
                    {todayIndicatorPosition > -1 && (
                        <div className="absolute top-2 bottom-0 border-l-2 border-red-500 border-dashed z-20" style={{ left: `${todayIndicatorPosition}%` }}>
                            <span className="absolute -top-1 -translate-x-1/2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">TODAY</span>
                        </div>
                    )}

                    {/* Field Rows */}
                    {fields.map(field => (
                        <div key={field} className="relative h-16">
                            <p className="absolute -left-28 top-1/2 -translate-y-1/2 w-24 text-right text-sm font-medium text-gray-500 pr-2 truncate">{field}</p>
                            <div className="relative h-full border-t border-b border-gray-100">
                                {/* Month dividers */}
                                {MONTHS.map((_, index) => (
                                    <div key={index} className="absolute h-full border-l border-gray-100" style={{ left: `${(index / 12) * 100}%` }}></div>
                                ))}

                                {/* Crop Plan Bars */}
                                {plans.filter(p => p.field === field).map(plan => {
                                    const startDay = plan.plantingDate.getFullYear() === selectedYear ? getDayOfYear(plan.plantingDate) : 0;
                                    const endDay = plan.harvestDate.getFullYear() === selectedYear ? getDayOfYear(plan.harvestDate) : yearLength;
                                    const left = (startDay / yearLength) * 100;
                                    const width = Math.max(0, ((endDay - startDay) / yearLength) * 100);
                                    return (
                                        <div
                                            key={plan.id}
                                            className="group absolute top-1/2 -translate-y-1/2"
                                            style={{ left: `${left}%`, width: `${width}%` }}
                                        >
                                            <div
                                                onClick={() => onSelectPlan(plan)}
                                                className={`h-10 ${plan.color} rounded-lg cursor-pointer flex items-center px-3 text-white font-medium text-sm shadow-md hover:shadow-lg hover:brightness-110 transition-all duration-200 overflow-hidden`}
                                            >
                                                <span className="truncate">{plan.cropName}</span>
                                            </div>
                                            {/* Tooltip */}
                                            <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-max px-3 py-1 bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30">
                                                Click to update tasks
                                                {/* Tooltip Arrow */}
                                                <div className="absolute left-1/2 -translate-x-1/2 bottom-full w-0 h-0 border-x-[5px] border-x-transparent border-b-[5px] border-b-gray-800" />
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const ListView = ({ plans, onSelectPlan }: { plans: CropPlan[], onSelectPlan: (plan: CropPlan) => void }) => (
    <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                    <th scope="col" className="px-6 py-3">Crop Name</th>
                    <th scope="col" className="px-6 py-3">Field</th>
                    <th scope="col" className="px-6 py-3">Planting Date</th>
                    <th scope="col" className="px-6 py-3">Harvest Date</th>
                    <th scope="col" className="px-6 py-3">Land Size</th>
                    <th scope="col" className="px-6 py-3">Expected Yield</th>
                </tr>
            </thead>
            <tbody>
                {plans.map(plan => (
                    <tr key={plan.id} onClick={() => onSelectPlan(plan)} className="bg-white border-b hover:bg-gray-50 cursor-pointer">
                        <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                            <div className="flex items-center">
                                <div className={`w-3 h-3 rounded-full mr-3 ${plan.color}`}></div>
                                <div>
                                    {plan.cropName}
                                    <div className="text-xs text-gray-400 font-normal">{plan.variety}</div>
                                </div>
                            </div>
                        </th>
                        <td className="px-6 py-4">{plan.field}</td>
                        <td className="px-6 py-4">{plan.plantingDate.toLocaleDateString('en-GB')}</td>
                        <td className="px-6 py-4">{plan.harvestDate.toLocaleDateString('en-GB')}</td>
                        <td className="px-6 py-4 font-semibold">{plan.landSize.toFixed(2)} {plan.landSizeUnit}</td>
                        <td className="px-6 py-4 font-semibold">{plan.expectedYield.toLocaleString(undefined, { maximumFractionDigits: 2 })} {plan.avgYieldUnit}</td>
                    </tr>
                ))}
                {plans.length === 0 && (
                     <tr>
                        <td colSpan={6} className="text-center py-10 text-gray-500">
                            No crop plans to display.
                        </td>
                    </tr>
                )}
            </tbody>
        </table>
    </div>
);


const ViewToggleButton = ({ active, onClick, children, label }: { active: boolean; onClick: () => void; children: React.ReactNode; label: string; }) => (
    <button
        onClick={onClick}
        aria-label={label}
        className={`px-3 py-1.5 rounded-md text-sm font-semibold flex items-center space-x-2 transition-colors duration-200 ${
            active
                ? 'bg-white text-slate-700 shadow-sm'
                : 'bg-transparent text-slate-500 hover:bg-slate-300/50'
        }`}
    >
        {children}
        <span className={active ? 'inline' : 'hidden md:inline'}>{label}</span>
    </button>
);

// --- Activities Board Components (Kanban Style) ---
const ActivityFormPanel = ({ 
    isOpen,
    onClose,
    onSubmit,
    mode,
    initialData,
    farmLocations,
    selectedLocationId
}: {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: Omit<CroppingActivity, 'id' | 'status' | 'archived'>, id?: string) => void;
    mode: 'add' | 'edit';
    initialData: CroppingActivity | null;
    farmLocations: FarmLocation[];
    selectedLocationId: number | 'all';
}) => {
    const [formData, setFormData] = useState({ 
        title: '', 
        dueDate: formatDateForInput(new Date()), 
        assignee: '',
        farmId: selectedLocationId === 'all' ? (farmLocations[0]?.id || 1) : selectedLocationId,
    });
    
    useEffect(() => {
        if (isOpen) {
            if (mode === 'edit' && initialData) {
                setFormData({
                    title: initialData.title,
                    dueDate: formatDateForInput(initialData.dueDate),
                    assignee: initialData.assignee || '',
                    farmId: initialData.farmId || (selectedLocationId === 'all' ? (farmLocations[0]?.id || 1) : selectedLocationId),
                });
            } else {
                setFormData({ 
                    title: '', 
                    dueDate: formatDateForInput(new Date()), 
                    assignee: '',
                    farmId: selectedLocationId === 'all' ? (farmLocations[0]?.id || 1) : selectedLocationId,
                });
            }
        }
    }, [isOpen, mode, initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title) {
            alert('Please enter an activity title.');
            return;
        }
        onSubmit({ ...formData, dueDate: parseDateString(formData.dueDate) }, initialData?.id);
    };

    const title = mode === 'edit' ? 'Edit Activity' : 'Add New Activity';
    const buttonText = mode === 'edit' ? 'Save Changes' : 'Add Activity';

    return (
        <>
            <div className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose}></div>
            <aside className={`fixed top-0 right-0 h-full w-full max-w-lg bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <form onSubmit={handleSubmit} className="flex flex-col h-full">
                     <header className="p-6 border-b border-gray-200 flex items-center justify-between">
                        <h3 className="text-xl font-bold text-gray-800">{title}</h3>
                        <button type="button" onClick={onClose} className="p-1 rounded-full text-gray-500 hover:bg-gray-100"><CloseIcon /></button>
                    </header>
                    <div className="flex-grow p-6 overflow-y-auto space-y-6">
                        <FormField label="Activity Title">
                            <input type="text" name="title" value={formData.title} onChange={handleChange} className={inputClasses} required />
                        </FormField>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField label="Due Date">
                                <input type="date" name="dueDate" value={formData.dueDate} onChange={handleChange} className={inputClasses} required />
                            </FormField>
                            <FormField label="Assignee (Optional)">
                                <input type="text" name="assignee" value={formData.assignee} onChange={handleChange} className={inputClasses} placeholder="e.g., John Doe" />
                            </FormField>
                        </div>
                        <FormField label="Farm Location">
                            <select name="farmId" value={formData.farmId} onChange={handleChange} className={inputClasses} required>
                                {farmLocations.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
                            </select>
                        </FormField>
                    </div>
                     <footer className="p-6 border-t flex justify-end">
                        <button type="submit" className="bg-green-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors shadow-sm flex items-center">
                            {buttonText}
                        </button>
                    </footer>
                </form>
            </aside>
        </>
    );
};

const ActivityHistoryModal = ({ isOpen, onClose, activities }: {
    isOpen: boolean;
    onClose: () => void;
    activities: CroppingActivity[];
}) => {
    if (!isOpen) return null;

    const handlePrint = () => window.print();
    const archivedActivities = activities.filter(t => t.archived).sort((a,b) => b.dueDate.getTime() - a.dueDate.getTime());

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
             <div className="relative bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                <header className="flex items-center justify-between p-4 border-b no-print">
                    <h3 className="text-xl font-bold text-gray-800">Archived Activity History</h3>
                    <div className="flex items-center space-x-2">
                         <button
                            onClick={handlePrint}
                            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-sm"
                        >
                            <PrinterIcon /> <span>Print / Save as PDF</span>
                        </button>
                        <button onClick={onClose} title="Close" className="p-2 rounded-full text-gray-500 hover:bg-gray-100"><CloseIcon /></button>
                    </div>
                </header>
                <div className="overflow-y-auto printable-task-history">
                     <div className="p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Completed & Archived Activities</h2>
                        <table className="w-full text-left">
                            <thead className="border-b">
                                <tr>
                                    <th className="py-2 pr-4 text-sm font-semibold text-gray-600">Activity</th>
                                    <th className="py-2 px-4 text-sm font-semibold text-gray-600">Assignee</th>
                                    <th className="py-2 pl-4 text-sm font-semibold text-gray-600">Completed Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {archivedActivities.length > 0 ? archivedActivities.map(activity => (
                                    <tr key={activity.id} className="border-b">
                                        <td className="py-3 pr-4 font-medium text-gray-800">{activity.title}</td>
                                        <td className="py-3 px-4 text-gray-600">{activity.assignee || 'N/A'}</td>
                                        <td className="py-3 pl-4 text-gray-600">{activity.dueDate.toLocaleDateString('en-GB')}</td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan={3} className="text-center py-8 text-gray-500">No archived activities.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};


const ActivitiesBoardTab = ({ activities, onAdd, onEdit, onStatusChange, onArchive, onShowHistory }: { 
    activities: CroppingActivity[]; 
    onAdd: () => void;
    onEdit: (activity: CroppingActivity) => void;
    onStatusChange: (id: string, status: TaskStatus) => void;
    onArchive: (id: string) => void;
    onShowHistory: () => void;
}) => {
    const columns: Record<TaskStatus, CroppingActivity[]> = {
        'To Do': activities.filter(t => t.status === 'To Do' && !t.archived),
        'In Progress': activities.filter(t => t.status === 'In Progress' && !t.archived),
        'Done': activities.filter(t => t.status === 'Done' && !t.archived),
    };

    const StatusColumn = ({ title, tasks, color }: { title: TaskStatus, tasks: CroppingActivity[], color: string }) => (
        <div className={`bg-gray-100 p-4 rounded-lg flex-1 min-w-[300px]`}>
            <h4 className={`font-bold text-gray-700 mb-4 pb-2 border-b-2 ${color}`}>{title} ({tasks.length})</h4>
            <div className="space-y-3 h-[60vh] overflow-y-auto pr-2">
                {tasks.map(task => (
                    <div key={task.id} className="bg-white p-3 rounded-md shadow-sm border">
                        <p className="font-semibold text-gray-800">{task.title}</p>
                        <p className="text-xs text-gray-500 my-2 flex items-center"><CalendarIcon /> <span className="ml-1.5">{task.dueDate.toLocaleDateString('en-GB')}</span></p>
                        {task.assignee && <p className="text-xs text-blue-700 bg-blue-100 inline-block px-2 py-0.5 rounded-full">{task.assignee}</p>}
                        <div className="mt-3 pt-2 border-t flex justify-between items-center">
                             <select value={task.status} onChange={(e) => onStatusChange(task.id, e.target.value as TaskStatus)} className="text-xs border-gray-200 rounded">
                                <option>To Do</option>
                                <option>In Progress</option>
                                <option>Done</option>
                            </select>
                            <div className="space-x-1">
                                <button onClick={() => onEdit(task)} className="p-1 text-blue-600 hover:bg-blue-100 rounded-full"><EditIcon className="h-4 w-4"/></button>
                                {task.status === 'Done' && <button onClick={() => onArchive(task.id)} className="p-1 text-green-600 hover:bg-green-100 rounded-full" title="Archive Activity"><ArchiveIcon className="h-4 w-4" /></button>}
                            </div>
                        </div>
                    </div>
                ))}
                {tasks.length === 0 && <p className="text-sm text-gray-400 text-center pt-8">No activities in this column.</p>}
            </div>
        </div>
    );
    
    return (
        <div className="space-y-4">
             <div className="flex items-center justify-between mb-4 p-6 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-800">Cropping Activities Board</h3>
                <div className="flex items-center space-x-2">
                     <button onClick={onShowHistory} className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-50 transition-colors shadow-sm flex items-center">
                        <HistoryIcon /> <span className="ml-2 hidden sm:inline">History</span>
                    </button>
                    <button onClick={onAdd} className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors shadow-sm flex items-center">
                        <PlusIcon /> <span className="ml-2 hidden sm:inline">New Activity</span>
                    </button>
                </div>
            </div>
            <div className="p-6 flex space-x-4 overflow-x-auto">
                <StatusColumn title="To Do" tasks={columns['To Do']} color="border-red-500" />
                <StatusColumn title="In Progress" tasks={columns['In Progress']} color="border-yellow-500" />
                <StatusColumn title="Done" tasks={columns['Done']} color="border-green-500" />
            </div>
        </div>
    );
};


// --- Main Page Component ---
interface CroppingPlannerPageProps {
    setSidebarOpen: (isOpen: boolean) => void;
    availableCrops: string[];
    farmLocations: FarmLocation[];
    selectedLocationId: number | 'all';
    setSelectedLocationId: (id: number | 'all') => void;
    plans: CropPlan[];
    setPlans: React.Dispatch<React.SetStateAction<CropPlan[]>>;
    croppingActivities: CroppingActivity[];
    setCroppingActivities: React.Dispatch<React.SetStateAction<CroppingActivity[]>>;
    onAddActivity: (text: string, icon: string) => void;
}

const CroppingPlannerPage = ({ setSidebarOpen, availableCrops, farmLocations, selectedLocationId, setSelectedLocationId, plans, setPlans, croppingActivities, setCroppingActivities, onAddActivity }: CroppingPlannerPageProps) => {
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedPlan, setSelectedPlan] = useState<CropPlan | null>(null);
    const [isDetailPanelOpen, setIsDetailPanelOpen] = useState(false);
    const [isFormPanelOpen, setIsFormPanelOpen] = useState(false);
    const [formMode, setFormMode] = useState<FormMode>('add');
    const [editingPlan, setEditingPlan] = useState<CropPlan | null>(null);
    const [viewMode, setViewMode] = useState<ViewMode>('overview');

    const [isActivityFormOpen, setIsActivityFormOpen] = useState(false);
    const [editingActivity, setEditingActivity] = useState<CroppingActivity | null>(null);
    const [isActivityHistoryOpen, setIsActivityHistoryOpen] = useState(false);

    const filteredPlans = useMemo(() => {
        const yearFiltered = plans.filter(p => p.plantingDate.getFullYear() <= selectedYear && p.harvestDate.getFullYear() >= selectedYear);
        if (selectedLocationId === 'all') {
            return yearFiltered;
        }
        return yearFiltered.filter(p => p.farmId === selectedLocationId);
    }, [plans, selectedYear, selectedLocationId]);
    
    const fieldsForTimeline = useMemo(() => {
        if (selectedLocationId === 'all') {
            return [...new Set(farmLocations.map(f => f.name))].sort();
        }
        const locationName = farmLocations.find(loc => loc.id === selectedLocationId)?.name;
        return locationName ? [locationName] : [];
    }, [farmLocations, selectedLocationId]);

    const filteredActivities = useMemo(() => {
        if (selectedLocationId === 'all') {
            return croppingActivities;
        }
        return croppingActivities.filter(a => a.farmId === selectedLocationId || !a.farmId);
    }, [croppingActivities, selectedLocationId]);

    const handleSelectPlan = (plan: CropPlan) => {
        setSelectedPlan(plan);
        setIsDetailPanelOpen(true);
    };
    
    const handleCloseDetailPanel = () => {
        setIsDetailPanelOpen(false);
    };
    
    const handleFormSubmit = (planData: Omit<CropPlan, 'id' | 'color' | 'tasks' | 'currentStage'> & { id?: number }) => {
        if (formMode === 'edit' && planData.id) {
            // Update existing plan
            setPlans(prevPlans => prevPlans.map(p => p.id === planData.id ? { ...p, ...planData } : p));
        } else {
            // Add new plan
            const colors = ['bg-yellow-500', 'bg-amber-700', 'bg-lime-600', 'bg-sky-500', 'bg-fuchsia-500', 'bg-rose-500'];
            const newTasks = CROP_TASK_TEMPLATES[planData.cropName] || [];
            const newPlan: CropPlan = {
                id: Date.now(),
                ...planData,
                color: colors[Math.floor(Math.random() * colors.length)],
                currentStage: 0,
                tasks: newTasks,
            };
            setPlans(prevPlans => [...prevPlans, newPlan].sort((a,b) => a.plantingDate.getTime() - b.plantingDate.getTime()));
            onAddActivity(`Created a new cropping plan for ${planData.cropName}.`, 'eco');
        }
        setEditingPlan(null);
    };
    
    const handleEditRequest = (plan: CropPlan) => {
        setEditingPlan(plan);
        setFormMode('edit');
        setIsDetailPanelOpen(false);
        setIsFormPanelOpen(true);
    };

    const handleDeletePlan = (planId: number) => {
        if(window.confirm('Are you sure you want to delete this crop plan? This action cannot be undone.')){
            setPlans(prevPlans => prevPlans.filter(p => p.id !== planId));
            setIsDetailPanelOpen(false);
            setSelectedPlan(null);
        }
    }
    
    const handleUpdateTask = (planId: number, taskId: number, completed: boolean) => {
        if (completed) {
            const plan = plans.find(p => p.id === planId);
            const task = plan?.tasks.find(t => t.id === taskId);
            if (plan && task) {
                // Check if it's not already completed to avoid duplicate logs
                if (!task.completed) {
                    onAddActivity(`Completed task: "${task.name}" for ${plan.cropName}.`, 'assignment');
                }
            }
        }
        const updateLogic = (prevPlans: CropPlan[]) => {
            return prevPlans.map(p => {
                if (p.id !== planId) {
                    return p;
                }

                // Update the task's completion status first
                const newTasks = p.tasks.map(t => t.id === taskId ? { ...t, completed } : t);
                
                const updatedPlan = { ...p, tasks: newTasks };
                
                // If a task was marked as completed, check for stage advancement
                if (completed) {
                    const taskJustCompleted = newTasks.find(t => t.id === taskId);
                    // This should always be found, but as a safeguard:
                    if (!taskJustCompleted) return updatedPlan; 

                    const stageOfTask = taskJustCompleted.stageIndex;

                    // Only attempt to advance the stage if the completed task belongs to the plan's current stage
                    if (stageOfTask === updatedPlan.currentStage) {
                        const tasksForCurrentStage = newTasks.filter(t => t.stageIndex === stageOfTask);
                        const allTasksInStageComplete = tasksForCurrentStage.every(t => t.completed);

                        // If all tasks for the current stage are complete, and it's not the final stage
                        if (allTasksInStageComplete && updatedPlan.currentStage < STAGES.length - 1) {
                            updatedPlan.currentStage += 1; // Advance to the next stage
                        }
                    }
                }
                
                return updatedPlan;
            });
        };

        setPlans(updateLogic);

        // Also update the selected plan in the detail panel if it's open
        if (selectedPlan && selectedPlan.id === planId) {
            setSelectedPlan(prev => prev ? updateLogic([prev])[0] : null);
        }
    };

    const openAddPanel = () => {
        setEditingPlan(null);
        setFormMode('add');
        setIsFormPanelOpen(true);
    }

    const handleActivityFormSubmit = (data: Omit<CroppingActivity, 'id' | 'status' | 'archived'>, id?: string) => {
        if (id) {
            setCroppingActivities(prev => prev.map(a => a.id === id ? { ...a, ...data, farmId: Number((data as any).farmId) } : a));
        } else {
            const newActivity: CroppingActivity = {
                id: `CROP-ACT-${Date.now()}`,
                ...data,
                farmId: Number((data as any).farmId),
                status: 'To Do',
                archived: false,
            };
            setCroppingActivities(prev => [newActivity, ...prev]);
        }
        setIsActivityFormOpen(false);
    };

    const handleActivityStatusChange = (id: string, status: TaskStatus) => {
        const activity = croppingActivities.find(a => a.id === id);
        if (activity && activity.status !== 'Done' && status === 'Done') {
            onAddActivity(`Completed cropping activity: "${activity.title}".`, 'assignment');
        }
        setCroppingActivities(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    };

    const handleArchiveActivity = (id: string) => {
        setCroppingActivities(prev => prev.map(a => a.id === id ? { ...a, archived: true } : a));
    };


    const handleExportCSV = () => {
        const headers = [
            'ID', 'Crop Name', 'Variety', 'Field', 'Planting Date', 'Harvest Date',
            'Land Size', 'Land Size Unit', 'Avg Yield/Ha', 'Avg Yield Unit', 'Expected Yield'
        ];
        const rows = plans.map(p => {
            return [
                p.id,
                p.cropName,
                p.variety,
                p.field,
                p.plantingDate.toLocaleDateString('en-GB'),
                p.harvestDate.toLocaleDateString('en-GB'),
                p.landSize,
                p.landSizeUnit,
                p.avgYield,
                p.avgYieldUnit,
                p.expectedYield
            ].map(val => `"${String(val ?? '').replace(/"/g, '""')}"`).join(',');
        });

        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
        const link = document.createElement('a');
        link.setAttribute('href', encodeURI(csvContent));
        link.setAttribute('download', `cropping_plan_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <main className="flex-1 w-full p-4 md:p-6 lg:p-8 bg-slate-100 overflow-y-auto">
            <header className="mb-8 flex items-center justify-between flex-wrap gap-4">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-700">Cropping Planner</h2>
                <div className="flex items-center space-x-2 sm:space-x-4">
                     <select
                        id="location-filter"
                        value={selectedLocationId}
                        onChange={(e) => setSelectedLocationId(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                        className="text-sm font-semibold text-gray-600 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500 p-2"
                    >
                        <option value="all">All Locations</option>
                        {farmLocations.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
                    </select>

                     <div className="flex items-center space-x-1 bg-slate-200 p-1 rounded-lg">
                        {/* FIX: The ViewToggleButton component requires a child element (icon) to be passed to fix a type error. */}
                        <ViewToggleButton active={viewMode === 'overview'} onClick={() => setViewMode('overview')} label="Overview"><ChartPieIcon /></ViewToggleButton>
                        <ViewToggleButton active={viewMode === 'timeline'} onClick={() => setViewMode('timeline')} label="Timeline"><TimelineIcon /></ViewToggleButton>
                        <ViewToggleButton active={viewMode === 'list'} onClick={() => setViewMode('list')} label="List"><ListIcon /></ViewToggleButton>
                        <ViewToggleButton active={viewMode === 'tasks'} onClick={() => setViewMode('tasks')} label="Tasks"><ClipboardIcon /></ViewToggleButton>
                    </div>
                     {viewMode === 'list' && (
                        <button
                            onClick={handleExportCSV}
                            className="bg-white border border-gray-300 text-gray-700 px-3 sm:px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors shadow-sm flex items-center"
                        >
                            <DownloadIcon className="h-5 w-5" /> <span className="ml-2 hidden sm:inline">Export CSV</span>
                        </button>
                    )}
                     <button 
                        onClick={openAddPanel}
                        className="bg-green-600 text-white px-3 sm:px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors shadow-sm flex items-center"
                    >
                        <PlusIcon /> <span className="ml-2 hidden sm:inline">Add Plan</span>
                    </button>
                    {viewMode === 'timeline' && (
                        <select 
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                            className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-gray-700 bg-white"
                        >
                            <option>2025</option>
                            <option>2024</option>
                            <option>2023</option>
                        </select>
                    )}
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-200 md:hidden"
                        aria-label="Open sidebar"
                    >
                        <MenuIcon />
                    </button>
                </div>
            </header>

            <div className={viewMode !== 'overview' ? "bg-white rounded-xl shadow-md" : ""}>
                {viewMode === 'overview' && <OverviewView plans={filteredPlans} farmLocations={farmLocations} />}
                {viewMode === 'timeline' && <TimelineView plans={filteredPlans} onSelectPlan={handleSelectPlan} fields={fieldsForTimeline} selectedYear={selectedYear}/>}
                {viewMode === 'list' && <ListView plans={filteredPlans.sort((a,b) => a.plantingDate.getTime() - b.plantingDate.getTime())} onSelectPlan={handleSelectPlan} />}
                {viewMode === 'tasks' && <ActivitiesBoardTab 
                                            activities={filteredActivities}
                                            onAdd={() => { setEditingActivity(null); setIsActivityFormOpen(true); }}
                                            onEdit={(activity) => { setEditingActivity(activity); setIsActivityFormOpen(true); }}
                                            onStatusChange={handleActivityStatusChange}
                                            onArchive={handleArchiveActivity}
                                            onShowHistory={() => setIsActivityHistoryOpen(true)}
                                        />}
            </div>
            
            <DetailPanel 
                plan={selectedPlan} 
                isOpen={isDetailPanelOpen} 
                onClose={handleCloseDetailPanel} 
                onUpdateTask={handleUpdateTask} 
                onEdit={handleEditRequest}
                onDelete={handleDeletePlan}
            />

            <PlanFormPanel 
                isOpen={isFormPanelOpen}
                onClose={() => setIsFormPanelOpen(false)}
                onSubmit={handleFormSubmit}
                mode={formMode}
                initialData={editingPlan}
                farmLocations={farmLocations}
                availableCrops={availableCrops}
                plans={plans}
            />

            <ActivityFormPanel 
                isOpen={isActivityFormOpen}
                onClose={() => setIsActivityFormOpen(false)}
                onSubmit={handleActivityFormSubmit}
                mode={editingActivity ? 'edit' : 'add'}
                initialData={editingActivity}
                farmLocations={farmLocations}
                selectedLocationId={selectedLocationId}
            />

            <ActivityHistoryModal 
                isOpen={isActivityHistoryOpen}
                onClose={() => setIsActivityHistoryOpen(false)}
                activities={filteredActivities}
            />

        </main>
    );
};

export default CroppingPlannerPage;
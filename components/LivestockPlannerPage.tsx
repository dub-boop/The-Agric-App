import React, { useState, useMemo, useEffect } from 'react';
import { MenuIcon, PlusIcon, EditIcon, TrashIcon, BullIcon, WarningIcon, HEALTH_EVENTS, BREEDING_RECORDS, LIVESTOCK_TASKS, LIVESTOCK_PLANNER_TABS, ArrowLeftIcon, ArrowRightIcon, HeartIcon, CloseIcon, LIVESTOCK_CATEGORIES, StethoscopeIcon, ClipboardIcon, ViewIcon, PrinterIcon, ArchiveIcon, HistoryIcon, GESTATION_PERIODS, CalendarIcon, DownloadIcon, CheckIcon, LivestockPlannerIcon } from '../constants';
import type { LivestockRecord, HealthEvent, BreedingRecord, LivestockTask, HealthStatus, LivestockTrackingType, IndividualAnimal, BatchAnimal, TaskStatus, AffectedAnimal, FarmLocation } from '../types';

// --- Helper Functions ---
const formatDateForInput = (date: Date): string => {
    return date.toISOString().split('T')[0];
}

const parseDateString = (dateString: string): Date => {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
};

// --- Form Data Types ---
type AnimalFormData = {
    id?: string; // Tag number for individuals
    species?: string;
    location?: string;
    farmId?: number;
    trackingType?: LivestockTrackingType;
    variety?: string;
    source?: string;
    sex?: 'Male' | 'Female';
    sireId?: string;
    damId?: string;
    // Individual
    name?: string; // Optional familiar name
    age?: number;
    weight?: number;
    // Batch
    batchName?: string;
    quantity?: number;
    acquisitionDate?: Date | string; 
};

type HealthEventFormData = Omit<HealthEvent, 'id' | 'date'> & {
    date: string;
    newStatus?: HealthStatus; // Optional field to update animal status
};

type TaskFormData = Omit<LivestockTask, 'id' | 'dueDate' | 'status' | 'archived'> & {
    dueDate: string;
};

type OffspringFormData = {
    formId: number; // Unique ID for the form field, not the animal
    id: string; // The user-inputted Tag Number for the new animal
    name: string;
    sex: 'Male' | 'Female';
    weight: string;
}

type BreedingFormData = Pick<BreedingRecord, 'sireId' | 'damId' | 'pairingDate' | 'farmId'>;


// --- Reusable Components ---
const MetricCard = ({ title, value, icon, color, description }: { title: string, value: string | number, icon: React.ReactNode, color: string, description?: string }) => (
    <div className={`p-6 rounded-xl shadow-md flex flex-col justify-between ${color}`}>
        <div className="flex items-center space-x-4">
            {icon}
            <div>
                <p className="text-3xl font-bold">{value}</p>
                <h4 className="font-semibold">{title}</h4>
            </div>
        </div>
        {description && <p className="text-sm mt-2 opacity-90">{description}</p>}
    </div>
);

const inputClasses = "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-gray-700 bg-gray-50";

const FormField = ({ label, children }: { label: string, children: React.ReactNode }) => (
    <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
        {children}
    </div>
);

// --- Form Panels ---

const AnimalFormPanel = ({
    isOpen,
    onClose,
    onSubmit,
    mode,
    initialData,
    availableSpecies,
    animals,
    farmLocations,
    selectedLocationId
}: {
    isOpen: boolean,
    onClose: () => void,
    onSubmit: (data: AnimalFormData) => void,
    mode: 'add' | 'edit',
    initialData: LivestockRecord | null,
    availableSpecies: string[],
    animals: LivestockRecord[],
    farmLocations: FarmLocation[],
    selectedLocationId: number | 'all'
}) => {
    const [species, setSpecies] = useState(availableSpecies[0] || '');
    const [trackingType, setTrackingType] = useState<LivestockTrackingType | null>(null);
    const [formData, setFormData] = useState<AnimalFormData>({});

    const resetForm = (selectedSpecies: string) => {
        const type = LIVESTOCK_CATEGORIES[selectedSpecies] || 'INDIVIDUAL';
        setSpecies(selectedSpecies);
        setTrackingType(type);
        setFormData({
            id: type === 'BATCH' ? `${selectedSpecies.substring(0,2).toUpperCase()}${Date.now().toString().slice(-4)}` : '',
            species: selectedSpecies,
            farmId: selectedLocationId === 'all' ? (farmLocations[0]?.id || 1) : selectedLocationId,
            trackingType: type,
            location: '',
            variety: '',
            source: '',
            sex: 'Female',
            sireId: '',
            damId: '',
            name: '',
            age: 0,
            weight: 0,
            batchName: '',
            quantity: 1,
            acquisitionDate: new Date(),
        });
    }

    useEffect(() => {
        if (isOpen) {
            if (mode === 'edit' && initialData) {
                const type = LIVESTOCK_CATEGORIES[initialData.species] || 'INDIVIDUAL';
                setSpecies(initialData.species);
                setTrackingType(type);
                
                const dataToEdit: AnimalFormData = { ...initialData };
                if(initialData.trackingType === 'BATCH' && initialData.acquisitionDate){
                    dataToEdit.acquisitionDate = initialData.acquisitionDate
                }
                setFormData(dataToEdit);
            } else {
                const defaultSpecies = availableSpecies[0] || '';
                resetForm(defaultSpecies);
            }
        }
    }, [isOpen, mode, initialData, availableSpecies]);

    const handleSpeciesChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newSpecies = e.target.value;
        resetForm(newSpecies);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const isNumber = type === 'number';
        setFormData(prev => ({ ...prev, [name]: isNumber ? Number(value) : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (formData.trackingType === 'INDIVIDUAL') {
            if (!formData.id) {
                 alert("Tag Number is required.");
                 return;
            }
            if (mode === 'add' && animals.some(a => a.id.toLowerCase() === formData.id!.toLowerCase())) {
                alert("This Tag Number already exists. Please use a unique one.");
                return;
            }
        }

        const finalData: AnimalFormData = { ...formData };
        if (trackingType === 'BATCH' && typeof finalData.acquisitionDate === 'string') {
           finalData.acquisitionDate = parseDateString(finalData.acquisitionDate);
        }

        onSubmit(finalData);
    };

    const getDisplayName = (animal: IndividualAnimal) => {
        return `${animal.id}${animal.name ? ` (${animal.name})` : ''}`;
    }

    const availableSires = useMemo(() =>
        animals.filter(a =>
            a.trackingType === 'INDIVIDUAL' &&
            a.sex === 'Male' &&
            a.species === species &&
            a.id !== initialData?.id
        ) as IndividualAnimal[],
        [animals, species, initialData]
    );

    const availableDams = useMemo(() =>
        animals.filter(a =>
            a.trackingType === 'INDIVIDUAL' &&
            a.sex === 'Female' &&
            a.species === species &&
            a.id !== initialData?.id
        ) as IndividualAnimal[],
        [animals, species, initialData]
    );

    const title = mode === 'edit' ? 'Edit Record' : 'Add New Record';
    const buttonText = mode === 'edit' ? 'Save Changes' : 'Save Record';

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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField label="Species">
                                <select name="species" value={species} onChange={handleSpeciesChange} className={inputClasses} required disabled={availableSpecies.length === 0 || mode === 'edit'}>
                                    {availableSpecies.length > 0 ? (
                                        availableSpecies.map(s => <option key={s} value={s}>{s}</option>)
                                    ) : (
                                        <option value="" disabled>Go to Settings to add livestock types</option>
                                    )}
                                </select>
                            </FormField>
                            <FormField label="Farm Location">
                                <select name="farmId" value={formData.farmId} onChange={handleChange} className={inputClasses} required>
                                    {farmLocations.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
                                </select>
                            </FormField>
                        </div>
                        
                        {trackingType === 'INDIVIDUAL' && (
                            <>
                                <FormField label="Tag Number">
                                    <input type="text" name="id" value={formData.id || ''} onChange={handleChange} className={inputClasses} placeholder="e.g., NGA-34-001-1234" required disabled={mode === 'edit'} />
                                </FormField>
                                <FormField label="Name (Optional)">
                                    <input type="text" name="name" value={formData.name || ''} onChange={handleChange} className={inputClasses} placeholder="e.g., Bessie" />
                                </FormField>
                            </>
                        )}
                        
                        <FormField label="Variety (Optional)">
                            <input type="text" name="variety" value={formData.variety || ''} onChange={handleChange} className={inputClasses} placeholder="e.g., Holstein, Cobb 500" />
                        </FormField>

                        <FormField label="Source/Vendor (Optional)">
                            <input type="text" name="source" value={formData.source || ''} onChange={handleChange} className={inputClasses} placeholder="e.g., Local Market, Self-bred" />
                        </FormField>

                        {trackingType === 'INDIVIDUAL' && (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <FormField label="Age (months)">
                                        <input type="number" name="age" value={formData.age || 0} onChange={handleChange} className={inputClasses} required />
                                    </FormField>
                                    <FormField label="Weight (kg)">
                                        <input type="number" name="weight" value={formData.weight || 0} onChange={handleChange} className={inputClasses} required />
                                    </FormField>
                                    <FormField label="Sex">
                                        <select name="sex" value={formData.sex} onChange={handleChange} className={inputClasses} required>
                                            <option>Female</option>
                                            <option>Male</option>
                                        </select>
                                    </FormField>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField label="Sire (Optional)">
                                        <select name="sireId" value={formData.sireId || ''} onChange={handleChange} className={inputClasses}>
                                            <option value="">Unknown</option>
                                            {availableSires.map(s => <option key={s.id} value={s.id}>{getDisplayName(s)}</option>)}
                                        </select>
                                    </FormField>
                                    <FormField label="Dam (Optional)">
                                        <select name="damId" value={formData.damId || ''} onChange={handleChange} className={inputClasses}>
                                            <option value="">Unknown</option>
                                            {availableDams.map(d => <option key={d.id} value={d.id}>{getDisplayName(d)}</option>)}
                                        </select>
                                    </FormField>
                                </div>
                            </>
                        )}

                        {trackingType === 'BATCH' && (
                            <>
                                <FormField label="Batch Name">
                                    <input type="text" name="batchName" value={formData.batchName || ''} onChange={handleChange} className={inputClasses} placeholder="e.g., Broilers Batch #1" required />
                                </FormField>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField label="Quantity">
                                        <input type="number" name="quantity" value={formData.quantity || 1} onChange={handleChange} className={inputClasses} required />
                                    </FormField>
                                    <FormField label="Acquisition Date">
                                         <input type="date" name="acquisitionDate" value={formData.acquisitionDate ? formatDateForInput(new Date(formData.acquisitionDate)) : ''} onChange={handleChange} className={inputClasses} required />
                                    </FormField>
                                </div>
                            </>
                        )}
                        
                         <FormField label="Location (Pen/Pasture/Pond)">
                            <input type="text" name="location" value={formData.location || ''} onChange={handleChange} className={inputClasses} placeholder="e.g., Pasture A" required />
                        </FormField>
                        <div className="pt-4 border-t border-gray-200 flex justify-end">
                            <button type="submit" className="bg-green-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors shadow-sm flex items-center">
                                {buttonText}
                            </button>
                        </div>
                    </form>
                </div>
            </aside>
        </>
    );
};

const HealthEventFormPanel = ({ 
    isOpen, 
    onClose, 
    onSubmit, 
    allAnimals,
    mode,
    initialData,
}: { 
    isOpen: boolean; 
    onClose: () => void; 
    onSubmit: (data: HealthEventFormData) => void; 
    allAnimals: LivestockRecord[];
    mode: 'add' | 'edit';
    initialData: HealthEvent | null;
}) => {
    const [formData, setFormData] = useState<Omit<HealthEventFormData, 'animals'>>({
        type: 'Treatment',
        date: formatDateForInput(new Date()),
        description: '',
        newStatus: undefined,
    });
    const [selectedAnimals, setSelectedAnimals] = useState<Record<string, { count?: number; weight?: string }>>({});
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (mode === 'edit' && initialData) {
                // Pre-populate form for editing
                setFormData({
                    type: initialData.type,
                    date: formatDateForInput(initialData.date),
                    description: initialData.description,
                    newStatus: initialData.newStatus,
                });
                const initialSelection = initialData.animals.reduce((acc, aff) => {
                    acc[aff.animalId] = {
                        count: aff.affectedCount,
                        weight: aff.weight?.toString(),
                    };
                    return acc;
                }, {} as Record<string, { count?: number; weight?: string }>);
                setSelectedAnimals(initialSelection);
                setSearchTerm('');
            } else {
                // Reset form for adding
                setFormData({
                    type: 'Treatment',
                    date: formatDateForInput(new Date()),
                    description: '',
                    newStatus: undefined,
                });
                setSelectedAnimals({});
                setSearchTerm('');
            }
        }
    }, [isOpen, mode, initialData]);

    // Effect to auto-update status when event type is 'Dead'
    useEffect(() => {
        if (formData.type === 'Dead') {
            setFormData(prev => ({ ...prev, newStatus: 'Dead', description: prev.description || 'Animal(s) recorded as deceased.' }));
        } else if (formData.type !== 'Treatment' && formData.type !== 'Vaccination') {
            setFormData(prev => ({...prev, newStatus: undefined}));
        }
    }, [formData.type]);

    const getDisplayName = (animal: LivestockRecord) => {
        if (animal.trackingType === 'INDIVIDUAL') {
            return `${animal.id}${animal.name ? ` (${animal.name})` : ''}`;
        }
        return animal.batchName;
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAnimalSelect = (animal: LivestockRecord) => {
        if (animal.trackingType === 'INDIVIDUAL' && animal.healthStatus === 'Dead') return;

        setSelectedAnimals(prev => {
            const newSelection = { ...prev };
            if (newSelection[animal.id]) {
                delete newSelection[animal.id];
            } else {
                newSelection[animal.id] = {};
                if (animal.trackingType === 'BATCH') {
                    newSelection[animal.id].count = animal.quantity;
                }
            }
            return newSelection;
        });
    };

    const handleCountChange = (id: string, value: string, max: number) => {
        const count = Math.max(1, Math.min(max, Number(value) || 0));
        setSelectedAnimals(prev => ({
            ...prev,
            [id]: { ...prev[id], count }
        }));
    };
    
    const handleWeightChange = (id: string, value: string) => {
        setSelectedAnimals(prev => ({
            ...prev,
            [id]: { ...prev[id], weight: value }
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const animalIds = Object.keys(selectedAnimals);
        if (animalIds.length === 0) {
            alert('Please select at least one animal or batch.');
            return;
        }
        
        const animalsPayload: AffectedAnimal[] = animalIds.map(id => ({
            animalId: id,
            affectedCount: selectedAnimals[id]?.count,
            weight: selectedAnimals[id]?.weight ? parseFloat(selectedAnimals[id].weight!) : undefined,
        }));
        
        onSubmit({ ...formData, animals: animalsPayload });
        onClose();
    };

    const filteredAnimals = allAnimals.filter(animal => {
        if (animal.trackingType === 'INDIVIDUAL' && animal.healthStatus === 'Dead') return false;
        const name = animal.trackingType === 'INDIVIDUAL' ? `${animal.id} ${animal.name || ''}` : animal.batchName;
        return name.toLowerCase().includes(searchTerm.toLowerCase());
    });
    
    const showStatusUpdate = formData.type === 'Treatment' || formData.type === 'Vaccination' || formData.type === 'Dead';
    
    const getStatusUpdateLabel = () => {
        // FIX: Operator '>' cannot be applied to types 'Date' and 'Date'. Use getTime() for comparison.
        const isFuture = parseDateString(formData.date).getTime() > new Date().getTime();
        const actionWord = isFuture ? 'Schedule status update' : 'Update health status';
        switch (formData.type) {
            case 'Treatment':
                return `${actionWord} for selected animals to:`;
            case 'Vaccination':
                return isFuture ? "Schedule marking selected as 'Vaccinated'?" : "Mark selected as 'Vaccinated'?";
            case 'Dead':
                return "This will mark selected animals as 'Dead'.";
            default:
                return '';
        }
    };
    const statusUpdateLabel = getStatusUpdateLabel();
        
    const statusUpdateControl = () => {
        switch(formData.type) {
            case 'Treatment':
                return (
                    <select name="newStatus" value={formData.newStatus || ''} onChange={handleChange} className={inputClasses}>
                        <option value="">Don't Change</option>
                        <option value="Healthy">Healthy</option>
                        <option value="Sick">Sick</option>
                        <option value="Quarantined">Quarantined</option>
                        <option value="Dead">Dead</option>
                    </select>
                );
            case 'Vaccination':
                return (
                    <input
                        type="checkbox"
                        className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        checked={formData.newStatus === 'Vaccinated'}
                        onChange={(e) => setFormData(prev => ({...prev, newStatus: e.target.checked ? 'Vaccinated' : undefined}))}
                    />
                );
            case 'Dead':
                return (
                    <select value="Dead" className={`${inputClasses} bg-gray-200 cursor-not-allowed`} disabled>
                        <option value="Dead">Dead</option>
                    </select>
                );
            default:
                return null;
        }
    };
        
    const title = mode === 'edit' ? 'Edit Health Event' : 'Log or Schedule Health Event';
    const buttonText = mode === 'edit' ? 'Save Changes' : 'Save Event';

    return (
        <>
            <div className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose}></div>
            <aside className={`fixed top-0 right-0 h-full w-full max-w-2xl bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <form onSubmit={handleSubmit} className="flex flex-col h-full">
                    <header className="p-6 border-b border-gray-200 flex items-center justify-between">
                        <h3 className="text-xl font-bold text-gray-800">{title}</h3>
                        <button type="button" onClick={onClose} className="p-1 rounded-full text-gray-500 hover:bg-gray-100"><CloseIcon /></button>
                    </header>
                    <div className="flex-grow p-6 overflow-y-auto space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField label="Event Type">
                                <select name="type" value={formData.type} onChange={handleChange} className={inputClasses}>
                                    <option>Treatment</option>
                                    <option>Vaccination</option>
                                    <option>Deworming</option>
                                    <option>Check-up</option>
                                    <option>Weighing</option>
                                    <option>Dead</option>
                                </select>
                            </FormField>
                            <FormField label="Date">
                                <input type="date" name="date" value={formData.date} onChange={handleChange} className={inputClasses} />
                            </FormField>
                        </div>
                        <FormField label="Description / Notes">
                            <textarea name="description" value={formData.description} onChange={handleChange} className={inputClasses} rows={3} placeholder="e.g., Administered Ivermectin dose"></textarea>
                        </FormField>
                        
                         {showStatusUpdate && (
                            <FormField label={statusUpdateLabel}>
                                {statusUpdateControl()}
                            </FormField>
                        )}

                        <div className="border-t pt-4">
                            <h4 className="font-semibold text-gray-700 mb-2">Select Affected Animals/Batches</h4>
                            <input type="text" placeholder="Search by tag, name, or batch..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={`${inputClasses} mb-4`} />
                            <div className="max-h-60 overflow-y-auto border rounded-md p-2 space-y-2">
                                {filteredAnimals.map(animal => (
                                    <div key={animal.id} className="p-2 rounded-md hover:bg-gray-50">
                                        <div className="flex items-center justify-between">
                                            <label htmlFor={`select-${animal.id}`} className="flex items-center flex-grow cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    id={`select-${animal.id}`}
                                                    checked={!!selectedAnimals[animal.id]}
                                                    onChange={() => handleAnimalSelect(animal)}
                                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                />
                                                <span className="ml-3 font-medium text-gray-800">{getDisplayName(animal)}</span>
                                            </label>
                                            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{animal.species}</span>
                                        </div>
                                        {animal.trackingType === 'BATCH' && selectedAnimals[animal.id] && (
                                            <div className="pl-8 pt-2 flex items-center space-x-2">
                                                <label htmlFor={`count-${animal.id}`} className="text-sm font-medium text-gray-600">Affected Count:</label>
                                                <input
                                                    type="number"
                                                    id={`count-${animal.id}`}
                                                    value={selectedAnimals[animal.id].count || ''}
                                                    onChange={(e) => handleCountChange(animal.id, e.target.value, animal.quantity)}
                                                    max={animal.quantity}
                                                    min={1}
                                                    className={`${inputClasses} !w-24 text-sm`}
                                                />
                                                <span className="text-sm text-gray-500">of {animal.quantity}</span>
                                            </div>
                                        )}
                                        {formData.type === 'Weighing' && selectedAnimals[animal.id] && (
                                            <div className="pl-8 pt-2 flex items-center space-x-2">
                                                <label htmlFor={`weight-${animal.id}`} className="text-sm font-medium text-gray-600">New Weight (kg):</label>
                                                <input
                                                    type="number"
                                                    id={`weight-${animal.id}`}
                                                    step="0.1"
                                                    value={selectedAnimals[animal.id].weight || ''}
                                                    onChange={(e) => handleWeightChange(animal.id, e.target.value)}
                                                    className={`${inputClasses} !w-24 text-sm`}
                                                    required
                                                />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
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

const HealthEventDetailModal = ({ isOpen, onClose, event, allAnimals }: {
    isOpen: boolean;
    onClose: () => void;
    event: HealthEvent | null;
    allAnimals: LivestockRecord[];
}) => {
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    if (!isOpen || !event) return null;

    const handlePrint = () => {
        window.print();
    };

    const getAnimalDetails = (id: string) => allAnimals.find(a => a.id === id);
    const getDisplayName = (animal: LivestockRecord) => {
        if (animal.trackingType === 'INDIVIDUAL') {
            return `${animal.id}${animal.name ? ` (${animal.name})` : ''}`;
        }
        return animal.batchName;
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
            <div className="relative bg-white rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
                {/* Header with actions */}
                <header className="flex items-center justify-between p-4 border-b no-print">
                    <h3 className="text-xl font-bold text-gray-800">Health Event Details</h3>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={handlePrint}
                            title="Print Record"
                            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-sm"
                        >
                            <PrinterIcon className="h-5 w-5" />
                            <span>Print / Save as PDF</span>
                        </button>
                        <button onClick={onClose} title="Close" className="p-2 rounded-full text-gray-500 hover:bg-gray-100"><CloseIcon /></button>
                    </div>
                </header>

                {/* Printable Content */}
                <div className="overflow-y-auto printable-area">
                    <div className="p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Health Event Record</h2>
                        <p className="text-gray-500 mb-6">Record ID: {event.id}</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 text-base">
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-sm font-medium text-gray-500">Event Type</p>
                                <p className="font-semibold text-gray-800">{event.type}</p>
                            </div>
                             <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-sm font-medium text-gray-500">Date</p>
                                <p className="font-semibold text-gray-800">{event.date.toLocaleDateString('en-GB')}</p>
                            </div>
                        </div>

                        <div className="mb-8">
                            <p className="text-sm font-medium text-gray-500">Description / Notes</p>
                            <p className="text-gray-800 mt-1">{event.description || 'N/A'}</p>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Affected Animals & Batches</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="border-b">
                                        <tr>
                                            <th className="py-2 pr-4 text-sm font-semibold text-gray-600">Tag / Batch</th>
                                            <th className="py-2 px-4 text-sm font-semibold text-gray-600">Species</th>
                                            <th className="py-2 pl-4 text-sm font-semibold text-gray-600">Type</th>
                                            <th className="py-2 pl-4 text-sm font-semibold text-gray-600 text-right">Count</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {event.animals.map(affected => {
                                            const animal = getAnimalDetails(affected.animalId);
                                            if (!animal) return null;
                                            const isBatch = animal.trackingType === 'BATCH';
                                            const name = getDisplayName(animal);
                                            const count = isBatch ? affected.affectedCount || 'N/A' : 1;

                                            return (
                                                <tr key={animal.id} className="border-b">
                                                    <td className="py-3 pr-4 font-medium text-gray-800">{name}</td>
                                                    <td className="py-3 px-4 text-gray-600">{animal.species}</td>
                                                    <td className="py-3 pl-4 text-gray-600">{animal.trackingType}</td>
                                                    <td className="py-3 pl-4 text-gray-800 text-right font-medium">{count}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const TaskFormPanel = ({ 
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
    onSubmit: (data: TaskFormData, id?: string) => void;
    mode: 'add' | 'edit';
    initialData: LivestockTask | null;
    farmLocations: FarmLocation[];
    selectedLocationId: number | 'all';
}) => {
    const [formData, setFormData] = useState<TaskFormData & { farmId?: number }>({ 
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
                    farmId: initialData.farmId,
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
            alert('Please enter a task title.');
            return;
        }
        onSubmit(formData, initialData?.id);
    };

    const title = mode === 'edit' ? 'Edit Task' : 'Add New Task';
    const buttonText = mode === 'edit' ? 'Save Changes' : 'Add Task';

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
                        <FormField label="Task Title">
                            <input type="text" name="title" value={formData.title} onChange={handleChange} className={inputClasses} required />
                        </FormField>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField label="Due Date">
                                <input type="date" name="dueDate" value={formData.dueDate} onChange={handleChange} className={inputClasses} required />
                            </FormField>
                            <FormField label="Assignee (Optional)">
                                <input type="text" name="assignee" value={formData.assignee} onChange={handleChange} className={inputClasses} placeholder="e.g., Farm Hand" />
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

const TaskHistoryModal = ({ isOpen, onClose, tasks }: {
    isOpen: boolean;
    onClose: () => void;
    tasks: LivestockTask[];
}) => {
    if (!isOpen) return null;

    const handlePrint = () => window.print();
    const archivedTasks = tasks.filter(t => t.archived).sort((a,b) => b.dueDate.getTime() - a.dueDate.getTime());

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
             <div className="relative bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                <header className="flex items-center justify-between p-4 border-b no-print">
                    <h3 className="text-xl font-bold text-gray-800">Archived Task History</h3>
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
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Completed & Archived Tasks</h2>
                        <table className="w-full text-left">
                            <thead className="border-b">
                                <tr>
                                    <th className="py-2 pr-4 text-sm font-semibold text-gray-600">Task</th>
                                    <th className="py-2 px-4 text-sm font-semibold text-gray-600">Assignee</th>
                                    <th className="py-2 pl-4 text-sm font-semibold text-gray-600">Completed Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {archivedTasks.length > 0 ? archivedTasks.map(task => (
                                    <tr key={task.id} className="border-b">
                                        <td className="py-3 pr-4 font-medium text-gray-800">{task.title}</td>
                                        <td className="py-3 px-4 text-gray-600">{task.assignee || 'N/A'}</td>
                                        <td className="py-3 pl-4 text-gray-600">{task.dueDate.toLocaleDateString('en-GB')}</td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan={3} className="text-center py-8 text-gray-500">No archived tasks.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

const AnimalProfilePanel = ({ 
    isOpen, 
    onClose, 
    animal,
    allAnimals,
    healthHistory,
    farmLocations
}: { 
    isOpen: boolean; 
    onClose: () => void; 
    animal: LivestockRecord | null;
    allAnimals: LivestockRecord[];
    healthHistory: HealthEvent[];
    farmLocations: FarmLocation[];
}) => {
    if (!animal) return null;

    const farmLocation = farmLocations.find(loc => loc.id === animal.farmId);
    const isIndividual = animal.trackingType === 'INDIVIDUAL';

    const getDisplayName = (animal: IndividualAnimal) => `${animal.id}${animal.name ? ` (${animal.name})` : ''}`;

    const sire = isIndividual && (animal as IndividualAnimal).sireId
        ? allAnimals.find(a => a.id === (animal as IndividualAnimal).sireId) as IndividualAnimal | undefined
        : undefined;

    const dam = isIndividual && (animal as IndividualAnimal).damId
        ? allAnimals.find(a => a.id === (animal as IndividualAnimal).damId) as IndividualAnimal | undefined
        : undefined;


    const DetailItem = ({ label, value }: { label: string, value: React.ReactNode }) => (
        <div>
            <p className="text-sm text-gray-500">{label}</p>
            <p className="font-semibold text-gray-800">{value || 'N/A'}</p>
        </div>
    );
    
    const HealthHistoryItem = ({ event }: { event: HealthEvent, key?: React.Key }) => {
        return (
            <div className="flex space-x-4 py-3 border-b border-gray-100 last:border-b-0">
                <div className="text-center w-20 flex-shrink-0">
                    <p className="font-bold text-gray-700">{event.date.getDate()}</p>
                    <p className="text-xs text-gray-500">{event.date.toLocaleString('default', { month: 'short' })} '{event.date.getFullYear().toString().slice(-2)}</p>
                </div>
                <div>
                    <p className="font-semibold text-gray-800">{event.type}</p>
                    <p className="text-sm text-gray-600">{event.description}</p>
                </div>
            </div>
        )
    };

    return (
        <>
            <div className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose}></div>
            <aside className={`fixed top-0 right-0 h-full w-full max-w-2xl bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="flex flex-col h-full">
                    <header className="p-6 border-b border-gray-200 flex items-center justify-between">
                        <div>
                             <h3 className="text-xl font-bold text-gray-800">{isIndividual ? (animal as IndividualAnimal).name || animal.id : (animal as BatchAnimal).batchName}</h3>
                             <p className="text-sm text-gray-500">Tag Number: {animal.id}</p>
                        </div>
                        <button onClick={onClose} className="p-1 rounded-full text-gray-500 hover:bg-gray-100"><CloseIcon /></button>
                    </header>
                    <div className="flex-grow p-6 overflow-y-auto space-y-8">
                        {/* Animal Details */}
                        <section>
                             <h4 className="text-lg font-semibold text-gray-700 mb-4">Details</h4>
                             <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4 bg-gray-50 p-4 rounded-lg">
                                <DetailItem label="Species" value={animal.species} />
                                <DetailItem label="Variety" value={animal.variety} />
                                { isIndividual && <DetailItem label="Health Status" value={<HealthStatusBadge status={(animal as IndividualAnimal).healthStatus} />} /> }
                                <DetailItem label="Pen/Pasture" value={animal.location} />
                                <DetailItem label="Farm Location" value={farmLocation?.name} />
                                <DetailItem label="Source/Vendor" value={animal.source} />
                                 {isIndividual ? (
                                     <>
                                        <DetailItem label="Age (months)" value={(animal as IndividualAnimal).age} />
                                        <DetailItem label="Weight (kg)" value={(animal as IndividualAnimal).weight} />
                                        <DetailItem label="Sex" value={(animal as IndividualAnimal).sex} />
                                        <DetailItem label="Sire" value={sire ? getDisplayName(sire) : undefined} />
                                        <DetailItem label="Dam" value={dam ? getDisplayName(dam) : undefined} />
                                     </>
                                 ) : (
                                      <>
                                        <DetailItem label="Quantity" value={(animal as BatchAnimal).quantity} />
                                        <DetailItem label="Acquisition Date" value={(animal as BatchAnimal).acquisitionDate.toLocaleDateString('en-GB')} />
                                        <DetailItem label="Average Age (months)" value={(animal as BatchAnimal).averageAge} />
                                        <DetailItem label="Average Weight (kg)" value={(animal as BatchAnimal).averageWeight?.toFixed(1)} />
                                        <div className="md:col-span-3">
                                            <DetailItem label="Status Breakdown" value={<BatchStatusDisplay statusCounts={(animal as BatchAnimal).statusCounts} />} />
                                        </div>
                                      </>
                                 )}
                             </div>
                        </section>
                        
                        <section>
                            <h4 className="text-lg font-semibold text-gray-700 mb-4">Weight History</h4>
                            <div className="border border-gray-200 rounded-lg p-2 max-h-60 overflow-y-auto">
                                {animal.weightHistory && animal.weightHistory.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead className="sticky top-0 bg-white">
                                                <tr className="border-b">
                                                    <th className="py-2 pr-4 text-sm font-semibold text-gray-600">Date</th>
                                                    <th className="py-2 pl-4 text-sm font-semibold text-gray-600 text-right">
                                                        {isIndividual ? 'Weight (kg)' : 'Avg. Weight (kg)'}
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {animal.weightHistory
                                                    .sort((a, b) => b.date.getTime() - a.date.getTime())
                                                    .map((entry, index) => (
                                                        <tr key={index} className="border-b last:border-0">
                                                            <td className="py-2 pr-4 text-gray-600">{entry.date.toLocaleDateString('en-GB')}</td>
                                                            <td className="py-2 pl-4 text-gray-800 text-right font-medium">{entry.weight.toFixed(1)}</td>
                                                        </tr>
                                                    ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <p className="text-center text-gray-500 py-8">No weight history recorded.</p>
                                )}
                            </div>
                        </section>

                        {/* Health History */}
                        <section>
                            <h4 className="text-lg font-semibold text-gray-700 mb-4">Health History</h4>
                            <div className="border border-gray-200 rounded-lg p-2">
                                {healthHistory.length > 0 ? (
                                    healthHistory.map(event => <HealthHistoryItem key={event.id} event={event} />)
                                ) : (
                                    <p className="text-center text-gray-500 py-8">No health records found for this animal.</p>
                                )}
                            </div>
                        </section>
                    </div>
                </div>
            </aside>
        </>
    );
};


// --- Tab Components ---

const HealthStatusBadge = ({ status }: { status: HealthStatus }) => {
    const colors: Record<HealthStatus, string> = {
        Healthy: "bg-green-100 text-green-800",
        Sick: "bg-red-100 text-red-800",
        Quarantined: "bg-yellow-100 text-yellow-800",
        Vaccinated: "bg-blue-100 text-blue-800",
        Dead: "bg-gray-200 text-gray-800",
    };
    return <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${colors[status]}`}>{status}</span>
}

const BatchStatusDisplay = ({ statusCounts }: { statusCounts: Partial<Record<HealthStatus, number>> }) => {
    const activeStatuses = Object.entries(statusCounts)
        .filter(([, count]) => count && count > 0)
        .sort((a,b) => b[1] - a[1]);

    if (activeStatuses.length === 0) {
        return <span className="text-gray-500">No active status</span>;
    }

    if (activeStatuses.length === 1) {
        return <HealthStatusBadge status={activeStatuses[0][0] as HealthStatus} />;
    }

    return (
        <div className="flex flex-wrap gap-1">
            {activeStatuses.map(([status, count]) => (
                <span key={status} className="flex items-center">
                    <HealthStatusBadge status={status as HealthStatus} />
                    <span className="text-xs text-gray-600 font-medium ml-1">({count})</span>
                </span>
            ))}
        </div>
    );
};

const OverviewTab = ({ animals, healthEvents, tasks }: { animals: LivestockRecord[], healthEvents: HealthEvent[], tasks: LivestockTask[] }) => {
    
    const totalAnimals = useMemo(() => animals.reduce((acc, record) => {
        if (record.trackingType === 'BATCH') return acc + record.quantity;
        if (record.trackingType === 'INDIVIDUAL' && record.healthStatus !== 'Dead') return acc + 1;
        return acc;
    }, 0), [animals]);

    const needsAttentionAnimals = useMemo(() => animals.filter(a => {
        if (a.trackingType === 'INDIVIDUAL') return a.healthStatus === 'Sick' || a.healthStatus === 'Quarantined';
        if (a.trackingType === 'BATCH') return (a.statusCounts.Sick || 0) > 0 || (a.statusCounts.Quarantined || 0) > 0;
        return false;
    }), [animals]);
    
    const speciesCount = useMemo(() => animals.reduce((acc, record) => {
        const count = record.trackingType === 'BATCH' ? record.quantity : (record.healthStatus !== 'Dead' ? 1 : 0);
        if (count > 0) {
           acc[record.species] = (acc[record.species] || 0) + count;
        }
        return acc;
    }, {} as Record<string, number>), [animals]);
    
    const mortalityBySpecies = useMemo(() => animals.reduce((acc, record) => {
        let deaths = 0;
        if (record.trackingType === 'INDIVIDUAL' && record.healthStatus === 'Dead') {
            deaths = 1;
        } else if (record.trackingType === 'BATCH' && record.statusCounts.Dead) {
            deaths = record.statusCounts.Dead;
        }
        
        if (deaths > 0) {
           acc[record.species] = (acc[record.species] || 0) + deaths;
        }
        return acc;
    }, {} as Record<string, number>), [animals]);

    const upcomingEvents = healthEvents
        .filter(event => event.date >= new Date() && event.date <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))
        .sort((a, b) => a.date.getTime() - b.date.getTime());
    
    const getAnimalDisplayName = (animal: LivestockRecord) => {
        if (animal.trackingType === 'INDIVIDUAL') {
            return `${animal.id}${animal.name ? ` (${animal.name})` : ''}`;
        }
        return animal.batchName;
    };
    
    // Task calculations
    const activeTasks = useMemo(() => tasks.filter(t => !t.archived), [tasks]);
    const toDoCount = useMemo(() => activeTasks.filter(t => t.status === 'To Do').length, [activeTasks]);
    const inProgressCount = useMemo(() => activeTasks.filter(t => t.status === 'In Progress').length, [activeTasks]);
    
    const overdueCount = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return activeTasks.filter(t => t.status !== 'Done' && new Date(t.dueDate) < today).length;
    }, [activeTasks]);

    const upcomingTasks = useMemo(() =>
        activeTasks
            .filter(t => t.status !== 'Done')
            .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
            .slice(0, 4),
        [activeTasks]
    );

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <MetricCard title="Total Live Animals" value={totalAnimals} icon={<BullIcon className="w-10 h-10 text-white/80" />} color="bg-blue-500 text-white" />
                
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <h4 className="font-semibold text-gray-800 mb-3">Mortality Tracker</h4>
                     {Object.keys(mortalityBySpecies).length > 0 ? (
                        <ul className="space-y-2">
                            {Object.entries(mortalityBySpecies).map(([species, count]) => (
                                <li key={species} className="flex justify-between items-center text-sm">
                                    <span className="font-medium text-gray-700">{species}</span>
                                    <span className="font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full">{count} deceased</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-500 text-sm text-center py-4">No recorded mortalities.</p>
                    )}
                </div>
                
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <h4 className="font-semibold text-gray-800 mb-3">Species Breakdown (Live)</h4>
                     {Object.keys(speciesCount).length > 0 ? (
                        <ul className="space-y-2">
                            {Object.entries(speciesCount).map(([species, count]) => (
                                <li key={species} className="flex justify-between items-center text-sm">
                                    <span className="font-medium text-gray-700">{species}</span>
                                    <span className="font-bold text-gray-800 bg-gray-100 px-2 py-0.5 rounded-full">{count}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-500 text-sm">No animals in inventory.</p>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-xl shadow-md">
                     <h4 className="font-semibold text-gray-800 mb-4">Alerts & Events</h4>
                     
                     <div className="mb-6">
                        <h5 className="font-semibold text-red-600 text-sm mb-2">Needs Attention ({needsAttentionAnimals.length})</h5>
                        {needsAttentionAnimals.length > 0 ? (
                            <ul className="space-y-2 max-h-40 overflow-y-auto">
                                {needsAttentionAnimals.map(animal => (
                                    <li key={animal.id} className="text-sm flex justify-between items-center p-2 rounded-md bg-red-50/50">
                                        <span className="font-medium text-gray-800">{getAnimalDisplayName(animal)}</span>
                                        <div className="flex items-center gap-2">
                                        {animal.trackingType === 'BATCH' ? 
                                            <span className='text-xs font-semibold text-red-700'>
                                                {
                                                    Object.entries(animal.statusCounts)
                                                    .filter(([status, count]) => (status === 'Sick' || status === 'Quarantined') && (count as number) > 0)
                                                    .map(([status, count]) => `${status}: ${count}`)
                                                    .join(', ')
                                                }
                                            </span>
                                            : <HealthStatusBadge status={(animal as IndividualAnimal).healthStatus} />
                                        }
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : <p className="text-gray-500 text-sm">All animals are healthy.</p>}
                     </div>

                     <div className="pt-6 border-t">
                         <h5 className="font-semibold text-indigo-600 text-sm mb-2">Upcoming Events (Next 7 Days)</h5>
                         <ul className="space-y-4">
                            {upcomingEvents.length > 0 ? upcomingEvents.map(event => (
                                <li key={event.id} className="flex items-start space-x-3">
                                    <div className="bg-indigo-100 text-indigo-700 p-2 rounded-lg flex flex-col items-center justify-center h-12 w-12 text-center">
                                        <span className="text-xs font-bold uppercase">{event.date.toLocaleString('default', { month: 'short' })}</span>
                                        <span className="text-lg font-bold">{event.date.getDate()}</span>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-800">{event.type}</p>
                                        <p className="text-sm text-gray-500">{event.description}</p>
                                    </div>
                                </li>
                            )) : <p className="text-gray-500 text-sm">No upcoming events in the next week.</p>}
                         </ul>
                     </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-md">
                    <h4 className="font-semibold text-gray-800 mb-4">Task Tracker</h4>
                    
                    <div className="grid grid-cols-3 gap-4 mb-6 text-center">
                        <div>
                            <p className="text-2xl font-bold text-red-600">{toDoCount}</p>
                            <p className="text-sm font-medium text-gray-500">To Do</p>
                        </div>
                         <div>
                            <p className="text-2xl font-bold text-yellow-600">{inProgressCount}</p>
                            <p className="text-sm font-medium text-gray-500">In Progress</p>
                        </div>
                         <div>
                            <p className="text-2xl font-bold text-orange-600">{overdueCount}</p>
                            <p className="text-sm font-medium text-gray-500">Overdue</p>
                        </div>
                    </div>

                    <div className="pt-6 border-t">
                        <h5 className="font-semibold text-blue-600 text-sm mb-2">Upcoming Tasks</h5>
                        <ul className="space-y-3">
                            {upcomingTasks.length > 0 ? upcomingTasks.map(task => (
                                <li key={task.id} className="flex items-start space-x-3 text-sm">
                                    <div className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${new Date(task.dueDate) < new Date() ? 'bg-red-500' : 'bg-blue-500'}`}></div>
                                    <div>
                                        <p className="font-medium text-gray-800">{task.title}</p>
                                        <p className="text-xs text-gray-500">
                                            Due: {new Date(task.dueDate).toLocaleDateString('en-GB')}
                                            {task.assignee && ` - ${task.assignee}`}
                                        </p>
                                    </div>
                                </li>
                            )) : <p className="text-gray-500 text-sm">No upcoming tasks.</p>}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

const InventoryTab = ({ animals, onEdit, onDelete, onAdd, onViewProfile, onExport }: { 
    animals: LivestockRecord[]; 
    onEdit: (animal: LivestockRecord) => void; 
    onDelete: (id: string) => void; 
    onAdd: () => void;
    onViewProfile: (animal: LivestockRecord) => void;
    onExport: () => void;
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const filteredAnimals = animals.filter(animal => {
        const name = animal.trackingType === 'INDIVIDUAL' 
            ? `${animal.id} ${animal.name || ''}` 
            : (animal as BatchAnimal).batchName;
        return name.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const getDisplayName = (animal: IndividualAnimal) => {
        return (
            <>
                <span className="font-medium text-gray-900">{animal.id}</span>
                {animal.name && <span className="text-gray-500 ml-2">({animal.name})</span>}
            </>
        )
    }

    return (
        <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <input 
                    type="text" 
                    placeholder="Search by tag, name, or batch..." 
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full sm:w-auto flex-grow sm:flex-grow-0 sm:w-1/3 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <div className="flex items-center gap-2">
                    <button 
                        onClick={onExport}
                        className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-50 transition-colors shadow-sm flex items-center"
                    >
                        <DownloadIcon /> <span className="ml-2 hidden sm:inline">Export CSV</span>
                    </button>
                    <button 
                        onClick={onAdd}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors shadow-sm flex items-center"
                    >
                        <PlusIcon /> <span className="ml-2 hidden sm:inline">Add Record</span>
                    </button>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tag / Batch</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Species</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity / Sex</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Health Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredAnimals.length > 0 ? filteredAnimals.map(animal => {
                            const isDead = animal.trackingType === 'INDIVIDUAL' && animal.healthStatus === 'Dead';
                            return (
                            <tr key={animal.id} className={isDead ? 'opacity-50 bg-gray-50' : ''}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    {animal.trackingType === 'INDIVIDUAL' ? getDisplayName(animal) : <span className="font-medium text-gray-900">{(animal as BatchAnimal).batchName}</span>}
                                    {animal.variety && <span className="text-gray-500 block text-xs font-normal">{animal.variety}</span>}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{animal.species}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-semibold">
                                    {animal.trackingType === 'INDIVIDUAL' ? (animal as IndividualAnimal).sex : (animal as BatchAnimal).quantity}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {animal.trackingType === 'INDIVIDUAL'
                                        ? `Age: ${(animal as IndividualAnimal).age}m, Weight: ${(animal as IndividualAnimal).weight}kg`
                                        : `Acq: ${(animal as BatchAnimal).acquisitionDate.toLocaleDateString('en-GB')}`
                                    }
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                     {animal.trackingType === 'INDIVIDUAL' 
                                        ? <HealthStatusBadge status={(animal as IndividualAnimal).healthStatus} />
                                        : <BatchStatusDisplay statusCounts={(animal as BatchAnimal).statusCounts} />
                                    }
                                    {isDead && <span className="block text-xs mt-1">Died: {(animal as IndividualAnimal).dateOfDeath?.toLocaleDateString('en-GB')}</span>}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-1">
                                    <button onClick={() => onViewProfile(animal)} className="text-gray-500 p-1 rounded-full hover:bg-gray-100 transition-colors" title="View Profile"><ViewIcon /></button>
                                    {!isDead && <button onClick={() => onEdit(animal)} className="text-blue-600 p-1 rounded-full hover:bg-blue-100 transition-colors" title="Edit"><EditIcon /></button>}
                                    <button onClick={() => onDelete(animal.id)} className="text-red-600 p-1 rounded-full hover:bg-red-100 transition-colors" title="Delete"><TrashIcon /></button>
                                </td>
                            </tr>
                            )
                        }) : (
                            <tr>
                                <td colSpan={6} className="text-center py-10 text-gray-500">
                                    No animals found. <button onClick={onAdd} className="text-blue-600 font-semibold">Add a new record</button> to get started.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
};

const HealthTab = ({ healthEvents, onAdd, onEdit, onDelete, onViewDetails, onExport, onComplete }: { 
    healthEvents: HealthEvent[];
    onAdd: () => void;
    onEdit: (event: HealthEvent) => void;
    onDelete: (id: string) => void;
    onViewDetails: (event: HealthEvent) => void;
    onExport: () => void;
    onComplete: (eventId: string) => void;
}) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const scheduledEvents = healthEvents
        .filter(event => new Date(event.date) > today)
        .sort((a, b) => a.date.getTime() - b.date.getTime());

    const loggedEvents = healthEvents
        .filter(event => new Date(event.date) <= today)
        .sort((a, b) => b.date.getTime() - a.date.getTime());
    
    const daysUntil = (date: Date) => {
        const diffTime = new Date(date).getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays === 1) return '1 day';
        return `${diffDays} days`;
    };

    return (
        <div className="space-y-8">
            <div className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-800">Upcoming & Scheduled Events</h3>
                    <button onClick={onAdd} className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors shadow-sm flex items-center">
                        <PlusIcon /> <span className="ml-2 hidden sm:inline">Log/Schedule Event</span>
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scheduled Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {scheduledEvents.length > 0 ? scheduledEvents.map(event => (
                                <tr key={event.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <p className="font-medium text-gray-900">{event.date.toLocaleDateString('en-GB')}</p>
                                        <p className="text-xs text-blue-600">{daysUntil(event.date)}</p>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">{event.type}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate">{event.description}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-1">
                                        <button onClick={() => onComplete(event.id)} className="text-green-600 p-1 rounded-full hover:bg-green-100 transition-colors" title="Mark as Complete"><CheckIcon className="h-5 w-5"/></button>
                                        <button onClick={() => onEdit(event)} className="text-blue-600 p-1 rounded-full hover:bg-blue-100 transition-colors" title="Edit"><EditIcon /></button>
                                        <button onClick={() => onDelete(event.id)} className="text-red-600 p-1 rounded-full hover:bg-red-100 transition-colors" title="Delete"><TrashIcon /></button>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan={4} className="text-center py-8 text-gray-500">No upcoming events scheduled.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-800">Past Event Log</h3>
                    <button onClick={onExport} className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-50 transition-colors shadow-sm flex items-center text-sm">
                        <DownloadIcon /> <span className="ml-2 hidden sm:inline">Export Log</span>
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Animals Affected</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loggedEvents.map(event => (
                                <tr key={event.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{event.date.toLocaleDateString('en-GB')}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{event.type}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate">{event.description}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{event.animals.length}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-1">
                                        <button onClick={() => onViewDetails(event)} className="text-gray-500 p-1 rounded-full hover:bg-gray-100 transition-colors" title="View"><ViewIcon /></button>
                                        <button onClick={() => onEdit(event)} className="text-blue-600 p-1 rounded-full hover:bg-blue-100 transition-colors" title="Edit"><EditIcon /></button>
                                        <button onClick={() => onDelete(event.id)} className="text-red-600 p-1 rounded-full hover:bg-red-100 transition-colors" title="Delete"><TrashIcon /></button>
                                    </td>
                                </tr>
                            ))}
                            {loggedEvents.length === 0 && (
                                <tr><td colSpan={5} className="text-center py-8 text-gray-500">No past events found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const BreedingTab = ({ animals, breedingRecords, setAnimals, setBreedingRecords, farmLocations, selectedLocationId, onAddActivity }: {
    animals: LivestockRecord[];
    breedingRecords: BreedingRecord[];
    setAnimals: React.Dispatch<React.SetStateAction<LivestockRecord[]>>;
    setBreedingRecords: React.Dispatch<React.SetStateAction<BreedingRecord[]>>;
    farmLocations: FarmLocation[];
    selectedLocationId: number | 'all';
    onAddActivity: (text: string, icon: string) => void;
}) => {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isBreedingFormOpen, setIsBreedingFormOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState<BreedingRecord | null>(null);
    const [recordForBirth, setRecordForBirth] = useState<BreedingRecord | null>(null);

    const handleAdd = () => {
        setEditingRecord(null);
        setIsFormOpen(true);
    };

    const handleEdit = (record: BreedingRecord) => {
        setEditingRecord(record);
        setIsFormOpen(true);
    };
    
    const handleDelete = (id: string) => {
        if (window.confirm('Are you sure you want to delete this breeding record?')) {
            setBreedingRecords(prev => prev.filter(rec => rec.id !== id));
        }
    };
    
    const handleRecordBirth = (record: BreedingRecord) => {
        setRecordForBirth(record);
        setIsBreedingFormOpen(true);
    };

    const handleFormSubmit = (data: BreedingFormData, id?: string) => {
        const damSpecies = animals.find(a => a.id === data.damId)?.species;
        const gestationPeriod = GESTATION_PERIODS[damSpecies || ''] || 0;
        const expectedDueDate = new Date(data.pairingDate.getTime() + gestationPeriod * 24 * 60 * 60 * 1000);
        
        if (id) {
            setBreedingRecords(prev => prev.map(rec => rec.id === id ? { ...rec, ...data, expectedDueDate } : rec));
        } else {
            const newRecord: BreedingRecord = {
                id: `B-${Date.now()}`,
                status: 'Active',
                ...data,
                expectedDueDate,
            };
            setBreedingRecords(prev => [newRecord, ...prev]);
            onAddActivity(`Created a new pairing record for Dam ${data.damId}.`, 'favorite_border');
        }
        setIsFormOpen(false);
    };
    
    const handleBreedingFormSubmit = (breedingRecordId: string, offspringData: OffspringFormData[]) => {
        let newAnimals: LivestockRecord[] = [];
        let updatedBreedingRecord: BreedingRecord | null = null;
    
        setBreedingRecords((prevRecords: BreedingRecord[]) => {
            const updatedRecords = prevRecords.map(rec => {
                if (rec.id === breedingRecordId) {
                    const dam = animals.find(a => a.id === rec.damId) as IndividualAnimal;
                    if (!dam) return rec;
    
                    const sire = animals.find(a => a.id === rec.sireId) as IndividualAnimal | undefined;
    
                    const newOffspringIds = offspringData.map(offspring => {
                        const offspringBaseName = sire ? `${sire.name || sire.id}'s Offspring` : `Offspring of ${dam.id}`;
                        const newOffspring: IndividualAnimal = {
                            id: offspring.id,
                            name: offspring.name || offspringBaseName,
                            species: dam.species,
                            trackingType: 'INDIVIDUAL',
                            farmId: dam.farmId,
                            age: 0,
                            weight: parseFloat(offspring.weight) || 0,
                            sex: offspring.sex,
                            healthStatus: 'Healthy',
                            location: dam.location,
                            sireId: sire?.id,
                            damId: dam.id,
                            source: 'Self-bred',
                        };
                        newAnimals.push(newOffspring);
                        return newOffspring.id;
                    });
    
                    updatedBreedingRecord = {
                        ...rec,
                        status: 'Completed',
                        actualBirthDate: new Date(),
                        offspringIds: [...(rec.offspringIds || []), ...newOffspringIds]
                    };
                    return updatedBreedingRecord;
                }
                return rec;
            });
            return updatedRecords;
        });
    
        if (newAnimals.length > 0) {
            setAnimals((prev: LivestockRecord[]) => [...prev, ...newAnimals]);
            onAddActivity(`Recorded birth of ${newAnimals.length} offspring for Dam ${updatedBreedingRecord?.damId}.`, 'favorite_border');
        }
    
        setIsBreedingFormOpen(false);
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800">Breeding Records</h3>
                <button onClick={handleAdd} className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors shadow-sm flex items-center">
                    <PlusIcon /> <span className="ml-2 hidden sm:inline">Add Pairing</span>
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                         <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pairing</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pairing Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expected Due Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {breedingRecords.map(rec => {
                             const sire = animals.find(a => a.id === rec.sireId) as IndividualAnimal;
                             const dam = animals.find(a => a.id === rec.damId) as IndividualAnimal;
                             return (
                            <tr key={rec.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <p className="font-semibold text-gray-900">{sire ? `${sire.name || sire.id} (M)` : 'N/A'} x {dam ? `${dam.name || dam.id} (F)` : 'N/A'}</p>
                                    <p className="text-xs text-gray-500">{dam?.species}</p>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{rec.pairingDate.toLocaleDateString('en-GB')}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{rec.expectedDueDate.toLocaleDateString('en-GB')}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                     <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${rec.status === 'Active' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>{rec.status}</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                     {rec.status === 'Active' && <button onClick={() => handleRecordBirth(rec)} className="text-green-600 hover:text-green-800">Record Birth</button>}
                                     <button onClick={() => handleEdit(rec)} className="text-blue-600 hover:text-blue-800"><EditIcon className="h-4 w-4 inline"/></button>
                                     <button onClick={() => handleDelete(rec.id)} className="text-red-600 hover:text-red-800"><TrashIcon className="h-4 w-4 inline"/></button>
                                </td>
                            </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>

            <BreedingFormPanel 
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSubmit={handleFormSubmit}
                initialData={editingRecord}
                animals={animals}
                farmLocations={farmLocations}
                selectedLocationId={selectedLocationId}
            />
            <RecordBirthFormPanel 
                isOpen={isBreedingFormOpen}
                onClose={() => setIsBreedingFormOpen(false)}
                onSubmit={handleBreedingFormSubmit}
                breedingRecord={recordForBirth}
                animals={animals}
            />
        </div>
    );
};

const BreedingFormPanel = ({ isOpen, onClose, onSubmit, initialData, animals, farmLocations, selectedLocationId }: {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: BreedingFormData, id?: string) => void;
    initialData: BreedingRecord | null;
    animals: LivestockRecord[];
    farmLocations: FarmLocation[];
    selectedLocationId: number | 'all';
}) => {
    const [formData, setFormData] = useState<BreedingFormData>({ 
        sireId: '', 
        damId: '', 
        pairingDate: new Date(),
        farmId: selectedLocationId === 'all' ? (farmLocations[0]?.id || 1) : selectedLocationId
    });
    
    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData({ sireId: initialData.sireId, damId: initialData.damId, pairingDate: initialData.pairingDate, farmId: initialData.farmId });
            } else {
                setFormData({ 
                    sireId: '', 
                    damId: '', 
                    pairingDate: new Date(),
                    farmId: selectedLocationId === 'all' ? (farmLocations[0]?.id || 1) : selectedLocationId
                });
            }
        }
    }, [isOpen, initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };
    
    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({...prev, pairingDate: parseDateString(e.target.value)}));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData, initialData?.id);
    };

    const availableSires = animals.filter(a => a.trackingType === 'INDIVIDUAL' && a.sex === 'Male') as IndividualAnimal[];
    const availableDams = animals.filter(a => a.trackingType === 'INDIVIDUAL' && a.sex === 'Female') as IndividualAnimal[];
    
    const getDisplayName = (animal: IndividualAnimal) => `${animal.id}${animal.name ? ` (${animal.name})` : ''}`;

    return (
        <>
            <div className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose}></div>
            <aside className={`fixed top-0 right-0 h-full w-full max-w-lg bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <form onSubmit={handleSubmit} className="flex flex-col h-full">
                    <header className="p-6 border-b"><h3 className="text-xl font-bold text-gray-800">{initialData ? 'Edit Pairing' : 'Add Pairing'}</h3></header>
                    <div className="p-6 space-y-6 flex-grow">
                        <FormField label="Sire (Male)">
                            <select name="sireId" value={formData.sireId} onChange={handleChange} className={inputClasses} required>
                                <option value="">Select a Sire</option>
                                {availableSires.map(s => <option key={s.id} value={s.id}>{getDisplayName(s)}</option>)}
                            </select>
                        </FormField>
                        <FormField label="Dam (Female)">
                            <select name="damId" value={formData.damId} onChange={handleChange} className={inputClasses} required>
                                <option value="">Select a Dam</option>
                                {availableDams.map(d => <option key={d.id} value={d.id}>{getDisplayName(d)}</option>)}
                            </select>
                        </FormField>
                        <FormField label="Pairing Date">
                            <input type="date" value={formatDateForInput(formData.pairingDate)} onChange={handleDateChange} className={inputClasses} />
                        </FormField>
                        <FormField label="Farm Location">
                            <select name="farmId" value={formData.farmId} onChange={(e) => setFormData(prev => ({...prev, farmId: Number(e.target.value)}))} className={inputClasses} required>
                                {farmLocations.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
                            </select>
                        </FormField>
                    </div>
                    <footer className="p-6 border-t flex justify-end">
                        <button type="submit" className="bg-green-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-green-700">{initialData ? 'Save Changes' : 'Add Pairing'}</button>
                    </footer>
                </form>
            </aside>
        </>
    );
};

const RecordBirthFormPanel = ({ isOpen, onClose, onSubmit, breedingRecord, animals }: {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (breedingRecordId: string, offspringData: OffspringFormData[]) => void;
    breedingRecord: BreedingRecord | null;
    animals: LivestockRecord[];
}) => {
    const [offspring, setOffspring] = useState<OffspringFormData[]>([]);
    
    useEffect(() => {
        if(isOpen) {
            setOffspring([{ formId: Date.now(), id: '', name: '', sex: 'Female', weight: '' }]);
        }
    }, [isOpen]);

    if (!breedingRecord) return null;

    const handleOffspringChange = (formId: number, field: keyof Omit<OffspringFormData, 'formId'>, value: string) => {
        setOffspring(prev => prev.map(o => o.formId === formId ? { ...o, [field]: value } : o));
    };
    
    const handleAddOffspring = () => {
        setOffspring(prev => [...prev, { formId: Date.now(), id: '', name: '', sex: 'Female', weight: '' }]);
    };
    
    const handleRemoveOffspring = (formId: number) => {
        if (offspring.length > 1) {
            setOffspring(prev => prev.filter(o => o.formId !== formId));
        }
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const existingIds = animals.map(a => a.id.toLowerCase());
        const newIds = offspring.map(o => o.id.toLowerCase());
        const duplicates = newIds.filter(id => existingIds.includes(id));
        if (duplicates.length > 0) {
            alert(`The following Tag Numbers are already in use: ${duplicates.join(', ')}`);
            return;
        }
        onSubmit(breedingRecord.id, offspring);
    };

    return (
        <>
            <div className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose}></div>
            <aside className={`fixed top-0 right-0 h-full w-full max-w-xl bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                 <form onSubmit={handleSubmit} className="flex flex-col h-full">
                    <header className="p-6 border-b"><h3 className="text-xl font-bold text-gray-800">Record Birth</h3></header>
                    <div className="p-6 space-y-4 flex-grow overflow-y-auto">
                        {offspring.map((child, index) => (
                            <div key={child.formId} className="p-4 border rounded-lg space-y-3 relative">
                                <h4 className="font-semibold text-gray-700">Offspring #{index + 1}</h4>
                                {offspring.length > 1 && <button type="button" onClick={() => handleRemoveOffspring(child.formId)} className="absolute top-2 right-2 text-red-500"><TrashIcon /></button>}
                                <FormField label="Tag Number">
                                    <input type="text" value={child.id} onChange={(e) => handleOffspringChange(child.formId, 'id', e.target.value)} className={inputClasses} required />
                                </FormField>
                                <FormField label="Name (Optional)">
                                    <input type="text" value={child.name} onChange={(e) => handleOffspringChange(child.formId, 'name', e.target.value)} className={inputClasses} />
                                </FormField>
                                <div className="grid grid-cols-2 gap-4">
                                     <FormField label="Sex">
                                        <select value={child.sex} onChange={(e) => handleOffspringChange(child.formId, 'sex', e.target.value)} className={inputClasses}>
                                            <option>Female</option>
                                            <option>Male</option>
                                        </select>
                                    </FormField>
                                    <FormField label="Weight (kg)">
                                        <input type="number" step="0.1" value={child.weight} onChange={(e) => handleOffspringChange(child.formId, 'weight', e.target.value)} className={inputClasses} required />
                                    </FormField>
                                </div>
                            </div>
                        ))}
                        <button type="button" onClick={handleAddOffspring} className="mt-2 text-blue-600 font-semibold">+ Add Another Offspring</button>
                    </div>
                     <footer className="p-6 border-t flex justify-end">
                        <button type="submit" className="bg-green-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-green-700">Record Birth</button>
                    </footer>
                </form>
            </aside>
        </>
    )
};


const TasksTab = ({ tasks, onAdd, onEdit, onStatusChange, onArchive, onShowHistory }: { 
    tasks: LivestockTask[]; 
    onAdd: () => void;
    onEdit: (task: LivestockTask) => void;
    onStatusChange: (id: string, status: TaskStatus) => void;
    onArchive: (id: string) => void;
    onShowHistory: () => void;
}) => {
    const columns: Record<TaskStatus, LivestockTask[]> = {
        'To Do': tasks.filter(t => t.status === 'To Do' && !t.archived),
        'In Progress': tasks.filter(t => t.status === 'In Progress' && !t.archived),
        'Done': tasks.filter(t => t.status === 'Done' && !t.archived),
    };

    const StatusColumn = ({ title, tasks, color }: { title: TaskStatus, tasks: LivestockTask[], color: string }) => (
        <div className={`bg-gray-100 p-4 rounded-lg flex-1 min-w-[280px]`}>
            <h4 className={`font-bold text-gray-700 mb-4 pb-2 border-b-2 ${color}`}>{title} ({tasks.length})</h4>
            <div className="space-y-3">
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
                                {task.status === 'Done' && <button onClick={() => onArchive(task.id)} className="p-1 text-green-600 hover:bg-green-100 rounded-full" title="Archive Task"><ArchiveIcon className="h-4 w-4" /></button>}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
    
    return (
        <div className="space-y-4">
             <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800">Task Board</h3>
                <div className="flex items-center space-x-2">
                     <button onClick={onShowHistory} className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-50 transition-colors shadow-sm flex items-center">
                        <HistoryIcon /> <span className="ml-2 hidden sm:inline">History</span>
                    </button>
                    <button onClick={onAdd} className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors shadow-sm flex items-center">
                        <PlusIcon /> <span className="ml-2 hidden sm:inline">New Task</span>
                    </button>
                </div>
            </div>
            <div className="flex space-x-4 overflow-x-auto pb-4">
                <StatusColumn title="To Do" tasks={columns['To Do']} color="border-red-500" />
                <StatusColumn title="In Progress" tasks={columns['In Progress']} color="border-yellow-500" />
                <StatusColumn title="Done" tasks={columns['Done']} color="border-green-500" />
            </div>
        </div>
    );
};


// --- Main Page Component ---
interface LivestockPlannerPageProps {
    setSidebarOpen: (isOpen: boolean) => void;
    availableSpecies: string[];
    farmLocations: FarmLocation[];
    selectedLocationId: number | 'all';
    setSelectedLocationId: (id: number | 'all') => void;
    healthEvents: HealthEvent[];
    setHealthEvents: React.Dispatch<React.SetStateAction<HealthEvent[]>>;
    animals: LivestockRecord[];
    setAnimals: React.Dispatch<React.SetStateAction<LivestockRecord[]>>;
    tasks: LivestockTask[];
    setTasks: React.Dispatch<React.SetStateAction<LivestockTask[]>>;
    breedingRecords: BreedingRecord[];
    setBreedingRecords: React.Dispatch<React.SetStateAction<BreedingRecord[]>>;
    onAddActivity: (text: string, icon: string) => void;
}


const LivestockPlannerPage = ({ 
    setSidebarOpen, 
    availableSpecies,
    farmLocations,
    selectedLocationId,
    setSelectedLocationId,
    healthEvents,
    setHealthEvents,
    animals,
    setAnimals,
    tasks,
    setTasks,
    breedingRecords,
    setBreedingRecords,
    onAddActivity,
}: LivestockPlannerPageProps) => {
    const [activeTab, setActiveTab] = useState(LIVESTOCK_PLANNER_TABS[0]);
    
    // --- States ---
    
    // --- Modal/Panel States ---
    const [isAnimalFormOpen, setIsAnimalFormOpen] = useState(false);
    const [editingAnimal, setEditingAnimal] = useState<LivestockRecord | null>(null);
    const [isHealthFormOpen, setIsHealthFormOpen] = useState(false);
    const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<LivestockTask | null>(null);
    const [isTaskHistoryOpen, setIsTaskHistoryOpen] = useState(false);
    const [isHealthDetailOpen, setIsHealthDetailOpen] = useState(false);
    const [viewingHealthEvent, setViewingHealthEvent] = useState<HealthEvent | null>(null);
    const [isProfilePanelOpen, setIsProfilePanelOpen] = useState(false);
    const [viewingAnimal, setViewingAnimal] = useState<LivestockRecord | null>(null);
    const [editingHealthEvent, setEditingHealthEvent] = useState<HealthEvent | null>(null);
    const [healthFormMode, setHealthFormMode] = useState<'add' | 'edit'>('add');

    // --- Filtered Data ---
    const filteredAnimals = useMemo(() => animals.filter(a => selectedLocationId === 'all' || a.farmId === selectedLocationId), [animals, selectedLocationId]);
    const filteredHealthEvents = useMemo(() => {
        const animalIdsInLocation = new Set(filteredAnimals.map(a => a.id));
        return healthEvents.filter(event => event.animals.some(a => animalIdsInLocation.has(a.animalId)));
    }, [healthEvents, filteredAnimals]);
    const filteredBreedingRecords = useMemo(() => breedingRecords.filter(br => selectedLocationId === 'all' || br.farmId === selectedLocationId), [breedingRecords, selectedLocationId]);
    const filteredTasks = useMemo(() => tasks.filter(t => selectedLocationId === 'all' || t.farmId === selectedLocationId || !t.farmId), [tasks, selectedLocationId]);


    // --- Handlers ---
    const applyHealthEventEffects = (animalsToUpdate: LivestockRecord[], eventData: { animals: AffectedAnimal[], newStatus?: HealthStatus, type: HealthEvent['type'], date: string | Date }) => {
        return animalsToUpdate.map(animal => {
            const affected = eventData.animals.find(aff => aff.animalId === animal.id);
            if (!affected) return animal;

            const eventDate = typeof eventData.date === 'string' ? parseDateString(eventData.date) : eventData.date;

            if (animal.trackingType === 'INDIVIDUAL') {
                const updatedAnimal: IndividualAnimal = { ...(animal as IndividualAnimal) };
                if (eventData.newStatus) {
                    updatedAnimal.healthStatus = eventData.newStatus;
                    if (eventData.newStatus === 'Dead') {
                        updatedAnimal.dateOfDeath = eventDate;
                    }
                }
                if (eventData.type === 'Weighing' && affected.weight !== undefined) {
                    updatedAnimal.weight = affected.weight;
                    // FIX: Ensure immutable update of weightHistory array
                    const newWeightHistory = [...(updatedAnimal.weightHistory || []), { date: eventDate, weight: affected.weight }];
                    updatedAnimal.weightHistory = newWeightHistory;
                }
                return updatedAnimal;
            } else if (animal.trackingType === 'BATCH') {
                 const updatedAnimal: BatchAnimal = { ...(animal as BatchAnimal), statusCounts: { ...(animal as BatchAnimal).statusCounts } };
                if (eventData.newStatus) {
                    const affectedCount = affected.affectedCount ?? updatedAnimal.quantity;
                    let statusToDecrement: HealthStatus | undefined;
                    const sortedStatuses = Object.entries(updatedAnimal.statusCounts).filter(([status]) => status !== 'Dead').sort((a, b) => b[1] - a[1]);
                    if (sortedStatuses.length > 0) statusToDecrement = sortedStatuses[0][0] as HealthStatus;
                    if (statusToDecrement) {
                        updatedAnimal.statusCounts[statusToDecrement] = (updatedAnimal.statusCounts[statusToDecrement] || 0) - affectedCount;
                        if (updatedAnimal.statusCounts[statusToDecrement]! <= 0) delete updatedAnimal.statusCounts[statusToDecrement];
                    }
                    updatedAnimal.statusCounts[eventData.newStatus] = (updatedAnimal.statusCounts[eventData.newStatus] || 0) + affectedCount;
                    if (eventData.newStatus === 'Dead') {
                        updatedAnimal.quantity -= affectedCount;
                    }
                }
                if (eventData.type === 'Weighing' && affected.weight !== undefined) {
                    // FIX: Ensure immutable update of weightHistory array
                    const newWeightHistory = [...(updatedAnimal.weightHistory || []), { date: eventDate, weight: affected.weight }];
                    updatedAnimal.weightHistory = newWeightHistory;
                }
                return updatedAnimal;
            }
            return animal;
        });
    }

    const handleOpenAddAnimalForm = () => {
        setEditingAnimal(null);
        setIsAnimalFormOpen(true);
    };

    const handleOpenEditAnimalForm = (animal: LivestockRecord) => {
        setEditingAnimal(animal);
        setIsAnimalFormOpen(true);
    };
    
    const handleDeleteAnimal = (id: string) => {
        if(window.confirm('Are you sure you want to delete this record? This action cannot be undone.')){
             setAnimals(prev => prev.filter(animal => animal.id !== id));
        }
    };
    
    const handleAnimalFormSubmit = (data: AnimalFormData) => {
        if (editingAnimal) {
            // Edit logic
            setAnimals(prev => prev.map(a => {
                if (a.id !== editingAnimal.id) {
                    return a;
                }

                if (a.trackingType === 'INDIVIDUAL') {
                    const updatedAnimal: IndividualAnimal = {
                        ...a,
                        name: data.name,
                        location: data.location || a.location,
                        farmId: Number(data.farmId) || a.farmId,
                        variety: data.variety,
                        source: data.source,
                        sex: data.sex,
                        sireId: data.sireId,
                        damId: data.damId,
                        age: data.age !== undefined ? data.age : a.age,
                        weight: data.weight !== undefined ? data.weight : a.weight,
                    };
                    return updatedAnimal;
                } else { // BATCH
                    const updatedAnimal: BatchAnimal = {
                        ...a,
                        batchName: data.batchName || a.batchName,
                        location: data.location || a.location,
                        farmId: Number(data.farmId) || a.farmId,
                        variety: data.variety,
                        source: data.source,
                        quantity: data.quantity !== undefined ? data.quantity : a.quantity,
                        acquisitionDate: data.acquisitionDate ? new Date(data.acquisitionDate) : a.acquisitionDate,
                    };
                    return updatedAnimal;
                }
            }));
        } else {
            // Add logic
            if (data.trackingType === 'INDIVIDUAL') {
                 const newAnimal: IndividualAnimal = {
                    trackingType: 'INDIVIDUAL',
                    id: data.id!, // ID is validated in the form
                    species: data.species || availableSpecies[0],
                    location: data.location || '',
                    farmId: Number(data.farmId!),
                    healthStatus: 'Healthy',
                    name: data.name,
                    age: data.age || 0,
                    weight: data.weight || 0,
                    sex: data.sex,
                    sireId: data.sireId,
                    damId: data.damId,
                    variety: data.variety,
                    source: data.source,
                 };
                setAnimals(prev => [newAnimal, ...prev]);
                onAddActivity(`Added a new ${data.species} record: ${data.id}.`, 'pets');
            } else { // BATCH
                const quantity = data.quantity || 1;
                const newBatch: BatchAnimal = {
                    trackingType: 'BATCH',
                    id: data.id || `B-${Date.now()}`,
                    species: data.species || availableSpecies[0],
                    location: data.location || '',
                    farmId: Number(data.farmId!),
                    batchName: data.batchName || '',
                    quantity: quantity,
                    acquisitionDate: data.acquisitionDate ? new Date(data.acquisitionDate) : new Date(),
                    statusCounts: { 'Healthy': quantity },
                    variety: data.variety,
                    source: data.source,
                };
                setAnimals(prev => [newBatch, ...prev]);
                onAddActivity(`Added a new ${data.species} batch: ${data.batchName}.`, 'pets');
            }
        }
        setIsAnimalFormOpen(false);
    };

    const handleHealthEventSubmit = (data: HealthEventFormData) => {
        if (healthFormMode === 'edit' && editingHealthEvent) {
            const eventDate = parseDateString(data.date);
            const isFutureEvent = eventDate > new Date();
            const updatedEvent: HealthEvent = {
                ...editingHealthEvent,
                date: eventDate,
                type: data.type,
                description: data.description,
                animals: data.animals,
                newStatus: isFutureEvent ? data.newStatus : undefined,
            };
            setHealthEvents(prev => prev.map(e => e.id === editingHealthEvent.id ? updatedEvent : e));
        } else {
            const eventDate = parseDateString(data.date);
            const today = new Date();
            today.setHours(0,0,0,0);
            const isFutureEvent = eventDate > today;
            
            const newEvent: HealthEvent = {
                id: `H-${Date.now()}`,
                date: eventDate,
                type: data.type,
                description: data.description,
                animals: data.animals,
                newStatus: isFutureEvent ? data.newStatus : undefined,
            };
            setHealthEvents(prev => [newEvent, ...prev]);

            onAddActivity(`Logged a '${data.type}' health event.`, 'medical_services');
            if (!isFutureEvent) {
                setAnimals(prevAnimals => applyHealthEventEffects(prevAnimals, data));
            }
        }
        setIsHealthFormOpen(false);
        setEditingHealthEvent(null);
        setHealthFormMode('add');
    };

    const handleOpenEditHealthEvent = (event: HealthEvent) => {
        setEditingHealthEvent(event);
        setHealthFormMode('edit');
        setIsHealthFormOpen(true);
    };

    const handleDeleteHealthEvent = (id: string) => {
        if (window.confirm('Are you sure you want to delete this health record? This action cannot be undone.')) {
            setHealthEvents(prev => prev.filter(event => event.id !== id));
        }
    };
    
    const handleCompleteScheduledEvent = (eventId: string) => {
        const eventToComplete = healthEvents.find(e => e.id === eventId);
        if (!eventToComplete) return;

        const now = new Date();

        // Pass the newStatus from the event to the effect function
        if (eventToComplete.newStatus) {
            setAnimals(prevAnimals => applyHealthEventEffects(prevAnimals, { 
                ...eventToComplete, 
                date: now,
                newStatus: eventToComplete.newStatus 
            }));
        }

        // Update the event to be a logged event (date is now, newStatus is cleared)
        setHealthEvents(prevEvents => prevEvents.map(e => 
            e.id === eventId
                ? { ...e, date: now, newStatus: undefined }
                : e
        ));
    };

    const handleTaskFormSubmit = (data: TaskFormData, id?: string) => {
        if (id) {
            // Edit existing task
            setTasks(prev => prev.map(t => t.id === id ? { ...t, ...data, dueDate: parseDateString(data.dueDate), farmId: Number((data as any).farmId) } : t));
        } else {
            // Add new task
            const newTask: LivestockTask = {
                id: `T-${Date.now()}`,
                title: data.title,
                dueDate: parseDateString(data.dueDate),
                assignee: data.assignee,
                farmId: Number((data as any).farmId),
                status: 'To Do',
                archived: false,
            };
            setTasks(prev => [newTask, ...prev]);
        }
        setIsTaskFormOpen(false);
    };

    const handleTaskStatusChange = (id: string, status: TaskStatus) => {
        if (status === 'Done') {
            const task = tasks.find(t => t.id === id);
            if (task && task.status !== 'Done') { // Log only on transition to Done
                onAddActivity(`Completed livestock task: "${task.title}".`, 'assignment');
            }
        }
        setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t));
    };

    const handleArchiveTask = (id: string) => {
         setTasks(prev => prev.map(t => t.id === id ? { ...t, archived: true } : t));
    };
    
    const handleExportInventoryCSV = () => {
        const headers = [
            'ID', 'Tracking Type', 'Name / Batch Name', 'Species', 'Variety', 'Source', 'Location',
            'Health Status', 'Age (months)', 'Weight (kg)', 'Sex', 'Quantity', 'Acquisition Date',
            'Sire ID', 'Dam ID', 'Date of Death'
        ];

        const rows = animals.map(animal => {
            let row: (string | number | undefined)[];

            if (animal.trackingType === 'INDIVIDUAL') {
                row = [
                    animal.id,
                    animal.trackingType,
                    animal.name,
                    animal.species,
                    animal.variety,
                    animal.source,
                    animal.location,
                    animal.healthStatus,
                    animal.age,
                    animal.weight,
                    animal.sex,
                    1,
                    'N/A',
                    animal.sireId,
                    animal.damId,
                    animal.dateOfDeath ? animal.dateOfDeath.toLocaleDateString('en-GB') : 'N/A'
                ];
            } else { // BatchAnimal
                const status = Object.entries(animal.statusCounts)
                      .map(([s, c]) => `${s}: ${c}`)
                      .join('; ');

                row = [
                    animal.id,
                    animal.trackingType,
                    animal.batchName,
                    animal.species,
                    animal.variety,
                    animal.source,
                    animal.location,
                    status,
                    animal.averageAge,
                    animal.averageWeight,
                    'N/A',
                    animal.quantity,
                    animal.acquisitionDate.toLocaleDateString('en-GB'),
                    'N/A',
                    'N/A',
                    'N/A'
                ];
            }
            
            return row.map(val => `"${String(val ?? '').replace(/"/g, '""')}"`).join(',');
        });

        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
        const link = document.createElement('a');
        link.setAttribute('href', encodeURI(csvContent));
        const timestamp = new Date().toISOString().split('T')[0];
        link.setAttribute('download', `livestock_inventory_${timestamp}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleExportHealthLogCSV = () => {
        const headers = [
            'Event ID', 'Date', 'Type', 'Description', 'Affected Animal (ID/Name)', 'Affected Count', 'Weight Recorded (kg)'
        ];
        
        const animalMap = new Map<string, LivestockRecord>(animals.map(a => [a.id, a]));

        const getDisplayName = (animal: LivestockRecord | undefined): string => {
            if (!animal) return 'Unknown';
            if (animal.trackingType === 'INDIVIDUAL') {
                return `${animal.id}${animal.name ? ` (${animal.name})` : ''}`;
            }
            return animal.batchName;
        };
        
        const rows = healthEvents.flatMap(event => {
            if (event.animals.length === 0) {
                return [[
                    `"${event.id}"`,
                    `"${event.date.toLocaleDateString('en-GB')}"`,
                    `"${event.type}"`,
                    `"${event.description.replace(/"/g, '""')}"`,
                    '"None"',
                    '""',
                    '""'
                ].join(',')];
            }

            return event.animals.map(affected => {
                const animal = animalMap.get(affected.animalId);
                const row = [
                    event.id,
                    event.date.toLocaleDateString('en-GB'),
                    event.type,
                    event.description.replace(/"/g, '""'),
                    getDisplayName(animal),
                    animal?.trackingType === 'BATCH' ? affected.affectedCount || '' : '1',
                    event.type === 'Weighing' && affected.weight ? affected.weight : ''
                ];
                return row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(',');
            });
        });

        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
        const link = document.createElement('a');
        link.setAttribute('href', encodeURI(csvContent));
        const timestamp = new Date().toISOString().split('T')[0];
        link.setAttribute('download', `livestock_health_log_${timestamp}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };


    const renderTabContent = () => {
        switch (activeTab) {
            case 'Inventory':
                return <InventoryTab 
                            animals={filteredAnimals} 
                            onEdit={handleOpenEditAnimalForm} 
                            onDelete={handleDeleteAnimal}
                            onAdd={handleOpenAddAnimalForm}
                            onViewProfile={(animal) => { setViewingAnimal(animal); setIsProfilePanelOpen(true); }}
                            onExport={handleExportInventoryCSV}
                        />;
            case 'Health':
                return <HealthTab 
                            healthEvents={filteredHealthEvents} 
                            onAdd={() => { setHealthFormMode('add'); setEditingHealthEvent(null); setIsHealthFormOpen(true); }}
                            onEdit={handleOpenEditHealthEvent}
                            onDelete={handleDeleteHealthEvent}
                            onViewDetails={(event) => { setViewingHealthEvent(event); setIsHealthDetailOpen(true); }}
                            onExport={handleExportHealthLogCSV}
                            onComplete={handleCompleteScheduledEvent}
                        />;
            case 'Breeding':
                return <BreedingTab animals={filteredAnimals} breedingRecords={filteredBreedingRecords} setAnimals={setAnimals} setBreedingRecords={setBreedingRecords} farmLocations={farmLocations} selectedLocationId={selectedLocationId} onAddActivity={onAddActivity} />;
            case 'Tasks':
                 return <TasksTab 
                            tasks={filteredTasks}
                            onAdd={() => { setEditingTask(null); setIsTaskFormOpen(true); }}
                            onEdit={(task) => { setEditingTask(task); setIsTaskFormOpen(true); }}
                            onStatusChange={handleTaskStatusChange}
                            onArchive={handleArchiveTask}
                            onShowHistory={() => setIsTaskHistoryOpen(true)}
                        />;
            case 'Overview':
            default:
                return <OverviewTab animals={filteredAnimals} healthEvents={filteredHealthEvents} tasks={filteredTasks} />;
        }
    };

    return (
        <main className="flex-1 w-full p-4 md:p-6 lg:p-8 bg-slate-100 overflow-y-auto">
            <header className="mb-8 flex items-center justify-between flex-wrap gap-4">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-700">Livestock Planner</h2>
                 <div className="flex items-center space-x-2">
                     <select
                        id="location-filter"
                        value={selectedLocationId}
                        onChange={(e) => setSelectedLocationId(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                        className="text-sm font-semibold text-gray-600 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500 p-2"
                    >
                        <option value="all">All Locations</option>
                        {farmLocations.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
                    </select>
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-200 md:hidden"
                        aria-label="Open sidebar"
                    >
                        <MenuIcon />
                    </button>
                 </div>
            </header>

            <div className="mb-6 border-b border-gray-200">
                <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
                    {LIVESTOCK_PLANNER_TABS.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`${
                                activeTab === tab
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors focus:outline-none`}
                        >
                            {tab}
                        </button>
                    ))}
                </nav>
            </div>

            <div>
                {renderTabContent()}
            </div>

            <AnimalFormPanel 
                isOpen={isAnimalFormOpen}
                onClose={() => setIsAnimalFormOpen(false)}
                onSubmit={handleAnimalFormSubmit}
                mode={editingAnimal ? 'edit' : 'add'}
                initialData={editingAnimal}
                availableSpecies={availableSpecies}
                animals={animals}
                farmLocations={farmLocations}
                selectedLocationId={selectedLocationId}
            />
            
            <HealthEventFormPanel 
                isOpen={isHealthFormOpen}
                onClose={() => setIsHealthFormOpen(false)}
                onSubmit={handleHealthEventSubmit}
                allAnimals={animals}
                mode={healthFormMode}
                initialData={editingHealthEvent}
            />

             <TaskFormPanel 
                isOpen={isTaskFormOpen}
                onClose={() => setIsTaskFormOpen(false)}
                onSubmit={handleTaskFormSubmit}
                mode={editingTask ? 'edit' : 'add'}
                initialData={editingTask}
                farmLocations={farmLocations}
                selectedLocationId={selectedLocationId}
            />
            
            <TaskHistoryModal 
                isOpen={isTaskHistoryOpen}
                onClose={() => setIsTaskHistoryOpen(false)}
                tasks={tasks}
            />
            
            <HealthEventDetailModal 
                isOpen={isHealthDetailOpen}
                onClose={() => setIsHealthDetailOpen(false)}
                event={viewingHealthEvent}
                allAnimals={animals}
            />
            
             <AnimalProfilePanel 
                isOpen={isProfilePanelOpen}
                onClose={() => setIsProfilePanelOpen(false)}
                animal={viewingAnimal}
                allAnimals={animals}
                healthHistory={healthEvents.filter(e => e.animals.some(a => a.animalId === viewingAnimal?.id))}
                farmLocations={farmLocations}
            />

        </main>
    );
};
export default LivestockPlannerPage;

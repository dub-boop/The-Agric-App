import React, { useState, useMemo, useEffect } from 'react';
import { MenuIcon, PlusIcon, EditIcon, TrashIcon, INPUT_INVENTORY_DATA, TOOLS_EQUIPMENT_DATA, PRODUCE_INVENTORY_DATA, DISTRIBUTION_HISTORY_DATA, STORE_MANAGEMENT_TABS, ClipboardIcon, IncomeIcon, WarningIcon, CloseIcon, StockOutIcon, STOCK_OUT_REASONS, DownloadIcon, INPUT_CATEGORIES, EQUIPMENT_STATUSES } from '../constants';
import type { InputInventoryItem, ToolEquipmentItem, ProduceInventoryItem, DistributionRecord, FinancialDocument, RejectedFinancialDocument, EquipmentStatus, StockOutRecord, StockOutReason, Department, InputCategory, FarmLocation } from '../types';

// --- Helper Functions ---
const formatDateForInput = (date: Date): string => {
    return date.toISOString().split('T')[0];
}

const parseDateString = (dateString: string): Date => {
    if (!dateString) return new Date();
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
};

// --- Depreciation Calculation Helper ---
const calculateCurrentValue = (
    purchaseValue: number,
    salvageValue: number,
    usefulLifeInYears: number,
    purchaseDate: Date
): number => {
    const today = new Date();
    // Ensure purchaseDate is a valid Date object
    const pDate = purchaseDate instanceof Date && !isNaN(purchaseDate.valueOf()) ? purchaseDate : new Date();
    const yearsPassed = (today.getTime() - pDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);

    if (usefulLifeInYears <= 0 || yearsPassed <= 0) {
        return purchaseValue;
    }
    
    // If asset is past its useful life, value is the salvage value
    if (yearsPassed >= usefulLifeInYears) {
        return salvageValue;
    }

    const totalDepreciationValue = purchaseValue - salvageValue;
    const annualDepreciation = totalDepreciationValue / usefulLifeInYears;
    const accumulatedDepreciation = annualDepreciation * yearsPassed;

    const calculatedValue = purchaseValue - accumulatedDepreciation;

    // Value cannot be less than salvage value
    return Math.max(salvageValue, calculatedValue);
};

// --- Reusable Components ---
const inputClasses = "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-gray-700 bg-gray-50";

const FormField = ({ label, children }: { label: string, children: React.ReactNode }) => (
    <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
        {children}
    </div>
);

const MetricCard = ({ title, value, icon, color, description, onClick }: { title: string, value: string | number, icon: React.ReactNode, color: string, description?: string, onClick?: () => void }) => (
    <div onClick={onClick} className={`p-6 rounded-xl shadow-md flex flex-col justify-between ${color} ${onClick ? 'cursor-pointer' : ''}`}>
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

const EquipmentStatusBadge = ({ status }: { status: EquipmentStatus }) => {
    const colors = {
        Operational: "bg-green-100 text-green-800",
        'In Repair': "bg-yellow-100 text-yellow-800",
        Decommissioned: "bg-red-100 text-red-800",
    };
    return <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${colors[status]}`}>{status}</span>
}

const StockLevelBadge = ({ quantity, threshold }: { quantity: number, threshold: number }) => {
    const isLow = quantity < threshold;
    const color = isLow ? "text-red-700 font-semibold" : "text-gray-900";
    return <span className={color}>{quantity}</span>;
}

// --- Item Form Panel for Add/Edit ---
const ItemFormPanel = ({
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
    onSubmit: (data: InputInventoryItem) => void;
    mode: 'add' | 'edit';
    initialData: InputInventoryItem | null;
    farmLocations: FarmLocation[];
    selectedLocationId: number | 'all';
}) => {
    type ItemFormData = Partial<Omit<InputInventoryItem, 'id' | 'purchaseDate' | 'expiryDate'>> & {
        purchaseDate: string;
        expiryDate: string;
    };
    
    const [formData, setFormData] = useState<ItemFormData>({
        name: '',
        category: 'Seeds',
        quantity: 0,
        unit: 'kg',
        supplier: '',
        purchaseDate: formatDateForInput(new Date()),
        expiryDate: '',
        lowStockThreshold: 10,
        farmId: selectedLocationId === 'all' ? (farmLocations[0]?.id || 1) : selectedLocationId,
    });

    useEffect(() => {
        if (isOpen) {
            if (mode === 'edit' && initialData) {
                setFormData({
                    ...initialData,
                    purchaseDate: formatDateForInput(initialData.purchaseDate),
                    expiryDate: initialData.expiryDate ? formatDateForInput(initialData.expiryDate) : '',
                });
            } else {
                setFormData({
                    name: '',
                    category: 'Seeds',
                    quantity: 0,
                    unit: 'kg',
                    supplier: '',
                    purchaseDate: formatDateForInput(new Date()),
                    expiryDate: '',
                    lowStockThreshold: 10,
                    farmId: selectedLocationId === 'all' ? (farmLocations[0]?.id || 1) : selectedLocationId,
                });
            }
        }
    }, [isOpen, mode, initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? Number(value) : value,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const finalData: InputInventoryItem = {
            id: initialData?.id || `INP-${Date.now()}`,
            name: formData.name || '',
            category: formData.category || 'Other',
            quantity: Number(formData.quantity) || 0,
            unit: formData.unit || '',
            supplier: formData.supplier || '',
            purchaseDate: parseDateString(formData.purchaseDate),
            expiryDate: formData.expiryDate ? parseDateString(formData.expiryDate) : undefined,
            lowStockThreshold: Number(formData.lowStockThreshold) || 0,
            farmId: Number(formData.farmId),
        };
        
        onSubmit(finalData);
        onClose();
    };

    const title = mode === 'edit' ? 'Edit Inventory Item' : 'Add New Inventory Item';
    
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
                        <FormField label="Item Name">
                            <input type="text" name="name" value={formData.name} onChange={handleChange} className={inputClasses} required />
                        </FormField>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField label="Category">
                                <select name="category" value={formData.category} onChange={handleChange} className={inputClasses} required>
                                    {INPUT_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                </select>
                            </FormField>
                            <FormField label="Farm Location">
                                <select name="farmId" value={formData.farmId} onChange={handleChange} className={inputClasses} required>
                                    {farmLocations.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
                                </select>
                            </FormField>
                        </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField label="Quantity">
                                <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} className={inputClasses} required />
                            </FormField>
                             <FormField label="Unit">
                                <input type="text" name="unit" value={formData.unit} onChange={handleChange} className={inputClasses} placeholder="e.g., kg, Litres, 50kg Bags" required />
                            </FormField>
                         </div>
                         <FormField label="Supplier">
                            <input type="text" name="supplier" value={formData.supplier} onChange={handleChange} className={inputClasses} />
                        </FormField>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <FormField label="Purchase Date">
                                <input type="date" name="purchaseDate" value={formData.purchaseDate} onChange={handleChange} className={inputClasses} required />
                            </FormField>
                             <FormField label="Expiry Date (Optional)">
                                <input type="date" name="expiryDate" value={formData.expiryDate} onChange={handleChange} className={inputClasses} />
                            </FormField>
                        </div>
                        <FormField label="Low Stock Threshold">
                            <input type="number" name="lowStockThreshold" value={formData.lowStockThreshold} onChange={handleChange} className={inputClasses} required />
                        </FormField>
                    </div>
                    <footer className="p-6 border-t flex justify-end">
                        <button type="submit" className="bg-green-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors shadow-sm flex items-center">
                            {mode === 'edit' ? 'Save Changes' : 'Add Item'}
                        </button>
                    </footer>
                </form>
            </aside>
        </>
    )
};


// --- Form Panel for Stock Out ---
const StockOutFormPanel = ({
    isOpen,
    onClose,
    onSubmit,
    item
}: {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: Omit<StockOutRecord, 'id' | 'inputId' | 'inputName'>) => void;
    item: InputInventoryItem | null;
}) => {
    const [quantityRemoved, setQuantityRemoved] = useState(1);
    const [reason, setReason] = useState<StockOutReason>('Internal Use');
    const [department, setDepartment] = useState<Department>('Crop Dept.');
    const [responsiblePerson, setResponsiblePerson] = useState('');
    const [transactionType, setTransactionType] = useState('');
    const [transactionNumber, setTransactionNumber] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        if (item) {
            setQuantityRemoved(1);
            setReason('Internal Use');
            setDepartment('Crop Dept.');
            setResponsiblePerson('');
            setTransactionType('');
            setTransactionNumber('');
            setDate(new Date().toISOString().split('T')[0]);
        }
    }, [item, isOpen]);

    useEffect(() => {
        if (reason !== 'Sales') {
            setTransactionType('');
            setTransactionNumber('');
        }
         if (reason !== 'Internal Use') {
            setDepartment('Crop Dept.');
            setResponsiblePerson('');
        }
    }, [reason]);

    if (!isOpen || !item) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (quantityRemoved <= 0) {
            alert('Quantity must be greater than zero.');
            return;
        }
        if (quantityRemoved > item.quantity) {
            alert(`Cannot remove more than the available stock (${item.quantity}).`);
            return;
        }
         if (reason === 'Internal Use' && !responsiblePerson.trim()) {
            alert('Please enter the name of the person responsible for internal use.');
            return;
        }
        onSubmit({
            quantityRemoved,
            reason,
            transactionType: reason === 'Sales' ? transactionType : undefined,
            transactionNumber: reason === 'Sales' ? transactionNumber : undefined,
            department: reason === 'Internal Use' ? department : undefined,
            responsiblePerson: reason === 'Internal Use' ? responsiblePerson : undefined,
            date: new Date(`${date}T00:00:00`),
        });
    };

    return (
        <>
            <div className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose}></div>
            <aside className={`fixed top-0 right-0 h-full w-full max-w-lg bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <form onSubmit={handleSubmit} className="flex flex-col h-full">
                    <header className="p-6 border-b border-gray-200 flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-bold text-gray-800">Record Stock Out</h3>
                            <p className="text-sm text-gray-500">{item.name}</p>
                        </div>
                        <button type="button" onClick={onClose} className="p-1 rounded-full text-gray-500 hover:bg-gray-100"><CloseIcon /></button>
                    </header>
                    <div className="flex-grow p-6 overflow-y-auto space-y-6">
                        <FormField label="Number of Stocks Removed">
                            <input
                                type="number"
                                value={quantityRemoved}
                                onChange={e => setQuantityRemoved(Number(e.target.value))}
                                max={item.quantity}
                                min={1}
                                className={inputClasses}
                                required
                            />
                             <p className="text-xs text-gray-500 mt-1">Available: {item.quantity} {item.unit}</p>
                        </FormField>
                        <FormField label="Reason for Removal">
                            <select value={reason} onChange={e => setReason(e.target.value as StockOutReason)} className={inputClasses} required>
                                {STOCK_OUT_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                        </FormField>
                        
                         {reason === 'Internal Use' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 border rounded-lg bg-gray-50/50">
                                <FormField label="For (Department)">
                                    <select value={department} onChange={e => setDepartment(e.target.value as Department)} className={inputClasses} required>
                                        <option value="Crop Dept.">Crop Dept.</option>
                                        <option value="Livestock Dept.">Livestock Dept.</option>
                                        <option value="Processing">Processing</option>
                                    </select>
                                </FormField>
                                <FormField label="Care of (Person)">
                                    <input type="text" value={responsiblePerson} onChange={e => setResponsiblePerson(e.target.value)} className={inputClasses} placeholder="e.g., John Doe" required />
                                </FormField>
                            </div>
                        )}

                        {reason === 'Sales' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 border rounded-lg bg-gray-50/50">
                                <FormField label="Transaction Type">
                                    <input type="text" value={transactionType} onChange={e => setTransactionType(e.target.value)} className={inputClasses} placeholder="e.g., Cash, Bank Transfer" />
                                </FormField>
                                <FormField label="Transaction Number">
                                    <input type="text" value={transactionNumber} onChange={e => setTransactionNumber(e.target.value)} className={inputClasses} placeholder="e.g., Invoice #, Ref ID" />
                                </FormField>
                            </div>
                        )}

                        <FormField label="Date of Stock Out">
                            <input type="date" value={date} onChange={e => setDate(e.target.value)} className={inputClasses} required />
                        </FormField>
                    </div>
                    <footer className="p-6 border-t flex justify-end">
                        <button type="submit" className="bg-green-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors shadow-sm flex items-center">
                            Confirm Stock Out
                        </button>
                    </footer>
                </form>
            </aside>
        </>
    );
};

// --- Form Panel for Tools/Equipment ---
const ToolEquipmentFormPanel = ({
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
    onSubmit: (data: ToolEquipmentItem) => void;
    mode: 'add' | 'edit';
    initialData: ToolEquipmentItem | null;
    farmLocations: FarmLocation[];
    selectedLocationId: number | 'all';
}) => {
    type ToolFormData = Partial<Omit<ToolEquipmentItem, 'id' | 'purchaseDate' | 'lastMaintenance' | 'currentValue'>> & {
        purchaseDate?: string;
        lastMaintenance?: string;
    };

    const [formData, setFormData] = useState<ToolFormData>({});

    const calculatedValue = useMemo(() => {
        return calculateCurrentValue(
            Number(formData.purchaseValue) || 0,
            Number(formData.salvageValue) || 0,
            Number(formData.usefulLifeInYears) || 0,
            parseDateString(formData.purchaseDate || '')
        );
    }, [formData.purchaseValue, formData.salvageValue, formData.usefulLifeInYears, formData.purchaseDate]);

    useEffect(() => {
        if (isOpen) {
            if (mode === 'edit' && initialData) {
                setFormData({
                    ...initialData,
                    purchaseDate: formatDateForInput(initialData.purchaseDate),
                    lastMaintenance: initialData.lastMaintenance ? formatDateForInput(initialData.lastMaintenance) : '',
                });
            } else {
                setFormData({
                    name: '',
                    type: 'Tool',
                    farmId: selectedLocationId === 'all' ? (farmLocations[0]?.id || 1) : selectedLocationId,
                    purchaseDate: formatDateForInput(new Date()),
                    purchaseValue: 0,
                    status: 'Operational',
                    assignedTo: '',
                    lastMaintenance: '',
                    usefulLifeInYears: 5, // Default useful life
                    salvageValue: 0,
                });
            }
        }
    }, [isOpen, mode, initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? Number(value) : value,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const finalData: ToolEquipmentItem = {
            id: initialData?.id || `TOOL-${Date.now()}`,
            name: formData.name || '',
            type: formData.type || 'Tool',
            farmId: Number(formData.farmId),
            purchaseDate: parseDateString(formData.purchaseDate || ''),
            purchaseValue: Number(formData.purchaseValue) || 0,
            currentValue: calculatedValue, // Use the calculated value
            status: formData.status || 'Operational',
            assignedTo: formData.assignedTo,
            lastMaintenance: formData.lastMaintenance ? parseDateString(formData.lastMaintenance) : undefined,
            usefulLifeInYears: Number(formData.usefulLifeInYears) || 0,
            salvageValue: Number(formData.salvageValue) || 0,
        };

        onSubmit(finalData);
        onClose();
    };

    const title = mode === 'edit' ? 'Edit Tool/Equipment' : 'Add New Tool/Equipment';

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
                        <FormField label="Asset Name">
                            <input type="text" name="name" value={formData.name || ''} onChange={handleChange} className={inputClasses} required />
                        </FormField>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField label="Type">
                                <select name="type" value={formData.type} onChange={handleChange} className={inputClasses} required>
                                    <option value="Tool">Tool</option>
                                    <option value="Equipment">Equipment</option>
                                </select>
                            </FormField>
                            <FormField label="Status">
                                <select name="status" value={formData.status} onChange={handleChange} className={inputClasses} required>
                                    {EQUIPMENT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </FormField>
                        </div>
                        <FormField label="Farm Location">
                            <select name="farmId" value={formData.farmId} onChange={handleChange} className={inputClasses} required>
                                {farmLocations.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
                            </select>
                        </FormField>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <FormField label="Purchase Date">
                                <input type="date" name="purchaseDate" value={formData.purchaseDate || ''} onChange={handleChange} className={inputClasses} required />
                            </FormField>
                             <FormField label="Last Maintenance (Optional)">
                                <input type="date" name="lastMaintenance" value={formData.lastMaintenance || ''} onChange={handleChange} className={inputClasses} />
                            </FormField>
                        </div>
                        <div className="border-t pt-6 space-y-6">
                          <h4 className="text-md font-semibold text-gray-700">Valuation Details</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <FormField label="Purchase Value (₦)">
                                  <input type="number" name="purchaseValue" value={formData.purchaseValue || ''} onChange={handleChange} className={inputClasses} />
                              </FormField>
                              <FormField label="Useful Life (Years)">
                                  <input type="number" name="usefulLifeInYears" value={formData.usefulLifeInYears || ''} onChange={handleChange} className={inputClasses} />
                              </FormField>
                          </div>
                           <FormField label="Salvage Value (₦)">
                              <input type="number" name="salvageValue" value={formData.salvageValue || ''} onChange={handleChange} className={inputClasses} />
                          </FormField>
                           <FormField label="Current Value (₦) - Calculated">
                               <input type="text" value={`₦${calculatedValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} readOnly className={`${inputClasses} bg-gray-200 cursor-not-allowed`} />
                           </FormField>
                        </div>

                         <FormField label="Assigned To (Optional)">
                            <input type="text" name="assignedTo" value={formData.assignedTo || ''} onChange={handleChange} className={inputClasses} placeholder="e.g., Tractor Team" />
                        </FormField>
                    </div>
                    <footer className="p-6 border-t flex justify-end">
                        <button type="submit" className="bg-green-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors shadow-sm flex items-center">
                            {mode === 'edit' ? 'Save Changes' : 'Add Asset'}
                        </button>
                    </footer>
                </form>
            </aside>
        </>
    );
};

// --- Form Panel for Produce ---
const ProduceFormPanel = ({
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
    onSubmit: (data: ProduceInventoryItem) => void;
    mode: 'add' | 'edit';
    initialData: ProduceInventoryItem | null;
    farmLocations: FarmLocation[];
    selectedLocationId: number | 'all';
}) => {
    type ProduceFormData = Partial<Omit<ProduceInventoryItem, 'id' | 'harvestDate'>> & {
        harvestDate: string;
    };
    
    const [formData, setFormData] = useState<ProduceFormData>({
        produceName: '',
        quantity: 0,
        unit: 'kg',
        harvestDate: formatDateForInput(new Date()),
        storageLocation: '',
        farmId: selectedLocationId === 'all' ? (farmLocations[0]?.id || 1) : selectedLocationId
    });

    useEffect(() => {
        if (isOpen) {
            if (mode === 'edit' && initialData) {
                setFormData({
                    ...initialData,
                    harvestDate: formatDateForInput(initialData.harvestDate),
                });
            } else {
                setFormData({
                    produceName: '',
                    quantity: 0,
                    unit: 'kg',
                    harvestDate: formatDateForInput(new Date()),
                    storageLocation: '',
                    farmId: selectedLocationId === 'all' ? (farmLocations[0]?.id || 1) : selectedLocationId
                });
            }
        }
    }, [isOpen, mode, initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? Number(value) : value,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const finalData: ProduceInventoryItem = {
            id: initialData?.id || `PROD-${Date.now()}`,
            produceName: formData.produceName || '',
            quantity: Number(formData.quantity) || 0,
            unit: formData.unit || '',
            harvestDate: parseDateString(formData.harvestDate || ''),
            storageLocation: formData.storageLocation || '',
            farmId: Number(formData.farmId),
        };
        
        onSubmit(finalData);
        onClose();
    };

    const title = mode === 'edit' ? 'Edit Produce Stock' : 'Add New Harvest';
    
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
                        <FormField label="Produce Name">
                            <input type="text" name="produceName" value={formData.produceName || ''} onChange={handleChange} className={inputClasses} required />
                        </FormField>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField label="Quantity">
                                <input type="number" name="quantity" value={formData.quantity || ''} onChange={handleChange} className={inputClasses} required />
                            </FormField>
                            <FormField label="Unit">
                                <input type="text" name="unit" value={formData.unit || ''} onChange={handleChange} className={inputClasses} placeholder="e.g., kg, Tonnes, Bags" required />
                            </FormField>
                        </div>
                        <FormField label="Harvest Date">
                            <input type="date" name="harvestDate" value={formData.harvestDate || ''} onChange={handleChange} className={inputClasses} required />
                        </FormField>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField label="Storage Location">
                                <input type="text" name="storageLocation" value={formData.storageLocation || ''} onChange={handleChange} className={inputClasses} placeholder="e.g., Silo 1, Barn A" />
                            </FormField>
                            <FormField label="Farm Location">
                                <select name="farmId" value={formData.farmId} onChange={handleChange} className={inputClasses} required>
                                    {farmLocations.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
                                </select>
                            </FormField>
                        </div>
                    </div>
                    <footer className="p-6 border-t flex justify-end">
                        <button type="submit" className="bg-green-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors shadow-sm flex items-center">
                            {mode === 'edit' ? 'Save Changes' : 'Add Harvest'}
                        </button>
                    </footer>
                </form>
            </aside>
        </>
    );
};

// --- Form Panel for Produce Stock Out ---
const ProduceStockOutFormPanel = ({
    isOpen,
    onClose,
    onSubmit,
    item
}: {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: Omit<DistributionRecord, 'id' | 'produceId' | 'produceName' | 'unit'>) => void;
    item: ProduceInventoryItem | null;
}) => {
    const [quantity, setQuantity] = useState(1);
    const [reason, setReason] = useState<StockOutReason>('Internal Use');
    const [department, setDepartment] = useState<Department>('Crop Dept.');
    const [responsiblePerson, setResponsiblePerson] = useState('');
    const [transactionType, setTransactionType] = useState('');
    const [transactionNumber, setTransactionNumber] = useState('');
    const [date, setDate] = useState(formatDateForInput(new Date()));

    useEffect(() => {
        if (isOpen) {
            setQuantity(1);
            setReason('Internal Use');
            setDepartment('Crop Dept.');
            setResponsiblePerson('');
            setTransactionType('');
            setTransactionNumber('');
            setDate(formatDateForInput(new Date()));
        }
    }, [isOpen]);
    
    useEffect(() => {
        if (reason !== 'Sales') {
            setTransactionType('');
            setTransactionNumber('');
        }
        if (reason !== 'Internal Use') {
            setDepartment('Crop Dept.');
            setResponsiblePerson('');
        }
    }, [reason]);

    if (!isOpen || !item) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (quantity <= 0 || quantity > item.quantity) {
            alert(`Quantity must be between 1 and ${item.quantity}.`);
            return;
        }
        if (reason === 'Internal Use' && !responsiblePerson.trim()) {
            alert('Please enter the name of the person responsible for internal use.');
            return;
        }
        
        onSubmit({
            quantity,
            reason,
            date: parseDateString(date),
            department: reason === 'Internal Use' ? department : undefined,
            responsiblePerson: reason === 'Internal Use' ? responsiblePerson : undefined,
            transactionType: reason === 'Sales' ? transactionType : undefined,
            transactionNumber: reason === 'Sales' ? transactionNumber : undefined,
        });
    };

    return (
         <>
            <div className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose}></div>
            <aside className={`fixed top-0 right-0 h-full w-full max-w-lg bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <form onSubmit={handleSubmit} className="flex flex-col h-full">
                    <header className="p-6 border-b border-gray-200 flex items-center justify-between">
                        <div>
                           <h3 className="text-xl font-bold text-gray-800">Record Produce Distribution</h3>
                           <p className="text-sm text-gray-500">{item.produceName}</p>
                        </div>
                        <button type="button" onClick={onClose} className="p-1 rounded-full text-gray-500 hover:bg-gray-100"><CloseIcon /></button>
                    </header>
                    <div className="flex-grow p-6 overflow-y-auto space-y-6">
                        <FormField label="Quantity Distributed">
                            <input type="number" value={quantity} onChange={e => setQuantity(Number(e.target.value))} max={item.quantity} min="1" className={inputClasses} required/>
                            <p className="text-xs text-gray-500 mt-1">Available: {item.quantity} {item.unit}</p>
                        </FormField>
                        <FormField label="Reason for Distribution">
                            <select value={reason} onChange={e => setReason(e.target.value as StockOutReason)} className={inputClasses} required>
                                {STOCK_OUT_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                        </FormField>
                        
                        {reason === 'Internal Use' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 border rounded-lg bg-gray-50/50">
                                <FormField label="For (Department)">
                                    <select value={department} onChange={e => setDepartment(e.target.value as Department)} className={inputClasses} required>
                                        <option value="Crop Dept.">Crop Dept.</option>
                                        <option value="Livestock Dept.">Livestock Dept.</option>
                                        <option value="Processing">Processing</option>
                                    </select>
                                </FormField>
                                <FormField label="Care of (Person)">
                                    <input type="text" value={responsiblePerson} onChange={e => setResponsiblePerson(e.target.value)} className={inputClasses} placeholder="e.g., John Doe" required />
                                </FormField>
                            </div>
                        )}

                        {reason === 'Sales' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 border rounded-lg bg-gray-50/50">
                                <FormField label="Transaction Type">
                                    <input type="text" value={transactionType} onChange={e => setTransactionType(e.target.value)} className={inputClasses} placeholder="e.g., Cash, Bank Transfer" />
                                </FormField>
                                <FormField label="Transaction Number">
                                    <input type="text" value={transactionNumber} onChange={e => setTransactionNumber(e.target.value)} className={inputClasses} placeholder="e.g., Invoice #, Ref ID" />
                                </FormField>
                            </div>
                        )}

                        <FormField label="Date of Distribution">
                            <input type="date" value={date} onChange={e => setDate(e.target.value)} className={inputClasses} required />
                        </FormField>
                    </div>
                     <footer className="p-6 border-t flex justify-end">
                        <button type="submit" className="bg-green-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors shadow-sm flex items-center">
                            Confirm Distribution
                        </button>
                    </footer>
                </form>
            </aside>
        </>
    );
};


// --- Tab Components ---

const InputsInventoryTab = ({ inventory, setInventory, farmLocations, selectedLocationId }: {
    inventory: InputInventoryItem[];
    setInventory: React.Dispatch<React.SetStateAction<InputInventoryItem[]>>;
    farmLocations: FarmLocation[];
    selectedLocationId: number | 'all';
}) => {
    const [stockOutHistory, setStockOutHistory] = useState<StockOutRecord[]>([]);
    
    // States for stock out form
    const [isStockOutFormOpen, setIsStockOutFormOpen] = useState(false);
    const [selectedItemForStockOut, setSelectedItemForStockOut] = useState<InputInventoryItem | null>(null);

    // States for item add/edit form
    const [isItemFormOpen, setIsItemFormOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<InputInventoryItem | null>(null);
    const [itemFormMode, setItemFormMode] = useState<'add' | 'edit'>('add');
    
    const handleOpenStockOutForm = (item: InputInventoryItem) => {
        setSelectedItemForStockOut(item);
        setIsStockOutFormOpen(true);
    };

    const handleStockOutSubmit = (data: Omit<StockOutRecord, 'id' | 'inputId' | 'inputName'>) => {
        if (!selectedItemForStockOut) return;
    
        setInventory(prev => 
            prev.map(item => 
                item.id === selectedItemForStockOut.id
                    ? { ...item, quantity: item.quantity - data.quantityRemoved }
                    : item
            )
        );
    
        const newRecord: StockOutRecord = {
            id: `SO-${Date.now()}`,
            inputId: selectedItemForStockOut.id,
            inputName: selectedItemForStockOut.name,
            ...data
        };
        setStockOutHistory(prev => [newRecord, ...prev].sort((a,b) => b.date.getTime() - a.date.getTime()));
    
        setIsStockOutFormOpen(false);
        setSelectedItemForStockOut(null);
    };

    // New handlers for item CRUD
    const handleOpenAddItemForm = () => {
        setEditingItem(null);
        setItemFormMode('add');
        setIsItemFormOpen(true);
    };

    const handleOpenEditItemForm = (item: InputInventoryItem) => {
        setEditingItem(item);
        setItemFormMode('edit');
        setIsItemFormOpen(true);
    };

    const handleDeleteItem = (id: string) => {
        if (window.confirm('Are you sure you want to delete this inventory item? This action cannot be undone.')) {
            setInventory(prev => prev.filter(item => item.id !== id));
        }
    };
    
    const handleItemFormSubmit = (data: InputInventoryItem) => {
        if (itemFormMode === 'add') {
            setInventory(prev => [data, ...prev].sort((a, b) => a.name.localeCompare(b.name)));
        } else {
            setInventory(prev => prev.map(item => item.id === data.id ? data : item));
        }
        setIsItemFormOpen(false);
        setEditingItem(null);
    };

    const handleExportInventoryCSV = () => {
        if (inventory.length === 0) return;

        const headers = ['ID', 'Name', 'Category', 'Quantity', 'Unit', 'Supplier', 'Purchase Date', 'Expiry Date', 'Low Stock Threshold'];
        const rows = inventory.map(item => {
            const rowData = [
                item.id,
                item.name,
                item.category,
                item.quantity,
                item.unit,
                item.supplier,
                item.purchaseDate.toLocaleDateString('en-GB'),
                item.expiryDate ? item.expiryDate.toLocaleDateString('en-GB') : '',
                item.lowStockThreshold
            ];
            return rowData.map(val => `"${String(val ?? '').replace(/"/g, '""')}"`).join(',');
        });

        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
        const link = document.createElement('a');
        link.setAttribute('href', encodeURI(csvContent));
        link.setAttribute('download', `inputs_inventory_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleExportStockOutHistoryCSV = () => {
        if (stockOutHistory.length === 0) return;
    
        const headers = ['Date', 'Item Name', 'Quantity Removed', 'Unit', 'Reason', 'Department', 'Responsible Person', 'Transaction Type', 'Transaction Number'];
        
        const unitMap = new Map<string, string>();
        inventory.forEach(item => { // Use current inventory for units
            unitMap.set(item.id, item.unit);
        });

        const rows = stockOutHistory.map(record => {
            const unit = unitMap.get(record.inputId) || '';
            const rowData = [
                record.date.toLocaleDateString('en-GB'),
                record.inputName,
                record.quantityRemoved,
                unit,
                record.reason,
                record.department || '',
                record.responsiblePerson || '',
                record.transactionType || '',
                record.transactionNumber || ''
            ];
            return rowData.map(val => `"${String(val ?? '').replace(/"/g, '""')}"`).join(',');
        });

        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
        const link = document.createElement('a');
        link.setAttribute('href', encodeURI(csvContent));
        link.setAttribute('download', `stock_out_history_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const lowStockCount = useMemo(() => inventory.filter(i => i.quantity < i.lowStockThreshold).length, [inventory]);
    const expiringSoonCount = useMemo(() => {
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        return inventory.filter(i => i.expiryDate && new Date(i.expiryDate) <= thirtyDaysFromNow).length;
    }, [inventory]);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard title="Total Input Types" value={inventory.length} icon={<ClipboardIcon className="w-8 h-8 text-white/80" />} color="bg-blue-500 text-white" />
                <MetricCard title="Low Stock Alerts" value={lowStockCount} icon={<WarningIcon className="w-8 h-8 text-white/80" />} color="bg-yellow-500 text-white" />
                <MetricCard title="Expiring Soon" value={expiringSoonCount} description="In next 30 days" icon={<WarningIcon className="w-8 h-8 text-white/80" />} color="bg-orange-500 text-white" />
                 <div onClick={handleOpenAddItemForm} className="bg-green-500 text-white p-6 rounded-xl shadow-md flex flex-col items-center justify-center text-center cursor-pointer hover:bg-green-600 transition-colors">
                    <div className="bg-white/20 p-4 rounded-full">
                        <PlusIcon className="h-8 w-8 text-white" />
                    </div>
                    <p className="font-semibold mt-3">Add New Input</p>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex justify-between items-center mb-4">
                    <h4 className="font-semibold text-gray-800 text-lg">Inputs Inventory List</h4>
                    <button
                        onClick={handleExportInventoryCSV}
                        disabled={inventory.length === 0}
                        className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-50 transition-colors shadow-sm flex items-center text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <DownloadIcon className="h-5 w-5" />
                        <span className="ml-2 hidden sm:inline">Export CSV</span>
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {inventory.map(item => (
                                <tr key={item.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.category}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm"><StockLevelBadge quantity={item.quantity} threshold={item.lowStockThreshold} /> <span className="text-gray-500">{item.unit}</span></td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.supplier}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.expiryDate ? new Date(item.expiryDate).toLocaleDateString('en-GB') : 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                        <button onClick={() => handleOpenStockOutForm(item)} className="text-green-600 hover:text-green-800 p-1 rounded-full hover:bg-green-100 transition-colors" title="Record Stock Out">
                                            <StockOutIcon />
                                        </button>
                                        <button onClick={() => handleOpenEditItemForm(item)} className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-100" title="Edit Item"><EditIcon /></button>
                                        <button onClick={() => handleDeleteItem(item.id)} className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-100" title="Delete Item"><TrashIcon /></button>
                                    </td>
                                </tr>
                            ))}
                             {inventory.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="text-center py-10 text-gray-500">No inventory items found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex justify-between items-center mb-4">
                    <h4 className="font-semibold text-gray-800 text-lg">Stock Out History</h4>
                    <button
                        onClick={handleExportStockOutHistoryCSV}
                        disabled={stockOutHistory.length === 0}
                        className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-50 transition-colors shadow-sm flex items-center text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <DownloadIcon className="h-5 w-5" />
                        <span className="ml-2 hidden sm:inline">Export CSV</span>
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {stockOutHistory.length > 0 ? stockOutHistory.map(record => (
                                <tr key={record.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.date.toLocaleDateString('en-GB')}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{record.inputName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.quantityRemoved}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.reason}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {record.reason === 'Sales' && `Ref: ${record.transactionNumber || 'N/A'}`}
                                        {record.reason === 'Internal Use' && `${record.department}, Care of: ${record.responsiblePerson}`}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="text-center py-8 text-gray-500">No stock out records found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <ItemFormPanel
                isOpen={isItemFormOpen}
                onClose={() => setIsItemFormOpen(false)}
                onSubmit={handleItemFormSubmit}
                mode={itemFormMode}
                initialData={editingItem}
                farmLocations={farmLocations}
                selectedLocationId={selectedLocationId}
            />

             <StockOutFormPanel 
                isOpen={isStockOutFormOpen}
                onClose={() => setIsStockOutFormOpen(false)}
                onSubmit={handleStockOutSubmit}
                item={selectedItemForStockOut}
            />
        </div>
    );
};

const ToolsEquipmentTab = ({ assets, setAssets, farmLocations, selectedLocationId }: {
    assets: ToolEquipmentItem[];
    setAssets: React.Dispatch<React.SetStateAction<ToolEquipmentItem[]>>;
    farmLocations: FarmLocation[];
    selectedLocationId: number | 'all';
}) => {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingAsset, setEditingAsset] = useState<ToolEquipmentItem | null>(null);
    const [formMode, setFormMode] = useState<'add' | 'edit'>('add');

    const totalValue = useMemo(() => assets.reduce((sum, asset) => sum + asset.currentValue, 0), [assets]);
    const inRepairCount = useMemo(() => assets.filter(a => a.status === 'In Repair').length, [assets]);

    const handleOpenAddForm = () => {
        setEditingAsset(null);
        setFormMode('add');
        setIsFormOpen(true);
    };

    const handleOpenEditForm = (asset: ToolEquipmentItem) => {
        setEditingAsset(asset);
        setFormMode('edit');
        setIsFormOpen(true);
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Are you sure you want to delete this asset record?')) {
            setAssets(prev => prev.filter(a => a.id !== id));
        }
    };

    const handleFormSubmit = (data: ToolEquipmentItem) => {
        if (formMode === 'add') {
            setAssets(prev => [data, ...prev].sort((a,b) => a.name.localeCompare(b.name)));
        } else {
            setAssets(prev => prev.map(a => a.id === data.id ? data : a));
        }
        setIsFormOpen(false);
        setEditingAsset(null);
    };

    const handleExportCSV = () => {
        if (assets.length === 0) return;
        
        const headers = ['ID', 'Name', 'Type', 'Status', 'Purchase Date', 'Purchase Value', 'Current Value', 'Last Maintenance', 'Assigned To'];
        const rows = assets.map(asset => {
            return [
                asset.id,
                asset.name,
                asset.type,
                asset.status,
                asset.purchaseDate.toLocaleDateString('en-GB'),
                asset.purchaseValue,
                asset.currentValue,
                asset.lastMaintenance ? asset.lastMaintenance.toLocaleDateString('en-GB') : 'N/A',
                asset.assignedTo || 'N/A'
            ].map(val => `"${String(val ?? '').replace(/"/g, '""')}"`).join(',');
        });

        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
        const link = document.createElement('a');
        link.setAttribute('href', encodeURI(csvContent));
        link.setAttribute('download', `tools_equipment_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                 <MetricCard title="Total Asset Value" value={`₦${(totalValue / 1000000).toFixed(2)}M`} icon={<IncomeIcon className="w-8 h-8 text-white/80" />} color="bg-purple-600 text-white" />
                 <MetricCard title="Items in Repair" value={inRepairCount} icon={<WarningIcon className="w-8 h-8 text-white/80" />} color="bg-yellow-500 text-white" />
                 <div onClick={handleOpenAddForm} className="bg-green-500 text-white p-6 rounded-xl shadow-md flex flex-col items-center justify-center text-center col-span-1 sm:col-span-2 lg:col-span-2 cursor-pointer hover:bg-green-600 transition-colors">
                    <div className="bg-white/20 hover:bg-white/30 p-4 rounded-full transition-colors">
                        <PlusIcon className="h-8 w-8 text-white" />
                    </div>
                    <p className="font-semibold mt-3">Add New Tool/Equipment</p>
                </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md">
                 <div className="flex justify-between items-center mb-4">
                    <h4 className="font-semibold text-gray-800 text-lg">Asset List</h4>
                     <button
                        onClick={handleExportCSV}
                        disabled={assets.length === 0}
                        className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-50 transition-colors shadow-sm flex items-center text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <DownloadIcon className="h-5 w-5" />
                        <span className="ml-2 hidden sm:inline">Export CSV</span>
                    </button>
                </div>
                 <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asset Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purchase Value</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Value</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {assets.map(item => (
                                <tr key={item.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.type}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₦{item.purchaseValue.toLocaleString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 font-semibold">₦{item.currentValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                                    <td className="px-6 py-4 whitespace-nowrap"><EquipmentStatusBadge status={item.status} /></td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                        <button onClick={() => handleOpenEditForm(item)} className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-100 transition-colors" title="Edit Asset"><EditIcon /></button>
                                        <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-100 transition-colors" title="Delete Asset"><TrashIcon /></button>
                                    </td>
                                </tr>
                            ))}
                            {assets.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="text-center py-10 text-gray-500">No assets found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
             <ToolEquipmentFormPanel
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSubmit={handleFormSubmit}
                mode={formMode}
                initialData={editingAsset}
                farmLocations={farmLocations}
                selectedLocationId={selectedLocationId}
            />
        </div>
    )
};

const ProduceInventoryTab = ({ stock, setStock, farmLocations, selectedLocationId }: {
    stock: ProduceInventoryItem[];
    setStock: React.Dispatch<React.SetStateAction<ProduceInventoryItem[]>>;
    farmLocations: FarmLocation[];
    selectedLocationId: number | 'all';
}) => {
    const [history, setHistory] = useState<DistributionRecord[]>(DISTRIBUTION_HISTORY_DATA);

    // State for modals/forms
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formMode, setFormMode] = useState<'add' | 'edit'>('add');
    const [editingItem, setEditingItem] = useState<ProduceInventoryItem | null>(null);

    const [isStockOutOpen, setIsStockOutOpen] = useState(false);
    const [itemForStockOut, setItemForStockOut] = useState<ProduceInventoryItem | null>(null);

    // Handlers
    const handleOpenAdd = () => {
        setEditingItem(null);
        setFormMode('add');
        setIsFormOpen(true);
    };

    const handleOpenEdit = (item: ProduceInventoryItem) => {
        setEditingItem(item);
        setFormMode('edit');
        setIsFormOpen(true);
    };

    const handleDelete = (id: string) => {
        if (window.confirm("Are you sure you want to delete this produce record? This action cannot be undone.")) {
            setStock(prev => prev.filter(item => item.id !== id));
        }
    };

    const handleFormSubmit = (data: ProduceInventoryItem) => {
        if (formMode === 'add') {
            setStock(prev => [data, ...prev].sort((a,b) => a.produceName.localeCompare(b.produceName)));
        } else {
            setStock(prev => prev.map(item => item.id === data.id ? data : item));
        }
        setIsFormOpen(false);
    };
    
    const handleOpenStockOut = (item: ProduceInventoryItem) => {
        setItemForStockOut(item);
        setIsStockOutOpen(true);
    };

    const handleStockOutSubmit = (data: Omit<DistributionRecord, 'id' | 'produceId' | 'produceName' | 'unit'>) => {
        if (!itemForStockOut) return;

        setStock(prev => prev.map(item =>
            item.id === itemForStockOut.id
                ? { ...item, quantity: item.quantity - data.quantity }
                : item
        ));
        
        const newHistoryRecord: DistributionRecord = {
            id: `DIST-${Date.now()}`,
            produceId: itemForStockOut.id,
            produceName: itemForStockOut.produceName,
            unit: itemForStockOut.unit,
            ...data
        };
        setHistory(prev => [newHistoryRecord, ...prev].sort((a, b) => b.date.getTime() - a.date.getTime()));

        setIsStockOutOpen(false);
    };

    const latestHarvest = useMemo(() => {
        if (stock.length === 0) return null;
        return stock.reduce((latest, current) => new Date(current.harvestDate) > new Date(latest.harvestDate) ? current : latest);
    }, [stock]);

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard title="Produce Varieties" value={stock.length} icon={<ClipboardIcon className="w-8 h-8 text-white/80" />} color="bg-teal-500 text-white" />
                <MetricCard 
                    title="Latest Harvest" 
                    value={latestHarvest ? latestHarvest.produceName : 'N/A'} 
                    description={latestHarvest ? new Date(latestHarvest.harvestDate).toLocaleDateString('en-GB') : ''}
                    icon={<IncomeIcon className="w-8 h-8 text-white/80" />} 
                    color="bg-sky-500 text-white" 
                />
                <MetricCard title="Distributions Logged" value={history.length} icon={<ClipboardIcon className="w-8 h-8 text-white/80" />} color="bg-indigo-500 text-white" />
                <div onClick={handleOpenAdd} className="bg-green-500 text-white p-6 rounded-xl shadow-md flex flex-col items-center justify-center text-center cursor-pointer hover:bg-green-600 transition-colors">
                    <div className="bg-white/20 p-4 rounded-full">
                        <PlusIcon className="h-8 w-8 text-white" />
                    </div>
                    <p className="font-semibold mt-3">Add New Harvest</p>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
                 <div className="flex justify-between items-center mb-4">
                    <h4 className="font-semibold text-gray-800 text-lg">Current Produce Stock</h4>
                 </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produce Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Harvest Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Storage Location</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {stock.map(item => (
                                <tr key={item.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.produceName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.quantity.toLocaleString()} <span className="text-gray-500">{item.unit}</span></td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.harvestDate.toLocaleDateString('en-GB')}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.storageLocation}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                        <button onClick={() => handleOpenStockOut(item)} className="text-green-600 hover:text-green-800 p-1 rounded-full hover:bg-green-100 transition-colors" title="Record Distribution">
                                            <StockOutIcon />
                                        </button>
                                        <button onClick={() => handleOpenEdit(item)} className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-100" title="Edit Item"><EditIcon /></button>
                                        <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-100" title="Delete Item"><TrashIcon /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md">
                <h4 className="font-semibold text-gray-800 mb-4 text-lg">Produce Stock Out History</h4>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                         <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produce Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                            </tr>
                        </thead>
                         <tbody className="bg-white divide-y divide-gray-200">
                            {history.map(item => (
                                <tr key={item.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.date.toLocaleDateString('en-GB')}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.produceName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.quantity.toLocaleString()} <span className="text-gray-500">{item.unit}</span></td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.reason}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {item.reason === 'Sales' && `Ref: ${item.transactionNumber || 'N/A'}`}
                                        {item.reason === 'Internal Use' && `${item.department}, Care of: ${item.responsiblePerson}`}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <ProduceFormPanel
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSubmit={handleFormSubmit}
                mode={formMode}
                initialData={editingItem}
                farmLocations={farmLocations}
                selectedLocationId={selectedLocationId}
            />

            <ProduceStockOutFormPanel
                isOpen={isStockOutOpen}
                onClose={() => setIsStockOutOpen(false)}
                onSubmit={handleStockOutSubmit}
                item={itemForStockOut}
            />
        </div>
    )
};

const AwaitingConfirmationTab = ({
    documents,
    setDocuments,
    setRejectedDocuments,
    setIncomeRecords,
    setExpenditureRecords
}: {
    documents: FinancialDocument[],
    setDocuments: React.Dispatch<React.SetStateAction<FinancialDocument[]>>,
    setRejectedDocuments: React.Dispatch<React.SetStateAction<RejectedFinancialDocument[]>>,
    setIncomeRecords: React.Dispatch<React.SetStateAction<FinancialDocument[]>>,
    setExpenditureRecords: React.Dispatch<React.SetStateAction<FinancialDocument[]>>,
}) => {
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [selectedDoc, setSelectedDoc] = useState<FinancialDocument | null>(null);
    const [expandedDocId, setExpandedDocId] = useState<string | null>(null);
    
    const handleConfirm = () => {
        if (!selectedDoc) return;

        const docToLog = documents.find(d => d.id === selectedDoc.id);
        if (!docToLog) return;
        
        if (docToLog.documentType === 'Receipt') {
            setIncomeRecords(prev => [docToLog, ...prev]);
        } else {
            setExpenditureRecords(prev => [docToLog, ...prev]);
        }

        setDocuments(docs => docs.filter(d => d.id !== selectedDoc.id));
        setIsConfirmModalOpen(false);
        setSelectedDoc(null);
    };

    const openConfirmModal = (doc: FinancialDocument) => {
        setSelectedDoc(doc);
        setIsConfirmModalOpen(true);
    };
    
    const openRejectModal = (doc: FinancialDocument) => {
        setSelectedDoc(doc);
        setIsRejectModalOpen(true);
    };
    
    const handleRejectSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedDoc || !rejectionReason.trim()) {
            alert("Please provide a reason for rejection.");
            return;
        }

        const rejectedDoc: RejectedFinancialDocument = {
            ...selectedDoc,
            reasonForRejection: rejectionReason,
        };

        setRejectedDocuments(prev => [rejectedDoc, ...prev]);
        setDocuments(prev => prev.filter(d => d.id !== selectedDoc.id));

        setIsRejectModalOpen(false);
        setRejectionReason('');
        setSelectedDoc(null);
    };

    const toggleExpand = (docId: string) => {
        setExpandedDocId(prevId => prevId === docId ? null : docId);
    };

    return (
        <>
            <div className="space-y-6">
                {documents.map(doc => (
                     <div key={doc.id} className="bg-white rounded-xl shadow-md border border-gray-200/80 overflow-hidden">
                        <div className="p-6 cursor-pointer hover:bg-gray-50" onClick={() => toggleExpand(doc.id)}>
                            <div className="flex flex-wrap justify-between items-start gap-4">
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{doc.documentType} #{doc.id}</p>
                                    <h4 className="text-lg font-bold text-gray-800 mt-1">{doc.customerName}</h4>
                                    <p className="text-sm text-gray-500">{doc.category} - {doc.date.toLocaleDateString()} </p>
                                </div>
                                <div className="text-right">
                                     <p className="text-sm text-gray-500">Total</p>
                                     <p className="text-2xl font-bold text-gray-800">₦{doc.totalAmount.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>

                         <div className={`transition-all duration-500 ease-in-out ${expandedDocId === doc.id ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                            <div className="px-6 pb-4 border-t border-gray-200">
                                <h5 className="text-sm font-semibold text-gray-600 my-2">Items:</h5>
                                <ul className="space-y-1 text-sm list-disc list-inside">
                                    {doc.items.map((item, index) => (
                                        <li key={index} className="text-gray-700">
                                            {item.name} - {item.quantity} {item.unit} @ ₦{item.unitPrice.toLocaleString()} each
                                        </li>
                                    ))}
                                </ul>
                            </div>
                         </div>
                         <div className="flex justify-end items-center gap-3 p-4 bg-gray-50/50 border-t">
                            <button onClick={() => openRejectModal(doc)} className="px-4 py-2 rounded-md text-sm font-semibold bg-red-100 text-red-700 hover:bg-red-200 transition-colors">Reject</button>
                            <button onClick={() => openConfirmModal(doc)} className="px-4 py-2 rounded-md text-sm font-semibold bg-green-600 text-white hover:bg-green-700 transition-colors shadow-sm">Review & Confirm</button>
                        </div>
                     </div>
                ))}
                {documents.length === 0 && (
                    <div className="bg-white rounded-xl shadow-md p-12 text-center text-gray-500">
                        <p className="text-lg">No pending documents to confirm.</p>
                    </div>
                )}
            </div>
            
            {/* Confirmation Modal */}
            {isConfirmModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                        <div className="p-6 text-center">
                            <h3 className="text-lg font-bold text-gray-900">Confirm Document</h3>
                            <p className="text-sm text-gray-600 mt-2">
                                This will log the transaction in your farm records. The Store Manager is expected to update inventory levels manually. Do you want to proceed?
                            </p>
                        </div>
                        <div className="bg-gray-50 px-6 py-3 flex justify-center gap-3">
                            <button type="button" onClick={() => setIsConfirmModalOpen(false)} className="px-4 py-2 rounded-md text-sm font-semibold bg-gray-200 text-gray-800 hover:bg-gray-300">Cancel</button>
                            <button type="button" onClick={handleConfirm} className="px-4 py-2 rounded-md text-sm font-semibold bg-green-600 text-white hover:bg-green-700">Yes, Confirm</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Rejection Modal */}
            {isRejectModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                        <form onSubmit={handleRejectSubmit}>
                            <div className="p-6">
                                <h3 className="text-lg font-bold text-gray-900">Reason for Rejection</h3>
                                <p className="text-sm text-gray-500 mt-1">Provide a clear reason for rejecting this document.</p>
                                <textarea
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    className={`${inputClasses} mt-4`}
                                    rows={4}
                                    placeholder="e.g., Incorrect quantity for item X..."
                                    required
                                ></textarea>
                            </div>
                            <div className="bg-gray-50 px-6 py-3 flex justify-end gap-3">
                                <button type="button" onClick={() => setIsRejectModalOpen(false)} className="px-4 py-2 rounded-md text-sm font-semibold bg-gray-200 text-gray-800 hover:bg-gray-300">Cancel</button>
                                <button type="submit" className="px-4 py-2 rounded-md text-sm font-semibold bg-red-600 text-white hover:bg-red-700">Submit Rejection</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    )
}

// --- Main Page Component ---
interface StoreManagementPageProps {
    setSidebarOpen: (isOpen: boolean) => void;
    pendingDocuments: FinancialDocument[];
    setPendingDocuments: React.Dispatch<React.SetStateAction<FinancialDocument[]>>;
    setRejectedDocuments: React.Dispatch<React.SetStateAction<RejectedFinancialDocument[]>>;
    setIncomeRecords: React.Dispatch<React.SetStateAction<FinancialDocument[]>>;
    setExpenditureRecords: React.Dispatch<React.SetStateAction<FinancialDocument[]>>;
    farmLocations: FarmLocation[];
    selectedLocationId: number | 'all';
    setSelectedLocationId: (id: number | 'all') => void;
    inputsInventory: InputInventoryItem[];
    setInputsInventory: React.Dispatch<React.SetStateAction<InputInventoryItem[]>>;
    toolsEquipment: ToolEquipmentItem[];
    setToolsEquipment: React.Dispatch<React.SetStateAction<ToolEquipmentItem[]>>;
}

const StoreManagementPage = ({ 
    setSidebarOpen, 
    pendingDocuments, 
    setPendingDocuments, 
    setRejectedDocuments, 
    setIncomeRecords, 
    setExpenditureRecords,
    farmLocations,
    selectedLocationId,
    setSelectedLocationId,
    inputsInventory,
    setInputsInventory,
    toolsEquipment,
    setToolsEquipment,
}: StoreManagementPageProps) => {
    const [activeTab, setActiveTab] = useState(STORE_MANAGEMENT_TABS[0]);
    
    // States for inventory data
    const [produceInventory, setProduceInventory] = useState<ProduceInventoryItem[]>(PRODUCE_INVENTORY_DATA);
    
    // Filtered data based on location
    const filteredInputs = useMemo(() => inputsInventory.filter(i => selectedLocationId === 'all' || i.farmId === selectedLocationId), [inputsInventory, selectedLocationId]);
    const filteredTools = useMemo(() => toolsEquipment.filter(t => selectedLocationId === 'all' || t.farmId === selectedLocationId), [toolsEquipment, selectedLocationId]);
    const filteredProduce = useMemo(() => produceInventory.filter(p => selectedLocationId === 'all' || p.farmId === selectedLocationId), [produceInventory, selectedLocationId]);


    const renderTabContent = () => {
        switch (activeTab) {
            case 'Tools/Equipment': 
                return <ToolsEquipmentTab 
                            assets={filteredTools} 
                            setAssets={setToolsEquipment} 
                            farmLocations={farmLocations} 
                            selectedLocationId={selectedLocationId} 
                        />;
            case 'Produce Inventory': 
                return <ProduceInventoryTab 
                            stock={filteredProduce} 
                            setStock={setProduceInventory} 
                            farmLocations={farmLocations} 
                            selectedLocationId={selectedLocationId} 
                        />;
            case 'Awaiting Confirmation': return <AwaitingConfirmationTab
                                                    documents={pendingDocuments}
                                                    setDocuments={setPendingDocuments}
                                                    setRejectedDocuments={setRejectedDocuments}
                                                    setIncomeRecords={setIncomeRecords}
                                                    setExpenditureRecords={setExpenditureRecords}
                                                 />;
            case 'Inputs Inventory':
            default:
                return <InputsInventoryTab 
                            inventory={filteredInputs} 
                            setInventory={setInputsInventory} 
                            farmLocations={farmLocations} 
                            selectedLocationId={selectedLocationId} 
                        />;
        }
    };

    return (
        <main className="flex-1 w-full p-4 md:p-6 lg:p-8 bg-slate-100 overflow-y-auto">
            <header className="mb-8 flex items-center justify-between flex-wrap gap-4">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-700">Store Management</h2>
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

            {/* Tab Navigation */}
            <div className="mb-6 border-b border-gray-200">
                <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
                    {STORE_MANAGEMENT_TABS.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`${
                                activeTab === tab
                                    ? 'border-orange-500 text-orange-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors focus:outline-none`}
                        >
                            {tab}
                            {tab === 'Awaiting Confirmation' && pendingDocuments.length > 0 && (
                                <span className="ml-2 bg-orange-200 text-orange-700 text-xs font-bold px-2 py-1 rounded-full">{pendingDocuments.length}</span>
                            )}
                        </button>
                    ))}
                </nav>
            </div>

             {/* Tab Content */}
            <div>
                {renderTabContent()}
            </div>
        </main>
    );
};

export default StoreManagementPage;
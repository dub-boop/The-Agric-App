import React, { useState, useMemo, useEffect } from 'react';
import { MenuIcon, PlusIcon, CloseIcon, TrashIcon, EditIcon, RECEIPT_CATEGORIES, INVOICE_CATEGORIES, PAYMENT_METHODS, RECEIPT_UNITS, ReceiptGeneratorIcon } from '../constants';
import type { FinancialDocument, RejectedFinancialDocument, FinancialDocumentItem, BusinessProfile, Payment, FarmLocation } from '../types';

// Reusable UI Components
const inputClasses = "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-gray-700 bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed";
const labelClasses = "block text-sm font-medium text-gray-600 mb-1";

const FormField = ({ label, children, className = '' }: { label: string, children: React.ReactNode, className?: string }) => (
    <div className={className}>
        <label className={labelClasses}>{label}</label>
        {children}
    </div>
);

// Type for a single line item in the form state
interface LineItemState {
    id: number;
    name: string;
    unit: string;
    unitPrice: string;
    quantity: string;
}

// A helper function to generate a unique document number
const generateDocNumber = (type: 'Receipt' | 'Invoice') => {
    const randomPart = Math.floor(100000 + Math.random() * 900000);
    return `${type.slice(0, 3).toUpperCase()}-${randomPart}`;
};

// Main Page Component
interface ReceiptGeneratorPageProps {
    setSidebarOpen: (isOpen: boolean) => void;
    pendingDocuments: FinancialDocument[];
    setPendingDocuments: React.Dispatch<React.SetStateAction<FinancialDocument[]>>;
    rejectedDocuments: RejectedFinancialDocument[];
    setRejectedDocuments: React.Dispatch<React.SetStateAction<RejectedFinancialDocument[]>>;
    businessProfile: BusinessProfile;
    farmLocations: FarmLocation[];
    selectedLocationId: number | 'all';
    setSelectedLocationId: (id: number | 'all') => void;
    onAddActivity: (text: string, icon: React.ReactElement) => void;
}

const ReceiptGeneratorPage = ({ setSidebarOpen, setPendingDocuments, rejectedDocuments, setRejectedDocuments, businessProfile, farmLocations, selectedLocationId, setSelectedLocationId, onAddActivity }: ReceiptGeneratorPageProps) => {
    // Form State
    const [documentType, setDocumentType] = useState<'Receipt' | 'Invoice'>('Receipt');
    const [docId, setDocId] = useState(''); // For knowing if we are editing a rejected doc
    const [documentNumber, setDocumentNumber] = useState(''); // For display and submission
    const [category, setCategory] = useState(RECEIPT_CATEGORIES[0]);
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0]);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [farmId, setFarmId] = useState<string>(selectedLocationId === 'all' ? (farmLocations[0]?.id.toString() || '') : selectedLocationId.toString());
    
    const [items, setItems] = useState<LineItemState[]>([{ id: Date.now(), name: '', unit: RECEIPT_UNITS[0], unitPrice: '0', quantity: '1' }]);
    
    const [discountPercent, setDiscountPercent] = useState('0');
    const [taxPercent, setTaxPercent] = useState('0');
    const [amountPaid, setAmountPaid] = useState('0');

    // State for rejected documents section
    const [rejectedTab, setRejectedTab] = useState<'Receipts' | 'Invoices'>('Receipts');
    
    useEffect(() => {
        if(selectedLocationId !== 'all') {
            setFarmId(selectedLocationId.toString())
        } else if (farmLocations.length > 0) {
            setFarmId(farmLocations[0].id.toString());
        }
    }, [selectedLocationId, farmLocations]);


    // Reset category when document type changes
    useEffect(() => {
        setCategory(documentType === 'Receipt' ? RECEIPT_CATEGORIES[0] : INVOICE_CATEGORIES[0]);
    }, [documentType]);

    // Effect to manage the document number automatically
    useEffect(() => {
        // If we are not editing a rejected document, generate a new number
        if (!docId) {
            setDocumentNumber(generateDocNumber(documentType));
        }
    }, [documentType, docId]); // Reruns when type changes or when we start/end editing
    
    // --- Calculations ---
    const { subtotal, discountAmount, taxAmount, totalAmount, balance } = useMemo(() => {
        const sub = items.reduce((acc, item) => {
            const itemPrice = (parseFloat(item.unitPrice) || 0) * (parseFloat(item.quantity) || 0);
            return acc + itemPrice;
        }, 0);

        const discAmount = sub * ((parseFloat(discountPercent) || 0) / 100);
        const subAfterDiscount = sub - discAmount;
        const taxAmt = subAfterDiscount * ((parseFloat(taxPercent) || 0) / 100);
        const total = subAfterDiscount + taxAmt;
        const bal = total - (parseFloat(amountPaid) || 0);

        return {
            subtotal: sub,
            discountAmount: discAmount,
            taxAmount: taxAmt,
            totalAmount: total,
            balance: bal,
        }
    }, [items, discountPercent, taxPercent, amountPaid]);

    // --- Form Handlers ---
    const resetForm = () => {
        setDocId('');
        setDocumentType('Receipt');
        setCategory(RECEIPT_CATEGORIES[0]);
        setCustomerName('');
        setCustomerPhone('');
        setPaymentMethod(PAYMENT_METHODS[0]);
        setDate(new Date().toISOString().split('T')[0]);
        setFarmId(selectedLocationId === 'all' ? (farmLocations[0]?.id.toString() || '') : selectedLocationId.toString());
        setItems([{ id: Date.now(), name: '', unit: RECEIPT_UNITS[0], unitPrice: '0', quantity: '1' }]);
        setDiscountPercent('0');
        setTaxPercent('0');
        setAmountPaid('0');
        // The useEffect will handle resetting the document number since docId is now empty
    };

    const handleAddItem = () => {
        setItems([...items, { id: Date.now(), name: '', unit: RECEIPT_UNITS[0], unitPrice: '0', quantity: '1' }]);
    };
    
    const handleItemChange = (id: number, field: keyof Omit<LineItemState, 'id'>, value: string) => {
        setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
    };

    const handleRemoveItem = (id: number) => {
        if (items.length > 1) {
            setItems(items.filter(item => item.id !== id));
        }
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const initialPayment: Payment = {
            id: `PAY-${Date.now()}`,
            date: new Date(`${date}T00:00:00`),
            amount: parseFloat(amountPaid) || 0,
            method: paymentMethod,
        };
        
        const newDocument: FinancialDocument = {
            id: documentNumber,
            documentType,
            category,
            customerName,
            customerPhone,
            paymentMethod,
            date: new Date(`${date}T00:00:00`),
            items: items.map(item => ({
                name: item.name,
                unit: item.unit,
                unitPrice: parseFloat(item.unitPrice) || 0,
                quantity: parseFloat(item.quantity) || 0,
                price: (parseFloat(item.unitPrice) || 0) * (parseFloat(item.quantity) || 0),
            })),
            subtotal,
            discountPercent: parseFloat(discountPercent) || 0,
            discountAmount,
            taxPercent: parseFloat(taxPercent) || 0,
            taxAmount,
            totalAmount,
            amountPaid: parseFloat(amountPaid) || 0,
            balance,
            payments: initialPayment.amount > 0 ? [initialPayment] : [],
            farmId: farmId ? Number(farmId) : undefined,
        };

        setPendingDocuments(prev => [newDocument, ...prev]);
        onAddActivity(`Submitted a new ${newDocument.documentType}: ${newDocument.id}.`, <ReceiptGeneratorIcon className="h-5 w-5" />);

        // If it was an edited rejected doc, remove it from the rejected list
        if(docId) {
            setRejectedDocuments(prev => prev.filter(d => d.id !== docId));
        }

        resetForm();
    };
    
    // --- Rejected Documents Handlers ---
    const handleEditRejected = (doc: RejectedFinancialDocument) => {
        window.scrollTo(0, 0); // Scroll to top to see the form
        setDocId(doc.id);
        setDocumentNumber(doc.id); // Set the number to the existing one
        setDocumentType(doc.documentType);
        setCategory(doc.category);
        setCustomerName(doc.customerName);
        setCustomerPhone(doc.customerPhone);
        setPaymentMethod(doc.paymentMethod);
        setDate(new Date(doc.date).toISOString().split('T')[0]);
        setFarmId(doc.farmId ? String(doc.farmId) : '');
        setItems(doc.items.map(item => ({
            id: Math.random(),
            name: item.name,
            unit: item.unit,
            unitPrice: String(item.unitPrice),
            quantity: String(item.quantity),
        })));
        setDiscountPercent(String(doc.discountPercent));
        setTaxPercent(String(doc.taxPercent));
        setAmountPaid(String(doc.amountPaid));
    };

    const handleDeleteRejected = (id: string) => {
        if (window.confirm("Are you sure you want to permanently delete this rejected document?")) {
            setRejectedDocuments(prev => prev.filter(d => d.id !== id));
        }
    };

    const filteredRejected = rejectedDocuments.filter(d => {
        const typeMatch = d.documentType === rejectedTab.slice(0, -1);
        const locationMatch = selectedLocationId === 'all' || d.farmId === selectedLocationId || !d.farmId;
        return typeMatch && locationMatch;
    });


    return (
        <main className="flex-1 w-full p-4 md:p-6 lg:p-8 bg-slate-100 overflow-y-auto relative">
            <header className="mb-8 flex items-center justify-between flex-wrap gap-4">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-700">Receipt Generator</h2>
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

            <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md p-6 md:p-8">
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Header */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 items-center border-b pb-8">
                        {/* FIX: Wrap form elements in FormField component */}
                        <FormField label="Business Logo" className="md:col-span-1">
                            <div className="w-full h-16 border-2 border-dashed rounded-md flex items-center justify-center text-gray-400 text-sm bg-gray-50 overflow-hidden">
                                {businessProfile.logo ? <img src={businessProfile.logo} alt="Business Logo" className="w-full h-full object-contain" /> : <span>No Logo</span>}
                            </div>
                        </FormField>
                        <FormField label="Business Name" className="md:col-span-1"><p className="font-semibold text-gray-700">{businessProfile.name}</p></FormField>
                        <FormField label="Address" className="md:col-span-1"><p className="font-semibold text-gray-700">{businessProfile.address}</p></FormField>
                        <FormField label="Phone" className="md:col-span-1"><p className="font-semibold text-gray-700">{businessProfile.phone}</p></FormField>
                    </div>

                    {/* Document Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                         <FormField label="Select Document Type">
                             <select value={documentType} onChange={e => setDocumentType(e.target.value as 'Receipt' | 'Invoice')} className={inputClasses}>
                                <option value="Receipt">Receipt</option>
                                <option value="Invoice">Invoice</option>
                             </select>
                         </FormField>
                         <FormField label="Document Number">
                             <input type="text" value={documentNumber} disabled className={inputClasses} />
                         </FormField>
                         <FormField label="Category">
                             <select value={category} onChange={e => setCategory(e.target.value)} className={inputClasses}>
                                 {(documentType === 'Receipt' ? RECEIPT_CATEGORIES : INVOICE_CATEGORIES).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                             </select>
                         </FormField>
                          <FormField label="Date">
                            <input type="date" value={date} onChange={e => setDate(e.target.value)} className={inputClasses} required/>
                         </FormField>
                         <FormField label="Customer/Vendor Name">
                            <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} className={inputClasses} required/>
                         </FormField>
                          <FormField label="Customer/Vendor Phone">
                            <input type="tel" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} className={inputClasses} />
                         </FormField>
                          <FormField label="Farm Location (Optional)">
                            <select value={farmId} onChange={e => setFarmId(e.target.value)} className={inputClasses}>
                                <option value="">Select a location</option>
                                {farmLocations.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
                            </select>
                         </FormField>
                    </div>

                    {/* Items Section */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-gray-800 text-lg">Items</h3>
                        {items.map((item, index) => (
                            <div key={item.id} className="grid grid-cols-12 gap-x-4 gap-y-2 items-end p-4 border rounded-lg bg-gray-50/50">
                                <FormField label="Name" className="col-span-12 sm:col-span-5">
                                    <input type="text" value={item.name} onChange={e => handleItemChange(item.id, 'name', e.target.value)} className={inputClasses} required/>
                                </FormField>
                                <FormField label="Unit" className="col-span-6 sm:col-span-2">
                                    <select value={item.unit} onChange={e => handleItemChange(item.id, 'unit', e.target.value)} className={inputClasses}>
                                        {RECEIPT_UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                                    </select>
                                </FormField>
                                <FormField label="Unit Price" className="col-span-6 sm:col-span-2">
                                    <input type="number" value={item.unitPrice} onChange={e => handleItemChange(item.id, 'unitPrice', e.target.value)} className={inputClasses} min="0" step="0.01"/>
                                </FormField>
                                <FormField label="Qty" className="col-span-6 sm:col-span-2">
                                    <input type="number" value={item.quantity} onChange={e => handleItemChange(item.id, 'quantity', e.target.value)} className={inputClasses} min="0.01" step="0.01"/>
                                </FormField>
                                <div className="col-span-6 sm:col-span-1 flex justify-end">
                                    {items.length > 1 && <button type="button" onClick={() => handleRemoveItem(item.id)} className="p-2 text-red-500 hover:bg-red-100 rounded-full"><TrashIcon /></button>}
                                </div>
                            </div>
                        ))}
                        <button type="button" onClick={handleAddItem} className="flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-semibold hover:bg-blue-200 transition-colors">
                            <PlusIcon /><span>Add Item</span>
                        </button>
                    </div>

                    {/* Financial Summary & Actions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t">
                         <div className="space-y-4">
                             <FormField label="Discount (%)">
                                 <input type="number" value={discountPercent} onChange={e => setDiscountPercent(e.target.value)} className={inputClasses} min="0" max="100"/>
                             </FormField>
                            <FormField label="Tax (%)">
                                <input type="number" value={taxPercent} onChange={e => setTaxPercent(e.target.value)} className={inputClasses} min="0"/>
                            </FormField>
                            <FormField label="Payment Method">
                                <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} className={inputClasses}>
                                    {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                            </FormField>
                             <FormField label="Amount Paid (₦)">
                                <input type="number" value={amountPaid} onChange={e => setAmountPaid(e.target.value)} className={inputClasses} min="0"/>
                            </FormField>
                         </div>
                         <div className="bg-gray-50 p-6 rounded-lg space-y-3">
                             <div className="flex justify-between text-sm"><span className="text-gray-600">Subtotal:</span><span className="font-medium text-gray-800">₦{subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div>
                             <div className="flex justify-between text-sm"><span className="text-gray-600">Discount:</span><span className="font-medium text-gray-800">- ₦{discountAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div>
                             <div className="flex justify-between text-sm"><span className="text-gray-600">Tax:</span><span className="font-medium text-gray-800">+ ₦{taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div>
                             <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2"><span className="text-gray-900">Total:</span><span className="text-gray-900">₦{totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div>
                             <div className="flex justify-between"><span className="text-gray-600">Amount Paid:</span><span className="font-medium text-gray-800">₦{(parseFloat(amountPaid) || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div>
                             <div className={`flex justify-between font-bold ${balance > 0 ? 'text-red-600' : 'text-green-600'}`}><span >Balance:</span><span>₦{balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div>
                         </div>
                    </div>
                     <div className="flex justify-end gap-4 pt-8 border-t">
                        <button type="button" onClick={resetForm} className="px-5 py-2 rounded-lg text-sm font-semibold bg-gray-200 text-gray-800 hover:bg-gray-300">Clear</button>
                        <button type="submit" className="px-6 py-2 rounded-lg font-semibold bg-green-600 text-white hover:bg-green-700 shadow-sm">Submit to Store Manager</button>
                    </div>
                </form>
            </div>
            
             {/* Rejected Documents Section */}
            <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md p-6 md:p-8 mt-12">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Rejected Documents</h3>
                <div className="border-b border-gray-200 mb-4">
                    <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                        <button onClick={() => setRejectedTab('Receipts')} className={`${rejectedTab === 'Receipts' ? 'border-red-500 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-700'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm`}>Receipts</button>
                        <button onClick={() => setRejectedTab('Invoices')} className={`${rejectedTab === 'Invoices' ? 'border-red-500 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-700'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm`}>Invoices</button>
                    </nav>
                </div>
                 <div className="space-y-4">
                    {filteredRejected.length > 0 ? filteredRejected.map(doc => (
                        <div key={doc.id} className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
                            <div className="flex flex-wrap justify-between items-start gap-2">
                                <div>
                                    <p className="font-bold text-gray-800">{doc.customerName} - #{doc.id}</p>
                                    <p className="text-sm text-red-700 font-semibold mt-1">Reason: <span className="font-normal">{doc.reasonForRejection}</span></p>
                                </div>
                                <div className="flex items-center space-x-2 flex-shrink-0">
                                    <button onClick={() => handleEditRejected(doc)} className="text-blue-600 p-1 hover:bg-blue-100 rounded-full" title="Edit and Resubmit"><EditIcon /></button>
                                    <button onClick={() => handleDeleteRejected(doc.id)} className="text-red-600 p-1 hover:bg-red-100 rounded-full" title="Delete Permanently"><TrashIcon /></button>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <p className="text-gray-500 text-center py-4">No rejected {rejectedTab.toLowerCase()} found.</p>
                    )}
                 </div>
            </div>
        </main>
    );
};

export default ReceiptGeneratorPage;
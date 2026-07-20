

import React, { useState, useMemo, useEffect } from 'react';
import { MenuIcon, IncomeIcon, ExpenditureIcon, ProfitLossIcon, ArrowRightIcon, ArrowLeftIcon, ArrowDownIcon, ArrowUpIcon, ViewIcon, PrinterIcon, CloseIcon, DownloadIcon, PlusIcon, PAYMENT_METHODS } from '../constants';
import type { FinancialDocument, BusinessProfile, CustomerLoyaltyData, AnalysisData, Payment, FarmLocation } from '../types';

const RecordCard = ({ title, description, icon, buttonText, buttonColor, iconColor, iconBgColor, value, onClick }: { 
    title: string;
    description: string;
    icon: React.ReactElement<{ className?: string }>;
    buttonText: string;
    buttonColor: string;
    iconColor: string;
    iconBgColor: string;
    value: string;
    onClick?: () => void;
}) => (
    <div 
        onClick={onClick}
        className="bg-white rounded-xl shadow-md p-6 flex flex-col justify-between border border-gray-200/80 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer group text-center items-center h-full"
    >
        <div className="flex flex-col items-center w-full">
            {/* Icon above Title */}
            <div className={`p-3 rounded-full mb-4 transition-colors duration-300 ${iconBgColor} flex items-center justify-center shadow-sm shrink-0`}>
                {React.cloneElement(icon, { className: `h-6 w-6 ${iconColor}` })}
            </div>
            
            {/* Title (e.g., Total Income) */}
            <h3 className="text-base font-bold text-gray-800 mb-1" title={title}>{title}</h3>
            
            {/* Amount / Value */}
            <p className="text-2xl font-black text-gray-900 tracking-tight mb-2" title={value}>
                {value}
            </p>
            
            {/* Descriptive texts */}
            <p className="text-gray-500 mb-6 text-xs leading-relaxed max-w-[220px]">{description}</p>
        </div>
        
        {/* Button */}
        <button 
            className={`w-full px-5 py-2.5 rounded-lg font-semibold flex items-center justify-center gap-2 shadow-md text-white transition-all text-sm ${buttonColor}`}
        >
            <span>{buttonText}</span>
            <ArrowRightIcon />
        </button>
    </div>
);

const AddPaymentModal = ({ isOpen, onClose, onSubmit, record }: { 
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (paymentData: Omit<Payment, 'id'>) => void;
    record: FinancialDocument;
}) => {
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [method, setMethod] = useState(PAYMENT_METHODS[0]);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setAmount('');
            setDate(new Date().toISOString().split('T')[0]);
            setMethod(PAYMENT_METHODS[0]);
            setError('');
        }
    }, [isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const paymentAmount = parseFloat(amount);
        if (isNaN(paymentAmount) || paymentAmount <= 0) {
            setError('Please enter a valid positive amount.');
            return;
        }
        if (paymentAmount > record.balance) {
            setError(`Payment cannot exceed the outstanding balance of ₦${record.balance.toLocaleString()}.`);
            return;
        }
        onSubmit({
            amount: paymentAmount,
            date: new Date(`${date}T00:00:00`),
            method,
        });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <h3 className="text-lg font-bold text-gray-900">Add Payment</h3>
                        <p className="text-sm text-gray-500 mt-1">Record a new payment for Invoice #{record.id}.</p>
                        <p className="text-sm font-semibold text-orange-600 mt-2">Balance Due: ₦{record.balance.toLocaleString()}</p>
                        <div className="space-y-4 mt-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Amount</label>
                                <input type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Payment Date</label>
                                <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Payment Method</label>
                                <select value={method} onChange={e => setMethod(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md">
                                    {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                            </div>
                            {error && <p className="text-red-500 text-sm">{error}</p>}
                        </div>
                    </div>
                    <div className="bg-gray-50 px-6 py-3 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-md text-sm font-semibold bg-gray-200 text-gray-800 hover:bg-gray-300">Cancel</button>
                        <button type="submit" className="px-4 py-2 rounded-md text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700">Add Payment</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const RecordDetailModal = ({ record, onClose, businessProfile, onAddPayment }: { 
    record: FinancialDocument | null, 
    onClose: () => void, 
    businessProfile: BusinessProfile,
    onAddPayment: (documentId: string, paymentData: Omit<Payment, 'id'>) => void;
}) => {
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    if (!record) return null;
    
    const handlePrint = () => {
        window.print();
    };

    const handlePaymentSubmit = (paymentData: Omit<Payment, 'id'>) => {
        onAddPayment(record.id, paymentData);
    };

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
                <div className="relative bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                    {/* Header */}
                    <header className="flex items-center justify-between p-4 border-b no-print">
                        <h3 className="text-xl font-bold text-gray-800">{record.documentType} Details</h3>
                        <div className="flex items-center space-x-2">
                            {record.balance > 0 && (
                                <button onClick={() => setIsPaymentModalOpen(true)} className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 shadow-sm">
                                    <PlusIcon /><span>Add Payment</span>
                                </button>
                            )}
                            <button onClick={handlePrint} className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 shadow-sm"><PrinterIcon /><span>Print</span></button>
                            <button onClick={onClose} title="Close" className="p-2 rounded-full text-gray-500 hover:bg-gray-100"><CloseIcon /></button>
                        </div>
                    </header>

                    {/* Printable Content */}
                    <div className="overflow-y-auto printable-area">
                        <div className="p-8">
                            {/* Business & Customer Info */}
                            <div className="grid grid-cols-2 gap-8 mb-8">
                                <div>
                                    {businessProfile.logo && <img src={businessProfile.logo} alt="Business Logo" className="h-16 w-auto object-contain mb-4" />}
                                    <h4 className="font-bold text-lg">{businessProfile.name}</h4>
                                    <p className="text-sm text-gray-600">{businessProfile.address}</p>
                                    <p className="text-sm text-gray-600">{businessProfile.phone}</p>
                                </div>
                                <div className="text-right">
                                    <h3 className="text-3xl font-bold uppercase text-gray-800">{record.documentType}</h3>
                                    <p className="text-gray-500">{record.id}</p>
                                    <p className="mt-4 text-sm font-medium text-gray-700">Date: {new Date(record.date).toLocaleDateString()}</p>
                                </div>
                            </div>

                            {/* Items Table */}
                            <table className="w-full text-left mb-8">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="p-3 text-sm font-semibold text-gray-600">Item Name</th>
                                        <th className="p-3 text-sm font-semibold text-gray-600 text-right">Quantity</th>
                                        <th className="p-3 text-sm font-semibold text-gray-600 text-right">Unit Price</th>
                                        <th className="p-3 text-sm font-semibold text-gray-600 text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {record.items.map((item, index) => (
                                        <tr key={index} className="border-b">
                                            <td className="p-3 font-medium text-gray-800">{item.name}</td>
                                            <td className="p-3 text-gray-600 text-right">{item.quantity} {item.unit}</td>
                                            <td className="p-3 text-gray-600 text-right">₦{item.unitPrice.toLocaleString()}</td>
                                            <td className="p-3 font-medium text-gray-800 text-right">₦{item.price.toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                             {/* Payment History & Financial Summary */}
                            <div className="flex flex-col md:flex-row justify-between gap-8">
                                <div className="flex-1">
                                    <h4 className="font-semibold text-gray-700 mb-2">Payment History</h4>
                                    {record.payments && record.payments.length > 0 ? (
                                        <table className="w-full text-sm">
                                            <thead className="border-b">
                                                <tr>
                                                    <th className="py-1 text-left font-medium text-gray-500">Date</th>
                                                    <th className="py-1 text-left font-medium text-gray-500">Method</th>
                                                    <th className="py-1 text-right font-medium text-gray-500">Amount</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {record.payments.map(p => (
                                                    <tr key={p.id}>
                                                        <td className="py-1 text-gray-600">{new Date(p.date).toLocaleDateString()}</td>
                                                        <td className="py-1 text-gray-600">{p.method}</td>
                                                        <td className="py-1 text-gray-800 font-medium text-right">₦{p.amount.toLocaleString()}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    ) : <p className="text-sm text-gray-500">No payments recorded.</p>}
                                </div>
                                <div className="w-full max-w-xs space-y-2 text-sm">
                                    <div className="flex justify-between"><span className="text-gray-600">Subtotal:</span><span className="font-medium text-gray-800">₦{record.subtotal.toLocaleString()}</span></div>
                                    {record.discountAmount > 0 && <div className="flex justify-between"><span className="text-gray-600">Discount ({record.discountPercent}%):</span><span className="font-medium text-gray-800">- ₦{record.discountAmount.toLocaleString()}</span></div>}
                                    {record.taxAmount > 0 && <div className="flex justify-between"><span className="text-gray-600">Tax ({record.taxPercent}%):</span><span className="font-medium text-gray-800">+ ₦{record.taxAmount.toLocaleString()}</span></div>}
                                    <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2"><span className="text-gray-900">Total:</span><span className="text-gray-900">₦{record.totalAmount.toLocaleString()}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-600">Amount Paid:</span><span className="font-medium text-gray-800">₦{record.amountPaid.toLocaleString()}</span></div>
                                    <div className={`flex justify-between font-bold ${record.balance > 0 ? 'text-red-600' : 'text-green-600'}`}><span >Balance:</span><span>₦{record.balance.toLocaleString()}</span></div>
                                </div>
                            </div>
                            <p className="text-xs text-gray-400 mt-8 text-center">Thank you for your business!</p>
                        </div>
                    </div>
                </div>
            </div>
            <AddPaymentModal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} onSubmit={handlePaymentSubmit} record={record} />
        </>
    );
};

const BalanceBadge = ({ balance }: { balance: number }) => {
    if (balance === 0) {
        return <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Paid</span>;
    }
    if (balance < 0) {
        return <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">Overpaid</span>;
    }
    return <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-orange-100 text-orange-800">Balance Due</span>
};

const RecordsDetailView = ({ title, records, onBack, setViewingRecord }: {
    title: string;
    records: FinancialDocument[];
    onBack?: () => void;
    setViewingRecord: (record: FinancialDocument) => void;
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState<{ key: keyof FinancialDocument | 'customerName'; direction: 'asc' | 'desc' } | null>({ key: 'date', direction: 'desc'});
    const [statusFilter, setStatusFilter] = useState('All');

    const sortedRecords = useMemo(() => {
        let sortableRecords = [...records];
        if (sortConfig !== null) {
            sortableRecords.sort((a, b) => {
                const aValue = a[sortConfig.key as keyof FinancialDocument];
                const bValue = b[sortConfig.key as keyof FinancialDocument];

                if (aValue < bValue) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableRecords;
    }, [records, sortConfig]);
    
    const filteredRecords = useMemo(() => {
        const lowercasedFilter = searchTerm.toLowerCase();
        return sortedRecords.filter(record => {
            if (statusFilter !== 'All') {
                if (statusFilter === 'Paid' && record.balance !== 0) return false;
                if (statusFilter === 'Balance Due' && record.balance <= 0) return false;
                if (statusFilter === 'Overpaid' && record.balance >= 0) return false;
            }

            return (
                record.id.toLowerCase().includes(lowercasedFilter) ||
                record.customerName.toLowerCase().includes(lowercasedFilter) ||
                record.category.toLowerCase().includes(lowercasedFilter) ||
                record.paymentMethod.toLowerCase().includes(lowercasedFilter) ||
                new Date(record.date).toLocaleDateString().toLowerCase().includes(lowercasedFilter) ||
                record.items.some(item => item.name.toLowerCase().includes(lowercasedFilter))
            );
        });
    }, [sortedRecords, searchTerm, statusFilter]);

    const requestSort = (key: keyof FinancialDocument | 'customerName') => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const handleExportCSV = () => {
        const headers = [
            'ID', 'Date', 'Type', 'Category', 'Customer Name', 'Payment Method',
            'Subtotal', 'Discount %', 'Tax %', 'Total Amount', 'Amount Paid', 'Balance', 'Items'
        ];
        const rows = filteredRecords.map(record => {
            const itemsString = record.items.map(i => `${i.name} (${i.quantity} ${i.unit})`).join('; ');
            return [
                record.id,
                new Date(record.date).toLocaleDateString(),
                record.documentType,
                record.category,
                record.customerName,
                record.paymentMethod,
                record.subtotal,
                record.discountPercent,
                record.taxPercent,
                record.totalAmount,
                record.amountPaid,
                record.balance,
                `"${itemsString.replace(/"/g, '""')}"` // Escape double quotes
            ].join(',');
        });

        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
        const link = document.createElement('a');
        link.setAttribute('href', encodeURI(csvContent));
        link.setAttribute('download', `${title.replace(/ /g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handlePrint = () => {
        window.print();
    };

    const SortableHeader = ({ tKey, label }: { tKey: keyof FinancialDocument | 'customerName'; label: string; }) => (
        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => requestSort(tKey)}>
            <div className="flex items-center">
                <span>{label}</span>
                {sortConfig?.key === tKey && (
                    <span className="ml-1">
                        {sortConfig.direction === 'asc' ? <ArrowUpIcon className="h-3 w-3" /> : <ArrowDownIcon className="h-3 w-3" />}
                    </span>
                )}
            </div>
        </th>
    );

    const content = (
      <div className="printable-records-log">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6 no-print">
            {onBack && (
              <button onClick={onBack} className="flex items-center text-sm font-semibold text-gray-600 hover:text-gray-900">
                  <ArrowLeftIcon className="h-5 w-5 mr-2"/>
                  Back to Records
              </button>
            )}
            {onBack && <h3 className="text-xl font-bold text-gray-800">{title}</h3>}
            <div className={`flex flex-wrap items-center gap-2 ${onBack ? 'sm:w-auto' : 'w-full sm:w-auto sm:ml-auto justify-end'}`}>
                <input
                    type="text"
                    placeholder="Search records..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full sm:w-auto flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                 <select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                >
                    <option value="All">All Statuses</option>
                    <option value="Paid">Paid</option>
                    <option value="Balance Due">Balance Due</option>
                    <option value="Overpaid">Overpaid</option>
                </select>
                <button onClick={handlePrint} className="p-2 border rounded-md shadow-sm hover:bg-gray-100" title="Print / Save as PDF"><PrinterIcon className="h-5 w-5 text-gray-600" /></button>
                <button onClick={handleExportCSV} className="p-2 border rounded-md shadow-sm hover:bg-gray-100" title="Export to CSV"><DownloadIcon className="h-5 w-5 text-gray-600" /></button>
            </div>
        </div>

        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <SortableHeader tKey="date" label="Date" />
                        <SortableHeader tKey="id" label="Doc #" />
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer/Vendor</th>
                        <SortableHeader tKey="totalAmount" label="Amount" />
                        <SortableHeader tKey="balance" label="Status" />
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider no-print">Action</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {filteredRecords.map(record => (
                          <tr key={record.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(record.date).toLocaleDateString()}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{record.id}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.customerName}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800">₦{record.totalAmount.toLocaleString()}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm"><BalanceBadge balance={record.balance} /></td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium no-print">
                                <button onClick={() => setViewingRecord(record)} className="text-blue-600 hover:text-blue-800 flex items-center space-x-1"><ViewIcon className="h-4 w-4" /><span>View</span></button>
                            </td>
                        </tr>
                    ))}
                      {filteredRecords.length === 0 && (
                        <tr>
                            <td colSpan={6} className="text-center py-10 text-gray-500">No records found.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>
    );

    return onBack ? (
        <div className="bg-white rounded-xl shadow-md p-6 md:p-8">
            {content}
        </div>
    ) : content;
};


const CustomerLoyaltyView = ({ records, onBack }: { records: FinancialDocument[]; onBack?: () => void }) => {
    const [timeFrame, setTimeFrame] = useState<'annual' | 'monthly'>('annual');
    const [years, setYears] = useState<number[]>([]);
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());

    useEffect(() => {
        const recordYears = [...new Set(records.map(r => new Date(r.date).getFullYear()))];
        const lastFiveYears = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
        const uniqueYears = [...new Set([...recordYears, ...lastFiveYears])].sort((a,b) => b - a);

        setYears(uniqueYears);
        if (!uniqueYears.includes(selectedYear)) {
            setSelectedYear(uniqueYears[0] || new Date().getFullYear());
        }
    }, [records]);

    const loyaltyData = useMemo<CustomerLoyaltyData[]>(() => {
        const filtered = records.filter(r => {
            const recordDate = new Date(r.date);
            if (timeFrame === 'annual') {
                return recordDate.getFullYear() === selectedYear;
            } else {
                return recordDate.getFullYear() === selectedYear && recordDate.getMonth() === selectedMonth;
            }
        });

        const customerMap = new Map<string, { totalVolume: number; transactionCount: number }>();
        filtered.forEach(record => {
            const customer = customerMap.get(record.customerName) || { totalVolume: 0, transactionCount: 0 };
            customer.totalVolume += record.totalAmount;
            customer.transactionCount += 1;
            customerMap.set(record.customerName, customer);
        });

        return Array.from(customerMap.entries())
            .map(([customerName, data]) => ({ customerName, ...data }))
            .sort((a, b) => b.totalVolume - a.totalVolume);

    }, [records, timeFrame, selectedYear, selectedMonth]);

    const topFiveCustomers = loyaltyData.slice(0, 5);
    const maxVolume = topFiveCustomers[0]?.totalVolume || 1;

    const content = (
      <>
        <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
            {onBack && (
              <button onClick={onBack} className="flex items-center text-sm font-semibold text-gray-600 hover:text-gray-900">
                  <ArrowLeftIcon className="h-5 w-5 mr-2" />
                  Back to Records
              </button>
            )}
            {onBack && <h3 className="text-xl font-bold text-gray-800">Customer Loyalty</h3>}
            <div className={`flex items-center gap-2 ${!onBack ? 'w-full justify-end' : ''}`}>
                <select value={timeFrame} onChange={e => setTimeFrame(e.target.value as 'annual' | 'monthly')} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5">
                    <option value="annual">Annual</option>
                    <option value="monthly">Monthly</option>
                </select>
                {timeFrame === 'monthly' && (
                      <select value={selectedMonth} onChange={e => setSelectedMonth(Number(e.target.value))} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5">
                        {Array.from({ length: 12 }, (_, i) => new Date(0, i)).map((date, index) => (
                            <option key={index} value={index}>{date.toLocaleString('default', { month: 'long' })}</option>
                        ))}
                    </select>
                )}
                <select value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5">
                      {years.map(year => <option key={year} value={year}>{year}</option>)}
                </select>
            </div>
        </div>
        <div className="space-y-8">
            {/* Loyalty Chart */}
              {topFiveCustomers.length > 0 && (
                <div>
                    <h4 className="font-semibold text-gray-700 mb-4">Top 5 Customers by Purchase Volume</h4>
                    <div className="space-y-4">
                        {topFiveCustomers.map(customer => (
                            <div key={customer.customerName} className="flex items-center gap-4">
                                <div className="w-40 text-sm text-gray-600 truncate text-right">{customer.customerName}</div>
                                <div className="flex-1 bg-gray-200 rounded-full h-6">
                                    <div
                                        className="bg-blue-600 h-6 rounded-full flex items-center justify-end px-2"
                                        style={{ width: `${(customer.totalVolume / maxVolume) * 100}%` }}
                                    >
                                        <span className="text-xs font-bold text-white">₦{customer.totalVolume.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Loyalty Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Purchase Volume</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"># of Transactions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loyaltyData.map((customer, index) => (
                            <tr key={customer.customerName}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{index + 1}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.customerName}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800">₦{customer.totalVolume.toLocaleString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.transactionCount}</td>
                            </tr>
                        ))}
                        {loyaltyData.length === 0 && (
                              <tr><td colSpan={4} className="text-center py-10 text-gray-500">No sales data for this period.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
      </>
    );

    return onBack ? (
      <div className="bg-white rounded-xl shadow-md p-6 md:p-8">
        {content}
      </div>
    ) : content;
}

const SpendingAnalysisView = ({ records }: { records: FinancialDocument[] }) => {
    const [timeFrame, setTimeFrame] = useState<'annual' | 'monthly'>('annual');
    const [years, setYears] = useState<number[]>([]);
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());

    useEffect(() => {
        const recordYears = [...new Set(records.map(r => new Date(r.date).getFullYear()))];
        const lastFiveYears = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
        const uniqueYears = [...new Set([...recordYears, ...lastFiveYears])].sort((a,b) => b - a);

        setYears(uniqueYears);
        if (!uniqueYears.includes(selectedYear)) {
            setSelectedYear(uniqueYears[0] || new Date().getFullYear());
        }
    }, [records]);

    const { categoryData, vendorData } = useMemo<{ categoryData: AnalysisData[], vendorData: AnalysisData[] }>(() => {
        const filtered = records.filter(r => {
            const recordDate = new Date(r.date);
            if (timeFrame === 'annual') {
                return recordDate.getFullYear() === selectedYear;
            } else {
                return recordDate.getFullYear() === selectedYear && recordDate.getMonth() === selectedMonth;
            }
        });

        const categoryMap = new Map<string, { totalVolume: number; transactionCount: number }>();
        filtered.forEach(record => {
            const current = categoryMap.get(record.category) || { totalVolume: 0, transactionCount: 0 };
            current.totalVolume += record.totalAmount;
            current.transactionCount += 1;
            categoryMap.set(record.category, current);
        });

        const vendorMap = new Map<string, { totalVolume: number; transactionCount: number }>();
        filtered.forEach(record => {
            const current = vendorMap.get(record.customerName) || { totalVolume: 0, transactionCount: 0 };
            current.totalVolume += record.totalAmount;
            current.transactionCount += 1;
            vendorMap.set(record.customerName, current);
        });
        
        const catData = Array.from(categoryMap.entries())
            .map(([name, data]) => ({ name, ...data }))
            .sort((a, b) => b.totalVolume - a.totalVolume);
        
        const vendData = Array.from(vendorMap.entries())
            .map(([name, data]) => ({ name, ...data }))
            .sort((a, b) => b.totalVolume - a.totalVolume);

        return { categoryData: catData, vendorData: vendData };

    }, [records, timeFrame, selectedYear, selectedMonth]);

    const AnalysisSection = ({ title, data, nameHeader, barColor }: { title: string, data: AnalysisData[], nameHeader: string, barColor: string }) => {
        const topFive = data.slice(0, 5);
        const maxVolume = topFive[0]?.totalVolume || 1;

        return (
            <div>
                <h4 className="font-semibold text-gray-700 text-lg mb-4">{title}</h4>
                {topFive.length > 0 && (
                    <div className="space-y-4 mb-8">
                        {topFive.map(item => (
                            <div key={item.name} className="flex items-center gap-4">
                                <div className="w-40 text-sm text-gray-600 truncate text-right">{item.name}</div>
                                <div className="flex-1 bg-gray-200 rounded-full h-6">
                                    <div
                                        className={`${barColor} h-6 rounded-full flex items-center justify-end px-2`}
                                        style={{ width: `${(item.totalVolume / maxVolume) * 100}%` }}
                                    >
                                        <span className="text-xs font-bold text-white">₦{item.totalVolume.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{nameHeader}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Spending</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"># of Transactions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {data.map((item, index) => (
                                <tr key={item.name}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{index + 1}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800">₦{item.totalVolume.toLocaleString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.transactionCount}</td>
                                </tr>
                            ))}
                            {data.length === 0 && (
                                <tr><td colSpan={4} className="text-center py-10 text-gray-500">No expenditure data for this period.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };
    
    return (
      <>
        <div className="flex items-center gap-2 w-full justify-end mb-8">
            <select value={timeFrame} onChange={e => setTimeFrame(e.target.value as 'annual' | 'monthly')} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 max-w-[120px]">
                <option value="annual">Annual</option>
                <option value="monthly">Monthly</option>
            </select>
            {timeFrame === 'monthly' && (
                <select value={selectedMonth} onChange={e => setSelectedMonth(Number(e.target.value))} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 max-w-[140px]">
                    {Array.from({ length: 12 }, (_, i) => new Date(0, i)).map((date, index) => (
                        <option key={index} value={index}>{date.toLocaleString('default', { month: 'long' })}</option>
                    ))}
                </select>
            )}
            <select value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 max-w-[100px]">
                {years.map(year => <option key={year} value={year}>{year}</option>)}
            </select>
        </div>
        <div className="space-y-12">
            <AnalysisSection title="Top Spending Categories" data={categoryData} nameHeader="Category" barColor="bg-red-500" />
            <AnalysisSection title="Top Vendors" data={vendorData} nameHeader="Vendor Name" barColor="bg-purple-500" />
        </div>
      </>
    );
};


const ProfitLossView = ({ incomeRecords, expenditureRecords, onBack }: { 
    incomeRecords: FinancialDocument[];
    expenditureRecords: FinancialDocument[];
    onBack: () => void;
}) => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [startDate, setStartDate] = useState(firstDayOfMonth.toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(today.toISOString().split('T')[0]);

    const dataWithRunningBalance = useMemo(() => {
        const income = incomeRecords.map(r => ({ ...r, transactionType: 'Income' as const }));
        const expenditure = expenditureRecords.map(r => ({ ...r, transactionType: 'Expenditure' as const }));
        const allRecords = [...income, ...expenditure].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        const filtered = allRecords.filter(rec => {
            if (!startDate && !endDate) return true;
            const recDate = new Date(rec.date);
            const start = startDate ? new Date(startDate) : null;
            const end = endDate ? new Date(endDate) : null;
            if (start) start.setHours(0,0,0,0);
            if (end) end.setHours(23,59,59,999);
            
            if (start && recDate < start) return false;
            if (end && recDate > end) return false;
            return true;
        });
        
        let balance = 0;
        return filtered.map(record => {
            const amount = record.transactionType === 'Income' ? record.totalAmount : -record.totalAmount;
            balance += amount;
            return { ...record, runningBalance: balance };
        });
    }, [incomeRecords, expenditureRecords, startDate, endDate]);

    const summary = useMemo(() => {
        return dataWithRunningBalance.reduce((acc, record) => {
            if (record.transactionType === 'Income') {
                acc.income += record.totalAmount;
            } else {
                acc.expenditure += record.totalAmount;
            }
            return acc;
        }, { income: 0, expenditure: 0 });
    }, [dataWithRunningBalance]);

    const netProfit = summary.income - summary.expenditure;

    const handlePrint = () => window.print();
    const handleExportCSV = () => {
         const headers = ['Date', 'ID', 'Type', 'Description', 'Amount', 'Running Balance'];
         const rows = dataWithRunningBalance.map(rec => {
             const amount = rec.transactionType === 'Income' ? rec.totalAmount : -rec.totalAmount;
             return [
                new Date(rec.date).toLocaleDateString(),
                rec.id,
                rec.transactionType,
                `"${rec.customerName} - ${rec.category}"`,
                amount,
                rec.runningBalance
             ].join(',');
         });
         const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
         const link = document.createElement('a');
         link.setAttribute('href', encodeURI(csvContent));
         link.setAttribute('download', `Profit_Loss_Report_${startDate}_to_${endDate}.csv`);
         document.body.appendChild(link);
         link.click();
         document.body.removeChild(link);
    };

    return (
        <div className="bg-white rounded-xl shadow-md p-6 md:p-8">
            <div className="printable-records-log">
                <div className="flex flex-wrap justify-between items-center gap-4 mb-6 no-print">
                    <button onClick={onBack} className="flex items-center text-sm font-semibold text-gray-600 hover:text-gray-900">
                        <ArrowLeftIcon className="h-5 w-5 mr-2"/>
                        Back to Records
                    </button>
                    <h3 className="text-xl font-bold text-gray-800">Profit/Loss Report</h3>
                    <div className="flex items-center gap-2">
                        <button onClick={handlePrint} className="p-2 border rounded-md shadow-sm hover:bg-gray-100" title="Print / Save as PDF"><PrinterIcon className="h-5 w-5 text-gray-600" /></button>
                        <button onClick={handleExportCSV} className="p-2 border rounded-md shadow-sm hover:bg-gray-100" title="Export to CSV"><DownloadIcon className="h-5 w-5 text-gray-600" /></button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end mb-6 bg-gray-50 p-4 rounded-lg no-print">
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Start Date</label>
                        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">End Date</label>
                        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-green-50 border border-green-100 shadow-sm p-5 rounded-xl text-center flex flex-col items-center justify-center transition-all hover:shadow-md">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3 text-green-800 shrink-0 shadow-inner">
                            <IncomeIcon className="h-6 w-6" />
                        </div>
                        <p className="text-sm font-semibold uppercase tracking-wider text-green-800">Total Income</p>
                        <p className="text-2xl font-black text-green-900 mt-1">₦{summary.income.toLocaleString()}</p>
                    </div>

                    <div className="bg-red-50 border border-red-100 shadow-sm p-5 rounded-xl text-center flex flex-col items-center justify-center transition-all hover:shadow-md">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-3 text-red-800 shrink-0 shadow-inner">
                            <ExpenditureIcon className="h-6 w-6" />
                        </div>
                        <p className="text-sm font-semibold uppercase tracking-wider text-red-800">Total Expenditure</p>
                        <p className="text-2xl font-black text-red-900 mt-1">₦{summary.expenditure.toLocaleString()}</p>
                    </div>

                    <div className={`border shadow-sm p-5 rounded-xl text-center flex flex-col items-center justify-center transition-all hover:shadow-md ${
                        netProfit >= 0 ? 'bg-blue-50 border-blue-100' : 'bg-orange-50 border-orange-100'
                    }`}>
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 shrink-0 shadow-inner ${
                            netProfit >= 0 ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'
                        }`}>
                            <ProfitLossIcon className="h-6 w-6" />
                        </div>
                        <p className={`text-sm font-semibold uppercase tracking-wider ${
                            netProfit >= 0 ? 'text-blue-800' : 'text-orange-800'
                        }`}>Net Profit/Loss</p>
                        <p className={`text-2xl font-black mt-1 ${
                            netProfit >= 0 ? 'text-blue-900' : 'text-orange-900'
                        }`}>₦{netProfit.toLocaleString()}</p>
                    </div>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Running Balance</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {dataWithRunningBalance.map((rec, index) => (
                                <tr key={`${rec.id}-${index}`}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(rec.date).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <span className={`px-2 py-1 text-xs rounded-full ${rec.transactionType === 'Income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{rec.transactionType}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{rec.customerName} - {rec.category}</td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold text-right ${rec.transactionType === 'Income' ? 'text-green-700' : 'text-red-700'}`}>
                                        {rec.transactionType === 'Income' ? '+' : '-'}₦{rec.totalAmount.toLocaleString()}
                                    </td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold text-right ${rec.runningBalance >= 0 ? 'text-gray-800' : 'text-red-700'}`}>
                                        ₦{rec.runningBalance.toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                            {dataWithRunningBalance.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="text-center py-10 text-gray-500">No transactions in this period.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

interface FarmRecordsPageProps {
    setSidebarOpen: (isOpen: boolean) => void;
    incomeRecords: FinancialDocument[];
    expenditureRecords: FinancialDocument[];
    businessProfile: BusinessProfile;
    onAddPayment: (documentId: string, paymentData: Omit<Payment, 'id'>) => void;
    farmLocations: FarmLocation[];
    selectedLocationId: number | 'all';
    setSelectedLocationId: (id: number | 'all') => void;
}

const FarmRecordsPage = ({ setSidebarOpen, incomeRecords, expenditureRecords, businessProfile, onAddPayment, farmLocations, selectedLocationId, setSelectedLocationId }: FarmRecordsPageProps) => {
    const [view, setView] = useState<'main' | 'income' | 'expenditure' | 'profitloss'>('main');
    const [activeIncomeTab, setActiveIncomeTab] = useState<'records' | 'loyalty'>('records');
    const [activeExpenditureTab, setActiveExpenditureTab] = useState<'records' | 'analysis'>('records');
    const [viewingRecord, setViewingRecord] = useState<FinancialDocument | null>(null);

    const filteredIncomeRecords = useMemo(() => incomeRecords.filter(r => selectedLocationId === 'all' || r.farmId === selectedLocationId || !r.farmId), [incomeRecords, selectedLocationId]);
    const filteredExpenditureRecords = useMemo(() => expenditureRecords.filter(r => selectedLocationId === 'all' || r.farmId === selectedLocationId || !r.farmId), [expenditureRecords, selectedLocationId]);

    // This effect ensures that the detailed view modal gets updated data after a payment is added
    useEffect(() => {
        if (viewingRecord) {
            const allRecords = [...incomeRecords, ...expenditureRecords];
            const updatedRecord = allRecords.find(r => r.id === viewingRecord.id);
            if (updatedRecord) {
                setViewingRecord(updatedRecord);
            }
        }
    }, [incomeRecords, expenditureRecords, viewingRecord]);

    const totalIncome = useMemo(() => filteredIncomeRecords.reduce((sum, r) => sum + r.totalAmount, 0), [filteredIncomeRecords]);
    const totalExpenditure = useMemo(() => filteredExpenditureRecords.reduce((sum, r) => sum + r.totalAmount, 0), [filteredExpenditureRecords]);
    const netProfit = totalIncome - totalExpenditure;

    const renderContent = () => {
        switch (view) {
            case 'income':
                return (
                    <div>
                        <div className="border-b border-gray-200 mb-6">
                            <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                                <button onClick={() => setActiveIncomeTab('records')} className={`${activeIncomeTab === 'records' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm`}>Income Records</button>
                                <button onClick={() => setActiveIncomeTab('loyalty')} className={`${activeIncomeTab === 'loyalty' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm`}>Customer Loyalty</button>
                            </nav>
                        </div>
                        {activeIncomeTab === 'records' ? (
                            <RecordsDetailView title="Income Records" records={filteredIncomeRecords} onBack={() => setView('main')} setViewingRecord={setViewingRecord} />
                        ) : (
                            <CustomerLoyaltyView records={filteredIncomeRecords} onBack={() => setView('main')} />
                        )}
                    </div>
                );
            case 'expenditure':
                return (
                     <div>
                        <div className="border-b border-gray-200 mb-6">
                            <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                                <button onClick={() => setActiveExpenditureTab('records')} className={`${activeExpenditureTab === 'records' ? 'border-red-500 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-700'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm`}>Expenditure Records</button>
                                <button onClick={() => setActiveExpenditureTab('analysis')} className={`${activeExpenditureTab === 'analysis' ? 'border-red-500 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-700'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm`}>Spending Analysis</button>
                            </nav>
                        </div>
                         {activeExpenditureTab === 'records' ? (
                            <RecordsDetailView title="Expenditure Records" records={filteredExpenditureRecords} onBack={() => setView('main')} setViewingRecord={setViewingRecord} />
                        ) : (
                            <SpendingAnalysisView records={filteredExpenditureRecords} />
                        )}
                    </div>
                );
            case 'profitloss':
                return <ProfitLossView incomeRecords={filteredIncomeRecords} expenditureRecords={filteredExpenditureRecords} onBack={() => setView('main')} />;
            case 'main':
            default:
                return (
                    <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <RecordCard 
                                title="Total Income" 
                                description="All revenue from sales and other sources."
                                icon={<IncomeIcon />}
                                buttonText="View Income Log"
                                buttonColor="bg-green-600 hover:bg-green-700"
                                iconColor="text-green-600"
                                iconBgColor="bg-green-100"
                                value={`₦${totalIncome.toLocaleString()}`}
                                onClick={() => setView('income')}
                            />
                             <RecordCard 
                                title="Total Expenditure" 
                                description="All farm expenses, from inputs to repairs."
                                icon={<ExpenditureIcon />}
                                buttonText="View Expenditure Log"
                                buttonColor="bg-red-600 hover:bg-red-700"
                                iconColor="text-red-600"
                                iconBgColor="bg-red-100"
                                value={`₦${totalExpenditure.toLocaleString()}`}
                                onClick={() => setView('expenditure')}
                            />
                             <RecordCard 
                                title="Net Profit/Loss" 
                                description="The difference between income and expenditure."
                                icon={<ProfitLossIcon />}
                                buttonText="View P/L Report"
                                buttonColor={netProfit >= 0 ? "bg-blue-600 hover:bg-blue-700" : "bg-orange-600 hover:bg-orange-700"}
                                iconColor={netProfit >= 0 ? "text-blue-600" : "text-orange-600"}
                                iconBgColor={netProfit >= 0 ? "bg-blue-100" : "bg-orange-100"}
                                value={`₦${netProfit.toLocaleString()}`}
                                onClick={() => setView('profitloss')}
                            />
                        </div>
                        <div>
                             <h3 className="text-xl font-bold text-gray-800 mb-4">All Transactions</h3>
                             <RecordsDetailView title="All Transactions" records={[...filteredIncomeRecords, ...filteredExpenditureRecords]} setViewingRecord={setViewingRecord} />
                        </div>
                    </div>
                );
        }
    };

    return (
        <main className="flex-1 w-full p-4 md:p-6 lg:p-8 bg-slate-100 overflow-y-auto">
             <header className="mb-8 flex items-center justify-between flex-wrap gap-4">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-700">Farm Records</h2>
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
            
            {renderContent()}

            <RecordDetailModal record={viewingRecord} onClose={() => setViewingRecord(null)} businessProfile={businessProfile} onAddPayment={onAddPayment} />
        </main>
    );
};

export default FarmRecordsPage;

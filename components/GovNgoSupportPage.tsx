import React, { useState, useMemo } from 'react';
import { MenuIcon, CloseIcon, SUPPORT_PROGRAMS } from '../constants';
import type { SupportProgram, SupportProgramCategory, SupportProgramProvider } from '../types';

// Reusable Components
const ProgramCard = ({ program, onSelect }: { program: SupportProgram, onSelect: () => void }) => {
    const statusColors = {
        Open: "bg-green-100 text-green-800 border-green-200",
        Closed: "bg-red-100 text-red-800 border-red-200",
    };
    const categoryColors: Record<SupportProgramCategory, string> = {
        Grant: "bg-blue-100 text-blue-800",
        Loan: "bg-sky-100 text-sky-800",
        Training: "bg-purple-100 text-purple-800",
        Subsidy: "bg-yellow-100 text-yellow-800",
    };

    return (
        <div onClick={onSelect} className="bg-white rounded-xl shadow-md p-6 border border-gray-200/80 cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 flex flex-col">
            <div className="flex justify-between items-start">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${categoryColors[program.category]}`}>{program.category}</span>
                <span className={`px-2 py-1 text-xs font-bold rounded-full border ${statusColors[program.status]}`}>{program.status}</span>
            </div>
            <div className="flex-grow">
                <h3 className="text-lg font-bold text-gray-800 mt-3">{program.title}</h3>
                <p className="text-sm font-medium text-gray-500">{program.provider}</p>
                <p className="text-sm text-gray-600 mt-4 h-20 overflow-hidden">{program.description}</p>
            </div>
            <p className="text-xs text-red-600 font-semibold mt-4">Deadline: {program.deadline.toLocaleDateString('en-GB')}</p>
        </div>
    );
};

const DetailPanel = ({ program, onClose }: { program: SupportProgram | null, onClose: () => void }) => {
    const isOpen = !!program;
    if (!program) return null;

    return (
        <>
            <div className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose}></div>
            <aside className={`fixed top-0 right-0 h-full w-full max-w-lg bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="flex flex-col h-full">
                    <header className="p-6 border-b border-gray-200 flex items-center justify-between">
                        <h3 className="text-xl font-bold text-gray-800">Program Details</h3>
                        <button onClick={onClose} className="p-1 rounded-full text-gray-500 hover:bg-gray-100"><CloseIcon /></button>
                    </header>
                    <div className="flex-grow p-6 overflow-y-auto space-y-6">
                        <section>
                            <h4 className="text-lg font-bold text-gray-800">{program.title}</h4>
                            <p className="font-medium text-gray-500">{program.provider} - {program.category}</p>
                            <p className="text-sm text-red-600 font-semibold mt-1">Deadline: {program.deadline.toLocaleDateString('en-GB')}</p>
                        </section>
                        <section>
                            <h5 className="font-semibold text-gray-700 mb-2">About the Program</h5>
                            <p className="text-gray-600 text-sm">{program.description}</p>
                        </section>
                        <section>
                            <h5 className="font-semibold text-gray-700 mb-2">Eligibility Criteria</h5>
                            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                                {program.eligibility.map((item, index) => <li key={index}>{item}</li>)}
                            </ul>
                        </section>
                         <section>
                            <h5 className="font-semibold text-gray-700 mb-2">Required Documents</h5>
                            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                                {program.requiredDocuments.map((item, index) => <li key={index}>{item}</li>)}
                            </ul>
                        </section>
                    </div>
                    <footer className="p-6 border-t">
                        <a href={program.applyLink} target="_blank" rel="noopener noreferrer" className="w-full block text-center bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors shadow-sm">
                            Apply Now
                        </a>
                    </footer>
                </div>
            </aside>
        </>
    );
};


const GovNgoSupportPage = ({ setSidebarOpen }: { setSidebarOpen: (isOpen: boolean) => void }) => {
    const [selectedProgram, setSelectedProgram] = useState<SupportProgram | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        provider: 'All',
        category: 'All',
        status: 'Open',
    });

    const filteredPrograms = useMemo(() => {
        return SUPPORT_PROGRAMS.filter(p => {
            const searchMatch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) || p.description.toLowerCase().includes(searchTerm.toLowerCase());
            const providerMatch = filters.provider === 'All' || p.provider === filters.provider;
            const categoryMatch = filters.category === 'All' || p.category === filters.category;
            const statusMatch = filters.status === 'All' || p.status === filters.status;
            return searchMatch && providerMatch && categoryMatch && statusMatch;
        });
    }, [searchTerm, filters]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    return (
        <main className="flex-1 w-full p-4 md:p-6 lg:p-8 bg-slate-100 overflow-y-auto">
            <header className="mb-8 flex items-center justify-between">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-700">Gov/NGO Support Hub</h2>
                <button
                    onClick={() => setSidebarOpen(true)}
                    className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-200 md:hidden"
                    aria-label="Open sidebar"
                >
                    <MenuIcon />
                </button>
            </header>
            
            <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <input
                        type="text"
                        placeholder="Search programs..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full lg:col-span-2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                    />
                    <select name="provider" value={filters.provider} onChange={handleFilterChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5">
                        <option value="All">All Providers</option>
                        <option value="Government">Government</option>
                        <option value="NGO">NGO</option>
                    </select>
                     <select name="category" value={filters.category} onChange={handleFilterChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5">
                        <option value="All">All Categories</option>
                        <option value="Grant">Grant</option>
                        <option value="Loan">Loan</option>
                        <option value="Training">Training</option>
                        <option value="Subsidy">Subsidy</option>
                    </select>
                 </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredPrograms.map(program => (
                    // FIX: Added a unique key prop to the ProgramCard component.
                    <ProgramCard
                        key={program.id}
                        program={program}
                        onSelect={() => setSelectedProgram(program)}
                    />
                ))}
            </div>
            
            {filteredPrograms.length === 0 && (
                <div className="text-center py-16 bg-white rounded-xl shadow-md">
                    <h3 className="text-xl font-semibold text-gray-700">No Programs Found</h3>
                    <p className="text-gray-500 mt-2">Try adjusting your search or filters.</p>
                </div>
            )}

            <DetailPanel program={selectedProgram} onClose={() => setSelectedProgram(null)} />
        </main>
    );
};

export default GovNgoSupportPage;
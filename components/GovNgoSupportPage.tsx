import React, { useState, useMemo, useEffect } from 'react';
import { MenuIcon, CloseIcon, SUPPORT_PROGRAMS } from '../constants';
import type { SupportProgram, SupportProgramCategory, SupportProgramProvider } from '../types';
import { getCuratedSupportPrograms } from '../firestoreService';

// Reusable Components
const ProgramCard = ({ program, onSelect }: { program: SupportProgram, onSelect: () => void, key?: React.Key }) => {
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
        <div onClick={onSelect} className="bg-white rounded-xl shadow-md p-6 border border-gray-200/80 cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 flex flex-col justify-between h-full">
            <div>
                <div className="flex justify-between items-start">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${categoryColors[program.category]}`}>{program.category}</span>
                    <span className={`px-2 py-1 text-xs font-bold rounded-full border ${statusColors[program.status]}`}>{program.status}</span>
                </div>
                <div className="mt-3">
                    <h3 className="text-lg font-bold text-gray-800 leading-snug">{program.title}</h3>
                    <p className="text-xs font-semibold text-gray-400 mt-0.5">{program.provider}</p>
                    {program.location && (
                        <p className="text-xs font-semibold text-green-700 bg-green-50 px-2.5 py-1 rounded-md border border-green-100 inline-block mt-2">
                            📍 {program.location}
                        </p>
                    )}
                    <p className="text-sm text-gray-600 mt-3 h-20 overflow-hidden line-clamp-4">{program.description}</p>
                </div>
            </div>
            <p className="text-xs text-red-600 font-bold mt-4">Deadline: {program.deadline instanceof Date ? program.deadline.toLocaleDateString('en-GB') : new Date(program.deadline).toLocaleDateString('en-GB')}</p>
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
                            <h4 className="text-lg font-bold text-gray-800 leading-snug">{program.title}</h4>
                            <p className="font-medium text-gray-400 text-xs mt-0.5">{program.provider} - {program.category}</p>
                            {program.location && <p className="text-xs font-semibold text-slate-600 mt-2">📍 Location/Region: <strong className="text-slate-800">{program.location}</strong></p>}
                            <p className="text-xs text-red-600 font-semibold mt-1">Deadline: {program.deadline instanceof Date ? program.deadline.toLocaleDateString('en-GB') : new Date(program.deadline).toLocaleDateString('en-GB')}</p>
                        </section>
                        <section>
                            <h5 className="font-semibold text-gray-700 mb-2">About the Program</h5>
                            <p className="text-gray-600 text-sm whitespace-pre-wrap">{program.description}</p>
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
    const [programs, setPrograms] = useState<SupportProgram[]>(SUPPORT_PROGRAMS);
    const [loading, setLoading] = useState(true);
    const [selectedProgram, setSelectedProgram] = useState<SupportProgram | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [locationSearch, setLocationSearch] = useState('');
    const [filters, setFilters] = useState({
        provider: 'All',
        category: 'All',
        status: 'Open',
    });

    // Dynamically fetch from Firestore on mount
    useEffect(() => {
        let isMounted = true;
        const fetchPrograms = async () => {
            try {
                const fetched = await getCuratedSupportPrograms();
                if (isMounted) {
                    if (fetched && fetched.length > 0) {
                        setPrograms(fetched as SupportProgram[]);
                    } else {
                        // Fallback to constants if Firestore has no records yet
                        setPrograms(SUPPORT_PROGRAMS);
                    }
                }
            } catch (err) {
                console.error('Error fetching curated support programs:', err);
                if (isMounted) {
                    setPrograms(SUPPORT_PROGRAMS);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };
        fetchPrograms();
        return () => {
            isMounted = false;
        };
    }, []);

    const filteredPrograms = useMemo(() => {
        return programs.filter(p => {
            const searchMatch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                p.description.toLowerCase().includes(searchTerm.toLowerCase());
            
            const locationMatch = !locationSearch || 
                                  (p.location || '').toLowerCase().includes(locationSearch.toLowerCase());
            
            const providerMatch = filters.provider === 'All' || p.provider === filters.provider;
            const categoryMatch = filters.category === 'All' || p.category === filters.category;
            const statusMatch = filters.status === 'All' || p.status === filters.status;
            
            return searchMatch && locationMatch && providerMatch && categoryMatch && statusMatch;
        });
    }, [programs, searchTerm, locationSearch, filters]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    return (
        <main className="flex-1 w-full p-4 md:p-6 lg:p-8 bg-slate-100 overflow-y-auto">
            <header className="mb-8 flex items-center justify-between">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-700">Gov/NGO Support Hub</h2>
                    <p className="text-xs text-gray-500 mt-1">Discover, search, and apply directly to empowerment opportunities curated by SaaS builders.</p>
                </div>
                <button
                    onClick={() => setSidebarOpen(true)}
                    className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-200 md:hidden"
                    aria-label="Open sidebar"
                >
                    <MenuIcon />
                </button>
            </header>
            
            <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    <input
                        type="text"
                        placeholder="Search by keywords..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full lg:col-span-2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 text-sm"
                    />
                    <input
                        type="text"
                        placeholder="Search by location (e.g. Oyo)..."
                        value={locationSearch}
                        onChange={e => setLocationSearch(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 text-sm"
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

            {loading && (
                <div className="text-center py-12 bg-white rounded-xl shadow-md mb-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-600 mx-auto mb-3"></div>
                    <p className="text-xs text-gray-500 font-medium">Loading live curated opportunities...</p>
                </div>
            )}
            
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
            
            {!loading && filteredPrograms.length === 0 && (
                <div className="text-center py-16 bg-white rounded-xl shadow-md">
                    <h3 className="text-xl font-semibold text-gray-700">No Programs Found</h3>
                    <p className="text-gray-500 mt-2">Try adjusting your search query, location filter, or type restrictions.</p>
                </div>
            )}

            <DetailPanel program={selectedProgram} onClose={() => setSelectedProgram(null)} />
        </main>
    );
};

export default GovNgoSupportPage;
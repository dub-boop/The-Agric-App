import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  MapPin, 
  Users, 
  Mail, 
  Phone, 
  Plus, 
  Wrench, 
  X, 
  CheckCircle, 
  FileText, 
  Briefcase,
  ChevronRight,
  Info,
  Calendar,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { MenuIcon } from '../constants';
import type { Cooperative, CooperativeType } from '../types';
import { getCooperatives, saveCooperative } from '../firestoreService';

interface CooperativesPageProps {
  setSidebarOpen: (isOpen: boolean) => void;
}

const PRE_SEEDED_COOPERATIVES: Cooperative[] = [
  {
    id: 'COOP-001',
    name: 'Ibadan Cassava Growers Union',
    type: 'Resource-Sharing',
    location: 'Oyo State (South-West)',
    contactEmail: 'ibadan.cassava@agric.coop',
    presidentPhone: '+234 803 456 7891',
    activeMembers: 145,
    sharedEquipment: ['John Deere 5055E Tractor', 'Cassava Peeling Machine', 'Tuber Washing Grater'],
    description: 'A vibrant union focused on high-yield cassava processing and mechanized land preparation for smallholder farmers.'
  },
  {
    id: 'COOP-002',
    name: 'Northern Grain Cooperative Society',
    type: 'Joint Marketing',
    location: 'Kano State (North)',
    contactEmail: 'kano.grains@agric.coop',
    presidentPhone: '+234 802 987 6543',
    activeMembers: 320,
    sharedEquipment: ['Multi-crop Thresher', 'Grain Moisture Meter', 'Large Combined Harvester'],
    description: 'Empowering local maize, sorghum and millet farmers to aggregate produce for competitive bulk wholesale market sales.'
  },
  {
    id: 'COOP-003',
    name: 'Delta Fishermen Cooperative Alliance',
    type: 'Purchasing',
    location: 'Delta State (South-South)',
    contactEmail: 'delta.fish@agric.coop',
    presidentPhone: '+234 815 123 4567',
    activeMembers: 88,
    sharedEquipment: ['Solar Cold Storage Unit', 'Water Quality Tester', 'Bulk Feed Mixer'],
    description: 'Joint purchasing cooperative providing high-grade fingerlings and discounted fish feed to small-scale aquaculture farms.'
  }
];

const CooperativesPage = ({ setSidebarOpen }: CooperativesPageProps) => {
  const [cooperatives, setCooperatives] = useState<Cooperative[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [locationSearch, setLocationSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string>('All');

  // Selected cooperative for detail drawer
  const [selectedCooperative, setSelectedCooperative] = useState<Cooperative | null>(null);

  // Machinery lease booking state
  const [leasingMachine, setLeasingMachine] = useState<string | null>(null);
  const [leaseDuration, setLeaseDuration] = useState('1');
  const [leaseDate, setLeaseDate] = useState('');
  const [leaseNotes, setLeaseNotes] = useState('');
  const [showLeaseSuccess, setShowLeaseSuccess] = useState(false);

  // Registration modal state
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [newCoop, setNewCoop] = useState({
    name: '',
    type: 'Resource-Sharing' as CooperativeType,
    location: '',
    contactEmail: '',
    presidentPhone: '',
    activeMembers: 10,
    description: '',
    sharedEquipment: ['']
  });
  const [showRegSuccess, setShowRegSuccess] = useState(false);

  // Load Cooperatives from Firestore
  const loadCooperativesData = async () => {
    setLoading(true);
    try {
      let fetched = await getCooperatives();
      if (fetched.length === 0) {
        // Auto-seed Firestore with default cooperatives on first load
        for (const coop of PRE_SEEDED_COOPERATIVES) {
          await saveCooperative({ ...coop, status: 'Live' });
        }
        fetched = await getCooperatives();
      }
      setCooperatives(fetched as Cooperative[]);
    } catch (err) {
      console.error('Error loading cooperatives:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCooperativesData();
  }, []);

  // Filtered cooperatives
  const filteredCooperatives = useMemo(() => {
    return cooperatives.filter(coop => {
      // Only show Live (Verified) cooperatives on the public directory
      if (coop.status !== 'Live') return false;

      const matchesSearch = coop.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            coop.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesLocation = coop.location.toLowerCase().includes(locationSearch.toLowerCase());
      const matchesType = selectedType === 'All' || coop.type === selectedType;
      return matchesSearch && matchesLocation && matchesType;
    });
  }, [cooperatives, searchTerm, locationSearch, selectedType]);

  // Handle register input change
  const handleRegInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewCoop(prev => ({
      ...prev,
      [name]: name === 'activeMembers' ? parseInt(value) || 0 : value
    }));
  };

  // Shared machinery dynamic array actions
  const handleAddEquipmentField = () => {
    setNewCoop(prev => ({
      ...prev,
      sharedEquipment: [...prev.sharedEquipment, '']
    }));
  };

  const handleEquipmentValueChange = (index: number, val: string) => {
    const updated = [...newCoop.sharedEquipment];
    updated[index] = val;
    setNewCoop(prev => ({
      ...prev,
      sharedEquipment: updated
    }));
  };

  const handleRemoveEquipmentField = (index: number) => {
    const updated = newCoop.sharedEquipment.filter((_, i) => i !== index);
    setNewCoop(prev => ({
      ...prev,
      sharedEquipment: updated.length === 0 ? [''] : updated
    }));
  };

  // Submit new cooperative
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCoop.name || !newCoop.location || !newCoop.contactEmail || !newCoop.presidentPhone) {
      alert('Please fill out all required fields.');
      return;
    }

    try {
      const cleanEquipment = newCoop.sharedEquipment.map(s => s.trim()).filter(Boolean);
      const newEntry: Cooperative = {
        ...newCoop,
        id: `COOP-${Date.now().toString().slice(-4)}`,
        sharedEquipment: cleanEquipment,
        status: 'Pending'
      };

      await saveCooperative(newEntry);
      
      const fetched = await getCooperatives();
      setCooperatives(fetched as Cooperative[]);
      
      setShowRegSuccess(true);
      
      // Reset form state
      setNewCoop({
        name: '',
        type: 'Resource-Sharing',
        location: '',
        contactEmail: '',
        presidentPhone: '',
        activeMembers: 10,
        description: '',
        sharedEquipment: ['']
      });
    } catch (err) {
      console.error(err);
      alert('Failed to register cooperative.');
    }
  };

  // Submit lease request
  const handleLeaseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaseDate) {
      alert('Please choose a lease start date.');
      return;
    }
    setShowLeaseSuccess(true);
  };

  const typeColorClasses = {
    'Resource-Sharing': 'bg-teal-50 text-teal-700 border-teal-200',
    'Joint Marketing': 'bg-blue-50 text-blue-700 border-blue-200',
    'Financial/Credit': 'bg-purple-50 text-purple-700 border-purple-200',
    'Purchasing': 'bg-amber-50 text-amber-700 border-amber-200'
  };

  return (
    <div className="flex-1 h-full overflow-y-auto bg-slate-50 text-slate-800 font-sans flex flex-col relative">
      {/* Top Navigation Bar */}
      <header 
        className="bg-white border-b border-slate-200 py-4 px-6 flex items-center justify-between sticky top-0 z-20 shadow-sm"
        style={{ backgroundColor: '#ffffff' }}
      >
        <div className="flex items-center space-x-3">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Users className="h-5 w-5 text-green-600" />
              <span>Farmer Cooperatives</span>
            </h1>
            <p className="text-xs text-slate-500 font-medium hidden sm:block">
              Connect with regional farmer unions, joint markets, and shared heavy machinery pools.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-4">
          <button 
            onClick={() => setIsRegisterOpen(true)}
            className="bg-green-600 hover:bg-green-700 text-white font-bold text-xs sm:text-sm px-4 py-2 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Register Cooperative</span>
          </button>
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-200 md:hidden cursor-pointer"
            aria-label="Open sidebar"
          >
            <MenuIcon />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-grow flex flex-col">
        
        {/* Banner */}
        <div className="bg-slate-900 text-white rounded-2xl p-6 mb-8 shadow-sm relative overflow-hidden">
          <div className="absolute right-0 bottom-0 top-0 opacity-10 flex items-center pr-12 text-9xl pointer-events-none select-none">🤝</div>
          <div className="relative z-10 max-w-3xl">
            <span className="bg-green-500/20 text-green-400 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border border-green-500/30">
              Cooperative Registry
            </span>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight mt-3">Mechanized Sharing & Collective Growth</h2>
            <p className="text-slate-300 text-xs sm:text-sm mt-2 leading-relaxed">
              Unlock cheap shared heavy equipment, pool crops for higher bulk sales prices, and find mutual funding. Leverage local group resources to drastically lower input costs.
            </p>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm mb-8 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Name Search */}
            <div className="relative">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search name, produce, description..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-green-500 focus:border-green-500 bg-white"
              />
            </div>

            {/* Location Search */}
            <div className="relative">
              <MapPin className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search hub state or region..."
                value={locationSearch}
                onChange={e => setLocationSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-green-500 focus:border-green-500 bg-white"
              />
            </div>

            {/* Focus Filter */}
            <div>
              <select
                value={selectedType}
                onChange={e => setSelectedType(e.target.value)}
                className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-xl bg-white focus:ring-green-500 focus:border-green-500 text-slate-700"
              >
                <option value="All">All Focus Categories</option>
                <option value="Resource-Sharing">Resource-Sharing (Machinery)</option>
                <option value="Joint Marketing">Joint Marketing (Bulk Produce)</option>
                <option value="Financial/Credit">Financial/Credit (Group Savings)</option>
                <option value="Purchasing">Purchasing (Bulk Discounts)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading / Results Grid */}
        {loading ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm flex-grow flex flex-col justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-slate-500 text-sm font-semibold">Loading cooperative database...</p>
          </div>
        ) : filteredCooperatives.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm flex-grow flex flex-col justify-center items-center">
            <Info className="h-10 w-10 text-slate-300 mb-3" />
            <h3 className="text-lg font-bold text-slate-800">No matching cooperatives found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              Try adjusting your search keywords, location constraints, or category filters.
            </p>
            <button
              onClick={() => { setSearchTerm(''); setLocationSearch(''); setSelectedType('All'); }}
              className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-all cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCooperatives.map(coop => (
              <div 
                key={coop.id}
                onClick={() => setSelectedCooperative(coop)}
                className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-6 shadow-sm hover:shadow-md cursor-pointer transition-all duration-200 flex flex-col justify-between group h-full relative"
              >
                <div>
                  <div className="flex justify-between items-start gap-2">
                    <span className={`px-2.5 py-0.5 text-[9px] font-bold uppercase rounded-full border ${typeColorClasses[coop.type] || 'bg-slate-50 text-slate-700 border-slate-200'}`}>
                      {coop.type}
                    </span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded">
                      {coop.id}
                    </span>
                  </div>

                  <h3 className="text-lg font-extrabold text-slate-900 mt-3 group-hover:text-green-700 transition-colors">
                    {coop.name}
                  </h3>
                  
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1.5 font-semibold">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    <span>{coop.location}</span>
                  </div>

                  <p className="text-slate-600 text-xs sm:text-sm mt-3 leading-relaxed line-clamp-3">
                    {coop.description}
                  </p>

                  {/* Machinery Highlights */}
                  {coop.sharedEquipment && coop.sharedEquipment.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                        <Wrench className="h-3 w-3" /> Shared Machinery Pool
                      </h4>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {coop.sharedEquipment.slice(0, 2).map((eq, i) => (
                          <span key={i} className="text-[10px] bg-slate-50 border border-slate-150 rounded px-2 py-0.5 font-semibold text-slate-600">
                            ⚙️ {eq}
                          </span>
                        ))}
                        {coop.sharedEquipment.length > 2 && (
                          <span className="text-[9px] text-green-600 font-bold bg-green-50 px-1.5 py-0.5 rounded">
                            +{coop.sharedEquipment.length - 2} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-slate-500 font-semibold text-xs">
                    <Users className="h-4 w-4 text-slate-400" />
                    <span>{coop.activeMembers} Members</span>
                  </div>
                  <span className="text-[10px] text-green-600 font-bold group-hover:underline flex items-center gap-1">
                    <span>View Hub</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Detail Sliding Drawer Sidebar */}
      {selectedCooperative && (
        <>
          {/* Overlay background */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-40 z-40 transition-opacity animate-fade-in"
            onClick={() => { setSelectedCooperative(null); setLeasingMachine(null); }}
          ></div>
          
          <aside className="fixed top-0 right-0 h-full w-full max-w-lg bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out animate-in slide-in-from-right duration-250 flex flex-col">
            <header className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div>
                <span className={`px-2.5 py-0.5 text-[9px] font-bold uppercase rounded-full border ${typeColorClasses[selectedCooperative.type]}`}>
                  {selectedCooperative.type}
                </span>
                <h3 className="text-xl font-extrabold text-slate-900 mt-1.5">{selectedCooperative.name}</h3>
              </div>
              <button 
                onClick={() => { setSelectedCooperative(null); setLeasingMachine(null); }}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </header>

            <div className="flex-grow p-6 overflow-y-auto space-y-6">
              {/* Description */}
              <section className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">About the Cooperative</h4>
                <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                  {selectedCooperative.description}
                </p>
              </section>

              {/* Quick Coordinates & Contacts */}
              <section className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Union Coordinates & Verification</h4>
                <div className="grid grid-cols-1 gap-2 text-xs sm:text-sm bg-white border border-slate-200 p-4 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Main Hub Location</p>
                      <p className="font-semibold text-slate-800">{selectedCooperative.location}</p>
                    </div>
                  </div>

                  <div className="h-px bg-slate-100 my-1"></div>

                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                      <Mail className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Office Contact Email</p>
                      <a href={`mailto:${selectedCooperative.contactEmail}`} className="font-semibold text-green-600 hover:underline">{selectedCooperative.contactEmail}</a>
                    </div>
                  </div>

                  <div className="h-px bg-slate-100 my-1"></div>

                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                      <Phone className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">President Phone Line</p>
                      <a href={`tel:${selectedCooperative.presidentPhone}`} className="font-bold text-slate-800 hover:text-green-600 transition-colors">{selectedCooperative.presidentPhone}</a>
                    </div>
                  </div>
                </div>
              </section>

              {/* Machinery & Equipment Pool */}
              <section className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Wrench className="h-4 w-4 text-slate-400" />
                  <span>Physical Heavy Machinery Pool</span>
                </h4>
                {selectedCooperative.sharedEquipment.length === 0 ? (
                  <p className="text-xs text-slate-400 italic bg-slate-50 p-3 rounded-lg">No equipment currently registered for lease.</p>
                ) : (
                  <div className="space-y-2">
                    {selectedCooperative.sharedEquipment.map((eq, i) => (
                      <div key={i} className="flex items-center justify-between bg-slate-50 border border-slate-150 p-3 rounded-xl hover:bg-slate-100 transition-colors">
                        <span className="text-xs sm:text-sm font-bold text-slate-700">⚙️ {eq}</span>
                        <button
                          onClick={() => setLeasingMachine(eq)}
                          className="bg-green-600 hover:bg-green-700 text-white font-bold text-[10px] uppercase px-3 py-1.5 rounded-lg transition-colors shadow-sm cursor-pointer"
                        >
                          Request Lease
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Interactive Lease Form inside Drawer */}
              {leasingMachine && (
                <section className="border border-green-200 bg-green-50/50 p-4 rounded-xl space-y-3 animate-in slide-in-from-bottom duration-200 relative">
                  <button 
                    onClick={() => setLeasingMachine(null)}
                    className="absolute top-2.5 right-2.5 p-1 text-slate-400 hover:text-slate-600 rounded-full cursor-pointer"
                    title="Cancel leasing form"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <h5 className="text-xs font-bold text-green-800 uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="h-3.5 w-3.5 text-green-600 animate-pulse" />
                    <span>Leasing Form: {leasingMachine}</span>
                  </h5>
                  <form onSubmit={handleLeaseSubmit} className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] text-slate-500 font-bold uppercase mb-0.5">Lease Start Date</label>
                        <input
                          type="date"
                          required
                          value={leaseDate}
                          onChange={e => setLeaseDate(e.target.value)}
                          className="w-full text-xs border border-slate-300 bg-white p-1.5 rounded-lg focus:ring-1 focus:ring-green-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-500 font-bold uppercase mb-0.5">Duration (Days)</label>
                        <select
                          value={leaseDuration}
                          onChange={e => setLeaseDuration(e.target.value)}
                          className="w-full text-xs border border-slate-300 bg-white p-1.5 rounded-lg focus:ring-1 focus:ring-green-500"
                        >
                          <option value="1">1 Day</option>
                          <option value="3">3 Days</option>
                          <option value="7">1 Week</option>
                          <option value="14">2 Weeks</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500 font-bold uppercase mb-0.5">Notes / Special Requests</label>
                      <textarea
                        value={leaseNotes}
                        onChange={e => setLeaseNotes(e.target.value)}
                        placeholder="e.g. Need driver assistance, specify acreage size..."
                        rows={2}
                        className="w-full text-xs border border-slate-300 bg-white p-1.5 rounded-lg focus:ring-1 focus:ring-green-500"
                      ></textarea>
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2 bg-green-600 hover:bg-green-700 text-white font-bold text-xs uppercase rounded-lg shadow transition-colors cursor-pointer"
                    >
                      Submit Lease Request
                    </button>
                  </form>
                </section>
              )}
            </div>

            <footer className="p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <div className="text-xs text-slate-500 font-semibold">
                👥 {selectedCooperative.activeMembers} Registered Farmers
              </div>
              <a 
                href={`mailto:${selectedCooperative.contactEmail}`}
                className="bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>Email Secretary</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </footer>
          </aside>
        </>
      )}

      {/* Register Cooperative Overlay Modal */}
      {isRegisterOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto relative animate-in fade-in zoom-in-95 duration-150">
            <button 
              onClick={() => { setIsRegisterOpen(false); setShowRegSuccess(false); }}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            {showRegSuccess ? (
              <div className="text-center py-8 space-y-4">
                <div className="h-16 w-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto text-3xl animate-bounce">
                  🎉
                </div>
                <h3 className="text-xl font-black text-slate-900">Cooperative Registered Successfully!</h3>
                <p className="text-slate-500 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
                  Your cooperative has been submitted to the <strong>Cooperatives Verification Queue</strong>! To ensure directory integrity, registrations only go live in the public directory after a curator verifies the details.
                </p>
                <div className="pt-4">
                  <button
                    onClick={() => { setIsRegisterOpen(false); setShowRegSuccess(false); }}
                    className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow transition-all cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <h3 className="text-lg sm:text-xl font-extrabold text-slate-950 mb-4 flex items-center gap-2 pb-3 border-b border-slate-150">
                  <span>🤝</span> Register Farmer Cooperative Union
                </h3>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 text-xs text-amber-800 flex items-start gap-2">
                  <Info className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Verification Notice:</span> Registered cooperatives undergo administrator verification before going live.
                  </div>
                </div>

                <form onSubmit={handleRegisterSubmit} className="space-y-4 text-slate-700">
                  {/* Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Cooperative Name *</label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={newCoop.name}
                      onChange={handleRegInputChange}
                      placeholder="e.g. Enugu Rice Farmers Association"
                      className="w-full px-4 py-2 text-sm border border-slate-300 rounded-xl focus:ring-green-500 focus:border-green-500 bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Focus Type */}
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Cooperative Focus</label>
                      <select
                        name="type"
                        value={newCoop.type}
                        onChange={handleRegInputChange}
                        className="w-full px-4 py-2 text-sm border border-slate-300 rounded-xl bg-white focus:ring-green-500 focus:border-green-500"
                      >
                        <option value="Resource-Sharing">Resource-Sharing (Machinery/Land)</option>
                        <option value="Joint Marketing">Joint Marketing (Bulk Produce)</option>
                        <option value="Financial/Credit">Financial/Credit (Savings)</option>
                        <option value="Purchasing">Purchasing (Bulk Discounts)</option>
                      </select>
                    </div>

                    {/* Member Count */}
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Active Registered Members *</label>
                      <input
                        type="number"
                        name="activeMembers"
                        min="1"
                        required
                        value={newCoop.activeMembers}
                        onChange={handleRegInputChange}
                        className="w-full px-4 py-2 text-sm border border-slate-300 rounded-xl focus:ring-green-500 focus:border-green-500 bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Location */}
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Hub Location *</label>
                      <input
                        type="text"
                        name="location"
                        required
                        value={newCoop.location}
                        onChange={handleRegInputChange}
                        placeholder="e.g. Enugu, Enugu State"
                        className="w-full px-4 py-2 text-sm border border-slate-300 rounded-xl focus:ring-green-500 focus:border-green-500 bg-white"
                      />
                    </div>

                    {/* Contact Email */}
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Contact Email Address *</label>
                      <input
                        type="email"
                        name="contactEmail"
                        required
                        value={newCoop.contactEmail}
                        onChange={handleRegInputChange}
                        placeholder="e.g. office@enugurice.coop"
                        className="w-full px-4 py-2 text-sm border border-slate-300 rounded-xl focus:ring-green-500 focus:border-green-500 bg-white"
                      />
                    </div>

                    {/* President Phone */}
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">President Phone Line *</label>
                      <input
                        type="text"
                        name="presidentPhone"
                        required
                        value={newCoop.presidentPhone}
                        onChange={handleRegInputChange}
                        placeholder="e.g. +234 803 123 4567"
                        className="w-full px-4 py-2 text-sm border border-slate-300 rounded-xl focus:ring-green-500 focus:border-green-500 bg-white"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Union Description</label>
                    <textarea
                      name="description"
                      rows={3}
                      value={newCoop.description}
                      onChange={handleRegInputChange}
                      placeholder="Brief overview of agricultural focus, targeted grains/tubers, and aggregate group targets..."
                      className="w-full px-4 py-2 text-sm border border-slate-300 rounded-xl focus:ring-green-500 focus:border-green-500 bg-white"
                    ></textarea>
                  </div>

                  {/* Machinery array */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">🚜 Shared Machinery Pool</label>
                      <button
                        type="button"
                        onClick={handleAddEquipmentField}
                        className="text-xs text-green-600 hover:text-green-700 font-bold flex items-center gap-1 cursor-pointer"
                      >
                        + Add Equipment
                      </button>
                    </div>
                    <div className="space-y-2 max-h-36 overflow-y-auto p-1 border border-slate-100 rounded-lg">
                      {newCoop.sharedEquipment.map((item, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="text"
                            value={item}
                            onChange={(e) => handleEquipmentValueChange(index, e.target.value)}
                            placeholder="e.g. Seed planter, Tractor, Irrigation pump"
                            className="flex-grow px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-green-500 bg-white"
                          />
                          {newCoop.sharedEquipment.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveEquipmentField(index)}
                              className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setIsRegisterOpen(false)}
                      className="px-4 py-2 border border-slate-300 hover:bg-slate-50 rounded-xl font-semibold text-xs text-slate-700 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer"
                    >
                      Submit Registration
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Machinery Lease Success Modal */}
      {showLeaseSuccess && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl border border-slate-100 space-y-4 relative animate-in zoom-in-95 duration-150">
            <div className="h-14 w-14 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto text-2xl">
              ✅
            </div>
            <h4 className="text-lg font-extrabold text-slate-900">Lease Request Submitted</h4>
            <p className="text-slate-500 text-xs leading-relaxed">
              Your request to lease the <strong>{leasingMachine}</strong> has been transmitted directly to the cooperative board of directors. The union president or coordinator will contact you shortly on your registered profile coordinates.
            </p>
            <button
              onClick={() => { setShowLeaseSuccess(false); setLeasingMachine(null); }}
              className="w-full py-2 bg-slate-900 hover:bg-slate-950 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CooperativesPage;

import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Layout, 
  AlertTriangle,
  X,
  CheckCircle2,
  BookOpen
} from 'lucide-react';
import api from '../api/axios';

const Domains = () => {
  const [domains, setDomains] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filtering States
  const [searchQuery, setSearchQuery] = useState('');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [currentDomain, setCurrentDomain] = useState({ name: '' });
  
  // Delete Confirmation State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [domainToDelete, setDomainToDelete] = useState(null);

  // Toast Notification State
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Fetch Domains
  const fetchDomains = async () => {
    setLoading(true);
    try {
      const response = await api.get('/domains'); // [cite: 48]
      setDomains(response.data.data || response.data); 
    } catch (error) {
      showToast('Failed to load domains.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDomains();
  }, []);

  // Toast Helper
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  // Open Modal Helpers
  const openAddModal = () => {
    setModalMode('add');
    setCurrentDomain({ name: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (domain) => {
    setModalMode('edit');
    setCurrentDomain({ ...domain });
    setIsModalOpen(true);
  };

  const openDeleteModal = (domain) => {
    setDomainToDelete(domain);
    setIsDeleteModalOpen(true);
  };

  // CRUD Operations
  const handleSaveDomain = async (e) => {
    e.preventDefault();
    try {
      if (modalMode === 'add') {
        await api.post('/domains', { name: currentDomain.name }); // [cite: 50, 51]
        showToast('Domain created successfully!');
      } else {
        await api.put(`/domains/${currentDomain.id}`, { name: currentDomain.name }); // [cite: 52]
        showToast('Domain updated successfully!');
      }
      setIsModalOpen(false);
      fetchDomains();
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to save domain.', 'error');
    }
  };

  const handleDeleteDomain = async () => {
    if (!domainToDelete) return;
    try {
      await api.delete(`/domains/${domainToDelete.id}`); // [cite: 53]
      showToast('Domain deleted successfully!');
      setIsDeleteModalOpen(false);
      fetchDomains();
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to delete domain.', 'error');
    }
  };

  // Filtering Logic
  const filteredDomains = domains.filter(domain => 
    domain.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto min-h-screen bg-[#fafafa] text-slate-800 font-sans">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-1 rounded-full bg-teal-100 text-teal-700 text-xs font-bold tracking-wider uppercase flex items-center gap-1.5">
              <Layout size={14} /> Content Architecture
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">
            Learning Domains
          </h1>
          <p className="text-slate-500 mt-1 font-medium">Curate the primary categories for wellbeing habits and lessons.</p>
        </div>
        <button 
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-semibold shadow-sm shadow-teal-200 transition-all duration-200"
        >
          <Plus size={18} />
          Add Domain
        </button>
      </div>

      {/* MAIN CONTENT CARD */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
        
        {/* Table Toolbar */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search domains..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent w-full bg-white transition-shadow"
            />
          </div>
          <span className="text-sm font-bold text-slate-400 uppercase tracking-wider ml-4">
            Total: {filteredDomains.length}
          </span>
        </div>

        {/* DATA TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Domain Name</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Created Date</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                // LOADING SKELETON
                [...Array(4)].map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-48"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-24"></div></td>
                    <td className="px-6 py-4 flex justify-end gap-2">
                      <div className="h-8 w-8 bg-slate-200 rounded-lg"></div>
                      <div className="h-8 w-8 bg-slate-200 rounded-lg"></div>
                    </td>
                  </tr>
                ))
              ) : filteredDomains.length === 0 ? (
                // EMPTY STATE
                <tr>
                  <td colSpan="3" className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <BookOpen size={48} className="mb-4 opacity-20" />
                      <p className="text-lg font-semibold text-slate-600">No domains found</p>
                      <p className="text-sm mt-1">Start building your curriculum by adding a domain.</p>
                      <button onClick={openAddModal} className="mt-4 text-teal-600 font-medium hover:underline">
                        + Create Domain
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                // ACTUAL DATA
                filteredDomains.map((domain) => (
                  <tr key={domain.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-2 font-bold text-slate-700">
                        <BookOpen size={16} className="text-teal-500" />
                        {domain.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 font-medium">
                      {new Date(domain.created_at || Date.now()).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'short', day: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => openEditModal(domain)}
                        className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                        title="Edit Domain"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => openDeleteModal(domain)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete Domain"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- ADD/EDIT MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xl font-bold text-slate-800">
                {modalMode === 'add' ? 'Create New Domain' : 'Edit Domain'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-100">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveDomain} className="p-6">
              <div className="mb-6">
                <label className="block text-sm font-bold text-slate-700 mb-2">Domain Name *</label>
                <input 
                  type="text" 
                  required
                  autoFocus
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-shadow text-slate-800 font-medium"
                  placeholder="e.g., Smart Routine"
                  value={currentDomain.name}
                  onChange={(e) => setCurrentDomain({...currentDomain, name: e.target.value})}
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2.5 rounded-xl font-semibold bg-teal-600 hover:bg-teal-700 text-white shadow-sm shadow-teal-200 transition-colors"
                >
                  {modalMode === 'add' ? 'Create Domain' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- DELETE CONFIRMATION MODAL --- */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-center p-8">
            <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={32} />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">Delete Domain?</h3>
            <p className="text-slate-500 font-medium mb-8">
              Are you sure you want to delete <strong className="text-slate-700">"{domainToDelete?.name}"</strong>? This action cannot be undone and may affect associated habits.
            </p>
            <div className="flex gap-3 justify-center">
              <button 
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 px-5 py-2.5 rounded-xl font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteDomain}
                className="flex-1 px-5 py-2.5 rounded-xl font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-sm shadow-rose-200 transition-colors"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- TOAST NOTIFICATION --- */}
      {toast.show && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className={`flex items-center gap-3 px-5 py-4 rounded-2xl shadow-xl border ${
            toast.type === 'success' 
              ? 'bg-emerald-50 border-emerald-100 text-emerald-800' 
              : 'bg-rose-50 border-rose-100 text-rose-800'
          }`}>
            {toast.type === 'success' ? <CheckCircle2 size={20} className="text-emerald-500" /> : <AlertTriangle size={20} className="text-rose-500" />}
            <span className="font-semibold">{toast.message}</span>
            <button onClick={() => setToast({ ...toast, show: false })} className="ml-4 opacity-50 hover:opacity-100 transition-opacity">
              <X size={16} />
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default Domains;
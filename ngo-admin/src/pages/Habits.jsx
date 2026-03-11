import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  AlertTriangle,
  X,
  CheckCircle2,
  Repeat,
  Layout,
  ListOrdered,
  AlignLeft
} from 'lucide-react';
import api from '../api/axios';

const initialHabitState = {
  name: '',
  domain_id: '',
  description: '',
  order_number: ''
};

const Habits = () => {
  const [habits, setHabits] = useState([]);
  const [domains, setDomains] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filtering States
  const [searchQuery, setSearchQuery] = useState('');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [currentHabit, setCurrentHabit] = useState(initialHabitState);
  
  // Delete Confirmation State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [habitToDelete, setHabitToDelete] = useState(null);

  // Toast Notification State
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Fetch Data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [habitsRes, domainsRes] = await Promise.all([
        api.get('/habits'),
        api.get('/domains')
      ]);
      setHabits(habitsRes.data.data || habitsRes.data);
      setDomains(domainsRes.data.data || domainsRes.data);
    } catch (error) {
      showToast('Failed to load system data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Toast Helper
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  // Open Modal Helpers
  const openAddModal = () => {
    setModalMode('add');
    setCurrentHabit(initialHabitState);
    setIsModalOpen(true);
  };

  const openEditModal = (habit) => {
    setModalMode('edit');
    setCurrentHabit({
      ...habit,
      domain_id: habit.domain_id || '',
      order_number: habit.order_number || ''
    });
    setIsModalOpen(true);
  };

  const openDeleteModal = (habit) => {
    setHabitToDelete(habit);
    setIsDeleteModalOpen(true);
  };

  // CRUD Operations
  const handleSaveHabit = async (e) => {
    e.preventDefault();
    
    // Ensure numeric fields are parsed correctly for the API
    const payload = {
      name: currentHabit.name,
      description: currentHabit.description,
      domain_id: currentHabit.domain_id ? parseInt(currentHabit.domain_id) : null,
      order_number: currentHabit.order_number ? parseInt(currentHabit.order_number) : 1
    };

    try {
      if (modalMode === 'add') {
        await api.post('/habits', payload);
        showToast('Habit created successfully!');
      } else {
        await api.put(`/habits/${currentHabit.id}`, payload);
        showToast('Habit updated successfully!');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to save habit details.', 'error');
    }
  };

  const handleDeleteHabit = async () => {
    if (!habitToDelete) return;
    try {
      await api.delete(`/habits/${habitToDelete.id}`);
      showToast('Habit removed successfully!');
      setIsDeleteModalOpen(false);
      fetchData();
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to delete habit.', 'error');
    }
  };

  // Filtering Logic
  const filteredHabits = habits.filter(habit => 
    habit.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Helper to find domain name
  const getDomainName = (domainId) => {
    const domain = domains.find(d => d.id === domainId);
    return domain ? domain.name : 'Unassigned';
  };

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto min-h-screen bg-[#fafafa] text-slate-800 font-sans">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-bold tracking-wider uppercase flex items-center gap-1.5">
              <Repeat size={14} /> Routine Engine
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">
            Habit Management
          </h1>
          <p className="text-slate-500 mt-1 font-medium">Define and organize the core daily habits targeted by your curriculum.</p>
        </div>
        <button 
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-semibold shadow-sm shadow-rose-200 transition-all duration-200"
        >
          <Plus size={18} />
          Add Habit
        </button>
      </div>

      {/* MAIN CONTENT CARD */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
        
        {/* Table Toolbar */}
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-50/50">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search habits by name..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent w-full bg-white transition-shadow"
            />
          </div>
          <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-500 tracking-wider">
            Showing {filteredHabits.length} {filteredHabits.length === 1 ? 'Habit' : 'Habits'}
          </div>
        </div>

        {/* DATA TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider w-1/4">Habit Name</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider w-1/5">Domain</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider w-1/6">Order</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Description</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                // LOADING SKELETON
                [...Array(5)].map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-48 mb-2"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-32 mb-2"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-12 mb-2"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-64"></div></td>
                    <td className="px-6 py-4 flex justify-end gap-2"><div className="h-8 w-8 bg-slate-200 rounded-lg"></div><div className="h-8 w-8 bg-slate-200 rounded-lg"></div></td>
                  </tr>
                ))
              ) : filteredHabits.length === 0 ? (
                // EMPTY STATE
                <tr>
                  <td colSpan="5" className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <Repeat size={48} className="mb-4 opacity-20" />
                      <p className="text-lg font-semibold text-slate-600">No habits created yet</p>
                      <p className="text-sm mt-1">Start defining daily routines for the curriculum.</p>
                      <button onClick={openAddModal} className="mt-4 text-rose-600 font-medium hover:underline">
                        + Add Habit
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                // ACTUAL DATA
                filteredHabits.map((habit) => (
                  <tr key={habit.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800 flex items-center gap-2">
                        {habit.name}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
                        <Layout size={12} className="text-teal-500" />
                        {getDomainName(habit.domain_id)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-rose-50 text-rose-600 font-bold text-sm border border-rose-100">
                        {habit.order_number || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-slate-500 max-w-md truncate" title={habit.description}>
                        {habit.description || '-'}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => openEditModal(habit)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Edit Habit"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => openDeleteModal(habit)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Habit"
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
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xl font-bold text-slate-800">
                {modalMode === 'add' ? 'Create New Habit' : 'Edit Habit Details'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-100">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSaveHabit} className="p-6 max-h-[80vh] overflow-y-auto">
              <div className="space-y-5">
                
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <Repeat size={14} className="text-rose-500"/> Habit Name *
                  </label>
                  <input 
                    type="text" required
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium text-slate-800"
                    placeholder="e.g., Morning Hydration"
                    value={currentHabit.name}
                    onChange={(e) => setCurrentHabit({...currentHabit, name: e.target.value})}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                      <Layout size={14} className="text-teal-500"/> Associated Domain *
                    </label>
                    <select 
                      required
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium text-slate-800 bg-white"
                      value={currentHabit.domain_id}
                      onChange={(e) => setCurrentHabit({...currentHabit, domain_id: e.target.value})}
                    >
                      <option value="" disabled>Select a domain</option>
                      {domains.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                      <ListOrdered size={14} className="text-slate-400"/> Order Sequence *
                    </label>
                    <input 
                      type="number" required min="1"
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium text-slate-800"
                      placeholder="e.g., 1"
                      value={currentHabit.order_number}
                      onChange={(e) => setCurrentHabit({...currentHabit, order_number: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <AlignLeft size={14} className="text-slate-400"/> Short Description
                  </label>
                  <textarea 
                    rows="3"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium text-slate-800 resize-none"
                    placeholder="Briefly describe what this habit entails..."
                    value={currentHabit.description}
                    onChange={(e) => setCurrentHabit({...currentHabit, description: e.target.value})}
                  ></textarea>
                </div>

              </div>

              {/* Modal Footer */}
              <div className="flex gap-3 justify-end mt-8 pt-6 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2.5 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-2.5 rounded-xl font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-sm shadow-rose-200 transition-colors"
                >
                  {modalMode === 'add' ? 'Save Habit' : 'Update Details'}
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
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={32} />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">Delete Habit?</h3>
            <p className="text-slate-500 font-medium mb-8">
              Are you sure you want to delete <strong className="text-slate-700">"{habitToDelete?.name}"</strong>? This will remove it from its associated domain.
            </p>
            <div className="flex gap-3 justify-center">
              <button 
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 px-5 py-2.5 rounded-xl font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteHabit}
                className="flex-1 px-5 py-2.5 rounded-xl font-semibold bg-red-600 hover:bg-red-700 text-white shadow-sm shadow-red-200 transition-colors"
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
            toast.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-red-50 border-red-100 text-red-800'
          }`}>
            {toast.type === 'success' ? <CheckCircle2 size={20} className="text-emerald-500" /> : <AlertTriangle size={20} className="text-red-500" />}
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

export default Habits;
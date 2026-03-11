import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  MapPin, 
  AlertTriangle,
  X,
  CheckCircle2
} from 'lucide-react';
import api from '../api/axios';

const Clusters = () => {
  const [clusters, setClusters] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [currentCluster, setCurrentCluster] = useState({ name: '' });
  
  // Delete Confirmation State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [clusterToDelete, setClusterToDelete] = useState(null);

  // Toast Notification State
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Fetch Clusters
  const fetchClusters = async () => {
    setLoading(true);
    try {
      const response = await api.get('/clusters');
      setClusters(response.data.data || response.data); // Adjust based on your exact backend response wrapper
    } catch (error) {
      showToast('Failed to load clusters.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClusters();
  }, []);

  // Toast Helper
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  // Open Modal Helpers
  const openAddModal = () => {
    setModalMode('add');
    setCurrentCluster({ name: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (cluster) => {
    setModalMode('edit');
    setCurrentCluster(cluster);
    setIsModalOpen(true);
  };

  const openDeleteModal = (cluster) => {
    setClusterToDelete(cluster);
    setIsDeleteModalOpen(true);
  };

  // CRUD Operations
  const handleSaveCluster = async (e) => {
    e.preventDefault();
    try {
      if (modalMode === 'add') {
        await api.post('/clusters', { name: currentCluster.name });
        showToast('Cluster added successfully!');
      } else {
        await api.put(`/clusters/${currentCluster.id}`, { name: currentCluster.name });
        showToast('Cluster updated successfully!');
      }
      setIsModalOpen(false);
      fetchClusters();
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to save cluster.', 'error');
    }
  };

  const handleDeleteCluster = async () => {
    if (!clusterToDelete) return;
    try {
      await api.delete(`/clusters/${clusterToDelete.id}`);
      showToast('Cluster deleted successfully!');
      setIsDeleteModalOpen(false);
      fetchClusters();
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to delete cluster.', 'error');
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto min-h-screen bg-[#fafafa] text-slate-800 font-sans">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold tracking-wider uppercase flex items-center gap-1.5">
              <MapPin size={14} /> Geographic Organization
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">
            Cluster Management
          </h1>
          <p className="text-slate-500 mt-1 font-medium">Create and manage regional clusters to group schools.</p>
        </div>
        <button 
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-sm shadow-indigo-200 transition-all duration-200"
        >
          <Plus size={18} />
          Add Cluster
        </button>
      </div>

      {/* MAIN CONTENT CARD */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
        
        {/* Table Toolbar */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search clusters..." 
              className="pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-64 bg-white"
            />
          </div>
          <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">
            Total: {clusters.length}
          </span>
        </div>

        {/* DATA TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">ID</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Cluster Name</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Created Date</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                // LOADING SKELETON
                [...Array(5)].map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-8"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-48"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-24"></div></td>
                    <td className="px-6 py-4 flex justify-end gap-2">
                      <div className="h-8 w-8 bg-slate-200 rounded-lg"></div>
                      <div className="h-8 w-8 bg-slate-200 rounded-lg"></div>
                    </td>
                  </tr>
                ))
              ) : clusters.length === 0 ? (
                // EMPTY STATE
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <MapPin size={48} className="mb-4 opacity-20" />
                      <p className="text-lg font-semibold text-slate-600">No clusters found</p>
                      <p className="text-sm mt-1">Get started by creating your first cluster.</p>
                      <button onClick={openAddModal} className="mt-4 text-indigo-600 font-medium hover:underline">
                        + Add Cluster
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                // ACTUAL DATA
                clusters.map((cluster) => (
                  <tr key={cluster.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4 text-sm font-medium text-slate-400">#{cluster.id}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-2 font-semibold text-slate-700">
                        <MapPin size={16} className="text-indigo-400" />
                        {cluster.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 font-medium">
                      {new Date(cluster.created_at || Date.now()).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'short', day: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => openEditModal(cluster)}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => openDeleteModal(cluster)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete"
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
                {modalMode === 'add' ? 'Create New Cluster' : 'Edit Cluster'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveCluster} className="p-6">
              <div className="mb-6">
                <label className="block text-sm font-bold text-slate-700 mb-2">Cluster Name</label>
                <input 
                  type="text" 
                  required
                  autoFocus
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow text-slate-800 font-medium"
                  placeholder="e.g., Delhi NCR"
                  value={currentCluster.name}
                  onChange={(e) => setCurrentCluster({...currentCluster, name: e.target.value})}
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
                  className="px-5 py-2.5 rounded-xl font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-200 transition-colors"
                >
                  {modalMode === 'add' ? 'Create Cluster' : 'Save Changes'}
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
            <h3 className="text-2xl font-bold text-slate-800 mb-2">Delete Cluster?</h3>
            <p className="text-slate-500 font-medium mb-8">
              Are you sure you want to delete <strong className="text-slate-700">"{clusterToDelete?.name}"</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-center">
              <button 
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 px-5 py-2.5 rounded-xl font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteCluster}
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

export default Clusters;
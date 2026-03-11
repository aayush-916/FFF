import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  School as SchoolIcon, 
  AlertTriangle,
  X,
  CheckCircle2,
  MapPin,
  Filter,
  Phone,
  User,
  ShieldCheck
} from 'lucide-react';
import api from '../api/axios';

const initialSchoolState = {
  name: '',
  code: '',
  cluster_id: '',
  city: '',
  state: '',
  contact_person: '',
  contact_email: '',
  contact_phone: '',
  status: 'Active'
};

const initialAdminState = {
  name: '',
  username: '',
  password: '',
  confirmPassword: ''
};

const Schools = () => {
  const [schools, setSchools] = useState([]);
  const [clusters, setClusters] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filtering States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClusterFilter, setSelectedClusterFilter] = useState('All');

  // School Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [currentSchool, setCurrentSchool] = useState(initialSchoolState);
  
  // Admin Modal States (Step 2)
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [newlyCreatedSchool, setNewlyCreatedSchool] = useState({ id: null, name: '' });
  const [adminForm, setAdminForm] = useState(initialAdminState);

  // Delete Confirmation State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [schoolToDelete, setSchoolToDelete] = useState(null);

  // Toast Notification State
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Fetch Data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [schoolsRes, clustersRes] = await Promise.all([
        api.get('/schools'),
        api.get('/clusters')
      ]);
      setSchools(schoolsRes.data.data || schoolsRes.data);
      setClusters(clustersRes.data.data || clustersRes.data);
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
    setCurrentSchool(initialSchoolState);
    setIsModalOpen(true);
  };

  const openEditModal = (school) => {
    setModalMode('edit');
    setCurrentSchool({
      ...school,
      code: school.code || '',
      cluster_id: school.cluster_id || '',
      status: school.status || 'Active'
    });
    setIsModalOpen(true);
  };

  const openDeleteModal = (school) => {
    setSchoolToDelete(school);
    setIsDeleteModalOpen(true);
  };

  // --- STEP 1: Save School ---
  const handleSaveSchool = async (e) => {
    e.preventDefault();
    
    const payload = {
      ...currentSchool,
      cluster_id: currentSchool.cluster_id ? parseInt(currentSchool.cluster_id) : null
    };

    try {
      if (modalMode === 'add') {
        const response = await api.post('/schools', payload);
        const createdData = response.data.data || response.data; // Extract created school
        
        setIsModalOpen(false);
        fetchData(); // Refresh background table
        
        // Trigger Step 2
        setNewlyCreatedSchool({ id: createdData.id, name: createdData.name });
        setAdminForm(initialAdminState);
        setIsAdminModalOpen(true);
        
      } else {
        await api.put(`/schools/${currentSchool.id}`, payload);
        showToast('School updated successfully!');
        setIsModalOpen(false);
        fetchData();
      }
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to save school details.', 'error');
    }
  };

  // --- STEP 2: Save School Admin ---
  const handleSaveAdmin = async (e) => {
    e.preventDefault();

    if (adminForm.password !== adminForm.confirmPassword) {
      return showToast('Passwords do not match.', 'error');
    }

    try {
      await api.post('/users', {
        school_id: newlyCreatedSchool.id,
        name: adminForm.name,
        username: adminForm.username,
        password: adminForm.password,
        role: 'school_admin'
      });
      
      showToast('School and Admin account created successfully!');
      setIsAdminModalOpen(false);
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to create admin account.', 'error');
    }
  };

  const handleDeleteSchool = async () => {
    if (!schoolToDelete) return;
    try {
      await api.delete(`/schools/${schoolToDelete.id}`);
      showToast('School removed from the system!');
      setIsDeleteModalOpen(false);
      fetchData();
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to delete school.', 'error');
    }
  };

  // Filtering Logic
  const filteredSchools = schools.filter(school => {
    const matchesSearch = school.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCluster = selectedClusterFilter === 'All' || school.cluster_id?.toString() === selectedClusterFilter;
    return matchesSearch && matchesCluster;
  });

  const getClusterName = (clusterId) => {
    const cluster = clusters.find(c => c.id === clusterId);
    return cluster ? cluster.name : 'Unassigned';
  };

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto min-h-screen bg-[#fafafa] text-slate-800 font-sans">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold tracking-wider uppercase flex items-center gap-1.5">
              <SchoolIcon size={14} /> Institution Directory
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">
            School Management
          </h1>
          <p className="text-slate-500 mt-1 font-medium">Register and oversee participating schools within your clusters.</p>
        </div>
        <button 
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-sm shadow-blue-200 transition-all duration-200"
        >
          <Plus size={18} />
          Register School
        </button>
      </div>

      {/* MAIN CONTENT CARD */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
        
        {/* Table Toolbar */}
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-50/50">
          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" placeholder="Search schools by name..." 
                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full bg-white"
              />
            </div>
            <div className="relative w-full md:w-56">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <select 
                value={selectedClusterFilter} onChange={(e) => setSelectedClusterFilter(e.target.value)}
                className="pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full bg-white appearance-none font-medium text-slate-600"
              >
                <option value="All">All Clusters</option>
                {clusters.map(cluster => (
                  <option key={cluster.id} value={cluster.id.toString()}>{cluster.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-500 tracking-wider">
            Showing {filteredSchools.length} {filteredSchools.length === 1 ? 'School' : 'Schools'}
          </div>
        </div>

        {/* DATA TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">School Details</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Location</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Contact Info</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                [...Array(5)].map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-48 mb-2"></div><div className="h-3 bg-slate-100 rounded w-24"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-32 mb-2"></div><div className="h-3 bg-slate-100 rounded w-20"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-32 mb-2"></div><div className="h-3 bg-slate-100 rounded w-24"></div></td>
                    <td className="px-6 py-4"><div className="h-6 bg-slate-200 rounded-full w-20"></div></td>
                    <td className="px-6 py-4 flex justify-end gap-2"><div className="h-8 w-8 bg-slate-200 rounded-lg"></div><div className="h-8 w-8 bg-slate-200 rounded-lg"></div></td>
                  </tr>
                ))
              ) : filteredSchools.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <SchoolIcon size={48} className="mb-4 opacity-20" />
                      <p className="text-lg font-semibold text-slate-600">No schools found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredSchools.map((school) => (
                  <tr key={school.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800 flex items-center gap-2">
                        {school.name}
                        {school.code && <span className="bg-slate-100 text-slate-500 text-[10px] px-2 py-0.5 rounded border border-slate-200">{school.code}</span>}
                      </div>
                      <div className="text-xs font-medium text-slate-400 mt-1 flex items-center gap-1">
                        <MapPin size={12} className="text-indigo-400"/> {getClusterName(school.cluster_id)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-700">{school.city || '-'}</div>
                      <div className="text-xs font-medium text-slate-400 mt-1">{school.state || '-'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-700 flex items-center gap-1.5">
                        <User size={14} className="text-slate-400" /> {school.contact_person || '-'}
                      </div>
                      <div className="text-xs font-medium text-slate-500 mt-1 flex items-center gap-1.5">
                        <Phone size={12} className="text-slate-400" /> {school.contact_phone || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${
                        school.status === 'Active' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-slate-100 border-slate-200 text-slate-500'
                      }`}>
                        {school.status || 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEditModal(school)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                        <Edit2 size={18} />
                      </button>
                      <button onClick={() => openDeleteModal(school)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg">
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

      {/* --- STEP 1 MODAL: ADD/EDIT SCHOOL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xl font-bold text-slate-800">
                {modalMode === 'add' ? 'Step 1: Register New School' : 'Edit School Details'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSaveSchool} className="p-6 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Core Details */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 border-b border-slate-100 pb-2">Institution Details</h4>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2">
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">School Name *</label>
                      <input 
                        type="text" required
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium text-slate-800"
                        value={currentSchool.name} onChange={(e) => setCurrentSchool({...currentSchool, name: e.target.value})}
                      />
                    </div>
                    <div className="col-span-1">
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">School Code *</label>
                      <input 
                        type="text" required
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium text-slate-800 uppercase"
                        value={currentSchool.code} onChange={(e) => setCurrentSchool({...currentSchool, code: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Assigned Cluster *</label>
                    <select 
                      required
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium text-slate-800 bg-white"
                      value={currentSchool.cluster_id} onChange={(e) => setCurrentSchool({...currentSchool, cluster_id: e.target.value})}
                    >
                      <option value="" disabled>Select a cluster</option>
                      {clusters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">City</label>
                      <input 
                        type="text" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium text-slate-800"
                        value={currentSchool.city} onChange={(e) => setCurrentSchool({...currentSchool, city: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">State</label>
                      <input 
                        type="text" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium text-slate-800"
                        value={currentSchool.state} onChange={(e) => setCurrentSchool({...currentSchool, state: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                {/* Contact Details */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 border-b border-slate-100 pb-2">Contact & Status</h4>
                  
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Contact Person</label>
                    <input 
                      type="text" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium text-slate-800"
                      value={currentSchool.contact_person} onChange={(e) => setCurrentSchool({...currentSchool, contact_person: e.target.value})}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">Email</label>
                      <input 
                        type="email" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium text-slate-800"
                        value={currentSchool.contact_email} onChange={(e) => setCurrentSchool({...currentSchool, contact_email: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">Phone</label>
                      <input 
                        type="text" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium text-slate-800"
                        value={currentSchool.contact_phone} onChange={(e) => setCurrentSchool({...currentSchool, contact_phone: e.target.value})}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Account Status</label>
                    <div className="flex gap-4 mt-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="status" value="Active" checked={currentSchool.status === 'Active'} onChange={(e) => setCurrentSchool({...currentSchool, status: e.target.value})} className="w-4 h-4 text-blue-600 focus:ring-blue-500"/>
                        <span className="text-sm font-bold text-emerald-700">Active</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="status" value="Inactive" checked={currentSchool.status === 'Inactive'} onChange={(e) => setCurrentSchool({...currentSchool, status: e.target.value})} className="w-4 h-4 text-blue-600 focus:ring-blue-500"/>
                        <span className="text-sm font-bold text-slate-500">Inactive</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 justify-end mt-8 pt-6 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 rounded-xl font-semibold text-slate-600 hover:bg-slate-100">Cancel</button>
                <button type="submit" className="px-6 py-2.5 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-200">
                  {modalMode === 'add' ? 'Continue to Step 2 →' : 'Update Details'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- STEP 2 MODAL: CREATE SCHOOL ADMIN --- */}
      {isAdminModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                <ShieldCheck size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-1">Step 2: Create Admin Account</h3>
              <p className="text-blue-100 text-sm font-medium">
                School created successfully! Now set up the primary login for <br/>
                <strong className="text-white text-base mt-1 block">"{newlyCreatedSchool.name}"</strong>
              </p>
            </div>
            
            <form onSubmit={handleSaveAdmin} className="p-8">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Admin Name</label>
                  <input 
                    type="text" required
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 font-medium text-slate-800"
                    placeholder="e.g., Principal Sharma"
                    value={adminForm.name} onChange={(e) => setAdminForm({...adminForm, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Username</label>
                  <input 
                    type="text" required
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 font-medium text-slate-800"
                    placeholder="e.g., dps_admin"
                    value={adminForm.username} onChange={(e) => setAdminForm({...adminForm, username: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Password</label>
                    <input 
                      type="password" required
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 font-medium text-slate-800"
                      value={adminForm.password} onChange={(e) => setAdminForm({...adminForm, password: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Confirm Password</label>
                    <input 
                      type="password" required
                      className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 font-medium text-slate-800 ${
                        adminForm.confirmPassword && adminForm.password !== adminForm.confirmPassword 
                        ? 'border-rose-300 focus:ring-rose-500 bg-rose-50' 
                        : 'border-slate-200 focus:ring-indigo-500'
                      }`}
                      value={adminForm.confirmPassword} onChange={(e) => setAdminForm({...adminForm, confirmPassword: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 justify-end mt-8">
                <button 
                  type="button" 
                  onClick={() => setIsAdminModalOpen(false)}
                  className="px-6 py-2.5 rounded-xl font-semibold text-slate-500 hover:bg-slate-100"
                >
                  Skip for now
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-2.5 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-200"
                >
                  Create Admin Account
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
            <h3 className="text-2xl font-bold text-slate-800 mb-2">Remove School?</h3>
            <p className="text-slate-500 font-medium mb-8">
              Are you sure you want to delete <strong className="text-slate-700">"{schoolToDelete?.name}"</strong>? This will permanently remove their access.
            </p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 px-5 py-2.5 rounded-xl font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200">Cancel</button>
              <button onClick={handleDeleteSchool} className="flex-1 px-5 py-2.5 rounded-xl font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-sm shadow-rose-200">Yes, Remove</button>
            </div>
          </div>
        </div>
      )}

      {/* --- TOAST NOTIFICATION --- */}
      {toast.show && (
        <div className="fixed bottom-6 right-6 z-[70] animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className={`flex items-center gap-3 px-5 py-4 rounded-2xl shadow-xl border ${toast.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-rose-50 border-rose-100 text-rose-800'}`}>
            {toast.type === 'success' ? <CheckCircle2 size={20} className="text-emerald-500" /> : <AlertTriangle size={20} className="text-rose-500" />}
            <span className="font-semibold">{toast.message}</span>
            <button onClick={() => setToast({ ...toast, show: false })} className="ml-4 opacity-50 hover:opacity-100"><X size={16} /></button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Schools;
import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Key,
  Shield, 
  AlertTriangle,
  X,
  CheckCircle2,
  Filter,
  UserCheck,
  UserX,
  Users as UsersIcon,
  GraduationCap
} from 'lucide-react';
import api from '../api/axios';

const initialUserState = {
  name: '',
  username: '',
  password: '',
  role: 'school_super_admin',
  school_id: '',
  status: 'Active'
};

const Users = () => {
  const [users, setUsers] = useState([]);
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filtering States
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');

  // Main User Modal States (Add/Edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [currentUser, setCurrentUser] = useState(initialUserState);
  
  // Reset Password Modal States
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetUser, setResetUser] = useState(null);
  const [passwords, setPasswords] = useState({ new: '', confirm: '' });

  // Toast Notification State
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Fetch Data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, schoolsRes] = await Promise.all([
        api.get('/users'),
        api.get('/schools')
      ]);
      setUsers(usersRes.data.data || usersRes.data);
      setSchools(schoolsRes.data.data || schoolsRes.data);
    } catch (error) {
      showToast('Failed to load users data.', 'error');
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
    setCurrentUser(initialUserState);
    setIsModalOpen(true);
  };

  const openEditModal = (user) => {
    setModalMode('edit');
    setCurrentUser({
      id: user.id,
      name: user.name,
      username: user.username,
      role: user.role,
      school_id: user.school_id || '',
      status: user.status || 'Active'
    });
    setIsModalOpen(true);
  };

  const openResetModal = (user) => {
    setResetUser(user);
    setPasswords({ new: '', confirm: '' });
    setIsResetModalOpen(true);
  };

  // CRUD Operations
  const handleSaveUser = async (e) => {
    e.preventDefault();
    
    // Payload logic: Set school_id to null if NGO staff 
    const payload = {
      name: currentUser.name,
      username: currentUser.username,
      role: currentUser.role,
      school_id: currentUser.role === 'ngo_staff' ? null : parseInt(currentUser.school_id),
      status: currentUser.status
    };

    if (modalMode === 'add') {
      payload.password = currentUser.password;
    }

    try {
      if (modalMode === 'add') {
        await api.post('/users', payload);
        showToast('User created successfully!');
      } else {
        await api.put(`/users/${currentUser.id}`, payload);
        showToast('User updated successfully!');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to save user.', 'error');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      return showToast('Passwords do not match.', 'error');
    }

    try {
      await api.put(`/users/${resetUser.id}/reset-password`, { password: passwords.new });
      showToast(`Password reset for ${resetUser.username}!`);
      setIsResetModalOpen(false);
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to reset password.', 'error');
    }
  };

  const handleToggleStatus = async (user) => {
    const newStatus = user.status === 'Active' ? 'Inactive' : 'Active';
    try {
      await api.put(`/users/${user.id}`, { ...user, status: newStatus });
      showToast(`${user.name} is now ${newStatus}.`);
      fetchData();
    } catch (error) {
      showToast('Failed to change status.', 'error');
    }
  };

  // Filtering Logic
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      user.username?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'All' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Helpers
  const getSchoolName = (schoolId) => {
    if (!schoolId) return 'NGO / System Level';
    const school = schools.find(s => s.id === schoolId);
    return school ? school.name : 'Unknown School';
  };

  const formatRole = (role) => {
    switch (role) {
      case 'ngo_super_admin': return { label: 'Super Admin', color: 'bg-indigo-100 text-indigo-700 border-indigo-200' };
      case 'ngo_staff': return { label: 'NGO Staff', color: 'bg-purple-100 text-purple-700 border-purple-200' };
      case 'school_super_admin': return { label: 'School Super Admin', color: 'bg-blue-100 text-blue-800 border-blue-300' }; // Added this line
      case 'school_admin': return { label: 'School Admin', color: 'bg-blue-50 text-blue-600 border-blue-200' };
      case 'teacher': return { label: 'Teacher', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
      default: return { label: role, color: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto min-h-screen bg-[#fafafa] text-slate-800 font-sans">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-1 rounded-full bg-violet-100 text-violet-700 text-xs font-bold tracking-wider uppercase flex items-center gap-1.5">
              <UsersIcon size={14} /> Access Control
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">
            User Management
          </h1>
          <p className="text-slate-500 mt-1 font-medium">Manage FFF staff and School Admins. Teachers are managed by schools.</p>
        </div>
        <button 
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-semibold shadow-sm shadow-violet-200 transition-all duration-200"
        >
          <Plus size={18} />
          Add User
        </button>
      </div>

      {/* MAIN CONTENT CARD */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
        
        {/* Table Toolbar (Filters) */}
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-50/50">
          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" placeholder="Search name or username..." 
                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 w-full bg-white transition-shadow"
              />
            </div>
            <div className="relative w-full md:w-56">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <select 
                value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}
                className="pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 w-full bg-white appearance-none font-medium text-slate-600"
              >
                <option value="All">All Roles</option>
                <option value="school_super_admin">school_super_admin</option>
                <option value="ngo_staff">FFF Staff</option>
                <option value="teacher">Teachers</option>
              </select>
            </div>
          </div>
          <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-500 tracking-wider">
            Total Users: {filteredUsers.length}
          </div>
        </div>

        {/* DATA TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">User / Username</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Assigned School</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                [...Array(5)].map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-32 mb-2"></div><div className="h-3 bg-slate-100 rounded w-24"></div></td>
                    <td className="px-6 py-4"><div className="h-6 bg-slate-200 rounded-full w-24"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-48"></div></td>
                    <td className="px-6 py-4"><div className="h-6 bg-slate-200 rounded-full w-20"></div></td>
                    <td className="px-6 py-4 flex justify-end gap-2"><div className="h-8 w-8 bg-slate-200 rounded-lg"></div><div className="h-8 w-8 bg-slate-200 rounded-lg"></div></td>
                  </tr>
                ))
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <Shield size={48} className="mb-4 opacity-20" />
                      <p className="text-lg font-semibold text-slate-600">No users found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const roleBadge = formatRole(user.role);
                  return (
                    <tr key={user.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-800">{user.name}</div>
                        {/* Display username without the @ symbol */}
                        <div className="text-xs font-medium text-slate-400 mt-1">{user.username}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${roleBadge.color}`}>
                          {roleBadge.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-700 flex items-center gap-2">
                          {user.role === 'teacher' ? <GraduationCap size={16} className="text-slate-400"/> : <Shield size={16} className="text-slate-400"/>}
                          {getSchoolName(user.school_id)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${
                          user.status === 'Active' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-slate-100 border-slate-200 text-slate-500'
                        }`}>
                          {user.status || 'Active'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleToggleStatus(user)}
                          className={`p-2 rounded-lg transition-colors ${user.status === 'Active' ? 'text-amber-500 hover:bg-amber-50' : 'text-emerald-500 hover:bg-emerald-50'}`}
                          title={user.status === 'Active' ? 'Deactivate User' : 'Activate User'}
                        >
                          {user.status === 'Active' ? <UserX size={18} /> : <UserCheck size={18} />}
                        </button>
                        <button onClick={() => openResetModal(user)} className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" title="Reset Password">
                          <Key size={18} />
                        </button>
                        <button onClick={() => openEditModal(user)} className="p-2 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors" title="Edit User">
                          <Edit2 size={18} />
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- ADD/EDIT MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xl font-bold text-slate-800">
                {modalMode === 'add' ? 'Add User' : 'Edit User Details'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSaveUser} className="p-6 max-h-[80vh] overflow-y-auto">
              <div className="space-y-4">
                
                {modalMode === 'edit' && currentUser.role === 'teacher' && (
                  <div className="bg-amber-50 text-amber-800 border border-amber-200 p-3 rounded-xl text-sm font-medium flex gap-2">
                    <AlertTriangle size={18} className="shrink-0" />
                    Teachers are managed by School Admins. Only status and password reset are allowed.
                  </div>
                )}

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Full Name *</label>
                  <input 
                    type="text" required
                    disabled={modalMode === 'edit' && currentUser.role === 'teacher'}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 font-medium text-slate-800 disabled:bg-slate-50 disabled:text-slate-400"
                    value={currentUser.name} onChange={(e) => setCurrentUser({...currentUser, name: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Username *</label>
                  <input 
                    type="text" required
                    disabled={modalMode === 'edit'} // Username shouldn't generally be changed after creation
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 font-medium text-slate-800 disabled:bg-slate-50 disabled:text-slate-400"
                    value={currentUser.username} onChange={(e) => setCurrentUser({...currentUser, username: e.target.value})}
                  />
                </div>

                {modalMode === 'add' && (
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Initial Password *</label>
                    <input 
                      type="password" required
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 font-medium text-slate-800"
                      value={currentUser.password} onChange={(e) => setCurrentUser({...currentUser, password: e.target.value})}
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Role *</label>
                  <select 
                    required
                    disabled={modalMode === 'edit' && currentUser.role === 'teacher'}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 font-medium text-slate-800 bg-white disabled:bg-slate-50 disabled:text-slate-400"
                    value={currentUser.role} onChange={(e) => setCurrentUser({...currentUser, role: e.target.value})}
                  >
                    {/* Teachers shouldn't appear in the dropdown to create, but if editing an existing one, show it */}
                    {modalMode === 'edit' && currentUser.role === 'teacher' && (
                      <option value="teacher">Teacher</option>
                    )}
                    <option value="school_admin">School Admin</option>
                    <option value="ngo_staff">FFF Staff</option>
                  </select>
                </div>

                {currentUser.role === 'school_admin' && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Assigned School *</label>
                    <select 
                      required
                      disabled={modalMode === 'edit' && currentUser.role === 'teacher'}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 font-medium text-slate-800 bg-white disabled:bg-slate-50 disabled:text-slate-400"
                      value={currentUser.school_id} onChange={(e) => setCurrentUser({...currentUser, school_id: e.target.value})}
                    >
                      <option value="" disabled>Select a school</option>
                      {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Account Status</label>
                  <div className="flex gap-4 mt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="status" value="Active" checked={currentUser.status === 'Active'} onChange={(e) => setCurrentUser({...currentUser, status: e.target.value})} className="w-4 h-4 text-violet-600"/>
                      <span className="text-sm font-bold text-emerald-700">Active</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="status" value="Inactive" checked={currentUser.status === 'Inactive'} onChange={(e) => setCurrentUser({...currentUser, status: e.target.value})} className="w-4 h-4 text-violet-600"/>
                      <span className="text-sm font-bold text-slate-500">Inactive</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 justify-end mt-8 pt-6 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition-colors">Cancel</button>
                <button type="submit" className="px-6 py-2.5 rounded-xl font-bold bg-violet-600 hover:bg-violet-700 text-white shadow-sm shadow-violet-200 transition-colors">
                  {modalMode === 'add' ? 'Create User' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- RESET PASSWORD MODAL --- */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-slate-50 p-6 border-b border-slate-100 text-center">
              <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <Key size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-800">Reset Password</h3>
              <p className="text-slate-500 text-sm mt-1">For user <strong className="text-slate-700">{resetUser?.username}</strong></p>
            </div>
            
            <form onSubmit={handleResetPassword} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">New Password</label>
                  <input 
                    type="password" required
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 font-medium text-slate-800"
                    value={passwords.new} onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Confirm New Password</label>
                  <input 
                    type="password" required
                    className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 font-medium text-slate-800 ${
                      passwords.confirm && passwords.new !== passwords.confirm ? 'border-rose-300 focus:ring-rose-500 bg-rose-50' : 'border-slate-200 focus:ring-amber-500'
                    }`}
                    value={passwords.confirm} onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button type="button" onClick={() => setIsResetModalOpen(false)} className="flex-1 px-4 py-2.5 rounded-xl font-semibold text-slate-600 hover:bg-slate-100">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2.5 rounded-xl font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-sm shadow-amber-200">Reset</button>
              </div>
            </form>
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

export default Users;
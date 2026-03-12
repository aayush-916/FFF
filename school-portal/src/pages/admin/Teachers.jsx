import { useState, useEffect } from 'react';
import { 
  Users, UserPlus, ShieldAlert, Key, Loader2, AlertCircle, 
  CheckCircle, Shield, GraduationCap, X, Edit, ArrowDownCircle 
} from 'lucide-react';
import api from '../../services/api';

const Teachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [schoolClasses, setSchoolClasses] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedTeacherId, setSelectedTeacherId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Shared Form State
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    assignedClasses: [] 
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [teachersRes, classesRes] = await Promise.all([
        api.get('/teachers'),
        api.get('/school/classes').catch(() => ({ data: [] }))
      ]);

      setTeachers(teachersRes.data.data || teachersRes.data || []);
      setSchoolClasses(classesRes.data.data || classesRes.data || []);
      
    } catch (err) {
      console.error("Failed to fetch teachers:", err);
      setError("Unable to load teachers. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- Modal Openers ---

  const openCreateModal = () => {
    setIsEditMode(false);
    setSelectedTeacherId(null);
    setFormData({ name: '', username: '', password: '', assignedClasses: [] });
    setIsModalOpen(true);
  };

  const openEditModal = (teacher) => {
    setIsEditMode(true);
    setSelectedTeacherId(teacher.id);
    
    const existingClasses = (teacher.classes || []).map(c => 
      `${c.class_number || c.classNumber}|${c.section}`
    );
    
    setFormData({
      name: teacher.name,
      username: teacher.username,
      password: '', 
      assignedClasses: existingClasses
    });
    
    setIsModalOpen(true);
  };

  // --- Handlers ---

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const formattedClasses = formData.assignedClasses.map(cls => {
        const [class_number, section] = cls.split('|');
        return { class_number: parseInt(class_number), section };
      });

      if (isEditMode) {
        await api.put(`/teachers/${selectedTeacherId}/classes`, { classes: formattedClasses });
        setSuccessMsg("Teacher classes updated successfully!");
      } else {
        await api.post('/teachers', {
          name: formData.name,
          username: formData.username,
          password: formData.password,
          classes: formattedClasses
        });
        setSuccessMsg("Teacher created successfully!");
      }

      setIsModalOpen(false);
      fetchData(); 
      setTimeout(() => setSuccessMsg(''), 3000);

    } catch (err) {
      console.error("Action failed:", err);
      setError(err.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} teacher.`);
    } finally {
      setSubmitting(false);
    }
  };

  // NEW: Promote Handler
  const handlePromote = async (id, name) => {
    if (!window.confirm(`Are you sure you want to promote ${name} to School Admin?`)) return;
    try {
      await api.put(`/users/${id}/promote-admin`);
      setSuccessMsg(`${name} was promoted to School Admin!`);
      fetchData();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      alert("Failed to promote teacher. Please try again.");
    }
  };

  // NEW: Demote Handler
  const handleDemote = async (id, name) => {
    if (!window.confirm(`Are you sure you want to demote ${name} back to a regular Teacher? They will lose admin privileges.`)) return;
    try {
      await api.put(`/users/${id}/demote`);
      setSuccessMsg(`${name} was demoted to Teacher.`);
      fetchData();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      alert("Failed to demote admin. Please try again.");
    }
  };

  const handleResetPassword = async (id, name) => {
    const newPassword = window.prompt(`Enter a new password for ${name}:`);
    if (!newPassword) return;
    if (newPassword.length < 6) return alert("Password must be at least 6 characters long.");

    try {
      await api.put(`/teachers/${id}/reset-password`, { password: newPassword });
      setSuccessMsg(`Password for ${name} has been reset.`);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      alert("Failed to reset password. Please try again.");
    }
  };

  const toggleClassSelection = (classValue) => {
    setFormData(prev => {
      const isSelected = prev.assignedClasses.includes(classValue);
      if (isSelected) {
        return { ...prev, assignedClasses: prev.assignedClasses.filter(c => c !== classValue) };
      } else {
        return { ...prev, assignedClasses: [...prev.assignedClasses, classValue] };
      }
    });
  };

  if (loading && teachers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="text-gray-500">Loading teachers...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-10">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" />
            Manage Teachers
          </h1>
          <p className="text-sm text-gray-500 mt-1">View, add, and manage staff access.</p>
        </div>
        <button 
          onClick={openCreateModal}
          className="bg-blue-600 text-white font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors shrink-0"
        >
          <UserPlus className="w-5 h-5" />
          Add Teacher
        </button>
      </div>

      {/* Alerts */}
      {error && !isModalOpen && (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm flex items-start gap-2 border border-red-100">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-green-50 text-green-700 rounded-xl text-sm flex items-center gap-2 border border-green-100">
          <CheckCircle className="w-5 h-5 shrink-0" />
          <p className="font-medium">{successMsg}</p>
        </div>
      )}

      {/* Teacher List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        
        <div className="hidden md:grid grid-cols-12 gap-4 p-4 bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
          <div className="col-span-3">Teacher</div>
          <div className="col-span-3">Username</div>
          <div className="col-span-3">Assigned Classes</div>
          <div className="col-span-3 text-right">Actions</div>
        </div>

        <div className="divide-y divide-gray-100">
          {teachers.length > 0 ? teachers.map((teacher) => (
            <div key={teacher.id} className="p-4 md:grid md:grid-cols-12 md:gap-4 md:items-center flex flex-col gap-3">
              
              {/* Name & Role */}
              <div className="md:col-span-3 flex items-start gap-3">
                <div className={`p-2 rounded-lg shrink-0 mt-1 md:mt-0 ${teacher.role === 'school_admin' ? 'bg-purple-100 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>
                  {teacher.role === 'school_admin' ? <Shield className="w-5 h-5" /> : <GraduationCap className="w-5 h-5" />}
                </div>
                <div>
                  <p className="font-bold text-gray-900">{teacher.name}</p>
                  <span className="text-xs font-bold text-gray-500 capitalize">{teacher.role.replace(/_/g, ' ')}</span>
                </div>
              </div>

              {/* Username */}
              <div className="md:col-span-3">
                <span className="md:hidden text-xs font-bold text-gray-400 uppercase mr-2">Username:</span>
                <span className="text-sm text-gray-700 font-medium">{teacher.username}</span>
              </div>

              {/* Assigned Classes */}
              <div className="md:col-span-3">
                <span className="md:hidden text-xs font-bold text-gray-400 uppercase mr-2 block mb-1">Classes:</span>
                <div className="flex flex-wrap gap-1.5">
                  {teacher.classes && teacher.classes.length > 0 ? (
                    teacher.classes.map((cls, idx) => (
                      <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-md border border-gray-200">
                        {cls.class_number || cls.classNumber}-{cls.section}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-gray-400 italic">None assigned</span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="md:col-span-3 flex flex-wrap items-center md:justify-end gap-2 mt-2 md:mt-0 pt-3 md:pt-0 border-t border-gray-50 md:border-0">
                
                <button 
                  onClick={() => openEditModal(teacher)}
                  className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-lg border border-blue-100 transition-colors"
                  title="Edit Assigned Classes"
                >
                  <Edit className="w-4 h-4" /> Edit Classes
                </button>

                <button 
                  onClick={() => handleResetPassword(teacher.id, teacher.name)}
                  className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-bold rounded-lg border border-gray-200 transition-colors"
                  title="Reset Password"
                >
                  <Key className="w-4 h-4" /> Reset Pwd
                </button>
                
                {/* Dynamic Role Buttons */}
                {teacher.role === 'teacher' && (
                  <button 
                    onClick={() => handlePromote(teacher.id, teacher.name)}
                    className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold rounded-lg border border-purple-100 transition-colors"
                    title="Promote to Admin"
                  >
                    <ShieldAlert className="w-4 h-4" /> Promote
                  </button>
                )}

                {teacher.role === 'school_admin' && (
                  <button 
                    onClick={() => handleDemote(teacher.id, teacher.name)}
                    className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3 py-2 bg-orange-50 hover:bg-orange-100 text-orange-700 text-xs font-bold rounded-lg border border-orange-100 transition-colors"
                    title="Demote to Teacher"
                  >
                    <ArrowDownCircle className="w-4 h-4" /> Demote
                  </button>
                )}
                {/* Notice: No button renders if they are school_super_admin, keeping them safe! */}

              </div>

            </div>
          )) : (
            <div className="p-8 text-center text-gray-500">No teachers found.</div>
          )}
        </div>
      </div>

      {/* --- CREATE / EDIT TEACHER MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                {isEditMode ? <Edit className="w-5 h-5 text-blue-600" /> : <UserPlus className="w-5 h-5 text-blue-600" />}
                {isEditMode ? `Edit Classes: ${formData.name}` : 'Create Teacher'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto">
              {error && isModalOpen && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm flex items-start gap-2 border border-red-100">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p>{error}</p>
                </div>
              )}

              <form id="teacher-form" onSubmit={handleSubmit} className="space-y-4">
                
                {!isEditMode && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Full Name</label>
                      <input type="text" required placeholder="e.g. Rahul Sharma" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 p-3" />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Username / Email</label>
                      <input type="text" required placeholder="rahul@school.com" value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 p-3" />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Temporary Password</label>
                      <input type="password" required placeholder="Min. 6 characters" minLength="6" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 p-3" />
                    </div>
                  </>
                )}

                {schoolClasses.length > 0 && (
                  <div className="pt-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                      Assign Classes
                    </label>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 max-h-48 overflow-y-auto grid grid-cols-2 gap-2">
                      {schoolClasses.map((cls, idx) => {
                        const classValue = `${cls.class_number}|${cls.section}`;
                        return (
                          <label key={idx} className="flex items-center gap-2 p-2 bg-white rounded border border-gray-100 cursor-pointer hover:bg-blue-50 transition-colors">
                            <input 
                              type="checkbox" 
                              checked={formData.assignedClasses.includes(classValue)}
                              onChange={() => toggleClassSelection(classValue)}
                              className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" 
                            />
                            <span className="text-sm font-bold text-gray-700">{cls.class_number}-{cls.section}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}
              </form>
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50 flex gap-3">
              <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-3 bg-white text-gray-700 font-bold rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button type="submit" form="teacher-form" disabled={submitting} className="flex-1 flex justify-center items-center gap-2 bg-blue-600 text-white font-bold rounded-xl px-4 py-3 hover:bg-blue-700 disabled:opacity-50 transition-colors">
                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (isEditMode ? "Save Classes" : "Save Teacher")}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Teachers;
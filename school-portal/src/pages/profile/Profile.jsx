import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  LogOut, 
  Shield, 
  Mail, 
  BookOpen, 
  Loader2,
  AlertCircle
} from 'lucide-react';
import api from '../../services/api';

const Profile = () => {
  const navigate = useNavigate();
  
  // State
  const [userData, setUserData] = useState(null);
  const [assignedClasses, setAssignedClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        
       // 1. Fetch User Info
        const userRes = await api.get('/auth/me');
        // Update this line to safely check for .data OR .user
        const user = userRes.data.data || userRes.data.user || userRes.data;
        
        setUserData(user);

        // 2. If user is a teacher or school_admin, fetch their assigned classes
        if (user.role !== 'school_super_admin') {
          try {
            const classesRes = await api.get('/teacher/classes');
            setAssignedClasses(classesRes.data.data || classesRes.data || []);
          } catch (classErr) {
            console.error("Failed to fetch assigned classes:", classErr);
            // Don't break the whole page if just classes fail
          }
        }

      } catch (err) {
        console.error("Profile load error:", err);
        setError("Failed to load profile information.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      // Optional: Tell the backend to invalidate the session if your API supports it
      await api.post('/auth/logout').catch(() => {}); 
    } finally {
      // Always clear the local token and redirect, even if backend fails
      localStorage.removeItem('token');
      navigate('/login');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="text-gray-500">Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto space-y-6 pb-10">
      
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <Shield className="w-6 h-6 text-blue-600" />
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm flex items-start gap-2 border border-red-100">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Profile Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        
        {/* Avatar Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-8 flex flex-col items-center">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center border-4 border-white/30 mb-3">
            <User className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-xl font-bold text-white uppercase tracking-tight">
            {userData?.name}
          </h2>
          <span className="text-blue-100 text-sm font-medium px-3 py-1 rounded-full mt-2 capitalize">
            {userData?.school_name?.replace(/_/g, ' ')}
          </span>
          <span className="text-blue-100 text-sm font-medium bg-white/10 px-3 py-1 rounded-full mt-2 capitalize">
            {userData?.role?.replace(/_/g, ' ')}
          </span>

          
          
        </div>

        {/* Details List */}
        <div className="p-6 space-y-5">
          {/* Username / Email */}
          <div className="flex items-center gap-4">
            <div className="bg-gray-50 p-2.5 rounded-lg shrink-0">
              <Mail className="w-5 h-5 text-gray-500" />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-xs text-gray-400 font-bold uppercase">Username / Email</p>
              <p className="text-gray-900 font-medium truncate">{userData?.username}</p>
            </div>
          </div>

          {/* Assigned Classes (Hidden for super admins) */}
          {userData?.role !== 'school_super_admin' && (
            <div className="flex items-start gap-4 border-t border-gray-50 pt-5">
              <div className="bg-gray-50 p-2.5 rounded-lg shrink-0">
                <BookOpen className="w-5 h-5 text-gray-500" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-400 font-bold uppercase mb-2">Assigned Classes</p>
                
                {assignedClasses.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {assignedClasses.map((cls, idx) => (
                      <span 
                        key={idx} 
                        className="px-3 py-1.5 bg-blue-50 text-blue-700 font-bold rounded-lg text-sm border border-blue-100 tracking-wide"
                      >
                        [ {cls.class_number}-{cls.section} ]
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">No classes assigned yet.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Logout Action */}
      <div className="pt-4">
        <button 
          onClick={handleLogout}
          disabled={loggingOut}
          className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors border border-red-100"
        >
          {loggingOut ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogOut className="w-5 h-5" />}
          Logout
        </button>
      </div>

    </div>
  );
};

export default Profile;
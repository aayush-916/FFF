// import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { 
//   User, 
//   LogOut, 
//   Shield, 
//   Mail, 
//   BookOpen, 
//   Loader2,
//   AlertCircle
// } from 'lucide-react';
// import api from '../../services/api';

// const Profile = () => {
//   const navigate = useNavigate();
  
//   // State
//   const [userData, setUserData] = useState(null);
//   const [assignedClasses, setAssignedClasses] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [loggingOut, setLoggingOut] = useState(false);

//   useEffect(() => {
//     const fetchProfileData = async () => {
//       try {
//         setLoading(true);
        
//        // 1. Fetch User Info
//         const userRes = await api.get('/auth/me');
//         // Update this line to safely check for .data OR .user
//         const user = userRes.data.data || userRes.data.user || userRes.data;
        
//         setUserData(user);

//         // 2. If user is a teacher or school_admin, fetch their assigned classes
//         if (user.role !== 'school_super_admin') {
//           try {
//             const classesRes = await api.get('/teacher/classes');
//             setAssignedClasses(classesRes.data.data || classesRes.data || []);
//           } catch (classErr) {
//             console.error("Failed to fetch assigned classes:", classErr);
//             // Don't break the whole page if just classes fail
//           }
//         }

//       } catch (err) {
//         console.error("Profile load error:", err);
//         setError("Failed to load profile information.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchProfileData();
//   }, []);

//   const handleLogout = async () => {
//     setLoggingOut(true);
//     try {
//       // Optional: Tell the backend to invalidate the session if your API supports it
//       await api.post('/auth/logout').catch(() => {}); 
//     } finally {
//       // Always clear the local token and redirect, even if backend fails
//       localStorage.removeItem('token');
//       navigate('/login');
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex flex-col items-center justify-center h-64 space-y-4">
//         <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
//         <p className="text-gray-500">Loading your profile...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-md mx-auto space-y-6 pb-10">
      
//       {/* Header */}
//       <div className="flex items-center justify-between px-1">
//         <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
//         <Shield className="w-6 h-6 text-blue-600" />
//       </div>

//       {error && (
//         <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm flex items-start gap-2 border border-red-100">
//           <AlertCircle className="w-5 h-5 shrink-0" />
//           <p>{error}</p>
//         </div>
//       )}

//       {/* Profile Card */}
//       <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        
//         {/* Avatar Header */}
//         <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-8 flex flex-col items-center">
//           <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center border-4 border-white/30 mb-3">
//             <User className="w-10 h-10 text-white" />
//           </div>
//           <h2 className="text-xl font-bold text-white uppercase tracking-tight">
//             {userData?.name}
//           </h2>
//           <span className="text-blue-100 text-sm font-medium px-3 py-1 rounded-full mt-2 capitalize">
//             {userData?.school_name?.replace(/_/g, ' ')}
//           </span>
//           <span className="text-blue-100 text-sm font-medium bg-white/10 px-3 py-1 rounded-full mt-2 capitalize">
//             {userData?.role?.replace(/_/g, ' ')}
//           </span>

          
          
//         </div>

//         {/* Details List */}
//         <div className="p-6 space-y-5">
//           {/* Username / Email */}
//           <div className="flex items-center gap-4">
//             <div className="bg-gray-50 p-2.5 rounded-lg shrink-0">
//               <Mail className="w-5 h-5 text-gray-500" />
//             </div>
//             <div className="flex-1 overflow-hidden">
//               <p className="text-xs text-gray-400 font-bold uppercase">Username / Email</p>
//               <p className="text-gray-900 font-medium truncate">{userData?.username}</p>
//             </div>
//           </div>

//           {/* Assigned Classes (Hidden for super admins) */}
//           {userData?.role !== 'school_super_admin' && (
//             <div className="flex items-start gap-4 border-t border-gray-50 pt-5">
//               <div className="bg-gray-50 p-2.5 rounded-lg shrink-0">
//                 <BookOpen className="w-5 h-5 text-gray-500" />
//               </div>
//               <div className="flex-1">
//                 <p className="text-xs text-gray-400 font-bold uppercase mb-2">Assigned Classes</p>
                
//                 {assignedClasses.length > 0 ? (
//                   <div className="flex flex-wrap gap-2">
//                     {assignedClasses.map((cls, idx) => (
//                       <span 
//                         key={idx} 
//                         className="px-3 py-1.5 bg-blue-50 text-blue-700 font-bold rounded-lg text-sm border border-blue-100 tracking-wide"
//                       >
//                         [ {cls.class_number}-{cls.section} ]
//                       </span>
//                     ))}
//                   </div>
//                 ) : (
//                   <p className="text-sm text-gray-500 italic">No classes assigned yet.</p>
//                 )}
//               </div>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Logout Action */}
//       <div className="pt-4">
//         <button 
//           onClick={handleLogout}
//           disabled={loggingOut}
//           className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors border border-red-100"
//         >
//           {loggingOut ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogOut className="w-5 h-5" />}
//           Logout
//         </button>
//       </div>

//     </div>
//   );
// };

// export default Profile;







import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, LogOut, Shield, Mail, BookOpen, Loader2, AlertCircle
} from 'lucide-react';
import api from '../../services/api';

const Profile = () => {
  const navigate = useNavigate();

  const [userData, setUserData] = useState(null);
  const [assignedClasses, setAssignedClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        const userRes = await api.get('/auth/me');
        const user = userRes.data.data || userRes.data.user || userRes.data;
        setUserData(user);

        if (user.role !== 'school_super_admin') {
          try {
            const classesRes = await api.get('/teacher/classes');
            setAssignedClasses(classesRes.data.data || classesRes.data || []);
          } catch (classErr) {
            console.error('Failed to fetch assigned classes:', classErr);
          }
        }
      } catch (err) {
        console.error('Profile load error:', err);
        setError('Failed to load profile information.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await api.post('/auth/logout').catch(() => {});
    } finally {
      localStorage.removeItem('token');
      navigate('/login');
    }
  };

  if (loading) {
    return (
      <>
        <style>{baseStyles}</style>
        <div className="pf-root">
          {/* Header skeleton */}
          <div className="pf-sk-header">
            <div>
              <div className="pf-sk pf-sk-greeting" />
              <div className="pf-sk pf-sk-title" />
            </div>
            <div className="pf-sk pf-sk-shield" />
          </div>
          {/* Avatar card skeleton */}
          <div className="pf-sk-avatar-card">
            <div className="pf-sk-band">
              <div className="pf-sk pf-sk-circle" />
            </div>
            <div className="pf-sk-avatar-info">
              <div className="pf-sk pf-sk-name" />
              <div className="pf-sk-tags">
                <div className="pf-sk pf-sk-tag" />
                <div className="pf-sk pf-sk-tag pf-sk-tag--short" />
              </div>
            </div>
          </div>
          {/* Details card skeleton */}
          <div className="pf-sk-card">
            <div className="pf-sk-row">
              <div className="pf-sk pf-sk-icon" />
              <div style={{ flex: 1 }}>
                <div className="pf-sk pf-sk-label" />
                <div className="pf-sk pf-sk-value" />
              </div>
            </div>
            <div className="pf-sk-row pf-sk-row--border">
              <div className="pf-sk pf-sk-icon" />
              <div style={{ flex: 1 }}>
                <div className="pf-sk pf-sk-label" />
                <div className="pf-sk-chips">
                  <div className="pf-sk pf-sk-chip" />
                  <div className="pf-sk pf-sk-chip" />
                  <div className="pf-sk pf-sk-chip pf-sk-chip--wide" />
                </div>
              </div>
            </div>
          </div>
          {/* Logout button skeleton */}
          <div className="pf-sk pf-sk-btn" />
        </div>
      </>
    );
  }

  const initials = userData?.name
    ? userData.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  return (
    <>
      <style>{baseStyles}</style>
      <div className="pf-root">

        {/* ── Header ── */}
        <div className="pf-header pf-anim" style={{ animationDelay: '0ms' }}>
          <div>
            <p className="pf-greeting">Account</p>
            <h1 className="pf-title">My Profile</h1>
          </div>
          <div className="pf-shield">
            <Shield size={17} />
          </div>
        </div>

        {/* ── Error ── */}
        {error && (
          <div className="pf-error pf-anim" style={{ animationDelay: '60ms' }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* ── Avatar card ── */}
        <div className="pf-avatar-card pf-anim" style={{ animationDelay: '80ms' }}>
          {/* Top warm band */}
          <div className="pf-avatar-band">
            <div className="pf-avatar-band-glow" />
            <div className="pf-avatar-circle">
              {initials}
            </div>
          </div>

          {/* Name + tags */}
          <div className="pf-avatar-info">
            <h2 className="pf-avatar-name">{userData?.name}</h2>
            <div className="pf-avatar-tags">
              {userData?.school_name && (
                <span className="pf-tag pf-tag--school">
                  {userData.school_name.replace(/_/g, ' ')}
                </span>
              )}
              {userData?.role && (
                <span className="pf-tag pf-tag--role">
                  {userData.role.replace(/_/g, ' ')}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ── Details card ── */}
        <div className="pf-card pf-anim" style={{ animationDelay: '160ms' }}>

          {/* Username */}
          <div className="pf-row">
            <div className="pf-row-icon">
              <Mail size={16} />
            </div>
            <div className="pf-row-content">
              <p className="pf-row-label">Username / Email</p>
              <p className="pf-row-value">{userData?.username}</p>
            </div>
          </div>

          {/* Assigned Classes */}
          {userData?.role !== 'school_super_admin' && (
            <div className="pf-row pf-row--top-border">
              <div className="pf-row-icon">
                <BookOpen size={16} />
              </div>
              <div className="pf-row-content">
                <p className="pf-row-label">Assigned Classes</p>
                {assignedClasses.length > 0 ? (
                  <div className="pf-classes">
                    {assignedClasses.map((cls, idx) => (
                      <span key={idx} className="pf-class-chip">
                        {cls.class_number}–{cls.section}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="pf-empty">No classes assigned yet.</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Logout ── */}
        <div className="pf-anim" style={{ animationDelay: '240ms' }}>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="pf-logout-btn"
          >
            {loggingOut
              ? <Loader2 size={18} className="pf-spin" />
              : <LogOut size={18} />
            }
            {loggingOut ? 'Signing out…' : 'Sign Out'}
          </button>
        </div>

      </div>
    </>
  );
};

/* ─────────────────────────────────────────────
   STYLES
───────────────────────────────────────────── */
const baseStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500;600&display=swap');

  .pf-root {
    max-width: 480px;
    margin: 0 auto;
    padding-bottom: 40px;
    display: flex;
    flex-direction: column;
    gap: 20px;
    font-family: 'DM Sans', sans-serif;
  }

  /* Fade-up */
  .pf-anim { animation: pfFadeUp 0.5s ease both; }
  @keyframes pfFadeUp {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* ── Loading ── */
  .pf-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 220px;
    gap: 14px;
    font-family: 'DM Sans', sans-serif;
  }
  .pf-loading-icon {
    width: 28px; height: 28px;
    color: #f59e0b;
    animation: spin 1s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  .pf-loading-text {
    font-size: 14px;
    color: #9ca3af;
  }

  /* ── Header ── */
  .pf-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
  }
  .pf-greeting {
    font-size: 12px;
    color: #9ca3af;
    font-weight: 400;
    margin-bottom: 3px;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }
  .pf-title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(22px, 5vw, 30px);
    font-weight: 700;
    color: #111827;
    line-height: 1.2;
  }
  .pf-shield {
    width: 36px; height: 36px;
    border-radius: 10px;
    background: #fff7ed;
    border: 1.5px solid #fcd9a0;
    display: flex; align-items: center; justify-content: center;
    color: #f59e0b;
    margin-top: 4px;
    flex-shrink: 0;
  }

  /* ── Error ── */
  .pf-error {
    display: flex;
    align-items: center;
    gap: 10px;
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 12px;
    padding: 12px 14px;
    font-size: 13px;
    color: #dc2626;
  }

  /* ── Avatar card ── */
  .pf-avatar-card {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 1px 4px rgba(0,0,0,0.05);
  }
  .pf-avatar-band {
    background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
    padding: 36px 20px 28px;
    display: flex;
    justify-content: center;
    position: relative;
    overflow: hidden;
  }
  .pf-avatar-band-glow {
    position: absolute;
    top: -40px; right: -40px;
    width: 180px; height: 180px;
    background: radial-gradient(circle, rgba(251,191,36,0.35) 0%, transparent 70%);
    pointer-events: none;
  }
  .pf-avatar-circle {
    width: 80px; height: 80px;
    border-radius: 50%;
    background: #ffffff;
    border: 3px solid rgba(245,158,11,0.3);
    box-shadow: 0 4px 20px rgba(245,158,11,0.2);
    display: flex; align-items: center; justify-content: center;
    font-family: 'Playfair Display', serif;
    font-size: 28px;
    font-weight: 700;
    color: #f59e0b;
    position: relative;
    z-index: 1;
  }
  .pf-avatar-info {
    padding: 18px 20px 20px;
    text-align: center;
    border-top: 1px solid #f3f4f6;
  }
  .pf-avatar-name {
    font-family: 'Playfair Display', serif;
    font-size: 20px;
    font-weight: 700;
    color: #111827;
    margin-bottom: 10px;
  }
  .pf-avatar-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    justify-content: center;
  }
  .pf-tag {
    display: inline-block;
    border-radius: 100px;
    padding: 4px 12px;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: capitalize;
  }
  .pf-tag--school {
    background: #f3f4f6;
    color: #374151;
    border: 1px solid #e5e7eb;
  }
  .pf-tag--role {
    background: #fff7ed;
    color: #b45309;
    border: 1px solid #fef3c7;
  }

  /* ── Details card ── */
  .pf-card {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 18px;
    padding: 6px 0;
    box-shadow: 0 1px 4px rgba(0,0,0,0.05);
  }
  .pf-row {
    display: flex;
    align-items: flex-start;
    gap: 14px;
    padding: 16px 20px;
  }
  .pf-row--top-border {
    border-top: 1px solid #f3f4f6;
  }
  .pf-row-icon {
    width: 36px; height: 36px;
    border-radius: 10px;
    background: #f9fafb;
    border: 1px solid #f3f4f6;
    display: flex; align-items: center; justify-content: center;
    color: #9ca3af;
    flex-shrink: 0;
    margin-top: 2px;
  }
  .pf-row-content { flex: 1; min-width: 0; }
  .pf-row-label {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.09em;
    text-transform: uppercase;
    color: #9ca3af;
    margin-bottom: 4px;
  }
  .pf-row-value {
    font-size: 14px;
    font-weight: 500;
    color: #111827;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* ── Classes ── */
  .pf-classes {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 2px;
  }
  .pf-class-chip {
    display: inline-block;
    background: #fff7ed;
    border: 1px solid #fef3c7;
    border-radius: 8px;
    padding: 5px 12px;
    font-size: 12px;
    font-weight: 700;
    color: #b45309;
    letter-spacing: 0.04em;
  }
  .pf-empty {
    font-size: 13px;
    color: #9ca3af;
    font-style: italic;
  }

  /* ── Logout ── */
  .pf-logout-btn {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 14px;
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 14px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    font-weight: 600;
    color: #dc2626;
    cursor: pointer;
    transition: background 0.18s, border-color 0.18s, transform 0.15s;
  }
  .pf-logout-btn:hover:not(:disabled) {
    background: #fee2e2;
    border-color: #fca5a5;
    transform: translateY(-1px);
  }
  .pf-logout-btn:disabled { opacity: 0.6; cursor: not-allowed; }
  .pf-spin { animation: spin 1s linear infinite; }
`;

export default Profile;
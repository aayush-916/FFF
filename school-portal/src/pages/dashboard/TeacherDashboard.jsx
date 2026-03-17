// import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { Activity, BookOpen, CheckCircle, Clock, TrendingUp, ChevronRight, Calendar } from 'lucide-react';
// import api from '../../services/api';

// const TeacherDashboard = () => {
//   const navigate = useNavigate();
//   const [loading, setLoading] = useState(true);
//   const [data, setData] = useState(null);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchDashboardData = async () => {
//       try {
//         const response = await api.get('/dashboard/teacher');
//         // console.log("Dashboard response:", response.data);
        
//         // Directly target the inner "data" object where your stats live
//         const dashboardData = response.data.data || response.data;
//         setData(dashboardData);
        
//       } catch (err) {
//         console.error("Dashboard fetch error:", err);
//         setError("Failed to load dashboard data. Please try again.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchDashboardData();
//   }, []);

//   if (loading) {
//     return (
//       <div className="space-y-6 animate-pulse max-w-md mx-auto md:max-w-none">
//         <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
//         <div className="h-4 bg-gray-200 rounded w-3/4 mb-6"></div>
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//           {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>)}
//         </div>
//         <div className="h-40 bg-gray-200 rounded-xl mt-6"></div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="p-4 bg-red-50 text-red-600 rounded-xl text-center">
//         {error}
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6 max-w-md mx-auto md:max-w-none pb-6">
      
//       {/* 1. Dashboard Header */}
//       <div>
//         <h1 className="text-2xl font-bold text-gray-900">Teacher Dashboard</h1>
//         <p className="text-sm text-gray-500 mt-1">Track your teaching progress and start sessions quickly.</p>
//       </div>

//       {/* 2. Summary Cards */}
//       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//         <div className="bg-white p-4 rounded-xl shadow-sm flex flex-col justify-center border border-gray-100">
//           <Activity className="h-6 w-6 text-blue-500 mb-2" />
//           <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Sessions Conducted</p>
//           <p className="text-xl font-black text-gray-900">{data?.totalSessions || 0}</p>
//         </div>
        
//         <div className="bg-white p-4 rounded-xl shadow-sm flex flex-col justify-center border border-gray-100">
//           <CheckCircle className="h-6 w-6 text-green-500 mb-2" />
//           <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Lessons Completed</p>
//           <p className="text-xl font-black text-gray-900">{data?.lessonsCompleted || 0}</p>
//         </div>
        
//         <div className="bg-white p-4 rounded-xl shadow-sm flex flex-col justify-center border border-gray-100">
//           <BookOpen className="h-6 w-6 text-orange-500 mb-2" />
//           <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Remaining Lessons</p>
//           <p className="text-xl font-black text-gray-900">{data?.remainingLessons || 0}</p>
//         </div>
        
//         <div className="bg-white p-4 rounded-xl shadow-sm flex flex-col justify-center border border-gray-100">
//           <Clock className="h-6 w-6 text-purple-500 mb-2" />
//           <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Last Session</p>
//           <p className="text-lg font-black text-gray-900 truncate">
//             {data?.lastSession ? new Date(data.lastSession).toLocaleDateString('en-GB') : 'N/A'}
//           </p>
//         </div>
//       </div>

//       {/* 3. Suggested Next Lesson Card (If exists) */}
//       {data?.suggestedLesson && (
//         <div className="bg-blue-600 rounded-xl p-5 shadow-sm text-white">
//           <div className="flex justify-between items-start mb-3">
//             <div>
//               <span className="inline-block px-2 py-1 bg-blue-500/50 rounded text-xs font-semibold uppercase tracking-wider mb-2">
//                 Suggested Next
//               </span>
//               <p className="text-blue-100 text-sm">{data.suggestedLesson.domain} &bull; {data.suggestedLesson.habit}</p>
//               <h2 className="text-xl font-bold mt-1">{data.suggestedLesson.title}</h2>
//             </div>
//           </div>
//           <p className="text-sm text-blue-100 mb-4 flex items-center gap-1">
//             <Calendar className="w-4 h-4" /> Recommended for {data.suggestedLesson.targetClass}
//           </p>
//           <button 
//             onClick={() => navigate('/sessions/start')}
//             className="w-full bg-white text-blue-600 font-bold py-3 px-4 rounded-xl shadow-sm hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
//           >
//             Start Session <ChevronRight className="w-5 h-5" />
//           </button>
//         </div>
//       )}

//       {/* 4. Progress Section (If exists) */}
//       {data?.domainProgress && data.domainProgress.length > 0 && (
//         <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
//           <div className="flex items-center gap-2 mb-4">
//             <TrendingUp className="w-5 h-5 text-gray-500" />
//             <h3 className="text-lg font-bold text-gray-900">Domain Progress</h3>
//           </div>
//           <div className="space-y-4">
//             {data.domainProgress.map((domain, index) => (
//               <div key={index}>
//                 <div className="flex justify-between text-sm mb-1">
//                   <span className="font-medium text-gray-700">{domain.name}</span>
//                   <span className="text-gray-500">{domain.progress}%</span>
//                 </div>
//                 <div className="w-full bg-gray-100 rounded-full h-2.5">
//                   <div 
//                     className="bg-blue-500 h-2.5 rounded-full transition-all duration-500" 
//                     style={{ width: `${domain.progress}%` }}
//                   ></div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* 5. Recent Sessions List */}
//       <div>
//         <h3 className="text-lg font-bold text-gray-900 mb-3 px-1">Recent Sessions</h3>
//         <div className="space-y-3">
//           {data?.recentSessions && data.recentSessions.length > 0 ? (
//             data.recentSessions.map((session, index) => (
//               <div key={index} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center hover:bg-gray-50 transition-colors">
//                 <div>
//                   <h4 className="font-bold text-gray-900 text-sm">
//                     {session.lesson_title || 'Unknown Lesson'}
//                   </h4>
//                   <p className="text-xs text-gray-500 mt-1 font-medium">
//                     Class {session.class_number} &bull; Sec {session.section}
//                   </p>
//                 </div>
//                 <div className="text-right flex flex-col items-end">
//                   <span className="text-[10px] font-bold tracking-wider text-green-700 bg-green-50 px-2 py-1 rounded-lg uppercase">
//                     Conducted
//                   </span>
//                   <p className="text-[11px] font-bold text-gray-400 mt-2">
//                     {new Date(session.created_at).toLocaleDateString('en-GB')}
//                   </p>
//                 </div>
//               </div>
//             ))
//           ) : (
//             <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
//               <p className="text-sm font-medium text-gray-500">No recent sessions found.</p>
//             </div>
//           )}
//         </div>
//       </div>

//     </div>
//   );
// };

// export default TeacherDashboard;



import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, BookOpen, CheckCircle, Clock, TrendingUp, ChevronRight, Calendar } from 'lucide-react';
import api from '../../services/api';

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await api.get('/dashboard/teacher');
        const dashboardData = response.data.data || response.data;
        setData(dashboardData);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <>
        <style>{skeletonStyles}</style>
        <div className="td-root">
          <div className="td-skeleton-header" />
          <div className="td-skeleton-sub" />
          <div className="td-skeleton-grid">
            {[1,2,3,4].map(i => <div key={i} className="td-skeleton-card" />)}
          </div>
          <div className="td-skeleton-block" />
          <div className="td-skeleton-block td-skeleton-block--short" />
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <style>{baseStyles}</style>
        <div className="td-root">
          <div className="td-error">{error}</div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{baseStyles}</style>
      <div className="td-root">

        {/* Background orbs */}
        <div className="td-orb td-orb-1" />
        <div className="td-orb td-orb-2" />

        {/* ── Header ── */}
        <div className="td-header td-anim" style={{ animationDelay: '0ms' }}>
          <div className="td-header-left">
            {/* <p className="td-greeting">Good morning 👋</p> */}
            <h1 className="td-title">Teacher Dashboard</h1>
            <p className="td-subtitle">Track your progress and start sessions quickly.</p>
          </div>
          <div className="td-header-badge">
            <div className="td-badge-dot" />
            <span>Live</span>
          </div>
        </div>

        {/* ── Stat Cards ── */}
        <div className="td-stat-grid td-anim" style={{ animationDelay: '80ms' }}>
          <div className="td-stat-card td-stat-card--blue">
            <Activity className="td-stat-icon" />
            <p className="td-stat-label">Sessions</p>
            <p className="td-stat-value">{data?.totalSessions || 0}</p>
          </div>
          <div className="td-stat-card td-stat-card--green">
            <CheckCircle className="td-stat-icon" />
            <p className="td-stat-label">Completed</p>
            <p className="td-stat-value">{data?.lessonsCompleted || 0}</p>
          </div>
          <div className="td-stat-card td-stat-card--amber">
            <BookOpen className="td-stat-icon" />
            <p className="td-stat-label">Remaining</p>
            <p className="td-stat-value">{data?.remainingLessons || 0}</p>
          </div>
          <div className="td-stat-card td-stat-card--rose">
            <Clock className="td-stat-icon" />
            <p className="td-stat-label">Last Session</p>
            <p className="td-stat-value td-stat-value--sm">
              {data?.lastSession
                ? new Date(data.lastSession).toLocaleDateString('en-GB')
                : 'N/A'}
            </p>
          </div>
        </div>

        {/* ── Suggested Next Lesson ── */}
        {data?.suggestedLesson && (
          <div className="td-suggest td-anim" style={{ animationDelay: '160ms' }}>
            <div className="td-suggest-glow" />
            <div className="td-suggest-inner">
              <span className="td-suggest-pill">Suggested Next</span>
              <p className="td-suggest-meta">
                {data.suggestedLesson.domain} &bull; {data.suggestedLesson.habit}
              </p>
              <h2 className="td-suggest-title">{data.suggestedLesson.title}</h2>
              <p className="td-suggest-class">
                <Calendar className="td-suggest-cal-icon" />
                Recommended for {data.suggestedLesson.targetClass}
              </p>
            </div>
            <button
              onClick={() => navigate('/sessions/start')}
              className="td-suggest-btn"
            >
              Start Session <ChevronRight className="td-suggest-chevron" />
            </button>
          </div>
        )}

        {/* ── Domain Progress ── */}
        {data?.domainProgress && data.domainProgress.length > 0 && (
          <div className="td-card td-anim" style={{ animationDelay: '240ms' }}>
            <div className="td-card-header">
              <TrendingUp className="td-card-icon" />
              <h3 className="td-card-title">Domain Progress</h3>
            </div>
            <div className="td-progress-list">
              {data.domainProgress.map((domain, index) => (
                <div key={index} className="td-progress-item">
                  <div className="td-progress-meta">
                    <span className="td-progress-name">{domain.name}</span>
                    <span className="td-progress-pct">{domain.progress}%</span>
                  </div>
                  <div className="td-progress-track">
                    <div
                      className="td-progress-fill"
                      style={{ width: `${domain.progress}%`, animationDelay: `${index * 100 + 400}ms` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Recent Sessions ── */}
        <div className="td-anim" style={{ animationDelay: '320ms' }}>
          <h3 className="td-section-title">Recent Sessions</h3>
          <div className="td-sessions-list">
            {data?.recentSessions && data.recentSessions.length > 0 ? (
              data.recentSessions.map((session, index) => (
                <div
                  key={index}
                  className="td-session-row td-anim"
                  style={{ animationDelay: `${index * 60 + 360}ms` }}
                >
                  <div className="td-session-left">
                    <div className="td-session-num">{String(index + 1).padStart(2, '0')}</div>
                    <div style={{ minWidth: 0 }}>
                      <h4 className="td-session-name">
                        {session.lesson_title || 'Unknown Lesson'}
                      </h4>
                      <p className="td-session-meta">
                        Class {session.class_number} &bull; Sec {session.section}
                      </p>
                    </div>
                  </div>
                  <div className="td-session-right">
                    <span className="td-session-badge">Conducted</span>
                    <p className="td-session-date">
                      {new Date(session.created_at).toLocaleDateString('en-GB')}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="td-empty">No recent sessions found.</div>
            )}
          </div>
        </div>

      </div>
    </>
  );
};

/* ─────────────────────────────────────────────
   STYLES  — light / white theme
───────────────────────────────────────────── */
const baseStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500;600&display=swap');

  .td-root {
    min-height: 100vh;
    background-color: #f5f6fa;
    font-family: 'DM Sans', sans-serif;
    color: #1a1a2e;
    padding: 24px 16px 56px;
    position: relative;
    overflow-x: hidden;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  @media (min-width: 768px) {
    .td-root { padding: 36px 32px 64px; gap: 28px; }
  }

  /* Soft background orbs */
  .td-orb {
    position: fixed;
    border-radius: 50%;
    filter: blur(100px);
    pointer-events: none;
    z-index: 0;
  }
  .td-orb-1 {
    width: 480px; height: 480px;
    background: radial-gradient(circle, rgba(201,155,87,0.12) 0%, transparent 70%);
    top: -140px; right: -140px;
  }
  .td-orb-2 {
    width: 360px; height: 360px;
    background: radial-gradient(circle, rgba(99,140,200,0.1) 0%, transparent 70%);
    bottom: 80px; left: -100px;
  }

  .td-header, .td-stat-grid, .td-suggest, .td-card,
  .td-sessions-list, .td-section-title, .td-anim { position: relative; z-index: 1; }

  /* Fade-up animation */
  .td-anim { animation: tdFadeUp 0.55s ease both; }
  @keyframes tdFadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* ── Header ── */
  .td-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
  }
  .td-greeting {
    font-size: 13px;
    color: #9ca3af;
    margin-bottom: 4px;
    font-weight: 400;
  }
  .td-title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(22px, 5vw, 32px);
    font-weight: 700;
    color: #111827;
    line-height: 1.2;
  }
  .td-subtitle {
    font-size: 13px;
    color: #9ca3af;
    margin-top: 5px;
    font-weight: 400;
  }
  .td-header-badge {
    display: flex;
    align-items: center;
    gap: 7px;
    background: #fff7ed;
    border: 1px solid #fcd9a0;
    border-radius: 100px;
    padding: 6px 12px;
    flex-shrink: 0;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.08em;
    color: #b45309;
    text-transform: uppercase;
    margin-top: 4px;
  }
  .td-badge-dot {
    width: 7px; height: 7px; border-radius: 50%;
    background: #f59e0b;
    box-shadow: 0 0 6px rgba(245,158,11,0.6);
    animation: tdPulse 2s ease-in-out infinite;
  }
  @keyframes tdPulse { 0%,100%{opacity:1;} 50%{opacity:0.3;} }

  /* ── Stat Grid ── */
  .td-stat-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }
  @media (min-width: 768px) {
    .td-stat-grid { grid-template-columns: repeat(4, 1fr); gap: 16px; }
  }

  .td-stat-card {
    border-radius: 16px;
    padding: 18px 16px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    background: #ffffff;
    border: 1px solid #e5e7eb;
    box-shadow: 0 1px 4px rgba(0,0,0,0.05);
    transition: transform 0.2s, box-shadow 0.2s;
  }
  .td-stat-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 24px rgba(0,0,0,0.09);
  }
  .td-stat-icon { width: 20px; height: 20px; }

  /* Coloured top-border accent */
  .td-stat-card--blue  { border-top: 3px solid #3b82f6; }
  .td-stat-card--green { border-top: 3px solid #22c55e; }
  .td-stat-card--amber { border-top: 3px solid #f59e0b; }
  .td-stat-card--rose  { border-top: 3px solid #ef4444; }
  .td-stat-card--blue  .td-stat-icon { color: #3b82f6; }
  .td-stat-card--green .td-stat-icon { color: #22c55e; }
  .td-stat-card--amber .td-stat-icon { color: #f59e0b; }
  .td-stat-card--rose  .td-stat-icon { color: #ef4444; }

  .td-stat-label {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.09em;
    text-transform: uppercase;
    color: #9ca3af;
  }
  .td-stat-value {
    font-family: 'Playfair Display', serif;
    font-size: 28px;
    font-weight: 700;
    color: #111827;
    line-height: 1;
  }
  .td-stat-value--sm { font-size: 18px; }

  /* ── Suggested Lesson ── */
  .td-suggest {
    border-radius: 20px;
    border: 1px solid #fcd9a0;
    background: linear-gradient(135deg, #fffbf0 0%, #fff7e0 100%);
    padding: 22px 20px 20px;
    position: relative;
    overflow: hidden;
    box-shadow: 0 2px 12px rgba(201,155,87,0.1);
  }
  .td-suggest-glow {
    position: absolute;
    top: -50px; right: -50px;
    width: 180px; height: 180px;
    background: radial-gradient(circle, rgba(251,191,36,0.2) 0%, transparent 70%);
    pointer-events: none;
  }
  .td-suggest-inner { position: relative; z-index: 1; margin-bottom: 18px; }
  .td-suggest-pill {
    display: inline-block;
    background: #fef3c7;
    border: 1px solid #fcd34d;
    border-radius: 100px;
    padding: 3px 10px;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #92400e;
    margin-bottom: 10px;
  }
  .td-suggest-meta {
    font-size: 12px;
    color: #92400e;
    margin-bottom: 4px;
    font-weight: 400;
    opacity: 0.7;
  }
  .td-suggest-title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(18px, 4vw, 24px);
    font-weight: 700;
    color: #111827;
    line-height: 1.25;
    margin-bottom: 10px;
  }
  .td-suggest-class {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: #78716c;
    font-weight: 400;
  }
  .td-suggest-cal-icon { width: 13px; height: 13px; flex-shrink: 0; }
  .td-suggest-btn {
    position: relative; z-index: 1;
    width: 100%;
    background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%);
    color: #ffffff;
    border: none;
    border-radius: 12px;
    padding: 14px;
    font-size: 14px;
    font-weight: 700;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 6px;
    box-shadow: 0 4px 16px rgba(245,158,11,0.35);
    transition: opacity 0.2s, transform 0.15s;
    letter-spacing: 0.02em;
  }
  .td-suggest-btn:hover { opacity: 0.92; transform: translateY(-1px); }
  .td-suggest-chevron { width: 18px; height: 18px; }

  /* ── Generic white card ── */
  .td-card {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 18px;
    padding: 20px;
    box-shadow: 0 1px 4px rgba(0,0,0,0.05);
  }
  .td-card-header {
    display: flex; align-items: center; gap: 10px;
    margin-bottom: 18px;
  }
  .td-card-icon { width: 18px; height: 18px; color: #f59e0b; }
  .td-card-title {
    font-family: 'Playfair Display', serif;
    font-size: 16px;
    font-weight: 600;
    color: #111827;
  }

  /* ── Progress bars ── */
  .td-progress-list { display: flex; flex-direction: column; gap: 16px; }
  .td-progress-meta {
    display: flex; justify-content: space-between; margin-bottom: 7px;
  }
  .td-progress-name { font-size: 13px; font-weight: 500; color: #374151; }
  .td-progress-pct  { font-size: 12px; color: #f59e0b; font-weight: 600; }
  .td-progress-track {
    width: 100%; height: 7px;
    background: #f3f4f6;
    border-radius: 100px;
    overflow: hidden;
  }
  .td-progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #f59e0b, #fbbf24);
    border-radius: 100px;
    animation: tdGrow 0.8s ease both;
  }
  @keyframes tdGrow { from { width: 0 !important; } }

  /* ── Section title ── */
  .td-section-title {
    font-family: 'Playfair Display', serif;
    font-size: 18px;
    font-weight: 700;
    color: #111827;
    margin-bottom: 12px;
  }

  /* ── Session rows ── */
  .td-sessions-list { display: flex; flex-direction: column; gap: 10px; }
  .td-session-row {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 14px;
    padding: 14px 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    transition: background 0.2s, border-color 0.2s, box-shadow 0.2s;
  }
  .td-session-row:hover {
    background: #fffbf0;
    border-color: #fcd9a0;
    box-shadow: 0 4px 16px rgba(245,158,11,0.1);
  }
  .td-session-left {
    display: flex; align-items: center; gap: 14px; min-width: 0; flex: 1;
  }
  .td-session-num {
    font-family: 'Playfair Display', serif;
    font-size: 18px;
    font-weight: 700;
    color: #d1d5db;
    flex-shrink: 0;
    line-height: 1;
  }
  .td-session-name {
    font-size: 13px;
    font-weight: 600;
    color: #111827;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .td-session-meta {
    font-size: 11px;
    color: #9ca3af;
    margin-top: 3px;
  }
  .td-session-right {
    display: flex; flex-direction: column; align-items: flex-end; gap: 5px; flex-shrink: 0;
  }
  .td-session-badge {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #15803d;
    background: #dcfce7;
    border: 1px solid #bbf7d0;
    border-radius: 6px;
    padding: 3px 8px;
  }
  .td-session-date {
    font-size: 10px;
    color: #9ca3af;
    font-weight: 500;
  }

  /* ── Empty / Error ── */
  .td-empty {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 14px;
    padding: 28px;
    text-align: center;
    font-size: 13px;
    color: #9ca3af;
  }
  .td-error {
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 14px;
    padding: 20px;
    text-align: center;
    font-size: 14px;
    color: #dc2626;
  }
`;

const skeletonStyles = `
  ${baseStyles}
  .td-skeleton-header {
    height: 32px; width: 55%; border-radius: 8px;
    background: #e5e7eb;
    animation: tdShimmer 1.4s ease-in-out infinite;
  }
  .td-skeleton-sub {
    height: 14px; width: 75%; border-radius: 6px; margin-top: 10px;
    background: #f3f4f6;
    animation: tdShimmer 1.4s 0.1s ease-in-out infinite;
  }
  .td-skeleton-grid {
    display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 4px;
  }
  @media(min-width:768px){ .td-skeleton-grid { grid-template-columns: repeat(4,1fr); } }
  .td-skeleton-card {
    height: 100px; border-radius: 16px;
    background: #e5e7eb;
    animation: tdShimmer 1.4s 0.2s ease-in-out infinite;
  }
  .td-skeleton-block {
    height: 140px; border-radius: 18px;
    background: #f3f4f6;
    animation: tdShimmer 1.4s 0.3s ease-in-out infinite;
  }
  .td-skeleton-block--short { height: 90px; }
  @keyframes tdShimmer {
    0%,100% { opacity: 0.6; } 50% { opacity: 1; }
  }
`;

export default TeacherDashboard;
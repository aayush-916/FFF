// import { useState, useEffect } from 'react';
// import { Calendar, BookOpen, Loader2, AlertCircle } from 'lucide-react';
// import api from '../../services/api';

// const SessionHistory = () => {
//   const [sessions, setSessions] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchSessions = async () => {
//       try {
//         // Fetch sessions for the logged-in teacher
//         const response = await api.get('/sessions');
        
//         // Handle varying response structures securely
//         const fetchedSessions = response.data.data || response.data || [];
        
//         setSessions(fetchedSessions);
//       } catch (err) {
//         console.error("Failed to fetch sessions:", err);
//         setError("Unable to load session history. Please try again later.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchSessions();
//   }, []);

//   // Loading State
//   if (loading) {
//     return (
//       <div className="max-w-md mx-auto md:max-w-2xl space-y-4 pb-8">
//         <div className="h-8 bg-gray-200 rounded w-1/3 mb-6 animate-pulse"></div>
//         {[1, 2, 3, 4].map((i) => (
//           <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 h-24 animate-pulse"></div>
//         ))}
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-md mx-auto md:max-w-2xl space-y-6 pb-8">
      
//       {/* Header Area */}
//       <div>
//         <h1 className="text-2xl font-bold text-gray-900">Session History</h1>
//         <p className="text-sm text-gray-500 mt-1">Review your previously conducted lessons.</p>
//       </div>

//       {/* Error State */}
//       {error && (
//         <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm flex items-start gap-2 border border-red-100">
//           <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
//           <p>{error}</p>
//         </div>
//       )}

//       {/* Session List */}
//       {!error && (
//         <div className="space-y-4">
//           {sessions.length > 0 ? (
//             sessions.map((session, index) => (
//               <div 
//                 key={session.id || index} 
//                 className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-3 transition-shadow hover:shadow-md"
//               >
//                 <div className="flex items-start gap-3">
//                   <div className="bg-blue-50 text-blue-600 p-2 rounded-lg shrink-0 mt-0.5">
//                     <BookOpen className="w-5 h-5" />
//                   </div>
//                   <div>
//                     {/* Fallbacks for various standard backend column names */}
//                     <h3 className="font-bold text-gray-900 text-base">
//                       {session.lesson_title || session.lessonName || session.title || 'Unknown Lesson'}
//                     </h3>
//                     <p className="text-sm font-medium text-gray-600 mt-1">
//                       Class {session.class_number || session.classNumber} - Section {session.section}
//                     </p>
//                   </div>
//                 </div>
                
//                 <div className="flex items-center gap-2 mt-2 pt-3 border-t border-gray-50 text-xs text-gray-500 font-medium">
//                   <Calendar className="w-4 h-4 text-gray-400" />
//                   {/* Format the date (e.g., 10 March 2026) */}
//                   {new Date(session.created_at || session.date || new Date()).toLocaleDateString('en-GB', {
//                     day: 'numeric',
//                     month: 'long',
//                     year: 'numeric'
//                   })}
//                 </div>
//               </div>
//             ))
//           ) : (
//             /* Empty State */
//             <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
//               <div className="w-16 h-16 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mb-4">
//                 <BookOpen className="w-8 h-8" />
//               </div>
//               <h3 className="text-lg font-bold text-gray-900 mb-1">No sessions recorded yet.</h3>
//               <p className="text-sm text-gray-500">You haven't conducted any lessons.</p>
//             </div>
//           )}
//         </div>
//       )}

//     </div>
//   );
// };

// export default SessionHistory;






import { useState, useEffect } from 'react';
import { Calendar, BookOpen, AlertCircle } from 'lucide-react';
import api from '../../services/api';

const SessionHistory = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await api.get('/sessions');
        const fetchedSessions = response.data.data || response.data || [];
        setSessions(fetchedSessions);
      } catch (err) {
        console.error('Failed to fetch sessions:', err);
        setError('Unable to load session history. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchSessions();
  }, []);

  if (loading) {
    return (
      <>
        <style>{baseStyles}</style>
        <div className="sh-root">
          <div className="sh-sk-title" />
          <div className="sh-sk-sub" />
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="sh-sk-card" />
          ))}
        </div>
      </>
    );
  }

  return (
    <>
      <style>{baseStyles}</style>
      <div className="sh-root">

        {/* ── Header ── */}
        <div className="sh-header sh-anim" style={{ animationDelay: '0ms' }}>
          <div>
            <p className="sh-greeting">History</p>
            <h1 className="sh-title">Session History</h1>
            <p className="sh-subtitle">Review your previously conducted lessons.</p>
          </div>
          <div className="sh-header-badge">
            <span>{sessions.length}</span>
            <span className="sh-badge-label">total</span>
          </div>
        </div>

        {/* ── Error ── */}
        {error && (
          <div className="sh-error sh-anim" style={{ animationDelay: '60ms' }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* ── Session list ── */}
        {!error && (
          <div className="sh-list">
            {sessions.length > 0 ? (
              sessions.map((session, index) => (
                <div
                  key={session.id || index}
                  className="sh-card sh-anim"
                  style={{ animationDelay: `${index * 50 + 80}ms` }}
                >
                  <div className="sh-card-left">
                    <div className="sh-card-num">
                      {String(index + 1).padStart(2, '0')}
                    </div>
                    <div className="sh-card-icon-wrap">
                      <BookOpen size={17} />
                    </div>
                    <div className="sh-card-body">
                      <h3 className="sh-card-title">
                        {session.lesson_title || session.lessonName || session.title || 'Unknown Lesson'}
                      </h3>
                      <p className="sh-card-class">
                        Class {session.class_number || session.classNumber} &bull; Section {session.section}
                      </p>
                    </div>
                  </div>

                  <div className="sh-card-right">
                    <span className="sh-card-badge">Conducted</span>
                    <p className="sh-card-date">
                      <Calendar size={11} style={{ flexShrink: 0 }} />
                      {new Date(session.created_at || session.date || new Date()).toLocaleDateString('en-GB', {
                        day: 'numeric', month: 'short', year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="sh-empty sh-anim" style={{ animationDelay: '80ms' }}>
                <div className="sh-empty-icon">
                  <BookOpen size={28} />
                </div>
                <h3 className="sh-empty-title">No sessions yet</h3>
                <p className="sh-empty-sub">You haven't conducted any lessons.</p>
              </div>
            )}
          </div>
        )}

      </div>
    </>
  );
};

/* ─────────────────────────────────────────────
   STYLES
───────────────────────────────────────────── */
const baseStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500;600&display=swap');

  .sh-root {
    max-width: 680px;
    margin: 0 auto;
    padding-bottom: 40px;
    display: flex;
    flex-direction: column;
    gap: 14px;
    font-family: 'DM Sans', sans-serif;
  }

  /* Fade-up */
  .sh-anim { animation: shFadeUp 0.5s ease both; }
  @keyframes shFadeUp {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* ── Skeleton ── */
  .sh-sk-title {
    height: 30px; width: 50%; border-radius: 8px;
    background: #e5e7eb;
    animation: shShimmer 1.4s ease-in-out infinite;
  }
  .sh-sk-sub {
    height: 13px; width: 70%; border-radius: 6px;
    background: #f3f4f6;
    animation: shShimmer 1.4s 0.1s ease-in-out infinite;
  }
  .sh-sk-card {
    height: 76px; border-radius: 14px;
    background: #f3f4f6;
    animation: shShimmer 1.4s 0.15s ease-in-out infinite;
  }
  @keyframes shShimmer { 0%,100%{opacity:0.5;} 50%{opacity:1;} }

  /* ── Header ── */
  .sh-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 4px;
  }
  .sh-greeting {
    font-size: 11px;
    color: #9ca3af;
    font-weight: 500;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin-bottom: 3px;
  }
  .sh-title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(22px, 5vw, 30px);
    font-weight: 700;
    color: #111827;
    line-height: 1.2;
  }
  .sh-subtitle {
    font-size: 13px;
    color: #9ca3af;
    margin-top: 5px;
    font-weight: 400;
  }
  .sh-header-badge {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-width: 52px;
    background: #fff7ed;
    border: 1.5px solid #fcd9a0;
    border-radius: 12px;
    padding: 8px 10px;
    flex-shrink: 0;
  }
  .sh-header-badge span:first-child {
    font-family: 'Playfair Display', serif;
    font-size: 22px;
    font-weight: 700;
    color: #f59e0b;
    line-height: 1;
  }
  .sh-badge-label {
    font-size: 9px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #b45309;
    margin-top: 2px;
  }

  /* ── Error ── */
  .sh-error {
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

  /* ── List ── */
  .sh-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  /* ── Session card ── */
  .sh-card {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 14px;
    padding: 14px 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    transition: border-color 0.18s, box-shadow 0.18s, transform 0.15s;
  }
  .sh-card:hover {
    border-color: #fcd9a0;
    box-shadow: 0 4px 16px rgba(245,158,11,0.1);
    transform: translateY(-1px);
  }

  .sh-card-left {
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;
    flex: 1;
  }
  .sh-card-num {
    font-family: 'Playfair Display', serif;
    font-size: 16px;
    font-weight: 700;
    color: #d1d5db;
    flex-shrink: 0;
    line-height: 1;
    min-width: 24px;
  }
  .sh-card-icon-wrap {
    width: 36px; height: 36px;
    border-radius: 10px;
    background: #fff7ed;
    border: 1px solid #fef3c7;
    display: flex; align-items: center; justify-content: center;
    color: #f59e0b;
    flex-shrink: 0;
  }
  .sh-card-body { min-width: 0; }
  .sh-card-title {
    font-size: 14px;
    font-weight: 600;
    color: #111827;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .sh-card-class {
    font-size: 12px;
    color: #9ca3af;
    margin-top: 3px;
    font-weight: 400;
  }

  .sh-card-right {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 6px;
    flex-shrink: 0;
  }
  .sh-card-badge {
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
  .sh-card-date {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 11px;
    color: #9ca3af;
    font-weight: 500;
  }

  /* ── Empty state ── */
  .sh-empty {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 18px;
    padding: 48px 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    box-shadow: 0 1px 3px rgba(0,0,0,0.04);
  }
  .sh-empty-icon {
    width: 64px; height: 64px;
    border-radius: 50%;
    background: #fff7ed;
    border: 1.5px solid #fef3c7;
    display: flex; align-items: center; justify-content: center;
    color: #f59e0b;
    margin-bottom: 16px;
  }
  .sh-empty-title {
    font-family: 'Playfair Display', serif;
    font-size: 18px;
    font-weight: 700;
    color: #111827;
    margin-bottom: 6px;
  }
  .sh-empty-sub {
    font-size: 13px;
    color: #9ca3af;
  }
`;

export default SessionHistory;
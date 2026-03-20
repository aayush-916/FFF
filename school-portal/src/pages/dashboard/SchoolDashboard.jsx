// import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { 
//   Building, Folder, ChevronDown, ChevronRight, Users, 
//   CheckCircle, Circle, BookOpen, Clock, Calendar, 
//   Loader2, AlertCircle, UserCheck
// } from 'lucide-react';
// import api from '../../services/api';

// const SchoolDashboard = () => {
//   const [loading, setLoading] = useState(true);
//   const [data, setData] = useState(null);
//   const [error, setError] = useState(null);
//   const navigate = useNavigate();

//   // Tab State
//   const [activeTab, setActiveTab] = useState('classes');

//   // Class Accordion State
//   const [expandedClass, setExpandedClass] = useState(null);
//   const [expandedSection, setExpandedSection] = useState(null);
//   const [expandedHabit, setExpandedHabit] = useState(null);

//   // Teacher Accordion State
//   const [expandedTeacher, setExpandedTeacher] = useState(null);
//   const [expandedTeacherClass, setExpandedTeacherClass] = useState(null);

//   useEffect(() => {
//     const fetchDashboardData = async () => {
//       try {
//         const response = await api.get('/dashboard/school');
//         console.log("Dashboard response:", response.data);
//         const dashboardData = response.data.data || response.data;
//         setData(dashboardData);

//         // Onboarding Check
//         const classRes = await api.get('/school/classes').catch(() => ({ data: [] }));
//         const existingClasses = classRes.data.data || classRes.data || [];
        
//         if (existingClasses.length === 0) {
//           navigate('/admin/classes?setup=true');
//         }

//       } catch (err) {
//         console.error("Dashboard error:", err);
//         setError("Failed to load school dashboard data. Please try again.");
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchDashboardData();
//   }, [navigate]);

//   // --- TOGGLES FOR CLASS VIEW ---
//   const toggleClass = (classNum) => { setExpandedClass(prev => prev === classNum ? null : classNum); setExpandedSection(null); setExpandedHabit(null); };
//   const toggleSection = (sectionKey) => { setExpandedSection(prev => prev === sectionKey ? null : sectionKey); setExpandedHabit(null); };
//   const toggleHabit = (habitKey) => { setExpandedHabit(prev => prev === habitKey ? null : habitKey); };

//   // --- TOGGLES FOR TEACHER VIEW ---
//   const toggleTeacher = (teacherId) => { setExpandedTeacher(prev => prev === teacherId ? null : teacherId); setExpandedTeacherClass(null); };
//   const toggleTeacherClass = (classKey) => { setExpandedTeacherClass(prev => prev === classKey ? null : classKey); };

//   const formatDate = (dateString) => {
//     if (!dateString) return "N/A";
//     const options = { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' };
//     return new Date(dateString).toLocaleDateString('en-GB', options);
//   };

//   if (loading) return <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;
//   if (error) return <div className="p-4 bg-red-50 text-red-600 rounded-xl max-w-4xl mx-auto">{error}</div>;

//   // These default to empty arrays if the backend hasn't sent the new data yet!
//   const classesData = data?.classes || [];
//   const teachersData = data?.teachers || [];
//   const TOTAL_HABITS = 21; 

//   return (
//     <div className="space-y-6 pb-10 max-w-5xl mx-auto">
      
//       {/* HEADER */}
//       <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
//         <div className="bg-blue-50 p-3 rounded-xl text-blue-600"><Building className="w-8 h-8" /></div>
//         <div>
//           <h1 className="text-2xl font-bold text-gray-900">School Dashboard</h1>
//           <p className="text-sm text-gray-500 mt-0.5 font-medium">Detailed tracking of your school's curriculum and teachers.</p>
//         </div>
//       </div>

//       {/* VIEW TOGGLE TABS */}
//       <div className="flex p-1 bg-gray-100 rounded-xl border border-gray-200">
//         <button 
//           onClick={() => setActiveTab('classes')}
//           className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-lg transition-all ${activeTab === 'classes' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
//         >
//           <Folder className="w-4 h-4" /> Class-Wise Progress
//         </button>
//         <button 
//           onClick={() => setActiveTab('teachers')}
//           className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-lg transition-all ${activeTab === 'teachers' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
//         >
//           <UserCheck className="w-4 h-4" /> Teacher-Wise Logs
//         </button>
//       </div>

//       {/* TAB 1: CLASS-WISE CURRICULUM VIEW */}
//       {activeTab === 'classes' && (
//         <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
//           {classesData.length === 0 ? (
//             <div className="text-center p-10 bg-white rounded-2xl border border-dashed border-gray-200">
//               <AlertCircle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
//               <p className="text-gray-500 font-medium">Awaiting detailed class data from server...</p>
//               <p className="text-xs text-gray-400 mt-1">Tell your backend developer to send the "classes" array!</p>
//             </div>
//           ) : (
//             classesData.map((cls) => {
//               const isClassExpanded = expandedClass === cls.class_number;
//               const sections = cls.sections || [];
              
//               return (
//                 <div key={cls.class_number} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
//                   <button onClick={() => toggleClass(cls.class_number)} className={`w-full flex items-center justify-between p-5 ${isClassExpanded ? 'bg-blue-600 text-white' : 'hover:bg-gray-50 text-gray-900'}`}>
//                     <div className="flex items-center gap-4">
//                       <Folder className={`w-6 h-6 ${isClassExpanded ? 'text-blue-200' : 'text-blue-500'}`} />
//                       <h2 className="text-xl font-black">Class {cls.class_number}</h2>
//                     </div>
//                     {isClassExpanded ? <ChevronDown className="w-6 h-6" /> : <ChevronRight className="w-6 h-6 text-gray-400" />}
//                   </button>

//                   {isClassExpanded && (
//                     <div className="bg-gray-50 p-4 space-y-4 border-t border-blue-700">
//                       {sections.length === 0 ? (
//                         <p className="text-center text-gray-500 italic p-4">No sections found.</p>
//                       ) : (
//                         sections.map((sec, idx) => {
//                           const sectionKey = `${cls.class_number}-${sec.section}`;
//                           const isSectionExpanded = expandedSection === sectionKey;
//                           const secProgress = Math.round(((sec.habits_completed || 0) / TOTAL_HABITS) * 100) || 0;

//                           return (
//                             <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
//                               <button onClick={() => toggleSection(sectionKey)} className={`w-full p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${isSectionExpanded ? 'bg-blue-50/50 border-b border-gray-100' : 'hover:bg-gray-50'}`}>
//                                 <div className="flex items-center gap-3">
//                                   <div className="p-2 rounded-lg bg-gray-100 text-gray-600"><Users className="w-5 h-5" /></div>
//                                   <div className="text-left">
//                                     <h3 className="text-lg font-bold text-gray-900">Section {sec.section}</h3>
//                                     <p className="text-xs text-gray-500">{sec.habits_completed || 0} of {TOTAL_HABITS} Habits Completed</p>
//                                   </div>
//                                 </div>
//                                 <div className="flex items-center gap-3 sm:w-48 w-full">
//                                   <div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-blue-500 h-2 rounded-full" style={{ width: `${secProgress}%` }}></div></div>
//                                   <span className="text-xs font-bold text-gray-700 w-8">{secProgress}%</span>
//                                   {isSectionExpanded ? <ChevronDown className="w-5 h-5 text-gray-400 shrink-0" /> : <ChevronRight className="w-5 h-5 text-gray-400 shrink-0" />}
//                                 </div>
//                               </button>

//                               {isSectionExpanded && (
//                                 <div className="p-4 space-y-3 bg-white">
//                                   {(sec.habits || []).map((habit) => {
//                                     const habitKey = `${sectionKey}-${habit.id}`;
//                                     const isHabitExpanded = expandedHabit === habitKey;
//                                     const lessonsTotal = habit.lessons_total || habit.lessons?.length || 1; 
//                                     const lessonsCompleted = habit.lessons_completed || 0;
//                                     const isHabitCompleted = lessonsCompleted > 0 && lessonsCompleted === lessonsTotal;
//                                     const habitProgress = Math.round((lessonsCompleted / lessonsTotal) * 100) || 0;

//                                     return (
//                                       <div key={habit.id} className="rounded-xl border border-gray-100">
//                                         <button onClick={() => toggleHabit(habitKey)} className={`w-full flex flex-col sm:flex-row justify-between gap-4 p-4 rounded-xl ${isHabitExpanded ? 'bg-blue-50/30' : 'bg-white'}`}>
//                                           <div className="flex items-center gap-3 text-left">
//                                             {isHabitCompleted ? <CheckCircle className="w-5 h-5 text-green-500 shrink-0" /> : <BookOpen className="w-5 h-5 text-orange-400 shrink-0" />}
//                                             <div>
//                                               <h4 className={`font-bold ${isHabitCompleted ? 'text-gray-500' : 'text-gray-900'}`}>{habit.name}</h4>
//                                               <p className="text-xs text-gray-500 mt-0.5">{lessonsCompleted} of {lessonsTotal} lessons done</p>
//                                             </div>
//                                           </div>
//                                           <div className="flex items-center gap-3 sm:w-32 w-full ml-8 sm:ml-0">
//                                             <div className="w-full bg-gray-100 rounded-full h-1.5"><div className={`${isHabitCompleted ? 'bg-green-500' : 'bg-orange-400'} h-1.5 rounded-full`} style={{ width: `${habitProgress}%` }}></div></div>
//                                             {isHabitExpanded ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
//                                           </div>
//                                         </button>

//                                         {isHabitExpanded && (
//                                           <div className="px-4 pb-4 pt-2 border-t border-gray-100 bg-gray-50/50 rounded-b-xl space-y-2">
//                                             {(habit.lessons || []).map((lesson, lIdx) => {
//                                               const isCompleted = lesson.status === 'completed';
//                                               return (
//                                                 <div key={lIdx} className={`flex flex-col sm:flex-row justify-between gap-3 p-3 rounded-lg border bg-white ${isCompleted ? 'border-green-100 bg-green-50/30' : 'border-gray-100'}`}>
//                                                   <div className="flex items-start gap-3 pr-4">
//                                                     {isCompleted ? <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" /> : <Circle className="w-5 h-5 text-gray-300 shrink-0 mt-0.5" />}
//                                                     <div>
//                                                       <p className={`text-sm font-semibold ${isCompleted ? 'text-gray-900' : 'text-gray-500'}`}>{lesson.title}</p>
//                                                       {isCompleted && lesson.conducted_by && (
//                                                         <p className="text-xs text-green-700 mt-1 font-medium flex items-center gap-1.5">
//                                                           <UserCheck className="w-3.5 h-3.5" /> Taught by {lesson.conducted_by}
//                                                         </p>
//                                                       )}
//                                                     </div>
//                                                   </div>
//                                                   {isCompleted && lesson.conducted_at && (
//                                                     <div className="shrink-0 flex items-center text-xs text-gray-500 font-medium sm:ml-auto ml-8">
//                                                       <Clock className="w-3.5 h-3.5 mr-1" /> {formatDate(lesson.conducted_at)}
//                                                     </div>
//                                                   )}
//                                                 </div>
//                                               );
//                                             })}
//                                           </div>
//                                         )}
//                                       </div>
//                                     );
//                                   })}
//                                 </div>
//                               )}
//                             </div>
//                           );
//                         })
//                       )}
//                     </div>
//                   )}
//                 </div>
//               );
//             })
//           )}
//         </div>
//       )}

//       {/* TAB 2: TEACHER-WISE PERFORMANCE VIEW */}
//       {activeTab === 'teachers' && (
//         <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
//           {teachersData.length === 0 ? (
//             <div className="text-center p-10 bg-white rounded-2xl border border-dashed border-gray-200">
//               <UserCheck className="w-10 h-10 text-gray-300 mx-auto mb-3" />
//               <p className="text-gray-500 font-medium">Awaiting teacher data from server...</p>
//               <p className="text-xs text-gray-400 mt-1">Tell your backend developer to send the "teachers" array!</p>
//             </div>
//           ) : (
//             teachersData.map((teacher) => {
//               const isTeacherExpanded = expandedTeacher === teacher.id;
//               const classesTaught = teacher.classes_taught || [];

//               return (
//                 <div key={teacher.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all">
//                   <button onClick={() => toggleTeacher(teacher.id)} className={`w-full flex items-center justify-between p-5 ${isTeacherExpanded ? 'bg-indigo-600 text-white' : 'hover:bg-gray-50 text-gray-900'}`}>
//                     <div className="flex items-center gap-4">
//                       <div className={`p-2 rounded-full ${isTeacherExpanded ? 'bg-indigo-500 text-white' : 'bg-indigo-50 text-indigo-600'}`}>
//                         <UserCheck className="w-6 h-6" />
//                       </div>
//                       <div className="text-left">
//                         <h2 className="text-xl font-black">{teacher.name}</h2>
//                         <p className={`text-sm mt-0.5 font-medium ${isTeacherExpanded ? 'text-indigo-200' : 'text-gray-500'}`}>
//                           {teacher.total_sessions} Sessions Conducted
//                         </p>
//                       </div>
//                     </div>
//                     {isTeacherExpanded ? <ChevronDown className="w-6 h-6" /> : <ChevronRight className="w-6 h-6 text-gray-400" />}
//                   </button>

//                   {isTeacherExpanded && (
//                     <div className="bg-gray-50 p-4 space-y-4 border-t border-indigo-700">
//                       {classesTaught.length === 0 ? (
//                         <p className="text-center text-gray-500 italic p-4">No sessions logged by this teacher yet.</p>
//                       ) : (
//                         classesTaught.map((cls, idx) => {
//                           const classKey = `${teacher.id}-${cls.class_number}-${cls.section}`;
//                           const isClassExpanded = expandedTeacherClass === classKey;
//                           const sessions = cls.sessions || [];

//                           return (
//                             <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
//                               <button onClick={() => toggleTeacherClass(classKey)} className={`w-full p-4 flex items-center justify-between gap-4 ${isClassExpanded ? 'bg-indigo-50/30 border-b border-gray-100' : 'hover:bg-gray-50'}`}>
//                                 <div className="flex items-center gap-3">
//                                   <div className="p-2 rounded-lg bg-gray-100 text-gray-600"><Users className="w-5 h-5" /></div>
//                                   <div className="text-left">
//                                     <h3 className="text-lg font-bold text-gray-900">Class {cls.class_number} • Section {cls.section}</h3>
//                                     <p className="text-xs text-gray-500 font-medium">{sessions.length} sessions taught here</p>
//                                   </div>
//                                 </div>
//                                 {isClassExpanded ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
//                               </button>

//                               {isClassExpanded && (
//                                 <div className="p-4 bg-white">
//                                   <div className="space-y-2">
//                                     {sessions.map((session, sIdx) => (
//                                       <div key={sIdx} className="flex flex-col sm:flex-row justify-between gap-2 p-3 rounded-lg border border-gray-100 bg-gray-50/50 hover:bg-white transition-colors">
//                                         <div>
//                                           <p className="text-sm font-bold text-gray-900">{session.lesson_title}</p>
//                                           <p className="text-xs text-gray-500 mt-1 font-medium">{session.habit_name}</p>
//                                         </div>
//                                         <div className="flex items-center text-xs text-gray-500 font-medium sm:ml-auto">
//                                           <Calendar className="w-3.5 h-3.5 mr-1.5" /> {formatDate(session.conducted_at)}
//                                         </div>
//                                       </div>
//                                     ))}
//                                   </div>
//                                 </div>
//                               )}
//                             </div>
//                           );
//                         })
//                       )}
//                     </div>
//                   )}
//                 </div>
//               );
//             })
//           )}
//         </div>
//       )}

//     </div>
//   );
// };

// export default SchoolDashboard;










import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building, Folder, ChevronDown, ChevronRight, Users,
  CheckCircle, Circle, BookOpen, Clock, Calendar,
  Loader2, AlertCircle, UserCheck, Layers, TrendingUp,
  Award, BarChart2
} from 'lucide-react';
import api from '../../services/api';

/* ─────────────────────────────────────────────
   Tiny helpers
───────────────────────────────────────────── */
const formatDate = (d) => {
  if (!d) return 'N/A';
  return new Date(d).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

/* Circular SVG progress ring */
const Ring = ({ pct = 0, size = 52, stroke = 5, color = '#6366f1' }) => {
  const r = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <svg width={size} height={size} className="shrink-0 -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke="#e2e8f0" strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset .6s cubic-bezier(.4,0,.2,1)' }} />
    </svg>
  );
};

/* Slim progress bar */
const Bar = ({ pct = 0, color = 'bg-indigo-500' }) => (
  <div className="relative w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
    <div
      className={`absolute inset-y-0 left-0 rounded-full ${color} transition-all duration-700`}
      style={{ width: `${pct}%` }}
    />
  </div>
);

/* Badge chip */
const Chip = ({ label, variant = 'blue' }) => {
  const map = {
    blue: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    green: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    slate: 'bg-slate-100 text-slate-500 border-slate-200',
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-bold rounded-full border ${map[variant]}`}>
      {label}
    </span>
  );
};

/* Empty state */
const Empty = ({ icon: Icon, title, sub }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
    <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center">
      <Icon className="w-7 h-7 text-slate-300" />
    </div>
    <p className="text-slate-600 font-semibold">{title}</p>
    {sub && <p className="text-xs text-slate-400 max-w-xs">{sub}</p>}
  </div>
);

/* ─────────────────────────────────────────────
   Main Component
───────────────────────────────────────────── */
const SchoolDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('classes');

  // Class accordion
  const [expandedClass, setExpandedClass] = useState(null);
  const [expandedSection, setExpandedSection] = useState(null);
  const [expandedHabit, setExpandedHabit] = useState(null);

  // Teacher accordion
  const [expandedTeacher, setExpandedTeacher] = useState(null);
  const [expandedTeacherClass, setExpandedTeacherClass] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await api.get('/dashboard/school');
        const dashboardData = response.data.data || response.data;
        setData(dashboardData);
        const classRes = await api.get('/school/classes').catch(() => ({ data: [] }));
        const existingClasses = classRes.data.data || classRes.data || [];
        if (existingClasses.length === 0) navigate('/admin/classes?setup=true');
      } catch (err) {
        setError('Failed to load school dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [navigate]);

  const toggleClass = (n) => { setExpandedClass(p => p === n ? null : n); setExpandedSection(null); setExpandedHabit(null); };
  const toggleSection = (k) => { setExpandedSection(p => p === k ? null : k); setExpandedHabit(null); };
  const toggleHabit = (k) => setExpandedHabit(p => p === k ? null : k);
  const toggleTeacher = (id) => { setExpandedTeacher(p => p === id ? null : id); setExpandedTeacherClass(null); };
  const toggleTeacherClass = (k) => setExpandedTeacherClass(p => p === k ? null : k);

  /* ── Loading ── */
  if (loading) return (
    <div className="flex flex-col items-center justify-center h-72 gap-4">
      <div className="relative">
        <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200">
          <Building className="w-7 h-7 text-white" />
        </div>
        <Loader2 className="w-5 h-5 text-indigo-400 animate-spin absolute -bottom-1 -right-1" />
      </div>
      <p className="text-sm text-slate-500 font-medium animate-pulse">Loading school data…</p>
    </div>
  );

  /* ── Error ── */
  if (error) return (
    <div className="max-w-lg mx-auto mt-10 p-5 rounded-2xl bg-red-50 border border-red-100 flex items-start gap-3">
      <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
      <p className="text-sm text-red-700 font-medium">{error}</p>
    </div>
  );

  const classesData = data?.classes || [];
  const teachersData = data?.teachers || [];

  /* Quick summary stats */
  const totalSections = classesData.reduce((a, c) => a + (c.sections?.length || 0), 0);
  const totalHabitsDone = classesData.reduce((a, c) =>
    a + (c.sections || []).reduce((b, s) => b + (s.habits_completed || 0), 0), 0);
  const totalSessions = teachersData.reduce((a, t) => a + (t.total_sessions || 0), 0);

  return (
    <div className="max-w-5xl mx-auto pb-16 space-y-6 px-2 sm:px-0"
      style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* Google Font injection */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&family=DM+Mono:wght@400;500&display=swap');`}</style>

      {/* ── HERO HEADER ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-700 via-indigo-600 to-violet-600 p-7 text-white shadow-xl shadow-indigo-200">
        {/* decorative blobs */}
        <div className="absolute -top-10 -right-10 w-56 h-56 rounded-full bg-white/5 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-14 -left-6 w-48 h-48 rounded-full bg-violet-500/30 blur-2xl pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center border border-white/20 shadow-inner">
            <Building className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">School Dashboard</h1>
            <p className="text-indigo-200 text-sm mt-0.5 font-medium">Track curriculum delivery and teacher performance across your school.</p>
          </div>
        </div>

        {/* stats row */}
        <div className="relative mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Classes', value: classesData.length, icon: Layers },
            { label: 'Sections', value: totalSections, icon: Users },
            { label: 'Habits Done', value: totalHabitsDone, icon: Award },
            { label: 'Sessions', value: totalSessions, icon: TrendingUp },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="rounded-xl bg-white/10 backdrop-blur border border-white/15 p-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 text-white/80" />
              </div>
              <div>
                <p className="text-xl font-extrabold leading-none">{value}</p>
                <p className="text-[11px] text-indigo-200 font-medium mt-0.5">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── TAB SWITCHER ── */}
      <div className="flex p-1.5 bg-slate-100 rounded-2xl border border-slate-200/60">
        {[
          { id: 'classes', label: 'Class-Wise Progress', Icon: BarChart2 },
          { id: 'teachers', label: 'Teacher Logs', Icon: UserCheck },
        ].map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-xl transition-all duration-200
              ${activeTab === id
                ? 'bg-white text-indigo-600 shadow-sm shadow-slate-200 border border-slate-100'
                : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      {/* ═══════════════════════════════════════
          TAB 1 — CLASS VIEW
      ═══════════════════════════════════════ */}
      {activeTab === 'classes' && (
        <div className="space-y-3">
          {classesData.length === 0
            ? <Empty icon={AlertCircle} title="Awaiting class data" sub='Tell your backend developer to send the "classes" array.' />
            : classesData.map((cls) => {
              const open = expandedClass === cls.class_number;
              const sections = cls.sections || [];
              const overallPct = sections.length
                ? Math.round(sections.reduce((a, s) => a + (s.progress_percentage || 0), 0) / sections.length)
                : 0;

              return (
                <div key={cls.class_number}
                  className={`rounded-2xl border bg-white shadow-sm transition-all duration-300 overflow-hidden
                    ${open ? 'border-indigo-200 shadow-indigo-100' : 'border-slate-100 hover:border-slate-200 hover:shadow-md'}`}>

                  {/* Class header */}
                  <button onClick={() => toggleClass(cls.class_number)}
                    className="w-full flex items-center gap-4 p-5 text-left">
                    <Ring pct={overallPct} size={52} stroke={5} color={open ? '#6366f1' : '#94a3b8'} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-lg font-extrabold text-slate-900">Class {cls.class_number}</h2>
                        <Chip label={`${sections.length} section${sections.length !== 1 ? 's' : ''}`} variant="slate" />
                        {overallPct === 100 && <Chip label="Complete ✓" variant="green" />}
                      </div>
                      <p className="text-xs text-slate-400 font-medium mt-0.5">{overallPct}% average progress</p>
                    </div>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors
                      ${open ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                      {open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </div>
                  </button>

                  {/* Sections */}
                  {open && (
                    <div className="border-t border-slate-100 bg-slate-50/60 p-4 space-y-3">
                      {sections.length === 0
                        ? <p className="text-center text-slate-400 italic text-sm py-4">No sections found.</p>
                        : sections.map((sec, idx) => {
                          const sKey = `${cls.class_number}-${sec.section}`;
                          const secOpen = expandedSection === sKey;
                          const pct = sec.progress_percentage || 0;

                          return (
                            <div key={idx}
                              className={`rounded-xl bg-white border transition-all overflow-hidden
                                ${secOpen ? 'border-indigo-200 shadow-sm' : 'border-slate-200 hover:border-slate-300'}`}>

                              {/* Section row */}
                              <button onClick={() => toggleSection(sKey)}
                                className="w-full flex flex-wrap sm:flex-nowrap items-center gap-4 p-4 text-left">
                                <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
                                  <Users className="w-4 h-4 text-indigo-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <h3 className="font-bold text-slate-900 text-sm">Section {sec.section}</h3>
                                    <Chip label={`${sec.habits_completed || 0}/${sec.habits_total || 0} habits`}
                                      variant={pct === 100 ? 'green' : pct > 0 ? 'blue' : 'slate'} />
                                  </div>
                                  <div className="flex items-center gap-2 mt-1.5">
                                    <Bar pct={pct} color={pct === 100 ? 'bg-emerald-500' : 'bg-indigo-500'} />
                                    <span className="text-[11px] font-bold text-slate-500 shrink-0">{pct}%</span>
                                  </div>
                                </div>
                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors shrink-0
                                  ${secOpen ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                                  {secOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                                </div>
                              </button>

                              {/* Habits list */}
                              {secOpen && (
                                <div className="border-t border-slate-100 p-3 space-y-2 bg-slate-50/40">
                                  {(sec.habits || []).length === 0
                                    ? <p className="text-center text-slate-400 text-xs italic py-3">No habits found.</p>
                                    : (sec.habits || []).map((habit) => {
                                      const hKey = `${sKey}-${habit.id}`;
                                      const hOpen = expandedHabit === hKey;
                                      const total = habit.lessons_total || habit.lessons?.length || 0;
                                      const done = habit.lessons_completed || 0;
                                      const complete = total > 0 && done === total;
                                      const hPct = total ? Math.round((done / total) * 100) : 0;

                                      return (
                                        <div key={habit.id}
                                          className={`rounded-lg border bg-white overflow-hidden transition-all
                                            ${hOpen ? 'border-indigo-100 shadow-sm' : 'border-slate-100 hover:border-slate-200'}`}>

                                          <button onClick={() => toggleHabit(hKey)}
                                            className="w-full flex items-center gap-3 p-3 text-left">
                                            {complete
                                              ? <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                                              : done > 0
                                                ? <BookOpen className="w-4 h-4 text-amber-400 shrink-0" />
                                                : <Circle className="w-4 h-4 text-slate-300 shrink-0" />
                                            }
                                            <div className="flex-1 min-w-0">
                                              <p className={`text-sm font-semibold leading-tight truncate
                                                ${complete ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                                                {habit.name}
                                              </p>
                                              {total > 0 && (
                                                <div className="flex items-center gap-2 mt-1">
                                                  <Bar pct={hPct}
                                                    color={complete ? 'bg-emerald-400' : done > 0 ? 'bg-amber-400' : 'bg-slate-300'} />
                                                  <span className="text-[10px] font-bold text-slate-400 shrink-0">{done}/{total}</span>
                                                </div>
                                              )}
                                            </div>
                                            <div className="shrink-0 text-slate-300">
                                              {hOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                                            </div>
                                          </button>

                                          {/* Lessons */}
                                          {hOpen && (
                                            <div className="border-t border-slate-100 bg-slate-50 px-3 py-2 space-y-1.5">
                                              {(habit.lessons || []).length === 0
                                                ? <p className="text-xs text-slate-400 italic py-2 text-center">No lessons yet.</p>
                                                : (habit.lessons || []).map((lesson, lIdx) => {
                                                  const ok = lesson.status === 'completed';
                                                  return (
                                                    <div key={lIdx}
                                                      className={`flex flex-col sm:flex-row justify-between gap-2 p-2.5 rounded-lg border text-sm
                                                        ${ok ? 'bg-emerald-50/60 border-emerald-100' : 'bg-white border-slate-100'}`}>
                                                      <div className="flex items-start gap-2.5">
                                                        {ok
                                                          ? <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                                                          : <Circle className="w-4 h-4 text-slate-300 mt-0.5 shrink-0" />}
                                                        <div>
                                                          <p className={`font-semibold leading-snug ${ok ? 'text-slate-800' : 'text-slate-400'}`}>
                                                            {lesson.title}
                                                          </p>
                                                          {ok && lesson.conducted_by && (
                                                            <p className="text-[11px] text-emerald-600 font-semibold mt-0.5 flex items-center gap-1">
                                                              <UserCheck className="w-3 h-3" /> {lesson.conducted_by}
                                                            </p>
                                                          )}
                                                        </div>
                                                      </div>
                                                      {ok && lesson.conducted_at && (
                                                        <span className="flex items-center gap-1 text-[11px] text-slate-400 font-medium sm:ml-auto shrink-0">
                                                          <Clock className="w-3 h-3" /> {formatDate(lesson.conducted_at)}
                                                        </span>
                                                      )}
                                                    </div>
                                                  );
                                                })
                                              }
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })
                                  }
                                </div>
                              )}
                            </div>
                          );
                        })
                      }
                    </div>
                  )}
                </div>
              );
            })
          }
        </div>
      )}

      {/* ═══════════════════════════════════════
          TAB 2 — TEACHER VIEW
      ═══════════════════════════════════════ */}
      {activeTab === 'teachers' && (
        <div className="space-y-3">
          {teachersData.length === 0
            ? <Empty icon={UserCheck} title="Awaiting teacher data" sub='Tell your backend developer to send the "teachers" array.' />
            : teachersData.map((teacher, tIdx) => {
              const open = expandedTeacher === teacher.id;
              const classes = teacher.classes_taught || [];
              const colors = ['#6366f1', '#8b5cf6', '#0ea5e9', '#10b981'];
              const accentColor = colors[tIdx % colors.length];

              return (
                <div key={teacher.id}
                  className={`rounded-2xl border bg-white shadow-sm overflow-hidden transition-all duration-300
                    ${open ? 'border-violet-200 shadow-violet-100' : 'border-slate-100 hover:border-slate-200 hover:shadow-md'}`}>

                  {/* Teacher header */}
                  <button onClick={() => toggleTeacher(teacher.id)}
                    className="w-full flex items-center gap-4 p-5 text-left">
                    {/* Avatar */}
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 text-white font-extrabold text-sm shadow-sm"
                      style={{ background: `linear-gradient(135deg, ${accentColor}cc, ${accentColor})` }}>
                      {(teacher.name || 'T').substring(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-base font-extrabold text-slate-900">{teacher.name}</h2>
                        <Chip label={`${teacher.total_sessions || 0} sessions`} variant="blue" />
                      </div>
                      <p className="text-xs text-slate-400 font-medium mt-0.5">
                        {classes.length} class{classes.length !== 1 ? 'es' : ''} assigned
                      </p>
                    </div>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors
                      ${open ? 'bg-violet-100 text-violet-600' : 'bg-slate-100 text-slate-400'}`}>
                      {open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </div>
                  </button>

                  {/* Classes by teacher */}
                  {open && (
                    <div className="border-t border-slate-100 bg-slate-50/60 p-4 space-y-3">
                      {classes.length === 0
                        ? <p className="text-center text-slate-400 italic text-sm py-4">No sessions logged yet.</p>
                        : classes.map((cls, idx) => {
                          const cKey = `${teacher.id}-${cls.class_number}-${cls.section}`;
                          const cOpen = expandedTeacherClass === cKey;
                          const sessions = cls.sessions || [];

                          return (
                            <div key={idx}
                              className={`rounded-xl bg-white border overflow-hidden transition-all
                                ${cOpen ? 'border-violet-200 shadow-sm' : 'border-slate-200 hover:border-slate-300'}`}>

                              <button onClick={() => toggleTeacherClass(cKey)}
                                className="w-full flex items-center gap-3 p-4 text-left">
                                <div className="w-8 h-8 rounded-lg bg-violet-50 border border-violet-100 flex items-center justify-center shrink-0">
                                  <Users className="w-4 h-4 text-violet-500" />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h3 className="font-bold text-slate-900 text-sm">
                                      Class {cls.class_number} · Section {cls.section}
                                    </h3>
                                    <Chip label={`${sessions.length} sessions`} variant="slate" />
                                  </div>
                                </div>
                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors
                                  ${cOpen ? 'bg-violet-100 text-violet-600' : 'bg-slate-100 text-slate-400'}`}>
                                  {cOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                                </div>
                              </button>

                              {cOpen && (
                                <div className="border-t border-slate-100 bg-slate-50 p-3 space-y-2">
                                  {sessions.map((session, sIdx) => (
                                    <div key={sIdx}
                                      className="flex flex-col sm:flex-row justify-between gap-2 p-3 rounded-lg bg-white border border-slate-100 hover:border-violet-100 transition-colors">
                                      <div>
                                        <p className="text-sm font-bold text-slate-800">{session.lesson_title}</p>
                                        <p className="text-xs text-violet-500 font-semibold mt-0.5">{session.habit_name}</p>
                                      </div>
                                      <span className="flex items-center gap-1 text-[11px] text-slate-400 font-medium sm:ml-auto shrink-0">
                                        <Calendar className="w-3 h-3" /> {formatDate(session.conducted_at)}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })
                      }
                    </div>
                  )}
                </div>
              );
            })
          }
        </div>
      )}
    </div>
  );
};

export default SchoolDashboard;
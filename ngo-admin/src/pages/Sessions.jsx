import { useState, useEffect } from 'react';
import { 
  Search, 
  Filter,
  Activity,
  School as SchoolIcon,
  User,
  Calendar,
  Clock,
  MapPin,
  ChevronLeft,
  ChevronRight,
  BookOpen
} from 'lucide-react';
import api from '../api/axios';

const Sessions = () => {
  // Data States
  const [sessions, setSessions] = useState([]);
  const [clusters, setClusters] = useState([]);
  const [schools, setSchools] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [habits, setHabits] = useState([]);
  
  // Loading States
  const [loadingBaseData, setLoadingBaseData] = useState(true);
  const [loadingSessions, setLoadingSessions] = useState(true);
  
  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCluster, setFilterCluster] = useState('All');
  const [filterSchool, setFilterSchool] = useState('All');
  const [filterTeacher, setFilterTeacher] = useState('All');
  const [filterHabit, setFilterHabit] = useState('All');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // 1. Fetch Structural Base Data
  useEffect(() => {
    const fetchBaseData = async () => {
      try {
        const [clustersRes, schoolsRes, usersRes, habitsRes] = await Promise.all([
          api.get('/clusters'),
          api.get('/schools'),
          api.get('/users'),
          api.get('/habits')
        ]);
        
        setClusters(clustersRes.data.data || clustersRes.data);
        setSchools(schoolsRes.data.data || schoolsRes.data);
        
        // Only keep users with the teacher role
        const allUsers = usersRes.data.data || usersRes.data;
        setTeachers(allUsers.filter(user => user.role === 'teacher'));
        
        setHabits(habitsRes.data.data || habitsRes.data);
      } catch (error) {
        console.error('Failed to load base data for filters', error);
      } finally {
        setLoadingBaseData(false);
      }
    };

    fetchBaseData();
  }, []);

  // 2. Fetch Sessions Whenever Backend Filters Change
  useEffect(() => {
    const fetchSessions = async () => {
      setLoadingSessions(true);
      try {
        // Build the query string based on the active filters
        const params = new URLSearchParams();
        if (filterSchool !== 'All') params.append('school_id', filterSchool);
        if (filterTeacher !== 'All') params.append('teacher_id', filterTeacher);
        if (filterHabit !== 'All') params.append('habit_id', filterHabit);
        if (dateRange.start) params.append('start_date', dateRange.start);
        if (dateRange.end) params.append('end_date', dateRange.end);

        const response = await api.get(`/sessions?${params.toString()}`);
        setSessions(response.data.data || response.data);
        setCurrentPage(1); // Reset to page 1 on new data fetch
      } catch (error) {
        console.error('Failed to load sessions', error);
      } finally {
        setLoadingSessions(false);
      }
    };

    fetchSessions();
  }, [filterSchool, filterTeacher, filterHabit, dateRange]);

  // Handle Cascading Filter Changes
  const handleClusterChange = (e) => {
    setFilterCluster(e.target.value);
    setFilterSchool('All'); // Reset school and teacher when cluster changes
    setFilterTeacher('All');
  };

  const handleSchoolChange = (e) => {
    setFilterSchool(e.target.value);
    setFilterTeacher('All'); // Reset teacher when school changes
  };

  // Derived Filter Options (Cascading Dropdowns)
  const availableSchools = filterCluster === 'All' 
    ? schools 
    : schools.filter(s => s.cluster_id?.toString() === filterCluster);

  const availableTeachers = filterSchool === 'All'
    ? teachers 
    : teachers.filter(t => t.school_id?.toString() === filterSchool);

  // Helper Functions to get names
  const getSchoolName = (schoolId) => {
    const school = schools.find(s => s.id === schoolId);
    return school ? school.name : 'Unknown School';
  };

  const getTeacherName = (teacherId) => {
    const teacher = teachers.find(t => t.id === teacherId);
    return teacher ? teacher.name : 'Unknown Teacher';
  };

  const getHabitName = (habitId) => {
    const habit = habits.find(h => h.id === habitId);
    return habit ? habit.name : 'Unknown Habit';
  };

  const getClusterBySchool = (schoolId) => {
    const school = schools.find(s => s.id === schoolId);
    if (!school) return 'Unknown Cluster';
    const cluster = clusters.find(c => c.id === school.cluster_id);
    return cluster ? cluster.name : 'Unassigned';
  };

  // Frontend Search & Cluster Filtering (Applied after backend fetch)
  const processedSessions = sessions.filter(session => {
    const schoolName = getSchoolName(session.school_id).toLowerCase();
    const teacherName = getTeacherName(session.teacher_id).toLowerCase();
    
    // Search Query Filter
    const matchesSearch = 
      schoolName.includes(searchQuery.toLowerCase()) || 
      teacherName.includes(searchQuery.toLowerCase());

    // Cluster Frontend Filter (if the backend API doesn't support cluster_id directly)
    const schoolObj = schools.find(s => s.id === session.school_id);
    const matchesCluster = filterCluster === 'All' || schoolObj?.cluster_id?.toString() === filterCluster;

    return matchesSearch && matchesCluster;
  });

  // Pagination Logic
  const totalPages = Math.ceil(processedSessions.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentSessions = processedSessions.slice(indexOfFirstItem, indexOfLastItem);

  const handlePrevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));
  const handleNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto min-h-screen bg-[#fafafa] text-slate-800 font-sans">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-1 rounded-full bg-cyan-100 text-cyan-700 text-xs font-bold tracking-wider uppercase flex items-center gap-1.5">
              <Activity size={14} /> Tracking & Telemetry
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">
            Session Monitoring
          </h1>
          <p className="text-slate-500 mt-1 font-medium">Read-only view of all lessons conducted and logged by teachers.</p>
        </div>
      </div>

      {/* MAIN CONTENT CARD */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
        
        {/* Filters & Toolbar */}
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 space-y-4">
          
          {/* Top Row: Search & Date Range */}
          <div className="flex flex-col xl:flex-row justify-between items-center gap-4">
            <div className="relative w-full xl:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search by teacher or school name..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent w-full bg-white transition-shadow"
              />
            </div>

            <div className="flex items-center gap-2 w-full xl:w-auto">
              <Calendar className="text-slate-400 shrink-0" size={18} />
              <input 
                type="date" 
                value={dateRange.start}
                onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                className="px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 w-full xl:w-auto text-slate-600 font-medium"
              />
              <span className="text-slate-400 font-medium text-sm">to</span>
              <input 
                type="date" 
                value={dateRange.end}
                onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                className="px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 w-full xl:w-auto text-slate-600 font-medium"
              />
            </div>
          </div>

          {/* Bottom Row: Dropdown Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <select 
                value={filterCluster} onChange={handleClusterChange}
                disabled={loadingBaseData}
                className="pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 w-full bg-white appearance-none font-medium text-slate-600 truncate disabled:bg-slate-50"
              >
                <option value="All">All Clusters</option>
                {clusters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div className="relative">
              <SchoolIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <select 
                value={filterSchool} onChange={handleSchoolChange}
                disabled={loadingBaseData}
                className="pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 w-full bg-white appearance-none font-medium text-slate-600 truncate disabled:bg-slate-50"
              >
                <option value="All">All Schools</option>
                {availableSchools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>

            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <select 
                value={filterTeacher} onChange={(e) => setFilterTeacher(e.target.value)}
                disabled={loadingBaseData}
                className="pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 w-full bg-white appearance-none font-medium text-slate-600 truncate disabled:bg-slate-50"
              >
                <option value="All">All Teachers</option>
                {availableTeachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>

            <div className="relative">
              <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <select 
                value={filterHabit} onChange={(e) => setFilterHabit(e.target.value)}
                disabled={loadingBaseData}
                className="pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 w-full bg-white appearance-none font-medium text-slate-600 truncate disabled:bg-slate-50"
              >
                <option value="All">All Habits</option>
                {habits.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
              </select>
            </div>
          </div>

        </div>

        {/* DATA TABLE */}
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Institution</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Teacher</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Habit Executed</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Class / Section</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Date & Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loadingSessions || loadingBaseData ? (
                // LOADING SKELETON
                [...Array(5)].map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-48 mb-1"></div><div className="h-3 bg-slate-100 rounded w-24"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-32"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-40"></div></td>
                    <td className="px-6 py-4"><div className="h-6 w-16 bg-slate-200 rounded-full"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-32"></div></td>
                  </tr>
                ))
              ) : currentSessions.length === 0 ? (
                // EMPTY STATE
                <tr>
                  <td colSpan="5" className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <Activity size={48} className="mb-4 opacity-20" />
                      <p className="text-lg font-semibold text-slate-600">No lesson sessions recorded yet.</p>
                      <p className="text-sm mt-1">Adjust your filters or wait for teachers to log activity.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                // ACTUAL DATA
                currentSessions.map((session) => (
                  <tr key={session.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800">{getSchoolName(session.school_id)}</div>
                      <div className="text-xs font-medium text-slate-400 mt-1 flex items-center gap-1">
                        <MapPin size={12} className="text-cyan-500" /> {getClusterBySchool(session.school_id)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-700 flex items-center gap-1.5">
                        <User size={14} className="text-slate-400" />
                        {getTeacherName(session.teacher_id)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-700">
                        {getHabitName(session.habit_id)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-cyan-50 text-cyan-700 font-bold text-xs border border-cyan-100">
                        Class {session.class_number} {session.section && ` - Sec ${session.section}`}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                        <Calendar size={14} className="text-slate-400" />
                        {new Date(session.created_at || Date.now()).toLocaleDateString('en-US', {
                          year: 'numeric', month: 'short', day: 'numeric'
                        })}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400 mt-1">
                        <Clock size={12} className="text-slate-400" />
                        {new Date(session.created_at || Date.now()).toLocaleTimeString('en-US', {
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        {!loadingSessions && processedSessions.length > 0 && (
          <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">
              Showing <strong className="text-slate-800">{indexOfFirstItem + 1}</strong> to <strong className="text-slate-800">{Math.min(indexOfLastItem, processedSessions.length)}</strong> of <strong className="text-slate-800">{processedSessions.length}</strong> entries
            </span>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              
              <div className="px-4 py-1.5 rounded-lg border border-cyan-200 bg-cyan-50 text-cyan-700 font-bold text-sm">
                Page {currentPage} of {totalPages}
              </div>

              <button 
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Sessions;
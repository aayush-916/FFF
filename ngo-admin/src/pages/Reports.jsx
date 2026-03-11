import { useState, useEffect, useMemo } from 'react';
import { 
  BarChart2, 
  Download, 
  Filter, 
  MapPin, 
  School as SchoolIcon, 
  Calendar,
  FileSpreadsheet,
  FileText,
  Activity,
  Users,
  CheckCircle,
  PieChart as PieChartIcon
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import api from '../api/axios';

const Reports = () => {
  // Raw Data States
  const [sessions, setSessions] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [schools, setSchools] = useState([]);
  const [clusters, setClusters] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [habits, setHabits] = useState([]);
  const [domains, setDomains] = useState([]);
  
  const [loading, setLoading] = useState(true);
  
  // UI States
  const [activeTab, setActiveTab] = useState('school');
  
  // Filter States
  const [filterCluster, setFilterCluster] = useState('All');
  const [filterSchool, setFilterSchool] = useState('All');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  // Fetch all required data
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const [
          sessionsRes, 
          assessmentsRes, 
          schoolsRes, 
          clustersRes, 
          usersRes,
          habitsRes,
          domainsRes
        ] = await Promise.all([
          api.get('/sessions'),
          api.get('/assessments'),
          api.get('/schools'),
          api.get('/clusters'),
          api.get('/users'),
          api.get('/habits'),
          api.get('/domains')
        ]);

        setSessions(sessionsRes.data.data || sessionsRes.data);
        setAssessments(assessmentsRes.data.data || assessmentsRes.data);
        setSchools(schoolsRes.data.data || schoolsRes.data);
        setClusters(clustersRes.data.data || clustersRes.data);
        setHabits(habitsRes.data.data || habitsRes.data);
        setDomains(domainsRes.data.data || domainsRes.data);
        
        const allUsers = usersRes.data.data || usersRes.data;
        setTeachers(allUsers.filter(u => u.role === 'teacher'));

      } catch (error) {
        console.error('Failed to load report data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // --- DATA PROCESSING & AGGREGATION ---
  
  // 1. Apply Base Filters to Sessions & Assessments
  const filteredSessions = useMemo(() => {
    return sessions.filter(session => {
      const school = schools.find(s => s.id === session.school_id);
      const matchesCluster = filterCluster === 'All' || school?.cluster_id?.toString() === filterCluster;
      const matchesSchool = filterSchool === 'All' || session.school_id?.toString() === filterSchool;
      
      let matchesDate = true;
      const sessionDate = new Date(session.created_at || Date.now());
      if (dateRange.start) matchesDate = matchesDate && sessionDate >= new Date(dateRange.start);
      if (dateRange.end) {
        const endDate = new Date(dateRange.end);
        endDate.setHours(23, 59, 59, 999);
        matchesDate = matchesDate && sessionDate <= endDate;
      }

      return matchesCluster && matchesSchool && matchesDate;
    });
  }, [sessions, schools, filterCluster, filterSchool, dateRange]);

  const filteredAssessments = useMemo(() => {
    return assessments.filter(assessment => {
      const school = schools.find(s => s.id === assessment.school_id);
      const matchesCluster = filterCluster === 'All' || school?.cluster_id?.toString() === filterCluster;
      const matchesSchool = filterSchool === 'All' || assessment.school_id?.toString() === filterSchool;
      return matchesCluster && matchesSchool;
    });
  }, [assessments, schools, filterCluster, filterSchool]);

  // 2. Aggregate Data for Tabs
  const schoolPerformanceData = useMemo(() => {
    return schools
      .filter(s => filterCluster === 'All' || s.cluster_id?.toString() === filterCluster)
      .filter(s => filterSchool === 'All' || s.id?.toString() === filterSchool)
      .map(school => {
        const cluster = clusters.find(c => c.id === school.cluster_id);
        const schoolSessions = filteredSessions.filter(s => s.school_id === school.id);
        const schoolTeachers = teachers.filter(t => t.school_id === school.id);
        const uniqueHabits = new Set(schoolSessions.map(s => s.habit_id)).size;
        
        // Get latest assessment for this school
        const schoolAssessments = filteredAssessments.filter(a => a.school_id === school.id);
        const latestAssessment = schoolAssessments.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];

        return {
          id: school.id,
          schoolName: school.name,
          clusterName: cluster ? cluster.name : 'Unassigned',
          totalSessions: schoolSessions.length,
          totalTeachers: schoolTeachers.length,
          habitsCovered: uniqueHabits,
          score: latestAssessment ? latestAssessment.total_score : 'N/A',
          recognition: latestAssessment ? latestAssessment.recognition_level : 'Unranked'
        };
      });
  }, [schools, clusters, filteredSessions, teachers, filteredAssessments, filterCluster, filterSchool]);

  const clusterPerformanceData = useMemo(() => {
    return clusters
      .filter(c => filterCluster === 'All' || c.id?.toString() === filterCluster)
      .map(cluster => {
        const clusterSchools = schools.filter(s => s.cluster_id === cluster.id);
        const clusterSchoolIds = clusterSchools.map(s => s.id);
        const clusterSessions = filteredSessions.filter(s => clusterSchoolIds.includes(s.school_id));
        
        let totalScore = 0;
        let scoreCount = 0;
        let gold = 0, silver = 0, bronze = 0;

        clusterSchools.forEach(school => {
          const schoolAssessments = filteredAssessments.filter(a => a.school_id === school.id);
          const latest = schoolAssessments.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
          if (latest && latest.total_score) {
            totalScore += latest.total_score;
            scoreCount++;
            if (latest.recognition_level?.toLowerCase() === 'gold') gold++;
            if (latest.recognition_level?.toLowerCase() === 'silver') silver++;
            if (latest.recognition_level?.toLowerCase() === 'bronze') bronze++;
          }
        });

        return {
          id: cluster.id,
          clusterName: cluster.name,
          totalSchools: clusterSchools.length,
          totalSessions: clusterSessions.length,
          avgScore: scoreCount > 0 ? Math.round(totalScore / scoreCount) : 'N/A',
          gold, silver, bronze
        };
      });
  }, [clusters, schools, filteredSessions, filteredAssessments, filterCluster]);

  const teacherEngagementData = useMemo(() => {
    return teachers
      .filter(t => {
        const school = schools.find(s => s.id === t.school_id);
        const matchesCluster = filterCluster === 'All' || school?.cluster_id?.toString() === filterCluster;
        const matchesSchool = filterSchool === 'All' || t.school_id?.toString() === filterSchool;
        return matchesCluster && matchesSchool;
      })
      .map(teacher => {
        const school = schools.find(s => s.id === teacher.school_id);
        const teacherSessions = filteredSessions.filter(s => s.teacher_id === teacher.id);
        const uniqueHabits = new Set(teacherSessions.map(s => s.habit_id)).size;
        
        const latestSession = teacherSessions.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];

        return {
          id: teacher.id,
          teacherName: teacher.name,
          schoolName: school ? school.name : 'Unknown',
          sessionsConducted: teacherSessions.length,
          habitsCovered: uniqueHabits,
          lastSession: latestSession ? new Date(latestSession.created_at).toLocaleDateString() : 'No Sessions'
        };
      });
  }, [teachers, schools, filteredSessions, filterCluster, filterSchool]);

  const habitCompletionData = useMemo(() => {
    return habits.map(habit => {
      const domain = domains.find(d => d.id === habit.domain_id);
      const habitSessions = filteredSessions.filter(s => s.habit_id === habit.id);
      const uniqueSchools = new Set(habitSessions.map(s => s.school_id)).size;

      return {
        id: habit.id,
        habitName: habit.name,
        domainName: domain ? domain.name : 'Unknown',
        sessionsConducted: habitSessions.length,
        schoolsCovered: uniqueSchools
      };
    }).filter(h => h.sessionsConducted > 0 || filterSchool === 'All'); // Hide unused habits if filtering by specific school
  }, [habits, domains, filteredSessions, filterSchool]);

  // 3. Chart Data
  const pieChartData = useMemo(() => {
    let gold = 0, silver = 0, bronze = 0, unranked = 0;
    schoolPerformanceData.forEach(s => {
      const rec = s.recognition?.toLowerCase();
      if (rec === 'gold') gold++;
      else if (rec === 'silver') silver++;
      else if (rec === 'bronze') bronze++;
      else unranked++;
    });
    return [
      { name: 'Gold', value: gold, color: '#F59E0B' },
      { name: 'Silver', value: silver, color: '#94A3B8' },
      { name: 'Bronze', value: bronze, color: '#D97706' },
      { name: 'Unranked', value: unranked, color: '#E2E8F0' }
    ].filter(d => d.value > 0);
  }, [schoolPerformanceData]);

  const barChartData = useMemo(() => {
    return clusterPerformanceData.map(c => ({
      name: c.clusterName,
      Sessions: c.totalSessions
    })).sort((a, b) => b.Sessions - a.Sessions).slice(0, 10); // Top 10 clusters
  }, [clusterPerformanceData]);

  // --- EXPORT LOGIC ---
  const exportToCSV = () => {
    let dataToExport = [];
    let headers = [];

    if (activeTab === 'school') {
      headers = ['School', 'Cluster', 'Total Sessions', 'Total Teachers', 'Habits Covered', 'Wellbeing Score', 'Recognition'];
      dataToExport = schoolPerformanceData.map(d => [d.schoolName, d.clusterName, d.totalSessions, d.totalTeachers, d.habitsCovered, d.score, d.recognition]);
    } else if (activeTab === 'cluster') {
      headers = ['Cluster', 'Total Schools', 'Total Sessions', 'Avg Score', 'Gold', 'Silver', 'Bronze'];
      dataToExport = clusterPerformanceData.map(d => [d.clusterName, d.totalSchools, d.totalSessions, d.avgScore, d.gold, d.silver, d.bronze]);
    } else if (activeTab === 'teacher') {
      headers = ['Teacher', 'School', 'Sessions Conducted', 'Habits Covered', 'Last Session Date'];
      dataToExport = teacherEngagementData.map(d => [d.teacherName, d.schoolName, d.sessionsConducted, d.habitsCovered, d.lastSession]);
    } else if (activeTab === 'habit') {
      headers = ['Habit', 'Domain', 'Sessions Conducted', 'Schools Covered'];
      dataToExport = habitCompletionData.map(d => [d.habitName, d.domainName, d.sessionsConducted, d.schoolsCovered]);
    }

    const csvContent = [
      headers.join(','),
      ...dataToExport.map(row => row.map(item => `"${item}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `NGO_Report_${activeTab}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto min-h-screen bg-[#fafafa] text-slate-800 font-sans">
      
      {/* HEADER & EXPORT */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold tracking-wider uppercase flex items-center gap-1.5">
              <BarChart2 size={14} /> Analytics
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">
            Program Reports
          </h1>
          <p className="text-slate-500 mt-1 font-medium">Comprehensive insights into curriculum adoption and school performance.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={exportToCSV}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-semibold shadow-sm transition-all duration-200"
          >
            <FileSpreadsheet size={18} className="text-emerald-600" />
            Export CSV
          </button>
          <button 
            onClick={exportToCSV}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-sm shadow-indigo-200 transition-all duration-200"
          >
            <Download size={18} />
            Export Excel
          </button>
        </div>
      </div>

      {/* FILTERS */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm mb-6 flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2 text-slate-500 font-bold text-sm mr-2 uppercase tracking-wider">
          <Filter size={16} /> Filters:
        </div>
        
        <div className="relative w-full sm:w-auto">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <select 
            value={filterCluster} 
            onChange={(e) => { setFilterCluster(e.target.value); setFilterSchool('All'); }}
            className="pl-9 pr-8 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 bg-slate-50 font-medium text-slate-700"
          >
            <option value="All">All Clusters</option>
            {clusters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div className="relative w-full sm:w-auto">
          <SchoolIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <select 
            value={filterSchool} onChange={(e) => setFilterSchool(e.target.value)}
            className="pl-9 pr-8 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 bg-slate-50 font-medium text-slate-700"
          >
            <option value="All">All Schools</option>
            {schools.filter(s => filterCluster === 'All' || s.cluster_id?.toString() === filterCluster)
                    .map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
          <Calendar className="text-slate-400 shrink-0" size={16} />
          <input 
            type="date" value={dateRange.start} onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
            className="bg-transparent text-sm focus:outline-none text-slate-700 font-medium w-full sm:w-auto"
          />
          <span className="text-slate-400 font-medium text-sm">to</span>
          <input 
            type="date" value={dateRange.end} onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
            className="bg-transparent text-sm focus:outline-none text-slate-700 font-medium w-full sm:w-auto"
          />
        </div>
      </div>

      {/* CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Pie Chart */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-6">
            <PieChartIcon className="text-indigo-500" size={20} /> Recognition Distribution
          </h3>
          <div className="h-64">
            {pieChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieChartData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {pieChartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                  <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm font-medium">No assessment data available</div>
            )}
          </div>
        </div>

        {/* Bar Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-6">
            <Activity className="text-indigo-500" size={20} /> Sessions by Cluster
          </h3>
          <div className="h-64">
            {barChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <RechartsTooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="Sessions" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm font-medium">No session data available</div>
            )}
          </div>
        </div>
      </div>

      {/* TABS NAVIGATION */}
      <div className="flex overflow-x-auto hide-scrollbar border-b border-slate-200 mb-6 gap-6">
        {[
          { id: 'school', label: 'School Performance', icon: SchoolIcon },
          { id: 'cluster', label: 'Cluster Performance', icon: MapPin },
          { id: 'teacher', label: 'Teacher Engagement', icon: Users },
          { id: 'habit', label: 'Habit Completion', icon: CheckCircle }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 pb-4 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.id 
                ? 'border-indigo-600 text-indigo-700' 
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <tab.icon size={16} /> {tab.label}
          </button>
        ))}
      </div>

      {/* TAB CONTENT (DATA TABLES) */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] overflow-hidden min-h-[400px]">
        {loading ? (
           <div className="flex flex-col items-center justify-center h-64 text-slate-400">
             <Activity size={32} className="animate-bounce mb-4" />
             <p className="font-medium">Generating reports...</p>
           </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              
              {/* --- SCHOOL TAB --- */}
              {activeTab === 'school' && (
                <>
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                      <th className="px-6 py-4">School</th>
                      <th className="px-6 py-4">Cluster</th>
                      <th className="px-6 py-4 text-center">Total Sessions</th>
                      <th className="px-6 py-4 text-center">Total Teachers</th>
                      <th className="px-6 py-4 text-center">Habits Covered</th>
                      <th className="px-6 py-4 text-center">Wellbeing Score</th>
                      <th className="px-6 py-4 text-center">Recognition</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {schoolPerformanceData.length === 0 ? <EmptyRow cols={7} /> : schoolPerformanceData.map(row => (
                      <tr key={row.id} className="hover:bg-slate-50/80">
                        <td className="px-6 py-4 font-bold text-slate-800">{row.schoolName}</td>
                        <td className="px-6 py-4 font-medium text-slate-500">{row.clusterName}</td>
                        <td className="px-6 py-4 text-center font-bold text-indigo-600">{row.totalSessions}</td>
                        <td className="px-6 py-4 text-center font-medium text-slate-700">{row.totalTeachers}</td>
                        <td className="px-6 py-4 text-center font-medium text-slate-700">{row.habitsCovered}</td>
                        <td className="px-6 py-4 text-center font-bold text-emerald-600">{row.score}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${getRecognitionColor(row.recognition)}`}>
                            {row.recognition}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </>
              )}

              {/* --- CLUSTER TAB --- */}
              {activeTab === 'cluster' && (
                <>
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                      <th className="px-6 py-4">Cluster</th>
                      <th className="px-6 py-4 text-center">Total Schools</th>
                      <th className="px-6 py-4 text-center">Total Sessions</th>
                      <th className="px-6 py-4 text-center">Average Score</th>
                      <th className="px-6 py-4 text-center">Gold Schools</th>
                      <th className="px-6 py-4 text-center">Silver Schools</th>
                      <th className="px-6 py-4 text-center">Bronze Schools</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {clusterPerformanceData.length === 0 ? <EmptyRow cols={7} /> : clusterPerformanceData.map(row => (
                      <tr key={row.id} className="hover:bg-slate-50/80">
                        <td className="px-6 py-4 font-bold text-slate-800">{row.clusterName}</td>
                        <td className="px-6 py-4 text-center font-medium text-slate-700">{row.totalSchools}</td>
                        <td className="px-6 py-4 text-center font-bold text-indigo-600">{row.totalSessions}</td>
                        <td className="px-6 py-4 text-center font-bold text-emerald-600">{row.avgScore}</td>
                        <td className="px-6 py-4 text-center font-bold text-yellow-600">{row.gold}</td>
                        <td className="px-6 py-4 text-center font-bold text-slate-500">{row.silver}</td>
                        <td className="px-6 py-4 text-center font-bold text-orange-600">{row.bronze}</td>
                      </tr>
                    ))}
                  </tbody>
                </>
              )}

              {/* --- TEACHER TAB --- */}
              {activeTab === 'teacher' && (
                <>
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                      <th className="px-6 py-4">Teacher Name</th>
                      <th className="px-6 py-4">Assigned School</th>
                      <th className="px-6 py-4 text-center">Sessions Conducted</th>
                      <th className="px-6 py-4 text-center">Habits Covered</th>
                      <th className="px-6 py-4">Last Session Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {teacherEngagementData.length === 0 ? <EmptyRow cols={5} /> : teacherEngagementData.map(row => (
                      <tr key={row.id} className="hover:bg-slate-50/80">
                        <td className="px-6 py-4 font-bold text-slate-800">{row.teacherName}</td>
                        <td className="px-6 py-4 font-medium text-slate-500">{row.schoolName}</td>
                        <td className="px-6 py-4 text-center font-bold text-indigo-600">{row.sessionsConducted}</td>
                        <td className="px-6 py-4 text-center font-medium text-slate-700">{row.habitsCovered}</td>
                        <td className="px-6 py-4 font-medium text-slate-500">{row.lastSession}</td>
                      </tr>
                    ))}
                  </tbody>
                </>
              )}

              {/* --- HABIT TAB --- */}
              {activeTab === 'habit' && (
                <>
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                      <th className="px-6 py-4">Habit Name</th>
                      <th className="px-6 py-4">Domain</th>
                      <th className="px-6 py-4 text-center">Sessions Conducted</th>
                      <th className="px-6 py-4 text-center">Schools Covered</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {habitCompletionData.length === 0 ? <EmptyRow cols={4} /> : habitCompletionData.map(row => (
                      <tr key={row.id} className="hover:bg-slate-50/80">
                        <td className="px-6 py-4 font-bold text-slate-800">{row.habitName}</td>
                        <td className="px-6 py-4 font-medium text-slate-500">{row.domainName}</td>
                        <td className="px-6 py-4 text-center font-bold text-indigo-600">{row.sessionsConducted}</td>
                        <td className="px-6 py-4 text-center font-medium text-slate-700">{row.schoolsCovered}</td>
                      </tr>
                    ))}
                  </tbody>
                </>
              )}

            </table>
          </div>
        )}
      </div>

    </div>
  );
};

// Helper components & functions
const EmptyRow = ({ cols }) => (
  <tr>
    <td colSpan={cols} className="px-6 py-16 text-center">
      <div className="flex flex-col items-center justify-center text-slate-400">
        <FileText size={48} className="mb-4 opacity-20" />
        <p className="text-lg font-semibold text-slate-600">No data available for these filters.</p>
        <p className="text-sm mt-1">Try adjusting your search criteria or date range.</p>
      </div>
    </td>
  </tr>
);

const getRecognitionColor = (level) => {
  const l = level?.toLowerCase();
  if (l === 'gold') return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  if (l === 'silver') return 'bg-slate-100 text-slate-700 border-slate-300';
  if (l === 'bronze') return 'bg-orange-100 text-orange-800 border-orange-200';
  return 'bg-slate-50 text-slate-500 border-slate-200';
};

export default Reports;
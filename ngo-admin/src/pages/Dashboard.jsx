import { useState, useEffect } from 'react';
import { 
  School, 
  Users, 
  Activity, 
  BookOpen, 
  Award,
  TrendingUp,
  Download,
  AlertCircle,
  CheckCircle2,
  Clock,
  Sparkles
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis
} from 'recharts';
import api from '../api/axios';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await api.get('/dashboard/ngo');
        setData(response.data);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading || !data) {
    return (
      <div className="p-8 min-h-screen bg-[#fafafa] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 animate-pulse text-slate-400">
          <Activity size={32} className="animate-bounce" />
          <p className="text-sm font-medium tracking-widest uppercase">Loading System Data...</p>
        </div>
      </div>
    );
  }

  // --- DERIVED METRICS (Adding details without faking backend data) ---
  const totalRanked = data.bronzeSchools + data.silverSchools + data.goldSchools;
  const pendingAssessments = data.totalSchools - totalRanked;
  const avgTeachersPerSchool = data.totalSchools ? (data.totalTeachers / data.totalSchools).toFixed(1) : 0;
  const avgSessionsPerSchool = data.totalSchools ? (data.totalSessions / data.totalSchools).toFixed(1) : 0;
  
  // Data for the Donut Chart
  const recognitionData = [
    { name: 'Gold', value: data.goldSchools, color: '#F59E0B', bg: 'bg-amber-100', text: 'text-amber-700' },
    { name: 'Silver', value: data.silverSchools, color: '#94A3B8', bg: 'bg-slate-200', text: 'text-slate-700' },
    { name: 'Bronze', value: data.bronzeSchools, color: '#B45309', bg: 'bg-orange-100', text: 'text-orange-800' },
  ];

  // --- EXPORT LOGIC ---
  const exportDashboardToCSV = () => {
    if (!data) return;

    // Prepare data rows in a key-value format for the dashboard overview
    const csvRows = [
      ['Dashboard Metric', 'Value'],
      ['Total Schools', data.totalSchools],
      ['Active Teachers', data.totalTeachers],
      ['Sessions Logged', data.totalSessions],
      ['Content Library (Lessons)', data.totalLessons],
      ['Global Habit Completion (%)', data.habitCompletion],
      ['Gold Recognition Schools', data.goldSchools],
      ['Silver Recognition Schools', data.silverSchools],
      ['Bronze Recognition Schools', data.bronzeSchools],
      ['Total Ranked Schools', totalRanked],
      ['Pending Assessments', pendingAssessments],
      ['Average Teachers per School', avgTeachersPerSchool],
      ['Average Sessions per School', avgSessionsPerSchool],
    ];

    // Convert array to CSV string
    const csvContent = csvRows.map(row => row.join(',')).join('\n');
    
    // Create a Blob and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `NGO_Dashboard_Overview_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto min-h-screen bg-[#fafafa] text-slate-800 font-sans selection:bg-indigo-100">
      
      {/* --- PREMIUM HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold tracking-wider uppercase flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
              Live System Status
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">
            Program Overview
          </h1>
          <p className="text-slate-500 mt-1 font-medium">Real-time telemetry of the NGO Wellbeing Initiative.</p>
        </div>
        <button 
          onClick={exportDashboardToCSV}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl font-semibold shadow-sm transition-all duration-200 group"
        >
          <Download size={18} className="text-slate-400 group-hover:text-indigo-500 transition-colors" />
          Export Report
        </button>
      </div>

      {/* --- BENTO GRID LAYOUT --- */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

        {/* TOP ROW: KPI CARDS (Spanning 3 cols each) */}
        {[
          { title: 'Total Schools', value: data.totalSchools, sub: `${pendingAssessments} assessments pending`, icon: School, color: 'text-blue-600', bg: 'bg-blue-50' },
          { title: 'Active Teachers', value: data.totalTeachers, sub: `~${avgTeachersPerSchool} teachers per school`, icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { title: 'Sessions Logged', value: data.totalSessions, sub: `~${avgSessionsPerSchool} sessions per school`, icon: Activity, color: 'text-violet-600', bg: 'bg-violet-50' },
          { title: 'Content Library', value: data.totalLessons, sub: `Across all learning domains`, icon: BookOpen, color: 'text-rose-600', bg: 'bg-rose-50' }
        ].map((kpi, idx) => (
          <div key={idx} className="col-span-1 md:col-span-6 xl:col-span-3 bg-white p-6 rounded-3xl border border-slate-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)] transition-all duration-300 group relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500">
              <kpi.icon size={64} className={kpi.color} />
            </div>
            <div className="relative z-10">
              <div className={`w-12 h-12 rounded-2xl ${kpi.bg} ${kpi.color} flex items-center justify-center mb-6 shadow-sm`}>
                <kpi.icon size={24} strokeWidth={2.5} />
              </div>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">{kpi.title}</p>
              <h3 className="text-4xl font-extrabold text-slate-800 mt-1 mb-2 tracking-tight">{kpi.value.toLocaleString()}</h3>
              <p className="text-sm font-medium text-slate-500 flex items-center gap-1.5">
                <TrendingUp size={14} className="text-emerald-500" />
                {kpi.sub}
              </p>
            </div>
          </div>
        ))}

        {/* MIDDLE ROW: HABIT ADOPTION (Span 8) & RECOGNITION (Span 4) */}
        
        {/* Habit Completion Showcase */}
        <div className="col-span-1 md:col-span-12 xl:col-span-8 bg-white p-8 rounded-3xl border border-slate-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] relative overflow-hidden">
          {/* Decorative background gradient */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                  Habit Mastery Adoption
                </h2>
                <p className="text-slate-500 mt-1 font-medium">Aggregated completion rate across all active student cohorts.</p>
              </div>
              <div className="bg-indigo-50 border border-indigo-100 text-indigo-700 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
                <CheckCircle2 size={16} /> Target: 100%
              </div>
            </div>

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-baseline gap-2">
                <span className="text-7xl font-black text-slate-800 tracking-tighter">
                  {data.habitCompletion}
                </span>
                <span className="text-3xl font-bold text-slate-400">%</span>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Status</p>
                <p className={`text-lg font-bold ${data.habitCompletion >= 75 ? 'text-emerald-500' : 'text-amber-500'}`}>
                  {data.habitCompletion >= 75 ? 'Excellent Progress' : 'Needs Attention'}
                </p>
              </div>
            </div>

            {/* Ultra-Premium Segmented Progress Bar */}
            <div className="w-full mt-4">
              <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 transition-all duration-1000 relative"
                  style={{ width: `${data.habitCompletion}%` }}
                >
                  <div className="absolute top-0 right-0 bottom-0 left-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0.15)_75%,transparent_75%,transparent)] bg-[length:1rem_1rem] animate-[progress_1s_linear_infinite]"></div>
                </div>
              </div>
              <div className="flex justify-between text-sm font-bold text-slate-400 mt-3 px-1">
                <span>0%</span>
                <span>25%</span>
                <span>50%</span>
                <span>75%</span>
                <span>100%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recognition Levels */}
        <div className="col-span-1 md:col-span-12 xl:col-span-4 bg-white p-8 rounded-3xl border border-slate-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex flex-col">
          <h2 className="text-xl font-bold text-slate-800 mb-1">Recognition Tiers</h2>
          <p className="text-slate-500 text-sm font-medium mb-6">Based on wellbeing self-assessments.</p>

          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="h-48 w-full relative mb-6">
              {totalRanked > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={recognitionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                      cornerRadius={8}
                    >
                      {recognitionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      cursor={false}
                      contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', border: 'none', color: '#fff', fontWeight: 'bold' }}
                      itemStyle={{ color: '#fff' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full w-full flex items-center justify-center border-2 border-dashed border-slate-200 rounded-full">
                  <p className="text-slate-400 font-medium">No Data Yet</p>
                </div>
              )}
              
              {/* Center Donut Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-black text-slate-800">{totalRanked}</span>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ranked</span>
              </div>
            </div>

            {/* Sleek Tiers List */}
            <div className="w-full space-y-2">
              {recognitionData.map((tier) => (
                <div key={tier.name} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: tier.color }}></div>
                    <span className="font-bold text-slate-700">{tier.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-black text-slate-800">{tier.value}</span>
                    <span className="text-xs font-bold text-slate-400 w-10 text-right">
                      {totalRanked > 0 ? Math.round((tier.value / totalRanked) * 100) : 0}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* BOTTOM ROW: SYSTEM INSIGHTS (Derived intelligence) */}
        <div className="col-span-1 md:col-span-12 bg-indigo-900 rounded-3xl p-8 relative overflow-hidden shadow-lg">
          {/* Abstract graphic */}
          <div className="absolute right-0 top-0 w-1/2 h-full opacity-10 pointer-events-none">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full fill-current text-white"><polygon points="0,100 100,0 100,100"/></svg>
          </div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
            <div className="p-4 bg-indigo-800 rounded-2xl">
              <Sparkles size={32} className="text-indigo-300" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-white mb-2">System Insights & Action Items</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 bg-indigo-800/50 p-4 rounded-xl backdrop-blur-sm border border-indigo-700/50">
                  <AlertCircle size={20} className="text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-indigo-100 font-medium text-sm">
                      <strong className="text-white">Action Required:</strong> {pendingAssessments} out of {data.totalSchools} schools have not completed their baseline wellbeing assessment.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-indigo-800/50 p-4 rounded-xl backdrop-blur-sm border border-indigo-700/50">
                  <Activity size={20} className="text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-indigo-100 font-medium text-sm">
                      <strong className="text-white">Engagement Ratio:</strong> The system is currently averaging {avgSessionsPerSchool} session records per onboarded school.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
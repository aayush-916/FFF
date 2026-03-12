import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, BookOpen, CheckCircle, TrendingUp, Activity, Layers } from 'lucide-react';
import api from '../../services/api';

const SchoolDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  // 2. Initialize navigate
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await api.get('/dashboard/school');
        const dashboardData = response.data.data || response.data;
        setData(dashboardData);

        // 3. ONBOARDING CHECK: Are there any classes?
        // We make a quick call to the classes endpoint to check. 
        // If it returns an empty array, they are brand new!
        const classRes = await api.get('/school/classes').catch(() => ({ data: [] }));
        const existingClasses = classRes.data.data || classRes.data || [];
        
        if (existingClasses.length === 0) {
          // Redirect them to the classes page and tell it to open the modal
          navigate('/admin/classes?setup=true');
        }

      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [navigate]);

  if (loading) return <div className="p-8 text-center text-gray-500 animate-pulse">Loading school data...</div>;


  return (
    <div className="space-y-6 pb-10 max-w-6xl mx-auto">
      
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">School Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Global overview of your school's wellbeing program.</p>
      </div>

      {/* 4 MAIN METRICS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center transition-shadow hover:shadow-md">
          <Users className="h-6 w-6 text-blue-500 mb-2" />
          <p className="text-[10px] sm:text-xs text-gray-500 font-bold uppercase tracking-wider">Total Teachers</p>
          <p className="text-2xl font-black text-gray-900">{data?.totalTeachers || 0}</p> 
        </div>
        
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center transition-shadow hover:shadow-md">
          <Activity className="h-6 w-6 text-green-500 mb-2" />
          <p className="text-[10px] sm:text-xs text-gray-500 font-bold uppercase tracking-wider">Total Sessions</p>
          <p className="text-2xl font-black text-gray-900">{data?.totalSessions || 0}</p>
        </div>
        
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center transition-shadow hover:shadow-md">
          <BookOpen className="h-6 w-6 text-purple-500 mb-2" />
          <p className="text-[10px] sm:text-xs text-gray-500 font-bold uppercase tracking-wider">Lessons Completed</p>
          <p className="text-2xl font-black text-gray-900">{data?.lessonsCompleted || 0}</p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center transition-shadow hover:shadow-md">
          <TrendingUp className="h-6 w-6 text-orange-500 mb-2" />
          <p className="text-[10px] sm:text-xs text-gray-500 font-bold uppercase tracking-wider">Habit Completion</p>
          <p className="text-2xl font-black text-gray-900">{data?.overallHabitCompletion || 0}%</p>
        </div>
      </div>

      {/* CHARTS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* GRAPH 1: Lessons Completed by Class */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-500" /> Lessons Completed by Class
          </h3>
          <div className="space-y-5">
            
            {/* If there is real data, map through it */}
            {data?.classPerformance && data.classPerformance.length > 0 ? (
              data.classPerformance.map((item, index) => {
                const visualWidth = Math.min((item.completed / 20) * 100, 100); 
                
                return (
                  <div key={index} className="flex items-center gap-4">
                    <span className="w-16 text-xs font-bold text-gray-700">{item.name}</span>
                    <div className="flex-1 bg-blue-50/50 rounded-full h-3.5 overflow-hidden flex items-center">
                      <div 
                        className="h-full rounded-full bg-blue-500 transition-all duration-1000" 
                        style={{ width: `${visualWidth}%` }}
                      ></div>
                    </div>
                    <span className="w-8 text-right text-sm font-black text-gray-900">{item.completed}</span>
                  </div>
                );
              })
            ) : (
              // If the array is empty, show the empty state message!
              <div className="h-32 flex flex-col items-center justify-center text-gray-400">
                <BookOpen className="w-8 h-8 mb-2 opacity-50" />
                <p className="text-sm">No class data available yet.</p>
              </div>
            )}

          </div>
        </div>

        {/* GRAPH 2: Domain Progress (REAL DATA) */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-500" /> Domain Progress
          </h3>
          <div className="space-y-5">
            {data?.domainProgress && data.domainProgress.length > 0 ? (
              data.domainProgress.map((domain, index) => (
                <div key={index}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="font-bold text-gray-700 uppercase text-xs">{domain.domain}</span>
                    <span className="text-green-600 font-black">{domain.percentage}%</span>
                  </div>
                  <div className="w-full bg-green-50/50 rounded-full h-3.5 overflow-hidden">
                    <div 
                      className="bg-green-500 h-full rounded-full transition-all duration-1000" 
                      style={{ width: `${domain.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-32 flex flex-col items-center justify-center text-gray-400">
                <Activity className="w-8 h-8 mb-2 opacity-50" />
                <p className="text-sm">No domain data available yet.</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* RECENT SESSIONS ROW */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-purple-500" /> Recent School Activity
        </h3>
        <div className="space-y-2">
          {data?.recentSessions && data.recentSessions.length > 0 ? (
            data.recentSessions.map((session, index) => (
              <div key={index} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-xl border border-transparent hover:border-gray-100 transition-colors">
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">
                    {session.lesson_title || 'Unknown Lesson'}
                  </h4>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">
                    Class {session.class_number} &bull; Sec {session.section}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold tracking-wider text-purple-700 bg-purple-50 px-2 py-1 rounded-lg uppercase">
                    Conducted
                  </span>
                  <p className="text-[11px] font-bold text-gray-400 mt-2">
                    {new Date(session.created_at).toLocaleDateString('en-GB')}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500 text-center py-6">No recent sessions recorded.</p>
          )}
        </div>
      </div>

    </div>
  );
};

export default SchoolDashboard;
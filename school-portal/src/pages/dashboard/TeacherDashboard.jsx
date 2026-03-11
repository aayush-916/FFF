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
        
        // Directly target the inner "data" object where your stats live
        const dashboardData = response.data.data || response.data;
        setData(dashboardData);
        
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        setError("Failed to load dashboard data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse max-w-md mx-auto md:max-w-none">
        <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-6"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>)}
        </div>
        <div className="h-40 bg-gray-200 rounded-xl mt-6"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-xl text-center">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-md mx-auto md:max-w-none pb-6">
      
      {/* 1. Dashboard Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Teacher Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Track your teaching progress and start sessions quickly.</p>
      </div>

      {/* 2. Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm flex flex-col justify-center border border-gray-100">
          <Activity className="h-6 w-6 text-blue-500 mb-2" />
          <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Sessions Conducted</p>
          <p className="text-xl font-black text-gray-900">{data?.totalSessions || 0}</p>
        </div>
        
        <div className="bg-white p-4 rounded-xl shadow-sm flex flex-col justify-center border border-gray-100">
          <CheckCircle className="h-6 w-6 text-green-500 mb-2" />
          <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Lessons Completed</p>
          <p className="text-xl font-black text-gray-900">{data?.lessonsCompleted || 0}</p>
        </div>
        
        <div className="bg-white p-4 rounded-xl shadow-sm flex flex-col justify-center border border-gray-100">
          <BookOpen className="h-6 w-6 text-orange-500 mb-2" />
          <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Remaining Lessons</p>
          <p className="text-xl font-black text-gray-900">{data?.remainingLessons || 0}</p>
        </div>
        
        <div className="bg-white p-4 rounded-xl shadow-sm flex flex-col justify-center border border-gray-100">
          <Clock className="h-6 w-6 text-purple-500 mb-2" />
          <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Last Session</p>
          <p className="text-lg font-black text-gray-900 truncate">
            {data?.lastSession ? new Date(data.lastSession).toLocaleDateString('en-GB') : 'N/A'}
          </p>
        </div>
      </div>

      {/* 3. Suggested Next Lesson Card (If exists) */}
      {data?.suggestedLesson && (
        <div className="bg-blue-600 rounded-xl p-5 shadow-sm text-white">
          <div className="flex justify-between items-start mb-3">
            <div>
              <span className="inline-block px-2 py-1 bg-blue-500/50 rounded text-xs font-semibold uppercase tracking-wider mb-2">
                Suggested Next
              </span>
              <p className="text-blue-100 text-sm">{data.suggestedLesson.domain} &bull; {data.suggestedLesson.habit}</p>
              <h2 className="text-xl font-bold mt-1">{data.suggestedLesson.title}</h2>
            </div>
          </div>
          <p className="text-sm text-blue-100 mb-4 flex items-center gap-1">
            <Calendar className="w-4 h-4" /> Recommended for {data.suggestedLesson.targetClass}
          </p>
          <button 
            onClick={() => navigate('/sessions/start')}
            className="w-full bg-white text-blue-600 font-bold py-3 px-4 rounded-xl shadow-sm hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            Start Session <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* 4. Progress Section (If exists) */}
      {data?.domainProgress && data.domainProgress.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-gray-500" />
            <h3 className="text-lg font-bold text-gray-900">Domain Progress</h3>
          </div>
          <div className="space-y-4">
            {data.domainProgress.map((domain, index) => (
              <div key={index}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-700">{domain.name}</span>
                  <span className="text-gray-500">{domain.progress}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div 
                    className="bg-blue-500 h-2.5 rounded-full transition-all duration-500" 
                    style={{ width: `${domain.progress}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Recent Sessions List */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-3 px-1">Recent Sessions</h3>
        <div className="space-y-3">
          {data?.recentSessions && data.recentSessions.length > 0 ? (
            data.recentSessions.map((session, index) => (
              <div key={index} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center hover:bg-gray-50 transition-colors">
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">
                    {session.lesson_title || 'Unknown Lesson'}
                  </h4>
                  <p className="text-xs text-gray-500 mt-1 font-medium">
                    Class {session.class_number} &bull; Sec {session.section}
                  </p>
                </div>
                <div className="text-right flex flex-col items-end">
                  <span className="text-[10px] font-bold tracking-wider text-green-700 bg-green-50 px-2 py-1 rounded-lg uppercase">
                    Conducted
                  </span>
                  <p className="text-[11px] font-bold text-gray-400 mt-2">
                    {new Date(session.created_at).toLocaleDateString('en-GB')}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
              <p className="text-sm font-medium text-gray-500">No recent sessions found.</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default TeacherDashboard;
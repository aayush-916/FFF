import { useState, useEffect } from 'react';
import { Users, Activity, BookOpen, TrendingUp, Calendar, AlertCircle } from 'lucide-react';
import api from '../../services/api';

const SchoolDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await api.get('/dashboard/school');
        // Handle varying response structures securely
        setData(response.data.data || response.data);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        // If a teacher tries to access this and gets a 403, show a specific message
        if (err.response?.status === 403) {
          setError("Access Denied: Only School Administrators can view this dashboard.");
        } else {
          setError("Failed to load school analytics. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse max-w-md mx-auto md:max-w-none pb-8">
        <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-6"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-28 bg-white rounded-xl shadow-sm border border-gray-100"></div>)}
        </div>
        <div className="h-64 bg-white rounded-xl shadow-sm border border-gray-100 mt-6"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm flex items-start gap-2 border border-red-100 max-w-md mx-auto md:max-w-none">
        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
        <p className="font-medium">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-md mx-auto md:max-w-none pb-8">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">School Overview</h1>
        <p className="text-sm text-gray-500 mt-1">Track school-wide wellbeing program performance.</p>
      </div>

      {/* Metrics Grid (Mobile: 2 cols, Desktop: 4 cols) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center">
          <Users className="h-6 w-6 text-blue-500 mb-3" />
          <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Total Teachers</p>
          <p className="text-2xl font-black text-gray-900">{data?.totalTeachers || 0}</p>
        </div>
        
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center">
          <Activity className="h-6 w-6 text-green-500 mb-3" />
          <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Total Sessions</p>
          <p className="text-2xl font-black text-gray-900">{data?.totalSessions || 0}</p>
        </div>
        
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center">
          <BookOpen className="h-6 w-6 text-orange-500 mb-3" />
          <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Total Lessons</p>
          <p className="text-2xl font-black text-gray-900">{data?.totalLessons || 0}</p>
        </div>
        
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center">
          <TrendingUp className="h-6 w-6 text-purple-500 mb-3" />
          <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Habit Completion</p>
          <p className="text-2xl font-black text-gray-900">{data?.habitCompletion || 0}%</p>
        </div>
      </div>

      {/* Recent Sessions List */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4 px-1">Recent Sessions</h2>
        <div className="space-y-3">
          {data?.recentSessions && data.recentSessions.length > 0 ? (
            data.recentSessions.map((session, index) => (
              <div key={session.id || index} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-shadow hover:shadow-md">
                
                <div className="flex items-start gap-4">
                  <div className="bg-blue-50 text-blue-600 p-3 rounded-lg shrink-0">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">
                      {session.lesson_title || session.lessonName || session.title || 'Unknown Lesson'}
                    </h3>
                    <p className="text-sm font-medium text-gray-600 mt-1">
                      {session.teacher_name && <span className="mr-2">{session.teacher_name} &bull;</span>}
                      Class {session.class_number || session.classNumber} - Sec {session.section}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 sm:justify-end text-xs text-gray-500 font-medium bg-gray-50 sm:bg-transparent p-2 sm:p-0 rounded-lg">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  {new Date(session.created_at || session.date || new Date()).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </div>

              </div>
            ))
          ) : (
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mb-4">
                <Activity className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">No sessions recorded yet.</h3>
              <p className="text-sm text-gray-500">Teachers have not submitted any sessions.</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default SchoolDashboard;
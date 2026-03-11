import { useState, useEffect } from 'react';
import { Calendar, BookOpen, Loader2, AlertCircle } from 'lucide-react';
import api from '../../services/api';

const SessionHistory = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        // Fetch sessions for the logged-in teacher
        const response = await api.get('/sessions');
        
        // Handle varying response structures securely
        const fetchedSessions = response.data.data || response.data || [];
        
        setSessions(fetchedSessions);
      } catch (err) {
        console.error("Failed to fetch sessions:", err);
        setError("Unable to load session history. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  // Loading State
  if (loading) {
    return (
      <div className="max-w-md mx-auto md:max-w-2xl space-y-4 pb-8">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-6 animate-pulse"></div>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 h-24 animate-pulse"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto md:max-w-2xl space-y-6 pb-8">
      
      {/* Header Area */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Session History</h1>
        <p className="text-sm text-gray-500 mt-1">Review your previously conducted lessons.</p>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm flex items-start gap-2 border border-red-100">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {/* Session List */}
      {!error && (
        <div className="space-y-4">
          {sessions.length > 0 ? (
            sessions.map((session, index) => (
              <div 
                key={session.id || index} 
                className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-3 transition-shadow hover:shadow-md"
              >
                <div className="flex items-start gap-3">
                  <div className="bg-blue-50 text-blue-600 p-2 rounded-lg shrink-0 mt-0.5">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    {/* Fallbacks for various standard backend column names */}
                    <h3 className="font-bold text-gray-900 text-base">
                      {session.lesson_title || session.lessonName || session.title || 'Unknown Lesson'}
                    </h3>
                    <p className="text-sm font-medium text-gray-600 mt-1">
                      Class {session.class_number || session.classNumber} - Section {session.section}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 mt-2 pt-3 border-t border-gray-50 text-xs text-gray-500 font-medium">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  {/* Format the date (e.g., 10 March 2026) */}
                  {new Date(session.created_at || session.date || new Date()).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </div>
              </div>
            ))
          ) : (
            /* Empty State */
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mb-4">
                <BookOpen className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">No sessions recorded yet.</h3>
              <p className="text-sm text-gray-500">You haven't conducted any lessons.</p>
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default SessionHistory;
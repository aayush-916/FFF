import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Layers, PlayCircle, ChevronRight, ArrowLeft, Clock, AlertCircle, Eye, Download } from 'lucide-react';
import api from '../../services/api';

const LessonBrowser = () => {
  const navigate = useNavigate();

  // Navigation State
  const [selectedDomain, setSelectedDomain] = useState(null);
  const [selectedHabit, setSelectedHabit] = useState(null);

  // Data State
  const [domains, setDomains] = useState([]);
  const [habits, setHabits] = useState([]);
  const [lessons, setLessons] = useState([]);

  // Loading States
  const [loadingDomains, setLoadingDomains] = useState(true);
  const [loadingHabits, setLoadingHabits] = useState(false);
  const [loadingLessons, setLoadingLessons] = useState(false);

  // Error State
  const [error, setError] = useState(null);

  // Helper to safely format file URLs
  const getFileUrl = (filePath) => {
    if (!filePath) return '';
    if (filePath.startsWith('http')) return filePath;
    return `http://localhost:5000/${filePath.replace(/^\//, '')}`;
  };

  // 1. Fetch Domains on Mount
  useEffect(() => {
    fetchDomains();
  }, []);

  const fetchDomains = async () => {
    setLoadingDomains(true);
    setError(null);
    try {
      const response = await api.get('/domains');
      setDomains(response.data.data || response.data || []);
    } catch (err) {
      console.error("Failed to fetch domains:", err);
      setError("Unable to load domains. Please try again later.");
    } finally {
      setLoadingDomains(false);
    }
  };

  // 2. Fetch Habits when a Domain is clicked
  const handleDomainClick = async (domain) => {
    setSelectedDomain(domain);
    setLoadingHabits(true);
    setError(null);
    try {
      const response = await api.get(`/habits?domain_id=${domain.id}`);
      setHabits(response.data.data || response.data || []);
    } catch (err) {
      console.error("Failed to fetch habits:", err);
      setError("Unable to load habits for this domain.");
    } finally {
      setLoadingHabits(false);
    }
  };

  // 3. Fetch Lessons when a Habit is clicked
  const handleHabitClick = async (habit) => {
    setSelectedHabit(habit);
    setLoadingLessons(true);
    setError(null);
    try {
      const response = await api.get(`/lessons?habit_id=${habit.id}`);
      setLessons(response.data.data || response.data || []);
    } catch (err) {
      console.error("Failed to fetch lessons:", err);
      setError("Unable to load lessons for this habit.");
    } finally {
      setLoadingLessons(false);
    }
  };

  // Go back handlers
  const handleBackToDomains = () => {
    setSelectedDomain(null);
    setHabits([]);
    setError(null);
  };

  const handleBackToHabits = () => {
    setSelectedHabit(null);
    setLessons([]);
    setError(null);
  };

  const SkeletonList = () => (
    <div className="space-y-4 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-20 bg-gray-200 rounded-xl w-full"></div>
      ))}
    </div>
  );

  return (
    <div className="max-w-md mx-auto md:max-w-2xl space-y-6 pb-6">
      
      {/* Dynamic Header */}
      <div className="flex items-center gap-3">
        {selectedDomain && (
          <button 
            onClick={selectedHabit ? handleBackToHabits : handleBackToDomains}
            className="p-2 bg-white rounded-full shadow-sm border border-gray-100 text-gray-600 hover:bg-gray-50 focus:outline-none"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {!selectedDomain && "Browse Domains"}
            {selectedDomain && !selectedHabit && selectedDomain.name}
            {selectedHabit && selectedHabit.name}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {!selectedDomain && "Select a domain to view its habits."}
            {selectedDomain && !selectedHabit && "Select a habit to view lessons."}
            {selectedHabit && "Select a lesson to start teaching."}
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm flex items-start gap-2 border border-red-100">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* VIEW 1: DOMAINS */}
      {!selectedDomain && (
        <div>
          {loadingDomains ? (
            <SkeletonList />
          ) : domains.length > 0 ? (
            <div className="grid gap-4">
              {domains.map((domain) => (
                <button
                  key={domain.id}
                  onClick={() => handleDomainClick(domain)}
                  className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between hover:bg-blue-50 transition-colors text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-100 p-3 rounded-lg text-blue-600">
                      <Layers className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{domain.name}</h3>
                      <p className="text-sm text-gray-500">Tap to view habits</p>
                    </div>
                  </div>
                  <ChevronRight className="text-gray-400 w-5 h-5" />
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center p-8 bg-white rounded-xl shadow-sm text-gray-500">No domains found.</div>
          )}
        </div>
      )}

      {/* VIEW 2: HABITS */}
      {selectedDomain && !selectedHabit && (
        <div>
          {loadingHabits ? (
            <SkeletonList />
          ) : habits.length > 0 ? (
            <div className="grid gap-4">
              {habits.map((habit) => (
                <button
                  key={habit.id}
                  onClick={() => handleHabitClick(habit)}
                  className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between hover:bg-orange-50 transition-colors text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-orange-100 p-3 rounded-lg text-orange-600">
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-base md:text-lg">{habit.name}</h3>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{habit.description}</p>
                    </div>
                  </div>
                  <ChevronRight className="text-gray-400 w-5 h-5 shrink-0" />
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center p-8 bg-white rounded-xl shadow-sm text-gray-500">No habits found.</div>
          )}
        </div>
      )}

      {/* VIEW 3: LESSONS */}
      {selectedHabit && (
        <div>
          {loadingLessons ? (
            <SkeletonList />
          ) : lessons.length > 0 ? (
            <div className="grid gap-4">
              {lessons.map((lesson) => {
                console.log("RAW LESSON DATA FROM BACKEND:", lesson);
                // Safely grab the file path regardless of case formatting
               const pdfPath = lesson.lesson_pdf_url || lesson.lesson_pdf || lesson.lessonPdf;
                const guidePath = lesson.teacher_guide_url || lesson.teacher_guide || lesson.teacherGuide;
                return (
                  <div
                    key={lesson.id}
                    className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-4"
                  >
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{lesson.title}</h3>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-sm font-medium text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md">
                          Class {lesson.class_number || lesson.classNumber}
                        </span>
                        <span className="text-sm text-gray-500 flex items-center gap-1">
                          <Clock className="w-4 h-4" /> 10 mins
                        </span>
                      </div>
                    </div>

                    {/* PDF View and Download Section */}
                    <div className="flex flex-col gap-3 border-t border-gray-100 pt-4">
                      
                      {pdfPath && (
                        <div className="flex gap-2">
                          <a 
                            href={getFileUrl(pdfPath)} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex-1 flex justify-center items-center gap-2 bg-blue-50 text-blue-700 font-semibold py-2.5 rounded-lg hover:bg-blue-100 transition-colors text-sm"
                          >
                            <Eye className="w-4 h-4" /> View Lesson PDF
                          </a>
                          <a 
                            href={getFileUrl(pdfPath)} 
                            download
                            title="Download Lesson PDF"
                            className="flex items-center justify-center px-4 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors border border-gray-200"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                        </div>
                      )}

                      {guidePath && (
                        <div className="flex gap-2">
                          <a 
                            href={getFileUrl(guidePath)} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex-1 flex justify-center items-center gap-2 bg-orange-50 text-orange-700 font-semibold py-2.5 rounded-lg hover:bg-orange-100 transition-colors text-sm"
                          >
                            <Eye className="w-4 h-4" /> View Teacher Guide
                          </a>
                          <a 
                            href={getFileUrl(guidePath)} 
                            download
                            title="Download Teacher Guide"
                            className="flex items-center justify-center px-4 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors border border-gray-200"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                        </div>
                      )}
                    </div>
                    
                    <button
                      onClick={() => navigate(`/sessions/start?lesson_id=${lesson.id}`)}
                      className="w-full bg-blue-600 text-white font-semibold py-3 px-4 rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 mt-2"
                    >
                      <PlayCircle className="w-5 h-5" />
                      Start Session
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center p-8 bg-white rounded-xl shadow-sm text-gray-500">No lessons found.</div>
          )}
        </div>
      )}
    </div>
  );
};

export default LessonBrowser;
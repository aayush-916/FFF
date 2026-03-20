import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Layers,
  PlayCircle,
  ChevronRight,
  ArrowLeft,
  Clock,
  AlertCircle,
  Download,
  Maximize2,
  Minimize2,
  FileText,
  GraduationCap,
  CheckCircle,
  ClipboardList,
  X,
  Loader2
} from "lucide-react";
import api from "../../services/api";

// --- Sub-Component for Individual Lessons ---
const LessonCard = ({ lesson, getFileUrl, onMarkComplete, onOpenFeedback, isSubmitting }) => {
  const guidePath =
    lesson.teacher_guide_url || lesson.teacher_guide || lesson.teacherGuide;
  const materials = lesson.materials || [];

  const defaultTab =
    materials.length > 0 ? materials[0].id : guidePath ? "guide" : null;
  const [activeTab, setActiveTab] = useState(defaultTab);

  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (isFullscreen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isFullscreen]);

  let activeUrl = "";
  let activeDescription = "";

  if (activeTab === "guide") {
    activeUrl = guidePath;
    activeDescription =
      "Step-by-step instructions for the teacher to conduct this session.";
  } else {
    const activeMaterial = materials.find((m) => m.id === activeTab);
    if (activeMaterial) {
      activeUrl = activeMaterial.pdf_url;
      activeDescription = activeMaterial.description;
    }
  }

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 flex flex-col w-full overflow-hidden">
      {/* 1. Lesson Header */}
      <div className="p-4 sm:p-5">
        <h3 className="text-xl font-bold text-gray-900 leading-tight break-words">
          {lesson.title || lesson.type || "Lesson Overview"}
        </h3>
        <div className="flex flex-wrap items-center gap-2 mt-3">
          <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg uppercase tracking-wider">
            {lesson.type} Grades
          </span>
          <span className="text-xs font-bold text-gray-500 flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg">
            <Clock className="w-4 h-4" /> {lesson.duration_minutes || 10} mins
          </span>
        </div>
      </div>

      {/* 2. Dynamic Tabs Row */}
      <div className="px-4 sm:px-5 border-t border-gray-100 pt-4 w-full">
        <div className="flex gap-2 overflow-x-auto pb-2 w-full hide-scrollbar">
          {materials.map((material) => (
            <button
              key={material.id}
              onClick={() => setActiveTab(material.id)}
              className={`shrink-0 whitespace-nowrap px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-1.5 ${
                activeTab === material.id
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-gray-50 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <FileText className="w-4 h-4" />
              {material.title || "Lesson Material"}
            </button>
          ))}

          {guidePath && (
            <button
              onClick={() => setActiveTab("guide")}
              className={`shrink-0 whitespace-nowrap px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-1.5 ${
                activeTab === "guide"
                  ? "bg-orange-500 text-white shadow-sm"
                  : "bg-gray-50 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Teacher Guide
            </button>
          )}
        </div>
      </div>

      {/* 3. Description Context */}
      {activeDescription && (
        <div className="px-4 sm:px-5 mt-2 w-full">
          <p className="text-sm text-gray-500 bg-gray-50 p-3 rounded-xl border border-gray-100 break-words whitespace-normal">
            {activeDescription}
          </p>
        </div>
      )}

      {/* 4. CUSTOM DOCUMENT VIEWER */}
      {activeTab && activeUrl && (
        <div
          className={`flex flex-col bg-gray-900 shadow-inner transition-all duration-300 w-full mt-4 ${
            isFullscreen
              ? "fixed inset-0 z-[100] h-screen rounded-none"
              : "relative h-[65vh] md:h-[600px] border-y border-gray-800"
          }`}
        >
          <div className="flex items-center justify-between p-3 bg-gray-800 text-gray-200 shrink-0 z-10 border-b border-gray-700">
            {/* LEFT SIDE: Download Button */}
            <a
              href={getFileUrl(activeUrl)}
              download
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-gray-400 hover:text-white sm:flex"
              title="Download Document"
            >
              <Download className="w-5 h-5" />
            </a>

            {/* RIGHT SIDE: Fullscreen Button */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors flex items-center gap-2 font-bold text-sm"
            >
              {isFullscreen ? (
                <>
                  <Minimize2 className="w-4 h-4" />{" "}
                  <span className="hidden sm:inline">Exit</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-4 h-4" />{" "}
                  <span className="hidden sm:inline">Fullscreen</span>
                </>
              )}
            </button>
          </div>

          {/* Scrollable Canvas Area - Locked down for mobile performance */}
          <div className="flex-1 w-full h-full relative overflow-hidden bg-[#525659]">
            <iframe
              src={`https://docs.google.com/viewer?url=${encodeURIComponent(getFileUrl(activeUrl))}&embedded=true`}
              className="absolute inset-0 w-full h-full border-0 bg-white"
              style={{
                pointerEvents: "auto",
                touchAction: "pan-y", // Tells the phone to strictly expect vertical scrolling
              }}
              title="Document Viewer"
            />
          </div>
        </div>
      )}

      {/* 5. Mark Complete & Submit Feedback Buttons */}
      <div className="p-4 sm:p-5 w-full grid grid-cols-2 gap-3 bg-gray-50 border-t border-gray-100">
        <button
          onClick={() => onMarkComplete(lesson)}
          disabled={isSubmitting}
          className="flex flex-col items-center justify-center gap-1 bg-green-50 border border-green-200 text-green-700 hover:bg-green-100 font-bold py-3 rounded-xl transition-colors disabled:opacity-50"
        >
          {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
          <span className="text-xs sm:text-sm">Mark Complete</span>
        </button>
        <button
          onClick={() => onOpenFeedback(lesson)}
          className="flex flex-col items-center justify-center gap-1 bg-blue-600 text-white hover:bg-blue-700 font-bold py-3 rounded-xl transition-colors shadow-sm"
        >
          <ClipboardList className="w-5 h-5" />
          <span className="text-xs sm:text-sm">Submit Feedback</span>
        </button>
      </div>
    </div>
  );
};

// --- Main Browser Component ---
const LessonBrowser = () => {
  const navigate = useNavigate();

  // Navigation State
  const [selectedDomain, setSelectedDomain] = useState(null);
  const [selectedHabit, setSelectedHabit] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null); 
  const [selectedSection, setSelectedSection] = useState(null); 
  const [isClassSubmitted, setIsClassSubmitted] = useState(false); 

  // Modal & Feedback State
  const [feedbackLesson, setFeedbackLesson] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentSessionId, setCurrentSessionId] = useState(null);

  // Data State
  const [domains, setDomains] = useState([]);
  const [habits, setHabits] = useState([]);
  const [lessons, setLessons] = useState([]);
  
  // NEW: Store all available school classes from backend
  const [schoolClasses, setSchoolClasses] = useState([]);

  // Loading & Error State
  const [loadingDomains, setLoadingDomains] = useState(true);
  const [loadingHabits, setLoadingHabits] = useState(false);
  const [loadingLessons, setLoadingLessons] = useState(false);
  const [error, setError] = useState(null);

  const getFileUrl = (filePath) => {
    if (!filePath) return "";
    if (filePath.startsWith("http")) return filePath;
    return `https://db24-49-36-144-43.ngrok-free.app/${filePath.replace(/^\//, "")}`;
  };

  useEffect(() => {
    fetchDomains();
    fetchSchoolClasses(); // Fetch classes on component mount!
  }, []);

  const fetchDomains = async () => {
    setLoadingDomains(true);
    setError(null);
    try {
      const response = await api.get("/domains");
      setDomains(response.data.data || response.data || []);
    } catch (err) {
      setError("Unable to load domains.");
    } finally {
      setLoadingDomains(false);
    }
  };

  const fetchSchoolClasses = async () => {
    try {
      const response = await api.get("/school/classes");
      setSchoolClasses(response.data.data || response.data || []);
    } catch (err) {
      console.error("Could not fetch school classes for section filtering", err);
    }
  };

  const handleDomainClick = async (domain) => {
    setSelectedDomain(domain);
    setLoadingHabits(true);
    setError(null);
    try {
      const response = await api.get(`/habits?domain_id=${domain.id}`);
      setHabits(response.data.data || response.data || []);
    } catch (err) {
      setError("Unable to load habits.");
    } finally {
      setLoadingHabits(false);
    }
  };

  const handleHabitClick = async (habit) => {
    setSelectedHabit(habit);
    setLoadingLessons(true);
    setError(null);
    try {
      const response = await api.get(`/lessons?habit_id=${habit.id}`);
      setLessons(response.data.data || response.data || []);
    } catch (err) {
      setError("Unable to load lessons.");
    } finally {
      setLoadingLessons(false);
    }
  };

  // --- Multi-Step Back Handlers ---
  const handleBackToDomains = () => {
    setSelectedDomain(null);
    setHabits([]);
    setError(null);
  };
  const handleBackToHabits = () => {
    setSelectedHabit(null);
    setLessons([]);
    setSelectedClass(null);
    setSelectedSection(null);
    setIsClassSubmitted(false);
    setError(null);
  };
  const handleBackToClassSelection = () => {
    setIsClassSubmitted(false);
  };

  let backAction = null;
  if (isClassSubmitted) backAction = handleBackToClassSelection;
  else if (selectedHabit) backAction = handleBackToHabits;
  else if (selectedDomain) backAction = handleBackToDomains;

  // --- ACTION HANDLERS ---
  const handleMarkComplete = async (lesson) => {
    setIsSubmitting(true);
    try {
      const response = await api.post('/sessions/mark-complete', {
        school_id: 1, 
        habit_id: selectedHabit.id,
        parent_lesson_id: lesson.parent_lesson_id || lesson.id,
        material_id: lesson.id,
        class_number: selectedClass,
        section: selectedSection
      });
      
      const newSessionId = response.data?.session_id || response.data?.data?.id || response.data?.id;
      setCurrentSessionId(newSessionId);
      alert("Lesson Marked as Complete! ✅");
    } catch (err) {
      console.error("Error marking complete:", err);
      alert("Error: Could not mark complete. Check backend logs.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenFeedback = async (lesson) => {
    setFeedbackLesson(lesson);
    setIsSubmitting(true);
    try {
      const response = await api.get(`/mcq?lesson_id=${lesson.parent_lesson_id || lesson.id}`);
      setQuestions(response.data.data || []);
      setAnswers({});
    } catch (err) {
      alert("Could not load feedback questions.");
      setFeedbackLesson(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitFeedback = async () => {
    const missingMandatory = questions.some(q => q.is_optional === 0 && !answers[q.id]);
    if (missingMandatory) {
      alert("Please answer all required questions.");
      return;
    }

    setIsSubmitting(true);
    try {
      let sessionIdToUse = currentSessionId;

      if (!sessionIdToUse) {
        const sessionRes = await api.post('/sessions', {
          lesson_id: feedbackLesson.parent_lesson_id || feedbackLesson.id,
          habit_id: selectedHabit.id,
          class_number: selectedClass,
          section: selectedSection
        });
        sessionIdToUse = sessionRes.data?.id || sessionRes.data?.data?.id || sessionRes.data?.insertId;
        setCurrentSessionId(sessionIdToUse);
      }

      const formattedResponses = questions
        .filter(q => answers[q.id] && answers[q.id].trim() !== '')
        .map(q => ({
          question_id: q.id,
          selected_option: q.question_type === 'mcq' ? answers[q.id] : null,
          text_answer: q.question_type === 'text' ? answers[q.id] : null
        }));

      await api.post('/mcq/submit', {
        session_id: sessionIdToUse,
        responses: formattedResponses
      });
      
      setFeedbackLesson(null);
      alert("Feedback Submitted Successfully! 🎉");
    } catch (err) {
      console.error("Error submitting feedback:", err);
      alert("Failed to submit feedback.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const SkeletonList = () => (
    <div className="space-y-4 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-24 bg-gray-200 rounded-2xl w-full"></div>
      ))}
    </div>
  );

  // NEW: Dynamically derive available sections based on the selected class
  const availableSections = schoolClasses
    .filter((c) => Number(c.class_number) === Number(selectedClass))
    .map((c) => c.section)
    .filter((value, index, self) => self.indexOf(value) === index) // Remove duplicates just in case
    .sort();

  return (
    <div className="max-w-md mx-auto md:max-w-3xl space-y-6 pb-6 w-full relative">
      {/* Dynamic Header */}
      <div className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        {backAction && (
          <button
            onClick={backAction}
            className="p-2.5 bg-gray-50 rounded-full text-gray-600 hover:bg-gray-200 transition-colors shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 leading-tight truncate">
            {!selectedDomain && "Browse Domains"}
            {selectedDomain && !selectedHabit && selectedDomain.name}
            {selectedHabit && !isClassSubmitted && "Select Class & Section"}
            {selectedHabit &&
              isClassSubmitted &&
              `Class ${selectedClass}${selectedSection} Lesson`}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5 font-medium truncate">
            {!selectedDomain && "Select a domain to view its habits."}
            {selectedDomain &&
              !selectedHabit &&
              "Select a habit to view lessons."}
            {selectedHabit &&
              !isClassSubmitted &&
              "Choose your class and section to load the correct materials."}
            {selectedHabit && isClassSubmitted && selectedHabit.name}
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm flex items-start gap-2 border border-red-100">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="font-medium">{error}</p>
        </div>
      )}

      {/* VIEW 1: DOMAINS */}
      {!selectedDomain && (
        <div>
          {loadingDomains ? (
            <SkeletonList />
          ) : domains.length > 0 ? (
            <div className="grid gap-4 w-full">
              {domains.map((domain) => (
                <button
                  key={domain.id}
                  onClick={() => handleDomainClick(domain)}
                  className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:bg-blue-50 transition-all text-left group w-full"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-50 p-3.5 rounded-xl text-blue-600">
                      <Layers className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        {domain.name}
                      </h3>
                      <p className="text-sm text-gray-500 font-medium">
                        Tap to view habits
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="text-gray-300 w-6 h-6 shrink-0" />
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center p-8 bg-white rounded-2xl shadow-sm text-gray-500 font-medium">
              No domains found.
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: HABITS */}
      {selectedDomain && !selectedHabit && (
        <div>
          {loadingHabits ? (
            <SkeletonList />
          ) : habits.length > 0 ? (
            <div className="grid gap-4 w-full">
              {habits.map((habit) => (
                <button
                  key={habit.id}
                  onClick={() => handleHabitClick(habit)}
                  className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:bg-orange-50 transition-all text-left group w-full"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-orange-50 p-3.5 rounded-xl text-orange-600">
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg leading-tight">
                        {habit.name}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2 font-medium">
                        {habit.description}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="text-gray-300 w-6 h-6 shrink-0" />
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center p-8 bg-white rounded-2xl shadow-sm text-gray-500 font-medium">
              No habits found.
            </div>
          )}
        </div>
      )}

      {/* VIEW 3: CLASS & SECTION SELECTION */}
      {selectedHabit && !isClassSubmitted && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-6 w-full">
          <div className="text-center space-y-2 mb-2">
            <div className="bg-blue-50 w-16 h-16 mx-auto rounded-full flex items-center justify-center text-blue-600 mb-4">
              <GraduationCap className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              Select Class & Section
            </h2>
            <p className="text-gray-500 text-sm">
              Lower Grades: Classes 3-5 | Higher Grades: Classes 6-8
            </p>
          </div>

          {/* CLASS SELECTOR */}
          <div>
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">1. Select Class</h3>
            <div className="grid grid-cols-3 gap-3">
              {[3, 4, 5, 6, 7, 8].map((cls) => (
                <button
                  key={cls}
                  onClick={() => {
                    setSelectedClass(cls);
                    setSelectedSection(null); // Reset section when class changes to prevent invalid combos
                  }}
                  className={`py-3 rounded-xl border-2 font-black text-lg transition-all ${
                    selectedClass === cls
                      ? "border-blue-600 bg-blue-50 text-blue-700 shadow-sm"
                      : "border-gray-100 bg-white text-gray-500 hover:border-blue-200 hover:bg-gray-50"
                  }`}
                >
                  Class {cls}
                </button>
              ))}
            </div>
          </div>

          {/* DYNAMIC SECTION SELECTOR */}
          <div>
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">2. Select Section</h3>
            
            {!selectedClass ? (
              <div className="p-4 bg-gray-50 border border-dashed border-gray-200 rounded-xl text-center">
                <p className="text-sm text-gray-500 font-medium">Please select a class first.</p>
              </div>
            ) : availableSections.length === 0 ? (
              <div className="p-4 bg-orange-50 border border-orange-100 rounded-xl text-center">
                <p className="text-sm text-orange-600 font-medium">No sections found for Class {selectedClass}.</p>
              </div>
            ) : (
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                {availableSections.map((sec) => (
                  <button
                    key={sec}
                    onClick={() => setSelectedSection(sec)}
                    className={`py-3 rounded-xl border-2 font-black text-lg transition-all ${
                      selectedSection === sec
                        ? "border-blue-600 bg-blue-50 text-blue-700 shadow-sm"
                        : "border-gray-100 bg-white text-gray-500 hover:border-blue-200 hover:bg-gray-50"
                    }`}
                  >
                    {sec}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            disabled={!selectedClass || !selectedSection}
            onClick={() => setIsClassSubmitted(true)}
            className="w-full mt-4 bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-lg flex items-center justify-center gap-2"
          >
            Load Lesson Materials <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* VIEW 4: SINGLE LESSON VIEW */}
      {selectedHabit && isClassSubmitted && (
        <div>
          {loadingLessons ? (
            <SkeletonList />
          ) : (
            (() => {
              // Determine the target tier based on selected class
              const targetType = [3, 4, 5].includes(selectedClass)
                ? "Lower"
                : "Higher";

              // Find the lesson that matches the tier (case insensitive)
              const displayLesson = lessons.find(
                (l) =>
                  l.type === targetType ||
                  (l.type && l.type.toLowerCase() === targetType.toLowerCase()),
              );

              if (!displayLesson) {
                return (
                  <div className="text-center p-10 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center">
                    <AlertCircle className="w-10 h-10 text-gray-300 mb-3" />
                    <p className="text-gray-500 font-medium">
                      No {targetType} tier lesson found for this habit yet.
                    </p>
                  </div>
                );
              }

              return (
                <div className="w-full">
                  <LessonCard
                    lesson={displayLesson}
                    getFileUrl={getFileUrl}
                    onMarkComplete={handleMarkComplete}
                    onOpenFeedback={handleOpenFeedback}
                    isSubmitting={isSubmitting}
                  />
                </div>
              );
            })()
          )}
        </div>
      )}

      {/* --- MODAL: FEEDBACK --- */}
      {feedbackLesson && (
        <div className="fixed inset-0 z-[100] flex flex-col bg-white sm:p-4 sm:bg-gray-900/90 backdrop-blur-sm animate-in fade-in">
          <div className="flex-1 flex flex-col w-full h-full bg-white sm:rounded-2xl shadow-2xl overflow-hidden max-w-2xl mx-auto">
            
            <div className="flex items-center justify-between p-4 border-b border-blue-100 bg-blue-50 shrink-0">
              <h3 className="text-xl font-black text-blue-900">Optional Feedback</h3>
              <button onClick={() => setFeedbackLesson(null)} className="p-2 bg-blue-200 text-blue-800 rounded-full">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto flex-1 space-y-6 bg-gray-50">
              {isSubmitting && questions.length === 0 ? (
                <div className="flex justify-center p-10"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
              ) : questions.length === 0 ? (
                <p className="text-center text-gray-500 p-10">No feedback questions available.</p>
              ) : (
                questions.map((q, idx) => (
                  <div key={q.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="font-semibold text-gray-900 mb-3 text-lg leading-snug">
                      Q{idx + 1}: {q.question_text}
                      {q.is_optional === 1 && <span className="ml-2 text-xs text-gray-400 font-normal uppercase">(Optional)</span>}
                    </p>
                    {q.question_type === 'text' ? (
                      <textarea
                        rows="3"
                        value={answers[q.id] || ''}
                        onChange={(e) => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                        placeholder="Type your answer..."
                      />
                    ) : (
                      <div className="space-y-2 mt-4">
                        {(Array.isArray(q.options) ? q.options : JSON.parse(q.options || "[]")).map((opt) => (
                          <label key={opt} className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${answers[q.id] === opt ? 'bg-blue-50 border-blue-500 text-blue-800 shadow-sm' : 'bg-white hover:bg-gray-50 border-gray-100'}`}>
                            <input
                              type="radio"
                              name={`question-${q.id}`}
                              value={opt}
                              checked={answers[q.id] === opt}
                              onChange={() => setAnswers(prev => ({ ...prev, [q.id]: opt }))}
                              className="w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-500"
                            />
                            <span className="ml-3 font-bold text-sm">{opt}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="p-4 bg-white border-t border-gray-200 shrink-0">
              <button onClick={handleSubmitFeedback} disabled={isSubmitting || questions.length === 0} className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-colors disabled:opacity-50 text-lg shadow-sm">
                {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <CheckCircle className="w-6 h-6" />}
                Submit Final Feedback
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default LessonBrowser;
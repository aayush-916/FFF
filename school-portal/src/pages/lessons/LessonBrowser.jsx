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
} from "lucide-react";
import api from "../../services/api";

// --- Sub-Component for Individual Lessons ---
const LessonCard = ({ lesson, getFileUrl, onSubmitLesson }) => {
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

          {/* Scrollable Canvas Area */}
          <div
            className="flex-1 w-full h-full relative bg-[#525659]"
            style={{
              // THE MAGIC BULLET: Forces hardware-accelerated smooth scrolling on mobile
              WebkitOverflowScrolling: "touch",
              overflowY: "auto",
            }}
          >
            <iframe
              src={`https://docs.google.com/viewer?url=${encodeURIComponent(getFileUrl(activeUrl))}&embedded=true`}
              className="absolute top-0 left-0 w-full h-full border-0 bg-white"
              title="Document Viewer"
              // Helps prevent the iframe from freezing while loading
              loading="lazy"
            />
          </div>
        </div>
      )}

      {/* 5. Submit Lesson Button */}
      <div className="p-4 sm:p-5 w-full">
        <button
          onClick={() => onSubmitLesson(lesson.id)}
          className="w-full bg-green-600 text-white font-bold py-4 px-4 rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center gap-2 shadow-sm text-lg"
        >
          <CheckCircle className="w-6 h-6" />
          Submit Lesson
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
  const [selectedClass, setSelectedClass] = useState(null); // New!
  const [isClassSubmitted, setIsClassSubmitted] = useState(false); // New!

  // Data State
  const [domains, setDomains] = useState([]);
  const [habits, setHabits] = useState([]);
  const [lessons, setLessons] = useState([]);

  // Loading & Error State
  const [loadingDomains, setLoadingDomains] = useState(true);
  const [loadingHabits, setLoadingHabits] = useState(false);
  const [loadingLessons, setLoadingLessons] = useState(false);
  const [error, setError] = useState(null);

  const getFileUrl = (filePath) => {
    if (!filePath) return "";
    if (filePath.startsWith("http")) return filePath;
    return `https://a728-49-36-144-43.ngrok-free.app/${filePath.replace(/^\//, "")}`;
  };

  useEffect(() => {
    fetchDomains();
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
    setIsClassSubmitted(false);
    setError(null);
  };
  const handleBackToClassSelection = () => {
    setIsClassSubmitted(false);
  };

  // Determine which back function to use based on current view
  let backAction = null;
  if (isClassSubmitted) backAction = handleBackToClassSelection;
  else if (selectedHabit) backAction = handleBackToHabits;
  else if (selectedDomain) backAction = handleBackToDomains;

  const handleSubmitLesson = (lessonId) => {
    // Navigate to SessionPage, passing both the lesson AND the class they selected!
    navigate(
      `/sessions/start?lesson_id=${lessonId}&class_num=${selectedClass}`,
    );
  };

  const SkeletonList = () => (
    <div className="space-y-4 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-24 bg-gray-200 rounded-2xl w-full"></div>
      ))}
    </div>
  );

  return (
    <div className="max-w-md mx-auto md:max-w-3xl space-y-6 pb-6 w-full">
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
            {selectedHabit && !isClassSubmitted && "Select Your Class"}
            {selectedHabit &&
              isClassSubmitted &&
              `Class ${selectedClass} Lesson`}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5 font-medium truncate">
            {!selectedDomain && "Select a domain to view its habits."}
            {selectedDomain &&
              !selectedHabit &&
              "Select a habit to view lessons."}
            {selectedHabit &&
              !isClassSubmitted &&
              "Choose your class to load the correct materials."}
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

      {/* VIEW 3: CLASS SELECTION */}
      {selectedHabit && !isClassSubmitted && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-6 w-full">
          <div className="text-center space-y-2">
            <div className="bg-blue-50 w-16 h-16 mx-auto rounded-full flex items-center justify-center text-blue-600 mb-4">
              <GraduationCap className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              Which class are you teaching?
            </h2>
            <p className="text-gray-500 text-sm">
              Classes 3-5 use Lower Grades materials. Classes 6-8 use Higher
              Grades materials.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[3, 4, 5, 6, 7, 8].map((cls) => (
              <button
                key={cls}
                onClick={() => setSelectedClass(cls)}
                className={`py-4 rounded-xl border-2 font-black text-lg transition-all ${
                  selectedClass === cls
                    ? "border-blue-600 bg-blue-50 text-blue-700 shadow-sm"
                    : "border-gray-100 bg-white text-gray-500 hover:border-blue-200 hover:bg-gray-50"
                }`}
              >
                Class {cls}
              </button>
            ))}
          </div>

          <button
            disabled={!selectedClass}
            onClick={() => setIsClassSubmitted(true)}
            className="w-full mt-2 bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-lg flex items-center justify-center gap-2"
          >
            Start Lesson <ChevronRight className="w-5 h-5" />
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
                    onSubmitLesson={handleSubmitLesson}
                  />
                </div>
              );
            })()
          )}
        </div>
      )}
    </div>
  );
};

export default LessonBrowser;

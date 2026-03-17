import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PlayCircle, CheckCircle, ClipboardList, AlertCircle, Loader2, ArrowLeft, Eye, Download } from 'lucide-react';
import api from '../../services/api';

const SessionPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const lessonId = searchParams.get("lesson_id");
  const classNumParam = searchParams.get("class_num"); 

  // Flow State
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Data State
  const [lesson, setLesson] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});

  // Class Selection State
  const [teacherClasses, setTeacherClasses] = useState([]);
  const [otherClasses, setOtherClasses] = useState([]);
  const [selectedClassData, setSelectedClassData] = useState(""); 

  const getFileUrl = (filePath) => {
    if (!filePath) return '';
    if (filePath.startsWith('http')) return filePath;
    return `http://localhost:5000/${filePath.replace(/^\//, '')}`;
  };

  useEffect(() => {
    if (!lessonId) {
      setError("No lesson selected. Please return to the dashboard.");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        
        const lessonRes = await api.get(`/lessons/${lessonId}`);
        setLesson(lessonRes.data.data || lessonRes.data);

        const tClassRes = await api.get('/teacher/classes');
        let tClasses = tClassRes.data.data || tClassRes.data || [];
        
        const sClassRes = await api.get('/school/classes');
        let sClasses = sClassRes.data.data || sClassRes.data || [];

        if (classNumParam) {
          const targetClass = parseInt(classNumParam);
          tClasses = tClasses.filter(c => c.class_number === targetClass);
          sClasses = sClasses.filter(c => c.class_number === targetClass);
        }

        setTeacherClasses(tClasses);

        const teacherClassKeys = new Set(tClasses.map(c => `${c.class_number}-${c.section}`));
        const filteredOtherClasses = sClasses.filter(c => !teacherClassKeys.has(`${c.class_number}-${c.section}`));
        
        setOtherClasses(filteredOtherClasses);

      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load required data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [lessonId, classNumParam]);

  const handleStartSession = async (e) => {
    e.preventDefault();
    if (!selectedClassData) return;

    setSubmitting(true);
    setError(null);

    const [classNumStr, sectionStr] = selectedClassData.split('|');

    try {
      const response = await api.post('/sessions', {
        lesson_id: lessonId,
        habit_id: lesson.habit_id,
        class_number: parseInt(classNumStr),
        section: sectionStr
      });
      
      const newSessionId = response.data.id || response.data.data?.id || response.data.insertId;
      setSessionId(newSessionId);

      const mcqResponse = await api.get(`/mcq?lesson_id=${lessonId}`);
      const fetchedQuestions = mcqResponse.data.data || mcqResponse.data || [];
      setQuestions(fetchedQuestions);
      
      if (fetchedQuestions.length === 0) {
        setStep(3);
        setTimeout(() => navigate('/'), 2000);
      } else {
        setStep(2);
        window.scrollTo(0, 0);
      }
    } catch (err) {
      console.error("Error starting session:", err);
      setError("Failed to start session. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmitFeedback = async () => {
    // 1. Validation: Ensure all REQUIRED (is_optional: 0) questions have an answer
    const missingMandatory = questions.some(q => q.is_optional === 0 && !answers[q.id]);
    
    if (missingMandatory) {
      setError("Please answer all required questions before submitting.");
      window.scrollTo(0, 0);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // 2. Formatting Payload based on Backend Specs
      const formattedResponses = questions
        .filter(q => answers[q.id] && answers[q.id].trim() !== '') // Skip empty optionals
        .map(q => ({
          question_id: q.id,
          selected_option: q.question_type === 'mcq' ? answers[q.id] : null,
          text_answer: q.question_type === 'text' ? answers[q.id] : null
        }));

      // 3. Post to the newly updated backend endpoint
      await api.post('/mcq/submit', {
        session_id: sessionId,
        responses: formattedResponses
      });

      setStep(3);
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      console.error("Error submitting feedback:", err);
      setError("Failed to submit feedback. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="text-gray-500">Loading session data...</p>
      </div>
    );
  }

  const generalQuestions = questions.filter(q => q.lesson_id === null);
  const lessonQuestions = questions.filter(q => q.lesson_id !== null);

  const pdfPath = lesson?.lesson_pdf_url || lesson?.lesson_pdf || lesson?.lessonPdf;
  const guidePath = lesson?.teacher_guide_url || lesson?.teacher_guide || lesson?.teacherGuide;

  // --- Reusable Question Renderer ---
  const renderQuestion = (q, globalIndex) => {
    const isText = q.question_type === 'text';

    return (
      <div key={q.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
        <p className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span>Q{globalIndex + 1}: {q.question_text}</span>
          {q.is_optional === 1 && (
            <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
              Optional
            </span>
          )}
        </p>

        {isText ? (
          <textarea
            rows="3"
            value={answers[q.id] || ''}
            onChange={(e) => handleAnswerChange(q.id, e.target.value)}
            placeholder="Type your answer here..."
            className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-3 outline-none transition-colors"
          />
        ) : (
          <div className="space-y-3">
            {(Array.isArray(q.options) ? q.options : JSON.parse(q.options || "[]")).map((opt) => (
              <label key={opt} className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${answers[q.id] === opt ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'}`}>
                <input
                  type="radio"
                  name={`question-${q.id}`}
                  value={opt}
                  checked={answers[q.id] === opt}
                  onChange={() => handleAnswerChange(q.id, opt)}
                  className="w-4 h-4 text-blue-600 bg-white border-gray-300 focus:ring-blue-500"
                />
                <span className="ml-3 font-medium text-sm">{opt}</span>
              </label>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-md mx-auto space-y-6 pb-8">
      
      <div className="flex items-center gap-3">
        {step === 1 && (
          <button 
            onClick={() => navigate('/lessons')}
            className="p-2 bg-white rounded-full shadow-sm border border-gray-100 text-gray-600 hover:bg-gray-50"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {step === 1 ? 'Submit Lesson' : step === 2 ? 'Session Feedback' : 'Success'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {step === 1 ? 'Select the specific section you taught.' : step === 2 ? 'How did the lesson go?' : 'Redirecting to dashboard...'}
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm flex items-start gap-2 border border-red-100">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {/* STEP 1 UI: Select Section & Confirm */}
      {step === 1 && lesson && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-1">
              Lesson Details
            </h2>
            <h3 className="text-xl font-bold text-gray-900">{lesson.title}</h3>
            <p className="text-sm text-gray-500 mt-1 mb-5">
              Class {classNumParam || lesson.class_number} • {lesson.type} Tier
            </p>

            <div className="flex flex-col gap-3 pt-4 border-t border-gray-100">
              {pdfPath && (
                <div className="flex gap-2">
                  <a href={getFileUrl(pdfPath)} target="_blank" rel="noopener noreferrer" className="flex-1 flex justify-center items-center gap-2 bg-blue-50 text-blue-700 font-semibold py-2.5 rounded-lg hover:bg-blue-100 transition-colors text-sm">
                    <Eye className="w-4 h-4" /> View Lesson PDF
                  </a>
                  <a href={getFileUrl(pdfPath)} download title="Download Lesson PDF" className="flex items-center justify-center px-4 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors border border-gray-200">
                    <Download className="w-4 h-4" />
                  </a>
                </div>
              )}

              {guidePath && (
                <div className="flex gap-2">
                  <a href={getFileUrl(guidePath)} target="_blank" rel="noopener noreferrer" className="flex-1 flex justify-center items-center gap-2 bg-orange-50 text-orange-700 font-semibold py-2.5 rounded-lg hover:bg-orange-100 transition-colors text-sm">
                    <Eye className="w-4 h-4" /> View Teacher Guide
                  </a>
                  <a href={getFileUrl(guidePath)} download title="Download Teacher Guide" className="flex items-center justify-center px-4 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors border border-gray-200">
                    <Download className="w-4 h-4" />
                  </a>
                </div>
              )}
            </div>
          </div>

          <form onSubmit={handleStartSession} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Which section of Class {classNumParam} did you teach?
              </label>
              
              <select 
                required
                value={selectedClassData}
                onChange={(e) => setSelectedClassData(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-base rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-3 outline-none"
              >
                <option value="" disabled>Choose a section</option>
                
                {teacherClasses.length > 0 && (
                  <optgroup label="Your Assigned Sections">
                    {teacherClasses.map((c, idx) => (
                      <option key={`rec-${idx}`} value={`${c.class_number}|${c.section}`}>
                        Section {c.section}
                      </option>
                    ))}
                  </optgroup>
                )}

                {otherClasses.length > 0 && (
                  <optgroup label="Other Sections">
                    {otherClasses.map((c, idx) => (
                      <option key={`oth-${idx}`} value={`${c.class_number}|${c.section}`}>
                        Section {c.section}
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
            </div>

            <button
              type="submit"
              disabled={submitting || !selectedClassData}
              className="w-full flex justify-center items-center gap-2 bg-blue-600 text-white font-bold rounded-xl px-4 py-4 mt-4 hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <ClipboardList className="w-5 h-5" />}
              Continue to Feedback
            </button>
          </form>
        </div>
      )}

      {/* STEP 2 UI: Feedback Questions */}
      {step === 2 && (
        <div className="space-y-6">
          
          {/* General Questions */}
          {generalQuestions.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-gray-500" />
                General Classroom Feedback
              </h2>
              {generalQuestions.map((q, idx) => renderQuestion(q, idx))}
            </div>
          )}

          {/* Lesson Specific Questions */}
          {lessonQuestions.length > 0 && (
            <div className="space-y-4 mt-8">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-gray-500" />
                Lesson Understanding
              </h2>
              {lessonQuestions.map((q, idx) => renderQuestion(q, generalQuestions.length + idx))}
            </div>
          )}

          <button
            onClick={handleSubmitFeedback}
            disabled={submitting}
            className="w-full flex justify-center items-center gap-2 bg-blue-600 text-white font-bold rounded-xl px-4 py-4 mt-6 hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
            Submit Feedback
          </button>
        </div>
      )}

      {/* STEP 3 UI: Success */}
      {step === 3 && (
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center mt-10">
          <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-10 h-10" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Session Recorded!</h2>
          <p className="text-gray-500">Session and feedback recorded successfully.</p>
        </div>
      )}

    </div>
  );
};

export default SessionPage;
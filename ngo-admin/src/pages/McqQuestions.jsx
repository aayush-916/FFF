import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  AlertTriangle,
  X,
  CheckCircle2,
  HelpCircle,
  Filter,
  ListChecks,
  BookOpen,
  Layout,
  Repeat,
  Globe,
  AlignLeft,
  MinusCircle,
  PlusCircle
} from 'lucide-react';
import api from '../api/axios';

const initialMcqState = {
  scope: 'lesson', 
  lesson_id: '',
  question_type: 'mcq', // 'mcq' or 'text'
  is_optional: false, // true or false
  question_text: '',
  options: ['', ''], // Default 2 options for mcq
  correct_option: '',
  question_order: ''
};

const McqQuestions = () => {
  const [mcqs, setMcqs] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [habits, setHabits] = useState([]);
  const [domains, setDomains] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filtering States
  const [searchQuery, setSearchQuery] = useState('');
  const [scopeFilter, setScopeFilter] = useState('All');
  const [domainFilter, setDomainFilter] = useState('All');
  const [habitFilter, setHabitFilter] = useState('All');
  const [lessonFilter, setLessonFilter] = useState('All');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [currentMcq, setCurrentMcq] = useState(initialMcqState);
  
  // Delete Confirmation State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [mcqToDelete, setMcqToDelete] = useState(null);

  // Toast Notification State
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Fetch Data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [mcqRes, lessonsRes, habitsRes, domainsRes] = await Promise.all([
        api.get('/mcq'),
        api.get('/lessons'),
        api.get('/habits'),
        api.get('/domains')
      ]);
      setMcqs(mcqRes.data.data || mcqRes.data);
      setLessons(lessonsRes.data.data || lessonsRes.data);
      setHabits(habitsRes.data.data || habitsRes.data);
      setDomains(domainsRes.data.data || domainsRes.data);
    } catch (error) {
      showToast('Failed to load system data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Toast Helper
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  // Open Modal Helpers
  const openAddModal = () => {
    setModalMode('add');
    setCurrentMcq(initialMcqState);
    setIsModalOpen(true);
  };

  const openEditModal = (mcq) => {
    setModalMode('edit');
    
    // Process existing options or default to 2 empty strings if none exist
    let existingOptions = mcq.options && mcq.options.length > 0 ? [...mcq.options] : ['', ''];
    
    setCurrentMcq({
      id: mcq.id,
      scope: mcq.lesson_id ? 'lesson' : 'global',
      lesson_id: mcq.lesson_id || '',
      question_type: mcq.question_type || 'mcq',
      is_optional: mcq.is_optional || false,
      question_text: mcq.question_text || '',
      options: existingOptions,
      correct_option: mcq.correct_option || '',
      question_order: mcq.question_order || ''
    });
    setIsModalOpen(true);
  };

  const openDeleteModal = (mcq) => {
    setMcqToDelete(mcq);
    setIsDeleteModalOpen(true);
  };

  // --- Dynamic Option Handlers ---
  const handleOptionChange = (index, value) => {
    const newOptions = [...currentMcq.options];
    newOptions[index] = value;
    
    // Update correct option if the text of the currently selected correct option changes
    let newCorrectOption = currentMcq.correct_option;
    if (currentMcq.correct_option === currentMcq.options[index]) {
      newCorrectOption = value;
    }

    setCurrentMcq({
      ...currentMcq, 
      options: newOptions,
      correct_option: newCorrectOption
    });
  };

  const addOption = () => {
    if (currentMcq.options.length < 4) {
      setCurrentMcq({ ...currentMcq, options: [...currentMcq.options, ''] });
    }
  };

  const removeOption = (indexToRemove) => {
    if (currentMcq.options.length > 2) {
      const newOptions = currentMcq.options.filter((_, idx) => idx !== indexToRemove);
      
      // If the removed option was the correct answer, clear the correct answer
      let newCorrectOption = currentMcq.correct_option;
      if (currentMcq.correct_option === currentMcq.options[indexToRemove]) {
        newCorrectOption = '';
      }

      setCurrentMcq({ ...currentMcq, options: newOptions, correct_option: newCorrectOption });
    }
  };

  // CRUD Operations
  const handleSaveMcq = async (e) => {
    e.preventDefault();

    if (currentMcq.scope === 'lesson' && !currentMcq.lesson_id) {
      return showToast('Please select a lesson for Lesson Specific scope.', 'error');
    }

    let finalOptions = [];
    let finalCorrectOption = null;

    if (currentMcq.question_type === 'mcq') {
      finalOptions = currentMcq.options.filter(opt => opt.trim() !== '');
      if (finalOptions.length < 2) {
        return showToast('Multiple choice questions require at least 2 valid options.', 'error');
      }

      // If a correct option is selected but it doesn't match any valid option text
      if (currentMcq.correct_option && !finalOptions.includes(currentMcq.correct_option)) {
         return showToast('Please select a valid correct option from the choices.', 'error');
      }
      finalCorrectOption = currentMcq.correct_option || null; // Convert empty string to null
    }

    // Process payload
    const payload = {
      lesson_id: currentMcq.scope === 'global' ? null : parseInt(currentMcq.lesson_id),
      question_type: currentMcq.question_type,
      is_optional: currentMcq.is_optional,
      question_text: currentMcq.question_text,
      options: finalOptions,
      correct_option: finalCorrectOption,
      question_order: currentMcq.question_order ? parseInt(currentMcq.question_order) : 1
    };

    try {
      if (modalMode === 'add') {
        await api.post('/mcq', payload);
        showToast('Question created successfully!');
      } else {
        await api.put(`/mcq/${currentMcq.id}`, payload);
        showToast('Question updated successfully!');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to save question.', 'error');
    }
  };

  const handleDeleteMcq = async () => {
    if (!mcqToDelete) return;
    try {
      await api.delete(`/mcq/${mcqToDelete.id}`);
      showToast('Question removed successfully!');
      setIsDeleteModalOpen(false);
      fetchData();
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to delete question.', 'error');
    }
  };

  // Relationship Resolvers
  const getLesson = (lessonId) => lessons.find(l => l.id === lessonId);
  const getHabit = (habitId) => habits.find(h => h.id === habitId);
  const getDomain = (domainId) => domains.find(d => d.id === domainId);

  // Cascading Filter Data
  const availableHabitsForFilter = domainFilter === 'All' 
    ? habits 
    : habits.filter(h => h.domain_id?.toString() === domainFilter);
    
  const availableLessonsForFilter = habitFilter === 'All'
    ? lessons.filter(l => domainFilter === 'All' || getHabit(l.habit_id)?.domain_id?.toString() === domainFilter)
    : lessons.filter(l => l.habit_id?.toString() === habitFilter);

  // Filtering Logic for Table
  const filteredMcqs = mcqs.filter(mcq => {
    const lesson = getLesson(mcq.lesson_id);
    const habit = lesson ? getHabit(lesson.habit_id) : null;
    const domainId = habit ? habit.domain_id : null;

    const matchesSearch = mcq.question_text?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesScope = scopeFilter === 'All' || (scopeFilter === 'Lesson' ? mcq.lesson_id !== null : mcq.lesson_id === null);
    const matchesDomain = domainFilter === 'All' || domainId?.toString() === domainFilter;
    const matchesHabit = habitFilter === 'All' || lesson?.habit_id?.toString() === habitFilter;
    const matchesLesson = lessonFilter === 'All' || mcq.lesson_id?.toString() === lessonFilter;

    return matchesSearch && matchesScope && matchesDomain && matchesHabit && matchesLesson;
  });

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto min-h-screen bg-[#fafafa] text-slate-800 font-sans">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-bold tracking-wider uppercase flex items-center gap-1.5">
              <HelpCircle size={14} /> Assessments
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">
            Question Bank
          </h1>
          <p className="text-slate-500 mt-1 font-medium">Manage multiple choice and text-based evaluation questions.</p>
        </div>
        <button 
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold shadow-sm shadow-purple-200 transition-all duration-200"
        >
          <Plus size={18} />
          Add Question
        </button>
      </div>

      {/* MAIN CONTENT CARD */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
        
        {/* Table Toolbar (Filters) */}
        <div className="p-6 border-b border-slate-100 flex flex-col xl:flex-row justify-between items-center gap-4 bg-slate-50/50">
          <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto">
            
            {/* Search */}
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" placeholder="Search questions..." 
                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 w-full bg-white transition-shadow"
              />
            </div>

            {/* Scope Filter */}
            <div className="relative w-full md:w-40">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <select 
                value={scopeFilter} onChange={(e) => setScopeFilter(e.target.value)}
                className="pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 w-full bg-white appearance-none font-medium text-slate-600 truncate"
              >
                <option value="All">All Scopes</option>
                <option value="Lesson">Lesson Questions</option>
                <option value="Global">Global Questions</option>
              </select>
            </div>
            
            {/* Domain Filter */}
            <div className="relative w-full md:w-40">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <select 
                value={domainFilter} 
                onChange={(e) => {
                  setDomainFilter(e.target.value);
                  setHabitFilter('All');
                  setLessonFilter('All');
                }}
                className="pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 w-full bg-white appearance-none font-medium text-slate-600 truncate"
              >
                <option value="All">All Domains</option>
                {domains.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>

            {/* Habit Filter */}
            <div className="relative w-full md:w-40">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <select 
                value={habitFilter} 
                onChange={(e) => {
                  setHabitFilter(e.target.value);
                  setLessonFilter('All');
                }}
                className="pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 w-full bg-white appearance-none font-medium text-slate-600 truncate"
              >
                <option value="All">All Habits</option>
                {availableHabitsForFilter.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
              </select>
            </div>

            {/* Lesson Filter */}
            <div className="relative w-full md:w-48">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <select 
                value={lessonFilter} onChange={(e) => setLessonFilter(e.target.value)}
                className="pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 w-full bg-white appearance-none font-medium text-slate-600 truncate"
              >
                <option value="All">All Lessons</option>
                {availableLessonsForFilter.map(l => <option key={l.id} value={l.id}>{l.title}</option>)}
              </select>
            </div>

          </div>
          <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-500 tracking-wider shrink-0 mt-4 xl:mt-0">
            Total Questions: {filteredMcqs.length}
          </div>
        </div>

        {/* DATA TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider w-1/3">Question details</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Mapping</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Type / Rule</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Order</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                // LOADING SKELETON
                [...Array(5)].map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-64 mb-2"></div><div className="h-3 bg-slate-100 rounded w-32"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-48"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-32 mb-1"></div><div className="h-3 bg-slate-100 rounded w-24"></div></td>
                    <td className="px-6 py-4"><div className="h-8 w-8 bg-slate-200 rounded-full"></div></td>
                    <td className="px-6 py-4 flex justify-end gap-2"><div className="h-8 w-8 bg-slate-200 rounded-lg"></div><div className="h-8 w-8 bg-slate-200 rounded-lg"></div></td>
                  </tr>
                ))
              ) : filteredMcqs.length === 0 ? (
                // EMPTY STATE
                <tr>
                  <td colSpan="5" className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <ListChecks size={48} className="mb-4 opacity-20" />
                      <p className="text-lg font-semibold text-slate-600">No questions created yet</p>
                      <p className="text-sm mt-1">Start building evaluations by adding questions.</p>
                      <button onClick={openAddModal} className="mt-4 text-purple-600 font-medium hover:underline">
                        + Add Question
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                // ACTUAL DATA
                filteredMcqs.map((mcq) => {
                  const lesson = getLesson(mcq.lesson_id);
                  const habit = lesson ? getHabit(lesson.habit_id) : null;
                  const domain = habit ? getDomain(habit.domain_id) : null;

                  return (
                    <tr key={mcq.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-6 py-4 whitespace-normal">
                        <div className="font-bold text-slate-800 line-clamp-2">{mcq.question_text}</div>
                        {mcq.question_type === 'mcq' && mcq.correct_option ? (
                          <div className="text-xs font-semibold text-emerald-600 mt-1 flex items-center gap-1">
                            <CheckCircle2 size={12}/> {mcq.correct_option}
                          </div>
                        ) : mcq.question_type === 'mcq' ? (
                          <div className="text-xs font-semibold text-slate-400 mt-1 flex items-center gap-1">
                            No correct answer required
                          </div>
                        ) : (
                          <div className="text-xs font-semibold text-blue-500 mt-1 flex items-center gap-1">
                            <AlignLeft size={12}/> Open text response
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-700 flex items-center gap-1.5 mb-1">
                          {lesson ? (
                            <><BookOpen size={14} className="text-orange-400"/> {lesson.title}</>
                          ) : (
                            <><Globe size={14} className="text-purple-400"/> Global Form</>
                          )}
                        </div>
                        {lesson && (
                          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400 mt-1">
                            <Repeat size={12} className="text-rose-400" /> {habit ? habit.name : '-'}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 mb-1.5">
                          {mcq.question_type === 'text' ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 border border-blue-200">TEXT INPUT</span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-700 border border-purple-200">MULTIPLE CHOICE</span>
                          )}
                        </div>
                        <div>
                          {mcq.is_optional ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200">OPTIONAL</span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200">REQUIRED</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold text-sm border border-slate-200">
                          {mcq.question_order || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => openEditModal(mcq)}
                          className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          title="Edit Question"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => openDeleteModal(mcq)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Question"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- ADD/EDIT MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <ListChecks className="text-purple-500"/>
                {modalMode === 'add' ? 'Create Question' : 'Edit Question Details'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSaveMcq} className="p-6 max-h-[80vh] overflow-y-auto">
              <div className="space-y-6">
                
                {/* Row 1: Scope & Lesson */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                  <label className="block text-sm font-bold text-slate-700 mb-3">Question Scope *</label>
                  <div className="flex flex-col sm:flex-row gap-4 mb-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" name="scope" value="lesson" 
                        checked={currentMcq.scope === 'lesson'} 
                        onChange={() => setCurrentMcq({...currentMcq, scope: 'lesson'})} 
                        className="w-4 h-4 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-sm font-bold text-slate-700">Lesson Specific</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" name="scope" value="global" 
                        checked={currentMcq.scope === 'global'} 
                        onChange={() => setCurrentMcq({...currentMcq, scope: 'global', lesson_id: ''})} 
                        className="w-4 h-4 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-sm font-bold text-slate-700">Global (All Lessons)</span>
                    </label>
                  </div>
                  
                  {currentMcq.scope === 'lesson' && (
                    <div className="animate-in fade-in duration-300 pt-2 border-t border-slate-200">
                      <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                        <BookOpen size={14} className="text-orange-500"/> Select Lesson *
                      </label>
                      <select 
                        required
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium text-slate-800 bg-white"
                        value={currentMcq.lesson_id}
                        onChange={(e) => setCurrentMcq({...currentMcq, lesson_id: e.target.value})}
                      >
                        <option value="" disabled>Select a lesson</option>
                        {lessons.map(l => {
                           const habit = getHabit(l.habit_id);
                           return (
                             <option key={l.id} value={l.id}>
                               {l.title} {habit ? `(${habit.name})` : ''}
                             </option>
                           )
                        })}
                      </select>
                    </div>
                  )}
                </div>

                {/* Row 2: Type, Optional Toggle & Order */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="md:col-span-1">
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Question Format *</label>
                    <select 
                      required
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium text-slate-800 bg-white"
                      value={currentMcq.question_type}
                      onChange={(e) => setCurrentMcq({...currentMcq, question_type: e.target.value, correct_option: ''})}
                    >
                      <option value="mcq">Multiple Choice</option>
                      <option value="text">Text Input</option>
                    </select>
                  </div>

                  <div className="md:col-span-1">
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Requirement *</label>
                    <select 
                      required
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium text-slate-800 bg-white"
                      value={currentMcq.is_optional ? 'true' : 'false'}
                      onChange={(e) => setCurrentMcq({...currentMcq, is_optional: e.target.value === 'true'})}
                    >
                      <option value="false">Mandatory / Required</option>
                      <option value="true">Optional</option>
                    </select>
                  </div>

                  <div className="md:col-span-1">
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Question Order *</label>
                    <input 
                      type="number" required min="1"
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium text-slate-800"
                      placeholder="e.g., 1"
                      value={currentMcq.question_order}
                      onChange={(e) => setCurrentMcq({...currentMcq, question_order: e.target.value})}
                    />
                  </div>
                </div>

                {/* Row 3: Question Text */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <HelpCircle size={14} className="text-purple-500"/> Question Prompt *
                  </label>
                  <textarea 
                    required rows="3"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium text-slate-800 resize-none"
                    placeholder="Enter the question text here..."
                    value={currentMcq.question_text}
                    onChange={(e) => setCurrentMcq({...currentMcq, question_text: e.target.value})}
                  ></textarea>
                </div>

                {/* Row 4: Multiple Choice Options (Only if type == mcq) */}
                {currentMcq.question_type === 'mcq' && (
                  <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4 animate-in fade-in duration-300">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-slate-800">Answer Options (Min 2, Max 4)</h4>
                      {currentMcq.options.length < 4 && (
                        <button 
                          type="button" 
                          onClick={addOption}
                          className="text-xs font-bold text-purple-600 bg-purple-100 hover:bg-purple-200 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
                        >
                          <PlusCircle size={14} /> Add Option
                        </button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 gap-3">
                      {currentMcq.options.map((option, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <span className="font-bold text-slate-400 text-sm w-6">{index + 1}.</span>
                          <input 
                            type="text" required
                            className="flex-1 px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium text-slate-800"
                            placeholder={`Option ${index + 1} text`}
                            value={option}
                            onChange={(e) => handleOptionChange(index, e.target.value)}
                          />
                          <button
                            type="button"
                            onClick={() => removeOption(index)}
                            disabled={currentMcq.options.length <= 2}
                            className={`p-2 rounded-lg transition-colors ${
                              currentMcq.options.length <= 2 
                                ? 'text-slate-300 cursor-not-allowed' 
                                : 'text-slate-400 hover:text-red-500 hover:bg-red-50'
                            }`}
                            title={currentMcq.options.length <= 2 ? "Minimum 2 options required" : "Remove Option"}
                          >
                            <MinusCircle size={18} />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-200">
                      <label className="block text-sm font-bold text-emerald-700 mb-1.5 flex items-center gap-1.5">
                        <CheckCircle2 size={16}/> Correct Answer (Optional)
                      </label>
                      <p className="text-xs text-slate-500 mb-2">Leave blank if there is no right or wrong answer.</p>
                      <select 
                        className="w-full px-4 py-2.5 border border-emerald-200 bg-emerald-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-emerald-800"
                        value={currentMcq.correct_option}
                        onChange={(e) => setCurrentMcq({...currentMcq, correct_option: e.target.value})}
                      >
                        <option value="">-- No Correct Answer --</option>
                        {currentMcq.options.map((opt, i) => (
                          opt.trim() !== '' && (
                            <option key={i} value={opt}>{opt}</option>
                          )
                        ))}
                      </select>
                    </div>
                  </div>
                )}

              </div>

              {/* Modal Footer */}
              <div className="flex gap-3 justify-end mt-8 pt-6 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2.5 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-2.5 rounded-xl font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-sm shadow-purple-200 transition-colors"
                >
                  {modalMode === 'add' ? 'Save Question' : 'Update Details'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- DELETE CONFIRMATION MODAL --- */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-center p-8">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={32} />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">Delete Question?</h3>
            <p className="text-slate-500 font-medium mb-8">
              Are you sure you want to delete this question? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-center">
              <button 
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 px-5 py-2.5 rounded-xl font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteMcq}
                className="flex-1 px-5 py-2.5 rounded-xl font-semibold bg-red-600 hover:bg-red-700 text-white shadow-sm shadow-red-200 transition-colors"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- TOAST NOTIFICATION --- */}
      {toast.show && (
        <div className="fixed bottom-6 right-6 z-[70] animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className={`flex items-center gap-3 px-5 py-4 rounded-2xl shadow-xl border ${
            toast.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-red-50 border-red-100 text-red-800'
          }`}>
            {toast.type === 'success' ? <CheckCircle2 size={20} className="text-emerald-500" /> : <AlertTriangle size={20} className="text-red-500" />}
            <span className="font-semibold">{toast.message}</span>
            <button onClick={() => setToast({ ...toast, show: false })} className="ml-4 opacity-50 hover:opacity-100 transition-opacity">
              <X size={16} />
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default McqQuestions;
import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  AlertTriangle,
  X,
  CheckCircle2,
  BookOpen,
  Filter,
  FileText,
  Clock,
  GraduationCap,
  Download
} from 'lucide-react';
import api from '../api/axios';

const initialLessonState = {
  title: '',
  habit_id: '',
  class_number: '',
  duration_minutes: '',
  lesson_pdf: null,
  teacher_guide: null
};

const Lessons = () => {
  const [lessons, setLessons] = useState([]);
  const [habits, setHabits] = useState([]);
  const [domains, setDomains] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filtering States
  const [searchQuery, setSearchQuery] = useState('');
  const [domainFilter, setDomainFilter] = useState('All');
  const [habitFilter, setHabitFilter] = useState('All');
  const [classFilter, setClassFilter] = useState('All');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [currentLesson, setCurrentLesson] = useState(initialLessonState);
  
  // Delete Confirmation State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [lessonToDelete, setLessonToDelete] = useState(null);

  // Toast Notification State
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Fetch Data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [lessonsRes, habitsRes, domainsRes] = await Promise.all([
        api.get('/lessons'),
        api.get('/habits'),
        api.get('/domains')
      ]);
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
    setCurrentLesson(initialLessonState);
    setIsModalOpen(true);
  };

  const openEditModal = (lesson) => {
    setModalMode('edit');
    setCurrentLesson({
      id: lesson.id,
      title: lesson.title,
      habit_id: lesson.habit_id || '',
      class_number: lesson.class_number || '',
      duration_minutes: lesson.duration_minutes || '',
      // We don't pre-populate file objects. If null, the backend should keep existing files.
      lesson_pdf: null, 
      teacher_guide: null
    });
    setIsModalOpen(true);
  };

  const openDeleteModal = (lesson) => {
    setLessonToDelete(lesson);
    setIsDeleteModalOpen(true);
  };

  // CRUD Operations (multipart/form-data)
  const handleSaveLesson = async (e) => {
    e.preventDefault();
    
    // Construct FormData for multipart upload
    const formData = new FormData();
    formData.append('title', currentLesson.title);
    formData.append('habit_id', currentLesson.habit_id);
    formData.append('class_number', currentLesson.class_number);
    if (currentLesson.duration_minutes) {
      formData.append('duration_minutes', currentLesson.duration_minutes);
    }
    
    // Only append files if they are actually selected (useful for Edit mode)
    if (currentLesson.lesson_pdf) {
      formData.append('lesson_pdf', currentLesson.lesson_pdf);
    }
    if (currentLesson.teacher_guide) {
      formData.append('teacher_guide', currentLesson.teacher_guide);
    }

    try {
      if (modalMode === 'add') {
        await api.post('/lessons', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        showToast('Lesson created successfully!');
      } else {
        await api.put(`/lessons/${currentLesson.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        showToast('Lesson updated successfully!');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to save lesson details.', 'error');
    }
  };

  const handleDeleteLesson = async () => {
    if (!lessonToDelete) return;
    try {
      await api.delete(`/lessons/${lessonToDelete.id}`);
      showToast('Lesson removed successfully!');
      setIsDeleteModalOpen(false);
      fetchData();
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to delete lesson.', 'error');
    }
  };

  // Helpers to resolve relationships
  const getHabit = (habitId) => habits.find(h => h.id === habitId);
  const getDomain = (domainId) => domains.find(d => d.id === domainId);

  // Filtering Logic
  const filteredLessons = lessons.filter(lesson => {
    const habit = getHabit(lesson.habit_id);
    const domainId = habit ? habit.domain_id : null;

    const matchesSearch = lesson.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClass = classFilter === 'All' || lesson.class_number?.toString() === classFilter;
    const matchesHabit = habitFilter === 'All' || lesson.habit_id?.toString() === habitFilter;
    const matchesDomain = domainFilter === 'All' || domainId?.toString() === domainFilter;

    return matchesSearch && matchesClass && matchesHabit && matchesDomain;
  });

  // Dynamic Habit Options based on selected Domain Filter
  const availableHabitsForFilter = domainFilter === 'All' 
    ? habits 
    : habits.filter(h => h.domain_id?.toString() === domainFilter);

  // Extract unique classes for the filter dropdown
  const uniqueClasses = [...new Set(lessons.map(l => l.class_number))].filter(Boolean).sort();

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto min-h-screen bg-[#fafafa] text-slate-800 font-sans">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-bold tracking-wider uppercase flex items-center gap-1.5">
              <BookOpen size={14} /> Curriculum Content
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">
            Lesson Management
          </h1>
          <p className="text-slate-500 mt-1 font-medium">Upload and manage learning materials, PDFs, and teacher guides.</p>
        </div>
        <button 
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-semibold shadow-sm shadow-orange-200 transition-all duration-200"
        >
          <Plus size={18} />
          Add Lesson
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
                type="text" placeholder="Search lessons..." 
                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 w-full bg-white transition-shadow"
              />
            </div>
            
            {/* Domain Filter */}
            <div className="relative w-full md:w-48">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <select 
                value={domainFilter} 
                onChange={(e) => {
                  setDomainFilter(e.target.value);
                  setHabitFilter('All'); // Reset habit filter when domain changes
                }}
                className="pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 w-full bg-white appearance-none font-medium text-slate-600 truncate"
              >
                <option value="All">All Domains</option>
                {domains.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>

            {/* Habit Filter */}
            <div className="relative w-full md:w-48">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <select 
                value={habitFilter} onChange={(e) => setHabitFilter(e.target.value)}
                className="pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 w-full bg-white appearance-none font-medium text-slate-600 truncate"
              >
                <option value="All">All Habits</option>
                {availableHabitsForFilter.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
              </select>
            </div>

            {/* Class Filter */}
            <div className="relative w-full md:w-32">
              <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <select 
                value={classFilter} onChange={(e) => setClassFilter(e.target.value)}
                className="pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 w-full bg-white appearance-none font-medium text-slate-600"
              >
                <option value="All">All Classes</option>
                {uniqueClasses.map(c => <option key={c} value={c}>Class {c}</option>)}
              </select>
            </div>

          </div>
          <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-500 tracking-wider shrink-0">
            Total Lessons: {filteredLessons.length}
          </div>
        </div>

        {/* DATA TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Lesson Info</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Curriculum mapping</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Logistics</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Materials</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                // LOADING SKELETON
                [...Array(5)].map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-48"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-32 mb-1"></div><div className="h-3 bg-slate-100 rounded w-24"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-20 mb-1"></div><div className="h-3 bg-slate-100 rounded w-16"></div></td>
                    <td className="px-6 py-4 flex gap-2"><div className="h-8 w-24 bg-slate-200 rounded-lg"></div></td>
                    <td className="px-6 py-4 text-right"><div className="h-8 w-16 bg-slate-200 rounded-lg inline-block"></div></td>
                  </tr>
                ))
              ) : filteredLessons.length === 0 ? (
                // EMPTY STATE
                <tr>
                  <td colSpan="5" className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <FileText size={48} className="mb-4 opacity-20" />
                      <p className="text-lg font-semibold text-slate-600">No lessons created yet</p>
                      <p className="text-sm mt-1">Upload your first lesson PDF to get started.</p>
                      <button onClick={openAddModal} className="mt-4 text-orange-500 font-medium hover:underline">
                        + Add Lesson
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                // ACTUAL DATA
                filteredLessons.map((lesson) => {
                  const habit = getHabit(lesson.habit_id);
                  const domain = habit ? getDomain(habit.domain_id) : null;

                  return (
                    <tr key={lesson.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-800">{lesson.title}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-700">{habit ? habit.name : 'Unknown Habit'}</div>
                        <div className="text-xs font-medium text-slate-400 mt-1">{domain ? domain.name : 'Unknown Domain'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                          <GraduationCap size={14} className="text-orange-400" /> Class {lesson.class_number}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mt-1">
                          <Clock size={12} className="text-slate-400" /> {lesson.duration_minutes || '-'} mins
                        </div>
                      </td>
                      <td className="px-6 py-4 space-y-2">
                        {lesson.lesson_pdf_url ? (
                          <a 
                            href={lesson.lesson_pdf_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-bold transition-colors mr-2"
                          >
                            <FileText size={14} /> View Lesson
                          </a>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-400 rounded-lg text-xs font-bold mr-2">No PDF</span>
                        )}

                        {lesson.teacher_guide_url && (
                          <a 
                            href={lesson.teacher_guide_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-bold transition-colors"
                          >
                            <BookOpen size={14} /> View Guide
                          </a>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => openEditModal(lesson)}
                          className="p-2 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                          title="Edit Lesson"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => openDeleteModal(lesson)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Lesson"
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
              <h3 className="text-xl font-bold text-slate-800">
                {modalMode === 'add' ? 'Upload New Lesson' : 'Edit Lesson Details'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSaveLesson} className="p-6 max-h-[80vh] overflow-y-auto">
              <div className="space-y-6">
                
                {/* Text Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Lesson Title *</label>
                    <input 
                      type="text" required
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium text-slate-800"
                      placeholder="e.g., The Magic of Hydration"
                      value={currentLesson.title}
                      onChange={(e) => setCurrentLesson({...currentLesson, title: e.target.value})}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Associated Habit *</label>
                    <select 
                      required
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium text-slate-800 bg-white"
                      value={currentLesson.habit_id}
                      onChange={(e) => setCurrentLesson({...currentLesson, habit_id: e.target.value})}
                    >
                      <option value="" disabled>Select a habit</option>
                      {habits.map(h => {
                         const domain = getDomain(h.domain_id);
                         return (
                           <option key={h.id} value={h.id}>
                             {h.name} {domain ? `(${domain.name})` : ''}
                           </option>
                         )
                      })}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Class Number *</label>
                    <input 
                      type="number" required min="1" max="12"
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium text-slate-800"
                      placeholder="e.g., 5"
                      value={currentLesson.class_number}
                      onChange={(e) => setCurrentLesson({...currentLesson, class_number: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Duration (Minutes)</label>
                    <input 
                      type="number" min="1"
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium text-slate-800"
                      placeholder="e.g., 30"
                      value={currentLesson.duration_minutes}
                      onChange={(e) => setCurrentLesson({...currentLesson, duration_minutes: e.target.value})}
                    />
                  </div>
                </div>

                {/* File Uploads */}
                <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                  <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <Download size={16} className="text-orange-500"/> Material Uploads
                  </h4>
                  {modalMode === 'edit' && (
                    <p className="text-xs font-medium text-amber-600 bg-amber-50 p-2 rounded-lg border border-amber-200">
                      Leave file inputs empty if you do not wish to overwrite existing materials.
                    </p>
                  )}
                  
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Lesson PDF {modalMode === 'add' ? '*' : ''}</label>
                    <input 
                      type="file" accept="application/pdf"
                      required={modalMode === 'add'}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100 transition-all cursor-pointer"
                      onChange={(e) => setCurrentLesson({...currentLesson, lesson_pdf: e.target.files[0]})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Teacher Guide (Optional)</label>
                    <input 
                      type="file" accept="application/pdf"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 transition-all cursor-pointer"
                      onChange={(e) => setCurrentLesson({...currentLesson, teacher_guide: e.target.files[0]})}
                    />
                  </div>
                </div>

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
                  className="px-6 py-2.5 rounded-xl font-bold bg-orange-500 hover:bg-orange-600 text-white shadow-sm shadow-orange-200 transition-colors"
                >
                  {modalMode === 'add' ? 'Upload Lesson' : 'Save Changes'}
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
            <h3 className="text-2xl font-bold text-slate-800 mb-2">Delete Lesson?</h3>
            <p className="text-slate-500 font-medium mb-8">
              Are you sure you want to delete <strong className="text-slate-700">"{lessonToDelete?.title}"</strong>? This will permanently remove the associated PDF files.
            </p>
            <div className="flex gap-3 justify-center">
              <button 
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 px-5 py-2.5 rounded-xl font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteLesson}
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

export default Lessons;
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { School, Plus, X, Loader2, AlertCircle, CheckCircle, Trash2, Layers } from 'lucide-react';
import api from '../../services/api';

const Classes = () => {
  const location = useLocation();
  const [classesData, setClassesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  // Bulk Add Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newClasses, setNewClasses] = useState([{ id: Date.now(), class_number: '', sections: '' }]);

  // Specific "Add Section" Modal State
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  const [activeClassNum, setActiveClassNum] = useState(null);
  const [newSectionsValue, setNewSectionsValue] = useState('');

  const fetchClasses = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/school/classes');
      setClassesData(response.data.data || response.data || []);
    } catch (err) {
      console.error("Failed to fetch classes:", err);
      setError("Unable to load classes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchClasses();

    if (location.search.includes('setup=true')) {
      setIsModalOpen(true);
    }
  }, [location]);

  // --- Bulk Add Handlers ---
  const handleAddRow = () => setNewClasses([...newClasses, { id: Date.now(), class_number: '', sections: '' }]);
  const handleRemoveRow = (id) => setNewClasses(newClasses.filter(c => c.id !== id));
  
  const handleChange = (id, field, value) => {
    setNewClasses(newClasses.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const handleSubmitBulkClasses = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const formattedPayload = newClasses.map(cls => {
      const sectionArray = cls.sections.trim() 
        ? cls.sections.split(',').map(s => s.trim().toUpperCase()).filter(s => s) 
        : [""]; 

      return {
        class_number: parseInt(cls.class_number, 10),
        sections: sectionArray
      };
    });

    try {
      await api.post('/school/classes', { classes: formattedPayload });
      setSuccessMsg("Classes added successfully!");
      setIsModalOpen(false);
      setNewClasses([{ id: Date.now(), class_number: '', sections: '' }]);
      fetchClasses();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error("Bulk add error:", err);
      setError("Failed to add classes. Check for duplicate entries.");
    } finally {
      setSubmitting(false);
    }
  };

  // --- Individual Section Handlers ---
  const handleDeleteSection = async (id, classNumber, section) => {
    const sectionName = section ? `Section ${section}` : "No Section";
    if (!window.confirm(`Delete Class ${classNumber} - ${sectionName}? This may affect assigned teachers.`)) return;
    
    try {
      await api.delete(`/school/classes/${id}`);
      setSuccessMsg(`Class ${classNumber} (${sectionName}) deleted.`);
      fetchClasses();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) { 
      alert("Failed to delete section."); 
    }
  };

  // Opens the beautiful new modal instead of window.prompt
  const openAddSectionModal = (classNumber) => {
    setActiveClassNum(classNumber);
    setNewSectionsValue('');
    setIsSectionModalOpen(true);
  };

  // Submits the new sections from the custom modal
  const handleSubmitNewSections = async (e) => {
    e.preventDefault();
    if (!newSectionsValue.trim()) return;

    setSubmitting(true);
    
    // Split by commas, clean up spaces, make uppercase, and remove empty entries
    const formattedSections = newSectionsValue.split(',').map(s => s.trim().toUpperCase()).filter(s => s);

    try {
      await api.post('/school/classes', { 
        classes: [{ 
          class_number: parseInt(activeClassNum), 
          sections: formattedSections 
        }] 
      });
      setSuccessMsg(`Sections added to Class ${activeClassNum}.`);
      setIsSectionModalOpen(false);
      fetchClasses();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) { 
      console.error(err);
      setError("Failed to add sections. They might already exist.");
    } finally {
      setSubmitting(false);
    }
  };

  // --- Data Processing & Filtering ---
  const groupedClasses = classesData.reduce((acc, curr) => {
    if (!acc[curr.class_number]) acc[curr.class_number] = [];
    acc[curr.class_number].push(curr);
    return acc;
  }, {});

  // SMART FILTER: If a class has real sections (A, B), hide the empty "No Section" placeholder
  Object.keys(groupedClasses).forEach(classNum => {
    const sections = groupedClasses[classNum];
    const hasValidSections = sections.some(s => s.section && s.section.trim() !== '');
    if (hasValidSections) {
      // Keep only the ones that actually have a section letter
      groupedClasses[classNum] = sections.filter(s => s.section && s.section.trim() !== '');
    }
  });

  const sortedClassNumbers = Object.keys(groupedClasses).map(Number).sort((a, b) => a - b);

  if (loading && classesData.length === 0) {
    return <div className="flex justify-center p-10"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      
      <div className="flex justify-between items-center gap-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <School className="w-6 h-6 text-blue-600" /> Manage Classes
        </h1>
        <button 
          onClick={() => setIsModalOpen(true)} 
          className="bg-blue-600 text-white font-bold py-2.5 px-4 rounded-xl flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" /> Add Classes
        </button>
      </div>

      {successMsg && (
        <div className="p-4 bg-green-50 text-green-700 rounded-xl flex gap-2 border border-green-100">
          <CheckCircle className="w-5 h-5 shrink-0" />{successMsg}
        </div>
      )}

      {error && !isModalOpen && !isSectionModalOpen && (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm flex gap-2 border border-red-100">
          <AlertCircle className="w-5 h-5 shrink-0" />{error}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="hidden md:grid grid-cols-12 gap-4 p-4 bg-gray-50 border-b font-bold text-gray-500 uppercase text-xs">
          <div className="col-span-3">Class</div>
          <div className="col-span-6">Sections</div>
          <div className="col-span-3 text-right">Actions</div>
        </div>

        <div className="divide-y divide-gray-100">
          {sortedClassNumbers.length > 0 ? sortedClassNumbers.map((classNum) => (
            <div key={classNum} className="p-5 md:p-4 md:grid md:grid-cols-12 md:items-center gap-4 flex flex-col hover:bg-gray-50 transition-colors">
              
              <div className="md:col-span-3 flex items-center gap-3">
                <div className="bg-blue-50 text-blue-600 p-2.5 rounded-lg"><Layers className="w-5 h-5" /></div>
                <p className="font-bold text-gray-900 text-lg">Class {classNum}</p>
              </div>

              <div className="md:col-span-6 flex flex-wrap gap-2">
                {groupedClasses[classNum]
                  .sort((a,b) => (a.section || "").localeCompare(b.section || ""))
                  .map(sec => (
                  <div key={sec.id} className="flex items-center gap-1.5 bg-gray-100 text-gray-700 font-bold px-3 py-1.5 rounded-lg border border-gray-200 group">
                    <span className="text-sm">{sec.section ? `Sec ${sec.section}` : "No Section"}</span>
                    <button 
                      onClick={() => handleDeleteSection(sec.id, classNum, sec.section)} 
                      className="text-gray-400 hover:text-red-500 transition-colors"
                      title="Delete"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="md:col-span-3 flex justify-end pt-3 md:pt-0">
                <button 
                  onClick={() => openAddSectionModal(classNum)} 
                  className="flex items-center gap-1.5 px-4 py-2 bg-blue-50 text-blue-700 font-bold rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors"
                >
                  <Plus className="w-4 h-4" /> Add Section
                </button>
              </div>

            </div>
          )) : (
            <div className="p-8 text-center flex flex-col items-center">
              <School className="w-12 h-12 text-gray-300 mb-3" />
              <p className="text-gray-500 font-medium">No classes configured yet.</p>
              <button onClick={() => setIsModalOpen(true)} className="mt-4 text-blue-600 font-bold hover:underline">
                Create your first class
              </button>
            </div>
          )}
        </div>
      </div>

      {/* --- MODAL 1: BULK ADD CLASSES --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-600" /> 
                {location.search.includes('setup=true') ? "Welcome! Let's Set Up Your Classes" : "Add Classes & Sections"}
              </h2>
              <button onClick={() => setIsModalOpen(false)}><X className="w-5 h-5 text-gray-400 hover:text-gray-700" /></button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4">
              <form id="bulk-class-form" onSubmit={handleSubmitBulkClasses} className="space-y-3">
                {newClasses.map((cls) => (
                  <div key={cls.id} className="flex flex-col sm:flex-row gap-4 sm:items-end bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <div className="w-full sm:w-1/3">
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Class</label>
                      <input 
                        type="number" 
                        required 
                        placeholder="e.g. 5" 
                        min="1" max="12"
                        value={cls.class_number} 
                        onChange={(e) => handleChange(cls.id, 'class_number', e.target.value)} 
                        className="w-full border border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none" 
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Sections (Optional)</label>
                      <input 
                        type="text" 
                        placeholder="A, B, C (leave blank if none)" 
                        value={cls.sections} 
                        onChange={(e) => handleChange(cls.id, 'sections', e.target.value)} 
                        className="w-full border border-gray-200 rounded-lg p-3 uppercase placeholder:normal-case placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 outline-none" 
                      />
                    </div>
                    {newClasses.length > 1 && (
                      <button type="button" onClick={() => handleRemoveRow(cls.id)} className="p-3 mt-2 sm:mt-0 self-end text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors rounded-lg">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
              </form>

              <button type="button" onClick={handleAddRow} className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-bold flex items-center justify-center gap-2 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                <Plus className="w-5 h-5" /> Add Another Class
              </button>
            </div>

            <div className="p-4 border-t bg-gray-50 flex gap-3">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-white text-gray-700 font-bold rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button type="submit" form="bulk-class-form" disabled={submitting} className="flex-1 bg-blue-600 text-white font-bold rounded-xl flex justify-center items-center hover:bg-blue-700 transition-colors disabled:opacity-50">
                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Classes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 2: ADD SECTION TO EXISTING CLASS --- */}
      {isSectionModalOpen && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col">
            
            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
              <h2 className="text-lg font-bold flex items-center gap-2 text-gray-900">
                <Layers className="w-5 h-5 text-blue-600" /> Add Sections
              </h2>
              <button onClick={() => setIsSectionModalOpen(false)}><X className="w-5 h-5 text-gray-400 hover:text-gray-700" /></button>
            </div>

            <div className="p-5">
              <div className="mb-4">
                <p className="text-sm text-gray-500">
                  Adding new sections to <span className="font-bold text-gray-900">Class {activeClassNum}</span>.
                </p>
              </div>

              <form id="add-section-form" onSubmit={handleSubmitNewSections} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                    Sections (Comma Separated)
                  </label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. A, B, C" 
                    value={newSectionsValue} 
                    onChange={(e) => setNewSectionsValue(e.target.value)} 
                    className="w-full border border-gray-200 rounded-lg p-3 uppercase placeholder:normal-case placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 outline-none" 
                    autoFocus
                  />
                  <p className="text-xs text-gray-400 mt-2">You can add multiple sections at once by separating them with a comma.</p>
                </div>
              </form>
            </div>

            <div className="p-4 border-t bg-gray-50 flex gap-3">
              <button type="button" onClick={() => setIsSectionModalOpen(false)} className="flex-1 py-3 bg-white text-gray-700 font-bold rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button type="submit" form="add-section-form" disabled={submitting} className="flex-1 bg-blue-600 text-white font-bold rounded-xl flex justify-center items-center hover:bg-blue-700 transition-colors disabled:opacity-50">
                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Sections"}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Classes;
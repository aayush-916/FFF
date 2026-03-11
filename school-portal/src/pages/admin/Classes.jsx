import { useState, useEffect } from 'react';
import { School, Plus, X, Loader2, AlertCircle, CheckCircle, Trash2, Layers } from 'lucide-react';
import api from '../../services/api';

const Classes = () => {
  const [classesData, setClassesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  // Bulk Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newClasses, setNewClasses] = useState([{ id: Date.now(), class_number: '', sections: '' }]);

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
  }, []);

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

    // Format data for the backend (converts "A, B, C" into an array ["A", "B", "C"])
    const formattedPayload = newClasses.map(cls => ({
      class_number: parseInt(cls.class_number, 10),
      sections: cls.sections.split(',').map(s => s.trim().toUpperCase()).filter(s => s)
    }));

    try {
      await api.post('/school/classes', { classes: formattedPayload });
      setSuccessMsg("Classes and sections added successfully!");
      setIsModalOpen(false);
      setNewClasses([{ id: Date.now(), class_number: '', sections: '' }]); // Reset form
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
    if (!window.confirm(`Delete Class ${classNumber} - Section ${section}? This may affect assigned teachers.`)) return;
    try {
      await api.delete(`/school/classes/${id}`);
      setSuccessMsg(`Section ${section} deleted.`);
      fetchClasses();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) { 
      alert("Failed to delete section."); 
    }
  };

  const handleAddSingleSection = async (classNumber) => {
    const newSection = window.prompt(`Add a new section for Class ${classNumber} (e.g., C):`);
    if (!newSection || !newSection.trim()) return;
    
    try {
      // Re-use the bulk endpoint logic, but just for a single entry
      await api.post('/school/classes', { 
        classes: [{ 
          class_number: parseInt(classNumber), 
          sections: [newSection.trim().toUpperCase()] 
        }] 
      });
      setSuccessMsg(`Section ${newSection.toUpperCase()} added to Class ${classNumber}.`);
      fetchClasses();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) { 
      alert("Failed to add section."); 
    }
  };

  // Group data by class number for display
  const groupedClasses = classesData.reduce((acc, curr) => {
    if (!acc[curr.class_number]) acc[curr.class_number] = [];
    acc[curr.class_number].push(curr);
    return acc;
  }, {});
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
        <div className="p-4 bg-green-50 text-green-700 rounded-xl flex gap-2">
          <CheckCircle className="w-5 h-5 shrink-0" />{successMsg}
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
            <div key={classNum} className="p-5 md:p-4 md:grid md:grid-cols-12 md:items-center gap-4 flex flex-col hover:bg-gray-50">
              
              <div className="md:col-span-3 flex items-center gap-3">
                <div className="bg-blue-50 text-blue-600 p-2.5 rounded-lg"><Layers className="w-5 h-5" /></div>
                <p className="font-bold text-gray-900 text-lg">Class {classNum}</p>
              </div>

              <div className="md:col-span-6 flex flex-wrap gap-2">
                {groupedClasses[classNum].sort((a,b) => a.section.localeCompare(b.section)).map(sec => (
                  <div key={sec.id} className="flex items-center gap-1.5 bg-gray-100 text-gray-700 font-bold px-3 py-1.5 rounded-lg border group">
                    <span className="text-sm">Sec {sec.section}</span>
                    <button onClick={() => handleDeleteSection(sec.id, classNum, sec.section)} className="text-gray-400 hover:text-red-500">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="md:col-span-3 flex justify-end pt-3 md:pt-0">
                <button onClick={() => handleAddSingleSection(classNum)} className="flex items-center gap-1.5 px-4 py-2 bg-blue-50 text-blue-700 font-bold rounded-lg border border-blue-100 hover:bg-blue-100">
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

      {/* --- BULK ADD MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-600" /> Add Multiple Classes
              </h2>
              <button onClick={() => setIsModalOpen(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4">
              {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm flex gap-2"><AlertCircle className="w-4 h-4 shrink-0" />{error}</div>}

              <form id="bulk-class-form" onSubmit={handleSubmitBulkClasses} className="space-y-3">
                {newClasses.map((cls) => (
                  <div key={cls.id} className="flex gap-4 items-end bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <div className="w-1/3">
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Class</label>
                      <input 
                        type="number" 
                        required 
                        placeholder="e.g. 5" 
                        min="1"
                        max="12"
                        value={cls.class_number} 
                        onChange={(e) => handleChange(cls.id, 'class_number', e.target.value)} 
                        className="w-full border rounded-lg p-3" 
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Sections (Comma Separated)</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="A, B, C" 
                        value={cls.sections} 
                        onChange={(e) => handleChange(cls.id, 'sections', e.target.value)} 
                        className="w-full border rounded-lg p-3 uppercase" 
                      />
                    </div>
                    {newClasses.length > 1 && (
                      <button type="button" onClick={() => handleRemoveRow(cls.id)} className="p-3 text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors rounded-lg">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
              </form>

              <button type="button" onClick={handleAddRow} className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-bold flex items-center justify-center gap-2 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                <Plus className="w-5 h-5" /> Add Another Row
              </button>
            </div>

            <div className="p-4 border-t bg-gray-50 flex gap-3">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-white text-gray-700 font-bold rounded-xl border hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button type="submit" form="bulk-class-form" disabled={submitting} className="flex-1 bg-blue-600 text-white font-bold rounded-xl flex justify-center items-center hover:bg-blue-700 transition-colors disabled:opacity-50">
                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save All Classes"}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default Classes;
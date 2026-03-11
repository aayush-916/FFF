import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { School, Plus, Trash2, CheckCircle, AlertCircle, Loader2, Info } from 'lucide-react';
import api from '../../services/api';

const SchoolSetup = () => {
  const navigate = useNavigate();

  // Initialize with one empty class row
  const [classes, setClasses] = useState([
    { id: Date.now(), class_number: '', sections: '' }
  ]);
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Add a new empty class row
  const handleAddClass = () => {
    setClasses([...classes, { id: Date.now(), class_number: '', sections: '' }]);
  };

  // Remove a class row
  const handleRemoveClass = (id) => {
    if (classes.length === 1) return; // Keep at least one row
    setClasses(classes.filter(cls => cls.id !== id));
  };

  // Update a specific field in a class row
  const handleChange = (id, field, value) => {
    setClasses(classes.map(cls => 
      cls.id === id ? { ...cls, [field]: value } : cls
    ));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    const hasEmptyFields = classes.some(cls => !cls.class_number || !cls.sections.trim());
    if (hasEmptyFields) {
      setError("Please fill in all class numbers and sections.");
      window.scrollTo(0, 0);
      return;
    }

    // Format the payload for the backend
    const formattedClasses = classes.map(cls => ({
      class_number: parseInt(cls.class_number, 10),
      // Split by comma, trim spaces, and filter out any empty strings
      sections: cls.sections.split(',').map(s => s.trim().toUpperCase()).filter(s => s)
    }));

    // Check for duplicate classes
    const classNumbers = formattedClasses.map(c => c.class_number);
    const hasDuplicates = new Set(classNumbers).size !== classNumbers.length;
    if (hasDuplicates) {
      setError("Duplicate class numbers found. Each class should only be listed once.");
      window.scrollTo(0, 0);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await api.post('/school/setup-classes', {
        classes: formattedClasses
      });
      
      // On success, redirect to the dashboard
      navigate('/');
    } catch (err) {
      console.error("Setup error:", err);
      setError(err.response?.data?.message || "Failed to save school structure. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto md:max-w-2xl space-y-6 pb-10">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <School className="w-6 h-6 text-blue-600" />
          School Setup
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Welcome! Let's configure your school's class and section structure.
        </p>
      </div>

      {/* Information Alert */}
      <div className="bg-blue-50 p-4 rounded-xl flex gap-3 border border-blue-100">
        <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <p className="font-bold mb-1">How to set up classes:</p>
          <ul className="list-disc pl-4 space-y-1 text-blue-700/90">
            <li>Enter the numeric class value (e.g., 1, 2, 3).</li>
            <li>Type sections separated by commas (e.g., A, B, C).</li>
          </ul>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm flex items-start gap-2 border border-red-100">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Dynamic Class List */}
        <div className="space-y-3">
          {classes.map(cls => (
            <div 
              key={cls.id} 
              className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row sm:items-end gap-4 relative transition-all"
            >
              {/* Class Number Input */}
              <div className="flex-1">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                  Class Number
                </label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  placeholder="e.g. 5"
                  value={cls.class_number}
                  onChange={(e) => handleChange(cls.id, 'class_number', e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-base rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-3"
                  required
                />
              </div>

              {/* Sections Input */}
              <div className="flex-[2]">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                  Sections (Comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. A, B, C"
                  value={cls.sections}
                  onChange={(e) => handleChange(cls.id, 'sections', e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-base rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-3 uppercase"
                  required
                />
              </div>

              {/* Remove Button */}
              {classes.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveClass(cls.id)}
                  className="p-3 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Remove Class"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Add Class Button */}
        <button
          type="button"
          onClick={handleAddClass}
          className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-bold flex items-center justify-center gap-2 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Another Class
        </button>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full flex justify-center items-center gap-2 bg-blue-600 text-white font-bold rounded-xl px-4 py-4 mt-8 hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm"
        >
          {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
          Save & Complete Setup
        </button>
      </form>

    </div>
  );
};

export default SchoolSetup;
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import SchoolDashboard from './SchoolDashboard';
import TeacherDashboard from './TeacherDashboard';
import { LayoutDashboard, GraduationCap } from 'lucide-react';

const DashboardMain = () => {
  const { user } = useAuth();
  const role = String(user?.role || '').toLowerCase().trim();
  
  // State for the school_admin tabs
  const [activeTab, setActiveTab] = useState('school');

  // 1. NORMAL TEACHER -> Only sees Teacher Dashboard
  if (role === 'teacher') {
    return <TeacherDashboard />;
  }

  // 2. SCHOOL SUPER ADMIN -> Only sees School Dashboard
  if (role === 'school_super_admin') {
    return <SchoolDashboard />;
  }

  // 3. PROMOTED SCHOOL ADMIN -> Sees TABS for both!
  if (role === 'school_admin') {
    return (
      <div className="space-y-6 max-w-6xl mx-auto">
        
        {/* Toggle Tabs */}
        <div className="flex p-1 bg-gray-200/60 rounded-xl w-fit mx-auto md:mx-0">
          <button
            onClick={() => setActiveTab('school')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'school' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" /> School Overview
          </button>
          
          <button
            onClick={() => setActiveTab('teacher')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'teacher' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <GraduationCap className="w-4 h-4" /> My Classroom
          </button>
        </div>

        {/* Render the selected dashboard */}
        {activeTab === 'school' ? <SchoolDashboard /> : <TeacherDashboard />}
        
      </div>
    );
  }

  return null; // Fallback if no role
};

export default DashboardMain;
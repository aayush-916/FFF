import { NavLink } from 'react-router-dom';
import { Home, BookOpen, CheckSquare, ClipboardList, User, Users, Layers, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ isOpen, closeSidebar }) => {
  const { user } = useAuth();
  const role = String(user?.role || '').toLowerCase().trim();

  // Define all links and who is allowed to see them
  const navItems = [
    { name: 'Dashboard', path: '/', icon: Home, roles: ['teacher', 'school_admin', 'school_super_admin'] },
    { name: 'Lessons', path: '/lessons', icon: BookOpen, roles: ['teacher', 'school_admin'] },
    { name: 'Sessions', path: '/sessions', icon: CheckSquare, roles: ['teacher', 'school_admin'] },
    { name: 'Teachers', path: '/admin/teachers', icon: Users, roles: ['school_admin', 'school_super_admin'] },
    { name: 'Classes', path: '/admin/classes', icon: Layers, roles: ['school_admin', 'school_super_admin'] },
    { name: 'Assessments', path: '/assessments', icon: ClipboardList, roles: ['school_admin', 'school_super_admin'] },
    { name: 'Profile', path: '/profile', icon: User, roles: ['teacher', 'school_admin', 'school_super_admin'] },
  ];

  // Filter links based on role
  const visibleNavItems = navItems.filter(item => item.roles.includes(role));

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40 md:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar Content */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        
        {/* Logo Area */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100">
          <span className="text-xl font-black text-blue-600 tracking-tight">SchoolPortal</span>
          <button onClick={closeSidebar} className="md:hidden p-1 text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {visibleNavItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={closeSidebar}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-3 rounded-xl font-bold transition-colors ${
                  isActive 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
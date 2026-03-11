import { NavLink } from 'react-router-dom';
import { Home, BookOpen, CheckSquare, ClipboardList, User, Users, Layers } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const BottomNav = () => {
  const { user } = useAuth();
  const role = String(user?.role || '').toLowerCase().trim();

  // Define all links and who is allowed to see them
  const navItems = [
    { name: 'Home', path: '/', icon: Home, roles: ['teacher', 'school_admin', 'school_super_admin'] },
    { name: 'Lessons', path: '/lessons', icon: BookOpen, roles: ['teacher', 'school_admin'] },
    { name: 'Sessions', path: '/sessions', icon: CheckSquare, roles: ['teacher', 'school_admin'] },
    { name: 'Teachers', path: '/admin/teachers', icon: Users, roles: ['school_admin', 'school_super_admin'] },
    { name: 'Classes', path: '/admin/classes', icon: Layers, roles: ['school_admin', 'school_super_admin'] },
    { name: 'Assess', path: '/assessments', icon: ClipboardList, roles: ['school_admin', 'school_super_admin'] },
    { name: 'Profile', path: '/profile', icon: User, roles: ['teacher', 'school_admin', 'school_super_admin'] },
  ];

  const visibleNavItems = navItems.filter(item => item.roles.includes(role));

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 px-2 pb-safe pt-1">
      <div className="flex items-center overflow-x-auto hide-scrollbar justify-around">
        {visibleNavItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center min-w-[64px] py-2 px-1 transition-colors ${
                isActive ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900'
              }`
            }
          >
            <item.icon className="w-6 h-6 mb-1" />
            <span className="text-[10px] font-bold tracking-wide">{item.name}</span>
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default BottomNav;
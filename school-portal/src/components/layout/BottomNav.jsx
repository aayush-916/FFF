// import { NavLink } from 'react-router-dom';
// import { Home, BookOpen, CheckSquare, ClipboardList, User, Users, Layers } from 'lucide-react';
// import { useAuth } from '../../context/AuthContext';

// const BottomNav = () => {
//   const { user } = useAuth();
//   const role = String(user?.role || '').toLowerCase().trim();

//   // Define all links and who is allowed to see them
//   const navItems = [
//     { name: 'Home', path: '/', icon: Home, roles: ['teacher', 'school_admin', 'school_super_admin'] },
//     { name: 'Lessons', path: '/lessons', icon: BookOpen, roles: ['teacher', 'school_admin'] },
//     { name: 'Sessions', path: '/sessions', icon: CheckSquare, roles: ['teacher', 'school_admin'] },
//     { name: 'Teachers', path: '/admin/teachers', icon: Users, roles: ['school_admin', 'school_super_admin'] },
//     { name: 'Classes', path: '/admin/classes', icon: Layers, roles: ['school_admin', 'school_super_admin'] },
//     { name: 'Assess', path: '/assessments', icon: ClipboardList, roles: ['school_admin', 'school_super_admin'] },
//     { name: 'Profile', path: '/profile', icon: User, roles: ['teacher', 'school_admin', 'school_super_admin'] },
//   ];

//   const visibleNavItems = navItems.filter(item => item.roles.includes(role));

//   return (
//     <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 px-2 pb-safe pt-1">
//       <div className="flex items-center overflow-x-auto hide-scrollbar justify-around">
//         {visibleNavItems.map((item) => (
//           <NavLink
//             key={item.name}
//             to={item.path}
//             className={({ isActive }) =>
//               `flex flex-col items-center min-w-[64px] py-2 px-1 transition-colors ${
//                 isActive ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900'
//               }`
//             }
//           >
//             <item.icon className="w-6 h-6 mb-1" />
//             <span className="text-[10px] font-bold tracking-wide">{item.name}</span>
//           </NavLink>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default BottomNav;







import { NavLink } from 'react-router-dom';
import { Home, BookOpen, CheckSquare, ClipboardList, User, Users, Layers } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const BottomNav = () => {
  const { user } = useAuth();
  const role = String(user?.role || '').toLowerCase().trim();

  const navItems = [
    { name: 'Home',     path: '/',                icon: Home,          roles: ['teacher', 'school_admin', 'school_super_admin'] },
    { name: 'Lessons',  path: '/lessons',         icon: BookOpen,      roles: ['teacher', 'school_admin'] },
    { name: 'Progress', path: '/sessions',        icon: CheckSquare,   roles: ['teacher', 'school_admin'] },
    { name: 'Teachers', path: '/admin/teachers',  icon: Users,         roles: ['school_admin', 'school_super_admin'] },
    { name: 'Classes',  path: '/admin/classes',   icon: Layers,        roles: ['school_admin', 'school_super_admin'] },
    { name: 'Assess',   path: '/assessments',     icon: ClipboardList, roles: ['school_admin', 'school_super_admin'] },
    { name: 'Profile',  path: '/profile',         icon: User,          roles: ['teacher', 'school_admin', 'school_super_admin'] },
  ];

  const visibleNavItems = navItems.filter(item => item.roles.includes(role));

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@500;600&display=swap');

        .bn-root {
          position: fixed;
          bottom: 0; left: 0; right: 0;
          z-index: 40;
          background: #ffffff;
          border-top: 1px solid #e5e7eb;
          box-shadow: 0 -4px 16px rgba(0,0,0,0.06);
          padding: 6px 8px env(safe-area-inset-bottom, 8px);
          font-family: 'DM Sans', sans-serif;
        }
        @media (min-width: 768px) {
          .bn-root { display: none; }
        }

        .bn-inner {
          display: flex;
          align-items: center;
          justify-content: space-around;
          overflow-x: auto;
          scrollbar-width: none;
        }
        .bn-inner::-webkit-scrollbar { display: none; }

        .bn-link {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-width: 56px;
          padding: 6px 4px;
          border-radius: 10px;
          text-decoration: none;
          color: #9ca3af;
          transition: color 0.15s, background 0.15s;
          position: relative;
        }
        .bn-link:hover {
          color: #374151;
        }

        .bn-icon-wrap {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 28px;
          border-radius: 8px;
          transition: background 0.15s;
          margin-bottom: 3px;
        }

        .bn-label {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.03em;
          line-height: 1;
        }

        /* Active state */
        .bn-link.active {
          color: #b45309;
        }
        .bn-link.active .bn-icon-wrap {
          background: #fff7ed;
        }
        .bn-link.active .bn-icon-wrap svg {
          color: #f59e0b;
        }

        /* Active indicator dot */
        .bn-link.active::after {
          content: '';
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 20px;
          height: 2.5px;
          border-radius: 0 0 4px 4px;
          background: linear-gradient(90deg, #f59e0b, #fbbf24);
        }
      `}</style>

      <div className="bn-root">
        <div className="bn-inner">
          {visibleNavItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) => `bn-link${isActive ? ' active' : ''}`}
            >
              <div className="bn-icon-wrap">
                <item.icon size={20} />
              </div>
              <span className="bn-label">{item.name}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </>
  );
};

export default BottomNav;
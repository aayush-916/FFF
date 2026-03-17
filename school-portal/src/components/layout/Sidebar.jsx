// import { NavLink } from 'react-router-dom';
// import { Home, BookOpen, CheckSquare, ClipboardList, User, Users, Layers, X } from 'lucide-react';
// import { useAuth } from '../../context/AuthContext';

// const Sidebar = ({ isOpen, closeSidebar }) => {
//   const { user } = useAuth();
//   const role = String(user?.role || '').toLowerCase().trim();

//   // Define all links and who is allowed to see them
//   const navItems = [
//     { name: 'Dashboard', path: '/', icon: Home, roles: ['teacher', 'school_admin', 'school_super_admin'] },
//     { name: 'Lessons', path: '/lessons', icon: BookOpen, roles: ['teacher', 'school_admin'] },
//     { name: 'Sessions', path: '/sessions', icon: CheckSquare, roles: ['teacher', 'school_admin'] },
//     { name: 'Teachers', path: '/admin/teachers', icon: Users, roles: ['school_admin', 'school_super_admin'] },
//     { name: 'Classes', path: '/admin/classes', icon: Layers, roles: ['school_admin', 'school_super_admin'] },
//     { name: 'Assessments', path: '/assessments', icon: ClipboardList, roles: ['school_admin', 'school_super_admin'] },
//     { name: 'Profile', path: '/profile', icon: User, roles: ['teacher', 'school_admin', 'school_super_admin'] },
//   ];

//   // Filter links based on role
//   const visibleNavItems = navItems.filter(item => item.roles.includes(role));

//   return (
//     <>
//       {/* Mobile Overlay */}
//       {isOpen && (
//         <div 
//           className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40 md:hidden"
//           onClick={closeSidebar}
//         />
//       )}

//       {/* Sidebar Content */}
//       <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        
//         {/* Logo Area */}
//         <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100">
//           <span className="text-xl font-black text-blue-600 tracking-tight">SchoolPortal</span>
//           <button onClick={closeSidebar} className="md:hidden p-1 text-gray-500 hover:text-gray-700">
//             <X className="w-6 h-6" />
//           </button>
//         </div>

//         {/* Navigation Links */}
//         <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
//           {visibleNavItems.map((item) => (
//             <NavLink
//               key={item.name}
//               to={item.path}
//               onClick={closeSidebar}
//               className={({ isActive }) =>
//                 `flex items-center gap-3 px-3 py-3 rounded-xl font-bold transition-colors ${
//                   isActive 
//                     ? 'bg-blue-50 text-blue-700' 
//                     : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
//                 }`
//               }
//             >
//               <item.icon className="w-5 h-5" />
//               <span>{item.name}</span>
//             </NavLink>
//           ))}
//         </nav>
//       </div>
//     </>
//   );
// };

// export default Sidebar;





import { NavLink } from 'react-router-dom';
import { Home, BookOpen, CheckSquare, ClipboardList, User, Users, Layers, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ isOpen, closeSidebar }) => {
  const { user } = useAuth();
  const role = String(user?.role || '').toLowerCase().trim();

  const navItems = [
    { name: 'Dashboard',   path: '/',                icon: Home,          roles: ['teacher', 'school_admin', 'school_super_admin'] },
    { name: 'Lessons',     path: '/lessons',         icon: BookOpen,      roles: ['teacher', 'school_admin'] },
    { name: 'Sessions',    path: '/sessions',        icon: CheckSquare,   roles: ['teacher', 'school_admin'] },
    { name: 'Teachers',    path: '/admin/teachers',  icon: Users,         roles: ['school_admin', 'school_super_admin'] },
    { name: 'Classes',     path: '/admin/classes',   icon: Layers,        roles: ['school_admin', 'school_super_admin'] },
    { name: 'Assessments', path: '/assessments',     icon: ClipboardList, roles: ['school_admin', 'school_super_admin'] },
    { name: 'Profile',     path: '/profile',         icon: User,          roles: ['teacher', 'school_admin', 'school_super_admin'] },
  ];

  const visibleNavItems = navItems.filter(item => item.roles.includes(role));

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@400;500;600&display=swap');

        /* ── Overlay ── */
        .sb-overlay {
          position: fixed;
          inset: 0;
          background: rgba(17, 24, 39, 0.35);
          backdrop-filter: blur(4px);
          z-index: 40;
        }

        /* ── Sidebar panel ── */
        .sb-panel {
          position: fixed;
          inset-block: 0;
          left: 0;
          z-index: 50;
          width: 256px;
          background: #ffffff;
          border-right: 1px solid #e5e7eb;
          display: flex;
          flex-direction: column;
          transform: translateX(-100%);
          transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 4px 0 24px rgba(0,0,0,0.06);
          font-family: 'DM Sans', sans-serif;
        }
        .sb-panel.sb-open   { transform: translateX(0); }
        @media (min-width: 768px) {
          .sb-panel { transform: translateX(0); box-shadow: none; }
        }

        /* ── Logo area ── */
        .sb-logo-area {
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 20px;
          border-bottom: 1px solid #f3f4f6;
          flex-shrink: 0;
        }
        .sb-logo {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .sb-logo-dot {
          width: 8px; height: 8px;
          border-radius: 50%;
          background: #f59e0b;
          box-shadow: 0 0 6px rgba(245,158,11,0.5);
          animation: sbPulse 2s ease-in-out infinite;
          flex-shrink: 0;
        }
        @keyframes sbPulse { 0%,100%{opacity:1;} 50%{opacity:0.3;} }
        .sb-logo-text {
          font-family: 'Playfair Display', serif;
          font-size: 17px;
          font-weight: 700;
          color: #111827;
          letter-spacing: -0.01em;
        }
        .sb-close-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px; height: 32px;
          border: none;
          background: transparent;
          border-radius: 8px;
          color: #9ca3af;
          cursor: pointer;
          transition: background 0.15s, color 0.15s;
        }
        .sb-close-btn:hover { background: #f3f4f6; color: #111827; }
        @media (min-width: 768px) { .sb-close-btn { display: none; } }

        /* ── User chip ── */
        .sb-user {
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 16px 12px 8px;
          padding: 12px;
          background: #f9fafb;
          border: 1px solid #f3f4f6;
          border-radius: 12px;
        }
        .sb-user-avatar {
          width: 34px; height: 34px;
          border-radius: 50%;
          background: #fff7ed;
          border: 1.5px solid #fcd9a0;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Playfair Display', serif;
          font-size: 14px;
          font-weight: 700;
          color: #f59e0b;
          flex-shrink: 0;
        }
        .sb-user-name {
          font-size: 13px;
          font-weight: 600;
          color: #111827;
          line-height: 1.3;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .sb-user-role {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          color: #9ca3af;
        }

        /* ── Nav section label ── */
        .sb-nav-label {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #d1d5db;
          padding: 0 16px;
          margin: 8px 0 4px;
        }

        /* ── Nav links ── */
        .sb-nav { flex: 1; overflow-y: auto; padding: 4px 10px 16px; }
        .sb-nav::-webkit-scrollbar { width: 0; }

        .sb-link {
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 10px 12px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 500;
          color: #6b7280;
          text-decoration: none;
          transition: background 0.15s, color 0.15s;
          margin-bottom: 2px;
        }
        .sb-link:hover {
          background: #f9fafb;
          color: #111827;
        }
        .sb-link-icon {
          width: 18px; height: 18px;
          flex-shrink: 0;
          transition: color 0.15s;
        }

        /* Active state */
        .sb-link.active {
          background: #fff7ed;
          color: #b45309;
          font-weight: 600;
          border: 1px solid #fef3c7;
        }
        .sb-link.active .sb-link-icon { color: #f59e0b; }

        /* ── Footer ── */
        .sb-footer {
          padding: 12px 12px 16px;
          border-top: 1px solid #f3f4f6;
          flex-shrink: 0;
        }
        .sb-footer-text {
          font-size: 10px;
          color: #d1d5db;
          text-align: center;
          letter-spacing: 0.05em;
        }
      `}</style>

      {/* Mobile overlay */}
      {isOpen && (
        <div className="sb-overlay" onClick={closeSidebar} />
      )}

      {/* Sidebar panel */}
      <div className={`sb-panel${isOpen ? ' sb-open' : ''}`}>

        {/* Logo */}
        <div className="sb-logo-area">
          <div className="sb-logo">
            <div className="sb-logo-dot" />
            <span className="sb-logo-text">SchoolPortal</span>
          </div>
          <button className="sb-close-btn" onClick={closeSidebar} aria-label="Close sidebar">
            <X size={18} />
          </button>
        </div>

        {/* User chip */}
        {user && (
          <div className="sb-user">
            <div className="sb-user-avatar">
              {user.name?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <div style={{ minWidth: 0 }}>
              <p className="sb-user-name">{user.name}</p>
              <p className="sb-user-role">{user.role?.replace(/_/g, ' ')}</p>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="sb-nav">
          <p className="sb-nav-label">Menu</p>
          {visibleNavItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === '/'}
              onClick={closeSidebar}
              className={({ isActive }) => `sb-link${isActive ? ' active' : ''}`}
            >
              <item.icon className="sb-link-icon" />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="sb-footer">
          <p className="sb-footer-text">School Wellbeing Portal</p>
        </div>

      </div>
    </>
  );
};

export default Sidebar;
// import { Menu, Shield } from 'lucide-react';
// import { useAuth } from '../../context/AuthContext';

// const TopHeader = ({ openSidebar }) => {
//   const { user } = useAuth();

//   return (
//     <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 z-30 sticky top-0 md:hidden">
      
//       <div className="flex items-center gap-3">
//         <button 
//           onClick={openSidebar}
//           className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
//         >
//           <Menu className="w-6 h-6" />
//         </button>
//         <span className="text-lg font-black text-blue-600">School Portal</span>
//       </div>

//       <div className="flex items-center gap-2">
//         <div className="text-right hidden sm:block">
//           <p className="text-sm font-bold text-gray-900">{user?.name}</p>
//           <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
//             {user?.role?.replace(/_/g, ' ')}
//           </p>
//         </div>
//         <div className="w-9 h-9 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center border border-blue-100">
//           <Shield className="w-5 h-5" />
//         </div>
//       </div>

//     </header>
//   );
// };

// export default TopHeader;



import { Menu, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const TopHeader = ({ openSidebar }) => {
  const { user } = useAuth();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@400;500;600&display=swap');

        .th-root {
          position: sticky;
          top: 0;
          z-index: 30;
          height: 60px;
          background: #ffffff;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 16px;
          font-family: 'DM Sans', sans-serif;
          box-shadow: 0 1px 8px rgba(0,0,0,0.05);
        }

        @media (min-width: 768px) {
          .th-root { display: none; }
        }

        /* Left: hamburger + logo */
        .th-left {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .th-menu-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          margin-left: -6px;
          border: none;
          background: transparent;
          border-radius: 10px;
          color: #6b7280;
          cursor: pointer;
          transition: background 0.18s, color 0.18s;
        }
        .th-menu-btn:hover {
          background: #f3f4f6;
          color: #111827;
        }

        .th-logo {
          display: flex;
          align-items: center;
          gap: 7px;
        }
        .th-logo-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #f59e0b;
          box-shadow: 0 0 6px rgba(245,158,11,0.5);
          animation: thPulse 2s ease-in-out infinite;
          flex-shrink: 0;
        }
        @keyframes thPulse { 0%,100%{opacity:1;} 50%{opacity:0.35;} }
        .th-logo-text {
          font-family: 'Playfair Display', serif;
          font-size: 17px;
          font-weight: 700;
          color: #111827;
          letter-spacing: -0.01em;
        }

        /* Right: user info + avatar */
        .th-right {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .th-user-info {
          text-align: right;
          display: none;
        }
        @media (min-width: 400px) {
          .th-user-info { display: block; }
        }
        .th-user-name {
          font-size: 13px;
          font-weight: 600;
          color: #111827;
          line-height: 1.3;
        }
        .th-user-role {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #9ca3af;
        }

        .th-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #fff7ed;
          border: 1.5px solid #fcd9a0;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #f59e0b;
          flex-shrink: 0;
        }
      `}</style>

      <header className="th-root">

        <div className="th-left">
          <button className="th-menu-btn" onClick={openSidebar} aria-label="Open menu">
            <Menu size={22} />
          </button>
          <div className="th-logo">
            <div className="th-logo-dot" />
            <span className="th-logo-text">School Portal</span>
          </div>
        </div>

        <div className="th-right">
          <div className="th-user-info">
            <p className="th-user-name">{user?.name}</p>
            <p className="th-user-role">{user?.role?.replace(/_/g, ' ')}</p>
          </div>
          <div className="th-avatar">
            <Shield size={17} />
          </div>
        </div>

      </header>
    </>
  );
};

export default TopHeader;
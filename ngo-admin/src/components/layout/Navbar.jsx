import { Menu, LogOut, Bell, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';

const Navbar = ({ toggleSidebar, toggleMobile }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Dynamically get page title from URL
  const pathName = location.pathname.split('/')[1];
  const pageTitle = pathName ? pathName.charAt(0).toUpperCase() + pathName.slice(1) : 'Overview';

  return (
    <header className="h-[70px] bg-white shadow-sm border-b border-slate-200 flex items-center justify-between px-4 md:px-6 z-10 shrink-0">
      
      {/* Left side: Toggle & Title */}
      <div className="flex items-center gap-4">
        {/* Desktop Toggle */}
        <button 
          onClick={toggleSidebar}
          className="hidden lg:flex items-center justify-center w-10 h-10 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-indigo-600 transition-colors"
        >
          <Menu size={20} />
        </button>
        
        {/* Mobile Toggle */}
        <button 
          onClick={toggleMobile}
          className="lg:hidden flex items-center justify-center w-10 h-10 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-indigo-600 transition-colors"
        >
          <Menu size={20} />
        </button>

        <div className="h-6 w-px bg-slate-200 hidden md:block"></div>
        
        <h2 className="text-xl font-bold text-slate-800 tracking-tight hidden sm:block">
          {pageTitle}
        </h2>
      </div>

      {/* Right side: Profile & Logout */}
      <div className="flex items-center gap-3 md:gap-5">
        
        <button className="relative p-2 text-slate-400 hover:text-indigo-600 transition-colors">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 border border-white"></span>
        </button>

        <div className="h-8 w-px bg-slate-200"></div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex flex-col items-end">
            <span className="text-sm font-bold text-slate-700 leading-none">
              {user?.name || user?.username || 'Admin User'}
            </span>
            <span className="text-xs font-medium text-slate-400 mt-1">
              Super Admin
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-indigo-100 border border-indigo-200 text-indigo-600 flex items-center justify-center shadow-sm">
            <UserIcon size={18} />
          </div>
        </div>

        <button 
          onClick={handleLogout}
          title="Logout"
          className="ml-2 flex items-center justify-center w-10 h-10 rounded-xl text-rose-500 hover:bg-rose-50 hover:text-rose-600 transition-colors"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
};

export default Navbar;
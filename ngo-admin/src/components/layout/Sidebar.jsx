import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  MapPin, 
  School, 
  Users, 
  Layout, 
  Repeat, 
  BookOpen, 
  ListChecks, 
  Activity, 
  HeartPulse, 
  BarChart2,
  X
} from 'lucide-react';

const navSections = [
  {
    title: 'SYSTEM',
    items: [
      { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      { name: 'Clusters', path: '/clusters', icon: MapPin },
      { name: 'Schools', path: '/schools', icon: School },
      { name: 'Users', path: '/users', icon: Users },
    ]
  },
  {
    title: 'CONTENT',
    items: [
      { name: 'Domains', path: '/domains', icon: Layout },
      { name: 'Habits', path: '/habits', icon: Repeat },
      { name: 'Lessons', path: '/lessons', icon: BookOpen },
      { name: 'MCQ', path: '/mcq', icon: ListChecks },
    ]
  },
  {
    title: 'MONITORING',
    items: [
      { name: 'Sessions', path: '/sessions', icon: Activity },
      { name: 'Assessments', path: '/assessments', icon: HeartPulse },
      { name: 'Reports', path: '/reports', icon: BarChart2 },
    ]
  }
];

const Sidebar = ({ isOpen, mobileOpen, setMobileOpen }) => {
  const location = useLocation();

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`fixed lg:relative inset-y-0 left-0 z-50 flex flex-col bg-gradient-to-b from-slate-900 to-slate-800 text-slate-300 transition-all duration-300 ease-in-out shadow-2xl lg:shadow-none
          ${isOpen ? 'w-[260px]' : 'w-[80px]'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Branding Area */}
        <div className="h-[70px] flex items-center justify-between px-6 border-b border-slate-700/50 shrink-0">
          <div className="flex items-center overflow-hidden whitespace-nowrap">
            
            {/* --- LOGO IMAGE HERE (The 'N' div has been deleted) --- */}
            <img 
              src="/logo.webp" 
              alt="FFF Logo" 
              className="w-16 h-16 object-contain shrink-0" 
            />

            <div className={`ml-3 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 hidden lg:block'}`}>
              <h1 className="text-white font-bold text-lg leading-tight">FFF Admin</h1>
              <p className="text-xs text-indigo-300 font-medium">Wellbeing System</p>
            </div>
          </div>
          {/* Mobile Close Button */}
          <button 
            className="lg:hidden text-slate-400 hover:text-white"
            onClick={() => setMobileOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 overflow-y-auto py-6 hide-scrollbar">
          {navSections.map((section, idx) => (
            <div key={idx} className="mb-6">
              {/* Section Title */}
              <div className={`px-6 mb-2 transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 hidden lg:block'}`}>
                <span className="text-[10px] font-black tracking-widest text-slate-500 uppercase">
                  {section.title}
                </span>
              </div>
              
              {/* Menu Items */}
              <ul className="space-y-1.5 px-3">
                {section.items.map((item) => {
                  const isActive = location.pathname.startsWith(item.path);
                  const Icon = item.icon;
                  
                  return (
                    <li key={item.name}>
                      <Link
                        to={item.path}
                        title={!isOpen ? item.name : ''}
                        onClick={() => setMobileOpen(false)}
                        className={`group relative flex items-center py-2.5 rounded-xl transition-all duration-200 hover:scale-[1.02]
                          ${isOpen ? 'px-3' : 'justify-center px-0'}
                          ${isActive 
                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/50' 
                            : 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-100'
                          }
                        `}
                      >
                        <Icon size={20} className={`shrink-0 transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-400'}`} />
                        <span className={`font-semibold ml-3 whitespace-nowrap transition-all duration-300
                          ${isOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0 hidden lg:block'}
                        `}>
                          {item.name}
                        </span>
                        
                        {/* Active Indicator Dot (Only visible when collapsed) */}
                        {!isOpen && isActive && (
                          <div className="absolute right-1.5 w-1.5 h-1.5 rounded-full bg-white"></div>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
        
        {/* Bottom User Area (Optional, for collapsed state aesthetic) */}
        {!isOpen && (
          <div className="p-4 border-t border-slate-700/50 flex justify-center hidden lg:flex">
             <div className="w-8 h-8 rounded-full bg-slate-700 border border-slate-600"></div>
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;
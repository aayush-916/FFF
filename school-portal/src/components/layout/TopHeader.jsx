import { Menu, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const TopHeader = ({ openSidebar }) => {
  const { user } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 z-30 sticky top-0 md:hidden">
      
      <div className="flex items-center gap-3">
        <button 
          onClick={openSidebar}
          className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
        <span className="text-lg font-black text-blue-600">School Portal</span>
      </div>

      <div className="flex items-center gap-2">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-bold text-gray-900">{user?.name}</p>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            {user?.role?.replace(/_/g, ' ')}
          </p>
        </div>
        <div className="w-9 h-9 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center border border-blue-100">
          <Shield className="w-5 h-5" />
        </div>
      </div>

    </header>
  );
};

export default TopHeader;
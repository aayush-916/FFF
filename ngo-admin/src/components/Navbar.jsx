import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="bg-white shadow-sm h-16 flex items-center justify-between px-6 z-10">
      <h2 className="text-xl font-semibold text-gray-800">NGO School Wellbeing System</h2>
      <div className="flex items-center space-x-4">
        {/* Safely display the user's name or username if available */}
        <span className="text-sm font-medium text-gray-600">
          {user?.name || user?.username || 'Admin User'}
        </span>
        <button 
          onClick={handleLogout}
          className="text-sm text-red-600 hover:text-red-800 font-medium transition-colors"
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default Navbar;
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Clusters', path: '/clusters' },
    { name: 'Schools', path: '/schools' },
    { name: 'Users', path: '/users' },
    { name: 'Domains', path: '/domains' },
    { name: 'Habits', path: '/habits' },
    { name: 'Lessons', path: '/lessons' },
    { name: 'MCQ', path: '/mcq' },
    { name: 'Sessions', path: '/sessions' },
    { name: 'Assessments', path: '/assessments' },
    { name: 'Reports', path: '/reports' },
  ];

  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col h-full">
      <div className="p-4 text-xl font-bold border-b border-gray-700">
        NGO Admin
      </div>
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <li key={item.name}>
                <Link
                  to={item.path}
                  className={`block px-4 py-2 hover:bg-gray-700 transition-colors ${
                    isActive ? 'bg-blue-600 border-l-4 border-white' : ''
                  }`}
                >
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
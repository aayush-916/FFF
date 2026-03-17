// import { useState } from 'react';
// import { Outlet } from 'react-router-dom';
// import Sidebar from './Sidebar';
// import TopHeader from './TopHeader';
// import BottomNav from './BottomNav';

// const Layout = () => {
//   const [isSidebarOpen, setIsSidebarOpen] = useState(false);

//   return (
//     <div className="flex h-screen bg-gray-50 overflow-hidden">
      
//       {/* Desktop & Mobile Sidebar */}
//       <Sidebar 
//         isOpen={isSidebarOpen} 
//         closeSidebar={() => setIsSidebarOpen(false)} 
//       />

//       {/* Main Content Area */}
//       <div className="flex-1 flex flex-col min-w-0 overflow-hidden md:ml-64">
        
//         {/* Mobile Top Header */}
//         <TopHeader openSidebar={() => setIsSidebarOpen(true)} />

//         {/* Page Content */}
//         <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
//           <div className="max-w-7xl mx-auto">
//             <Outlet />
//           </div>
//         </main>

//         {/* Mobile Bottom Navigation */}
//         <BottomNav />
        
//       </div>
//     </div>
//   );
// };

// export default Layout;




import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopHeader from './TopHeader';
import BottomNav from './BottomNav';

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <>
      <style>{`
        .layout-root {
          display: flex;
          height: 100vh;
          background-color: #f5f6fa;
          overflow: hidden;
        }

        .layout-body {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
          overflow: hidden;
        }

        @media (min-width: 768px) {
          .layout-body {
            margin-left: 256px;
          }
        }

        .layout-main {
          flex: 1;
          overflow-y: auto;
          padding: 16px 16px 96px;
          /* smooth scroll */
          scroll-behavior: smooth;
          /* subtle scrollbar */
          scrollbar-width: thin;
          scrollbar-color: #e5e7eb transparent;
        }
        .layout-main::-webkit-scrollbar { width: 5px; }
        .layout-main::-webkit-scrollbar-track { background: transparent; }
        .layout-main::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 99px; }

        @media (min-width: 768px) {
          .layout-main {
            padding: 32px 32px 32px;
          }
        }

        .layout-inner {
          max-width: 1280px;
          margin: 0 auto;
        }
      `}</style>

      <div className="layout-root">

        <Sidebar
          isOpen={isSidebarOpen}
          closeSidebar={() => setIsSidebarOpen(false)}
        />

        <div className="layout-body">

          <TopHeader openSidebar={() => setIsSidebarOpen(true)} />

          <main className="layout-main">
            <div className="layout-inner">
              <Outlet />
            </div>
          </main>

          <BottomNav />

        </div>
      </div>
    </>
  );
};

export default Layout;
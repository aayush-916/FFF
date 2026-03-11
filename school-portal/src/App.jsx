import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Layout & Protected Wrapper
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/layout/Layout';

// Dashboards
import Login from './pages/auth/Login';
import TeacherDashboard from './pages/dashboard/TeacherDashboard';
import SchoolDashboard from './pages/dashboard/SchoolDashboard';

// Teaching Pages
import LessonBrowser from './pages/lessons/LessonBrowser';
import SessionPage from './pages/sessions/SessionPage';
import SessionHistory from './pages/sessions/SessionHistory';

// Admin Pages
import AssessmentPage from './pages/assessments/AssessmentPage';
import SchoolSetup from './pages/setup/SchoolSetup'; // Make sure this file exists
import Teachers from './pages/admin/Teachers';       // Make sure this file exists
import Classes from './pages/admin/Classes';         // Make sure this file exists

// Shared Pages
import Profile from './pages/profile/Profile';

// --------------------------------------------------------
// 1. Dashboard Router (Auto-redirects based on role)
// --------------------------------------------------------
const DashboardRouter = () => {
  const { user } = useAuth();
  
  if (user?.role === 'school_super_admin' || user?.role === 'school_admin') {
    return <SchoolDashboard />;
  }
  
  return <TeacherDashboard />;
};

// --------------------------------------------------------
// 2. Role Wrappers
// --------------------------------------------------------

// --------------------------------------------------------
// 2. Role Wrappers
// --------------------------------------------------------

// Allows: teacher, school_admin | Blocks: school_super_admin
// Allows: teacher, school_admin | Blocks: school_super_admin
const TeacherRoute = () => {
  const { user } = useAuth();
  
  // This completely sanitizes the role from the DB to prevent mismatches
  const role = String(user?.role || '').toLowerCase().trim(); 
  
  const allowedRoles = ['teacher', 'school_admin'];
  
 
  if (!allowedRoles.includes(role)) {
    return <Navigate to="/" replace />; // Kick back to dashboard
  }
  
  return <Outlet />;
};

// Allows: school_super_admin, school_admin | Blocks: teacher
const AdminRoute = () => {
  const { user } = useAuth();
  // Add .toLowerCase() here too
  const role = user?.role?.toLowerCase(); 
  const allowedRoles = ['school_super_admin', 'school_admin'];
  
  if (!allowedRoles.includes(role)) {
    return <Navigate to="/" replace />; // Kick back to dashboard
  }
  return <Outlet />;
};

// --------------------------------------------------------
// 3. Main Application Routes
// --------------------------------------------------------
function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* Must be logged in to access anything below */}
      <Route element={<PrivateRoute />}>
        <Route path="/" element={<Layout />}>
          
          {/* Dynamic Home Route */}
          <Route index element={<DashboardRouter />} />
          
          {/* Shared Routes (All authenticated users) */}
          <Route path="profile" element={<Profile />} />

         t
          {/* ------------------------------------------- */}
          {/* TEACHING TOOLS (Blocked for super_admin)    */}
          {/* ------------------------------------------- */}
          <Route element={<TeacherRoute />}>
            <Route path="lessons" element={<LessonBrowser />} />
            
            {/* FIX 1: Add /start back to this path */}
            <Route path="sessions/start" element={<SessionPage />} /> 
            
            {/* FIX 2: Change history back to sessions so your sidebar works */}
            <Route path="sessions" element={<SessionHistory />} />
          </Route>

          {/* ------------------------------------------- */}
          {/* ADMIN TOOLS (Blocked for teachers)          */}
          {/* ------------------------------------------- */}
          <Route element={<AdminRoute />}>
            <Route path="assessments" element={<AssessmentPage />} />
            <Route path="setup" element={<SchoolSetup />} />
            <Route path="admin/teachers" element={<Teachers />} />
            <Route path="admin/classes" element={<Classes />} />
          </Route>

        </Route>
      </Route>
    </Routes>
  );
}

// --------------------------------------------------------
// 4. App Provider Wrapper
// --------------------------------------------------------
function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
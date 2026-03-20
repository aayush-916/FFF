import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Layout & Protected Wrapper
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/layout/Layout';

// Dashboards
import Login from './pages/auth/Login';
import DashboardMain from './pages/dashboard/DashboardMain';

// Teaching Pages
import LessonBrowser from './pages/lessons/LessonBrowser';
import SessionPage from './pages/sessions/SessionPage';
import SessionHistory from './pages/sessions/SessionHistory';

// Admin Pages
import AssessmentPage from './pages/assessments/AssessmentPage';
import SchoolSetup from './pages/setup/SchoolSetup';
import Teachers from './pages/admin/Teachers';
import Classes from './pages/admin/Classes';

// Shared Pages
import Profile from './pages/profile/Profile';

// --------------------------------------------------------
// 1. Role Wrappers
// --------------------------------------------------------

// Allows: teacher, school_admin | Blocks: school_super_admin
const TeacherRoute = () => {
  const { user } = useAuth();
  
  // Completely sanitizes the role from the DB to prevent mismatches
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
  
  // Sanitizes the role here too for safety
  const role = String(user?.role || '').toLowerCase().trim(); 
  const allowedRoles = ['school_super_admin', 'school_admin'];
  
  if (!allowedRoles.includes(role)) {
    return <Navigate to="/" replace />; // Kick back to dashboard
  }
  
  return <Outlet />;
};

// --------------------------------------------------------
// 2. Main Application Routes
// --------------------------------------------------------
function AppRoutes() {
  return (
    
    <Routes>
      

      <Route path="/login" element={<Login />} />

      {/* Must be logged in to access anything below */}
      <Route element={<PrivateRoute />}>
        <Route path="/" element={<Layout />}>
          
          {/* Dynamic Home Route (Traffic Cop) */}
          <Route index element={<DashboardMain />} />
          
          {/* Shared Routes (All authenticated users) */}
          <Route path="profile" element={<Profile />} />

          {/* ------------------------------------------- */}
          {/* TEACHING TOOLS (Blocked for super_admin)    */}
          {/* ------------------------------------------- */}
          <Route element={<TeacherRoute />}>
            <Route path="lessons" element={<LessonBrowser />} />
            <Route path="sessions/start" element={<SessionPage />} /> 
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
// 3. App Provider Wrapper
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
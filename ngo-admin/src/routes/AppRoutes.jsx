import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import AdminLayout from '../components/layout/AdminLayout';
import ProtectedRoute from '../components/ProtectedRoute';

// Pages
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import Clusters from '../pages/Clusters';
import Schools from '../pages/Schools';
import Users from '../pages/Users';
import Domains from '../pages/Domains';
import Habits from '../pages/Habits';
import Lessons from '../pages/Lessons';
import MCQ from '../pages/McqQuestions';
import Sessions from '../pages/Sessions';
import Assessments from '../pages/Assessments';
import Reports from '../pages/Reports';

const AppRoutes = () => {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<Login />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/clusters" element={<Clusters />} />
            <Route path="/schools" element={<Schools />} />
            <Route path="/users" element={<Users />} />
            <Route path="/domains" element={<Domains />} />
            <Route path="/habits" element={<Habits />} />
            <Route path="/lessons" element={<Lessons />} />
            <Route path="/mcq" element={<MCQ />} />
            <Route path="/sessions" element={<Sessions />} />
            <Route path="/assessments" element={<Assessments />} />
            <Route path="/reports" element={<Reports />} />
          </Route>
        </Route>

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  );
};

export default AppRoutes;
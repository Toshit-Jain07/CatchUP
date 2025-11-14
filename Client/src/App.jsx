import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './AuthPage';
import SemesterDepartments from './SemesterDepartments';
import Dashboard from './Dashboard';
import UserManagement from './UserManagement';
import './App.css';
import ResetPassword from './ResetPassword';
import ProfilePage from './ProfilePage';


// Protected Route Component
function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return <Navigate to="/" replace />;
  }
  
  return children;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />        
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/user-management" 
          element={
            <ProtectedRoute>
              <UserManagement />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/semester/:semesterId/departments" 
          element={
            <ProtectedRoute>
              <SemesterDepartments />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;
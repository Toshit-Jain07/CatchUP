import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './AuthPage';
import Dashboard from './Dashboard';
import UserManagement from './UserManagement';
import './App.css';
import ResetPassword from './ResetPassword';


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
          path="/user-management" 
          element={
            <ProtectedRoute>
              <UserManagement />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;
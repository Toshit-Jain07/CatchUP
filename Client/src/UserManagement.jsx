import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Crown, Shield, User, Trash2 } from 'lucide-react';
import { userAPI } from './api';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is super admin
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      setCurrentUser(user);
      
      if (user.role !== 'superadmin') {
        alert('Access denied. Super Admin only.');
        navigate('/dashboard');
        return;
      }
    }

    fetchUsers();
  }, [navigate]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getAllUsers();
      setUsers(response.data);
    } catch (err) {
      setError('Failed to load users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    if (!window.confirm(`Are you sure you want to change this user's role to ${newRole}?`)) {
      return;
    }

    try {
      await userAPI.updateUserRole(userId, newRole);
      alert('User role updated successfully!');
      fetchUsers(); // Refresh list
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update role');
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to delete ${userName}? This action cannot be undone.`)) {
      return;
    }

    try {
      await userAPI.deleteUser(userId);
      alert('User deleted successfully!');
      fetchUsers(); // Refresh list
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'superadmin':
        return <Crown className="text-yellow-500" size={20} />;
      case 'admin':
        return <Shield className="text-blue-500" size={20} />;
      default:
        return <User className="text-gray-500" size={20} />;
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'superadmin':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'admin':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 hover:bg-gray-700 rounded-lg transition-all"
              >
                <ArrowLeft className="text-white" size={24} />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center space-x-2">
                  <Crown className="text-yellow-500" size={28} />
                  <span>User Management</span>
                </h1>
                <p className="text-gray-400 text-sm">Manage user roles and permissions</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {error && (
          <div className="bg-red-900/20 border border-red-500/50 text-red-400 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-700/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        {getRoleIcon(user.role)}
                        <span className="text-white font-medium">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getRoleBadgeColor(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-400 text-sm">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {currentUser && user._id !== currentUser._id ? (
                        <div className="flex items-center space-x-2">
                          {/* Role Change Buttons */}
                          {user.role !== 'student' && (
                            <button
                              onClick={() => handleRoleChange(user._id, 'student')}
                              className="px-3 py-1 bg-gray-600 hover:bg-gray-500 text-white text-xs rounded transition-all"
                            >
                              → Student
                            </button>
                          )}
                          {user.role !== 'admin' && (
                            <button
                              onClick={() => handleRoleChange(user._id, 'admin')}
                              className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs rounded transition-all"
                            >
                              → Admin
                            </button>
                          )}
                          {user.role !== 'superadmin' && (
                            <button
                              onClick={() => handleRoleChange(user._id, 'superadmin')}
                              className="px-3 py-1 bg-yellow-600 hover:bg-yellow-500 text-white text-xs rounded transition-all"
                            >
                              → Super Admin
                            </button>
                          )}
                          
                          {/* Delete Button */}
                          <button
                            onClick={() => handleDeleteUser(user._id, user.name)}
                            className="p-2 bg-red-600 hover:bg-red-500 text-white rounded transition-all"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ) : (
                        <span className="text-gray-500 text-sm italic">You</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 text-center text-gray-400 text-sm">
          Total Users: {users.length}
        </div>
      </main>
    </div>
  );
}
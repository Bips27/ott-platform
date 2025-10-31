'use client';

import { useState, useEffect } from 'react';
import { useToastContext } from '@/components/ToastProvider';
import AdminSidebar from '@/components/AdminSidebar';
import { 
  EyeIcon, 
  EyeSlashIcon, 
  UserIcon, 
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';

interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  isBlocked: boolean;
  subscription: {
    status: string;
    plan: string;
    endDate: string;
  };
  createdAt: string;
  lastLogin: string;
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showBlocked, setShowBlocked] = useState(false);
  const { success, error } = useToastContext();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const response = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data.data || []);
      } else {
        error('Error', 'Failed to fetch users');
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      error('Network Error', 'Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const handleBlockUser = async (userId: string, isBlocked: boolean) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const response = await fetch(`/api/admin/users/${userId}/block`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isBlocked }),
      });

      const data = await response.json();

      if (response.ok) {
        success('Success', `User ${isBlocked ? 'blocked' : 'unblocked'} successfully`);
        fetchUsers(); // Refresh the list
      } else {
        error('Error', data.message || 'Failed to update user status');
      }
    } catch (err) {
      console.error('Error updating user:', err);
      error('Network Error', 'Failed to connect to server');
    }
  };

  const handleChangeRole = async (userId: string, newRole: string) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role: newRole }),
      });

      const data = await response.json();

      if (response.ok) {
        success('Success', 'User role updated successfully');
        fetchUsers(); // Refresh the list
      } else {
        error('Error', data.message || 'Failed to update user role');
      }
    } catch (err) {
      console.error('Error updating user role:', err);
      error('Network Error', 'Failed to connect to server');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (user.firstName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (user.lastName?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && user.isActive && !user.isBlocked) ||
                         (filterStatus === 'blocked' && user.isBlocked) ||
                         (filterStatus === 'inactive' && !user.isActive);
    
    const matchesBlocked = showBlocked || !user.isBlocked;
    
    return matchesSearch && matchesRole && matchesStatus && matchesBlocked;
  });

  const getSubscriptionStatus = (user: User) => {
    if (!user.subscription) return 'No Subscription';
    
    const isActive = user.subscription.status === 'active' && 
                    new Date(user.subscription.endDate) > new Date();
    
    return isActive ? `${user.subscription.plan} (Active)` : 'Expired';
  };

  const getStatusBadge = (user: User) => {
    if (user.isBlocked) {
      return <span className="px-2 py-1 text-xs font-medium bg-red-900 text-red-200 rounded-full">Blocked</span>;
    }
    if (!user.isActive) {
      return <span className="px-2 py-1 text-xs font-medium bg-gray-900 text-gray-200 rounded-full">Inactive</span>;
    }
    return <span className="px-2 py-1 text-xs font-medium bg-green-900 text-green-200 rounded-full">Active</span>;
  };

  const getRoleBadge = (role: string) => {
    const colors = {
      admin: 'bg-purple-900 text-purple-200',
      moderator: 'bg-blue-900 text-blue-200',
      user: 'bg-gray-900 text-gray-200'
    };
    
    const safeRole = role || 'user';
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[safeRole as keyof typeof colors] || colors.user}`}>
        {safeRole.charAt(0).toUpperCase() + safeRole.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-netflix-black">
        <AdminSidebar />
        <div className="lg:ml-64">
          <div className="flex items-center justify-center h-screen">
            <div className="text-white text-xl">Loading users...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-netflix-black">
      <AdminSidebar />
      <div className="lg:ml-64">
        <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">User Management</h1>
          <p className="text-gray-400">Manage user accounts, roles, and subscription status</p>
        </div>

        {/* Filters and Search */}
        <div className="bg-netflix-dark-gray rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-netflix-gray text-white rounded-lg border border-gray-600 focus:border-netflix-red focus:outline-none"
              />
            </div>

            {/* Role Filter */}
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-4 py-2 bg-netflix-gray text-white rounded-lg border border-gray-600 focus:border-netflix-red focus:outline-none"
            >
              <option value="all">All Roles</option>
              <option value="user">Users</option>
              <option value="moderator">Moderators</option>
              <option value="admin">Admins</option>
            </select>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 bg-netflix-gray text-white rounded-lg border border-gray-600 focus:border-netflix-red focus:outline-none"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="blocked">Blocked</option>
              <option value="inactive">Inactive</option>
            </select>

            {/* Show Blocked Toggle */}
            <label className="flex items-center space-x-2 text-white">
              <input
                type="checkbox"
                checked={showBlocked}
                onChange={(e) => setShowBlocked(e.target.checked)}
                className="w-4 h-4 text-netflix-red bg-netflix-gray border-gray-600 rounded focus:ring-netflix-red"
              />
              <span className="text-sm">Show Blocked Users</span>
            </label>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-netflix-dark-gray rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-netflix-gray">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">User</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Role</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Subscription</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Last Login</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-netflix-gray/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-netflix-red rounded-full flex items-center justify-center">
                          <UserIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <div className="text-white font-medium">
                            {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.email || 'Unknown User'}
                          </div>
                          <div className="text-gray-400 text-sm">{user.email || 'No email'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(user)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-300 text-sm">
                        {getSubscriptionStatus(user)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-300 text-sm">
                        {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {/* Role Change */}
                        <select
                          value={user.role}
                          onChange={(e) => handleChangeRole(user._id, e.target.value)}
                          className="px-2 py-1 bg-netflix-gray text-white text-sm rounded border border-gray-600 focus:border-netflix-red focus:outline-none"
                        >
                          <option value="user">User</option>
                          <option value="moderator">Moderator</option>
                          <option value="admin">Admin</option>
                        </select>

                        {/* Block/Unblock */}
                        <button
                          onClick={() => handleBlockUser(user._id, !user.isBlocked)}
                          className={`p-2 rounded-lg transition-colors ${
                            user.isBlocked
                              ? 'bg-green-600 hover:bg-green-700 text-white'
                              : 'bg-red-600 hover:bg-red-700 text-white'
                          }`}
                          title={user.isBlocked ? 'Unblock User' : 'Block User'}
                        >
                          {user.isBlocked ? (
                            <EyeIcon className="w-4 h-4" />
                          ) : (
                            <EyeSlashIcon className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <UserIcon className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">No users found matching your criteria</p>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
          <div className="bg-netflix-dark-gray rounded-lg p-6">
            <div className="text-2xl font-bold text-white">{users.length}</div>
            <div className="text-gray-400">Total Users</div>
          </div>
          <div className="bg-netflix-dark-gray rounded-lg p-6">
            <div className="text-2xl font-bold text-white">
              {users.filter(u => u.isActive && !u.isBlocked).length}
            </div>
            <div className="text-gray-400">Active Users</div>
          </div>
          <div className="bg-netflix-dark-gray rounded-lg p-6">
            <div className="text-2xl font-bold text-white">
              {users.filter(u => u.subscription?.status === 'active').length}
            </div>
            <div className="text-gray-400">Subscribers</div>
          </div>
          <div className="bg-netflix-dark-gray rounded-lg p-6">
            <div className="text-2xl font-bold text-white">
              {users.filter(u => u.isBlocked).length}
            </div>
            <div className="text-gray-400">Blocked Users</div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import AdminSidebar from '@/components/AdminSidebar';
import { useToastContext } from '@/components/ToastProvider';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  EyeIcon,
  FilmIcon,
  TvIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

interface Content {
  _id: string;
  title: string;
  description: string;
  category: 'movie' | 'show' | 'trailer' | 'other';
  type: 'movie' | 'series' | 'trailer';
  thumbnailUrl: string;
  trailerUrl?: string;
  videoUrl: string;
  duration?: number | string;
  rating?: string | { average: number; count: number };
  releaseDate?: string;
  createdAt?: string;
  homepageSections?: string[];
  isPublished?: boolean;
}

interface DashboardStats {
  totalUsers: number;
  totalContent: number;
  totalSubscribers: number;
  totalRevenue: number;
  recentUsers: any[];
  recentContent: Content[];
}

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { success, error } = useToastContext();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.push('/admin/login');
      return;
    }

    if (user && user.role === 'admin') {
      fetchDashboardStats();
    }
  }, [user, loading, router]);

  const fetchDashboardStats = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      
      // Fetch multiple endpoints in parallel
      const [usersRes, contentRes, subscriptionsRes] = await Promise.all([
        fetch('/api/admin/users', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch('/api/admin/content', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch('/api/admin/subscriptions', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      ]);

      const users = usersRes.ok ? await usersRes.json() : { data: [] };
      const content = contentRes.ok ? await contentRes.json() : { data: [] };
      const subscriptions = subscriptionsRes.ok ? await subscriptionsRes.json() : { data: [] };

      // Calculate stats
      const totalUsers = users.data?.length || 0;
      const totalContent = content.data?.length || 0;
      const totalSubscribers = subscriptions.data?.filter((sub: any) => sub.status === 'active')?.length || 0;
      const totalRevenue = subscriptions.data?.reduce((sum: number, sub: any) => {
        return sum + (sub.status === 'active' ? (sub.plan?.price || 0) : 0);
      }, 0) || 0;

      setStats({
        totalUsers,
        totalContent,
        totalSubscribers,
        totalRevenue,
        recentUsers: users.data?.slice(0, 5) || [],
        recentContent: content.data?.slice(0, 5) || []
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Set fallback stats
      setStats({
        totalUsers: 0,
        totalContent: 0,
        totalSubscribers: 0,
        totalRevenue: 0,
        recentUsers: [],
        recentContent: []
      });
    } finally {
      setLoadingStats(false);
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-netflix-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-netflix-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-xl mb-4">Loading...</div>
          <div className="text-netflix-text-gray text-sm">If this takes too long, you'll be redirected to login.</div>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    router.push('/admin/login');
    return null;
  }

  if (loadingStats) {
    return (
      <div className="min-h-screen bg-netflix-black">
        <AdminSidebar />
        <div className="lg:ml-64">
          <div className="flex items-center justify-center h-screen">
            <div className="text-white text-xl">Loading dashboard...</div>
          </div>
        </div>
      </div>
    );
  }

  const recentUsers = stats?.recentUsers ?? [];
  const recentContent = stats?.recentContent ?? [];

  return (
    <div className="min-h-screen bg-netflix-black">
      <AdminSidebar />
      <div className="lg:ml-64">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
              <p className="text-gray-400">Welcome back! Here's what's happening on your platform.</p>
            </div>
            <div className="text-sm text-gray-400">
              Last updated: {new Date().toLocaleString()}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-netflix-dark-gray rounded-lg p-6">
              <div className="flex items-center">
                <UserGroupIcon className="w-8 h-8 text-blue-400" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Total Users</p>
                  <p className="text-2xl font-bold text-white">{stats?.totalUsers || 0}</p>
                </div>
              </div>
            </div>
            <div className="bg-netflix-dark-gray rounded-lg p-6">
              <div className="flex items-center">
                <FilmIcon className="w-8 h-8 text-green-400" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Total Content</p>
                  <p className="text-2xl font-bold text-white">{stats?.totalContent || 0}</p>
                </div>
              </div>
            </div>
            <div className="bg-netflix-dark-gray rounded-lg p-6">
              <div className="flex items-center">
                <ChartBarIcon className="w-8 h-8 text-purple-400" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Subscribers</p>
                  <p className="text-2xl font-bold text-white">{stats?.totalSubscribers || 0}</p>
                </div>
              </div>
            </div>
            <div className="bg-netflix-dark-gray rounded-lg p-6">
              <div className="flex items-center">
                <CurrencyDollarIcon className="w-8 h-8 text-yellow-400" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Total Revenue</p>
                  <p className="text-2xl font-bold text-white">${stats?.totalRevenue || 0}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Users */}
            <div className="bg-netflix-dark-gray rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Recent Users</h3>
                <a href="/admin/users" className="text-netflix-red hover:text-netflix-red-dark text-sm">
                  View All
                </a>
              </div>
              <div className="space-y-3">
                {(recentUsers.length ?? 0) > 0 ? (
                  (recentUsers as any[]).map((user: any) => (
                    <div key={user._id} className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-netflix-red rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {user.firstName?.charAt(0) || user.email?.charAt(0) || 'U'}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="text-white text-sm font-medium">
                          {user.firstName ? `${user.firstName} ${user.lastName}` : user.email}
                        </p>
                        <p className="text-gray-400 text-xs">
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Recently joined'}
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        user.isActive ? 'bg-green-900 text-green-200' : 'bg-gray-900 text-gray-200'
                      }`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-center py-4">No recent users</p>
                )}
              </div>
            </div>

            {/* Recent Content */}
            <div className="bg-netflix-dark-gray rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Recent Content</h3>
                <a href="/admin" className="text-netflix-red hover:text-netflix-red-dark text-sm">
                  View All
                </a>
              </div>
              <div className="space-y-3">
                {(recentContent.length ?? 0) > 0 ? (
                  (recentContent as Content[]).map((content: Content) => (
                    <div key={content._id} className="flex items-center space-x-3">
                      <img 
                        className="w-12 h-8 object-cover rounded" 
                        src={content.thumbnailUrl || '/placeholder.jpg'} 
                        alt={content.title}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder.jpg';
                        }}
                      />
                      <div className="flex-1">
                        <p className="text-white text-sm font-medium">{content.title}</p>
                        <p className="text-gray-400 text-xs">
                          {content.type} • {content.category}
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        content.isPublished ? 'bg-green-900 text-green-200' : 'bg-yellow-900 text-yellow-200'
                      }`}>
                        {content.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-center py-4">No recent content</p>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <a 
                href="/admin" 
                className="bg-netflix-dark-gray hover:bg-netflix-gray rounded-lg p-4 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <FilmIcon className="w-6 h-6 text-netflix-red" />
                  <div>
                    <p className="text-white font-medium">Manage Content</p>
                    <p className="text-gray-400 text-sm">Add, edit, or remove content</p>
                  </div>
                </div>
              </a>
              <a 
                href="/admin/users" 
                className="bg-netflix-dark-gray hover:bg-netflix-gray rounded-lg p-4 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <UserGroupIcon className="w-6 h-6 text-netflix-red" />
                  <div>
                    <p className="text-white font-medium">User Management</p>
                    <p className="text-gray-400 text-sm">View and manage users</p>
                  </div>
                </div>
              </a>
              <a 
                href="/admin/analytics" 
                className="bg-netflix-dark-gray hover:bg-netflix-gray rounded-lg p-4 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <ChartBarIcon className="w-6 h-6 text-netflix-red" />
                  <div>
                    <p className="text-white font-medium">Analytics</p>
                    <p className="text-gray-400 text-sm">View platform analytics</p>
                  </div>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



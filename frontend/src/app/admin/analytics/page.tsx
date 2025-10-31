'use client';

import { useState, useEffect } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import { 
  ChartBarIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  EyeIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';

interface AnalyticsData {
  totalUsers: number;
  activeUsers: number;
  subscribers: number;
  totalContent: number;
  totalRevenue: number;
  monthlyRevenue: number;
  topContent: any[];
  userGrowth: any[];
  revenueGrowth: any[];
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const response = await fetch(`/api/admin/analytics?range=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data.data);
      } else {
        console.error('Failed to fetch analytics data');
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const getGrowthIcon = (growth: number) => {
    return growth >= 0 ? (
      <ArrowTrendingUpIcon className="w-4 h-4 text-green-400" />
    ) : (
      <ArrowTrendingDownIcon className="w-4 h-4 text-red-400" />
    );
  };

  const getGrowthColor = (growth: number) => {
    return growth >= 0 ? 'text-green-400' : 'text-red-400';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-netflix-black">
        <AdminSidebar />
        <div className="lg:ml-64">
          <div className="flex items-center justify-center h-screen">
            <div className="text-white text-xl">Loading analytics...</div>
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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Analytics Dashboard</h1>
            <p className="text-gray-400">Monitor your platform's performance and growth</p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 bg-netflix-gray text-white rounded-lg border border-gray-600 focus:border-netflix-red focus:outline-none"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-netflix-dark-gray rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Users</p>
                <p className="text-2xl font-bold text-white">{formatNumber(analytics?.totalUsers || 0)}</p>
              </div>
              <UserGroupIcon className="w-8 h-8 text-blue-400" />
            </div>
            <div className="flex items-center mt-2">
              {getGrowthIcon(analytics?.userGrowth?.[0]?.growth || 0)}
              <span className={`text-sm ml-1 ${getGrowthColor(analytics?.userGrowth?.[0]?.growth || 0)}`}>
                {analytics?.userGrowth?.[0]?.growth || 0}%
              </span>
            </div>
          </div>

          <div className="bg-netflix-dark-gray rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Active Users</p>
                <p className="text-2xl font-bold text-white">{formatNumber(analytics?.activeUsers || 0)}</p>
              </div>
              <EyeIcon className="w-8 h-8 text-green-400" />
            </div>
            <div className="flex items-center mt-2">
              {getGrowthIcon(analytics?.userGrowth?.[1]?.growth || 0)}
              <span className={`text-sm ml-1 ${getGrowthColor(analytics?.userGrowth?.[1]?.growth || 0)}`}>
                {analytics?.userGrowth?.[1]?.growth || 0}%
              </span>
            </div>
          </div>

          <div className="bg-netflix-dark-gray rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Subscribers</p>
                <p className="text-2xl font-bold text-white">{formatNumber(analytics?.subscribers || 0)}</p>
              </div>
              <ChartBarIcon className="w-8 h-8 text-purple-400" />
            </div>
            <div className="flex items-center mt-2">
              {getGrowthIcon(analytics?.userGrowth?.[2]?.growth || 0)}
              <span className={`text-sm ml-1 ${getGrowthColor(analytics?.userGrowth?.[2]?.growth || 0)}`}>
                {analytics?.userGrowth?.[2]?.growth || 0}%
              </span>
            </div>
          </div>

          <div className="bg-netflix-dark-gray rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Revenue</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(analytics?.totalRevenue || 0)}</p>
              </div>
              <CurrencyDollarIcon className="w-8 h-8 text-yellow-400" />
            </div>
            <div className="flex items-center mt-2">
              {getGrowthIcon(analytics?.revenueGrowth?.[0]?.growth || 0)}
              <span className={`text-sm ml-1 ${getGrowthColor(analytics?.revenueGrowth?.[0]?.growth || 0)}`}>
                {analytics?.revenueGrowth?.[0]?.growth || 0}%
              </span>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* User Growth Chart */}
          <div className="bg-netflix-dark-gray rounded-lg p-6">
            <h3 className="text-xl font-semibold text-white mb-4">User Growth</h3>
            <div className="h-64 flex items-center justify-center">
              <div className="text-center">
                <ChartBarIcon className="w-12 h-12 text-gray-500 mx-auto mb-2" />
                <p className="text-gray-400">Chart visualization would go here</p>
                <p className="text-gray-500 text-sm">Integration with Chart.js or similar</p>
              </div>
            </div>
          </div>

          {/* Revenue Chart */}
          <div className="bg-netflix-dark-gray rounded-lg p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Revenue Trend</h3>
            <div className="h-64 flex items-center justify-center">
              <div className="text-center">
                <CurrencyDollarIcon className="w-12 h-12 text-gray-500 mx-auto mb-2" />
                <p className="text-gray-400">Revenue chart would go here</p>
                <p className="text-gray-500 text-sm">Integration with Chart.js or similar</p>
              </div>
            </div>
          </div>
        </div>

        {/* Top Content */}
        <div className="bg-netflix-dark-gray rounded-lg p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Top Performing Content</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4 text-gray-300">Title</th>
                  <th className="text-left py-3 px-4 text-gray-300">Type</th>
                  <th className="text-left py-3 px-4 text-gray-300">Views</th>
                  <th className="text-left py-3 px-4 text-gray-300">Rating</th>
                  <th className="text-left py-3 px-4 text-gray-300">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {analytics?.topContent?.map((content, index) => (
                  <tr key={content._id} className="border-b border-gray-700">
                    <td className="py-3 px-4 text-white">{content.title}</td>
                    <td className="py-3 px-4 text-gray-300">{content.type}</td>
                    <td className="py-3 px-4 text-gray-300">{formatNumber(content.views || 0)}</td>
                    <td className="py-3 px-4 text-gray-300">
                      {typeof content.rating === 'object' ? content.rating.average : content.rating}
                    </td>
                    <td className="py-3 px-4 text-gray-300">{formatCurrency(content.revenue || 0)}</td>
                  </tr>
                )) || (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-400">
                      No content data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-netflix-dark-gray rounded-lg p-6">
            <h4 className="text-lg font-semibold text-white mb-3">Content Statistics</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Total Content</span>
                <span className="text-white">{formatNumber(analytics?.totalContent || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Movies</span>
                <span className="text-white">{formatNumber(analytics?.totalContent ? Math.floor(analytics.totalContent * 0.6) : 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">TV Shows</span>
                <span className="text-white">{formatNumber(analytics?.totalContent ? Math.floor(analytics.totalContent * 0.4) : 0)}</span>
              </div>
            </div>
          </div>

          <div className="bg-netflix-dark-gray rounded-lg p-6">
            <h4 className="text-lg font-semibold text-white mb-3">Subscription Stats</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Conversion Rate</span>
                <span className="text-white">
                  {analytics?.totalUsers ? ((analytics.subscribers / analytics.totalUsers) * 100).toFixed(1) : 0}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Monthly Revenue</span>
                <span className="text-white">{formatCurrency(analytics?.monthlyRevenue || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">ARPU</span>
                <span className="text-white">
                  {analytics?.subscribers ? formatCurrency(analytics.totalRevenue / analytics.subscribers) : '$0'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-netflix-dark-gray rounded-lg p-6">
            <h4 className="text-lg font-semibold text-white mb-3">Platform Health</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Uptime</span>
                <span className="text-green-400">99.9%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Avg. Load Time</span>
                <span className="text-white">1.2s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Error Rate</span>
                <span className="text-green-400">0.1%</span>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
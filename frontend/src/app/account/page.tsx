'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToastContext } from '@/components/ToastProvider';
import { 
  UserIcon,
  CreditCardIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

interface SubscriptionPlan {
  _id: string;
  name: string;
  price: number;
  duration: string;
  features: string[];
}

export default function AccountPage() {
  const { user, loading } = useAuth();
  const { success, error } = useToastContext();
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSubscriptionPlans();
    }
  }, [user]);

  const fetchSubscriptionPlans = async () => {
    try {
      const response = await fetch('/api/subscription/plans');
      const data = await response.json();
      
      if (response.ok) {
        setSubscriptionPlans(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching plans:', err);
    } finally {
      setLoadingPlans(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!user) return;

    if (typeof window !== 'undefined' && !confirm('Are you sure you want to cancel your subscription?')) {
      return;
    }

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const response = await fetch('/api/subscription/cancel', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        success('Success', 'Subscription cancelled successfully');
        // Refresh user data
        window.location.reload();
      } else {
        error('Error', data.message || 'Failed to cancel subscription');
      }
    } catch (err) {
      console.error('Error cancelling subscription:', err);
      error('Network Error', 'Failed to connect to server');
    }
  };

  const handleReactivateSubscription = async () => {
    if (!user) return;

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const response = await fetch('/api/subscription/reactivate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        success('Success', 'Subscription reactivated successfully');
        // Refresh user data
        window.location.reload();
      } else {
        error('Error', data.message || 'Failed to reactivate subscription');
      }
    } catch (err) {
      console.error('Error reactivating subscription:', err);
      error('Network Error', 'Failed to connect to server');
    }
  };

  const getSubscriptionStatus = () => {
    if (!user?.subscription) return { status: 'No Subscription', color: 'text-gray-400' };

    const endDateValue = user.subscription.endDate ?? null;
    const hasValidEnd = endDateValue ? new Date(endDateValue as string | number | Date).getTime() > Date.now() : false;

    const isActive = user.subscription.status === 'active' && hasValidEnd;

    if (isActive) {
      return { status: 'Active', color: 'text-green-400' };
    } else if (user.subscription.status === 'cancelled') {
      return { status: 'Cancelled', color: 'text-red-400' };
    } else {
      return { status: 'Expired', color: 'text-yellow-400' };
    }
  };

  const formatPrice = (price: number, currency: string, duration: string) => {
    const symbol = currency === 'USD' ? '$' : currency;
    const durationText = duration === 'monthly' ? 'mo' : 
                        duration === 'quarterly' ? 'quarter' : 'year';
    return `${symbol}${price.toFixed(2)}/${durationText}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-netflix-black flex items-center justify-center">
        <div className="text-white text-xl">Loading account...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-netflix-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Please Log In</h1>
          <p className="text-gray-400 mb-6">You need to be logged in to view your account</p>
          <a href="/login" className="btn-primary">
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  const subscriptionStatus = getSubscriptionStatus();

  return (
    <div className="min-h-screen bg-netflix-black py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">My Account</h1>
          <p className="text-gray-400">Manage your subscription and account settings</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* User Profile */}
            <div className="bg-netflix-dark-gray rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Profile Information</h2>
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-netflix-red rounded-full flex items-center justify-center">
                  <UserIcon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {user.firstName} {user.lastName}
                  </h3>
                  <p className="text-gray-400">{user.email}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={user.firstName}
                    disabled
                    className="w-full px-3 py-2 bg-netflix-gray text-white rounded-lg border border-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={user.lastName}
                    disabled
                    className="w-full px-3 py-2 bg-netflix-gray text-white rounded-lg border border-gray-600"
                  />
                </div>
              </div>
            </div>

            {/* Subscription Status */}
            <div className="bg-netflix-dark-gray rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Subscription Status</h2>
              
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <CreditCardIcon className="w-6 h-6 text-gray-400" />
                  <div>
                    <p className="text-white font-medium">
                      {user.subscription?.plan || 'No Plan'}
                    </p>
                    <p className={`text-sm ${subscriptionStatus.color}`}>
                      {subscriptionStatus.status}
                    </p>
                  </div>
                </div>
                
                {subscriptionStatus.status === 'Active' && (
                  <button
                    onClick={handleCancelSubscription}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  >
                    Cancel Subscription
                  </button>
                )}
                
                {subscriptionStatus.status === 'Cancelled' && (
                  <button
                    onClick={handleReactivateSubscription}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                  >
                    Reactivate
                  </button>
                )}
              </div>

              {user.subscription && (
                <div className="space-y-2 text-sm text-gray-400">
                  <div className="flex items-center space-x-2">
                    <CalendarIcon className="w-4 h-4" />
                    <span>
                      Started: {new Date(user.subscription.startDate as string | number | Date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CalendarIcon className="w-4 h-4" />
                    <span>
                      {subscriptionStatus.status === 'Active' ? 'Renews' : 'Expires'}: {user.subscription.endDate ? new Date(user.subscription.endDate as string | number | Date).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {user.subscription.autoRenew ? (
                      <CheckCircleIcon className="w-4 h-4 text-green-400" />
                    ) : (
                      <XCircleIcon className="w-4 h-4 text-red-400" />
                    )}
                    <span>
                      Auto-renewal: {user.subscription.autoRenew ? 'On' : 'Off'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Actions */}
            <div className="bg-netflix-dark-gray rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <a
                  href="/plans"
                  className="flex items-center justify-between p-3 bg-netflix-gray hover:bg-netflix-red rounded-lg transition-colors group"
                >
                  <span className="text-white">View Plans</span>
                  <ArrowRightIcon className="w-4 h-4 text-gray-400 group-hover:text-white" />
                </a>
                <a
                  href="/profile"
                  className="flex items-center justify-between p-3 bg-netflix-gray hover:bg-netflix-red rounded-lg transition-colors group"
                >
                  <span className="text-white">Edit Profile</span>
                  <ArrowRightIcon className="w-4 h-4 text-gray-400 group-hover:text-white" />
                </a>
                <a
                  href="/settings"
                  className="flex items-center justify-between p-3 bg-netflix-gray hover:bg-netflix-red rounded-lg transition-colors group"
                >
                  <span className="text-white">Settings</span>
                  <ArrowRightIcon className="w-4 h-4 text-gray-400 group-hover:text-white" />
                </a>
              </div>
            </div>

            {/* Available Plans */}
            {!user.subscription || subscriptionStatus.status !== 'Active' ? (
              <div className="bg-netflix-dark-gray rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Available Plans</h3>
                {loadingPlans ? (
                  <div className="text-gray-400">Loading plans...</div>
                ) : (
                  <div className="space-y-3">
                    {subscriptionPlans.slice(0, 3).map((plan) => (
                      <div key={plan._id} className="p-3 bg-netflix-gray rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="text-white font-medium">{plan.name}</h4>
                          <span className="text-netflix-red font-semibold">
                            {formatPrice(plan.price, 'USD', plan.duration)}
                          </span>
                        </div>
                        <p className="text-gray-400 text-sm">{plan.features[0]}</p>
                      </div>
                    ))}
                    <a
                      href="/plans"
                      className="block w-full text-center py-2 bg-netflix-red hover:bg-netflix-red-dark text-white rounded-lg transition-colors"
                    >
                      View All Plans
                    </a>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

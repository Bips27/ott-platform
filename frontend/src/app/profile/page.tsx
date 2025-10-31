'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { UserCircleIcon, EnvelopeIcon, CalendarIcon, CreditCardIcon } from '@heroicons/react/24/outline';

type Subscription = {
  plan?: string;
  status?: string;
  endDate?: string | number | Date;
  amount?: number;
  interval?: string;
};

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [subscription, setSubscription] = useState<Subscription | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      fetchSubscription();
    }
  }, [user, loading, router]);

  const fetchSubscription = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/subscriptions`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSubscription((data?.data?.subscription ?? null) as Subscription | null);
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const planText = subscription?.plan ?? 'N/A';
  const statusText = subscription?.status ?? 'unknown';
  const nextBillingText = subscription?.endDate ? new Date(subscription.endDate).toLocaleDateString() : 'N/A';
  const amountText = subscription?.amount != null ? `$${subscription.amount}/${subscription?.interval ?? ''}` : 'N/A';

  return (
    <div className="min-h-screen bg-dark-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">My Profile</h1>
            <p className="text-gray-400">Manage your account and subscription</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Information */}
            <div className="lg:col-span-2">
              <div className="bg-dark-800 rounded-lg p-6 mb-6">
                <h2 className="text-2xl font-bold text-white mb-6">Profile Information</h2>
                
                <div className="space-y-6">
                  <div className="flex items-center">
                    <UserCircleIcon className="w-8 h-8 text-primary-500 mr-4" />
                    <div>
                      <p className="text-sm text-gray-400">Full Name</p>
                      <p className="text-lg text-white">{user.firstName} {user.lastName}</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <EnvelopeIcon className="w-8 h-8 text-primary-500 mr-4" />
                    <div>
                      <p className="text-sm text-gray-400">Email Address</p>
                      <p className="text-lg text-white">{user.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <CalendarIcon className="w-8 h-8 text-primary-500 mr-4" />
                    <div>
                      <p className="text-sm text-gray-400">Member Since</p>
                      <p className="text-lg text-white">
                        {new Date().toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <button className="btn-outline">
                    Edit Profile
                  </button>
                </div>
              </div>

              {/* Subscription Details */}
              <div className="bg-dark-800 rounded-lg p-6">
                <h2 className="text-2xl font-bold text-white mb-6">Subscription Details</h2>
                
                {subscription ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Plan:</span>
                      <span className="text-white capitalize font-semibold">{planText}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Status:</span>
                      <span className={`capitalize font-semibold ${
                        statusText === 'active' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {statusText}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Next Billing:</span>
                      <span className="text-white">{nextBillingText}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Amount:</span>
                      <span className="text-white">{amountText}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-400 mb-4">No active subscription</p>
                    <Link href="/plans" className="btn-primary">
                      Choose a Plan
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div>
              <div className="bg-dark-800 rounded-lg p-6 mb-6">
                <h3 className="text-xl font-bold text-white mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Link href="/plans" className="block w-full btn-outline text-center">
                    Manage Subscription
                  </Link>
                  <button className="block w-full btn-outline">
                    Payment Methods
                  </button>
                  <button className="block w-full btn-outline">
                    Download History
                  </button>
                  <button className="block w-full btn-outline">
                    Watch History
                  </button>
                </div>
              </div>

              <div className="bg-dark-800 rounded-lg p-6">
                <h3 className="text-xl font-bold text-white mb-4">Account Settings</h3>
                <div className="space-y-3">
                  <button className="block w-full btn-outline">
                    Change Password
                  </button>
                  <button className="block w-full btn-outline">
                    Notification Settings
                  </button>
                  <button className="block w-full btn-outline">
                    Privacy Settings
                  </button>
                  <button className="block w-full btn-outline text-red-400 hover:text-red-300">
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

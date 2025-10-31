'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

type Subscription = {
  plan?: string;
  status?: string;
  endDate?: string | number | Date;
};

export default function SubscriptionSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [isLoading, setIsLoading] = useState(true);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (sessionId) {
      handleSubscriptionSuccess();
    } else {
      setError('No session ID provided');
      setIsLoading(false);
    }
  }, [sessionId]);

  const handleSubscriptionSuccess = async () => {
    try {
      const response = await fetch('/api/subscriptions/success', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          sessionId
        })
      });

      const data = await response.json();

      if (data.success) {
        setSubscription((data?.data?.subscription ?? null) as Subscription | null);
      } else {
        setError(data.message || 'Failed to process subscription');
      }
    } catch (error) {
      console.error('Error processing subscription:', error);
      setError('Failed to process subscription');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-gray-400">Processing your subscription...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl">!</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-4">Subscription Error</h1>
          <p className="text-gray-400 mb-8">{error}</p>
          <div className="space-x-4">
            <Link href="/plans" className="btn-primary">
              Try Again
            </Link>
            <Link href="/contact" className="btn-outline">
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const planText = subscription?.plan ?? 'N/A';
  const statusText = subscription?.status ?? 'active';
  const nextBillingText = subscription?.endDate ? new Date(subscription.endDate).toLocaleDateString() : 'N/A';

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircleIcon className="w-10 h-10 text-white" />
          </div>
          
          <h1 className="text-3xl font-bold text-white mb-4">
            Welcome to Premium!
          </h1>
          
          <p className="text-gray-400 mb-8">
            Your subscription has been activated successfully. You now have access to all premium features.
          </p>

          {subscription && (
            <div className="bg-dark-800 rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">Subscription Details</h2>
              <div className="space-y-2 text-left">
                <div className="flex justify-between">
                  <span className="text-gray-400">Plan:</span>
                  <span className="text-white capitalize">{planText}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Status:</span>
                  <span className="text-green-400 capitalize">{statusText}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Next Billing:</span>
                  <span className="text-white">
                    {nextBillingText}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <Link href="/" className="btn-primary w-full">
              Start Streaming
            </Link>
            <Link href="/profile" className="btn-outline w-full">
              Manage Subscription
            </Link>
          </div>

          <div className="mt-8 text-sm text-gray-400">
            <p>
              Need help?{' '}
              <Link href="/contact" className="text-primary-400 hover:text-primary-300">
                Contact our support team
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

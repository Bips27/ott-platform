'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useToastContext } from '@/components/ToastProvider';
import { CheckIcon, StarIcon } from '@heroicons/react/24/solid';

interface SubscriptionPlan {
  _id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  duration: string;
  durationMonths: number;
  features: string[];
  isActive: boolean;
  isPopular: boolean;
}

export default function PlansPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const { user, loading: userLoading } = useAuth();
  const { success, error } = useToastContext();

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await fetch('/api/subscription/plans');
      const data = await response.json();
      
      if (response.ok) {
        setPlans(data.data);
      } else {
        error('Error', 'Failed to load subscription plans');
      }
    } catch (err) {
      console.error('Error fetching plans:', err);
      error('Network Error', 'Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planId: string) => {
    if (!user) {
      error('Authentication Required', 'Please log in to subscribe');
      return;
    }

    setSelectedPlan(planId);
    
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const response = await fetch('/api/subscription/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ planId }),
      });

      const data = await response.json();

      if (response.ok) {
        success('Checkout Session Created', 'Redirecting to payment...');
        // In a real app, you would redirect to Stripe checkout here
        console.log('Checkout session:', data.data.checkoutSessionId);
      } else {
        error('Error', data.message || 'Failed to create checkout session');
      }
    } catch (err) {
      console.error('Error creating checkout session:', err);
      error('Network Error', 'Failed to connect to server');
    } finally {
      setSelectedPlan(null);
    }
  };

  const formatPrice = (price: number, currency: string, duration: string) => {
    const symbol = currency === 'USD' ? '$' : currency;
    const durationText = duration === 'monthly' ? 'mo' : 
                        duration === 'quarterly' ? 'quarter' : 'year';
    
    // For yearly plans, show monthly equivalent
    if (duration === 'yearly') {
      const monthlyPrice = price / 12;
      return `${symbol}${monthlyPrice.toFixed(2)}/mo`;
    }
    
    return `${symbol}${price.toFixed(2)}/${durationText}`;
  };

  const getSavingsText = (plan: SubscriptionPlan) => {
    if (plan.duration === 'quarterly') {
      return 'Save 15%';
    } else if (plan.duration === 'yearly') {
      return 'Save 25%';
    }
    return null;
  };

  const getFilteredPlans = () => {
    return plans.filter(plan => {
      if (billingPeriod === 'monthly') {
        return plan.duration === 'monthly' || plan.duration === 'quarterly';
      } else {
        return plan.duration === 'yearly';
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-netflix-black flex items-center justify-center">
        <div className="text-white text-xl">Loading subscription plans...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-netflix-black">
      {/* Header */}
      <div className="bg-gradient-to-b from-netflix-black to-netflix-dark-gray py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Unlock unlimited access to our premium content library. 
            Watch anywhere, anytime, on any device.
          </p>
          {!user && (
            <div className="bg-netflix-red/20 border border-netflix-red rounded-lg p-4 max-w-md mx-auto">
              <p className="text-white text-sm">
                Already have an account?{' '}
                <Link href="/login" className="text-netflix-red hover:text-netflix-red-dark font-medium">
                  Sign in
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Billing Period Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center mb-8">
          <div className="bg-netflix-dark-gray rounded-lg p-1 flex">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-6 py-3 rounded-md font-medium transition-all duration-200 ${
                billingPeriod === 'monthly'
                  ? 'bg-netflix-red text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod('yearly')}
              className={`px-6 py-3 rounded-md font-medium transition-all duration-200 ${
                billingPeriod === 'yearly'
                  ? 'bg-netflix-red text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Yearly
              <span className="ml-2 text-xs bg-green-500 text-white px-2 py-1 rounded-full">
                Save 25%
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {getFilteredPlans().map((plan) => (
            <div
              key={plan._id}
              className={`relative bg-netflix-dark-gray rounded-lg p-8 ${
                plan.isPopular ? 'ring-2 ring-netflix-red scale-105' : ''
              } transition-all duration-300 hover:scale-105`}
            >
              {plan.isPopular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-netflix-red text-white px-4 py-2 rounded-full text-sm font-medium flex items-center space-x-1">
                    <StarIcon className="w-4 h-4" />
                    <span>Most Popular</span>
                  </div>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-gray-400 mb-4">{plan.description}</p>
                <div className="flex flex-col items-center">
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold text-white">
                      {formatPrice(plan.price, plan.currency, plan.duration)}
                    </span>
                    {getSavingsText(plan) && (
                      <span className="ml-2 text-sm text-green-400 font-medium">
                        {getSavingsText(plan)}
                      </span>
                    )}
                  </div>
                  {plan.duration === 'yearly' && (
                    <div className="mt-2 text-sm text-gray-400">
                      Billed annually (${plan.price.toFixed(2)}/year)
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4 mb-8">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckIcon className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span className="text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handleSubscribe(plan._id)}
                disabled={selectedPlan === plan._id}
                className={`w-full py-3 px-6 rounded-lg font-medium transition-all duration-200 ${
                  plan.isPopular
                    ? 'bg-netflix-red hover:bg-netflix-red-dark text-white'
                    : 'bg-white hover:bg-gray-100 text-netflix-black'
                } ${
                  selectedPlan === plan._id ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {selectedPlan === plan._id ? 'Processing...' : 'Get Started'}
              </button>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-netflix-dark-gray rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-3">
                Can I cancel anytime?
              </h3>
              <p className="text-gray-300">
                Yes, you can cancel your subscription at any time. 
                You'll continue to have access until the end of your billing period.
              </p>
            </div>
            <div className="bg-netflix-dark-gray rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-3">
                How many devices can I use?
              </h3>
              <p className="text-gray-300">
                The number of simultaneous streams depends on your plan. 
                Basic allows 1 device, Standard allows 2, and Premium allows 4.
              </p>
            </div>
            <div className="bg-netflix-dark-gray rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-3">
                Is there a free trial?
              </h3>
              <p className="text-gray-300">
                We offer a 7-day free trial for new subscribers. 
                No credit card required to start your trial.
              </p>
            </div>
            <div className="bg-netflix-dark-gray rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-3">
                What payment methods do you accept?
              </h3>
              <p className="text-gray-300">
                We accept all major credit cards, PayPal, and digital wallets 
                through our secure payment processor.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
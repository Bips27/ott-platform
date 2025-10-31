'use client';

import { useState, useEffect } from 'react';
import { useToastContext } from '@/components/ToastProvider';
import AdminSidebar from '@/components/AdminSidebar';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  CurrencyDollarIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

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
  stripePriceId?: string;
  stripeProductId?: string;
}

export default function MonetizationPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const { success, error } = useToastContext();

  // Form state for create/edit
  const [planName, setPlanName] = useState('');
  const [planPrice, setPlanPrice] = useState<string>('');
  const [planDescription, setPlanDescription] = useState('');
  const [planDuration, setPlanDuration] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');
  const [planCurrency, setPlanCurrency] = useState<'USD' | 'EUR' | 'GBP' | 'INR'>('USD');
  const [planIsActive, setPlanIsActive] = useState<boolean>(true);
  const [planIsPopular, setPlanIsPopular] = useState<boolean>(false);
  const [planFeatures, setPlanFeatures] = useState<string[]>([]);
  const [featureInput, setFeatureInput] = useState<string>('');

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const response = await fetch('/api/admin/subscription-plans', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPlans(data.data || []);
      } else {
        error('Error', 'Failed to fetch subscription plans');
      }
    } catch (err) {
      console.error('Error fetching plans:', err);
      error('Network Error', 'Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingPlan(null);
    setPlanName('');
    setPlanPrice('');
    setPlanDescription('');
    setPlanDuration('monthly');
    setPlanCurrency('USD');
    setPlanIsActive(true);
    setPlanIsPopular(false);
    setPlanFeatures([]);
    setFeatureInput('');
    setShowModal(true);
  };

  const openEditModal = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setPlanName(plan.name || '');
    setPlanPrice(String(plan.price ?? ''));
    setPlanDescription(plan.description || '');
    setPlanDuration((plan.duration as any) || 'monthly');
    setPlanCurrency((plan.currency as any) || 'USD');
    setPlanIsActive(!!plan.isActive);
    setPlanIsPopular(!!plan.isPopular);
    setPlanFeatures(Array.isArray(plan.features) ? plan.features : []);
    setFeatureInput('');
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const durationMonths = planDuration === 'monthly' ? 1 : planDuration === 'quarterly' ? 3 : 12;

      const payload: any = {
        name: planName,
        description: planDescription,
        price: parseFloat(planPrice || '0'),
        currency: planCurrency,
        duration: planDuration,
        durationMonths,
        isActive: planIsActive,
        isPopular: planIsPopular,
      };

      // Features
      payload.features = (planFeatures || []).map(f => (f || '').trim()).filter(Boolean);

      const endpoint = editingPlan ? `/api/admin/subscription-plans/${editingPlan._id}` : '/api/admin/subscription-plans';
      const method = editingPlan ? 'PUT' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok) {
        error('Error', data?.message || 'Failed to save plan');
        return;
      }

      success('Success', editingPlan ? 'Plan updated' : 'Plan created');
      setShowModal(false);
      await fetchPlans();
    } catch (err) {
      console.error('Error saving plan:', err);
      error('Network Error', 'Failed to connect to server');
    }
  };

  const handleDeletePlan = async (planId: string) => {
    if (typeof window !== 'undefined' && !confirm('Are you sure you want to delete this plan?')) {
      return;
    }

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const response = await fetch(`/api/admin/subscription-plans/${planId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        success('Success', 'Plan deleted successfully');
        fetchPlans();
      } else {
        error('Error', data.message || 'Failed to delete plan');
      }
    } catch (err) {
      console.error('Error deleting plan:', err);
      error('Network Error', 'Failed to connect to server');
    }
  };

  const handleToggleActive = async (planId: string, isActive: boolean) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const response = await fetch(`/api/admin/subscription-plans/${planId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isActive: !isActive }),
      });

      const data = await response.json();

      if (response.ok) {
        success('Success', `Plan ${!isActive ? 'activated' : 'deactivated'} successfully`);
        fetchPlans();
      } else {
        error('Error', data.message || 'Failed to update plan');
      }
    } catch (err) {
      console.error('Error updating plan:', err);
      error('Network Error', 'Failed to connect to server');
    }
  };

  const formatPrice = (price: number, currency: string, duration: string) => {
    const symbol = currency === 'USD' ? '$' : currency;
    const durationText = duration === 'monthly' ? 'mo' : 
                        duration === 'quarterly' ? 'quarter' : 'year';
    return `${symbol}${price.toFixed(2)}/${durationText}`;
  };

  const getDurationBadge = (duration: string) => {
    const colors = {
      monthly: 'bg-blue-900 text-blue-200',
      quarterly: 'bg-green-900 text-green-200',
      yearly: 'bg-purple-900 text-purple-200'
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[duration as keyof typeof colors]}`}>
        {duration.charAt(0).toUpperCase() + duration.slice(1)}
      </span>
    );
  };

  const getCurrencySymbol = (currency: string) => {
    switch (currency) {
      case 'USD':
        return '$';
      case 'EUR':
        return '€';
      case 'GBP':
        return '£';
      case 'INR':
        return '₹';
      default:
        return currency;
    }
  };

  const calculateMonthlyTotalsByCurrency = (items: SubscriptionPlan[]) => {
    const totals: Record<string, number> = {};
    for (const plan of items) {
      let monthly = plan.price;
      if (plan.duration === 'quarterly') monthly = plan.price / 3;
      if (plan.duration === 'yearly') monthly = plan.price / 12;
      totals[plan.currency] = (totals[plan.currency] || 0) + monthly;
    }
    return totals;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-netflix-black">
        <AdminSidebar />
        <div className="lg:ml-64">
          <div className="flex items-center justify-center h-screen">
            <div className="text-white text-xl">Loading subscription plans...</div>
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
            <h1 className="text-3xl font-bold text-white mb-2">Monetization</h1>
            <p className="text-gray-400">Manage subscription plans and pricing</p>
          </div>
          <button
            onClick={openCreateModal}
            className="btn-primary flex items-center space-x-2"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Add Plan</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-netflix-dark-gray rounded-lg p-6">
            <div className="flex items-center space-x-3">
              <CurrencyDollarIcon className="w-8 h-8 text-green-400" />
              <div>
                <div className="text-2xl font-bold text-white">{plans.length}</div>
                <div className="text-gray-400">Total Plans</div>
              </div>
            </div>
          </div>
          <div className="bg-netflix-dark-gray rounded-lg p-6">
            <div className="flex items-center space-x-3">
              <ChartBarIcon className="w-8 h-8 text-blue-400" />
              <div>
                <div className="text-2xl font-bold text-white">
                  {plans.filter(p => p.isActive).length}
                </div>
                <div className="text-gray-400">Active Plans</div>
              </div>
            </div>
          </div>
          <div className="bg-netflix-dark-gray rounded-lg p-6">
            <div className="flex items-center space-x-3">
              <CurrencyDollarIcon className="w-8 h-8 text-yellow-400" />
              <div>
                <div className="text-2xl font-bold text-white">
                  {(() => {
                    const totals = calculateMonthlyTotalsByCurrency(plans);
                    const entries = Object.entries(totals);
                    if (!entries.length) return '$0.00';
                    return entries
                      .map(([cur, amt]) => `${getCurrencySymbol(cur)}${amt.toFixed(2)}`)
                      .join(', ');
                  })()}
                </div>
                <div className="text-gray-400">Monthly Revenue Potential</div>
              </div>
            </div>
          </div>
          <div className="bg-netflix-dark-gray rounded-lg p-6">
            <div className="flex items-center space-x-3">
              <ChartBarIcon className="w-8 h-8 text-purple-400" />
              <div>
                <div className="text-2xl font-bold text-white">
                  {plans.filter(p => p.isPopular).length}
                </div>
                <div className="text-gray-400">Popular Plans</div>
              </div>
            </div>
          </div>
        </div>

        {/* Plans Table */}
        <div className="bg-netflix-dark-gray rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-netflix-gray">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Plan</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Price</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Duration</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Features</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {plans.map((plan) => (
                  <tr key={plan._id} className="hover:bg-netflix-gray/50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-white font-medium flex items-center space-x-2">
                          <span>{plan.name}</span>
                          {plan.isPopular && (
                            <span className="px-2 py-1 text-xs font-medium bg-netflix-red text-white rounded-full">
                              Popular
                            </span>
                          )}
                        </div>
                        <div className="text-gray-400 text-sm">{plan.description}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-white font-medium">
                        {formatPrice(plan.price, plan.currency, plan.duration)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {getDurationBadge(plan.duration)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-300 text-sm">
                        {plan.features.length} features
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        plan.isActive 
                          ? 'bg-green-900 text-green-200' 
                          : 'bg-gray-900 text-gray-200'
                      }`}>
                        {plan.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => openEditModal(plan)}
                          className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                          title="Edit Plan"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleActive(plan._id, plan.isActive)}
                          className={`p-2 rounded-lg transition-colors ${
                            plan.isActive
                              ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                              : 'bg-green-600 hover:bg-green-700 text-white'
                          }`}
                          title={plan.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {plan.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => handleDeletePlan(plan._id)}
                          className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                          title="Delete Plan"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {plans.length === 0 && (
            <div className="text-center py-12">
              <CurrencyDollarIcon className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">No subscription plans found</p>
            </div>
          )}
        </div>
        </div>
      </div>

      {/* Plan Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-netflix-dark-gray rounded-lg p-6 w-full max-w-2xl mx-4">
            <h2 className="text-2xl font-bold text-white mb-6">
              {editingPlan ? 'Edit Plan' : 'Add New Plan'}
            </h2>
            
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Plan Name
                  </label>
                  <input
                    type="text"
                    value={planName}
                    onChange={(e) => setPlanName(e.target.value)}
                    className="w-full px-3 py-2 bg-netflix-gray text-white rounded-lg border border-gray-600 focus:border-netflix-red focus:outline-none"
                    placeholder="e.g., Basic, Premium"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Price
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={planPrice}
                    onChange={(e) => setPlanPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-netflix-gray text-white rounded-lg border border-gray-600 focus:border-netflix-red focus:outline-none"
                    placeholder="9.99"
                  />
                </div>
              </div>

              {/* Features */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Features
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={featureInput}
                    onChange={(e) => setFeatureInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const next = (featureInput || '').trim();
                        if (next) {
                          setPlanFeatures([...planFeatures, next]);
                          setFeatureInput('');
                        }
                      }
                    }}
                    className="flex-1 px-3 py-2 bg-netflix-gray text-white rounded-lg border border-gray-600 focus:border-netflix-red focus:outline-none"
                    placeholder="Add a feature and press Enter"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const next = (featureInput || '').trim();
                      if (next) {
                        setPlanFeatures([...planFeatures, next]);
                        setFeatureInput('');
                      }
                    }}
                    className="px-4 py-2 bg-netflix-red text-white rounded-lg hover:opacity-90"
                  >
                    Add
                  </button>
                </div>
                {planFeatures.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {planFeatures.map((f, idx) => (
                      <span key={`${f}-${idx}`} className="inline-flex items-center gap-2 px-2 py-1 rounded-full bg-netflix-gray text-gray-200 text-xs">
                        {f}
                        <button
                          type="button"
                          onClick={() => setPlanFeatures(planFeatures.filter((_, i) => i !== idx))}
                          className="text-gray-400 hover:text-white"
                          aria-label="Remove feature"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={planDescription}
                  onChange={(e) => setPlanDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-netflix-gray text-white rounded-lg border border-gray-600 focus:border-netflix-red focus:outline-none"
                  placeholder="Plan description..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Duration
                  </label>
                  <select
                    value={planDuration}
                    onChange={(e) => setPlanDuration(e.target.value as any)}
                    className="w-full px-3 py-2 bg-netflix-gray text-white rounded-lg border border-gray-600 focus:border-netflix-red focus:outline-none"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Currency
                  </label>
                  <select
                    value={planCurrency}
                    onChange={(e) => setPlanCurrency(e.target.value as any)}
                    className="w-full px-3 py-2 bg-netflix-gray text-white rounded-lg border border-gray-600 focus:border-netflix-red focus:outline-none"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="INR">INR</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2 text-white">
                  <input
                    type="checkbox"
                    checked={planIsActive}
                    onChange={(e) => setPlanIsActive(e.target.checked)}
                    className="w-4 h-4 text-netflix-red bg-netflix-gray border-gray-600 rounded focus:ring-netflix-red"
                  />
                  <span className="text-sm">Active</span>
                </label>
                <label className="flex items-center space-x-2 text-white">
                  <input
                    type="checkbox"
                    checked={planIsPopular}
                    onChange={(e) => setPlanIsPopular(e.target.checked)}
                    className="w-4 h-4 text-netflix-red bg-netflix-gray border-gray-600 rounded focus:ring-netflix-red"
                  />
                  <span className="text-sm">Popular</span>
                </label>
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary px-4 py-2"
                >
                  {editingPlan ? 'Update Plan' : 'Create Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
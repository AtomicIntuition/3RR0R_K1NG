'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Modal } from '@/components/Modal';
import { PRICING } from '@/lib/constants';
import { toast } from 'sonner';

interface SubscriptionInfo {
  status: 'active' | 'canceled' | 'past_due' | 'none';
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  plan: string | null;
}

export default function AccountPage() {
  const router = useRouter();
  const { user, profile, loading, signOut, refreshProfile } = useAuth();

  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [loadingSubscription, setLoadingSubscription] = useState(true);

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    if (user && profile?.stripe_subscription_id) {
      fetchSubscription();
    } else {
      setLoadingSubscription(false);
    }
  }, [loading, user, profile, router]);

  const fetchSubscription = async () => {
    try {
      const response = await fetch('/api/account/subscription');
      if (response.ok) {
        const data = await response.json();
        setSubscription(data);
      }
    } catch {
      // Subscription fetch failed
    } finally {
      setLoadingSubscription(false);
    }
  };

  const handleCancelSubscription = async () => {
    setIsProcessing(true);
    setActionError('');

    try {
      const response = await fetch('/api/account/subscription/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: cancelReason }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to cancel subscription');
      }

      setActionSuccess('Your subscription has been canceled.');
      toast.success('Subscription canceled');
      setShowCancelModal(false);
      await fetchSubscription();
      await refreshProfile();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to cancel subscription';
      setActionError(message);
      toast.error(message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      setActionError('Please type DELETE to confirm');
      return;
    }

    setIsProcessing(true);
    setActionError('');

    try {
      const response = await fetch('/api/account/delete', { method: 'DELETE' });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete account');
      }

      toast.success('Account deleted');
      await signOut();
      router.push('/?deleted=true');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete account';
      setActionError(message);
      toast.error(message);
      setIsProcessing(false);
    }
  };

  const handleReactivateSubscription = async () => {
    setIsProcessing(true);
    setActionError('');

    try {
      const response = await fetch('/api/account/subscription/reactivate', { method: 'POST' });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reactivate subscription');
      }

      setActionSuccess('Your subscription has been reactivated!');
      toast.success('Subscription reactivated!');
      await fetchSubscription();
      await refreshProfile();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to reactivate subscription';
      setActionError(message);
      toast.error(message);
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/80 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTAgMGg0MHY0MEgweiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 py-12">
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">Account Settings</h1>
          <p className="text-white/70">Manage your account and subscription</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Success/Error Messages */}
        {actionSuccess && (
          <div className="px-4 py-3 bg-emerald-50 border-2 border-emerald-200 rounded-xl text-emerald-700 font-medium flex items-center gap-3">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {actionSuccess}
          </div>
        )}

        {actionError && (
          <div className="px-4 py-3 bg-red-50 border-2 border-red-200 rounded-xl text-red-600 font-medium flex items-center gap-3">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {actionError}
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <h2 className="text-xl font-black text-gray-900">Profile</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="text-gray-500 font-medium">Email</span>
              <span className="text-gray-900 font-bold">{user?.email}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="text-gray-500 font-medium">Account Created</span>
              <span className="text-gray-900">{user?.created_at ? formatDate(user.created_at) : '-'}</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-gray-500 font-medium">Current Tier</span>
              <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                profile?.tier === 'pro'
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {profile?.tier?.toUpperCase() || 'FREE'}
              </span>
            </div>
          </div>
        </div>

        {/* Subscription Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <h2 className="text-xl font-black text-gray-900">Subscription</h2>
          </div>
          <div className="p-6">
            {loadingSubscription ? (
              <div className="flex items-center gap-3 text-gray-500">
                <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                Loading subscription info...
              </div>
            ) : profile?.tier === 'pro' && subscription ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Plan</p>
                    <p className="text-gray-900 font-bold">Pro ({subscription.plan || 'Monthly'})</p>
                  </div>
                  <span className={`px-4 py-1.5 rounded-full text-sm font-bold ${
                    subscription.cancelAtPeriodEnd
                      ? 'bg-amber-100 text-amber-700'
                      : subscription.status === 'active'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {subscription.cancelAtPeriodEnd ? 'Canceling' : subscription.status.toUpperCase()}
                  </span>
                </div>

                <div>
                  <p className="text-gray-500 text-sm mb-1">
                    {subscription.cancelAtPeriodEnd ? 'Access Until' : 'Next Billing Date'}
                  </p>
                  <p className="text-gray-900 font-bold">
                    {subscription.currentPeriodEnd ? formatDate(subscription.currentPeriodEnd) : '-'}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500 text-sm mb-2">Monthly Scans</p>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all"
                        style={{ width: `${Math.min(100, ((profile.scans_this_month || 0) / PRICING.PRO_SCANS_PER_MONTH) * 100)}%` }}
                      />
                    </div>
                    <span className="text-gray-700 font-bold text-sm">
                      {profile.scans_this_month || 0} / {PRICING.PRO_SCANS_PER_MONTH}
                    </span>
                  </div>
                </div>

                {profile.scan_credits > 0 && (
                  <div className="flex items-center justify-between py-3 border-t border-gray-100">
                    <span className="text-gray-500 font-medium">Bonus Scan Credits</span>
                    <span className="text-indigo-600 font-bold">{profile.scan_credits}</span>
                  </div>
                )}

                <div className="pt-4 border-t border-gray-100">
                  {subscription.cancelAtPeriodEnd ? (
                    <button
                      onClick={handleReactivateSubscription}
                      disabled={isProcessing}
                      className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50"
                    >
                      {isProcessing ? 'Processing...' : 'Reactivate Subscription'}
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowCancelModal(true)}
                      className="text-gray-500 hover:text-red-600 font-medium transition-colors"
                    >
                      Cancel Subscription
                    </button>
                  )}
                </div>
              </div>
            ) : profile?.tier === 'pro' && !subscription ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Plan</p>
                    <p className="text-gray-900 font-bold">Pro (Complimentary)</p>
                  </div>
                  <span className="px-4 py-1.5 rounded-full text-sm font-bold bg-emerald-100 text-emerald-700">
                    ACTIVE
                  </span>
                </div>
                <p className="text-gray-500 text-sm">
                  Your Pro access was granted via whitelist.
                </p>
              </div>
            ) : (
              <div>
                <p className="text-gray-500 mb-4">
                  You&apos;re on the free plan ({PRICING.FREE_SCANS_PER_DAY} scans/day).
                </p>
                {profile && profile.scan_credits > 0 && (
                  <p className="text-indigo-600 font-bold mb-4">
                    {profile.scan_credits} scan credits remaining
                  </p>
                )}
                <Link
                  href="/pricing"
                  className="inline-block px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
                >
                  Upgrade to Pro
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-2xl shadow-xl border-2 border-red-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-red-100 bg-red-50">
            <h2 className="text-xl font-black text-red-600">Danger Zone</h2>
          </div>
          <div className="p-6">
            <p className="text-gray-500 mb-4">
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-6 py-3 border-2 border-red-500 text-red-600 font-bold rounded-xl hover:bg-red-50 transition-all"
            >
              Delete Account
            </button>
          </div>
        </div>

        {/* Back link */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-indigo-600 font-medium transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </Link>
      </div>

      {/* Cancel Modal */}
      <Modal isOpen={showCancelModal} onClose={() => setShowCancelModal(false)}>
        <div className="p-6">
          <h3 className="text-xl font-black text-gray-900 mb-4">Cancel Subscription</h3>
          <p className="text-gray-500 mb-4">
            Your subscription will remain active until the end of your billing period.
          </p>
          <div className="mb-4">
            <label className="text-sm text-gray-500 mb-2 block">Mind telling us why? (optional)</label>
            <select
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-indigo-500"
            >
              <option value="">Select a reason...</option>
              <option value="too_expensive">Too expensive</option>
              <option value="not_using">Not using it enough</option>
              <option value="missing_features">Missing features</option>
              <option value="found_alternative">Found an alternative</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowCancelModal(false)}
              className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
            >
              Keep Subscription
            </button>
            <button
              onClick={handleCancelSubscription}
              disabled={isProcessing}
              className="flex-1 px-4 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {isProcessing ? 'Canceling...' : 'Cancel'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
        <div className="p-6">
          <h3 className="text-xl font-black text-red-600 mb-4">Delete Account</h3>
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-4">
            <p className="text-red-700 font-bold mb-2">Warning: This is permanent!</p>
            <ul className="text-gray-600 text-sm space-y-1 list-disc list-inside">
              <li>All scan history deleted</li>
              <li>Subscription canceled immediately</li>
              <li>Unused credits lost</li>
            </ul>
          </div>
          <div className="mb-4">
            <label className="text-sm text-gray-500 mb-2 block">
              Type <span className="text-red-600 font-bold">DELETE</span> to confirm
            </label>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="DELETE"
              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-red-500"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => { setShowDeleteModal(false); setDeleteConfirmText(''); }}
              className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteAccount}
              disabled={isProcessing || deleteConfirmText !== 'DELETE'}
              className="flex-1 px-4 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

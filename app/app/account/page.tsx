'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import clsx from 'clsx';
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

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
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
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-700 border-t-white rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  const usagePercent = Math.min(100, ((profile?.scans_this_month || 0) / PRICING.PRO_SCANS_PER_MONTH) * 100);

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-10 pb-16 space-y-8">

        {/* ——— Page header ——— */}
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-white">Account</h1>
          <Link
            href="/dashboard"
            className="text-sm text-gray-500 hover:text-white transition-colors"
          >
            Dashboard
          </Link>
        </div>

        {/* ——— Alerts ——— */}
        {actionSuccess && (
          <div className="px-4 py-3 border border-emerald-500/20 rounded-lg">
            <p className="text-sm text-emerald-400">{actionSuccess}</p>
          </div>
        )}
        {actionError && (
          <div className="px-4 py-3 border border-red-500/20 rounded-lg">
            <p className="text-sm text-red-400">{actionError}</p>
          </div>
        )}

        {/* ——— Profile strip ——— */}
        <div className="grid grid-cols-2 sm:grid-cols-3 border border-gray-800 rounded-lg divide-x divide-y sm:divide-y-0 divide-gray-800">
          <div className="px-5 py-4">
            <p className="text-xs text-gray-500 mb-1">Email</p>
            <p className="text-sm font-medium text-gray-200 truncate">{user?.email}</p>
          </div>
          <div className="px-5 py-4">
            <p className="text-xs text-gray-500 mb-1">Plan</p>
            <p className="text-lg font-semibold text-white">
              {profile?.tier === 'pro' ? 'Pro' : 'Free'}
            </p>
          </div>
          <div className="px-5 py-4 col-span-2 sm:col-span-1">
            <p className="text-xs text-gray-500 mb-1">Member since</p>
            <p className="text-sm text-gray-300">
              {user?.created_at ? formatDate(user.created_at) : '—'}
            </p>
          </div>
        </div>

        {/* ——— Subscription ——— */}
        <div>
          <h2 className="text-sm font-medium text-gray-400 mb-3">Subscription</h2>
          <div className="border border-gray-800 rounded-lg overflow-hidden">
            {loadingSubscription ? (
              <div className="p-12 text-center">
                <div className="w-5 h-5 border-2 border-gray-700 border-t-white rounded-full animate-spin mx-auto mb-3" />
                <p className="text-gray-500 text-sm">Loading subscription...</p>
              </div>
            ) : profile?.tier === 'pro' && subscription ? (
              <div className="divide-y divide-gray-800">
                {/* Plan row */}
                <div className="flex items-center justify-between px-5 py-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Plan</p>
                    <p className="text-sm text-white font-medium">Pro ({subscription.plan || 'Monthly'})</p>
                  </div>
                  <span className={clsx(
                    'px-2 py-0.5 rounded-md text-xs font-medium',
                    subscription.cancelAtPeriodEnd
                      ? 'bg-amber-500/10 text-amber-400'
                      : subscription.status === 'active'
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : 'bg-red-500/10 text-red-400'
                  )}>
                    {subscription.cancelAtPeriodEnd ? 'Canceling' : subscription.status}
                  </span>
                </div>

                {/* Billing date row */}
                <div className="flex items-center justify-between px-5 py-4">
                  <p className="text-xs text-gray-500">
                    {subscription.cancelAtPeriodEnd ? 'Access until' : 'Next billing'}
                  </p>
                  <p className="text-sm text-gray-300">
                    {subscription.currentPeriodEnd ? formatDate(subscription.currentPeriodEnd) : '—'}
                  </p>
                </div>

                {/* Usage row */}
                <div className="px-5 py-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-gray-500">Monthly scans</p>
                    <span className="text-xs text-gray-400 font-medium tabular-nums">
                      {profile.scans_this_month || 0} / {PRICING.PRO_SCANS_PER_MONTH}
                    </span>
                  </div>
                  <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-white/60 rounded-full transition-all"
                      style={{ width: `${usagePercent}%` }}
                    />
                  </div>
                </div>

                {/* Bonus credits */}
                {profile.scan_credits > 0 && (
                  <div className="flex items-center justify-between px-5 py-4">
                    <p className="text-xs text-gray-500">Bonus credits</p>
                    <p className="text-sm text-white font-medium tabular-nums">{profile.scan_credits}</p>
                  </div>
                )}

                {/* Action row */}
                <div className="px-5 py-4">
                  {subscription.cancelAtPeriodEnd ? (
                    <button
                      onClick={handleReactivateSubscription}
                      disabled={isProcessing}
                      className="px-4 py-2 bg-white text-gray-950 font-semibold rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 text-sm"
                    >
                      {isProcessing ? 'Processing...' : 'Reactivate Subscription'}
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowCancelModal(true)}
                      className="text-sm text-gray-500 hover:text-red-400 transition-colors"
                    >
                      Cancel subscription
                    </button>
                  )}
                </div>
              </div>
            ) : profile?.tier === 'pro' && !subscription ? (
              <div className="px-5 py-5">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm text-white font-medium">Pro (Complimentary)</p>
                  <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-emerald-500/10 text-emerald-400">
                    Active
                  </span>
                </div>
                <p className="text-xs text-gray-500">Your Pro access was granted via whitelist.</p>
              </div>
            ) : (
              <div className="px-5 py-5">
                <p className="text-sm text-gray-400 mb-4">
                  Free plan — {PRICING.FREE_SCANS_PER_DAY} scans per day.
                </p>
                {profile && profile.scan_credits > 0 && (
                  <p className="text-sm text-white font-medium mb-4 tabular-nums">
                    {profile.scan_credits} bonus credits remaining
                  </p>
                )}
                <Link
                  href="/pricing"
                  className="inline-block px-4 py-2 bg-white text-gray-950 font-semibold rounded-lg hover:bg-gray-200 transition-colors text-sm"
                >
                  Upgrade to Pro
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* ——— Danger zone ——— */}
        <div>
          <h2 className="text-sm font-medium text-red-400/70 mb-3">Danger zone</h2>
          <div className="border border-red-500/20 rounded-lg px-5 py-5">
            <p className="text-sm text-gray-400 mb-4">
              Permanently delete your account and all associated data. This cannot be undone.
            </p>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-4 py-2 border border-red-500/30 text-red-400 font-medium rounded-lg hover:bg-red-500/5 transition-colors text-sm"
            >
              Delete Account
            </button>
          </div>
        </div>

      </div>

      {/* Cancel Modal */}
      <Modal isOpen={showCancelModal} onClose={() => setShowCancelModal(false)}>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Cancel Subscription</h3>
          <p className="text-sm text-gray-400 mb-4">
            Your subscription will remain active until the end of your billing period.
          </p>
          <div className="mb-5">
            <label className="text-xs text-gray-500 mb-2 block">Mind telling us why? (optional)</label>
            <select
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-900 border border-gray-800 rounded-lg text-sm text-gray-100 focus:outline-none focus:border-gray-600"
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
              className="flex-1 px-4 py-2.5 border border-gray-800 text-gray-300 font-medium rounded-lg hover:bg-gray-900 transition-colors text-sm"
            >
              Keep Subscription
            </button>
            <button
              onClick={handleCancelSubscription}
              disabled={isProcessing}
              className="flex-1 px-4 py-2.5 bg-red-600 text-white font-medium rounded-lg hover:bg-red-500 transition-colors disabled:opacity-50 text-sm"
            >
              {isProcessing ? 'Canceling...' : 'Cancel'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-red-400 mb-4">Delete Account</h3>
          <div className="border border-red-500/20 rounded-lg p-4 mb-4">
            <p className="text-sm text-red-400 font-medium mb-2">This is permanent</p>
            <ul className="text-sm text-gray-400 space-y-1 list-disc list-inside">
              <li>All scan history deleted</li>
              <li>Subscription canceled immediately</li>
              <li>Unused credits lost</li>
            </ul>
          </div>
          <div className="mb-5">
            <label className="text-xs text-gray-500 mb-2 block">
              Type <span className="text-red-400 font-medium">DELETE</span> to confirm
            </label>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="DELETE"
              className="w-full px-4 py-2.5 bg-gray-900 border border-gray-800 rounded-lg text-sm text-gray-100 focus:outline-none focus:border-red-500"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => { setShowDeleteModal(false); setDeleteConfirmText(''); }}
              className="flex-1 px-4 py-2.5 border border-gray-800 text-gray-300 font-medium rounded-lg hover:bg-gray-900 transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteAccount}
              disabled={isProcessing || deleteConfirmText !== 'DELETE'}
              className="flex-1 px-4 py-2.5 bg-red-600 text-white font-medium rounded-lg hover:bg-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {isProcessing ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

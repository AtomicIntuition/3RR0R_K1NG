'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Modal } from '@/components/Modal';
import { PRICING } from '@/lib/constants';
import { toast } from 'sonner';
import clsx from 'clsx';

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

  // Modal states
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
      // Subscription fetch failed - user may not have one
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

      setActionSuccess('Your subscription has been canceled. You\'ll retain access until the end of your billing period.');
      toast.success('Subscription canceled', { description: 'You\'ll retain access until the end of your billing period.' });
      setShowCancelModal(false);
      await fetchSubscription();
      await refreshProfile();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to cancel subscription';
      setActionError(message);
      toast.error('Failed to cancel subscription', { description: message });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      setActionError('Please type DELETE to confirm');
      toast.error('Please type DELETE to confirm');
      return;
    }

    setIsProcessing(true);
    setActionError('');

    try {
      const response = await fetch('/api/account/delete', {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete account');
      }

      toast.success('Account deleted', { description: 'Signing you out...' });

      // Sign out and redirect
      await signOut();
      router.push('/?deleted=true');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete account';
      setActionError(message);
      toast.error('Failed to delete account', { description: message });
      setIsProcessing(false);
    }
  };

  const handleReactivateSubscription = async () => {
    setIsProcessing(true);
    setActionError('');

    try {
      const response = await fetch('/api/account/subscription/reactivate', {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reactivate subscription');
      }

      setActionSuccess('Your subscription has been reactivated!');
      toast.success('Subscription reactivated!', { description: 'Your Pro access has been restored.' });
      await fetchSubscription();
      await refreshProfile();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to reactivate subscription';
      setActionError(message);
      toast.error('Failed to reactivate subscription', { description: message });
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-terminal">Loading...</div>
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
    <div className="min-h-screen">
      <div className="pt-4 pb-12 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-100">Account Settings</h1>
            <p className="text-gray-400 mt-2">Manage your account and subscription</p>
          </div>

          {/* Success/Error Messages */}
          {actionSuccess && (
            <div className="mb-6 px-4 py-3 bg-terminal/10 border border-terminal/30 rounded-lg text-terminal">
              {actionSuccess}
            </div>
          )}

          {actionError && (
            <div className="mb-6 px-4 py-3 bg-danger/10 border border-danger/30 rounded-lg text-danger">
              {actionError}
            </div>
          )}

          {/* Profile Section */}
          <div className="bg-void-50 rounded-lg border border-void-100 p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-100 mb-4">Profile</h2>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-500">Email</label>
                <p className="text-gray-200">{user?.email}</p>
              </div>

              <div>
                <label className="text-sm text-gray-500">Account Created</label>
                <p className="text-gray-200">
                  {user?.created_at ? formatDate(user.created_at) : '-'}
                </p>
              </div>

              <div>
                <label className="text-sm text-gray-500">Current Tier</label>
                <p className="text-gray-200 flex items-center gap-2">
                  <span className={clsx(
                    'px-2 py-1 rounded text-xs font-bold',
                    profile?.tier === 'pro' ? 'bg-terminal/20 text-terminal' : 'bg-gray-500/20 text-gray-400'
                  )}>
                    {profile?.tier?.toUpperCase() || 'FREE'}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Subscription Section */}
          <div className="bg-void-50 rounded-lg border border-void-100 p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-100 mb-4">Subscription</h2>

            {loadingSubscription ? (
              <p className="text-gray-500">Loading subscription info...</p>
            ) : profile?.tier === 'pro' && subscription ? (
              // Pro user with active Stripe subscription
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm text-gray-500">Plan</label>
                    <p className="text-gray-200">Pro ({subscription.plan || 'Monthly'})</p>
                  </div>
                  <span className={clsx(
                    'px-3 py-1 rounded-full text-xs font-bold',
                    subscription.cancelAtPeriodEnd
                      ? 'bg-neon-yellow/20 text-neon-yellow'
                      : subscription.status === 'active'
                      ? 'bg-terminal/20 text-terminal'
                      : 'bg-danger/20 text-danger'
                  )}>
                    {subscription.cancelAtPeriodEnd ? 'Canceling' : subscription.status.toUpperCase()}
                  </span>
                </div>

                <div>
                  <label className="text-sm text-gray-500">
                    {subscription.cancelAtPeriodEnd ? 'Access Until' : 'Next Billing Date'}
                  </label>
                  <p className="text-gray-200">
                    {subscription.currentPeriodEnd
                      ? formatDate(subscription.currentPeriodEnd)
                      : '-'}
                  </p>
                </div>

                <div>
                  <label className="text-sm text-gray-500">Monthly Scans</label>
                  <p className="text-gray-200">
                    {profile.scans_this_month || 0} / {PRICING.PRO_SCANS_PER_MONTH} used
                  </p>
                </div>

                {profile.scan_credits > 0 && (
                  <div>
                    <label className="text-sm text-gray-500">Bonus Scan Credits</label>
                    <p className="text-gray-200">{profile.scan_credits} remaining</p>
                  </div>
                )}

                <div className="pt-4 border-t border-void-200">
                  {subscription.cancelAtPeriodEnd ? (
                    <button
                      onClick={handleReactivateSubscription}
                      disabled={isProcessing}
                      className="px-4 py-2 bg-terminal text-void font-bold rounded hover:bg-terminal-bright transition-colors disabled:opacity-50"
                    >
                      {isProcessing ? 'Processing...' : 'Reactivate Subscription'}
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowCancelModal(true)}
                      className="px-4 py-2 text-gray-400 hover:text-danger transition-colors"
                    >
                      Cancel Subscription
                    </button>
                  )}
                </div>
              </div>
            ) : profile?.tier === 'pro' && !subscription ? (
              // Pro user without Stripe subscription (whitelisted/gifted)
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm text-gray-500">Plan</label>
                    <p className="text-gray-200">Pro (Complimentary)</p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-terminal/20 text-terminal">
                    ACTIVE
                  </span>
                </div>

                <div>
                  <label className="text-sm text-gray-500">Monthly Scans</label>
                  <p className="text-gray-200">
                    {profile.scans_this_month || 0} / {PRICING.PRO_SCANS_PER_MONTH} used
                  </p>
                </div>

                {profile.scan_credits > 0 && (
                  <div>
                    <label className="text-sm text-gray-500">Bonus Scan Credits</label>
                    <p className="text-gray-200">{profile.scan_credits} remaining</p>
                  </div>
                )}

                <div className="pt-4 border-t border-void-200">
                  <p className="text-sm text-gray-500">
                    Your Pro access was granted via whitelist. Enjoy priority queue and unlimited roasting power!
                  </p>
                </div>
              </div>
            ) : (
              // Free or anonymous user
              <div>
                <p className="text-gray-400 mb-4">
                  You&apos;re on the free plan ({PRICING.FREE_SCANS_PER_DAY} scans/day).
                </p>

                {profile && profile.scan_credits > 0 && (
                  <div className="mb-4">
                    <label className="text-sm text-gray-500">Scan Credits</label>
                    <p className="text-gray-200">{profile.scan_credits} remaining</p>
                  </div>
                )}

                <Link
                  href="/pricing"
                  className="inline-block px-6 py-3 bg-terminal text-void font-bold rounded-lg hover:bg-terminal-bright transition-colors"
                >
                  Upgrade to Pro
                </Link>
              </div>
            )}
          </div>

          {/* Danger Zone */}
          <div className="bg-void-50 rounded-lg border border-danger/30 p-6">
            <h2 className="text-xl font-bold text-danger mb-4">Danger Zone</h2>

            <p className="text-gray-400 text-sm mb-4">
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>

            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-4 py-2 border border-danger text-danger rounded hover:bg-danger/10 transition-colors"
            >
              Delete Account
            </button>
          </div>

          {/* Back link */}
          <div className="mt-8">
            <Link href="/dashboard" className="text-gray-500 hover:text-gray-300 transition-colors">
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </div>

      {/* Cancel Subscription Modal */}
      <Modal isOpen={showCancelModal} onClose={() => setShowCancelModal(false)}>
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-100 mb-4">Cancel Subscription</h3>

          <p className="text-gray-400 mb-4">
            We&apos;re sorry to see you go. Your subscription will remain active until the end of your current billing period.
          </p>

          <div className="mb-4">
            <label className="text-sm text-gray-500 mb-2 block">
              Mind telling us why? (optional)
            </label>
            <select
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full px-4 py-3 bg-void-100 border border-void-200 rounded-lg text-gray-200 focus:outline-none focus:border-terminal"
            >
              <option value="">Select a reason...</option>
              <option value="too_expensive">Too expensive</option>
              <option value="not_using">Not using it enough</option>
              <option value="missing_features">Missing features I need</option>
              <option value="found_alternative">Found an alternative</option>
              <option value="temporary">Just need a break</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowCancelModal(false)}
              className="flex-1 px-4 py-3 bg-void-100 text-gray-300 font-bold rounded-lg hover:bg-void-200 transition-colors"
            >
              Keep Subscription
            </button>
            <button
              onClick={handleCancelSubscription}
              disabled={isProcessing}
              className="flex-1 px-4 py-3 bg-danger text-white font-bold rounded-lg hover:bg-danger-bright transition-colors disabled:opacity-50"
            >
              {isProcessing ? 'Canceling...' : 'Cancel Subscription'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Account Modal */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
        <div className="p-6">
          <h3 className="text-xl font-bold text-danger mb-4">Delete Account</h3>

          <div className="bg-danger/10 border border-danger/30 rounded-lg p-4 mb-4">
            <p className="text-danger text-sm font-medium">Warning: This action is permanent!</p>
            <ul className="text-gray-400 text-sm mt-2 list-disc list-inside space-y-1">
              <li>All your scan history will be deleted</li>
              <li>Your subscription will be canceled immediately</li>
              <li>Any unused scan credits will be lost</li>
              <li>This cannot be undone</li>
            </ul>
          </div>

          <div className="mb-4">
            <label className="text-sm text-gray-500 mb-2 block">
              Type <span className="text-danger font-bold">DELETE</span> to confirm
            </label>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="DELETE"
              className="w-full px-4 py-3 bg-void-100 border border-void-200 rounded-lg text-gray-200 focus:outline-none focus:border-danger"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                setShowDeleteModal(false);
                setDeleteConfirmText('');
              }}
              className="flex-1 px-4 py-3 bg-void-100 text-gray-300 font-bold rounded-lg hover:bg-void-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteAccount}
              disabled={isProcessing || deleteConfirmText !== 'DELETE'}
              className="flex-1 px-4 py-3 bg-danger text-white font-bold rounded-lg hover:bg-danger-bright transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? 'Deleting...' : 'Delete My Account'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

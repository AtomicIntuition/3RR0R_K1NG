import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function getRevenueMetrics() {
  const now = new Date();
  const thirtyDaysAgo = Math.floor((now.getTime() - 30 * 24 * 60 * 60 * 1000) / 1000);
  const startOfMonth = Math.floor(new Date(now.getFullYear(), now.getMonth(), 1).getTime() / 1000);

  // Get all active subscriptions
  const subscriptions = await stripe.subscriptions.list({
    status: 'active',
    limit: 100,
  });

  // Calculate MRR
  let mrr = 0;
  const planBreakdown: Record<string, number> = {};

  for (const sub of subscriptions.data) {
    const amount = sub.items.data[0]?.price?.unit_amount || 0;
    const interval = sub.items.data[0]?.price?.recurring?.interval;
    const planName = sub.items.data[0]?.price?.nickname || 'Unknown';

    // Normalize to monthly
    let monthlyAmount = amount;
    if (interval === 'year') {
      monthlyAmount = amount / 12;
    }

    mrr += monthlyAmount;
    planBreakdown[planName] = (planBreakdown[planName] || 0) + 1;
  }

  // Get recent charges
  const charges = await stripe.charges.list({
    created: { gte: thirtyDaysAgo },
    limit: 100,
  });

  const totalRevenue30d = charges.data
    .filter(c => c.status === 'succeeded')
    .reduce((sum, c) => sum + c.amount, 0);

  // Get this month's revenue
  const chargesThisMonth = await stripe.charges.list({
    created: { gte: startOfMonth },
    limit: 100,
  });

  const revenueThisMonth = chargesThisMonth.data
    .filter(c => c.status === 'succeeded')
    .reduce((sum, c) => sum + c.amount, 0);

  // Get recent transactions for activity feed
  const recentCharges = charges.data.slice(0, 10).map(c => ({
    id: c.id,
    amount: c.amount,
    status: c.status,
    created: c.created,
    email: c.billing_details?.email || 'Unknown',
    description: c.description,
  }));

  return {
    mrr: mrr / 100, // Convert from cents
    activeSubscriptions: subscriptions.data.length,
    totalRevenue30d: totalRevenue30d / 100,
    revenueThisMonth: revenueThisMonth / 100,
    planBreakdown,
    recentTransactions: recentCharges,
  };
}

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

3RROR_K1NG is a website roasting tool that performs security, performance, SEO, accessibility, and code quality audits on user-submitted URLs. It uses AI (Claude) to generate brutal but actionable feedback.

## Commands

```bash
# Install all dependencies (monorepo)
npm install

# Development
npm run dev:app     # Next.js frontend on http://localhost:3000
npm run dev:worker  # Node.js worker process

# Build
npm run build       # Build all workspaces
npm run build:app   # Build frontend only
npm run build:worker # Build worker only

# Lint
npm run lint        # Lint all workspaces
```

## Architecture

**Monorepo structure using npm workspaces + Turborepo:**

- `app/` - Next.js 14 frontend (deployed to Vercel)
- `worker/` - Node.js scan worker (deployed to Railway/Fly.io)
- `supabase/` - Database migrations

**Data flow:**
1. User submits URL → `app/app/api/scan/route.ts` creates scan record in Supabase, adds job to Redis/BullMQ
2. Worker picks up job → `worker/src/scanner.ts` orchestrates audits using Playwright
3. Audits run sequentially → `worker/src/audits/*.ts` (security, performance, seo, accessibility, codeQuality, techStack)
4. Worker calls Claude API → `worker/src/roastGenerator.ts` generates roast
5. Results stored in Supabase → Frontend polls `app/app/api/scan/[id]/route.ts` until complete

**Key integrations:**
- **BullMQ/Redis**: Job queue (queue name: `scans`)
- **Supabase**: PostgreSQL database with RLS policies
- **Playwright**: Browser automation for audits
- **Lighthouse**: Performance/Core Web Vitals
- **axe-core**: Accessibility audits

## Database Schema

Main tables in `supabase/migrations/001_initial_schema.sql`:
- `scans` - Scan records with scores, results (JSONB), roast content
- `profiles` - User profiles (extends Supabase auth)
- `rate_limits` - Anonymous rate limiting

## Scoring System

Defined in `worker/src/scanner.ts` and `app/lib/scoring.ts`:
```typescript
const WEIGHTS = {
  performance: 0.25,
  security: 0.30,
  seo: 0.15,
  accessibility: 0.20,
  codeQuality: 0.10,
};
```

## Environment Variables

**Frontend (`app/.env.local`):**
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`, `REDIS_URL`
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`

**Worker (`worker/.env`):**
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
- `REDIS_URL`, `ANTHROPIC_API_KEY`

## Worker Details

- Uses ES modules (`"type": "module"`)
- Development: `tsx watch src/index.ts`
- Production: Compiles to `dist/`, runs with `node dist/index.js`
- Concurrency: 2 scans at a time, rate limited to 10 jobs/minute
- Browser args configured for containerized environments (no-sandbox, disable-gpu)

## Monetization (Stripe)

**Products:**
- Scan Pack: 50 scans for $9.99 (one-time payment)
- Pro Monthly: $19/month (subscription)
- Pro Yearly: $149/year (subscription)

**Key files:**
- `app/lib/stripe.ts` - Stripe client and checkout helpers
- `app/app/api/checkout/route.ts` - Creates Stripe checkout sessions
- `app/app/api/webhook/stripe/route.ts` - Handles Stripe webhooks
- `app/app/pricing/page.tsx` - Pricing page with plan cards
- `app/app/payment/success/page.tsx` - Post-payment success page

**Webhook events handled:**
- `checkout.session.completed` - Upgrades user tier
- `customer.subscription.updated` - Syncs subscription status
- `customer.subscription.deleted` - Downgrades to free
- `invoice.payment_failed` - Logs payment failures

## Authentication (Supabase Auth)

**Key files:**
- `app/lib/auth-context.tsx` - React context for auth state
- `app/components/Providers.tsx` - Wraps app with AuthProvider
- `app/components/UserMenu.tsx` - User dropdown with tier badge
- `app/components/Navbar.tsx` - Nav with auth-aware menu
- `app/app/login/page.tsx` - Email/password + OAuth login
- `app/app/signup/page.tsx` - Registration page
- `app/app/auth/callback/route.ts` - OAuth redirect handler

**Auth providers configured:**
- Email/password
- Google OAuth
- GitHub OAuth

Note: OAuth providers need to be enabled in Supabase Dashboard > Authentication > Providers

## Priority Queue

Jobs are prioritized based on user tier (BullMQ priority - lower = higher priority):
- Pro users: priority 1 (processed first)
- Free users: priority 5
- Anonymous: priority 10

Set in `app/app/api/scan/route.ts` when adding jobs to queue.

## Email Whitelist (Giveaways)

Whitelist emails to auto-assign tiers on signup.

**Database:** `email_whitelist` table (see `supabase/migrations/002_email_whitelist.sql`)

**Admin API:** `app/app/api/admin/whitelist/route.ts`
- GET - List whitelist entries
- POST - Add email to whitelist
- DELETE - Remove email

**Admin UI:** `app/app/admin/page.tsx`

**Admin access:** Set `ADMIN_EMAILS` in `.env.local` (comma-separated):
```
ADMIN_EMAILS=you@example.com,other@example.com
```

**How it works:**
1. Add email to whitelist via admin UI or API
2. When that email signs up, database trigger checks whitelist
3. User automatically gets the granted tier (free/pro)
4. Whitelist entry marked as "used"

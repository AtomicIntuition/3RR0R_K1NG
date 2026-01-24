# 3RROR_K1NG

> Website Roast Machine - Get your website brutally roasted with actionable fixes.

A production-grade web security and performance auditing tool with a hacker aesthetic. Users paste a URL and get comprehensive audits delivered as brutal roasts with actionable fixes.

## Features

- **Security Audit**: Checks HTTPS, security headers (HSTS, CSP, X-Frame-Options), cookies, mixed content
- **Performance Audit**: Lighthouse-powered Core Web Vitals analysis (LCP, FCP, TBT, CLS)
- **SEO Audit**: Meta tags, Open Graph, Twitter Cards, robots.txt, sitemap
- **Accessibility Audit**: WCAG 2.1 compliance via axe-core
- **Code Quality**: Console errors, broken links, deprecated APIs, mixed content
- **Tech Stack Detection**: Frameworks, CMSs, analytics, CDNs, hosting platforms
- **AI-Powered Roasts**: Claude-generated brutal but helpful feedback

## Architecture

```
3RROR_K1NG/
├── app/                  # Next.js 14 frontend (Vercel)
├── worker/               # Node.js scan worker (Railway/Fly.io)
└── supabase/             # Database migrations
```

### Data Flow

1. User submits URL on frontend
2. API creates scan record in Supabase, adds job to Redis/BullMQ
3. Worker picks up job, runs audits with Playwright
4. Worker updates Supabase, calls Claude for roast
5. Frontend polls until complete, displays results

## Getting Started

### Prerequisites

- Node.js 20+
- Redis instance (local or cloud)
- Supabase project
- Anthropic API key
- Stripe account (for payments)

### Installation

```bash
# Install dependencies
npm install

# Copy environment files
cp app/.env.local.example app/.env.local
cp worker/.env.example worker/.env

# Run database migrations in Supabase SQL Editor
# See: supabase/migrations/001_initial_schema.sql

# Start development
npm run dev:app     # Frontend on http://localhost:3000
npm run dev:worker  # Worker process
```

### Environment Variables

**Frontend (app/.env.local):**
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
REDIS_URL=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
```

**Worker (worker/.env):**
```
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
REDIS_URL=
ANTHROPIC_API_KEY=
```

## Deployment

### Frontend (Vercel)

```bash
cd app
vercel deploy
```

### Worker (Railway)

```bash
cd worker
railway deploy
```

Or use the included Dockerfile:

```bash
docker build -t 3rror-k1ng-worker .
docker run -e REDIS_URL=... -e SUPABASE_URL=... 3rror-k1ng-worker
```

## Scoring Algorithm

```typescript
const weights = {
  performance: 0.25,
  security: 0.30,
  seo: 0.15,
  accessibility: 0.20,
  codeQuality: 0.10
};
```

## Rate Limits

- **Anonymous**: 5 scans/hour (IP + fingerprint)
- **Free authenticated**: 20 scans/hour
- **Pro**: Unlimited (priority queue)

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Node.js, Playwright, BullMQ, Redis
- **Database**: Supabase (PostgreSQL)
- **AI**: Anthropic Claude
- **Payments**: Stripe
- **Deployment**: Vercel (frontend), Railway/Fly.io (worker)

## License

MIT

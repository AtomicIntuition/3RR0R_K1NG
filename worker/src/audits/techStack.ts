import { Page, Response } from 'playwright';

export interface TechStackItem {
  name: string;
  category: 'framework' | 'library' | 'cms' | 'analytics' | 'cdn' | 'hosting' | 'tools' | 'other';
  version?: string;
  confidence: number;
  icon?: string;
}

interface TechPattern {
  name: string;
  category: TechStackItem['category'];
  patterns: {
    scripts?: RegExp[];
    globals?: string[];
    html?: string[];
    headers?: Record<string, RegExp>;
    meta?: string[];
  };
}

// Detection patterns for various technologies
const TECH_PATTERNS: TechPattern[] = [
  // ============================================
  // FRAMEWORKS
  // ============================================
  {
    name: 'React',
    category: 'framework',
    patterns: {
      scripts: [/react[\.\-]?dom/i, /react\.production/i, /react\.development/i],
      globals: ['__REACT_DEVTOOLS_GLOBAL_HOOK__', 'React', 'ReactDOM'],
      html: ['data-reactroot', 'data-reactid', 'data-react-helmet'],
    },
  },
  {
    name: 'Next.js',
    category: 'framework',
    patterns: {
      scripts: [/_next\/static/i, /_next\//i],
      globals: ['__NEXT_DATA__', '__NEXT_PAGE__', 'next'],
      html: ['id="__next"', 'data-nextjs-page', 'data-nextjs-scroll-focus-boundary'],
      headers: { 'x-powered-by': /next\.?js/i },
      meta: ['next-head-count'],
    },
  },
  {
    name: 'Vue.js',
    category: 'framework',
    patterns: {
      scripts: [/\/vue\./i, /vue\.min\.js/i, /vue\.global/i],
      globals: ['Vue', '__VUE__', '__VUE_DEVTOOLS_GLOBAL_HOOK__'],
      html: ['data-v-', 'v-cloak'],
    },
  },
  {
    name: 'Nuxt.js',
    category: 'framework',
    patterns: {
      scripts: [/_nuxt\//i, /\.nuxt\//i],
      globals: ['__NUXT__', '$nuxt', '__NUXT_DATA__'],
      html: ['id="__nuxt"', 'data-nuxt-'],
    },
  },
  {
    name: 'Angular',
    category: 'framework',
    patterns: {
      scripts: [/angular[\.\-]?/i, /@angular\/core/i, /zone\.js/i],
      globals: ['ng', 'getAllAngularRootElements', 'angular'],
      html: ['ng-version', '_ngcontent-', '_nghost-', 'ng-app'],
    },
  },
  {
    name: 'Svelte',
    category: 'framework',
    patterns: {
      scripts: [/svelte/i],
      globals: ['__svelte'],
      html: ['class="svelte-'],
    },
  },
  {
    name: 'SvelteKit',
    category: 'framework',
    patterns: {
      scripts: [/\/_app\//i, /__data\.json/i],
      globals: ['__sveltekit'],
      html: ['data-sveltekit-'],
      headers: { 'x-sveltekit-page': /.+/ },
    },
  },
  {
    name: 'Astro',
    category: 'framework',
    patterns: {
      scripts: [/\/_astro\//i, /astro\//i],
      globals: ['Astro'],
      html: ['data-astro-', 'astro-island', 'astro-slot'],
    },
  },
  {
    name: 'Remix',
    category: 'framework',
    patterns: {
      scripts: [/@remix-run/i, /remix/i],
      globals: ['__remixContext', '__REMIX__'],
      html: ['data-remix-'],
    },
  },
  {
    name: 'Gatsby',
    category: 'framework',
    patterns: {
      scripts: [/\/___gatsby/i, /gatsby-chunk/i],
      globals: ['___GATSBY', '__PATH_PREFIX__', '__GATSBY_INITIAL_RENDER_COMPLETE'],
      html: ['data-gatsby-', 'gatsby-focus-wrapper', 'id="___gatsby"'],
      meta: ['generator" content="Gatsby'],
    },
  },
  {
    name: 'Solid.js',
    category: 'framework',
    patterns: {
      scripts: [/solid-js/i, /solidjs/i],
      globals: ['_$createSignal', 'Solid'],
      html: ['data-solid'],
    },
  },
  {
    name: 'Qwik',
    category: 'framework',
    patterns: {
      scripts: [/qwik/i, /@builder\.io\/qwik/i],
      globals: ['qwikCity', '__q_context__'],
      html: ['q:container', 'q:version', 'on:qvisible'],
    },
  },
  {
    name: 'Ember.js',
    category: 'framework',
    patterns: {
      scripts: [/ember\./i, /ember-source/i],
      globals: ['Ember', 'Em'],
      html: ['data-ember-', 'id="ember'],
    },
  },
  {
    name: 'Backbone.js',
    category: 'framework',
    patterns: {
      scripts: [/backbone/i],
      globals: ['Backbone'],
    },
  },

  // ============================================
  // CMS / WEBSITE BUILDERS
  // ============================================
  {
    name: 'Webflow',
    category: 'cms',
    patterns: {
      // SPECIFIC Webflow patterns - NOT generic w- classes
      scripts: [/webflow\.[a-z0-9]+\.js/i, /cdn\.webflow\.com/i, /uploads-ssl\.webflow\.com/i],
      globals: ['Webflow', '__WEBFLOW_CURRENCY__'],
      // These are Webflow-SPECIFIC attributes, not shared with Tailwind
      html: ['data-wf-page', 'data-wf-site', 'data-wf-domain', 'class="w-webflow-badge"', 'wf-section', 'wf-page'],
      headers: { 'x-powered-by': /webflow/i },
    },
  },
  {
    name: 'WordPress',
    category: 'cms',
    patterns: {
      scripts: [/wp-content/i, /wp-includes/i, /wp-admin/i],
      globals: ['wp', 'wpApiSettings', '_wpnonce'],
      html: ['wp-content', 'wp-includes', 'class="wp-'],
      headers: { link: /wp-json/i, 'x-powered-by': /wordpress/i },
    },
  },
  {
    name: 'Shopify',
    category: 'cms',
    patterns: {
      scripts: [/cdn\.shopify\.com/i, /shopify-api/i],
      globals: ['Shopify', 'ShopifyBuy', 'ShopifyAnalytics'],
      html: ['data-shopify', 'shopify-section', 'data-product-id'],
      headers: { 'x-shopify-stage': /.+/, 'x-sorting-hat-shopid': /.+/ },
    },
  },
  {
    name: 'Squarespace',
    category: 'cms',
    patterns: {
      scripts: [/static\.squarespace\.com/i, /squarespace-cdn/i],
      globals: ['Squarespace', 'SQUARESPACE_ROLLUPS'],
      html: ['data-squarespace-', 'sqs-block'],
      headers: { server: /squarespace/i },
      meta: ['generator" content="Squarespace'],
    },
  },
  {
    name: 'Wix',
    category: 'cms',
    patterns: {
      scripts: [/static\.parastorage\.com/i, /wix\.com/i, /wixcode/i],
      globals: ['Wix', 'wixBiSession', '__WIXOSS__'],
      html: ['data-wix-', 'id="SITE_CONTAINER"'],
      headers: { server: /wix/i, 'x-wix-request-id': /.+/ },
    },
  },
  {
    name: 'Framer',
    category: 'cms',
    patterns: {
      scripts: [/framer\.com/i, /framerusercontent\.com/i],
      globals: ['Framer', '__framer__'],
      html: ['data-framer-', 'class="framer-'],
    },
  },
  {
    name: 'Ghost',
    category: 'cms',
    patterns: {
      scripts: [/ghost\//i, /casper/i],
      globals: ['ghost'],
      html: ['class="gh-', 'ghost-'],
      meta: ['generator" content="Ghost'],
    },
  },
  {
    name: 'Drupal',
    category: 'cms',
    patterns: {
      scripts: [/drupal\.js/i, /\/sites\/default\/files/i],
      globals: ['Drupal', 'drupalSettings'],
      html: ['data-drupal-'],
      headers: { 'x-drupal-cache': /.+/, 'x-generator': /drupal/i },
    },
  },
  {
    name: 'Joomla',
    category: 'cms',
    patterns: {
      scripts: [/joomla\.js/i, /\/media\/jui/i],
      globals: ['Joomla'],
      html: ['class="joomla-'],
      meta: ['generator" content="Joomla'],
    },
  },
  {
    name: 'Contentful',
    category: 'cms',
    patterns: {
      scripts: [/contentful\.com/i, /cdn\.contentful\.com/i],
      globals: ['contentful', 'contentfulClient'],
    },
  },
  {
    name: 'Sanity',
    category: 'cms',
    patterns: {
      scripts: [/cdn\.sanity\.io/i, /sanity\.io/i],
      globals: ['sanity', 'SanityClient'],
    },
  },
  {
    name: 'Strapi',
    category: 'cms',
    patterns: {
      scripts: [/strapi/i],
      globals: ['strapi'],
      headers: { 'x-powered-by': /strapi/i },
    },
  },
  {
    name: 'Prismic',
    category: 'cms',
    patterns: {
      scripts: [/prismic\.io/i, /cdn\.prismic\.io/i],
      globals: ['Prismic', 'prismic'],
      meta: ['prismic-'],
    },
  },

  // ============================================
  // CSS FRAMEWORKS / LIBRARIES
  // ============================================
  {
    name: 'Tailwind CSS',
    category: 'library',
    patterns: {
      // Tailwind-specific utility patterns - multiple classes together
      html: [
        // Common Tailwind patterns that are unlikely to be coincidental
        'class="[^"]*(?:flex|grid)\\s+(?:items-|justify-)',
        'class="[^"]*(?:text-(?:sm|base|lg|xl|2xl|3xl)|font-(?:light|medium|semibold|bold))',
        'class="[^"]*(?:bg-(?:white|black|gray|slate|zinc|neutral|red|orange|yellow|green|blue|indigo|purple|pink)-\\d{2,3})',
        'class="[^"]*(?:p|m|px|py|mx|my|pt|pb|pl|pr|mt|mb|ml|mr)-\\d+',
        'class="[^"]*(?:sm:|md:|lg:|xl:|2xl:)',
        'class="[^"]*space-(?:x|y)-\\d+',
        'class="[^"]*(?:rounded-(?:sm|md|lg|xl|2xl|full))',
      ],
    },
  },
  {
    name: 'Bootstrap',
    category: 'library',
    patterns: {
      scripts: [/bootstrap(?:\.bundle)?(?:\.min)?\.js/i, /cdn.*bootstrap/i],
      globals: ['bootstrap', 'Bootstrap'],
      html: [
        'data-bs-toggle',
        'data-bs-target',
        'data-bs-dismiss',
        'class="[^"]*btn-(?:primary|secondary|success|danger|warning|info|light|dark|outline-)',
        'class="[^"]*(?:modal-dialog|modal-content|modal-header|modal-body)',
        'class="[^"]*(?:card-body|card-header|card-footer)',
        'class="[^"]*(?:navbar-expand|navbar-brand|navbar-nav)',
        'class="[^"]*col-(?:sm|md|lg|xl)-\\d+',
      ],
    },
  },
  {
    name: 'Bulma',
    category: 'library',
    patterns: {
      scripts: [/bulma/i],
      html: [
        'class="[^"]*(?:hero|hero-body|hero-foot)',
        'class="[^"]*(?:is-primary|is-link|is-info|is-success|is-warning|is-danger)',
        'class="[^"]*(?:columns|column)',
        'class="[^"]*(?:has-text-|has-background-)',
      ],
    },
  },
  {
    name: 'Foundation',
    category: 'library',
    patterns: {
      scripts: [/foundation(?:\.min)?\.js/i],
      globals: ['Foundation'],
      html: [
        'class="[^"]*(?:small|medium|large)-\\d+\\s+(?:cell|columns)',
        'class="[^"]*(?:callout|reveal|off-canvas)',
        'data-equalizer',
        'data-responsive-menu',
      ],
    },
  },
  {
    name: 'Material UI',
    category: 'library',
    patterns: {
      scripts: [/@mui\//i, /material-ui/i],
      globals: ['MUI'],
      html: ['class="[^"]*Mui', 'class="[^"]*MuiButton', 'class="[^"]*MuiPaper'],
    },
  },
  {
    name: 'Chakra UI',
    category: 'library',
    patterns: {
      scripts: [/@chakra-ui/i],
      globals: ['chakra'],
      html: ['class="[^"]*chakra-', 'data-chakra-'],
    },
  },
  {
    name: 'Ant Design',
    category: 'library',
    patterns: {
      scripts: [/antd/i, /@ant-design/i],
      globals: ['antd'],
      html: ['class="[^"]*ant-', 'ant-btn', 'ant-modal', 'ant-table'],
    },
  },
  {
    name: 'styled-components',
    category: 'library',
    patterns: {
      globals: ['styled', '__SECRET_EMOTION__'],
      html: ['class="[^"]*sc-[a-zA-Z0-9]+', 'data-styled'],
    },
  },

  // ============================================
  // JS LIBRARIES
  // ============================================
  {
    name: 'jQuery',
    category: 'library',
    patterns: {
      scripts: [/jquery[\.\-]?\d*(?:\.min)?\.js/i],
      globals: ['jQuery'],
    },
  },
  {
    name: 'GSAP',
    category: 'library',
    patterns: {
      scripts: [/gsap/i, /greensock/i, /TweenMax/i, /TweenLite/i],
      globals: ['gsap', 'TweenMax', 'TweenLite', 'TimelineMax', 'TimelineLite'],
    },
  },
  {
    name: 'Three.js',
    category: 'library',
    patterns: {
      scripts: [/three(?:\.min)?\.js/i, /three\.module/i],
      globals: ['THREE'],
    },
  },
  {
    name: 'Anime.js',
    category: 'library',
    patterns: {
      scripts: [/anime(?:\.min)?\.js/i],
      globals: ['anime'],
    },
  },
  {
    name: 'Lottie',
    category: 'library',
    patterns: {
      scripts: [/lottie/i, /bodymovin/i],
      globals: ['lottie', 'bodymovin'],
      html: ['<lottie-player', 'lottie-player'],
    },
  },
  {
    name: 'Alpine.js',
    category: 'library',
    patterns: {
      scripts: [/alpinejs/i, /alpine(?:\.min)?\.js/i],
      globals: ['Alpine'],
      html: ['x-data', 'x-show', 'x-if', 'x-for', 'x-model', '@click', 'x-on:'],
    },
  },
  {
    name: 'HTMX',
    category: 'library',
    patterns: {
      scripts: [/htmx/i],
      globals: ['htmx'],
      html: ['hx-get', 'hx-post', 'hx-put', 'hx-delete', 'hx-swap', 'hx-target', 'hx-trigger'],
    },
  },
  {
    name: 'Lodash',
    category: 'library',
    patterns: {
      scripts: [/lodash/i],
      globals: ['_'],
    },
  },
  {
    name: 'Axios',
    category: 'library',
    patterns: {
      scripts: [/axios/i],
      globals: ['axios'],
    },
  },
  {
    name: 'D3.js',
    category: 'library',
    patterns: {
      scripts: [/d3(?:\.min)?\.js/i, /d3@/i],
      globals: ['d3'],
    },
  },
  {
    name: 'Chart.js',
    category: 'library',
    patterns: {
      scripts: [/chart(?:\.min)?\.js/i],
      globals: ['Chart'],
    },
  },
  {
    name: 'Moment.js',
    category: 'library',
    patterns: {
      scripts: [/moment(?:\.min)?\.js/i],
      globals: ['moment'],
    },
  },
  {
    name: 'Socket.io',
    category: 'library',
    patterns: {
      scripts: [/socket\.io/i],
      globals: ['io'],
    },
  },

  // ============================================
  // ANALYTICS
  // ============================================
  {
    name: 'Google Analytics',
    category: 'analytics',
    patterns: {
      scripts: [/google-analytics\.com/i, /googletagmanager\.com/i, /gtag\/js/i],
      globals: ['ga', 'gtag', 'dataLayer', 'GoogleAnalyticsObject'],
    },
  },
  {
    name: 'Google Tag Manager',
    category: 'analytics',
    patterns: {
      scripts: [/googletagmanager\.com\/gtm/i],
      globals: ['google_tag_manager'],
      html: ['<!-- Google Tag Manager', 'gtm.js'],
    },
  },
  {
    name: 'Mixpanel',
    category: 'analytics',
    patterns: {
      scripts: [/mixpanel/i, /cdn\.mxpnl\.com/i],
      globals: ['mixpanel'],
    },
  },
  {
    name: 'Segment',
    category: 'analytics',
    patterns: {
      scripts: [/cdn\.segment\.com/i, /segment\.com\/analytics/i],
      globals: ['analytics'],
    },
  },
  {
    name: 'Hotjar',
    category: 'analytics',
    patterns: {
      scripts: [/hotjar\.com/i, /static\.hotjar\.com/i],
      globals: ['hj', 'hjSiteSettings'],
    },
  },
  {
    name: 'Amplitude',
    category: 'analytics',
    patterns: {
      scripts: [/amplitude\.com/i, /cdn\.amplitude\.com/i],
      globals: ['amplitude'],
    },
  },
  {
    name: 'PostHog',
    category: 'analytics',
    patterns: {
      scripts: [/posthog\.com/i, /app\.posthog\.com/i, /us\.posthog\.com/i, /eu\.posthog\.com/i],
      globals: ['posthog'],
    },
  },
  {
    name: 'Plausible',
    category: 'analytics',
    patterns: {
      scripts: [/plausible\.io/i, /cdn\.plausible\.io/i],
      globals: ['plausible'],
      html: ['data-domain'],
    },
  },
  {
    name: 'Fathom',
    category: 'analytics',
    patterns: {
      scripts: [/usefathom\.com/i, /cdn\.usefathom\.com/i],
      globals: ['fathom'],
      html: ['data-site'],
    },
  },
  {
    name: 'Heap',
    category: 'analytics',
    patterns: {
      scripts: [/heapanalytics\.com/i, /cdn\.heapanalytics\.com/i],
      globals: ['heap'],
    },
  },
  {
    name: 'FullStory',
    category: 'analytics',
    patterns: {
      scripts: [/fullstory\.com/i, /rs\.fullstory\.com/i],
      globals: ['FS'],
      html: ['data-fs-'],
    },
  },
  {
    name: 'LogRocket',
    category: 'analytics',
    patterns: {
      scripts: [/logrocket/i, /cdn\.lr-ingest/i],
      globals: ['LogRocket'],
    },
  },
  {
    name: 'Clarity',
    category: 'analytics',
    patterns: {
      scripts: [/clarity\.ms/i],
      globals: ['clarity'],
    },
  },

  // ============================================
  // CDN / HOSTING
  // ============================================
  {
    name: 'Cloudflare',
    category: 'cdn',
    patterns: {
      scripts: [/static\.cloudflareinsights\.com/i],
      headers: {
        'cf-ray': /.+/,
        server: /cloudflare/i,
        'cf-cache-status': /.+/,
      },
    },
  },
  {
    name: 'Vercel',
    category: 'hosting',
    patterns: {
      headers: {
        'x-vercel-id': /.+/,
        'x-vercel-cache': /.+/,
        server: /^vercel$/i,
      },
    },
  },
  {
    name: 'Netlify',
    category: 'hosting',
    patterns: {
      scripts: [/\.netlify\//i],
      headers: {
        'x-nf-request-id': /.+/,
        server: /netlify/i,
      },
    },
  },
  {
    name: 'AWS CloudFront',
    category: 'cdn',
    patterns: {
      headers: {
        'x-amz-cf-id': /.+/,
        'x-amz-cf-pop': /.+/,
        via: /cloudfront/i,
      },
    },
  },
  {
    name: 'AWS S3',
    category: 'hosting',
    patterns: {
      headers: {
        'x-amz-request-id': /.+/,
        server: /amazons3/i,
      },
    },
  },
  {
    name: 'Fastly',
    category: 'cdn',
    patterns: {
      headers: {
        'x-served-by': /cache-/i,
        via: /varnish/i,
        'x-fastly-request-id': /.+/,
      },
    },
  },
  {
    name: 'Akamai',
    category: 'cdn',
    patterns: {
      headers: {
        'x-akamai-transformed': /.+/,
        server: /akamaighost/i,
      },
    },
  },
  {
    name: 'Render',
    category: 'hosting',
    patterns: {
      headers: {
        'x-render-origin-server': /.+/,
        server: /render/i,
      },
    },
  },
  {
    name: 'Railway',
    category: 'hosting',
    patterns: {
      headers: {
        'x-railway-': /.+/,
        server: /railway/i,
      },
    },
  },
  {
    name: 'Fly.io',
    category: 'hosting',
    patterns: {
      headers: {
        'fly-request-id': /.+/,
        via: /fly\.io/i,
        server: /fly/i,
      },
    },
  },
  {
    name: 'GitHub Pages',
    category: 'hosting',
    patterns: {
      headers: {
        server: /github\.com/i,
        'x-github-request-id': /.+/,
      },
    },
  },
  {
    name: 'Firebase Hosting',
    category: 'hosting',
    patterns: {
      scripts: [/firebaseapp\.com/i, /firebase\.google\.com/i],
      globals: ['firebase', 'Firebase'],
      headers: {
        'x-firebase-': /.+/,
      },
    },
  },
  {
    name: 'Heroku',
    category: 'hosting',
    patterns: {
      headers: {
        via: /heroku/i,
        'x-heroku-': /.+/,
      },
    },
  },
  {
    name: 'DigitalOcean',
    category: 'hosting',
    patterns: {
      headers: {
        'x-do-': /.+/,
        server: /digitalocean/i,
      },
    },
  },

  // ============================================
  // TOOLS & SERVICES
  // ============================================
  {
    name: 'Stripe',
    category: 'tools',
    patterns: {
      scripts: [/js\.stripe\.com/i],
      globals: ['Stripe', 'StripeCheckout'],
      html: ['class="[^"]*StripeElement', 'data-stripe'],
    },
  },
  {
    name: 'PayPal',
    category: 'tools',
    patterns: {
      scripts: [/paypal\.com/i, /paypalobjects\.com/i],
      globals: ['paypal', 'PAYPAL'],
    },
  },
  {
    name: 'Intercom',
    category: 'tools',
    patterns: {
      scripts: [/widget\.intercom\.io/i, /intercom\.com/i],
      globals: ['Intercom', 'intercomSettings'],
      html: ['id="intercom-', 'data-intercom-'],
    },
  },
  {
    name: 'Zendesk',
    category: 'tools',
    patterns: {
      scripts: [/zendesk\.com/i, /zopim\.com/i],
      globals: ['zE', 'Zendesk', '$zopim'],
    },
  },
  {
    name: 'Crisp',
    category: 'tools',
    patterns: {
      scripts: [/crisp\.chat/i, /client\.crisp\.chat/i],
      globals: ['$crisp', 'CRISP_WEBSITE_ID'],
    },
  },
  {
    name: 'Drift',
    category: 'tools',
    patterns: {
      scripts: [/js\.driftt\.com/i, /drift\.com/i],
      globals: ['drift', 'driftt'],
    },
  },
  {
    name: 'HubSpot',
    category: 'tools',
    patterns: {
      scripts: [/js\.hs-scripts\.com/i, /hubspot\.com/i, /hs-analytics/i],
      globals: ['HubSpot', 'hbspt', '_hsq'],
      html: ['class="[^"]*hs-', 'data-hsjs-'],
    },
  },
  {
    name: 'Mailchimp',
    category: 'tools',
    patterns: {
      scripts: [/chimpstatic\.com/i, /mailchimp\.com/i],
      globals: ['mailchimp'],
      html: ['id="mc_embed_', 'class="[^"]*mc-'],
    },
  },
  {
    name: 'Sentry',
    category: 'tools',
    patterns: {
      scripts: [/sentry\.io/i, /browser\.sentry-cdn/i],
      globals: ['Sentry', '__SENTRY__'],
    },
  },
  {
    name: 'Datadog',
    category: 'tools',
    patterns: {
      scripts: [/datadoghq\.com/i, /datadog/i],
      globals: ['DD_RUM', 'DD_LOGS'],
    },
  },
  {
    name: 'LaunchDarkly',
    category: 'tools',
    patterns: {
      scripts: [/launchdarkly/i],
      globals: ['LDClient'],
    },
  },
  {
    name: 'Auth0',
    category: 'tools',
    patterns: {
      scripts: [/auth0\.com/i, /cdn\.auth0\.com/i],
      globals: ['auth0', 'Auth0Lock'],
    },
  },
  {
    name: 'Clerk',
    category: 'tools',
    patterns: {
      scripts: [/clerk\.com/i, /clerk\.dev/i],
      globals: ['Clerk'],
    },
  },
  {
    name: 'Supabase',
    category: 'tools',
    patterns: {
      scripts: [/supabase\.co/i, /supabase\.com/i],
      globals: ['supabase', 'createClient'],
    },
  },
  {
    name: 'GraphQL',
    category: 'tools',
    patterns: {
      scripts: [/graphql/i, /apollo-client/i],
      globals: ['__APOLLO_CLIENT__', 'ApolloClient'],
      html: ['graphql', 'data-apollo-'],
    },
  },
  {
    name: 'Apollo',
    category: 'library',
    patterns: {
      scripts: [/apollo/i],
      globals: ['__APOLLO_CLIENT__', '__APOLLO_STATE__', 'ApolloClient'],
    },
  },
  {
    name: 'Prisma',
    category: 'tools',
    patterns: {
      globals: ['Prisma', 'PrismaClient'],
    },
  },
  {
    name: 'Cloudinary',
    category: 'tools',
    patterns: {
      scripts: [/cloudinary\.com/i, /res\.cloudinary\.com/i],
      globals: ['cloudinary'],
      html: ['res.cloudinary.com'],
    },
  },
  {
    name: 'Imgix',
    category: 'tools',
    patterns: {
      html: ['.imgix.net'],
    },
  },
  {
    name: 'Vercel Analytics',
    category: 'analytics',
    patterns: {
      scripts: [/vercel-insights/i, /vitals\.vercel-insights/i, /_vercel\/insights/i],
      globals: ['va', 'vercel'],
    },
  },
  {
    name: 'reCAPTCHA',
    category: 'tools',
    patterns: {
      scripts: [/recaptcha/i, /google\.com\/recaptcha/i],
      globals: ['grecaptcha'],
      html: ['g-recaptcha', 'data-sitekey'],
    },
  },
  {
    name: 'hCaptcha',
    category: 'tools',
    patterns: {
      scripts: [/hcaptcha\.com/i],
      globals: ['hcaptcha'],
      html: ['h-captcha', 'data-hcaptcha-'],
    },
  },
  {
    name: 'Turnstile',
    category: 'tools',
    patterns: {
      scripts: [/challenges\.cloudflare\.com/i, /turnstile/i],
      globals: ['turnstile'],
      html: ['cf-turnstile'],
    },
  },
];

export async function detectTechStack(page: Page, response: Response | null): Promise<TechStackItem[]> {
  const detected: TechStackItem[] = [];
  const headers = response?.headers() || {};

  // Get page HTML and scripts - wrapped in try-catch to prevent crashes on heavy pages
  let pageData: { html: string; scripts: string[]; globals: string[] };
  try {
    pageData = await page.evaluate(() => {
      const html = document.documentElement.outerHTML.slice(0, 150000); // Limit HTML size
      const scriptEls = document.querySelectorAll('script[src]');
      const scripts: string[] = [];
      const max = Math.min(scriptEls.length, 100); // Limit scripts checked
      for (let i = 0; i < max; i++) {
        scripts.push(scriptEls[i].getAttribute('src') || '');
      }

      // Get global variables (limited)
      const globals = Object.keys(window).slice(0, 300);

      return { html, scripts, globals };
    }).catch(() => ({ html: '', scripts: [], globals: [] }));
  } catch (e) {
    console.warn('Tech stack detection failed, using headers only:', e);
    pageData = { html: '', scripts: [], globals: [] };
  }

  for (const tech of TECH_PATTERNS) {
    let confidence = 0;
    let matchCount = 0;

    // Check scripts (highest confidence for specific tech)
    if (tech.patterns.scripts) {
      for (const pattern of tech.patterns.scripts) {
        if (pageData.scripts.some((s) => pattern.test(s))) {
          matchCount++;
          confidence += 30;
        }
      }
    }

    // Check globals
    if (tech.patterns.globals) {
      for (const global of tech.patterns.globals) {
        if (pageData.globals.includes(global)) {
          matchCount++;
          confidence += 25;
        }
      }
    }

    // Check HTML patterns
    if (tech.patterns.html) {
      for (const pattern of tech.patterns.html) {
        try {
          if (pageData.html.includes(pattern) || new RegExp(pattern).test(pageData.html)) {
            matchCount++;
            confidence += 20;
          }
        } catch {
          // Invalid regex, try as literal string
          if (pageData.html.includes(pattern)) {
            matchCount++;
            confidence += 20;
          }
        }
      }
    }

    // Check headers (very reliable for hosting/CDN)
    if (tech.patterns.headers) {
      for (const [header, pattern] of Object.entries(tech.patterns.headers)) {
        // Check all header variations (headers can have different cases)
        const headerLower = header.toLowerCase();
        for (const [respHeader, respValue] of Object.entries(headers)) {
          if (respHeader.toLowerCase() === headerLower || respHeader.toLowerCase().startsWith(headerLower)) {
            if (pattern.test(respValue)) {
              matchCount++;
              confidence += 35;
            }
          }
        }
      }
    }

    // Check meta tags
    if (tech.patterns.meta) {
      for (const pattern of tech.patterns.meta) {
        if (pageData.html.includes(pattern)) {
          matchCount++;
          confidence += 20;
        }
      }
    }

    // If any matches found, add to detected list
    if (matchCount > 0) {
      // Cap confidence at 100
      confidence = Math.min(confidence, 100);

      detected.push({
        name: tech.name,
        category: tech.category,
        confidence,
      });
    }
  }

  // Sort by confidence
  detected.sort((a, b) => b.confidence - a.confidence);

  // Deduplicate overlapping detections (e.g., Next.js implies React)
  const filtered = deduplicateStack(detected);

  return filtered;
}

// Remove redundant detections (e.g., if we detect Next.js, don't also show React separately)
function deduplicateStack(stack: TechStackItem[]): TechStackItem[] {
  const names = new Set(stack.map((t) => t.name));

  return stack.filter((tech) => {
    // If Next.js is detected with high confidence, we know it's React - but keep both
    // If SvelteKit is detected, we know it's Svelte - but keep both
    // Actually, let's keep all detections as they're all technically correct
    // Just remove exact duplicates
    return true;
  });
}

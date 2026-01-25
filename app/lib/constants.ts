// Monetization constants - single source of truth
export const PRICING = {
  PRO_MONTHLY: 29,
  PRO_YEARLY: 199,
  SCAN_PACK: 29,
  SCAN_PACK_SCANS: 150,
  PRO_SCANS_PER_MONTH: 200,
  FREE_SCANS_PER_DAY: 3,
  EXIT_INTENT_DISCOUNT_PRICE: 19,
  EXIT_INTENT_DISCOUNT_PERCENT: 35,
} as const;

// Rate limiting
export const RATE_LIMITS = {
  FREE_DAILY_LIMIT: 3,
  PRO_MONTHLY_LIMIT: 200,
  DAY_IN_MS: 24 * 60 * 60 * 1000,
  MONTH_IN_MS: 30 * 24 * 60 * 60 * 1000,
} as const;

// Local storage keys for conversion tracking
export const STORAGE_KEYS = {
  SCAN_COUNT: 'errorking_scan_count',
  EMAIL_CAPTURED: 'errorking_email_captured',
  ACCOUNT_PROMPTED: 'errorking_account_prompted',
  EXIT_INTENT_SHOWN: 'errorking_exit_intent_shown',
  LAST_SCAN_DATE: 'errorking_last_scan_date',
  DAILY_SCAN_COUNT: 'errorking_daily_scan_count',
} as const;

// Conversion flow stages
export const CONVERSION_STAGES = {
  ANONYMOUS: 0,      // No interaction yet
  FIRST_SCAN: 1,     // Completed first scan
  EMAIL_CAPTURED: 2, // Provided email
  ACCOUNT_CREATED: 3, // Created full account
  PAID: 4,           // Converted to paid
} as const;

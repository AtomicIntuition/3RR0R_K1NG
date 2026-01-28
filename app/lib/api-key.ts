import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export interface ApiKeyUser {
  id: string;
  email: string;
  tier: 'free' | 'pro';
  scanCredits: number;
}

// Hash the key for lookup
function hashKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex');
}

// Validate an API key and return the user info
export async function validateApiKey(apiKey: string): Promise<ApiKeyUser | null> {
  if (!apiKey || !apiKey.startsWith('sk_')) {
    return null;
  }

  const keyHash = hashKey(apiKey);
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Find the key
  const { data: keyData, error: keyError } = await supabase
    .from('api_keys')
    .select('id, user_id, is_active')
    .eq('key_hash', keyHash)
    .single();

  if (keyError || !keyData || !keyData.is_active) {
    return null;
  }

  // Update last_used_at
  await supabase
    .from('api_keys')
    .update({ last_used_at: new Date().toISOString() })
    .eq('id', keyData.id);

  // Get user profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, email, tier, scan_credits')
    .eq('id', keyData.user_id)
    .single();

  if (profileError || !profile) {
    return null;
  }

  return {
    id: profile.id,
    email: profile.email,
    tier: profile.tier || 'free',
    scanCredits: profile.scan_credits || 0,
  };
}

// Extract API key from request headers
export function getApiKeyFromRequest(request: Request): string | null {
  const authHeader = request.headers.get('authorization');

  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }

  // Also check X-API-Key header
  const apiKeyHeader = request.headers.get('x-api-key');
  if (apiKeyHeader) {
    return apiKeyHeader;
  }

  return null;
}

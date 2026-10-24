import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xnyzsfawqdvxhylsdppr.supabase.co/';
const supabaseKey = 'sb_publishable_eIVSRlD90T0gT0lPtrA6mQ_b462GHXU';

export const supabase = createClient(supabaseUrl, supabaseKey);
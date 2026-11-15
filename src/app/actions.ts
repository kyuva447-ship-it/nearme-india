'use server';

import { supabaseAdmin } from '@/lib/supabase/server';

export async function submitRFQ(title: string) {
  const cleanTitle = String(title || '').trim();
  if (!cleanTitle || cleanTitle.length < 3) {
    return { success: false, error: 'Valid RFQ title is required' };
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('v2_b2b_rfqs')
      .insert([{ title: cleanTitle, target_budget: 100000, status: 'OPEN' }])
      .select();

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true, data };
  } catch {
    return { success: false, error: 'Internal Server Error' };
  }
}

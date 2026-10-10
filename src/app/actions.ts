'use server';

import { supabase } from '@/lib/supabase/client';

export async function submitRFQ(title: string) {
  try {
    const { data, error } = await supabase.from('v2_b2b_rfqs').insert([
      { title, target_budget: 100000, status: 'OPEN' }
    ]).select();

    if (error) {
      console.error("RFQ Insert Error:", error);
      return { success: false, error: error.message };
    }
    return { success: true, data };
  } catch {
    return { success: false, error: 'Internal Server Error' };
  }
}

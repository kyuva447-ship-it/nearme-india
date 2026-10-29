import { supabase } from './supabase/client';

export function subscribeToLeads(merchantId: string, callback: (payload: any) => void) {
  return supabase.channel(`leads-${merchantId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'v2_b2c_leads', filter: `merchant_id=eq.${merchantId}` },
      callback
    )
    .subscribe();
}

export function subscribeToEscrow(merchantId: string, callback: (payload: any) => void) {
    return supabase.channel(`escrow-${merchantId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'escrow', filter: `merchant_id=eq.${merchantId}` },
        callback
      )
      .subscribe();
}

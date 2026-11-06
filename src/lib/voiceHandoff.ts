import { supabase } from './supabase/client';
import { triggerConfetti } from './confetti';
import { trackEvent } from './analytics';

export async function voiceHandoff(transcript: string, merchantId: string, merchantPhone: string, merchantData: any, distance: string) {

  const dealContext = merchantData.current_deal_text ? `Are you still offering the "${merchantData.current_deal_text}"?` : '';
  const message = `Hi ${merchantData.business_name}, I found you on NearMe India. ${transcript}. I am ${distance}km away. ${dealContext}`;

  const { data: deducted, error } = await supabase.rpc('deduct_v2_wallet', {
    merchant_uuid: merchantId,
    amount: 3.00
  });

  if (error || !deducted) {
    alert('Merchant is out of balance.');
    return;
  }

  await supabase.from('v2_b2c_leads').insert({
    merchant_id: merchantId,
    query: transcript,
    distance: parseFloat(distance),
    has_active_deal: !!merchantData.current_deal_text,
    whatsapp_context: message
  });

  trackEvent('lead_generated', { merchant_id: merchantId, method: 'voice' });
  triggerConfetti();

  window.open(`https://wa.me/${merchantPhone}?text=${encodeURIComponent(message)}`, '_blank');
}

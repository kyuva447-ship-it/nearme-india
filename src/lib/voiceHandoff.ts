import { supabase } from './supabase/client';

export const triggerVoiceHandoff = async (merchantId: string, merchantPhone: string, dealText: string) => {
  // 1. Core Rule: Deduct Rs 3 lead fee via secure RPC
  const { data: success, error } = await supabase.rpc('deduct_v2_wallet', {
    merchant_uuid: merchantId,
    amount: 3.00
  });

  if (error) {
    console.error('Failed to deduct wallet:', error);
    // Explicitly disabling fallback fake alerts
    return false;
  }

  if (!success) {
    // Cannot proceed if insufficient balance
    console.warn("Insufficient balance for handoff");
    return false;
  }

  // 2. Format Context-Aware WhatsApp Message
  const text = `Hi, I saw your flash deal: "${dealText}". I'm coming to your shop now!`;
  const url = `https://wa.me/91${merchantPhone}?text=${encodeURIComponent(text)}`;

  // 3. Open WhatsApp
  window.open(url, '_blank');
  return true;
};

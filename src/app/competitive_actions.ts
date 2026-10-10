'use server';
import { z } from 'zod';
import { supabase } from '@/lib/supabase/client';

// Universal Data Sanitization (Feature 48)
const BlindBidSchema = z.object({
  rfqId: z.string().uuid(),
  merchantId: z.string().uuid(),
  bidAmount: z.number().positive(),
});

const FlashTipSchema = z.object({
  userId: z.string().uuid(),
  merchantId: z.string().uuid(),
  tipAmount: z.number().min(10),
  message: z.string().max(140).optional()
});

// Feature 7: Blind Reverse Auctions
export async function submitBlindBid(data: z.infer<typeof BlindBidSchema>) {
  try {
    const validatedData = BlindBidSchema.parse(data);

    // Cryptographically hide the bid amount (SHA-256)
    const cryptoHash = Array.from(
      new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(validatedData.bidAmount.toString() + process.env.SECRET_SALT)))
    ).map(b => b.toString(16).padStart(2, '0')).join('');

    const { error } = await supabase.from('v2_blind_bids').insert([{
      rfq_id: validatedData.rfqId,
      merchant_id: validatedData.merchantId,
      encrypted_bid_amount: cryptoHash,
      unlock_fee_paid: 250 // Hardcoded deduction simulation
    }]);

    if (error) throw new Error(error.message);
    return { success: true, hash: cryptoHash };

  } catch {
    return { success: false, error: 'Validation or Insertion failed' };
  }
}

// Feature 30: Neighborhood Flash Tipping
export async function submitFlashTip(data: z.infer<typeof FlashTipSchema>) {
  try {
    const validatedData = FlashTipSchema.parse(data);

    const { error } = await supabase.from('v2_flash_tips').insert([{
      user_id: validatedData.userId,
      merchant_id: validatedData.merchantId,
      tip_amount: validatedData.tipAmount,
      message: validatedData.message
    }]);

    if (error) throw new Error(error.message);

    // In a real app, this triggers an Edge Function to push SMS to the 2km radius
    return { success: true };

  } catch {
    return { success: false, error: 'Flash Tip failed' };
  }
}

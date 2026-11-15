'use server';

import crypto from 'crypto';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase/server';

const BlindBidSchema = z.object({
  rfqId: z.string().uuid(),
  merchantId: z.string().uuid(),
  bidAmount: z.number().positive(),
  paymentId: z.string().min(6),
});

const FlashTipSchema = z.object({
  userId: z.string().uuid(),
  merchantId: z.string().uuid(),
  tipAmount: z.number().min(10),
  message: z.string().max(140).optional(),
});

export async function submitBlindBid(data: z.infer<typeof BlindBidSchema>) {
  try {
    const salt = process.env.SECRET_SALT?.trim();
    if (!salt) {
      return { success: false, error: 'Server SECRET_SALT is not configured' };
    }

    const validatedData = BlindBidSchema.parse(data);
    const cryptoHash = crypto
      .createHmac('sha256', salt)
      .update(`${validatedData.rfqId}:${validatedData.merchantId}:${validatedData.bidAmount}`)
      .digest('hex');

    const { error } = await supabaseAdmin.from('v2_blind_bids').insert([
      {
        rfq_id: validatedData.rfqId,
        merchant_id: validatedData.merchantId,
        encrypted_bid_amount: cryptoHash,
        unlock_fee_paid: 49,
        razorpay_payment_id: validatedData.paymentId,
      },
    ]);

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true, hash: cryptoHash };
  } catch {
    return { success: false, error: 'Validation or Insertion failed' };
  }
}

export async function submitFlashTip(data: z.infer<typeof FlashTipSchema>) {
  try {
    const validatedData = FlashTipSchema.parse(data);

    const { error } = await supabaseAdmin.from('v2_flash_tips').insert([
      {
        user_id: validatedData.userId,
        merchant_id: validatedData.merchantId,
        tip_amount: validatedData.tipAmount,
        message: validatedData.message,
      },
    ]);

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch {
    return { success: false, error: 'Flash Tip failed' };
  }
}

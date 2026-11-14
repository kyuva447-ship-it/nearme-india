import { NextResponse } from 'next/server';
import { ordersLedger } from '@/lib/ordersStore';

export async function GET() {
  try {
    const key_id = (process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '').trim();
    const key_secret = (process.env.RAZORPAY_KEY_SECRET || '').trim();

    if (!key_id || !key_secret) {
      const captured = ordersLedger.filter((o) => o.status === 'captured' || o.status === 'paid');
      const refunded = ordersLedger.filter((o) => o.status === 'refunded');
      return NextResponse.json({
        total_payments: captured.length,
        total_volume: captured.reduce((acc, o) => acc + o.amount, 0),
        total_refunds: refunded.length,
        recent_transactions: ordersLedger.slice(0, 10),
      });
    }

    const authHeader = `Basic ${Buffer.from(`${key_id}:${key_secret}`).toString('base64')}`;

    const rzpResponse = await fetch('https://api.razorpay.com/v1/payments?count=50', {
      headers: { Authorization: authHeader },
    });

    if (!rzpResponse.ok) {
      return NextResponse.json({
        total_payments: 0,
        total_volume: 0,
        total_refunds: 0,
        recent_transactions: ordersLedger.slice(0, 10),
      });
    }

    const data = await rzpResponse.json();
    const payments: Array<{ id: string; amount: number; status: string; created_at: number }> =
      data.items || [];

    const totalVolume = payments.reduce(
      (acc, p) => acc + (p.status === 'captured' ? p.amount : 0),
      0
    );
    const capturedCount = payments.filter((p) => p.status === 'captured').length;

    return NextResponse.json({
      total_payments: capturedCount,
      total_volume: totalVolume,
      total_refunds: payments.filter((p) => p.status === 'refunded').length,
      recent_transactions: payments.slice(0, 10),
    });
  } catch {
    return NextResponse.json({
      total_payments: 0,
      total_volume: 0,
      total_refunds: 0,
      recent_transactions: [],
    });
  }
}

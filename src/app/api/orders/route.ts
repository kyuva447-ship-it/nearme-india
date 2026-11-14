import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { ordersLedger, recordOrderEntry, OrderRecord } from '@/lib/ordersStore';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    count: ordersLedger.length,
    orders: ordersLedger,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const rawAmount = body.amount ?? body.amountInRupees;
    const { currency, receipt, customerIdentifier, itemName } = body;

    if (!rawAmount || isNaN(Number(rawAmount)) || Number(rawAmount) <= 0) {
      return NextResponse.json({ error: 'Valid positive amount is required' }, { status: 400 });
    }

    const amountInPaise = Math.round(Number(rawAmount) * 100);
    const keyId = (process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '').trim();
    const keySecret = (process.env.RAZORPAY_KEY_SECRET || '').trim();

    if (!keyId || !keySecret) {
      const pendingOrder: OrderRecord = {
        id: `order_pending_${Date.now()}`,
        amount: amountInPaise,
        currency: currency || 'INR',
        receipt: receipt || `receipt_${Date.now()}`,
        status: 'awaiting_upi_settlement',
        customerIdentifier: customerIdentifier ? String(customerIdentifier) : undefined,
        itemName: itemName ? String(itemName) : undefined,
        created_at: Math.floor(Date.now() / 1000),
      };
      recordOrderEntry(pendingOrder);
      return NextResponse.json({ ...pendingOrder, fallbackMode: true }, { status: 200 });
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const options = {
      amount: amountInPaise,
      currency: currency || 'INR',
      receipt: receipt || `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    recordOrderEntry({
      id: order.id,
      amount: Number(order.amount),
      currency: order.currency,
      receipt: order.receipt || options.receipt,
      status: order.status,
      customerIdentifier: customerIdentifier ? String(customerIdentifier) : undefined,
      itemName: itemName ? String(itemName) : undefined,
      created_at: Math.floor(Date.now() / 1000),
    });

    return NextResponse.json({ ...order, key_id: keyId }, { status: 200 });
  } catch (error: unknown) {
    const rzpErr = error as { error?: { description?: string; code?: string }; message?: string };
    const message =
      rzpErr?.error?.description ||
      (error instanceof Error ? error.message : 'Order creation failed');
    console.error('Order generation failed:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

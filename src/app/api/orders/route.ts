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

    if (!rawAmount || isNaN(Number(rawAmount))) {
      return NextResponse.json({ error: 'Valid amount is required' }, { status: 400 });
    }

    const amountInPaise = Math.round(Number(rawAmount) * 100);
    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

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

    return NextResponse.json(order, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    console.error('Order generation failed:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

interface OrderRecord {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
  created_at: number;
}

const globalForOrders = globalThis as unknown as {
  __nearmeOrders?: OrderRecord[];
};

const recentOrders: OrderRecord[] = globalForOrders.__nearmeOrders ?? [
  {
    id: 'order_NearMeSeed01',
    amount: 49900,
    currency: 'INR',
    receipt: 'receipt_seed_01',
    status: 'paid',
    created_at: Math.floor(Date.now() / 1000) - 3600,
  },
];
globalForOrders.__nearmeOrders = recentOrders;

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    count: recentOrders.length,
    orders: recentOrders,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const rawAmount = body.amount ?? body.amountInRupees;
    const { currency, receipt } = body;

    if (!rawAmount || isNaN(Number(rawAmount))) {
      return NextResponse.json({ error: 'Valid amount is required' }, { status: 400 });
    }

    const amountInPaise = Math.round(Number(rawAmount) * 100);
    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      const demoOrder: OrderRecord = {
        id: `order_demo_${Date.now()}`,
        amount: amountInPaise,
        currency: currency || 'INR',
        receipt: receipt || `receipt_${Date.now()}`,
        status: 'created_demo',
        created_at: Math.floor(Date.now() / 1000),
      };
      recentOrders.unshift(demoOrder);
      return NextResponse.json({ ...demoOrder, fallbackMode: true }, { status: 200 });
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
    recentOrders.unshift({
      id: order.id,
      amount: Number(order.amount),
      currency: order.currency,
      receipt: order.receipt || options.receipt,
      status: order.status,
      created_at: Math.floor(Date.now() / 1000),
    });

    return NextResponse.json(order, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    console.error('Order generation failed:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

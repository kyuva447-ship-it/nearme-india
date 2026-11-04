import Razorpay from 'razorpay';

export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'mock',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'mock',
});

export const createOrder = async (amount: number, notes: any) => {
  return await razorpay.orders.create({
    amount: amount, // in paise
    currency: 'INR',
    notes: notes,
  });
};

export const createSubscription = async (plan_id: string, notes: any) => {
    return await razorpay.subscriptions.create({
        plan_id,
        customer_notify: 1,
        total_count: 12,
        notes
    });
};

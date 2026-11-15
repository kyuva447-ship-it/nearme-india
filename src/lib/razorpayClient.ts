export function triggerNearMeCheckout({
  itemName,
  amountInRupees,
  actionType,
  metadata,
  onSuccess,
  onFallback,
  onAuthRequired,
}: {
  itemName: string;
  amountInRupees: number;
  actionType: string;
  metadata?: Record<string, string | number>;
  onSuccess: (paymentId: string) => void;
  onFallback: () => void;
  onAuthRequired?: () => void;
}) {
  const phone = typeof window !== 'undefined' ? localStorage.getItem('nearme_user_phone') : null;

  if (!phone) {
    if (onAuthRequired) onAuthRequired();
    return;
  }

  let timedOut = false;
  const controller = new AbortController();

  const executionWatchdog = setTimeout(() => {
    timedOut = true;
    controller.abort();
    onFallback();
  }, 8000);

  fetch('/api/payment/razorpay-split', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal: controller.signal,
    body: JSON.stringify({ amount: amountInRupees, type: actionType, phone, metadata }),
  })
    .then(async (res) => {
      clearTimeout(executionWatchdog);
      if (timedOut) return null;
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        if (errData.fallbackMode) {
          onFallback();
          return null;
        }
        throw new Error(errData.error || 'Network error');
      }
      return res.json();
    })
    .then((data) => {
      if (!data || timedOut) return;

      if (data.fallbackMode || !data.order_id) {
        onFallback();
        return;
      }

      if (typeof window === 'undefined') return;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const RzpObj = (window as any).Razorpay;
      if (!RzpObj) {
        onFallback();
        return;
      }

      const options = {
        key: data.key_id,
        amount: data.amount,
        currency: 'INR',
        name: 'NearMe India',
        description: itemName,
        order_id: data.order_id,
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          try {
            const verifyRes = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                ...response,
                actionType,
                amountInRupees,
                phone,
                metadata,
              }),
            });
            if (!verifyRes.ok) {
              onFallback();
              return;
            }
            onSuccess(response.razorpay_payment_id);
            window.location.href = `/success?payment_id=${encodeURIComponent(
              response.razorpay_payment_id
            )}&order_id=${encodeURIComponent(
              response.razorpay_order_id
            )}&amount=${encodeURIComponent(String(amountInRupees))}&item=${encodeURIComponent(
              itemName
            )}`;
          } catch {
            onFallback();
          }
        },
        prefill: {
          contact: phone,
        },
        theme: {
          color: '#059669',
        },
        modal: {
          ondismiss: () => {
            onFallback();
          },
        },
      };

      try {
        const rzp = new RzpObj(options);
        rzp.on('payment.failed', () => {
          onFallback();
        });
        rzp.open();
      } catch {
        onFallback();
      }
    })
    .catch(() => {
      clearTimeout(executionWatchdog);
      if (!timedOut) onFallback();
    });
}

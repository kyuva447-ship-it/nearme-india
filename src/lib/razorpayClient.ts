export function triggerNearMeCheckout({
  itemName,
  amountInRupees,
  actionType,
  onSuccess,
  onFallback,
  onAuthRequired
}: {
  itemName: string;
  amountInRupees: number;
  actionType: string;
  onSuccess: (paymentId: string) => void;
  onFallback: () => void;
  onAuthRequired?: () => void;
}) {
  const phone = localStorage.getItem('nearme_user_phone');

  if (!phone) {
    if (onAuthRequired) onAuthRequired();
    return;
  }

  // Safety net: if the whole async process hangs, force a fallback state after 2.5s
  const executionWatchdog = setTimeout(() => {
     onFallback();
  }, 2500);

  fetch('/api/payment/razorpay-split', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount: amountInRupees, type: actionType, phone })
  })
    .then((res) => {
        clearTimeout(executionWatchdog);
        if (!res.ok) {
            return res.json().then(errData => {
               if(errData.fallbackMode) { onFallback(); return null; }
               throw new Error(errData.error || 'Network error');
            });
        }
        return res.json();
    })
    .then((data) => {
      if (!data) return;

      if (data.fallbackMode || !data.order_id) {
        onFallback();
        return;
      }

      if (typeof window === 'undefined') return;

      const rzpObj = (window as any).Razorpay;
      if (!rzpObj) {
        onFallback();
        return;
      }

      const options = {
        key: data.key_id,
        amount: Math.round(amountInRupees * 100),
        currency: 'INR',
        name: 'NearMe India',
        description: itemName,
        order_id: data.order_id,
        handler: (response: any) => {
          onSuccess(response.razorpay_payment_id);
          window.location.href = `/success?payment_id=${response.razorpay_payment_id}&amount=${amountInRupees}`;
        },
        prefill: {
          contact: phone || '9999999999',
        },
        theme: {
          color: '#2563EB',
        },
        modal: {
            ondismiss: function() {
                onFallback();
            }
        }
      };

      try {
          const rzp = new rzpObj(options);
          rzp.on('payment.failed', function () {
             onFallback();
          });
          rzp.open();
      } catch (err) {
          onFallback();
      }
    })
    .catch(() => {
      clearTimeout(executionWatchdog);
      onFallback();
    });
}

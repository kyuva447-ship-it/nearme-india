export function trackEvent(event: string, data?: any) {
  if (typeof window !== 'undefined') {
    if ((window as any).gtag) {
      (window as any).gtag('event', event, data);
    }
    if ((window as any).fbq) {
      (window as any).fbq('track', event, data);
    }
  }
}

'use client';
import { useEffect } from 'react';

export default function ReferralTracker() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) {
      localStorage.setItem('nearme_referrer_phone', ref);
    }
  }, []);
  return null;
}

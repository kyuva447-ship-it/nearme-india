'use client';
import { useEffect } from 'react';

export default function Analytics() {
  useEffect(() => {
    // Mock initialization
    (window as any).gtag = (window as any).gtag || function() {};
    (window as any).fbq = (window as any).fbq || function() {};
  }, []);

  return null;
}

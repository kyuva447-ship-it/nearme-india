import { redirect } from 'next/navigation';

export default function LegacyMerchantDashboardRedirect() {
  redirect('/dashboard');
}

function escapeHtml(value: string | number): string {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export const welcomeMerchant = (name: string) => `
<div style="font-family: sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="color: #10b981;">Welcome to NearMe India, ${escapeHtml(name)}!</h1>
  <p>Your business is now live on our local marketplace. Be ready to receive leads via WhatsApp.</p>
  <a href="https://www.nearme-india.org/dashboard" style="background-color: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Go to Dashboard</a>
</div>
`;

export const merchantClaimInvite = (businessName: string, city: string, claimUrl: string) => `
<div style="font-family: sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="color: #10b981;">2 Free Customer Leads Waiting in ${escapeHtml(city)}!</h1>
  <p>Hi ${escapeHtml(businessName)},</p>
  <p>Customers near you on NearMe India are searching for your services. Claim your verified profile in 30 seconds and get <strong>2 free unlocked leads</strong> immediately.</p>
  <a href="${escapeHtml(claimUrl)}" style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Claim Profile &amp; Activate Wallet</a>
</div>
`;

export const welcomeConsumer = (name: string) => `
<div style="font-family: sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="color: #10b981;">Namaste, ${escapeHtml(name)}!</h1>
  <p>Welcome to NearMe India. Find the best local services near you, verified and ready to help.</p>
</div>
`;

export const leadReceived = (merchantName: string, customerQuery: string, distance: string) => `
<div style="font-family: sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="color: #10b981;">New Lead!</h1>
  <p>Hi ${escapeHtml(merchantName)},</p>
  <p>A customer <strong>${escapeHtml(distance)}km</strong> away needs help with: <em>"${escapeHtml(customerQuery)}"</em></p>
  <a href="https://www.nearme-india.org/dashboard" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Unlock Customer Contact</a>
</div>
`;

export const escrowCreated = (customerName: string, amount: number, qrCode: string) => `
<div style="font-family: sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="color: #10b981;">Escrow Locked</h1>
  <p>Hi ${escapeHtml(customerName)},</p>
  <p>Your payment of ₹${escapeHtml(amount)} is safely locked in Escrow.</p>
  <p>Show this QR code to the merchant upon job completion:</p>
  <img src="${escapeHtml(qrCode)}" alt="QR Code" style="max-width: 200px;"/>
</div>
`;

export const referralCredit = (name: string, amount: number, code: string) => `
<div style="font-family: sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="color: #10b981;">You earned a referral credit!</h1>
  <p>Hi ${escapeHtml(name)},</p>
  <p>Someone used your referral code <strong>${escapeHtml(code)}</strong>. We've added ₹${escapeHtml(amount)} to your wallet!</p>
</div>
`;

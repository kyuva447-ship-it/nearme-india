export const welcomeMerchant = (name: string) => `
<div style="font-family: sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="color: #10b981;">Welcome to NearMe India, ${name}!</h1>
  <p>Your business is now live on our local marketplace. Be ready to receive leads via WhatsApp.</p>
  <a href="https://www.nearme-india.org/merchant/dashboard" style="background-color: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Go to Dashboard</a>
</div>
`;

export const welcomeConsumer = (name: string) => `
<div style="font-family: sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="color: #10b981;">Namaste, ${name}!</h1>
  <p>Welcome to NearMe India. Find the best local services near you, verified and ready to help.</p>
</div>
`;

export const leadReceived = (merchantName: string, customerQuery: string, distance: string) => `
<div style="font-family: sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="color: #10b981;">New Lead!</h1>
  <p>Hi ${merchantName},</p>
  <p>A customer <strong>${distance}km</strong> away needs help with: <em>"${customerQuery}"</em></p>
</div>
`;

export const escrowCreated = (customerName: string, amount: number, qrCode: string) => `
<div style="font-family: sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="color: #10b981;">Escrow Locked</h1>
  <p>Hi ${customerName},</p>
  <p>Your payment of ₹${amount} is safely locked in Escrow.</p>
  <p>Show this QR code to the merchant upon job completion:</p>
  <img src="${qrCode}" alt="QR Code" style="max-width: 200px;"/>
</div>
`;

export const referralCredit = (name: string, amount: number, code: string) => `
<div style="font-family: sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="color: #10b981;">You earned a referral credit!</h1>
  <p>Hi ${name},</p>
  <p>Someone used your referral code <strong>${code}</strong>. We've added ₹${amount} to your wallet!</p>
</div>
`;

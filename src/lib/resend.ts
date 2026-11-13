import { Resend } from 'resend';

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  return new Resend(apiKey);
}

export async function sendEmail(to: string, subject: string, html: string, from = 'NearMe India <noreply@nearme-india.org>') {
  try {
    const client = getResendClient();
    if (!client) {
      console.warn('RESEND_API_KEY not configured — skipping email send');
      return;
    }
    await client.emails.send({
      from,
      to,
      subject,
      html
    });
  } catch (error) {
    console.error('Resend error:', error);
  }
}

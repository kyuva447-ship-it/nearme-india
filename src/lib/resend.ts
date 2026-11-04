import { Resend } from 'resend';

export const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail(to: string, subject: string, html: string, from = 'NearMe India <noreply@nearme-india.org>') {
  try {
    await resend.emails.send({
      from,
      to,
      subject,
      html
    });
  } catch (error) {
    console.error('Resend error:', error);
  }
}

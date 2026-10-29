import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mock.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'mock-key'
);

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Phone OTP',
      credentials: {
        phone: { label: 'Phone Number', type: 'text' },
        otp: { label: 'OTP', type: 'text' }
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.otp) return null;

        const { data: otpRecord } = await supabase
          .from('free_otps')
          .select('*')
          .eq('phone_number', credentials.phone)
          .eq('otp_code', credentials.otp)
          .single();

        if (otpRecord && new Date(otpRecord.expires_at) > new Date()) {
          // Valid OTP, delete it so it can't be reused
          await supabase.from('free_otps').delete().eq('phone_number', credentials.phone);
          return { id: credentials.phone, name: credentials.phone };
        }
        return null;
      }
    })
  ],
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  }
});

export { handler as GET, handler as POST };

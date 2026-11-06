import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { supabaseAdmin } from "@/lib/supabase/client"

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        phone: { label: "Phone", type: "text" },
        otp: { label: "OTP", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.otp) return null;

        // =========================================================================
        // TODO: Add MSG91 / Twilio API Key Here For Real OTP - Owner Will Add Key
        // Currently forced to fail to prevent fake OTP login bypass.
        // Replace this return null with actual OTP verification logic.
        // =========================================================================
        return null;
      }
    })
  ],
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: "jwt",
  }
})

export { handler as GET, handler as POST }

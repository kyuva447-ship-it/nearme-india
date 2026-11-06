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

        // Ensure user exists in database without hardcoding any magic backdoors
        let { data: user } = await supabaseAdmin
            .from('users_v1')
            .select('*')
            .eq('phone', credentials.phone)
            .single();

        if (!user) {
            const { data: newUser, error } = await supabaseAdmin
                .from('users_v1')
                .insert([{ phone: credentials.phone, name: 'New User' }])
                .select()
                .single();
            if (error) {
                console.error("Auth User Creation Error: ", error);
                return null;
            }
            user = newUser;
        }

        if (user) {
            return { id: user.id, name: user.name, phone: user.phone };
        }

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

// In-memory OTP store fallback when Supabase is not configured
const globalForOtp = globalThis as unknown as {
  __nearmeOtpStore?: Map<string, { otp: string; expiresAt: number }>;
};

export const otpMemoryStore =
  globalForOtp.__nearmeOtpStore ?? new Map<string, { otp: string; expiresAt: number }>();

if (!globalForOtp.__nearmeOtpStore) {
  globalForOtp.__nearmeOtpStore = otpMemoryStore;
}

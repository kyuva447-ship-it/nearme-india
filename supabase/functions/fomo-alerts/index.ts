// Edge function to send FOMO alerts for missed leads due to zero balance
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  const { merchant_id, missed_value } = await req.json();

  // Here we would typically integrate with Twilio or WhatsApp Business API
  // For now, we simulate the alert generation
  const fomoMessage = `🚨 NearMe India Alert: You just missed a lead worth ₹${missed_value} because your wallet balance is low! Top up now to start receiving customers again.`;

  console.log(`Sending WhatsApp alert to Merchant ${merchant_id}: ${fomoMessage}`);

  return new Response(
    JSON.stringify({ success: true, message: "FOMO alert dispatched" }),
    { headers: { "Content-Type": "application/json" } },
  );
});

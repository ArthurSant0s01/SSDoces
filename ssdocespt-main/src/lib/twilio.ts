import twilio from "twilio";

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
);

export async function sendWhatsAppNotification(message: string) {
  try {
    await client.messages.create({
      body: message,
      from: "whatsapp:+14155238886",
      to: "whatsapp:+351930935667",
    });

    console.log("Mensagem WhatsApp enviada.");
  } catch (error) {
    console.error("Erro ao enviar WhatsApp:", error);
  }
}
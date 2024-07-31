require('dotenv').config();
const twilio = require('twilio');

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const sendWhatsAppMessage = async (to, body) => {
  try {
    const message = await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to: `whatsapp:${to}`,
      body: body,
    });

    console.log('Message sent successfully:', message.sid);
  } catch (error) {
    console.error('Error sending message:', error);
  }
};

module.exports = { sendWhatsAppMessage };

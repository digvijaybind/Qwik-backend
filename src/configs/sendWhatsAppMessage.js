require('dotenv').config();
const twilio = require('twilio');


const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN,
);


const sendWhatsAppMessage = async (to, body) => {
  try {
   
    console.log(`Sending WhatsApp message to ${to} with body: ${body}`);

    const message = await client.messages.create({
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`, 
      to: `whatsapp:${to}`,
      body: body, 
    });


    console.log('Message sent successfully to:', message.to);
    console.log('Message body:', message.body);
  } catch (error) {
    console.error('Error sending message:', error.message);
  }
};


module.exports = { sendWhatsAppMessage };

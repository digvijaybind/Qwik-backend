const { generateTicketPDF } = require('./generateTicketPDF');
const { sendEmail } = require('./paymentEmail');
const { Payment } = require('../../db/Payment');
const axios = require('axios');
const fs = require('fs');

exports.PaymentRequest = async (req, res, next) => {
  const { amount, currency, description, userId } = req.body;

  try {
    const response = await axios.post(process.env.PaymentLink, {
      MerchantID: process.env.Telr_MerchantID,
      SecretKey: process.env.Telr_SecretKey,
      Amount: amount,
      Currency: currency,
      Description: description,
    });

    console.log('response data', response);
    const payment = new Payment({
      amount,
      currency,
      description,
      status: 'pending',
      transactionId: response.data.transaction_id,
      userId,
    });
    console.log('Payment ', payment);

    await payment.save();

    res.json({
      paymentdata: payment._id,
      redirectUrl: response.data.redirect_url,
      message: `Your booking is confirmed. Your transaction ID is ${payment._id}. You will be redirected to the payment page shortly.`,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.PaymentConfirmation = async (req, res, next) => {
  const paymentData = req.body;

  try {
    if (!paymentData.transactionId) {
      return res.status(400).json({ message: 'Transaction ID is required' });
    }

    const payment = await Payment.findOne({
      transactionId: paymentData._id, // Correct property name
    });

    console.log('payment', payment);

    if (payment) {
      payment.status =
        paymentData.status === 'completed' ? 'completed' : 'completed'; // Correct status logic
      await payment.save();
      console.log(' payment.status', payment.status);
      if (payment.status === 'completed') {
        const ticketDetails = {
          id: payment._id.toString(), // Ensure ID is a string
          name: 'Customer Name',
          event: payment.description,
          doctors: ['specialist Flying Doctor'],
          paramedics: ['Paramedic One', 'Paramedic Two'],
          equipment: ['Stethoscope', 'Defibrillator'],
        };

        console.log('ticketDetails', ticketDetails);
        const pdfPath = generateTicketPDF(ticketDetails);

        console.log('pdfPath', pdfPath);
        if (fs.existsSync(pdfPath)) {
        
          await sendEmail(
            'info@zamzamsoftwares.com',
            'Your Ticket Booking is Confirmed! We are pleased to inform you that your payment has been successfully processed. ',
            '',
            [],
            pdfPath
          );
          fs.unlinkSync(pdfPath); 
        } else {
          console.error('PDF file does not exist at path:', pdfPath);
          res.status(500).json({ message: 'Failed to generate PDF' });
        }
      } else {
        res.json({ message: 'Payment response processed' });
      }
    } else {
      res.status(404).json({
        message: `Payment not found for transactionId: ${paymentData.transactionId}`,
      });
    }
  } catch (error) {
    console.error('Error processing payment confirmation:', error);
    res.status(500).json({ error: error.message });
  }
};

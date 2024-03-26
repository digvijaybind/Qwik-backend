require('dotenv').config();
const MailGen = require('mailgen');
const nodeMailer = require('nodemailer');
const { EMAIL, PASSWORD } = require('../../../nodeMailerdata');

let sendSearchMail = (
  originLocationCode,
  destinationLocationCode,
  departureDate,
  pax,
  mobile,
  countryCode
) => {
  let config = {
    service: 'gmail',
    auth: {
      user: EMAIL,
      pass: PASSWORD,
    },
  };
  let transporter = nodeMailer.createTransport(config);
  let MailGenerator = new MailGen({
    theme: 'default',
    product: {
      name: 'qwiklif',
      link: 'https://mailgen.js/',
    },
  });
  let response = {
    body: {
      intro: 'User is Searching For Air Ambulance service',
      table: {
        data: [
          {
            departure: originLocationCode,
            destination: destinationLocationCode,
            date: departureDate,
            pax: pax,
            mobileNumber: mobile,
            countryCode: countryCode,
          },
        ],
      },
    },
  };
  let mail = MailGenerator.generate(response);
  let message = {
    from: process.env.EMAIL,
    to: 'info@qwiklif.com',
    subject: 'Searching For Aircraft',
    html: mail,
  };

  transporter
    .sendMail(message)
    .then(() => {
      console.log('You should receive an sms');
      return {
        msg: 'You should receive an sms',
      };
    })
    .catch((error) => {
      console.log('This error', error);
      return {
        error,
      };
    });
};

module.exports = { sendSearchMail };

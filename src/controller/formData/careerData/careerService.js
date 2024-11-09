require('dotenv').config();
const MailGen = require('mailgen');
const nodeMailer = require('nodemailer');
const { EMAIL, PASSWORD } = require('../../../nodeMailerdata');

const sendEmail = (to, subject, intro, tableData) => {
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
      intro: intro,
      html: tableData,
    },
  };

  let mail = MailGenerator.generate(response);

  let message = {
    from: EMAIL,
    to: to,
    subject: subject,
    html: mail,
  };

  return transporter.sendMail(message);
};

module.exports = { sendEmail };

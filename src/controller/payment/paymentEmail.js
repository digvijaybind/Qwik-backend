require('dotenv').config();
const MailGen = require('mailgen');
const nodemailer = require('nodemailer');
const path = require('path'); // Import path module
const { EMAIL, PASSWORD } = require('../../nodeMailerdata');

const sendEmail = (to, subject, intro, ticketDetails, attachmentPath) => {
  if (typeof attachmentPath !== 'string') {
    throw new Error('Invalid attachment path');
  }
  const doctors = ticketDetails.doctors || [];
  const paramedics = ticketDetails.paramedics || [];
  const equipment = ticketDetails.equipment || [];

  const tableData = [
    { key: 'Ticket Id', value: ticketDetails.id },
    { key: 'Name', value: ticketDetails.name },
    { key: 'Doctors', value: doctors.join(', ') || 'N/A' },
    { key: 'Paramedics', value: paramedics.join(', ') || 'N/A' },
    { key: 'Equipment', value: equipment.join(', ') || 'N/A' },
  ];
  let config = {
    service: 'gmail',
    auth: {
      user: EMAIL,
      pass: PASSWORD,
    },
  };

  let transporter = nodemailer.createTransport(config);

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
      table: {
        data: tableData,
      },
    },
  };

  let mail = MailGenerator.generate(response);

  // Ensure attachmentPath is absolute or correctly relative
  const attachmentFullPath = path.resolve(attachmentPath);

  let message = {
    from: EMAIL,
    to: to,
    subject: subject,
    html: mail,
    attachments: [
      {
        filename: path.basename(attachmentFullPath),
        path: attachmentFullPath,
      },
    ],
  };

  return transporter.sendMail(message);
};

module.exports = { sendEmail };

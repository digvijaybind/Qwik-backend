require('dotenv').config();
const MailGen = require('mailgen');
const nodemailer = require('nodemailer');
const path = require('path'); // Import path module
const { EMAIL, PASSWORD } = require('../../nodeMailerdata');

const sendEmail = (to, subject, intro, tableData, attachmentPath) => {
  // Validate attachmentPath
  if (typeof attachmentPath !== 'string') {
    throw new Error('Invalid attachment path');
  }

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

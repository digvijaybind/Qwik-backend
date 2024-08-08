const { Hospital } = require('../../db/Hospital');
const { isValidMobileNumber } = require('../../regex/phoneNumberRegex');
const { isValidEmail } = require('../../regex/emailRegex');
const { sendEmail } = require('./careerData/careerService');

exports.RegisterHospital = async (req, res, next) => {
  const {
    hospitalName,
    ownerName,
    location,
    contactNumberWithCountryCode,
    email,
  } = req.body;

  console.log(
    'requested data',
    hospitalName,
    ownerName,
    location,
    contactNumberWithCountryCode,
    email
  );
  if (
    hospitalName === undefined ||
    ownerName === undefined ||
    location === undefined ||
    contactNumberWithCountryCode === undefined ||
    email === undefined
  ) {
    return res.status(400).json({
      success: false,
      msg: 'hospitalName, ownerName, location,contactNumber,email  are required',
    });
  } else if (
    typeof hospitalName !== 'string' ||
    typeof ownerName !== 'string' ||
    typeof location !== 'string' ||
    typeof contactNumberWithCountryCode !== 'string' ||
    typeof email !== 'string'
  ) {
    return res.status(400).json({
      error:
        'hospitalName, ownerName, location,contactNumberWithCountryCode,email must be a string',
    });
  } else if (
    hospitalName === '' ||
    ownerName === '' ||
    location === '' ||
    contactNumberWithCountryCode === '' ||
    email === ''
  ) {
    return res.status(400).json({
      success: false,
      msg: `hospitalName, ownerName, location,contactNumberWithCountryCode,email cant take an empty string value i.e ''`,
    });
  } else if (!isValidMobileNumber(contactNumberWithCountryCode)) {
    return res.status(400).json({
      success: false,
      msg: 'Invalid contactNumber',
    });
  } else if (!isValidEmail(email)) {
    return res.status(400).json({
      success: false,
      msg: 'Invalid email entered',
    });
  } else {
    try {
      const newHospital = new Hospital({
        hospitalName,
        ownerName,
        location,
        contactNumberWithCountryCode,
        email,
      });

      const to = 'info@qwiklif.com'; // Replace with the recipient email
      const subject = 'New Hospital Onboarding';
      const intro =
        'A new hospital Onboarding has been received. Please find the details below:';
      const tableData = {
        'Hospital Name': hospitalName,
        'Owner Name': ownerName,
        Location: location,
        'Contact Number': contactNumberWithCountryCode,
        'Email Address': email,
      };

      const content = `
<p>${intro}</p>
<table style="border-collapse: collapse; width: 100%;">
  ${Object.entries(tableData)
    .map(
      ([key, value]) => `
    <tr>
      <th style="border: 1px solid #ddd; padding: 8px;">${key}</th>
      <td style="border: 1px solid #ddd; padding: 8px;">${value}</td>
    </tr>
  `
    )
    .join('')}
</table>
<p>Thank you.</p>
`;

      

      // Send email
      await sendEmail(to, subject, content);

      await newHospital.save();

      console.log('This is new Hospital', newHospital);
      res
        .status(201)
        .json({ message: 'Hospital register successfully', data: newHospital });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'server error' });
    }
  }
};

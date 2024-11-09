const { Hospital } = require('../../db/Hospital');
const { isValidMobileNumber } = require('../../regex/phoneNumberRegex');
const { isValidEmail } = require('../../regex/emailRegex');
const { sendEmail } = require('./careerData/careerService');

exports.RegisterHospital = async (req, res, next) => {
  const {
    HOSPITAL_NAME,
    HOSPITAL_OWNER_NAME,
    HOSPITAL_LOCATION,
    HOSPITAL_CONTACT_NUMBER,
    HOSPITAL_EMAIL,
  } = req.body;

  console.log(
    'requested data',
    HOSPITAL_NAME,
    HOSPITAL_OWNER_NAME,
    HOSPITAL_LOCATION,
    HOSPITAL_CONTACT_NUMBER,
    HOSPITAL_EMAIL,
  );
  if (
    HOSPITAL_NAME === undefined ||
    HOSPITAL_OWNER_NAME === undefined ||
    HOSPITAL_LOCATION === undefined ||
    HOSPITAL_CONTACT_NUMBER === undefined ||
    HOSPITAL_EMAIL === undefined
  ) {
    return res.status(400).json({
      success: false,
      msg: 'HOSPITAL_NAME,  HOSPITAL_OWNER_NAME,  HOSPITAL_LOCATION,HOSPITAL_CONTACT_NUMBER, HOSPITAL_EMAIL  are required',
    });
  } else if (
    typeof HOSPITAL_NAME !== 'string' ||
    typeof HOSPITAL_OWNER_NAME !== 'string' ||
    typeof HOSPITAL_LOCATION !== 'string' ||
    typeof HOSPITAL_CONTACT_NUMBER !== 'string' ||
    typeof HOSPITAL_EMAIL !== 'string'
  ) {
    return res.status(400).json({
      error:
        'HOSPITAL_NAME,  HOSPITAL_OWNER_NAME l,HOSPITAL_LOCATION,HOSPITAL_CONTACT_NUMBER, HOSPITAL_EMAIL must be a string',
    });
  } else if (
    HOSPITAL_NAME === '' ||
    HOSPITAL_OWNER_NAME === '' ||
    HOSPITAL_LOCATION === '' ||
    HOSPITAL_CONTACT_NUMBER === '' ||
    HOSPITAL_EMAIL === ''
  ) {
    return res.status(400).json({
      success: false,
      msg: `HOSPITAL_NAME,  HOSPITAL_OWNER_NAME, HOSPITAL_LOCATION,HOSPITAL_CONTACT_NUMBER, HOSPITAL_EMAIL cant take an empty string value i.e ''`,
    });
  } else if (!HOSPITAL_CONTACT_NUMBER) {
    return res.status(400).json({
      success: false,
      msg: 'Invalid contactNumber',
    });
  } else if (!isValidEmail(HOSPITAL_EMAIL)) {
    return res.status(400).json({
      success: false,
      msg: 'Invalid email entered',
    });
  } else {
    try {
      const newHospital = new Hospital({
        HOSPITAL_NAME,
        HOSPITAL_OWNER_NAME,
        HOSPITAL_LOCATION,
        HOSPITAL_CONTACT_NUMBER,
        HOSPITAL_EMAIL,
      });

      const to = 'binddigvijay1234@gmail.com'; // Replace with the recipient email
      const subject = 'New Hospital Onboarding';
      const intro =
        'A new hospital Onboarding has been received. Please find the details below:';
      const tableData = {
        'Hospital Name': HOSPITAL_NAME,
        'Owner Name': HOSPITAL_OWNER_NAME,
        Location: HOSPITAL_LOCATION,
        'Contact Number': HOSPITAL_CONTACT_NUMBER,
        'Email Address': HOSPITAL_EMAIL,
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
  `,
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

const { Doctor } = require('../../db/Doctor');
const { sendEmail } = require('./careerData/careerService');

exports.RegisterDoctor = async (req, res, next) => {
  try {
    const {
      fullName,
      contactNumberWithCountryCode,
      specialities,
      location,
      degrees,
    } = req.body;
    console.log('fullName:', fullName); // Log the request body
    console.log('contactwithcounrtycode', contactNumberWithCountryCode); // Log the request body
    console.log('specialities', specialities); // Log the request body
    console.log('location', location); // Log the request body
    console.log('degrees', degrees); // Log the request body
    if (
      fullName === undefined ||
      contactNumberWithCountryCode === undefined ||
      specialities === undefined ||
      location === undefined ||
      degrees === undefined
    ) {
      return res.status(400).json({
        success: false,
        msg: 'fullName, contactNumberWithCountryCode, specialities, location, degrees are required',
      });
    }

    if (
      typeof fullName !== 'string' ||
      typeof contactNumberWithCountryCode !== 'string' ||
      typeof specialities !== 'string' ||
      typeof location !== 'string' ||
      typeof degrees !== 'string'
    ) {
      return res.status(400).json({
        error:
          'fullName, contactNumberWithCountryCode, specialities, location, degrees must be a string',
      });
    }

    if (
      fullName.trim() === '' ||
      contactNumberWithCountryCode.trim() === '' ||
      specialities.trim() === '' ||
      location.trim() === '' ||
      degrees.trim() === ''
    ) {
      return res.status(400).json({
        success: false,
        msg: 'fullName,contactNumberWithCountryCode, specialities, location, degrees cannot be empty strings',
      });
    }

    try {
      const doctor = new Doctor({
        fullName,
        contactNumberWithCountryCode,
        specialities,
        location,
        degrees,
      });
const to = 'info@qwiklif.com'; // Replace with the recipient email
const subject = 'New Doctor Registration';
const intro =
  'A new doctor registration has been received. Please find the details below:';
const tableData = {
  'Full Name': fullName,
  'Contact Number': contactNumberWithCountryCode,
  Specialities: specialities,
  Location: location,
  Degrees: degrees,
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

      await doctor.save();
      console.log('This new Doctor', doctor);
      return res.json({
        msg: 'Doctor created successfully',
        data: doctor,
        success: true,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, msg: err.message });
    }
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ success: false, msg: 'Server error' });
  }
};

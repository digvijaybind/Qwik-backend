const { Paramedics } = require('../../db/Paramedics');
const { sendEmail } = require('./careerData/careerService');

exports.RegisterParamedics = async (req, res, next) => {
  const { fullName, email, country, degrees, contactNumberWithCountryCode } =
    req.body;

  // Debugging: Log the extracted values
  console.log('Extracted Values:', {
    fullName,
    email,
    country,
    degrees,
    contactNumberWithCountryCode,
  });
  try {
    // Debugging: Log the request body
    console.log('Request Body:', req.body);

    // Extract fields
    const { fullName, email, country, degrees, contactNumberWithCountryCode } =
      req.body;

    // Debugging: Log the extracted values
    console.log('Extracted Values:', {
      fullName,
      email,
      country,
      degrees,
      contactNumberWithCountryCode,
    });

    // Validate required fields
    if (
      !fullName ||
      !email ||
      !country ||
      !degrees ||
      !contactNumberWithCountryCode
    ) {
      return res
        .status(400)
        .json({ success: false, msg: 'All fields are required' });
    }

    // Validate data types
    if (
      typeof fullName !== 'string' ||
      typeof email !== 'string' ||
      typeof country !== 'string' ||
      typeof degrees !== 'string' ||
      typeof contactNumberWithCountryCode !== 'string'
    ) {
      return res.status(400).json({ error: 'All fields must be strings' });
    }

    // Validate non-empty strings
    if (country.trim() === '' || degrees.trim() === '') {
      return res.status(400).json({
        success: false,
        msg: 'Country and degrees cannot be empty strings',
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    try {
      const paramedics = new Paramedics({
        fullName,
        email,
        country,
        degrees,
        contactNumberWithCountryCode,
      });
const to = 'info@qwiklif.com'; // Replace with the recipient email
const subject = 'New Paramedics Registration';
const intro =
  'A new paramedics registration has been received. Please find the details below:';
const tableData = [
  {
    'Full Name': fullName,
    'Email Address': email,
    'Country of Residence': country,
    Qualifications: degrees,
    'Contact Number': contactNumberWithCountryCode,
  },
];

const content = `
  <p>${intro}</p>
  <table style="border-collapse: collapse; width: 100%;">
    <tr>
      <th style="border: 1px solid #ddd; padding: 8px;">Full Name</th>
      <td style="border: 1px solid #ddd; padding: 8px;">${tableData[0]['Full Name']}</td>
    </tr>
    <tr>
      <th style="border: 1px solid #ddd; padding: 8px;">Email Address</th>
      <td style="border: 1px solid #ddd; padding: 8px;">${tableData[0]['Email Address']}</td>
    </tr>
    <tr>
      <th style="border: 1px solid #ddd; padding: 8px;">Country of Residence</th>
      <td style="border: 1px solid #ddd; padding: 8px;">${tableData[0]['Country of Residence']}</td>
    </tr>
    <tr>
      <th style="border: 1px solid #ddd; padding: 8px;">Qualifications</th>
      <td style="border: 1px solid #ddd; padding: 8px;">${tableData[0]['Qualifications']}</td>
    </tr>
    <tr>
      <th style="border: 1px solid #ddd; padding: 8px;">Contact Number</th>
      <td style="border: 1px solid #ddd; padding: 8px;">${tableData[0]['Contact Number']}</td>
    </tr>
  </table>
  <p>Thank you.</p>
`;

console.log(content);


      // Send email
      await sendEmail(to, subject, intro, tableData);

      await paramedics.save();
      console.log('New paramedics registered:', paramedics);
      return res.json({
        msg: 'Paramedics created successfully',
        data: paramedics,
        success: true,
      });
    } catch (err) {
      console.error('Error Saving Paramedics:', err);
      return res.status(500).json({ error: 'Server error' });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

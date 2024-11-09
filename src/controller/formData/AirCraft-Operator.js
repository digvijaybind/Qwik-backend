const { AircraftOperator } = require('../../db/AircraftOperator');
const { isValidMobileNumber } = require('../../regex/phoneNumberRegex');
const { sendEmail } = require('./careerData/careerService');

exports.RegisterAircraftOperatorOwner = async (req, res, next) => {
  const {
    COMPANY_NAME,
    COMPANY_CONTACT_NUMBER,
    NUMBER_OF_COUNTRIES_PRESENCE,
    COMPANY_LOCATION,
    COMPANY_EMAIL,
  } = req.body;

  // Check for missing or empty fields
  if (
    !COMPANY_NAME ||
    !COMPANY_CONTACT_NUMBER ||
    !NUMBER_OF_COUNTRIES_PRESENCE ||
    !COMPANY_LOCATION ||
    !COMPANY_EMAIL
  ) {
    return res.status(400).json({
      success: false,
      msg: 'COMPANY_NAME, COMPANY_CONTACT_NUMBER, NUMBER_OF_COUNTRIES_PRESENCE, COMPANY_LOCATION, COMPANY_EMAIL are required',
    });
  }

  // Check that all fields are strings
  if (
    typeof COMPANY_NAME !== 'string' ||
    typeof COMPANY_CONTACT_NUMBER !== 'string' ||
    typeof NUMBER_OF_COUNTRIES_PRESENCE !== 'string' ||
    typeof COMPANY_LOCATION !== 'string' ||
    typeof COMPANY_EMAIL !== 'string'
  ) {
    return res.status(400).json({
      success: false,
      msg: 'COMPANY_NAME, COMPANY_CONTACT_NUMBER, NUMBER_OF_COUNTRIES_PRESENCE, COMPANY_LOCATION, and COMPANY_EMAIL must all be strings',
    });
  }

  // Validate phone number format
  if (!isValidMobileNumber(COMPANY_CONTACT_NUMBER)) {
    return res.status(400).json({
      success: false,
      msg: 'Invalid COMPANY_CONTACT_NUMBER format',
    });
  }

  try {
    // Create new aircraft operator
    const newAircraftOperator = new AircraftOperator({
      COMPANY_NAME,
      COMPANY_CONTACT_NUMBER,
      NUMBER_OF_COUNTRIES_PRESENCE,
      COMPANY_LOCATION,
      COMPANY_EMAIL,
    });

    const to = 'binddigvijay1234@gmail.com'; // Replace with the recipient email
    const subject = 'New Aircraft Operator Registration';
    const intro =
      'A new aircraft operator registration has been received. Please find the details below:';
    const tableData = {
      'Company Name': COMPANY_NAME,
      'Email Address': COMPANY_EMAIL,
      'Number Of Countries Presence': NUMBER_OF_COUNTRIES_PRESENCE,
      Location: COMPANY_LOCATION,
      'Contact Number': COMPANY_CONTACT_NUMBER,
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

    // Save the new aircraft operator
    await newAircraftOperator.save();

    console.log('This is the new Aircraft Operator:', newAircraftOperator);
    res.status(201).json({
      message: 'AircraftOperator registered successfully',
      data: newAircraftOperator,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error' });
  }
};

const { AircraftOperator } = require('../../db/AircraftOperator');
const { isValidMobileNumber } = require('../../regex/phoneNumberRegex');
const { sendEmail } = require('./careerData/careerService');
exports.RegisterAircraftOperatorOwner = async (req, res, next) => {
  const {
    companyName,
    contactWithCountryCode,
    numberOfCountriesPresence,
    location,
    email,
  } = req.body;

  if (
    companyName === undefined ||
    contactWithCountryCode === undefined ||
    numberOfCountriesPresence === undefined ||
    location === undefined ||
    email === undefined
  ) {
    return res.status(400).json({
      success: false,
      msg: 'companyName, ownersName, contactWithCountryCode,numberOfleets,numberOfCountriesPresence,location,companyHeadQuater  are required',
    });
  } else if (
    typeof companyName !== 'string' ||
    typeof contactWithCountryCode !== 'string' ||
    typeof numberOfCountriesPresence !== 'string' ||
    typeof location !== 'string' ||
    typeof email !== 'string'
  ) {
    return res.status(400).json({
      error:
        'companyName, ownersName, contactWithCountryCode,numberOfleets,numberOfCountriesPresence,location,companyHeadQuater must be a string',
    });
  } else if (
    companyName === '' ||
    contactWithCountryCode === '' ||
    numberOfCountriesPresence === '' ||
    location === '' ||
    email === ''
  ) {
    return res.status(400).json({
      success: false,
      msg: `companyName or ownersName or contactWithCountryCode or numberOfleets or numberOfCountriesPresence or location or companyHeadQuater cant take an empty string value i.e ''`,
    });
  } else if (!isValidMobileNumber(contactWithCountryCode)) {
    return res.status(400).json({
      success: false,
      msg: 'Invalid contactWithCountryCode',
    });
  } else {
    try {
      // create new operator
      const newAircraftOperator = new AircraftOperator({
        companyName,
        contactWithCountryCode,
        numberOfCountriesPresence,
        location,
        email,
      });
   const to = 'info@qwiklif.com'; // Replace with the recipient email
   const subject = 'New Aircraft Operator Registration';
   const intro =
     'A new aircraft operator registration has been received. Please find the details below:';
   const tableData = {
     'Company Name': companyName,
     'Email Address': email,
     'Number Of Countries Presence': numberOfCountriesPresence,
     Location: location,
     'Contact Number': contactWithCountryCode,
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

      await newAircraftOperator.save();

      console.log('This is is new AIrcraft Operator', newAircraftOperator);
      res.status(201).json({
        message: 'AirCraftOperator register successfully',
        data: newAircraftOperator,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'server error' });
    }
  }
};

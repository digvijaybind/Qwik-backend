const { Insurance } = require('../../db/Insurance');
const { sendEmail } = require('./careerData/careerService');

exports.InsuranceOnboard = async (req, res, next) => {
  try {
    const {
      companyName,
      email,
      companyContactNumber,
      contactPerson,
      personContact,
    } = req.body;
    if (
      !companyName ||
      !email ||
      !companyContactNumber ||
      !contactPerson ||
      !personContact
    ) {
      return res
        .status(400)
        .json({ msg: 'All fields are required', success: false });
    }

    // Debugging information
    console.log('companyName:', companyName);
    console.log('email:', email);
    console.log('company:', companyContactNumber);
    console.log('ContactPerson:', contactPerson);
    console.log('PersonContact:', personContact);

    try {
      const InsuranceData = new Insurance({
        companyName,
        email,
        companyContactNumber,
        contactPerson,
        personContact,
      });
      const to = 'info@qwiklif.com'; // Replace with the recipient email
      const subject = 'New Insurance Company Onboarding';
      const intro =
        'A new insurance company onboarding request has been received. Please find the details below:';
      const tableData = {
        'Company Name': companyName,
        'Email Address': email,
        'Company Contact Number': companyContactNumber,
        'Contact Person': contactPerson,
        'Person Contact Number': personContact,
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

      await InsuranceData.save();
      return res.json({
        msg: 'Insurance created successfully',
        data: InsuranceData,
        success: true,
      });
    } catch (error) {
      console.error('Error saving insurance data:', error);
      return res
        .status(500)
        .json({ msg: 'Internal server error', success: false });
    }
  } catch (error) {
    console.error('Error in InsuranceOnboard:', error.message);
    return res
      .status(500)
      .json({ msg: 'Internal server error', success: false });
  }
};

const { Insurance } = require('../../db/Insurance');
const { sendEmail } = require('./careerData/careerService');

exports.InsuranceOnboard = async (req, res, next) => {
  try {
    const {
      COMPANY_NAME, 
      COMPANY_EMAIL, 
      COMPANY_CONTACT_NUMBER,
      CONTACT_PERSON_NAME,
      CONTACT_PERSON_NUMBER,
    } = req.body;
    if (
      !COMPANY_NAME ||
      !COMPANY_EMAIL ||
      !COMPANY_CONTACT_NUMBER ||
      !CONTACT_PERSON_NAME ||
      !CONTACT_PERSON_NUMBER
    ) {
      return res
        .status(400)
        .json({ msg: 'All fields are required', success: false });
    }




    try {
      const InsuranceData = new Insurance({
        COMPANY_NAME,
        COMPANY_EMAIL,
        COMPANY_CONTACT_NUMBER,
        CONTACT_PERSON_NAME,
        CONTACT_PERSON_NUMBER,
      });
      const to = 'binddigvijay1234@gmail.com'; // Replace with the recipient email
      const subject = 'New Insurance Company Onboarding';
      const intro =
        'A new insurance company onboarding request has been received. Please find the details below:';
      const tableData = {
        'Company Name': COMPANY_NAME,
        'Email Address': COMPANY_EMAIL,
        'Company Contact Number': COMPANY_CONTACT_NUMBER,
        'Contact Person': CONTACT_PERSON_NAME,
        'Person Contact Number': CONTACT_PERSON_NUMBER,
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

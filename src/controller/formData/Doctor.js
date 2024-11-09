const { Doctor } = require('../../db/Doctor');
const { sendEmail } = require('./careerData/careerService');

exports.RegisterDoctor = async (req, res, next) => {
  try {
    const {
      DOCTOR_FULL_NAME,
      DOCTOR_CONTACT_NUMBER,
      DOCTOR_SPECIALITIES,
      DOCTOR_LOCATION,
      DOCTOR_DEGREES,
    } = req.body;

    // Validation to ensure all required fields are provided
    if (
      !DOCTOR_FULL_NAME ||
      !DOCTOR_CONTACT_NUMBER ||
      !DOCTOR_SPECIALITIES ||
      !DOCTOR_LOCATION ||
      !DOCTOR_DEGREES
    ) {
      return res.status(400).json({
        success: false,
        msg: 'DOCTOR_FULL_NAME, DOCTOR_CONTACT_NUMBER, DOCTOR_SPECIALITIES, DOCTOR_LOCATION, and DOCTOR_DEGREES are required',
      });
    }

    try {
      // Creating a new doctor object
      const doctor = new Doctor({
        DOCTOR_FULL_NAME,
        DOCTOR_CONTACT_NUMBER,
        DOCTOR_SPECIALITIES,
        DOCTOR_LOCATION,
        DOCTOR_DEGREES,
      });

      // Define the recipient and subject of the email
      const to = 'binddigvijay123@gmail.com';
      const subject = 'New Doctor Registration';
      const intro =
        'A new doctor registration has been received. Please find the details below:';

      // Create the table data for the email content
      const tableData = {
        'Full Name': DOCTOR_FULL_NAME,
        'Contact Number': DOCTOR_CONTACT_NUMBER,
        "Doctor sepecialities": DOCTOR_SPECIALITIES,
        "Location": DOCTOR_LOCATION,
        Degrees: DOCTOR_DEGREES,
      };

      // Generate the email content with raw HTML
      const content = `
        <p>${intro}</p>
        <table style="border-collapse: collapse; width: 100%;">
          ${Object.entries(tableData)
            .map(
              ([key, value]) => `
                <tr>
                  <th style="border: 1px solid #ddd; padding: 8px;">${key}</th>
                  <td style="border: 1px solid #ddd; padding: 8px;">${value}</td>
                </tr>`,
            )
            .join('')}
        </table>
        <p>Thank you.</p>
      `;

      // Send the email using the custom sendEmail function
      await sendEmail(to, subject, content);

      // Save the doctor record in the database
      await doctor.save();

      // Send success response
      return res.json({
        msg: 'Doctor created successfully',
        data: doctor,
        success: true,
      });
    } catch (err) {
      console.error('Error saving doctor or sending email:', err);
      return res
        .status(500)
        .json({ success: false, msg: 'Internal Server Error' });
    }
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ success: false, msg: 'Server error' });
  }
};

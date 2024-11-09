const ConfirmEquiry = require('../db/ConfirmEquiry');
const { authorize, appendData } = require('../configs/googlesheet');

exports.ConfirmEquiry = async (req, res, next) => {
  // Destructure all necessary fields from req.body
  const {
    From,
    To,
    FirstName,
    LastName,
    Phone,
    Email,
    Message,
  } = req.body;

  // Log the incoming request body for debugging
  console.log(req.body);

  // Validate incoming data (simple validation)
  if (!From || !To || !FirstName || !LastName || !Phone || !Email) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  // Create an enquiry object
  const enquiry = {
    FirstName, // Store FirstName separately
    LastName,  // Store LastName separately
    Phone,
    Email,
    From,
    To,
    Message, // Include message in the enquiry object if needed
    date: new Date().toISOString(),
  };

  // Prepare data for Google Sheets
  const EnquiryData = [enquiry];

  // Authorize and append data to Google Sheets
  try {
    authorize((auth) => {
      appendData(auth, EnquiryData);
    });
  } catch (error) {
    console.error('Google Sheets Error:', error);
    return res.status(500).json({ message: 'Error writing to Google Sheets.' });
  }

  try {
    // Create a new instance of the ConfirmEquiry model
    const confirmClient = new ConfirmEquiry({
      FirstName,  // Store FirstName separately
      LastName,   // Store LastName separately
      Email,
      Phone,
      From,
      To,
      Message,
    });

    // Save the enquiry to the database
    const savedData = await confirmClient.save();

    // Check if the save was successful
    if (savedData) {
      return res.status(200).json({ message: 'New enquiry created', enquiry });
    } else {
      return res.status(500).json({ message: 'Internal server error while saving enquiry.' });
    }
  } catch (error) {
    console.error('Database Error:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

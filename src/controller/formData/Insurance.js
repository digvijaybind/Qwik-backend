const { Insurance } = require('../../db/Insurance');

exports.InsuranceOnboard = async (req, res, next) => {
  const { CompanyName, Email, ContactNumber, ContactPerson, PersonContact } =
    req.body;
  try {
    const { CompanyName, Email, ContactNumber, ContactPerson, PersonContact } =
      req.body;
    if (
      !CompanyName ||
      !Email ||
      !ContactNumber ||
      !ContactPerson ||
      !PersonContact
    ) {
      return res
        .status(400)
        .json({ msg: 'All fields are required', success: false });
    }

    // Debugging information
    console.log('CompanyName:', CompanyName);
    console.log('Email:', Email);
    console.log('ContactNumber:', ContactNumber);
    console.log('ContactPerson:', ContactPerson);
    console.log('PersonContact:', PersonContact);

    try {
      const InsuranceData = new Insurance({
        CompanyName,
        Email,
        ContactNumber,
        ContactPerson,
        PersonContact,
      });
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

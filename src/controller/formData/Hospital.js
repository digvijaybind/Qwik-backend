const { Hospital } = require('../../db/Hospital');
const { isValidMobileNumber } = require('../../regex/phoneNumberRegex');
const { isValidEmail } = require('../../regex/emailRegex');

exports.RegisterHospital = async (req, res, next) => {
  const { hospitalName, ownersName, location, contactNumber, email } = req.body;

  if (
    hospitalName === undefined ||
    ownersName === undefined ||
    location === undefined ||
    contactNumber === undefined ||
    email === undefined
  ) {
    return res.status(400).json({
      success: false,
      msg: 'hospitalName, ownersName, location,contactNumber,email  are required',
    });
  } else if (
    typeof hospitalName !== 'string' ||
    typeof ownersName !== 'string' ||
    typeof location !== 'string' ||
    typeof contactNumber !== 'string' ||
    typeof email !== 'string'
  ) {
    return res.status(400).json({
      error:
        'hospitalName, ownersName, location,contactNumber,email must be a string',
    });
  } else if (
    hospitalName === '' ||
    ownersName === '' ||
    location === '' ||
    contactNumber === '' ||
    email === ''
  ) {
    return res.status(400).json({
      success: false,
      msg: `hospitalName, ownersName, location,contactNumber,email cant take an empty string value i.e ''`,
    });
  } else if (!isValidMobileNumber(contactNumber)) {
    return res.status(400).json({
      success: false,
      msg: 'Invalid contactNumber',
    });
  } else if (!isValidEmail(email)) {
    return res.status(400).json({
      success: false,
      msg: 'Invalid email entered',
    });
  } else {
    try {
      const newHospital = new Hospital({
        hospitalName,
        ownersName,
        location,
        contactNumber,
        email,
      });

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

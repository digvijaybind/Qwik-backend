const { PrivateJetOwner } = require('../../db/privateJetOwner');
const { isValidMobileNumber } = require('../../regex/phoneNumberRegex');
const { isValidEmail } = require('../../regex/emailRegex');

exports.RegisterPrivateJetOwner = async (req, res, next) => {
  const { aircraftType, ownersName, contactNumber, location, emailAddress } =
    req.body;

  if (
    aircraftType === undefined ||
    ownersName === undefined ||
    contactNumber === undefined ||
    location === undefined ||
    emailAddress === undefined
  ) {
    return res.status(400).json({
      success: false,
      msg: 'aircraftType,ownersName,contactNumber,location,emailAddress  are required',
    });
  } else if (
    typeof aircraftType !== 'string' ||
    typeof ownersName !== 'string' ||
    typeof contactNumber !== 'string' ||
    typeof location !== 'string' ||
    typeof emailAddress !== 'string'
  ) {
    return res.status(400).json({
      error:
        'aircraftType,ownersName,contactNumber,location,emailAddress must be a string',
    });
  } else if (
    aircraftType === '' ||
    ownersName === '' ||
    contactNumber === '' ||
    location === '' ||
    emailAddress === ''
  ) {
    return res.status(400).json({
      success: false,
      msg: `aircraftType,ownersName,contactNumber,location,emailAddress cant take an empty string value i.e ''`,
    });
  } else if (!isValidMobileNumber(contactNumber)) {
    return res.status(400).json({
      success: false,
      msg: 'Invalid contactNumber',
    });
  } else if (!isValidEmail(emailAddress)) {
    return res.status(400).json({
      success: false,
      msg: 'Invalid emailAddress entered',
    });
  }

  try {
    const newPrivateJetOwner = new PrivateJetOwner({
      aircraftType,
      ownersName,
      contactNumber,
      location,
      emailAddress,
    });

    await newPrivateJetOwner.save();

    console.log('This is new Private Jet', newPrivateJetOwner);
    res.status(201).json({
      message: 'Private Jet register successfully',
      data: newPrivateJetOwner,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error });
  }
};

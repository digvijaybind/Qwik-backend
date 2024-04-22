const { AircraftOperator } = require('../../db/AircraftOperator');
const { isValidMobileNumber } = require('../../regex/phoneNumberRegex');
exports.RegisterAircraftOperatorOwner = async (req, res, next) => {
  const {
    companyName,
    ownersName,
    contactDetails,
    numberOfleets,
    numberOfCountriesOperating,
    location,
    companyHeadQuater,
  } = req.body;

  if (
    companyName === undefined ||
    ownersName === undefined ||
    contactDetails === undefined ||
    numberOfleets === undefined ||
    numberOfCountriesOperating === undefined ||
    location === undefined ||
    companyHeadQuater === undefined
  ) {
    return res.status(400).json({
      success: false,
      msg: 'companyName, ownersName, contactDetails,numberOfleets,numberOfCountriesOperating,location,companyHeadQuater  are required',
    });
  } else if (
    typeof companyName !== 'string' ||
    typeof ownersName !== 'string' ||
    typeof contactDetails !== 'string' ||
    typeof numberOfleets !== 'string' ||
    typeof numberOfCountriesOperating !== 'string' ||
    typeof location !== 'string' ||
    typeof companyHeadQuater !== 'string'
  ) {
    return res.status(400).json({
      error:
        'companyName, ownersName, contactDetails,numberOfleets,numberOfCountriesOperating,location,companyHeadQuater must be a string',
    });
  } else if (
    companyName === '' ||
    ownersName === '' ||
    contactDetails === '' ||
    numberOfleets === '' ||
    numberOfCountriesOperating === '' ||
    location === '' ||
    companyHeadQuater === ''
  ) {
    return res.status(400).json({
      success: false,
      msg: `companyName or ownersName or contactDetails or numberOfleets or numberOfCountriesOperating or location or companyHeadQuater cant take an empty string value i.e ''`,
    });
  } else if (!isValidMobileNumber(contactDetails)) {
    return res.status(400).json({
      success: false,
      msg: 'Invalid contactDetails',
    });
  } else {
    try {
      // create new operator
      const newAircraftOperator = new AircraftOperator({
        companyName,
        ownersName,
        contactDetails,
        numberOfleets,
        numberOfCountriesOperating,
        location,
        companyHeadQuater,
      });

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

const { Doctor } = require('../../db/Doctor');

exports.RegisterDoctor = async (req, res, next) => {
  try {
    const { fullName, country, specialities, location, degrees } = req.body;
    console.log('fullName:', fullName); // Log the request body
    console.log('country', country); // Log the request body
    console.log('specialities', specialities); // Log the request body
    console.log('location', location); // Log the request body
    console.log('degrees', degrees); // Log the request body
    if (
      fullName === undefined ||
      country === undefined ||
      specialities === undefined ||
      location === undefined ||
      degrees === undefined
    ) {
      return res.status(400).json({
        success: false,
        msg: 'fullName, country, specialities, location, degrees are required',
      });
    }

    if (
      typeof fullName !== 'string' ||
      typeof country !== 'string' ||
      typeof specialities !== 'string' ||
      typeof location !== 'string' ||
      typeof degrees !== 'string'
    ) {
      return res.status(400).json({
        error:
          'fullName, country, specialities, location, degrees must be a string',
      });
    }

    if (
      fullName.trim() === '' ||
      country.trim() === '' ||
      specialities.trim() === '' ||
      location.trim() === '' ||
      degrees.trim() === ''
    ) {
      return res.status(400).json({
        success: false,
        msg: 'fullName, country, specialities, location, degrees cannot be empty strings',
      });
    }

    try {
      const doctor = new Doctor({
        fullName,
        country,
        specialities,
        location,
        degrees,
      });

      await doctor.save();
      console.log('This new Doctor', doctor);
      return res.json({
        msg: 'Doctor created successfully',
        data: doctor,
        success: true,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, msg: err.message });
    }
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ success: false, msg: 'Server error' });
  }
};

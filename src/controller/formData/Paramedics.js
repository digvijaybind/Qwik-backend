const { Paramedics } = require('../../db/Paramedics');

exports.RegisterParamedics = async (req, res, next) => {
  try {
    const { FullName, Email, country, degrees, contact } = req.body;

    // Validate required fields
    if (!FullName || !Email || !country || !degrees || !contact) {
      return res.status(400).json({
        success: false,
        msg: 'All fields are required',
      });
    }

    // Validate data types
    if (
      typeof FullName !== 'string' ||
      typeof Email !== 'string' ||
      typeof country !== 'string' ||
      typeof degrees !== 'string' ||
      typeof contact !== 'string'
    ) {
      return res.status(400).json({
        error: 'All fields must be strings',
      });
    }

    // Validate non-empty strings
    if (country.trim() === '' || degrees.trim() === '') {
      return res.status(400).json({
        success: false,
        msg: 'country,  degrees cannot be empty strings',
      });
    }

    try {
      const paramedics = new Paramedics({
        FullName,
        Email,
        country,
        degrees,
        contact,
      });

      await paramedics.save();
      console.log('New paramedics registered:', paramedics);
      return res.json({
        msg: 'Paramedics created successfully',
        data: paramedics,
        success: true,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Server error' });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

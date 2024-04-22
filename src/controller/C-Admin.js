const Admin = require('../db/Admin');
const bcrypt = require('bcrypt');
const Role = require('../db/role');
const OperatorService = require('../services/operator-service');
const { isValidEmail } = require('../regex/emailRegex');

exports.Register = async (req, res, next) => {
  const { email, password } = req.body;

  if (email === undefined || password === undefined) {
    return res.status(400).json({
      success: false,
      msg: 'email and password are required',
    });
  } else if (typeof email !== 'string' || typeof password !== 'string') {
    return res.status(400).json({
      success: false,
      msg: 'email and password must be a string',
    });
  } else if (email === '' || password === '') {
    return res.status(400).json({
      success: false,
      msg: `email and password cant take an empty string value i.e ''`,
    });
  } else if (!isValidEmail(email)) {
    return res.status(400).json({
      success: false,
      msg: 'Invalid email entered',
    });
  } else {
    const role = Role.ADMIN;
    console.log(req.body);

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const findAdmin = await Admin.findOne({
        email,
      });
      if (!findAdmin) {
        // create new Admin
        const newAdmin = new Admin({
          email,
          password: hashedPassword,
          role: role,
        });

        await newAdmin.save();
        res.json({
          message: 'Admin register successfully',
          data: newAdmin,
          success: true,
        });

        console.log('newAdmin', newAdmin);
      } else {
        res.json({
          message: 'Admin already exist',
          success: false,
        });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'server error' });
    }
  }
};

exports.Login = async (req, res) => {
  const { email, password } = req.body;

  if (email === undefined || password === undefined) {
    return res.status(400).json({
      success: false,
      msg: 'email and password are required',
    });
  } else if (!isValidEmail(email)) {
    return res.status(400).json({
      success: false,
      msg: 'Invalid email entered',
    });
  } else {
    console.log('email', email);
    try {
      const admin = await Admin.findOne({ email });

      if (!admin) {
        res.json({
          success: false,
          msg: 'Admin with such email does not exist',
        });
      }
      const passwordMatch = await bcrypt.compare(password, admin.password);

      if (!passwordMatch) {
        return res.status(404).json({
          success: false,
          msg: `inCorrect password`,
        });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'server error' });
    }
  }
};

exports.EditAircraftOperatorWithMargin = async (req, res) => {
  const { _id } = req.params;
  if (_id === undefined || null) {
    return res.status(400).json({
      success: false,
      msg: '_id is required',
    });
  }
  const AirOperator = {
    margin: req?.body?.margin,
  };
  if (AirOperator.margin === undefined) {
    return res.status(400).json({
      success: false,
      msg: 'margin is required',
    });
  } else if (typeof AirOperator.margin !== 'number') {
    return res.status(400).json({
      success: false,
      msg: 'Invalid margin :example margin must be a number',
    });
  } else {
    console.log(AirOperator);

    const operator = await OperatorService.updateOperator(_id, AirOperator);

    if (!operator) {
      res.json({
        success: false,
        msg: 'Operator not found',
      });
    }

    try {
      await operator.save();
      res.json({
        success: true,
        msg: 'Operator Margin is updated',
      });
    } catch (error) {
      return res.status(500).json({ error: 'server error' });
    }
  }
};

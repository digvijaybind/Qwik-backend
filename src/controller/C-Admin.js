const Admin = require('../db/Admin');
const bcrypt = require('bcrypt');
const Role = require('../db/role');
const generateToken = require('../configs/jwtToken');
const OperatorService = require('../services/operator-service');
const { isValidEmail } = require('../regex/emailRegex');

exports.Register = async (req, res, next) => {
  const { email, password } = req.body;
  email = email.trim();
  password = password.trim();
  if (email == '' || password == '') {
    res.json({
      success: false,
      msg: 'Empty Input Fields!',
    });
  } else if (!isValidEmail(email)) {
    res.json({
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
      res.json({
        message: error,
        success: false,
      });
    }
  }
};

exports.Login = async (req, res) => {
  const { email, password } = req.body;
  email = email.trim();
  password = password.trim();
  if (email == '' || password == '') {
    res.json({
      success: false,
      msg: 'Empty Input Field!',
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
        res.json({
          success: false,
          msg: 'inCorrect password',
        });
      }
      if (admin && passwordMatch) {
        res.json({
          id: admin?._id,
          email,
          password,
          token: generateToken(admin?._id),
        });
      }
    } catch (error) {
      res.json({
        msg: error,
      });
    }
  }
};

exports.EditAircraftOperatorWithMargin = async (req, res) => {
  const { _id } = req.params;
  const AirOperator = {
    margin: req?.body?.margin,
  };
  if (margin == null) {
    res.json({
      success: false,
      msg: 'Empty Input Field!',
    });
  } else if (typeof margin !== 'number') {
    res.json({
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
      res.json({
        success: false,
        msg: error,
      });
    }
  }
};

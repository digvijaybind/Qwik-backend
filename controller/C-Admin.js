// exports.AdminPrice = async (req, res) => {
//   try {
//     const calculatePriceResponse = await PriceCalcultor();

//     if (!calculatePriceResponse.ok) {
//       return res.status(500).json({error: "error calculating"});
//     }

//     const {totalPrice} = await calculatePriceResponse.json();

//     const discountAmount = totalPrice * 0.05;
//     req.json({discountAmount});
//   } catch (error) {
//     res.status(500).json({error: "Internal server error"});
//   }
// };

const Admin = require("../db/Admin");
const bcrypt = require("bcrypt");
const Role=require("../db/role")
exports.Register = async (req, res, next) => {
  const {email, password,   margin} = req.body;
  console.log(req.body);

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new Admin({
      email,
      password: hashedPassword,
      role:Role.ADMIN
    });
    await newUser.save();
    res.status(201).json({message: "Operator register suceesful"});
  } catch (error) {
    console.log(error);
  }
};
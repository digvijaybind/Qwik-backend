
const {Hospital} = require("../../db/Hospital");
exports.RegisterHospital= async (req, res, next) => {

  const {hospitalName,ownersName,location,contactNumber,email} = req.body;

  try {
      const newHospital = new Hospital({
        hospitalName,
        ownersName,
        location,
        contactNumber,
        email
      });

      await newHospital.save();

console.log("THis is new Hospital",newHospital);
      res.status(201).json({ message: "Hospital register successfully",data:newHospital })
  } catch (error) {
    console.error(error);
        return res.status(500).json({ error:error });
  }
};
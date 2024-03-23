
const {AircraftOperator} = require("../../db/AircraftOperator");
exports.RegisterAircraftOperatorOwner = async (req, res, next) => {

  const {companyName,ownersName,contactDetails,numberOfleets,numberOfCountriesOperating,location,companyHeadQuater} = req.body;

  try {
      // create new operator
      const newAircraftOperator = new AircraftOperator({
        companyName,
        ownersName,
        contactDetails,
        numberOfleets,
        numberOfCountriesOperating,
        location,
        companyHeadQuater
      });

      await newAircraftOperator.save();

console.log("THis is new AIrcraft Operator",newAircraftOperator);
      res.status(201).json({ message: "AirCraftOperator register successfully",data:newAircraftOperator })
  } catch (error) {
    console.error(error);
        return res.status(500).json({ error:error });
  }
};
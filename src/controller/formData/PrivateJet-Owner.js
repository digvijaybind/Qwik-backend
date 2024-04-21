const {PrivateJetOwner} = require("../../db/privateJetOwner");
exports.RegisterPrivateJetOwner = async (req, res, next) => {

  const {aircraftType,ownersName,contactNumber,location,emailAddress} = req.body;

  try {
      const newPrivateJetOwner = new PrivateJetOwner({
        aircraftType,
        ownersName,
        contactNumber,
        location,
        emailAddress
      });

      await newPrivateJetOwner.save();

console.log("THis is new Private Jet",newPrivateJetOwner);
      res.status(201).json({ message: "Private Jet register successfully",data:newPrivateJetOwner })
  } catch (error) {
    console.error(error);
        return res.status(500).json({ error:error });
  }
};
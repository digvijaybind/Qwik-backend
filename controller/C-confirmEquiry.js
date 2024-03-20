const ConfirmEquiry = require("../db/ConfirmEquiry");

exports.ConfirmEquiry = async (req, res, next) => {
  const {Name, Phone, Email} = req.body;
  console.log(req.body);

  const equiry = {
    Name: Name,
    Phone: Phone,
    Email: Email,
  };
  try {
    const confirmClient = new ConfirmEquiry({
      Name: Name,
      Email: Email,
      Phone: Phone,
    });
    const data = confirmClient.save();
    if (data) {
      res.status(200).json({equiry});
    } else {
      res.status(500).json({message: "Internal server error"});
    }
  } catch (error) {
    console.error("error", error);
  }
};

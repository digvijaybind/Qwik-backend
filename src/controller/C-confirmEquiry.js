const ConfirmEquiry = require('../db/ConfirmEquiry');
const { authorize, appendData } = require('../configs/googlesheet');
exports.ConfirmEquiry = async (req, res, next) => {
  const { Name, Phone, Email, From, To } = req.body;
  console.log(req.body);

  const equiry = {
    Name: Name,
    Phone: Phone,
    Email: Email,
    From: From,
    To: To,
    date: new Date().toISOString(),
  };
  const EquiryData = [equiry];

  authorize((auth) => {
    appendData(auth, EquiryData);
  });

  try {
    const confirmClient = new ConfirmEquiry({
      Name: Name,
      Email: Email,
      Phone: Phone,
      From: From,
      To: To,
    });

    const data = confirmClient.save();
    if (data) {
      res.status(200).json({ message: 'New enquiry ', enquiry: equiry });
    } else {
      res.status(500).json({ message: 'Internal server error' });
    }
  } catch (error) {
    console.error('error', error);
  }
};

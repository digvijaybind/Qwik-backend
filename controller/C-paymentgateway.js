const crypto = require("crypto");
const secret_key = "1234567890";
const Razorpay = require("razorpay");
const razorpay = new Razorpay({
  key_id: "rzp_test_hVQ4dKF2zGGo1o",
  key_secret: "ltKMwciejIhdNTPvwjOkbo9g",
});

exports.Order = async (req, res) => {
  const {key_id, key_secret} = req.body;
  const razorpay = new Razorpay({
    key_id: req.body.key_id,
    key_secret: req.body.key_secret,
  });
  console.log("keyId & keySecret", key_id, key_secret);
  const options = {
    amount: 100,
    currency: "USD",
    receipt: "any unique id for every order",
    payment_capture: 1,
  };
  try {
    const response = await razorpay.orders.create(options);
    res.json({
      order_id: response.id,
      currency: response.currency,
      amount: response.amount,
    });
  } catch (err) {
    res.status(400).send("Not able to create order.Please try again!!");
  }
};

exports.paymentMethod = async (req, res) => {
  const data = crypto.createHmac("sha256", secret_key);
  data.update(JSON.stringify(req.body));

  const digest = data.digest("hex");

  console.log("digest  line 41", digest);
  if (digest === req.headers["x-razorpay-signature"]) {
    console.log("request is legit");

    res.json({
      status: "ok",
    });
  } else {
    res.status(400).send("Invalid signature");
  }
};

exports.Refund = async (req, res) => {
  try {
    const options = {
      payment_id: req.body.paymentId,
      amount: req.body.amount,
    };

    const razorpayResponse = await razorpay.Refund(options);
    console.log(" razorpayResponse line ", razorpayResponse);

    res.send("Successful refunded");
  } catch (err) {
    console.log(error);
    res.status(400).send("unable to issues a refund");
  }
};

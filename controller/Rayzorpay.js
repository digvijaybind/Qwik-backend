const Razorpay = require('razorpay')
const dotenv = require("dotenv");
dotenv.config();
const crypto=require('crypto')

exports.CreateOrderId = async (req, res, next) => {

try{
  const razorpay = new Razorpay({
    key_id:process.env.RAYZORPAY_KEY_ID,
    key_secret:process.env.RAYZORPAY_KEY_SECRET,
  });
  const  options = req.body
  const order=await razorpay.orders.create(options)
if(!order){
return res.status(500).send("Error");
}else{
  console.log(order);
  res.send({order:order})
}
} 
  catch (error) {
    throw new Error(error);
  }
};
 
exports.VerifyPayment=async (req, res, next) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
  req.body;
  try {
    const sha = crypto.createHmac("sha256", process.env.RAYZORPAY_KEY_SECRET);
    sha.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const digest = sha.digest("hex");
    if (digest !== razorpay_signature) {
      return res.status(400).json({ msg: "Transaction is not legit!" });
    }
    res.json({
      msg: "success",
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
    });
    
  } catch (error) {

    
  }
}
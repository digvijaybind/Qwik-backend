var instance = new Razorpay({
  key_id:process.env.RAYZORPAY_KEY_ID,
  key_secret:process.env.RAYZORPAY_KEY_SECRET,
});

module.exports={instance}
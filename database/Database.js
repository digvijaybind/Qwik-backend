require('dotenv').config();

const mongoose = require("mongoose");

mongoose
  .connect(
    process.env.MONGODB_URL,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => {
    console.log("Connect Suucessfully");
  })
  .catch((err) => {
    console.log("err", err);
  });

module.exports = mongoose;

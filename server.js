const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const cookieSession = require("cookie-session");
const app = express();
const axios = require("axios");
const OperatorRouter = require("./routes/Operator-Router");
const CustomerRouter = require("./routes/Customer-Router");
const EquiryRouter = require("./routes/ConfirmEquiry-Router");
const AdminRouter = require("./routes/Admin-Router");
const cookieParser = require("cookie-parser");
const errorMiddleware = require("./middleware/error-middleware");
const dotenv = require("dotenv");
const listEndpoints = require("express-list-endpoints");
const { getAllAirports } = require("./configs/allAirports");
require("./database/Database");
dotenv.config();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.use(
  cookieSession({
    name: "sample-session",
    keys: ["COOKIE_SECRET"],
    httpOnly: true,
  })
);
// const corsOption = {
//   credentials: true,
//   origin: [
//     "http://localhost:3000",
//     "http://localhost:8080",
//     "http://localhost:8000",

//   ],
// };
const corsOptions = {origin: process.env.ALLOW_ORIGIN};
app.use(cors(corsOptions));
app.use(cors());
app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(cookieParser());
app.get("/", (req, res) => {
  res.send("Hello node API");
});



app.get("/all-airports", async (req, res) => {
  try {
    const airport = await getAllAirports(req);
    console.log("airport", airport);
    res.json(
      // airport.map((airport) => ({
      //   // airport_id: airport.airport_id,
      //   // country_name: airport.country_name,
      //   // icao: airport.icao,
      //   // city_name: airport.city_name,
      // }))
      airport
    );
  } catch (error) {
    console.error(error);

    res.status(500).json({error: "Error fetching aircraft data"});
  }
});

// app.get("/Customeradmin", (req, res) => {
//   res.send("Hello this is");
// });

app.get("/blog", (req, res) => {
  res.send("Hello bog is running");
});

app.use("/admin", AdminRouter);
app.use("/operator", OperatorRouter);
app.use("/customer", CustomerRouter);
app.use("/equiry", EquiryRouter);

app.use(errorMiddleware);

app.listen(8000, () => {
  console.log("node API app is running on port 8000");
});

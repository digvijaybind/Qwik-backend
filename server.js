const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieSession = require("cookie-session");
const app = express();
const axios = require("axios");
const OperatorRouter = require("./routes/Operator-Router");
const CustomerRouter = require("./routes/Customer-Router");
const AdminRouter = require("./routes/Admin-Router");
const cookieParser = require("cookie-parser");
const errorMiddleware = require("./middleware/error-middleware");
const dotenv = require("dotenv");
require("./database/Database");
dotenv.config();
const { Operator, AircraftOPerator } = require("./db/Operator");
const CustomerController=require("./controller/C-Customer")
const NodeGeocoder = require("node-geocoder");
const geocoder = NodeGeocoder({
  provider: 'google', // Use the Google Maps Geocoding API
  apiKey: 'AIzaSyCZnNZ9-uHBg0rj8YHKHQC25jHWqXP9Yoc', // Replace with your actual API key
});


app.use(
  cookieSession({
    name: "sample-session",
    keys: ["COOKIE_SECRET"],
    httpOnly: true,
  })
);
const corsOption = {
  credentials: true,
  origin: [
    "http://localhost:3000",
    "http://localhost:8080",
    "http://localhost:8000",
  ],
};
app.use(cors(corsOption));
app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(cookieParser());
app.get("/", (req, res) => {
  res.send("Hello node API");
});


app.post('/calculateFlightTime', async (req, res) => {
  const requestData = {
    departure_airport: req.body.departure_airport,
    arrival_airport:req.body.arrival_airport,
    aircraft: req.body.aircraft,
    airway_time: req.body.airway_time,
    great_circle_distance:true, 
    advise_techstop:true
  };

  try {
    // Call the Aviapages API to calculate flight time using requestData
    const flightTime = await CustomerController.calculateFlightTime(requestData);

    res.json(flightTime);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});




app.get('/all-airports', async (req, res) => {
  try {
    const searchCity = req.query.search_city; // Get the search_city query parameter from the request

    const response = await axios.get('https://dir.aviapages.com/api/airports/', {
      headers: {
        'accept': 'application/json',
        'Authorization': process.env.AVID_API_TOKEN, // Replace 'your_token_here' with your actual token
      },
      params: {
        search_city: searchCity, // Include the search_city query parameter in the request
      },
    });

    if (response.status === 200) {
      const airports = response.data.results.map(airport => ({
        city_name: airport.city_name,
        icao: airport.icao,
      }));

      res.json(airports);
    } else {
      res.status(response.status).json({ error: 'Failed to fetch airport data' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching airport data' });
  }
});


async function getAllCrafts() {
  let allAirCrafts = [];
  let nextPage = 'https://dir.aviapages.com/api/aircraft/';

  while (nextPage) {
    try {
      const response = await axios.get(nextPage, {
        headers: {
          'accept': 'application/json',
          'Authorization': process.env.AVID_API_TOKEN,
        },
      });

      if (response.status === 200) {
        const pageData = response.data.results;
        allAirCrafts = allAirCrafts.concat(pageData);
        nextPage = response.data.next;
      } else {
        console.error('Failed to fetch aircraft data');
        break;
      }
    } catch (error) {
      console.error('Error fetching aircraft data');
      break;
    }
  }

  return allAirCrafts;
}

app.get('/all-airCrafts', async (req, res) => {
  try {
    const aircraft = await getAllCrafts();

    res.json(aircraft.map(aircraft => ({
      aircraft_id: aircraft.aircraft_id,
      aircraft_type_name: aircraft.aircraft_type_name,
    })));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching aircraft data' });
  }
});





app.get("/blog", (req, res) => {
  res.send("Hello bog is running");
});
app.use("/customer", CustomerRouter);
app.use("/operator", OperatorRouter);
app.use("/admin", AdminRouter);

app.use(errorMiddleware);

app.listen(3000, () => {
  console.log("node API app is running on port 3000");
});

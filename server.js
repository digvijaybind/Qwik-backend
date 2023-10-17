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

// async function getAllAirports() {
//   let allAirports = [];
//   let nextPage = 'https://dir.aviapages.com/api/airports/';

//   while (nextPage) {
//     try {
//       const response = await axios.get(nextPage, {
//         headers: {
//           'accept': 'application/json',
//           'Authorization':process.env.AVID_API_TOKEN, 
//         },
//       });

//       if (response.status === 200) {
//         const pageData = response.data.results;
//         allAirports = allAirports.concat(pageData);
//         nextPage = response.data.next;
//       } else {
//         console.error('Failed to fetch airport data');
//         break;
//       }
//     } catch (error) {
//       console.error('Error fetching airport data');
//       break;
//     }
//   }

//   return allAirports;
// }

// app.get('/all-airports', async (req, res) => {

//   try {
//     const airports = await getAllAirports(cityNameParam);
//     res.json(airports.map(airport => ({
      
//       city_name: airport.city_name,
//       icao: airport.icao,
//     })));
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Error fetching airport data' });
//   }
// });

// app.get('/all-airports', async (req, res) => {
//   try {
//     const response = await axios.get('https://dir.aviapages.com/api/airports/', {
//       headers: {
//         'accept': 'application/json',
//         'Authorization':process.env.AVID_API_TOKEN, // Replace 'your_token_here' with your actual token
//       },
//     });

//     if (response.status === 200) {
//       const airports = response.data.results.map(airport => ({
//         city_name: airport.city_name,
//         icao: airport.icao,
//       }));

//       res.json(airports);
//     } else {
//       res.status(response.status).json({ error: 'Failed to fetch airport data' });
//     }
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Error fetching airport data' });
//   }
// });

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




async function fetchAviapagesResponse(requestData) {
  try {
    const aviapagesApiConfig = {
      method: 'post',
      url: 'https://frc.aviapages.com/flight_calculator/',
      headers: {
        'Content-Type': 'application/json',
        Authorization: process.env.AVID_API_TOKEN, // Replace with your Aviapages API token
      },
      data: requestData,
    };
    console.log(aviapagesApiConfig);


    const response = await axios(aviapagesApiConfig);

    if (response.status === 200) {
      return response.data;
    } else {
      throw new Error('Failed to fetch Aviapages response');
    }
  } catch (error) {
    throw error;
  }
}

async function getLatLonFromLocation(location) {
  try {
    const result = await geocoder.geocode(location);
    if (result.length > 0) {
      return { lat: result[0].latitude, lon: result[0].longitude };
    } 
  } catch (error) {
    throw error;
  }
}

function haversineDistance(lat1, lon1, lat2, lon2) {
  // Radius of the Earth in kilometers
  const R = 6371;

  // Convert latitude and longitude from degrees to radians
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);

  // Haversine formula
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

async function calculateNearestOperator(requestData) {
  try {
    // Fetch the Aviapages response
    const aviapagesResponse = await fetchAviapagesResponse(requestData);
    const departureAirportCode = aviapagesResponse.airport.departure_airport;

    // Get latitude and longitude for the departure airport
    const departureAirportLocation = await getLatLonFromLocation(departureAirportCode);

    // Retrieve aircraft operators from MongoDB
    const aircraftOperators = await  AircraftOPerator.find();
    console.log(aircraftOperators)

    // Calculate distances for each operator
    const operatorsWithDistance = await Promise.all(aircraftOperators.map(async (operator) => {
      try {
        const operatorLocation = await getLatLonFromLocation(operator.location);

        const distance = haversineDistance(
          operatorLocation.lat,
          operatorLocation.lon,
          departureAirportLocation.lat,
          departureAirportLocation.lon
        );

        // Calculate time in hours based on distance and aircraft speed
        const timeHours = distance / (operator.speed || 1);
        return { operator, distance, timeHours};
      } catch (error) {
     
        return null;
      }
    }));

    // Filter out null results (locations not found)
    const validOperatorsWithDistance = operatorsWithDistance.filter((result) => result !== null);


    // Find the operator with the minimum distance
    const nearestOperator = validOperatorsWithDistance.reduce((min, p) => (p.distance < min.distance ? p : min), validOperatorsWithDistance[0]);

    return nearestOperator;
  } catch (error) {
    throw error;
  }
}



app.post('/calculateNearestOperator', async (req, res) => {
  const { departure_airport, arrival_airport, aircraft } = req.body;
  const requestData = {
    departure_airport, 
    arrival_airport, 
    aircraft, 
    airway_time:true,
    great_circle_distance: true,
    advise_techstop: true,
  };

  try {
    const nearestOperator = await calculateNearestOperator(requestData);
       
        if (nearestOperator === null) {
          res.json({ error: 'No nearest distance to the departure location' });
        } else {
          // Return the nearest operator to the client
          res.json(nearestOperator);
        }

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


app.get("/calculateDistance", async (req, res) => {
  try {
    const apiResponse = await CustomerController.calculateDistance();
    const calculatedValues = CustomerController.calculateValues(apiResponse);
    // Send the calculated values as a JSON response
    res.json(calculatedValues);
  } catch (error) {
    res.status(500).json({ error: error.message });
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

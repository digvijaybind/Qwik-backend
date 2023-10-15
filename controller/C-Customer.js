
const {Customer} = require("../db/Customer");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {check, validationResult} = require("express-validator");
const axios = require('axios');
const { buildRequestConfig } = require('../configs/aviapi.config');
const { Operator, AircraftOPerator } = require("../db/Operator");
const NodeGeocoder = require("node-geocoder");
const geocoder = NodeGeocoder({
  provider: 'google', // Use the Google Maps Geocoding API
  apiKey: 'AIzaSyCZnNZ9-uHBg0rj8YHKHQC25jHWqXP9Yoc', // Replace with your actual API key
});

exports.Register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({errors: errors.array()});
  }
  const {email, password, contact_number} = req.body;

  try {
    const existingUser = await Customer.findOne({email});

    if (existingUser) {
      return res.status(400).json({message: "User is already exist"});
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new Customer({
      email,
      password: hashedPassword,
    });
    await user.save();

    res.status(201).json({message: "User register succesfully"});
  } catch (error) {
    console.error(error);
    res.status(500).json({message: "Internal server error"});
  }
};

exports.Login = async (req, res) => {
  const {email, password} = req.body;
  console.log(email, password);
  try {
    const user = await Customer.findOne({email});

    if (!user) {
      return res.status(401).json({message: "Customer not found"});
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({message: "Authcation is failed"});
    }

    const token = jwt.sign({userId: user._id}, "auth", {
      expiresIn: "1d",
    });

    res.json({token});
  } catch (error) {
    console.log(error);
    res.status(500).json({message: "Internal server Error"});
  }
};





exports.calculateFlightTime = async (req, res) => {
  const {From, To, Aircraft} = req.body;
  let from = From.toString();
  let to = To.toString();
  let aircraft=Aircraft.toString()

  let data = `{"departure_airport": "${from}", "arrival_airport": "${to}", "aircraft": "${aircraft}", "airway_time": true, "advise_techstops": true}\r\n`;
  async function calculateNearestOperator() {
    try {
    
    
      const departureAirportCode = From
  
      // Get latitude and longitude for the departure airport
      const departureAirportLocation = await getLatLonFromLocation(departureAirportCode);
  
      // Retrieve aircraft operators from MongoDB
      const aircraftOperators = await  AircraftOPerator.find();
      console.log(aircraftOperators)


      const validAircraftOperators = aircraftOperators.filter((operator) => operator.Aircraft_type === aircraft);

      // Calculate distances for each operator
      const operatorsWithDistance = await Promise.all(validAircraftOperators.map(async (operator) => {
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

      // Sort the valid operators by distance in ascending order
      validOperatorsWithDistance.sort((a, b) => a.distance - b.distance);
      
      return validOperatorsWithDistance;
    } catch (error) {
      throw error;
    }
  }
  
  try {
    const nearestOperator = await calculateNearestOperator();
    if (nearestOperator === null) {
      res.json({ error: 'No nearest distance to the departure location' });
    } else {
      console.log("everything works")
    }
    const response = await axios(buildRequestConfig(data));
    console.log(response.data);
    if (!response.data.airport.techstop[0]) {
      //when techstop not coming
      const total_time = response.data.time.airway;
      return total_time;
    } else {
      // if coming then
      let data = `{"departure_airport": "${from}", "arrival_airport": "${response.data.airport.techstop[0]}", "aircraft": "${aircraft}", "airway_time": true, "advise_techstops": true}\r\n`;
      console.log("First Tech halts", response.data.airport.techstop[0]);

      const responseTech = await axios(buildRequestConfig(data));
      console.log("secondtime", responseTech.data.airport.techstop[0]);
      if (!responseTech.data.airport.techstop[0]) {
        // console.log(responseTech.data.airport.techstop[0])
        const total_time_tech = response.data.time.airway;
        return total_time_tech;
      } else {
        let data = `{"departure_airport": "${from}", "arrival_airport": "${responseTech.data.airport.techstop[0]}", "aircraft": "${aircraft}", "airway_time": true, "advise_techstops": true}\r\n`;
        const responseTech_tech2 = await axios(buildRequestConfig(data));
        const Time1To2 = responseTech_tech2.data.time.airway ;
        // res.status(200).json({data: Time1To2});
        console.log("Thirdtechhalts", responseTech_tech2.data.time.airway);
        let data2 = `{"departure_airport": "${responseTech.data.airport.techstop[0]}", "arrival_airport": "${response.data.airport.techstop[0]}", "aircraft": "${aircraft}", "airway_time": true, "advise_techstops": true}\r\n`;
        const responseTech_tech3 = await axios(buildRequestConfig(data2));
        const Time2to3 = responseTech_tech3.data.time.airway ;
        console.log("Time2to3", Time2to3);
        let data4 = `{"departure_airport": "${response.data.airport.techstop[0]}", "arrival_airport": "${to}", "aircraft": "${aircraft}", "airway_time": true, "advise_techstops": true}\r\n`;
        const responseTech_tech4 = await axios(buildRequestConfig(data4));
        const Time3to4 = responseTech_tech4.data.time.airway;
        console.log("Time3to4", Time3to4);
        const Total_Internal_time = Time1To2 + Time2to3 + Time3to4;
        // console.log("total Internal time", Total_Internal_time / 60);
        const responseObj = {
          Total_Internal_time: Total_Internal_time / 60, // Assuming you want to convert it to minutes
          nearestOperator,
        };
        res.json(responseObj);
        console.log(
          "total time with tech halt of 45min",
          Total_Internal_time / 60
        );
      }
    }
    return response.data;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to calculate flight time");
  }
};

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



// async function calculateNearestOperator(requestData) {
//   try {
//     // Fetch the Aviapages response
//     const aviapagesResponse = await fetchAviapagesResponse(requestData);
//     const departureAirportCode = aviapagesResponse.airport.departure_airport;

//     // Get latitude and longitude for the departure airport
//     const departureAirportLocation = await getLatLonFromLocation(departureAirportCode);

//     // Retrieve aircraft operators from MongoDB
//     const aircraftOperators = await  AircraftOPerator.find();
//     console.log(aircraftOperators)

//     // Calculate distances for each operator
//     const operatorsWithDistance = await Promise.all(aircraftOperators.map(async (operator) => {
//       try {
//         const operatorLocation = await getLatLonFromLocation(operator.location);

//         const distance = haversineDistance(
//           operatorLocation.lat,
//           operatorLocation.lon,
//           departureAirportLocation.lat,
//           departureAirportLocation.lon
//         );

//         // Calculate time in hours based on distance and aircraft speed
//         const timeHours = distance / (operator.speed || 1);
//         return { operator, distance, timeHours};
//       } catch (error) {
     
//         return null;
//       }
//     }));

//     // Filter out null results (locations not found)
//     const validOperatorsWithDistance = operatorsWithDistance.filter((result) => result !== null);


//     // Find the operator with the minimum distance
//     const nearestOperator = validOperatorsWithDistance.reduce((min, p) => (p.distance < min.distance ? p : min), validOperatorsWithDistance[0]);

//     return nearestOperator;
//   } catch (error) {
//     throw error;
//   }
// }

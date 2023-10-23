require("dotenv").config();
const { Customer } = require("../db/Customer");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const axios = require("axios");
const { buildRequestConfig } = require("../configs/aviapi.config");
const { AircraftOPerator } = require("../db/Operator");
const NodeGeocoder = require("node-geocoder");
const { response } = require("express");
const geocoder = NodeGeocoder({
  provider: "google", // Use the Google Maps Geocoding API
  apiKey: process.env.GOOGLE_API_KEY, // Replace with your actual API key
});

// Registration controller
exports.Register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { email, password } = req.body;

  try {
    const existingUser = await Customer.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "User is already exist" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new Customer({
      email,
      password: hashedPassword,
    });
    await user.save();

    res.status(201).json({ message: "User register succesfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Login controller
exports.Login = async (req, res) => {
  const { email, password } = req.body;
  console.log(email, password);
  try {
    const user = await Customer.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Customer not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Authcation is failed" });
    }

    const token = jwt.sign({ userId: user._id }, "auth", {
      expiresIn: "1d",
    });

    res.json({ token });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server Error" });
  }
};

// Search For Flight Controller
exports.calculateFlightTime = async (req, res) => {
  const { From, To, Aircraft } = req.body;
  let from = From.toString();
  let to = To.toString();
  let aircraft = Aircraft.toString();

  let data =
    `{"departure_airport": "${from}", "arrival_airport": "${to}", "aircraft": "${aircraft}", "airway_time": true, "advise_techstops": true}\r\n`;
  async function calculateNearestOperator() {
    try {
      const departureAirportCode = From;

      // Perform the GET request to fetch airports based on location
      const responseSearch = await axios.get(
        "https://dir.aviapages.com/api/airports/",
        {
          headers: {
            "accept": "application/json",
            "Authorization": process.env.AVID_API_TOKEN,
          },
          params: {
            search: departureAirportCode,
          },
        },
      );

      const aircraftOperators = await AircraftOPerator.find();
      console.log(aircraftOperators);

      const validAircraftOperators = aircraftOperators.filter((operator) =>
        operator.country_name === responseSearch.data.results[0].country_name
      );

      // Calculate distances for each operator
      const operatorsWithDistance = await Promise.all(
        validAircraftOperators.map(async (operator) => {
          try {
            const operatorLocation = await getLatLonFromLocation(
              operator.location,
            );

            const distance = haversineDistance(
              operatorLocation.lat,
              operatorLocation.lon,
              responseSearch.data.results[0].latitude,
              responseSearch.data.results[0].longitude,
            );

            // Calculate time in hours based on distance and aircraft speed
            const timeHours = distance / (operator.speed || 1);

            const requestData = {
              departure_airport: From,
              arrival_airport: operator.icao,
              aircraft: aircraft,
              airway_time: true,
              great_circle_distance: true,
              advise_techstop: true,
            };

            const aviapagesApiConfig = {
              method: "post",
              url: "https://frc.aviapages.com/flight_calculator/",
              headers: {
                "Content-Type": "application/json",
                Authorization: process.env.AVID_API_TOKEN,
              },
              data: requestData,
            };

            const response = await axios(aviapagesApiConfig);

            // assigning a new value to the response airway time by dividing the existing airway by 60
            response.data.time.airway = response.data.time.airway / 60;
            console.log("nearest operator airway time is",response.data?.time.airway)
            return {
              operator,
              distance,
              timeHours,
              aviapagesResponse: response.data,
            };
          } catch (error) {
            return null;
          }
        }),
      );


      // Filter out null results (locations not found)
      const validOperatorsWithDistance = operatorsWithDistance.filter((
        result,
      ) => result !== null);

      // Sort the valid operators by distance in ascending order
      validOperatorsWithDistance.sort((a, b) => a.distance - b.distance);

      return validOperatorsWithDistance.slice(0, 5);
    } catch (error) {
      throw error;
    }
  }

  try {
    const nearestOperator = await calculateNearestOperator();
    console.log(nearestOperator);
    if (nearestOperator === null) {
      res.json({ error: "No nearest distance to the departure location" });
    } else {
      console.log("everything works");
    }

    const response = await axios(buildRequestConfig(data));
    console.log("response is " + response.data);

    if (
      !response.data.airport.techstop ||
      response.data.airport.techstop.length === 0
    ) {
      const totalTimeFromToto = response.data.time.airway / 60;
      const nearestOperatorWithPrice = nearestOperator.map((operator) => ({
        ...operator,
            totalTime:operator.aviapagesResponse.time.airway + totalTimeFromToto,
            price: operator.operator.charges_per_hour *(operator.aviapagesResponse.time.airway + totalTimeFromToto)
      }));

      //when techstop not coming
   
      const responseObj = {
 
        nearestOperatorWithPrice,
      };
      return res.json(responseObj);
    }

  else {
    // Tech stops are available
 
    let totalTechStopTime = 0;
    let previousAirport = from;
    let techStopAirportDetails = [];
    let techStopAirport; // Declare techStopAirport here
    let lastTechStopAirport; 
    for (let i = 0; i < response.data.airport.techstop.length; i++) {
        techStopAirport = response.data.airport.techstop[i];
        techStopAirportDetails.push(techStopAirport);
        previousAirport = techStopAirport;
    
        if (i === 0) {
            let techStopData = `{
                "departure_airport": "${from}",
                "arrival_airport": "${techStopAirport}",
                "aircraft": "${aircraft}",
                "airway_time": true,
                "advise_techstops": true
            }`;
    
            let techStopResponse = await axios(buildRequestConfig(techStopData));
            console.log("techStopResponse", techStopResponse.data);
    
            while (techStopResponse.data.time.airway == null) {
                if (techStopResponse.data.airport.techstop.length > 0) {
                    // If tech stops are suggested, pick the first one
                    techStopAirport = techStopResponse.data.airport.techstop[0];
                    techStopData = `{
                        "departure_airport": "${previousAirport}",
                        "arrival_airport": "${techStopAirport}",
                        "aircraft": "${aircraft}",
                        "airway_time": true,
                        "advise_techstops": true
                    }`;
    
                    techStopResponse = await axios(buildRequestConfig(techStopData));
                    console.log("techStopResponse", techStopResponse.data);
                } else {
                    // No tech stops are suggested
                    lastTechStopAirport = previousAirport;
                    break;
                }
            }
    
            if (techStopResponse.data.time.airway != null) {
                const techStopTime = techStopResponse.data.time.airway;
                totalTechStopTime += techStopTime;
            
            }
        }
    }
    
    // Calculate time for the final leg of the journey
  
      const finalLegData = `{
        "departure_airport": "${lastTechStopAirport}", // Use the last tech stop as the departure
        "arrival_airport": "${to}",
        "aircraft": "${aircraft}",
        "airway_time": true,
        "advise_techstops": true
    }`;
    
    
    const finalLegResponse = await axios(buildRequestConfig(finalLegData));
    console.log("finalLegResponse", finalLegResponse.data);
    
    if (!finalLegResponse.data.airport.techstop || finalLegResponse.data.airport.techstop.length === 0) {
        const finalLegTime = finalLegResponse.data.time.airway;
        totalTechStopTime += finalLegTime;
    } else {
        // Tech stops are suggested, pick the first one
        techStopAirport = finalLegResponse.data.airport.techstop[0];
        let techStopData = `{
            "departure_airport": "${techStopAirport}",
            "arrival_airport": "${to}",
            "aircraft": "${aircraft}",
            "airway_time": true,
            "advise_techstops": true
        }`;
    
        let techStopResponse = await axios(buildRequestConfig(techStopData));
        console.log("finalLeg TechStopResponse", techStopResponse.data);
    
        while (techStopResponse.data.time.airway == null) {
            if (techStopResponse.data.airport.techstop.length > 0) {
                // If tech stops are suggested, pick the first one
                techStopAirport = techStopResponse.data.airport.techstop[0];
                techStopData = `{
                    "departure_airport": "${techStopAirport}",
                    "arrival_airport": "${to}",
                    "aircraft": "${aircraft}",
                    "airway_time": true,
                    "advise_techstops": true
                }`;
    
                techStopResponse = await axios(buildRequestConfig(techStopData));
                console.log("finalLeg TechStopResponse", techStopResponse.data);
            } else {
                // No tech stops are suggested
                break;
            }
        }
    
        if (techStopResponse.data.time.airway != null) {
            const finalLegTime = techStopResponse.data.time.airway;
            totalTechStopTime += finalLegTime;
        }
    }
    
 
    
    // Rest of your code...
    
    
//     let totalTechStopTime = 0;
//     let previousAirport = from;
//     let techStopAirportDetails = [];
  
//     for (let i = 0; i < response.data.airport.techstop.length; i++) {
//       const techStopAirport = response.data.airport.techstop[i];
//       techStopAirportDetails.push(techStopAirport);
  
//       previousAirport = techStopAirport;
  
//       if (i === 0) {
//         // Only make a request for the first tech stop
//         let techStopData = `{
//           "departure_airport": "${from}",
//           "arrival_airport": "${techStopAirport}",
//           "aircraft": "${aircraft}",
//           "airway_time": true,
//           "advise_techstops": true
//         }`;
  
//         const techStopResponse = await axios(buildRequestConfig(techStopData));
//   console.log("techStopResponse", techStopResponse.data)
//         if (!techStopResponse.data.airport.techstop || techStopResponse.data.airport.techstop.length === 0) {
//           const techStopTime = techStopResponse.data.time.airway;
//           totalTechStopTime += techStopTime;
//         }
//       }

//     }
  
//     // Calculate time for the final leg of the journey
//     const finalLegData = `{
//       "departure_airport": "${previousAirport}",
//       "arrival_airport": "${to}",
//       "aircraft": "${aircraft}",
//       "airway_time": true,
//       "advise_techstops": true
//     }`;
  
//     const finalLegResponse = await axios(buildRequestConfig(finalLegData));
//   console.log("finalLegResponse", finalLegResponse.data)
//     if (!finalLegResponse.data.airport.techstop || finalLegResponse.data.airport.techstop.length === 0) {
//       const finalLegTime = finalLegResponse.data.time.airway;
//       totalTechStopTime += finalLegTime;
//     }
  
// console.log(totalTechStopTime)
//     const totalTimeFromToto = (response.data.time.airway + totalTechStopTime) / 60;
//     console.log("Total time from FRom to To with techall", totalTimeFromToto)

//     const nearestOperatorWithPrice = nearestOperator.map((operator) => ({
//       ...operator,
//       totalTime:operator.aviapagesResponse.time.airway + totalTimeFromToto,
//       NormalPrice: operator.operator.charges_per_hour *
//         (operator.aviapagesResponse.time.airway + totalTimeFromToto),
//       techStopAirport: {
//         techStopAirportDetails: techStopAirportDetails,
//         EachtechStopTime: `${0.75}hour / 45minute`,
//         SelectedtechStop:techStopAirportDetails[0],
//         SelectedTechStopTime: `${0.75}hour `,
//         EachtechStopCost: `${50000}rs`,
      
//       },
//       TotalPriceWithDSelectedTechStop: (operator.operator.charges_per_hour *
//         (operator.aviapagesResponse.time.airway + totalTimeFromToto  + 0.75)) + 50000,
    
//     }));
    
//     const responseObj = {
//       nearestOperatorWithPrice,
//       TechStops: techStopAirportDetails, // Include all tech stops in the response
//     };
//     res.json(responseObj);
  
   
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

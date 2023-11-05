require("dotenv").config();
const NodeCache = require('node-cache');
const { Customer } = require("../db/Customer");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const axios = require("axios");
const { buildRequestConfig } = require("../configs/aviapi.config");
const { AircraftOPerator } = require("../db/Operator");
const NodeGeocoder = require("node-geocoder");
const geocoder = NodeGeocoder({
  provider: "google", // Use the Google Maps Geocoding API
  apiKey: process.env.GOOGLE_API_KEY, // Replace with your actual API key
});


const path = require('path'); // If you need to read the JSON file


// Fresh all AirCraft into use
const aircraftDataPath = path.join(__dirname, '../database/customaircfat.json');
const AirCraftDataArray = require(aircraftDataPath);
console.log(AirCraftDataArray)



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


// Initialize a cache with a longer TTL (30 days)
const myCache = new NodeCache({ stdTTL: 30 * 24 * 60 * 60, checkperiod: 120 });

const EventEmitter = require('events');
const TLSSocket = require('tls').TLSSocket;

class MyTLSSocket extends TLSSocket {
  constructor() {
    super();

    // Create an EventEmitter object to manage the listeners
    this.emitter = new EventEmitter();
  }

  on(event, listener) {
    // Add the listener to the EventEmitter object
    this.emitter?.on(event, listener);
  }

  removeListener(event, listener) {
    // Remove the listener from the EventEmitter object
    this.emitter.removeListener(event, listener);
  }

  close() {
    // Call the close() method on the TLSSocket object
    super.end();

    // Emit the 'close' event on the EventEmitter object
    this.emitter.emit('close');
  }
}

// Initialize the TLSSocket object by creating an instance of MyTLSSocket
const tlsSocket = new MyTLSSocket();

// Add a listener to the 'close' event on the EventEmitter object
tlsSocket.on('close', () => {
  console.log('Socket closed');
});

// Simulate a close event
tlsSocket.close();




exports.calculateFlightTime = async (req, res) => {
  const { From, To, Aircraft } = req.body;
  let from = From.toString();
  let to = To.toString();
  let aircraft = Aircraft.toString();

  let data = `{"departure_airport": "${from}", "arrival_airport": "${to}", "aircraft": "${aircraft}", "airway_time": true, "advise_techstops": true}\r\n`;

  async function fetchAirportData(departureAirportCode) {
    const cacheKey = `airportData_${departureAirportCode}`;
    const cachedData = myCache.get(cacheKey);

    if (cachedData) {
      return cachedData;
    }
    const tlsSocket = new MyTLSSocket();

    tlsSocket.on('close', () => {
      // Remove the listener to avoid memory leaks
      tlsSocket.emitter.removeListener('close', () => {
        // ...
      });
    });
    const responseSearch = await axios.get("https://dir.aviapages.com/api/airports/", {
      headers: {
        "accept": "application/json",
        "Authorization": process.env.AVID_API_TOKEN,
      },
      params: {
        search: departureAirportCode,
      },
      socket: tlsSocket
    });

    myCache.set(cacheKey, responseSearch.data, 30 * 24 * 60 * 60); // Cache the response for 30 days
    return responseSearch.data;
  }

  async function calculateFlightCost(departureAirport, operatorIcao, aircraft) {
    const cacheKey = `flightCost_${departureAirport}_${operatorIcao}_${aircraft}`;
    const cachedData = myCache.get(cacheKey);

    if (cachedData) {
      return cachedData;
    }

    const tlsSocket = new MyTLSSocket();

    tlsSocket.on('close', () => {
      // Remove the listener to avoid memory leaks
      tlsSocket.emitter.removeListener('close', () => {
        // ...
      });
    });
    const requestData = {
      departure_airport: departureAirport,
      arrival_airport: operatorIcao,
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
      socket: tlsSocket
    };

    const response = await axios(aviapagesApiConfig);

    response.data.time.airway = response.data.time.airway / 60;
    myCache.set(cacheKey, response.data, 30 * 24 * 60 * 60); // Cache the response for 30 days
    return response.data;
  }

  async function calculateNearestOperator() {
    try {
      const departureAirportCode = From;

      // Fetch airport data with caching
      const responseSearch = await fetchAirportData(departureAirportCode);

      const aircraftOperators = await AircraftOPerator.find();
      console.log(aircraftOperators);

      const validAircraftOperators = aircraftOperators.filter((operator) =>
        operator.country_name === responseSearch.results[0].country_name
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
              responseSearch.results[0].latitude,
              responseSearch.results[0].longitude,
            );

            const timeHours = distance / (operator.speed || 1);

            // Fetch flight cost with caching
            const aviapagesResponse = await calculateFlightCost(From, operator.icao, aircraft);

            return {
              operator,
              distance,
              timeHours,
              aviapagesResponse: aviapagesResponse,
            };
          } catch (error) {
            return null;
          }
        }),
      );

      const validOperatorsWithDistance = operatorsWithDistance.filter((result) => result !== null);
      validOperatorsWithDistance.sort((a, b) => a.distance - b.distance);

      return validOperatorsWithDistance.slice(0, 5);
    } catch (error) {
      throw error;
    }
  }

  try {
    const nearestOperator = await calculateNearestOperator();

    if (nearestOperator === null) {
      res.json({ error: "No nearest distance to the departure location" });
    } else {
      console.log("everything works");
    }

    const response = await axios(buildRequestConfig(data));
    console.log("response is " + response.data);

    if (!response.data.airport.techstop || response.data.airport.techstop.length === 0) {
      const totalTimeFromToto = response.data.time.airway / 60;
      console.log(totalTimeFromToto);
      const nearestOperatorWithPrice = nearestOperator.map((operator) => ({
        ...operator,
        totalTime: operator.aviapagesResponse.time.airway + totalTimeFromToto,
        price: operator.operator.charges_per_hour *
          (operator.aviapagesResponse.time.airway + totalTimeFromToto),
        totalPriceWithAdminMargin: (operator.operator.charges_per_hour *
          (operator.aviapagesResponse.time.airway + totalTimeFromToto)) + ((operator.operator.charges_per_hour *
            (operator.aviapagesResponse.time.airway + totalTimeFromToto)) * ((operator.operator.margin) / 100))
      }));

      const responseObj = {
        nearestOperatorWithPrice,
      };

      return res.json(responseObj);
    }

    else {
      // for getting at least max techstop during the journey 
      let selectedTechStops = []
      let finalLegAverageSpeedTime;
      let techStopAirportDetails = [];
      let techStopAirport;
      let finalLegTechStopDepatureOne;

      for (let i = 0; i < response.data.airport.techstop.length; i++) {
        techStopAirport = response.data.airport.techstop[i];
        techStopAirportDetails.push(techStopAirport);
        previousAirport = techStopAirport;

        if (i === 0) {
          let techStopData = `{
            "departure_airport": "${from}",
            "arrival_airport": "${to}",
            "aircraft": "${aircraft}",
            "airway_time": true,
            "advise_techstops": true
          }`;

          let techStopResponse = await axios(buildRequestConfig(techStopData));
          let techStopAirport = techStopResponse.data.airport.techstop;
          techStopAirportDetails.push(techStopAirport)

          console.log("techStopResponse", techStopResponse.data);

          while (techStopResponse.data.time.airway == null) {
            if (techStopResponse.data.airport.techstop.length > 0) {
              techStopAirport = techStopResponse.data.airport.techstop[0];


              techStopData = `{
                "departure_airport": "${From}",
                "arrival_airport": "${techStopAirport}",
                "aircraft": "${aircraft}",
                "airway_time": true,
                "advise_techstops": true
              }`;

              techStopResponse = await axios(buildRequestConfig(techStopData));
              console.log("techStopResponse", techStopResponse.data);
            } else {
              break;
            }
          }

          if (techStopResponse.data.time.airway != null) {
            firstLegTime = techStopResponse.data.time.airway;
            console.log("firstLeg", firstLegTime);
            finalLegTechStopDepatureOne = techStopResponse.data.airport.arrival_airport;
            if (techStopResponse.data.airport.arrival_airport != to) {
              selectedTechStops.push(techStopResponse.data.airport.arrival_airport);
            }

          }
        }
      }


      // Define the continueJourney function
      async function continueJourneypartOne(fromAirport, toAirport, aircraft) {



        if (finalLegTechStopDepatureOne !== toAirport) {
          const techStopData = `{
      "departure_airport": "${fromAirport}",
      "arrival_airport": "${toAirport}",
      "aircraft": "${aircraft}",
      "airway_time": true,
      "advise_techstops": true
    }`;

          const techStopResponse = await axios(buildRequestConfig(techStopData));
          console.log("Tech Stop Response", techStopResponse.data);

          if (
            techStopResponse.data.airport.techstop &&
            techStopResponse.data.airport.techstop.length > 0
          ) {
            // If tech stops are suggested, pick the first one
            const nextTechStop = techStopResponse.data.airport.techstop[0];
            // totalTechStopTime += techStopResponse.data.time.airway;

            // Calculate airway time from lastTechStopDepature to nextTechStop
            const airwayTimeData = `{
        "departure_airport": "${finalLegTechStopDepatureOne}",
        "arrival_airport": "${nextTechStop}",
        "aircraft": "${aircraft}",
        "airway_time": true,
        "advise_techstops": false
      }`;

            const airwayTimeResponse = await axios(buildRequestConfig(airwayTimeData));
            console.log("Airway Time Responsee", airwayTimeResponse.data);

            // Update the finalLegTechStopDepature
            finalLegTechStopDepatureOne = nextTechStop;
            if (airwayTimeResponse.data.time.airway != null) {

              console.log("firstLeg", firstLegTime);
              finalLegTechStopDepatureOne = airwayTimeResponse.data.airport.arrival_airport;
              if (airwayTimeResponse.data.airport.arrival_airport != to) {
                selectedTechStops.push(airwayTimeResponse.data.airport.arrival_airport);
              }
              console.log("finalLegTechStopDepatureOneo", finalLegTechStopDepatureOne)
            }
          }

        }

        // console.log("Total Tech Stop Timeeee:", totalTechStopTime);
        console.log("Final Destinationww:", toAirport);

        async function continueJourneypartTwo(fromAirport, toAirport, aircraft) {

          let totalTechStopTime = 0;

          if (finalLegTechStopDepatureOne !== toAirport) {
            const techStopData = `{
          "departure_airport": "${fromAirport}",
          "arrival_airport": "${toAirport}",
          "aircraft": "${aircraft}",
          "airway_time": true,
          "advise_techstops": true
        }`;

            const techStopResponse = await axios(buildRequestConfig(techStopData));
            console.log("Tech Stop Response", techStopResponse.data);

            if (
              techStopResponse.data.airport.techstop &&
              techStopResponse.data.airport.techstop.length > 0
            ) {
              // If tech stops are suggested, pick the first one
              const nextTechStop = techStopResponse.data.airport.techstop[0];
              totalTechStopTime += techStopResponse.data.time.airway;

              // Calculate airway time from lastTechStopDepature to nextTechStop
              const airwayTimeData = `{
            "departure_airport": "${finalLegTechStopDepatureOne}",
            "arrival_airport": "${nextTechStop}",
            "aircraft": "${aircraft}",
            "airway_time": true,
            "advise_techstops": false
          }`;

              const airwayTimeResponse = await axios(buildRequestConfig(airwayTimeData));
              getMoreTechstop = airwayTimeResponse
              console.log("Airway Time Responsee2222", airwayTimeResponse.data.airport.techstop);

              // Update the finalLegTechStopDepature
              finalLegTechStopDepatureOne = nextTechStop;
              if (airwayTimeResponse.data.time.airway != null) {

                console.log("firstLeg", firstLegTime);
                finalLegTechStopDepatureOne = airwayTimeResponse.data.airport.arrival_airport;
                if (airwayTimeResponse.data.airport.arrival_airport != to) {
                  selectedTechStops.push(airwayTimeResponse.data.airport.arrival_airport)
                }
                console.log("finalLegTechStopDepatureOne", finalLegTechStopDepatureOne)
              }
            }

          }

          console.log("Total Tech Stop Timeeee:", totalTechStopTime);
          console.log("Final Destinationww:", toAirport);




        }
        // for knowing the averagespeed from the From to To Location
        async function KnowAverageSpeedTime(fromAirport, toAirport, aircraft) {

          const techStopData = `{
        "departure_airport": "${fromAirport}",
        "arrival_airport": "${toAirport}",
        "aircraft": "${aircraft}",
        "airway_time": true,
        "advise_techstops": true,
        "average_speed_time": true
      }`;

          const techStopResponse = await axios(buildRequestConfig(techStopData));
          finalLegAverageSpeedTime = techStopResponse.data.time.average_speed;
          console.log("Tech Stop Response in while loop", techStopResponse.data);
          console.log("finalLegAverageSpeedTime", finalLegAverageSpeedTime);

          if (techStopResponse.data) {
            const totalTimeFromToto = (finalLegAverageSpeedTime) / 60;
            console.log(totalTimeFromToto);

            const nearestOperatorWithPriceForTechSTopGreaterThanThree = nearestOperator
              .filter(operator => operator.operator.Aircraft_type === 'Challenger 605').map((operator) => ({
                ...operator,
                totalTime: operator.aviapagesResponse.time.airway + totalTimeFromToto,
                techStopAirport: {
                  selectedTechStops: selectedTechStops,
                  techStopTime: `${0.5}hour / 45minute`,
                  techStopCost: `${50000}rs`,
                },
                TotalPriceWithTechStop: (operator.operator.charges_per_hour *
                  (operator.aviapagesResponse.time.airway + totalTimeFromToto + selectedTechStops.length * 0.5)) + selectedTechStops.length * 50000,
                totalPriceWithTechStopAndAdminMargin: (((operator.operator.charges_per_hour *
                  (operator.aviapagesResponse.time.airway + totalTimeFromToto + selectedTechStops.length * 0.5)) + selectedTechStops.length * 50000) + (((operator.operator.charges_per_hour *
                    (operator.aviapagesResponse.time.airway + totalTimeFromToto + selectedTechStops.length * 0.5)) + selectedTechStops.length * 50000) * (operator.operator.margin) / 100))

              }));
            console.log("nearestOperatorWithPriceForTechSTopGreaterThanThree", nearestOperatorWithPriceForTechSTopGreaterThanThree)
            const nearestOperatorWithPrice = nearestOperator.map((operator) => ({
              ...operator,
              totalTime: operator.aviapagesResponse.time.airway + totalTimeFromToto,
              techStopAirport: {
                selectedTechStops: selectedTechStops,
                techStopTime: `${0.5}hour / 45minute`,
                techStopCost: `${50000}rs`,
              },
              TotalPriceWithTechStop: (operator.operator.charges_per_hour *
                (operator.aviapagesResponse.time.airway + totalTimeFromToto + selectedTechStops.length * 0.5)) + selectedTechStops.length * 50000,
              totalPriceWithTechStopAndAdminMargin: (((operator.operator.charges_per_hour *
                (operator.aviapagesResponse.time.airway + totalTimeFromToto + selectedTechStops.length * 0.5)) + selectedTechStops.length * 50000) + (((operator.operator.charges_per_hour *
                  (operator.aviapagesResponse.time.airway + totalTimeFromToto + selectedTechStops.length * 0.5)) + selectedTechStops.length * 50000) * (operator.operator.margin) / 100))

            }));
            if (selectedTechStops.length >= 3) {
              const responseObj = {
                nearestOperatorWithPriceForTechSTopGreaterThanThree,
              };
              console.log("nearestOperator", responseObj);
              return res.json(responseObj);
            } else {
              const responseObj = {
                nearestOperatorWithPrice,
              };
              console.log("nearestOperator", responseObj);
              return res.json(responseObj);
            }

          }

        }
        KnowAverageSpeedTime(from, to, aircraft);
        continueJourneypartTwo(finalLegTechStopDepatureOne, to, aircraft)
        console.log("selectedTechStops", selectedTechStops)
      }

      continueJourneypartOne(finalLegTechStopDepatureOne, to, aircraft)
    }
  } catch (error) {
    console.error(error);
    throw new Error("Failed to calculate flight time");
  }
};



// Search For Flight Controller

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


exports.AirCraftData = async (req, res) => {
  try {
    await AirCraftDataArray
    return res.json({ success: true, message: "AirCraft List found", data: AirCraftDataArray });
  } catch (error) {
    res.json({ success: false, message: error })
  }
}
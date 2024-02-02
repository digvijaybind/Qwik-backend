require("dotenv").config();
const {Customer} = require("../db/Customer");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {validationResult} = require("express-validator");
const axios = require("axios");
const {buildRequestConfig} = require("../configs/aviapi.config");
const {AircraftOPerator} = require("../db/Operator");
const NodeGeocoder = require("node-geocoder");

const geocoder = NodeGeocoder({
  provider: "google", // Use the Google Maps Geocoding API
  apiKey: process.env.GOOGLE_API_KEY, // Replace with your actual API key
});

const path = require("path"); // If you need to read the JSON file
const {response} = require("express");

// Fresh all AirCraft into use
const aircraftDataPath = path.join(__dirname, "../database/customaircfat.json");
const AirCraftDataArray = require(aircraftDataPath);
console.log(AirCraftDataArray);

// Registration controller
exports.Register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({errors: errors.array()});
  }
  const {email, password} = req.body;

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

// Login controller
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
  const {From, To, Aircraft, Pax, Date} = req.body;
  let from = From.toString();
  let to = To.toString();
  let aircraft = Aircraft.toString();
  let pax = Number(Pax);
  let departure_datetime = Date.toString();

  let data = `{"departure_airport": "${from}", "arrival_airport": "${to}", "aircraft": "${aircraft}", "pax":"${pax}", "departure_datetime":"${departure_datetime}", "airway_time": true, "advise_techstops": true}\r\n`;

  async function fetchAirportData(departureAirportCode) {
    const responseSearch = await axios.get(
      "https://dir.aviapages.com/api/airports/",
      {
        headers: {
          accept: "application/json",
          Authorization: process.env.AVID_API_TOKEN,
        },
        params: {
          search: departureAirportCode,
        },
      }
    );

    return responseSearch.data;
  }

  async function calculateFlightCost(
    departureAirport,
    operatorIcao,
    aircraft,
    pax,
    date
  ) {
    const requestData = {
      departure_airport: departureAirport,
      arrival_airport: operatorIcao,
      aircraft: aircraft,
      pax: pax,
      departure_datetime: date,
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

    response.data.time.airway = response.data.time.airway / 60;
    return response.data;
  }

  async function calculateNearestOperator() {
    try {
      const departureAirportCode = From;

      // Fetch airport data with caching
      const responseSearch = await fetchAirportData(departureAirportCode);

      const aircraftOperators = await AircraftOPerator.find();
      console.log(aircraftOperators);

      const validAircraftOperators = aircraftOperators.filter(
        (operator) =>
          operator.country_name === responseSearch.results[0].country_name
      );

      // Calculate distances for each operator
      const operatorsWithDistance = await Promise.all(
        validAircraftOperators.map(async (operator) => {
          try {
            const operatorLocation = await getLatLonFromLocation(
              operator.location
            );

            const distance = haversineDistance(
              operatorLocation.lat,
              operatorLocation.lon,
              responseSearch.results[0].latitude,
              responseSearch.results[0].longitude
            );

            const timeHours = distance / (operator.speed || 1);

            // Fetch flight cost with caching
            const aviapagesResponse = await calculateFlightCost(
              From,
              operator.icao,
              aircraft
            );

            return {
              operator,
              distance,
              timeHours,
              aviapagesResponse: aviapagesResponse,
            };
          } catch (error) {
            return null;
          }
        })
      );

      const validOperatorsWithDistance = operatorsWithDistance.filter(
        (result) => result !== null
      );
      validOperatorsWithDistance.sort((a, b) => a.distance - b.distance);

      return validOperatorsWithDistance.slice(0, 5);
    } catch (error) {
      throw error;
    }
  }

  try {
    const nearestOperator = await calculateNearestOperator();

    if (nearestOperator === null) {
      res.json({error: "No nearest distance to the departure location"});
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
      console.log(totalTimeFromToto);
      const nearestOperatorWithPrice = nearestOperator.map((operator) => ({
        ...operator,
        totalTime: operator.aviapagesResponse.time.airway + totalTimeFromToto,
        price:
          operator.operator.charges_per_hour *
          (operator.aviapagesResponse.time.airway + totalTimeFromToto),
        totalPriceWithAdminMargin:
          operator.operator.charges_per_hour *
            (operator.aviapagesResponse.time.airway + totalTimeFromToto) +
          operator.operator.charges_per_hour *
            (operator.aviapagesResponse.time.airway + totalTimeFromToto) *
            (operator.operator.margin / 100),
      }));

      const responseObj = {
        nearestOperatorWithPrice,
        from: from,
        to: to,
      };

      return res.json(responseObj);
    } else {
      // for getting at least max techstop during the journey
      let selectedTechStops = [];
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
            "pax":"${pax}",
            "departure_datetime":"${departure_datetime}",
            "airway_time": true,
            "advise_techstops": true
          }`;

          let techStopResponse = await axios(buildRequestConfig(techStopData));
          let techStopAirport = techStopResponse.data.airport.techstop;
          techStopAirportDetails.push(techStopAirport);

          console.log("techStopResponse", techStopResponse.data);

          while (techStopResponse.data.time.airway == null) {
            if (techStopResponse.data.airport.techstop.length > 0) {
              techStopAirport = techStopResponse.data.airport.techstop[0];

              techStopData = `{
                "departure_airport": "${From}",
                "arrival_airport": "${techStopAirport}",
                "aircraft": "${aircraft}",
                "pax":"${pax}",
                "departure_datetime":"${departure_datetime}",
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
            finalLegTechStopDepatureOne =
              techStopResponse.data.airport.arrival_airport;
            if (techStopResponse.data.airport.arrival_airport != to) {
              selectedTechStops.push(
                techStopResponse.data.airport.arrival_airport
              );
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
      "pax":"${pax}",
      "departure_datetime":"${departure_datetime}",
      "airway_time": true,
      "advise_techstops": true
    }`;

          const techStopResponse = await axios(
            buildRequestConfig(techStopData)
          );
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
        "pax":"${pax}",
        "departure_datetime":"${departure_datetime}",
        "airway_time": true,
        "advise_techstops": false
      }`;

            const airwayTimeResponse = await axios(
              buildRequestConfig(airwayTimeData)
            );
            console.log("Airway Time Responsee", airwayTimeResponse.data);

            // Update the finalLegTechStopDepature
            finalLegTechStopDepatureOne = nextTechStop;
            if (airwayTimeResponse.data.time.airway != null) {
              console.log("firstLeg", firstLegTime);
              finalLegTechStopDepatureOne =
                airwayTimeResponse.data.airport.arrival_airport;
              if (airwayTimeResponse.data.airport.arrival_airport != to) {
                selectedTechStops.push(
                  airwayTimeResponse.data.airport.arrival_airport
                );
              }
              console.log(
                "finalLegTechStopDepatureOneo",
                finalLegTechStopDepatureOne
              );
            }
          }
        }

        // console.log("Total Tech Stop Timeeee:", totalTechStopTime);
        console.log("Final Destinationww:", toAirport);

        async function continueJourneypartTwo(
          fromAirport,
          toAirport,
          aircraft
        ) {
          let totalTechStopTime = 0;

          if (finalLegTechStopDepatureOne !== toAirport) {
            const techStopData = `{
          "departure_airport": "${fromAirport}",
          "arrival_airport": "${toAirport}",
          "aircraft": "${aircraft}",
          "pax":"${pax}",
          "departure_datetime":"${departure_datetime}",
          "airway_time": true,
          "advise_techstops": true
        }`;

            const techStopResponse = await axios(
              buildRequestConfig(techStopData)
            );
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
            "pax":"${pax}",
            "departure_datetime":"${departure_datetime}",
            "airway_time": true,
            "advise_techstops": false
          }`;

              const airwayTimeResponse = await axios(
                buildRequestConfig(airwayTimeData)
              );
              getMoreTechstop = airwayTimeResponse;
              console.log(
                "Airway Time Responsee2222",
                airwayTimeResponse.data.airport.techstop
              );

              // Update the finalLegTechStopDepature
              finalLegTechStopDepatureOne = nextTechStop;
              if (airwayTimeResponse.data.time.airway != null) {
                console.log("firstLeg", firstLegTime);
                finalLegTechStopDepatureOne =
                  airwayTimeResponse.data.airport.arrival_airport;
                if (airwayTimeResponse.data.airport.arrival_airport != to) {
                  selectedTechStops.push(
                    airwayTimeResponse.data.airport.arrival_airport
                  );
                }
                console.log(
                  "finalLegTechStopDepatureOne",
                  finalLegTechStopDepatureOne
                );
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
        "pax":"${pax}",
        "departure_datetime":"${departure_datetime}",
        "airway_time": true,
        "advise_techstops": true,
        "average_speed_time": true
      }`;

          const techStopResponse = await axios(
            buildRequestConfig(techStopData)
          );
          finalLegAverageSpeedTime = techStopResponse.data.time.average_speed;
          console.log(
            "Tech Stop Response in while loop",
            techStopResponse.data
          );
          console.log("finalLegAverageSpeedTime", finalLegAverageSpeedTime);

          if (techStopResponse.data) {
            const totalTimeFromToto = finalLegAverageSpeedTime / 60;
            console.log(totalTimeFromToto);

            const nearestOperatorWithPriceForTechSTopGreaterThanThree =
              nearestOperator
                .filter(
                  (operator) =>
                    operator.operator.Aircraft_type === "Challenger 605"
                )
                .map((operator) => ({
                  ...operator,
                  totalTime:
                    operator.aviapagesResponse.time.airway + totalTimeFromToto,
                  techStopAirport: {
                    selectedTechStops: selectedTechStops,
                    techStopTime: `${0.5}hour / 45minute`,
                    techStopCost: `${50000}rs`,
                  },
                  TotalPriceWithTechStop:
                    operator.operator.charges_per_hour *
                      (operator.aviapagesResponse.time.airway +
                        totalTimeFromToto +
                        selectedTechStops.length * 0.5) +
                    selectedTechStops.length * 50000,
                  totalPriceWithTechStopAndAdminMargin:
                    operator.operator.charges_per_hour *
                      (operator.aviapagesResponse.time.airway +
                        totalTimeFromToto +
                        selectedTechStops.length * 0.5) +
                    selectedTechStops.length * 50000 +
                    ((operator.operator.charges_per_hour *
                      (operator.aviapagesResponse.time.airway +
                        totalTimeFromToto +
                        selectedTechStops.length * 0.5) +
                      selectedTechStops.length * 50000) *
                      operator.operator.margin) /
                      100,
                }));
            console.log(
              "nearestOperatorWithPriceForTechSTopGreaterThanThree",
              nearestOperatorWithPriceForTechSTopGreaterThanThree
            );
            const nearestOperatorWithPrice = nearestOperator.map(
              (operator) => ({
                ...operator,
                totalTime:
                  operator.aviapagesResponse.time.airway + totalTimeFromToto,
                techStopAirport: {
                  selectedTechStops: selectedTechStops,
                  techStopTime: `${0.5}hour / 45minute`,
                  techStopCost: `${50000}rs`,
                },
                TotalPriceWithTechStop:
                  operator.operator.charges_per_hour *
                    (operator.aviapagesResponse.time.airway +
                      totalTimeFromToto +
                      selectedTechStops.length * 0.5) +
                  selectedTechStops.length * 50000,
                totalPriceWithTechStopAndAdminMargin:
                  operator.operator.charges_per_hour *
                    (operator.aviapagesResponse.time.airway +
                      totalTimeFromToto +
                      selectedTechStops.length * 0.5) +
                  selectedTechStops.length * 50000 +
                  ((operator.operator.charges_per_hour *
                    (operator.aviapagesResponse.time.airway +
                      totalTimeFromToto +
                      selectedTechStops.length * 0.5) +
                    selectedTechStops.length * 50000) *
                    operator.operator.margin) /
                    100,
              })
            );
            if (selectedTechStops.length >= 3) {
              const responseObj = {
                nearestOperatorWithPriceForTechSTopGreaterThanThree,
                from: from,
                to: to,
              };
              console.log("nearestOperator", responseObj);
              return res.json(responseObj);
            } else {
              const responseObj = {
                nearestOperatorWithPrice,
                from: from,
                to: to,
              };
              console.log("nearestOperator", responseObj);
              return res.json(responseObj);
            }
          }
        }
        KnowAverageSpeedTime(from, to, aircraft);
        continueJourneypartTwo(finalLegTechStopDepatureOne, to, aircraft);
        console.log("selectedTechStops", selectedTechStops);
      }

      continueJourneypartOne(finalLegTechStopDepatureOne, to, aircraft);
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
      return {lat: result[0].latitude, lon: result[0].longitude};
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
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

exports.AirCraftData = async (req, res) => {
  try {
    await AirCraftDataArray;
    return res.json({
      success: true,
      message: "AirCraft List found",
      data: AirCraftDataArray,
    });
  } catch (error) {
    res.json({success: false, message: error});
  }
};
// exports.AirlineBlog = async (req, res) => {
//   const apiUrl = "https://sky-scrapper.p.rapidapi.com/api/v1/checkServer";
//   const apiKey = "7cf9e2b316mshe5a6a8deaeff260p139fb3jsna3f845eb7483";
//   console.log("hii there");
//   try {
//     const response = await axios.get(apiUrl, {
//       headers: {
//         "X-RapidAPI-Key": "7cf9e2b316mshe5a6a8deaeff260p139fb3jsna3f845eb7483",
//         "X-RapidAPI-Host": "sky-scrapper.p.rapidapi.com",
//       },
//     });
//     return response.data;

//     if (response.data) {
//     }
//   } catch (error) {
//     throw new Error(`Error making API request: ${error.message}`);
//   }
// };

// exports.AirlineAmedeusAPi = async (req, res) => {
//   const apiKey = "s2qG72Mk2FuqLBEV6Vt3A2FHS6RfcZF4";
//   const apiSecret = "";

//   const apiEndpoint = "https://test.api.amadeus.com/v2/shopping/flight-offers";

//   // Replace this with any request parameters required by the API
//   const requestData = {
//     originLocationCode: "BOM",
//     destinationLocationCode: "DXB",
//     departureDate: "2024-01-29",
//     adults: "1",
//     max: "10",
//   };

//   // Make a POST request to the API with API key and API secret in the headers
//   axios
//     .post(apiEndpoint, requestData, {
//       headers: {
//         "Content-Type": "application/json",
//         "Api-Key": apiKey,
//         "Api-Secret": apiSecret,
//       },
//     })
//     .then((response) => {
//       // Handle the API response here
//       console.log(response.data);
//     })
//     .catch((error) => {
//       // Handle errors
//       console.error("Error:", error.message);
//     });
// };

exports.AmedeusAPitoken = async (req, res) => {
  const apiUrl = "https://test.api.amadeus.com/v2/shopping/flight-offers";
  const accessToken = "D8FuCoGIbnj2pAnebfKUgc52kuQ6";
  const SingleAllAircraft = [];
  const TechStopAircraft = [];
  let ResponseData = {};
  const FinalResponse = [];
  let Finaldata;

  const {originLocationCode, destinationLocationCode, departureDate, pax, max} =
    req.body;

  let OriginLocationCode = originLocationCode.toString();
  let DestinationLocationCode = destinationLocationCode.toString();
  let DepartureDate = departureDate.toString();
  // let CurrencyCode = currencyCode.toString();
  let Pax = Number(pax);
  let Max = Number(max);

  // function addDays(dateString, days) {
  //   // Extract year, month, and day from the input date string
  //   const [year, month, day] = dateString.split("-").map(Number);

  //   // Check if the extracted components are valid
  //   if (isNaN(year) || isNaN(month) || isNaN(day)) {
  //     return "Invalid date format";
  //   }

  //   // Create a new Date object using the extracted components
  //   const inputDate = new Date(year, month - 1, day);

  //   // Check if the created date is valid
  //   if (isNaN(inputDate.getTime())) {
  //     return "Invalid date";
  //   }

  //   // Calculate the new date by adding the specified number of days
  //   const resultDate = new Date(inputDate);
  //   resultDate.setDate(inputDate.getDate() + days);

  //   // Format the result as a string in the desired format (yyyy-mm-dd)
  //   const newYear = resultDate.getFullYear();
  //   const newMonth = (resultDate.getMonth() + 1).toString().padStart(2, "0");
  //   const newDay = resultDate.getDate().toString().padStart(2, "0");

  //   return `${newYear}-${newMonth}-${newDay}`;
  // }

  // function processDateExtension(dateString) {
  //   // Assuming dateString is in the format 'yyyy-mm-dd'
  //   const [year, month, day] = dateString.split("-").map(Number);

  //   // Check if the extracted components are valid
  //   if (isNaN(year) || isNaN(month) || isNaN(day)) {
  //     return "Invalid date format";
  //   }

  //   // Create a new Date object using the extracted components
  //   const inputDate = new Date(year, month - 1, day);
  //   const currentDate = new Date();

  //   // Check if the created date is valid
  //   if (isNaN(inputDate.getTime())) {
  //     return "Invalid date";
  //   }

  //   // Check if Input date is after the current date
  //   if (inputDate.getTime() > currentDate.getTime()) {
  //     return dateString; // Return the original date
  //   }

  //   // Check if the difference between the Input date and current date is less than 6 days
  //   if (currentDate.getTime() - inputDate.getTime() < 6 * 24 * 60 * 60 * 1000) {
  //     // Take 6 days extension
  //     const resultDate = new Date(inputDate);
  //     resultDate.setDate(inputDate.getDate() + 6);

  //     // Format the result as a string in the desired format (yyyy-mm-dd)
  //     const newYear = resultDate.getFullYear();
  //     const newMonth = (resultDate.getMonth() + 1).toString().padStart(2, "0");
  //     const newDay = resultDate.getDate().toString().padStart(2, "0");

  //     return `${newYear}-${newMonth}-${newDay}`;
  //   } else {
  //     return dateString; // Return the original date
  //   }
  // }

  function processDateExtension(dateString) {
    // Assuming dateString is in the format 'yyyy-mm-dd'
    const [year, month, day] = dateString.split("-").map(Number);

    // Check if the extracted components are valid
    if (isNaN(year) || isNaN(month) || isNaN(day)) {
      return "Invalid date format";
    }

    // Create a new Date object using the extracted components
    const inputDate = new Date(year, month - 1, day);
    const currentDate = new Date();

    // Check if the created date is valid
    if (isNaN(inputDate.getTime())) {
      return "Invalid date";
    }

    // Calculate the difference in milliseconds between the Input date and current date
    const dateDifference = inputDate.getTime() - currentDate.getTime();

    // Check if the user input date is less than current date or within the next 6 days
    if (dateDifference < 6 * 24 * 60 * 60 * 1000) {
      // Take 6 days extension
      const resultDate = new Date(inputDate);
      resultDate.setDate(inputDate.getDate() + 6);

      // Format the result as a string in the desired format (yyyy-mm-dd)
      const newYear = resultDate.getFullYear();
      const newMonth = (resultDate.getMonth() + 1).toString().padStart(2, "0");
      const newDay = resultDate.getDate().toString().padStart(2, "0");

      return `${newYear}-${newMonth}-${newDay}`;
    } else {
      return dateString; // Return the original date without extension
    }
  }

  // Example usage:
  const userInput = "2024-01-31";
  const daysToAdd = 6;
  const backendProcessedDate = processDateExtension(DepartureDate);
  // Process user input date on the backend
  // const backendProcessedDate = addDays(, daysToAdd);

  // console.log("User input date:", userInput);
  // console.log("Backend processed date (6 days later):", backendProcessedDate);

  const requestData = {
    originLocationCode: OriginLocationCode,
    destinationLocationCode: DestinationLocationCode,
    departureDate: backendProcessedDate,
    adults: Pax,
    // currencyCode: CurrencyCode,
    max: Max,
  };
  console.log("requestData", requestData);
  const data = await axios
    .get(apiUrl, {
      params: requestData,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    })

    // .then((response) => {
    //   console.log("response.data", response.data);

    //   const sortedItemDataByPrice = response.data.data.sort(
    //     (a, b) => a.price.grandTotal - b.price.grandTotal
    //   );
    //   console.log("sortedItemDataByPrice", sortedItemDataByPrice);
    //   sortedItemDataByPrice.map((itemData) => {
    //     // ...itemData,

    //     console.log("1", itemData);
    //     console.log("itemData grand Total Price", itemData.price.grandTotal);
    //     console.log("price 705", itemData.price.total);
    //     console.log(" itemData.itineraries", itemData.itineraries);
    //     console.log("itemData.itineraries", itemData.itineraries);

    //     console.log(" Single  AllAircraft line 717", SingleAllAircraft);
    //     console.log("AllAircraft line 720 ", Price);

    //     //   //Sample data
    //     //   // this is internal segments

    //     //   // AllAircraft.map((Data) => {
    //     //   //   cons-*+ole.log("Inner Data ", Data);
    //     //   //   Data.map((item) => {
    //     //   //     console.log("Inner Item segments", item.segments);
    //     //   //   });
    //     //   // });

    //     //   // starting from here from filteration and price checking
    //     const finaldata = {aircraft: AllAircraft, price: Price};
    //     console.log("finaldata line 734 aircrafts", finaldata.aircraft.length);
    //     console.log("finaldata line 734 price", finaldata.price.length);

    //     finaldata.aircraft.segments.map((data) => {
    //       console.log("DataItem line 737", data);
    //     });
    //     // const filterByEqualCarrierCodes = (array) => {
    //     //   return {
    //     //     aircraft: array.aircraft.filter((innerArray) => {
    //     //       innerArray.map((InternalArray) => {
    //     //         console.log(InternalArray);
    //     //       });
    //     //       const segments = innerArray[0].segments;

    //     //       return (
    //     //         segments.length == 1 ||
    //     //         (segments.length == 2 &&
    //     //           segments[0].carrierCode === segments[1].carrierCode)
    //     //       );
    //     //     }),
    //     //     price: array.prices.filter((innerArray) => {
    //     //       innerArray.map((InternalArray) => {
    //     //         console.log(InternalArray);
    //     //       });
    //     //       const segments = innerArray[0].segments;
    //     //       console.log("segments line 744", segments);
    //     //       return (
    //     //         segments.length == 1 ||
    //     //         (segments.length == 2 &&
    //     //           segments[0].carrierCode === segments[1].carrierCode)
    //     //       );
    //     //     }),
    //     //   };
    //     //   // return array.aircraft.filter((innerArray) => {
    //     //   //   // console.log("innerArray", innerArray);
    //     //   //   // innerArray.map((internalArray) => {
    //     //   //   //   console.log("internalArray", internalArray.segments);
    //     //   //   // });
    //     //   //   // const segments = innerArray[0].segments;
    //     //   //   // // Check if carrierCode of segment[0] is equal to carrierCode of segment[1]
    //     //   //   // console.log("segments 739", segments);
    //     //   //   // return (
    //     //   //   //   segments.length == 1 ||
    //     //   //   //   (segments.length == 2 &&
    //     //   //   //     segments[0].carrierCode === segments[1].carrierCode)
    //     //   //   // );

    //     //   // });
    //     // };

    //     const filterByEqualCarrierCodes = (array) => {
    //       return {
    //         aircraft: array.aircraft.filter((innerArray, index) => {
    //           const segments = innerArray[0].segments;

    //           const shouldInclude =
    //             segments.length === 1 ||
    //             (segments.length === 2 &&
    //               segments[0].carrierCode === segments[1].carrierCode);

    //           return shouldInclude;
    //         }),
    //         price: array.price.filter((_, index) => {
    //           const segments = array.aircraft[index][0].segments;

    //           const shouldInclude =
    //             segments.length === 1 ||
    //             (segments.length === 2 &&
    //               segments[0].carrierCode === segments[1].carrierCode);
    //           return shouldInclude;
    //         }),
    //       };
    //     };

    //     const result = filterByEqualCarrierCodes(finaldata);
    //     console.log("result aircrafts", result.aircraft.length);
    //     console.log("result price", result.price.length);
    //     result.aircraft.map((data) => {
    //       console.log("data", data);
    //       data.map((items) => {
    //         console.log("Inner Item", items);
    //         items.segments.map((itemseg) => {
    //           console.log("itemseg", itemseg);
    //         });
    //       });
    //     });
    //     result.price.map((data) => {
    //       console.log("data Price", data);
    //     });
    //     //   // result.map((data) => {
    //     //   //   console.log("innerData", data);
    //     //   //   data.map((Data) => {
    //     //   //     console.log("Single Data", Data);
    //     //   //     Data.segments.map((data) => {
    //     //   //       console.log("Inner Data part", data);
    //     //   //     });
    //     //   //   });
    //     //   // });

    //     //   // console.log("Final Result", result);

    //     //   // result.map((data) => {
    //     //   //   console.log("data Own", data);
    //     //   //   data.map((data) => {
    //     //   //     console.log("Most inner loop", data);
    //     //   //     data.segments.map((item) => {
    //     //   //       console.log("ItemData 765", item);
    //     //   //       // item.map((Data) => {
    //     //   //       //   console.log("Data_Item", Data.itineraries);
    //     //   //       // });
    //     //   //     });
    //     //   //   });
    //     //   // });

    //     //   return AllAircraft;
    //     //   console.log("AllAirportCode", AllAirportCode);

    //     //   console.log("data.segments[1]", data.segments[1].carrierCode);
    //     // });
    //     AllAircraft.map((aircraft) => {
    //       // console.log(aircraft.segments[0]);
    //     });
    //     console.log("Each segment", AllAircraft[0].segments);
    //     return AllAircraft;
    //   });
    // })
    // .catch((error) => {
    //   console.log("error", error.message);
    // });

    .then((response) => {
      console.log("response Data data", response.data.data);
      response.data.data.map((itemData) => {
        console.log("itemdata", itemData);
        console.log("itemdata price", itemData.price.grandTotal);
        itemData.itineraries.map((itinerarie) => {
          console.log("data.itineraries", itinerarie.segments.length);
          if (itinerarie.segments.length == 1) {
            SingleAllAircraft.push({
              aircraft: itemData.itineraries,
              price: itemData.price,
            });
            console.log("SingleAllAircraft", SingleAllAircraft.length);

            const sortedAircraftByPrice = SingleAllAircraft.slice().sort(
              (a, b) => {
                a.price.grandTotal - b.price.grandTotal;
              }
            );
            console.log("sortedAircraftByPrice", sortedAircraftByPrice);
            // FinalResponse.push(sortedAircraftByPrice);
            // console.log("FinalResponse line 877 ", FinalResponse);
            ResponseData.AirCraftDatawithNotechStop = sortedAircraftByPrice;
            // FinalResponse.push(sortedAircraftByPrice);
            console.log("Final Price without tech halt line 876", ResponseData);
          } else if (itinerarie.segments.length >= 2) {
            TechStopAircraft.push({
              aircraft: itemData.itineraries,
              price: itemData.price,
            });
            console.log("TechStopAllAircraft length", TechStopAircraft.length);
            const sortedTechSTopAircraftByPrice = TechStopAircraft.slice().sort(
              (a, b) => {
                a.price.grandTotal - b.price.grandTotal;
              }
            );
            console.log(
              "sortedTechSTopAircraftByPrice",
              sortedTechSTopAircraftByPrice
            );

            const filteredAircraft = sortedTechSTopAircraftByPrice.filter(
              (aircraftData) => {
                return aircraftData.aircraft.some((Data) => {
                  return (
                    Data.segments.length >= 2 &&
                    Data.segments[0].carrierCode ===
                      Data.segments[1].carrierCode
                  );
                });
              }
            );

            console.log("Filtered Aircraft", filteredAircraft);

            // FinalResponse.push(filteredAircraft);
            // console.log(
            //   "final Response both the object line 911",
            //   FinalResponse
            // );
            ResponseData.AirCraftDatawithtechStop = filteredAircraft;
            console.log("FInal data line 907", ResponseData);
          }

          console.log("ResponseData", ResponseData);
          // ResponseData = (item) => {
          //   item.price.forEach((priceItem) => {
          //     priceItem.pricewithmargin = priceItem.grandTotal * 2;
          //     (priceItem.ActualPrice = priceItem.total * 9),
          //       (priceItem.ActualPrice = priceItem.total * 9);
          //     console.log(
          //       "priceItem.ActualPrice line 923",
          //       priceItem.ActualPrice
          //     );
          //   });
          // };

          // finaldata.datawithnotechstop.forEach(transformfinaldata);
          // finaldata.datawithtechstop.forEach(transformfinaldata);

          // console.log(finaldata);
          console.log("Final Response Data line 937", ResponseData);

          // const transformfinaldata = (item) => {
          //   item.price.forEach((priceItem) => {
          //     priceItem.pricewithmargin = priceItem.grandTotal * 2;
          //     (priceItem.ActualPrice = priceItem.total * 9),
          //       (priceItem.ActualPrice = priceItem.total * 9);
          //   });
          // };

          // ResponseData.AirCraftDatawithNotechStop.price.forEach(
          //   transformfinaldata
          // );
          // ResponseData.AirCraftDatawithtechStop.price.forEach(
          //   transformfinaldata
          // );

          console.log("ResponseData", ResponseData);

          // this is code actual code

          if (
            ResponseData &&
            ResponseData.AirCraftDatawithNotechStop &&
            ResponseData.AirCraftDatawithNotechStop.length !== undefined &&
            ResponseData.AirCraftDatawithNotechStop.length !== 0
          ) {
            Finaldata = ResponseData.AirCraftDatawithNotechStop;
            console.log("data line 958 Direct flight", Finaldata);

            Finaldata = ResponseData.AirCraftDatawithNotechStop;
            console.log("data line 958 One tech halt flight", Finaldata);
            Finaldata.map((data) => {
              console.log("FInal prices line 968", data.price.grandTotal);

              // Calculate Actual_Price and Total_Price outside the inner loops
              const Actual_Price = data.price.grandTotal * 0.07;
              const Total_Price = Actual_Price * 9 + 0.1;
              console.log("Total_Price_1 line 1104", Total_Price);

              data.aircraft.map((innerData) => {
                console.log("Inner array data", innerData);
                innerData.segments.flat().map((item) => {
                  console.log("Item data line 973", item);
                  // Perform calculations using Actual_Price and Total_Price here if needed
                });
              });
            });
            console.log("length of aircraft for line 981", Finaldata.length);
            Finaldata.map((data) => {
              console.log("FInal prices line 968 ", data.price.grandTotal);
              const price = parseFloat(data.price.grandTotal);
              console.log("price12", price);
              const a = 7;
              const b = 20;
              const totalPrice =
                (price + (price * a) / 100) * 9 +
                ((price + (price * a) / 100) * 9 * b) / 100;

              console.log("Total Price: line 993", totalPrice);

              // let abc = (price * 7) / 100;
              // let bcd = abc + 100;
              // const totalPrice =
              //   price +
              //   ((price * 7) / 100) * 9 +
              //   ((price + ((price * 7) / 100) * 9) * 20) / 100;

              // console.log("Actual_price line 991", bcd);
              data.aircraft.map((innerData) => {
                console.log("Inner array data", innerData);
                innerData.segments.flat().map((item) => {
                  console.log("Item data line 973", item);
                  // Perform calculations using Actual_Price and Total_Price here if needed
                });
              });
            });
          } else if (
            ResponseData &&
            ResponseData.AirCraftDatawithtechStop &&
            ResponseData.AirCraftDatawithtechStop.length !== undefined &&
            ResponseData.AirCraftDatawithtechStop.length !== 0
          ) {
            Finaldata = ResponseData.AirCraftDatawithtechStop;
            console.log("finaldata line 1059", Finaldata);
            // Finaldata.aircraft.map((Innerdata) => {
            //   console.log("Innerdata line 1061", Innerdata);
            // });

            Finaldata.map((data) => {
              console.log("Data line 1062", data);
              const price = parseFloat(data.price.grandTotal);
              data.aircraft.map((item) => {
                console.log("inner Item line 1068", item);
                item.segments.map((Data) => {
                  console.log("Inner data line 1070", Data);
                });
              });

              const a = 7;
              const b = 20;
              const totalPrice =
                (price + (price * a) / 100) * 9 +
                ((price + (price * a) / 100) * 9 * b) / 100;

              console.log("Total Price: line 1066", totalPrice);
              console.log(
                "Finaldata.price.grandTotal line 1068",
                Finaldata.map((data) => {
                  console.log("FInal prices line 1070", data.price.grandTotal);

                  const Actual_Price = data.price.grandTotal * 0.07;
                  const Total_Price = Actual_Price * 9 + 0.1;
                  console.log("Total_Price_2 line number 1088", Total_Price);
                })
              );
            });
          }

          // this is code structure
          console.log("Final data line 962", Finaldata);

          // ResponseData.AirCraftDatawithNotechStop.map((Data) => {
          //   console.log("Data line 937", Data);
          // });

          // ResponseData.AirCraftDatawithNotechStop.map((data) => {
          //   console.log("data line 944", data);
          // });

          // ResponseData.AirCraftDatawithtechStop.map((data) => {
          //   console.log(
          //     "data line 948 with total price",
          //     data.price.grandTotal
          //   );

          //   const Actual_Price =
          //     data.price.grandTotal + (20 / data.price.grandTotal) * 100;

          //   console.log("Actual_Price for single flight", Actual_Price);

          //   const Price_with_margin = Actual_Price * 9;

          //   // console.log("Price_with_margin", Price_with_margin);
          //   data.aircraft.map((item) => {
          //     console.log("item data segments", item.segments);
          //   });
          // });

          // ResponseData.AirCraftDatawithtechStop.map((data) => {
          //   console.log("Data line 941", data);
          // });

          // ResponseData.AirCraftDatawithtechStop.map((data) => {
          //   console.log("Data line 946", data);
          //   console.log("line number 946 price", data.price);
          // });

          // ResponseData.AirCraftDatawithNotechStop.map((Data) => {
          //   console.log("Data", Data);
          //   console.log(
          //     "ResponseData.AirCraftDatawithNotechStop.price",
          //     Data.price
          //   );
          //   const Actual_Price = NOdata.price.grandTotal * (20 / 100) * 100;
          //   const Final_Price = Actual_Price * 9 + (25 / 100) * 100;
          // });
          // console.log("Our Final Price", Final_Price);

          // console.log("FInal Response", ResponseData);
          // FinalResponse.map((data) => {
          //   console.log("data line 920", data);
          //   data.map;
          // });

          // ResponseData.AirCraftDatawithNotechStop.map((data) => {
          //   console.log("Line number 925", data);
          //   data.price.map((item) => {
          //     console.log("item", item);
          //   });
          // });

          // function mapPrices(data) {
          //   const data1 = data.map((item) => item?.price);
          //   return data1;
          // }
          // const pricesNoTechstop = mapPrices(
          //   ResponseData.AirCraftDatawithNotechStop
          // );
          // console.log("pricesNoTechstop line 931", pricesNoTechstop);

          // const pricesTechStop = mapPrices(
          //   ResponseData.AirCraftDatawithtechStop
          // );

          // console.log("pricesTechStop line 937", pricesTechStop);

          // console.log("Prices for AirCraftDatawithNotechStop:");
          // ResponseData.AirCraftDatawithNotechStop.forEach((item) => {
          //   const price = item.price;
          //   console.log(price);
          // });

          // Mapping and logging prices for AirCraftDatawithtechStop

          // console.log("\nPrices for AirCraftDatawithtechStop:");
          // ResponseData.AirCraftDatawithtechStop.forEach((item) => {
          //   const price = item.price;
          //   console.log(price);
          // });

          // ResponseData.AirCraftDatawithNotechStop.map((NOdata) => {
          //   console.log("No data", NOdata);
          //   console.log("NOdata.aircraft", NOdata.aircraft);
          //   NOdata.aircraft.map((data) => {
          //     console.log("data.segments", data.segments);
          //   });
          // const Actual_Price = NOdata.price.grandTotal * (20 / 100) * 100;
          // const Final_Price = Actual_Price * 9 + (25 / 100) * 100;
          //   console.log("Our Final Price", Final_Price);
          // });
          // ResponseData.AirCraftDatawithtechStop.map((Data) => {
          //   console.log("Data line 921", Data);
          //   // Data.aircraft.map((itemdata) => {
          //   //   console.log("itemdata", itemdata);
          //   // });
          // });

          // const updatedData = {
          //   AirCraftDatawithNotechStop:
          //     ResponseData.AirCraftDatawithNotechStop.map((item) => {
          //       const Actual_Price = item.price.grandTotal * (20 / 100) * 100;
          //       const Final_Price = Actual_Price * 9 + (25 / 100) * 100;

          //       console.log(
          //         `Original Price: ${item.price.grandTotal}, Updated Price: ${Final_Price}`
          //       );

          //       return {
          //         aircraft: item.aircraft,
          //         price: {
          //           grandTotal: Final_Price,
          //         },
          //       };
          //     }),
          //   AirCraftDatawithtechStop: ResponseData.AirCraftDatawithtechStop.map(
          //     (item) => {
          //       const Actual_Price = item.price.grandTotal * (20 / 100) * 100;
          //       const Final_Price = Actual_Price * 9 + (25 / 100) * 100;

          //       console.log(
          //         `Original Price: ${item.price.grandTotal}, Updated Price: ${Final_Price}`
          //       );

          //       return {
          //         aircraft: item.aircraft,
          //         price: {
          //           grandTotal: Final_Price,
          //         },
          //       };
          //     }
          //   ),
          // };
        });
      });
    })
    .catch((error) => {
      console.error("error", error.message);
    });
};

require("dotenv").config();
const {Customer} = require("../db/Customer");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {validationResult} = require("express-validator");
const axios = require("axios");
const {buildRequestConfig} = require("../configs/aviapi.config");
const {AircraftOPerator} = require("../db/Operator");
const NodeGeocoder = require("node-geocoder");
const {access_token} =require("../configs/cronjob")
const geocoder = NodeGeocoder({
  provider: "google", // Use the Google Maps Geocoding API
  apiKey: process.env.GOOGLE_API_KEY, // Replace with your actual API key
});

const path = require("path"); // If you need to read the JSON file
const {response} = require("express");
const {Console} = require("console");

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

async function getFlightOffers(apiUrl, requestData, accessToken) {
  // Add the carrierCode parameter to the requestData object
  requestData.carrierCode =
    "LH,AI,6E,THY,WY,EK,OMA,EY,SIA,ACA,QTR,DLH,BAW,QFA,SAA,ANA,PAL,VIR,MAU";

  try {
    const response = await axios.get(apiUrl, {
      params: requestData,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });
    console.log("response.data line 687", response.data);
    return response.data;
  } catch (error) {
    console.error(error.response.data);
    throw error;
  }
}

exports.AmedeusAPitoken = async (req, res) => {
  try {
    const apiUrl = "https://test.api.amadeus.com/v2/shopping/flight-offers";
    const accessToken = "SeezCxea1FYSUqiBjGtfNs8L0gT7";
    const SingleAllAircraft = [];
    const TechStopAircraft = [];
    let ResponseData = {};
    const {
      originLocationCode,
      destinationLocationCode,
      departureDate,
      pax,
      max,
      mobile,
      countryCode,
    } = req.body;

    const originLocationcode = originLocationCode;
    const destinationLocationcode = destinationLocationCode;
    const departuredate = departureDate;
    const Pax = pax;
    const Mobile = mobile;
    const countrycode = countryCode;
    const Max = 5;

    const requestPost = {
      originLocationCode: originLocationcode,
      destinationLocationCode: destinationLocationcode,
      departureDate: departuredate,
      adults: Pax,
      countryCode: countrycode,
      mobile: Mobile,
      max: Max,
    };

    const carriercodes = [
      "AI",
      "6E",
      "THY",
      "WY",
      "EK",
      "OMA",
      "EY",
      "SIA",
      "ACA",
      "QTR",
      "DLH",
      "BAW",
      "QFA",
      "SAA",
      "ANA",
      "PAL",
      "VIR",
      "MAU",
      "UK",
    ];

    console.log(" requestPost line 711", requestPost);
    const requestData = {
      originLocationCode: originLocationcode,
      destinationLocationCode: destinationLocationcode,
      departureDate: departuredate,
      adults: Pax,
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

      .then((response) => {
        console.log("response Data data line 989", response.data.data);

        response.data.data.forEach((itemData) => {
          const a = 7;
          const b = 20;
          let FilterData = [];

          console.log("itemData its", itemData);
          const data = itemData.validatingAirlineCodes[0];
          const data1 = itemData.validatingAirlineCodes[1];
          const containsValidCode = Array.from(data).some((char) =>
            carriercodes.includes(char)
          );
          carriercodes.forEach((carriercode) => {
            if (
              carriercode === data ||
              (carriercode === data && carriercode === data1)
            ) {
              if (!FilterData[itemData]) {
                FilterData[itemData] = [];
              }
              FilterData[itemData].push(itemData);
            }
          });
          console.log("containsValidCode line 755", containsValidCode);
          console.log("Finaldata line 755", FilterData);
          FilterData.map((data) => {
            console.log("data line 773", data);
          });

          // if (containsValidCode === true) {
          //   FilterData.push(itemData);
          // }
          console.log("FilterData line 761", FilterData);

          const qualifyingItinerariesForNoTechStop =
            itemData.itineraries.filter((itinerarie) => {
              // carrierCode.filter((item) =>
              //   carriercode.includes(item)
              // );
              // console.log("filter option line 758", carrierCode);
              // const filteredResponse = carrierCode.filter((item) =>
              //   carriercode.includes(item)
              // );
              // const filteredResponse = carriercode.some(carrierCode);
              // console.log("filteredResponse line 763", filteredResponse);

              // console.log("filteredResponse line 763", filteredResponse);

              return itinerarie.segments.length === 1;
            });

          console.log("data is line 772", data);

          if (qualifyingItinerariesForNoTechStop.length > 0) {
            console.log(
              "qualifyingItinerariesForNoTechStop line 778",
              qualifyingItinerariesForNoTechStop
            );
            SingleAllAircraft.push({
              aircraft: itemData,
              price: {
                ...itemData.price,
                totalPrice: parseFloat(
                  (Number(itemData.price.grandTotal) +
                    (Number(itemData.price.grandTotal) * a) / 100) *
                    9 +
                    ((Number(itemData.price.grandTotal) +
                      (Number(itemData.price.grandTotal) * 7) / 100) *
                      9 *
                      b) /
                      100
                ),
              },
            });
            const sortedAircraftByPrice = SingleAllAircraft.slice().sort(
              (a, b) => {
                a.price.grandTotal - b.price.grandTotal;
              }
            );
            console.log(
              "sortedAircraftByPrice IS this now::",
              sortedAircraftByPrice
            );
            ResponseData.AirCraftDatawithNotechStop = sortedAircraftByPrice;
            console.log("ResponseData is now :::", ResponseData);
            // res.json({ResponseData: ResponseData});
          }

          // const qualifyingItinerariesForTechStop = itemData.itineraries.filter((itinerarie) => {
          //   return (itinerarie.segments.length >=2 && itinerarie.segments[0].carrierCode ===
          //   itinerarie.segments[1].carrierCode);
          // });
          const qualifyingItinerariesForTechStop = itemData.itineraries.filter(
            (itinerarie) => {
              return (
                itinerarie.segments.length >= 2 &&
                itinerarie.segments[1].carrierCode ===
                  itinerarie.segments[0].carrierCode
              );
            }
          );

          if (qualifyingItinerariesForTechStop.length > 0) {
            TechStopAircraft.push({
              aircraft: itemData,
              price: {
                ...itemData.price,
                totalPrice: parseFloat(
                  Number(itemData.price.grandTotal) +
                    Number(itemData.price.grandTotal) * ((a / 10) * 9) +
                    (Number(itemData.price.grandTotal) +
                      Number(itemData.price.grandTotal) *
                        ((a / 100) * 9) *
                        (b / 100))
                ),
              },
            });
            const sortedAircraftByPrice = TechStopAircraft.slice().sort(
              (a, b) => {
                a.price.grandTotal - b.price.grandTotal;
              }
            );
            console.log(
              "sortedAircraftByPrice IS this now::",
              sortedAircraftByPrice
            );
            ResponseData.AirCraftDatawithtechStop = sortedAircraftByPrice;
            console.log("ResponseData is now :::", ResponseData);
          }
        });
        console.log("SingleAllAircraft is now this:::", SingleAllAircraft);
        console.log(" TechStopAircraft is now this:::", TechStopAircraft);

        res.json({ResponseData: ResponseData});
      });
  } catch (error) {
    console.error("error", error.message);
    res.json({
      msg: error,
    });
  }
};

async function getFilteredFlightOffers(
  apiUrl,
  requestData,
  accessToken,
  airlineCodes
) {
  // Add the carrierCode parameter to the requestData object
  const filteredOffers = [];
  try {
    const response = await axios.get(apiUrl, {
      params: requestData,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });
    console.log("response", response.data);

    response.data.data.forEach((offer) => {
      console.log("offer line 931", offer);
      filteredOffers.push(offer);
      if (offer.itineraries[0].segments[0].carrierCode.includes("EK")) {
        filteredOffers.push(offer);
        // includedAirlineCodes.add(offer.itineraries[0].segments[0].carrierCode);
        console.log("includedAirlineCodes", filteredOffers);
      }
    });

    console.log(" filteredOffers line 939", filteredOffers);
    return filteredOffers;
  } catch (error) {
    console.error(error.response.data);
    throw error;
  }
}

exports.TestAPitoken = async (err, req, res, next) => {
  try {
    const apiUrl = "https://test.api.amadeus.com/v2/shopping/flight-offers";
    const accessToken = access_token;
    const SingleAllAircraft = [];
    const TechStopAircraft = [];
    let ResponseData = {};

    const airlineCodes = [
      "LH",
      "AI",
      "6E",
      "THY",
      "WY",
      "EK",
      "OMA",
      "EY",
      "SIA",
      "ACA",
      "QTR",
      "DLH",
      "BAW",
      "QFA",
      "SAA",
      "ANA",
      "PAL",
      "VIR",
      "MAU",
    ];
    const {
      originLocationCode,
      destinationLocationCode,
      departureDate,
      pax,
      max,
      mobile,
      countryCode,
    } = req.body;

    const originLocationcode = originLocationCode;
    const destinationLocationcode = destinationLocationCode;
    const departuredate = departureDate;
    const Pax = pax;
    const Mobile = mobile;
    const countrycode = countryCode;
    const Max = 5;

    const requestPost = {
      originLocationCode: originLocationcode,
      destinationLocationCode: destinationLocationcode,
      departureDate: departuredate,
      adults: Pax,
      countryCode: countrycode,
      mobile: Mobile,
      max: Max,
    };
    console.log(" requestPost line 711", requestPost);
    const requestData = {
      originLocationCode: originLocationcode,
      destinationLocationCode: destinationLocationcode,
      departureDate: departuredate,
      adults: Pax,
      max: Max,
    };
    console.log("requestData", requestData);
    // const data = await axios
    //   .get(apiUrl, {
    //     params: requestData,
    //     headers: {
    //       Authorization: `Bearer ${accessToken}`,
    //       "Content-Type": "application/json",
    //     },
    //   })

    const data = await getFilteredFlightOffers(
      apiUrl,
      requestData,
      accessToken,
      airlineCodes
    );

    console.log("data line 1029", data);
    // .then((response) => {
    //   console.log("data line 1033", response);
    //   response.forEach((itemData) => {
    //     const a = 7;
    //     const b = 20;

    //     console.log("itemData line 1046", itemData);
    //     const qualifyingItinerariesForNoTechStop = itemData.itineraries.filter(
    //       (itinerarie) => {
    //         // carrierCode.filter((item) =>
    //         //   carriercode.includes(item)
    //         // );
    //         // console.log("filter option line 758", carrierCode);
    //         // const filteredResponse = carrierCode.filter((item) =>
    //         //   carriercode.includes(item)
    //         // );
    //         // const filteredResponse = carriercode.some(carrierCode);
    //         // console.log("filteredResponse line 763", filteredResponse);

    //         // console.log("filteredResponse line 763", filteredResponse);

    //         // return itinerarie.segments.length === 1;

    //         console.log("itinerarie line 1065", itinerarie);
    //       }
    //     );

    //     if (qualifyingItinerariesForNoTechStop.length > 0) {
    //       console.log(
    //         "qualifyingItinerariesForNoTechStop line 778",
    //         qualifyingItinerariesForNoTechStop
    //       );
    //       SingleAllAircraft.push({
    //         aircraft: itemData,
    //         price: {
    //           ...itemData.price,
    //           totalPrice: parseFloat(
    //             Number(itemData.price.grandTotal) +
    //               Number(itemData.price.grandTotal) * ((a / 10) * 9) +
    //               (Number(itemData.price.grandTotal) +
    //                 Number(itemData.price.grandTotal) *
    //                   ((a / 100) * 9) *
    //                   (b / 100))
    //           ),
    //         },
    //       });
    //       const sortedAircraftByPrice = SingleAllAircraft.slice().sort(
    //         (a, b) => {
    //           a.price.grandTotal - b.price.grandTotal;
    //         }
    //       );
    //       console.log(
    //         "sortedAircraftByPrice IS this now::",
    //         sortedAircraftByPrice
    //       );
    //       ResponseData.AirCraftDatawithNotechStop = sortedAircraftByPrice;
    //       console.log("ResponseData is now :::", ResponseData);
    //       // return res.status(200).json({ResponseData: ResponseData});
    //     }

    //     // const qualifyingItinerariesForTechStop = itemData.itineraries.filter((itinerarie) => {
    //     //   return (itinerarie.segments.length >=2 && itinerarie.segments[0].carrierCode ===
    //     //   itinerarie.segments[1].carrierCode);
    //     // });
    //     const qualifyingItinerariesForTechStop = itemData.itineraries.filter(
    //       (itinerarie) => {
    //         return (
    //           itinerarie.segments.length >= 2 &&
    //           itinerarie.segments[1].carrierCode ===
    //             itinerarie.segments[0].carrierCode
    //         );
    //       }
    //     );

    //     if (qualifyingItinerariesForTechStop.length > 0) {
    //       TechStopAircraft.push({
    //         aircraft: itemData,
    //         price: {
    //           ...itemData.price,
    //           totalPrice: parseFloat(
    //             Number(itemData.price.grandTotal) +
    //               Number(itemData.price.grandTotal) * ((a / 10) * 9) +
    //               (Number(itemData.price.grandTotal) +
    //                 Number(itemData.price.grandTotal) *
    //                   ((a / 100) * 9) *
    //                   (b / 100))
    //           ),
    //         },
    //       });
    //       const sortedAircraftByPrice = TechStopAircraft.slice().sort(
    //         (a, b) => {
    //           a.price.grandTotal - b.price.grandTotal;
    //         }
    //       );
    //       console.log(
    //         "sortedAircraftByPrice IS this now::",
    //         sortedAircraftByPrice
    //       );
    //       ResponseData.AirCraftDatawithtechStop = sortedAircraftByPrice;
    //       console.log("ResponseData is now :::", ResponseData);
    //       // return res.status(200).json({ResponseData: ResponseData});
    //     }
    //   });
    // });
  } catch (error) {
    console.error("error", error.message);
    res.json({
      msg: error,
    });
  }
};

exports.AmedeusTestAPitoken = async (req, res) => {
  try {
    const apiUrl = "https://test.api.amadeus.com/v2/shopping/flight-offers";
    const accessToken = "t2XuuE17irAjrnwQ1v5iw3cew5Zt";
    const SingleAllAircraft = [];
    const TechStopAircraft = [];
    let ResponseData = {};
    const {
      originLocationCode,
      destinationLocationCode,
      departureDate,
      pax,
      max,
      mobile,
      countryCode,
    } = req.body;

    const originLocationcode = originLocationCode;
    const destinationLocationcode = destinationLocationCode;
    const departuredate = departureDate;
    const Pax = pax;
    const Mobile = mobile;
    const countrycode = countryCode;
    const Max = 10;
    const airlines = [
      "AC",
      "6E",
      "AF",
      "AI",
      "AA",
      "BA",
      "CX",
      "DL",
      "EK",
      "EY",
      "KL",
      "LH",
      "QF",
      "QR",
      "SQ",
      "TK",
      "UA",
      "VS",
      "THY",
      "WY",
      "OMA",
      "SAA",
      "ANA",
      "PAL",
      "VIR",
      "MAU",
      "MH",
      "SV",
    ];

    const checkDate = (dateStr) => {
      const givenDate = new Date(dateStr);
      const currentDate = new Date();
      const diffInDays = Math.ceil(
        (givenDate - currentDate) / (1000 * 60 * 60 * 24)
      );
      if (diffInDays >= 3) {
        return givenDate.toISOString().split("T")[0];
      }
      const dayDifference = 3 - diffInDays;
      givenDate.setDate(givenDate.getDate() + dayDifference);
      return givenDate.toISOString().split("T")[0];
    };
    const Ticketdate = checkDate(departuredate);
    console.log("departuredate", Ticketdate);
    const requestPost = {
      originLocationCode: originLocationcode,
      destinationLocationCode: destinationLocationcode,
      departureDate: Ticketdate,
      adults: Pax,
      countryCode: countrycode,
      mobile: Mobile,
      max: Max,
    };

    console.log("requestPost line 1224", requestPost);
    const requestData = {
      originLocationCode: originLocationcode,
      destinationLocationCode: destinationLocationcode,
      departureDate: Ticketdate,
      adults: Pax,
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
      .then((response) => {
        console.log("response Data data line 989", response.data.data);
        const filteredData = response.data.data.filter((item) => {
          const segments = item.itineraries.flatMap(
            (itinerary) => itinerary.segments
          );
          const carrierCodes = segments.map((segment) => segment.carrierCode);
          return carrierCodes.some((code) => airlines.includes(code));
        });

        console.log("filteredData", filteredData);

        filteredData.forEach((itemData) => {
          const a = 7;
          const b = 20;

          const qualifyingItinerariesForNoTechStop =
            itemData.itineraries.filter((itinerarie) => {
              return itinerarie.segments.length === 1;
            });

          if (qualifyingItinerariesForNoTechStop.length > 0) {
            console.log(
              "qualifyingItinerariesForNoTechStop line 778",
              qualifyingItinerariesForNoTechStop
            );
            SingleAllAircraft.push({
              aircraft: itemData,
              price: {
                ...itemData.price,
                totalPrice: parseFloat(
                  (Number(itemData.price.grandTotal) +
                    (Number(itemData.price.grandTotal) * a) / 100) *
                    9 +
                    ((Number(itemData.price.grandTotal) +
                      (Number(itemData.price.grandTotal) * 7) / 100) *
                      9 *
                      b) /
                      100
                ),
              },
            });
            const sortedAircraftByPrice = SingleAllAircraft.slice().sort(
              (a, b) => {
                a.price.grandTotal - b.price.grandTotal;
              }
            );
            console.log(
              "sortedAircraftByPrice IS this now::",
              sortedAircraftByPrice
            );
            ResponseData.AirCraftDatawithNotechStop = sortedAircraftByPrice;
            ResponseData.TicketAvailability = Ticketdate;
            console.log("ResponseData is now :::", ResponseData);
            // res.json({ResponseData: ResponseData});
          }
          const qualifyingItinerariesForTechStop = itemData.itineraries.filter(
            (itinerarie) => {
              return (
                itinerarie.segments.length >= 2 &&
                itinerarie.segments[1].carrierCode ===
                  itinerarie.segments[0].carrierCode
              );
            }
          );

          if (qualifyingItinerariesForTechStop.length > 0) {
            TechStopAircraft.push({
              aircraft: itemData,
              price: {
                ...itemData.price,
                totalPrice: parseFloat(
                  (Number(itemData.price.grandTotal) +
                    (Number(itemData.price.grandTotal) * a) / 100) *
                    9 +
                    ((Number(itemData.price.grandTotal) +
                      (Number(itemData.price.grandTotal) * 7) / 100) *
                      9 *
                      b) /
                      100
                ),
              },
            });
            const sortedAircraftByPrice = TechStopAircraft.slice().sort(
              (a, b) => {
                a.price.grandTotal - b.price.grandTotal;
              }
            );
            console.log(
              "sortedAircraftByPrice IS this now::",
              sortedAircraftByPrice
            );
            ResponseData.AirCraftDatawithtechStop = sortedAircraftByPrice;
            ResponseData.TicketAvailability = Ticketdate;
            console.log("ResponseData is now :::", ResponseData);
          }
        });
        return res.json({ResponseData});
      });
  } catch (error) {
    console.error("error", error.message);
    res.json({
      msg: error,
    });
  }
};



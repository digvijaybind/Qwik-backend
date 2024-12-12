require('dotenv').config();
const { Customer } = require('../../db/Customer');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const { buildRequestConfig } = require('../../configs/aviapi.config');
const { AircraftOPerator } = require('../../db/Operator');
const NodeGeocoder = require('node-geocoder');
const { getAccessToken } = require('../../configs/cronjob');
const AmadusAircraft = require('../../db/AmadusAircraft');
const AvipageAircraft = require('../../db/AvipageAircraft');
const { isValidEmail } = require('../../regex/emailRegex');
const geocoder = NodeGeocoder({
  provider: 'google',
  apiKey: process.env.GOOGLE_API_KEY,
});
const {
  PayloadStoring,
} = require('../../controller/customer/googleSpreadSheet/googleSheet');

const {
  sendSearchMail,
} = require('../../controller/customer/nodeMailer/nodeMailer');
const path = require('path');
// const { sendWhatsAppMessage } = require('../../configs/sendWhatsAppMessage');
// const { log } = require('console');
// const { sendWhatsAppMessage } = require('../../configs/sendWhatsAppMessage');
const aircraftDataPath = path.join(
  __dirname,
  '../../database/customaircfat.json',
);
const AirCraftDataArray = require(aircraftDataPath);
console.log(AirCraftDataArray);

exports.Register = async (req, res) => {
  const { email, password } = req.body;

  if (email === undefined || password === undefined) {
    return res.status(400).json({
      success: false,
      msg: 'email,password are required',
    });
  } else if (typeof email !== 'string' || typeof password !== 'string') {
    return res.status(400).json({
      error: 'email,password must be a string',
    });
  } else if (email === '' || password === '') {
    return res.status(400).json({
      success: false,
      msg: `email,password cant take an empty string value i.e ''`,
    });
  } else if (!isValidEmail(email)) {
    return res.status(400).json({
      success: false,
      msg: 'Invalid email entered',
    });
  }

  try {
    const existingUser = await Customer.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: 'User is already exist' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new Customer({
      email,
      password: hashedPassword,
    });
    await user.save();

    res.status(201).json({ message: 'User register succesfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Login controller
exports.Login = async (req, res) => {
  const { email, password } = req.body;
  if (email === undefined || password === undefined) {
    return res.status(400).json({
      success: false,
      msg: 'email,password are required',
    });
  }
  console.log(email, password);
  try {
    const user = await Customer.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: 'Customer not found' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Authcation is failed' });
    }

    const token = jwt.sign({ userId: user._id }, 'auth', {
      expiresIn: '1d',
    });

    res.json({ token });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Internal server Error' });
  }
};

// Amadeus Aircraft Logic
exports.AmedeusTestAPitoken = async (req, res) => {
  const {
    originLocationCode,
    destinationLocationCode,
    departureDate,
    pax,
    mobile,
    countryCode,
  } = req.body;

  if (
    originLocationCode === undefined ||
    destinationLocationCode === undefined ||
    departureDate === undefined ||
    pax === undefined ||
    mobile === undefined ||
    countryCode === undefined
  ) {
    return res.status(400).json({
      success: false,
      msg: 'originLocationCode,destinationLocationCode,departureDate,pax,mobile,countryCode are required',
    });
  } else if (
    typeof originLocationCode !== 'string' ||
    typeof destinationLocationCode !== 'string' ||
    typeof departureDate !== 'string' ||
    typeof pax !== 'number' ||
    typeof mobile !== 'string' ||
    typeof countryCode !== 'string'
  ) {
    return res.status(400).json({
      error:
        'originLocationCode,destinationLocationCode,departureDate,mobile,countryCode must be a string and pax must be a number',
    });
  } else if (
    originLocationCode === '' ||
    destinationLocationCode === '' ||
    departureDate === '' ||
    pax === 0 ||
    mobile === '' ||
    countryCode === ''
  ) {
    return res.status(400).json({
      success: false,
      msg: `originLocationCode,destinationLocat ionCode,departureDate,mobile,countryCode cant take an empty string value i.e '' and pax cant be 0`,
    });
  }

  try {
    const apiUrl = 'https://test.api.amadeus.com/v2/shopping/flight-offers';
    // let accessToken = await Promise.resolve(access_token); // Await resolution if needed
    const accessToken = getAccessToken();
    console.log("my access_token is now here 169", accessToken);


    const SingleAllAircraft = [];
    const TechStopAircraft = [];
    let ResponseData = {};
    let aircraftId;

    console.log('access_token line 175', accessToken);
    const originLocationcode = originLocationCode;
    const destinationLocationcode = destinationLocationCode;
    const departuredate = departureDate;
    const Pax = pax;
    const Mobile = mobile;
    const countrycode = countryCode;
    const Max = 10;

    const airlines = [
      'AC',
      '6E',
      'AF',
      'AI',
      'AA',
      'BA',
      'CX',
      'DL',
      'EK',
      'EY',
      'KL',
      'LH',
      'QF',
      'QR',
      'SQ',
      'TK',
      'UA',
      'VS',
      'THY',
      'WY',
      'OMA',
      'SAA',
      'ANA',
      'PAL',
      'VIR',
      'MAU',
      'MH',
      'SV',
      'ANA',
      'WB',
      'BI',
    ];

    const checkDate = (dateStr) => {
      const givenDate = new Date(dateStr);
      const currentDate = new Date();
      const diffInDays = Math.ceil(
        (givenDate - currentDate) / (1000 * 60 * 60 * 24),
      );
      if (diffInDays >= 3) {
        return givenDate.toISOString().split('T')[0];
      }
      const dayDifference = 3 - diffInDays;
      givenDate.setDate(givenDate.getDate() + dayDifference);
      return givenDate.toISOString().split('T')[0];
    };
    const Ticketdate = checkDate(departuredate);
    console.log('departuredate', Ticketdate);

    const requestData = {
      originLocationCode: originLocationcode,
      destinationLocationCode: destinationLocationcode,
      departureDate: Ticketdate,
      adults: Pax,
      max: Max,
    };
    console.log('requestData', requestData);

    await axios
      .get(apiUrl, {
        params: requestData,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      })
      .then(async (response) => {
        console.log('response Data data line 989', response.data.data);
        const filteredData = response.data.data.filter((item) => {
          const segments = item.itineraries.flatMap((itinerary) => itinerary.segments);

          // Ensure all segments have valid `operating.carrierCode`
          const isValid = segments.every((segment) => {
            const operatingCarrierCode = segment.operating?.carrierCode;
            console.log('Operating Carrier Code:', operatingCarrierCode); // Debugging
            return airlines.includes(operatingCarrierCode); // Match only allowed airlines
          });

          console.log('Is Valid:', isValid); // Debugging
          return isValid; // Include only valid items
        });

        console.log('filteredData', filteredData);

        filteredData.forEach((itemData) => {
          const a = 7;
          const b = 20;

          const qualifyingItinerariesForNoTechStop =
            itemData.itineraries.filter((itinerarie) => {
              return itinerarie.segments.length === 1;
            });

          if (qualifyingItinerariesForNoTechStop.length > 0) {
            console.log(
              'qualifyingItinerariesForNoTechStop line 778',
              qualifyingItinerariesForNoTechStop,
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
                  100,
                ),
              },
              From: originLocationcode,
              To: destinationLocationcode,
            });
            const sortedAircraftByPrice = SingleAllAircraft.slice().sort(
              (a, b) => {
                a.price.grandTotal - b.price.grandTotal;
              },
            );

            console.log(
              'sortedAircraftByPrice IS this now::',
              sortedAircraftByPrice,
            );

            ResponseData.AirCraftDatawithNotechStop = sortedAircraftByPrice;
            ResponseData.TicketAvailability = Ticketdate;
            console.log('ResponseData is now :::', ResponseData);
          }
          const qualifyingItinerariesForTechStop = itemData.itineraries.filter(
            (itinerarie) => {
              return (
                itinerarie.segments.length >= 2 &&
                itinerarie.segments[1].carrierCode ===
                itinerarie.segments[0].carrierCode
              );
            },
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
                  100,
                ),
              },
              From: originLocationcode,
              To: destinationLocationcode,
            });

            const sortedAircraftByPrice = TechStopAircraft.slice().sort(
              (a, b) => {
                a.price.grandTotal - b.price.grandTotal;
              },
            );
            console.log(
              'sortedAircraftByPrice IS this now::',
              sortedAircraftByPrice,
            );
            ResponseData.AirCraftDatawithtechStop = sortedAircraftByPrice;
            ResponseData.TicketAvailability = Ticketdate;
            console.log('ResponseData is now :::', ResponseData);
          }
        });
        console.log('ResponseData line ', ResponseData);

        const ResultData = new AmadusAircraft({
          Response: ResponseData,
        });
        ResultData.save();
        console.log('ResultData', ResultData);
        aircraftId = ResultData._id;

        const payload = [
          originLocationCode,
          destinationLocationCode,
          departureDate,
          pax,
          mobile,
          countryCode,
        ];
        // const HEADERS = [
        //   'From',
        //   'To',
        //   'Date',
        //   'Passengers',
        //   ' mobile',
        //   'countryCode',
        // ];
        // console.log('aircraftId line 1305', aircraftId, HEADERS);
        // if (ResponseData != null || undefined) {
        //   await PayloadStoring(
        //     payload,
        //     '1CR07x7mcGQGtm4e6hRha9ckBN-QhZM6ApMNdny41YFU',
        //     HEADERS,
        //   );

        //   // let whatsappMessage = `*Patient's enquiry:* \n\n*From:* ${originLocationCode} \n*To:* ${destinationLocationCode} \n*Date:* ${departureDate} \n*Contact Number:* ${countryCode} ${mobile}`;

        //   // sendWhatsAppMessage('+917777920323', whatsappMessage);

        //   sendSearchMail(
        //     originLocationCode,
        //     destinationLocationCode,
        //     departureDate,
        //     pax,
        //     mobile,
        //     countryCode,
        //   );
        // }
        res.json({ aircraftId: aircraftId, ResponseData: ResponseData });
        console.log('aircraftId line 1305', aircraftId);
      });

    return { aircraftId, ResponseData };
  } catch (error) {
    return res.status(500).json({ error: error });
  }
};


exports.calculateFlightTime = async (req, res) => {
  const {
    originLocationCode,
    destinationLocationCode,
    pax,
    departureDate,
    mobile,
    countryCode,
  } = req.body;

  if (
    originLocationCode === undefined ||
    destinationLocationCode === undefined ||
    departureDate === undefined ||
    pax === undefined ||
    mobile === undefined ||
    countryCode === undefined
  ) {
    return res.status(400).json({
      success: false,
      msg: 'originLocationCode,destinationLocationCode,departureDate,pax,mobile,countryCode are required',
    });
  } else if (
    typeof originLocationCode !== 'string' ||
    typeof destinationLocationCode !== 'string' ||
    typeof departureDate !== 'string' ||
    typeof pax !== 'number' ||
    typeof mobile !== 'string' ||
    typeof countryCode !== 'string'
  ) {
    return res.status(400).json({
      error:
        'originLocationCode,destinationLocationCode,departureDate,mobile,countryCode must be a string and pax must be a number',
    });
  } else if (
    originLocationCode === '' ||
    destinationLocationCode === '' ||
    departureDate === '' ||
    pax === 0 ||
    mobile === '' ||
    countryCode === ''
  ) {
    return res.status(400).json({
      success: false,
      msg: `originLocationCode,destinationLocationCode,departureDate,mobile,countryCode cant take an empty string value i.e '' and pax cant be 0`,
    });
  }

  async function fetchAirportData(departureAirportCode) {
    const responseSearch = await axios.get(
      'https://dir.aviapages.com/api/airports/',
      {
        headers: {
          accept: 'application/json',
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
      method: 'post',
      url: 'https://frc.aviapages.com/flight_calculator/',
      headers: {
        'Content-Type': 'application/json',
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
      const departureAirportCode = originLocationCode;

      // Fetch airport data with caching
      const responseSearch = await fetchAirportData(departureAirportCode);

      const aircraftOperators = await AircraftOPerator.find();
      console.log(aircraftOperators);

      const validAircraftOperators = aircraftOperators.filter(
        (operator) =>
          operator.country_name === responseSearch.results[0].country_name
      );

      // Calculate distances for each operato
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
              originLocationCode,
              operator.icao,
              operator.Aircraft_type
            );

            return {
              operator,
              distance,
              timeHours,
              aviapagesResponse: aviapagesResponse,
            };
          } catch (error) {
            return res.status(500).json({ error: 'error Occurred ' });
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

  async function nearestOperatorToOutsideRegion() {
    try {
      const departureAirportCode = originLocationCode;

      // Fetch airport data with caching
      const responseSearch = await fetchAirportData(departureAirportCode);

      const aircraftOperators = await AircraftOPerator.find();
      console.log(aircraftOperators);

      // Function to get the location coordinates asynchronously
      const getOperatorLocation = async (operator) => {
        const operatorLocation = await getLatLonFromLocation(operator.location);
        return {
          ...operator,
          lat: operatorLocation.lat,
          lon: operatorLocation.lon,
        };
      };

      // Now, to find the 5 nearest countries to the selected country:
      const validAircraftOperators = await Promise.all(
        aircraftOperators
          .filter((operator) => operator.country_name !== responseSearch.results[0].country_name) // Exclude the selected country
          .map(async (operator) => {
            const operatorWithCoordinates = await getOperatorLocation(operator);
            const distance = haversineDistance(
              operatorWithCoordinates.lat,
              operatorWithCoordinates.lon,
              responseSearch.results[0].latitude,
              responseSearch.results[0].longitude,

            );
            return { ...operatorWithCoordinates._doc, distance };
          })
      );

      // Sort by distance, ascending
      validAircraftOperators.sort((a, b) => a.distance - b.distance);
      console.log('validAircraftOperators duue to countrtyb outside line 1262', validAircraftOperators.sort((a, b) => a.distance - b.distance));


      // Take the top 5 nearest countries
      const nearestOperatorToOutsideRegion = validAircraftOperators.slice(0, 5);

      console.log("nearestOperatorToOutsideRegion line 1268", nearestOperatorToOutsideRegion); // Display the 5 nearest countries

      console.log("1315", nearestOperatorToOutsideRegion);

      return nearestOperatorToOutsideRegion
    } catch (error) {
      throw error;
    }
  }


  const nearestOperator = await calculateNearestOperator();



  if (nearestOperator.length === 0) {
    //No nearest distance to the departure location Request is outside of the country 

    let finalToCustomerPlace = [];
    let operatorsWithoutTechStop = [];
    let operatorsWithoutTechStopCalculated = [];
    let operatorsWithTechStop = [];
    try {

      const nearestOperators = await nearestOperatorToOutsideRegion()
      console.log('everything works 1329', nearestOperators);
      console.log('this is length 1289', nearestOperators.length);


      const nearestOperatorsWithNoTechstopPromises = nearestOperators.map(async (operator) => {
        console.log("welome operetor line icao is this line 1298", operator.icao);

        let from = operator.icao.toString();
        let to = originLocationCode.toString();
        let departure_datetime = departureDate.toString();
        let dataa = `{"departure_airport": "${from}", "arrival_airport": "${to}", "aircraft": "${operator.Aircraft_type}", "pax":"${pax}", "departure_datetime":"${departure_datetime}", "airway_time": true, "advise_techstops": true}\r\n`;
        console.log('THis is operator line 1306', operator);
        const response = await axios(buildRequestConfig(dataa));
        console.log('response is line 1044' + response.data);

        if (
          !response.data.airport.techstop ||
          response.data.airport.techstop.length === 0
        ) {
          const totalTimeFromToto = response.data.time.airway / 60;
          console.log(totalTimeFromToto);
          const data = {
            ...operator,
            totalTime: totalTimeFromToto,
            price:
              operator.charges_per_hour * (totalTimeFromToto),
            totalPriceWithAdminMargin:
              (operator.charges_per_hour * (totalTimeFromToto)) +
              ((operator.charges_per_hour) * (totalTimeFromToto) * (operator.margin / 100)),
            from: from,
            to: to,
          };
          console.log('line 1322 data', data);
          finalToCustomerPlace.push(data);
          // finalToCustomerPlace.push(data)
        }
        else {
          operatorsWithTechStop.push(operator);
        }
        // Wait for all promises to complete
      });
      await Promise.all(nearestOperatorsWithNoTechstopPromises);
      console.log("finalTocustomerplace line 140", operatorsWithoutTechStop);
      if (operatorsWithoutTechStop.length === 0) {
        console.log('am sorry cant travel 1340', operatorsWithoutTechStop.length);

      }

      console.log("finalTocustomerplace line 1342", operatorsWithTechStop);

      if (!finalToCustomerPlace.length >= 1 || !finalToCustomerPlace.length >= 2) {
        const nearestOperatorsWithTechstoppPromises = operatorsWithTechStop.map(async (operator) => {
          console.log("welome operetor line icao is this line 1298", operator.icao);

          let from = operator.icao.toString();
          let to = originLocationCode.toString();
          let departure_datetime = departureDate.toString();

          let dataa = `{"departure_airport": "${from}", "arrival_airport": "${to}", "aircraft": "${operator.Aircraft_type}", "pax":"${pax}", "departure_datetime":"${departure_datetime}", "airway_time": true, "advise_techstops": true}\r\n`;
          console.log('THis is operator line 1306', operator);
          const response = await axios(buildRequestConfig(dataa));
          console.log('response is line 1044' + response.data);


          if (response.data.airport.techstop ||
            response.data.airport.techstop.length !== 0) {
            // for getting at least max techstop during the journey to customer place if it happpened
            let selectedTechStops = [];
            let usedTime = [];
            let techStopAirportDetails = [];
            let techStopAirport;
            let finalLegTechStopDepatureOne;

            for (let i = 0; i < response.data.airport.techstop.length; i++) {
              techStopAirport = response.data.airport.techstop[i];
              console.log('this techStopAirport line 1092', techStopAirport);
              techStopAirportDetails.push(techStopAirport);
              previousAirport = techStopAirport;

              if (i === 0) {
                let techStopData = `{
                "departure_airport": "${from}",
                "arrival_airport": "${to}",
                "aircraft": "${operator.Aircraft_type}",
                "pax":"${pax}",
                "departure_datetime":"${departure_datetime}",
                "airway_time": true,
                "advise_techstops": true
              }`;

                let techStopResponse = await axios(
                  buildRequestConfig(techStopData)
                );
                let techStopAirport = techStopResponse.data.airport.techstop;
                techStopAirportDetails.push(techStopAirport);

                console.log('techStopResponse line 1113', techStopResponse.data);

                while (techStopResponse.data.time.airway == null) {
                  if (techStopResponse.data.airport.techstop.length > 0) {
                    techStopAirport = techStopResponse.data.airport.techstop[0];

                    techStopData = `{
                    "departure_airport": "${originLocationCode}",
                    "arrival_airport": "${techStopAirport}",
                    "aircraft": "${operator.Aircraft_type}",
                    "pax":"${pax}",
                    "departure_datetime":"${departure_datetime}",
                    "airway_time": true,
                    "advise_techstops": true
                  }`;

                    techStopResponse = await axios(
                      buildRequestConfig(techStopData)
                    );
                    console.log('techStopResponse line 1136', {
                      op: techStopResponse.data,
                      from: techStopData,
                    });
                  } else {
                    break;
                  }
                }

                if (techStopResponse.data.time.airway != null) {
                  console.log('yes am not null 1334', techStopResponse.data.time.airway);

                  firstLegTime = techStopResponse.data.time.airway;
                  usedTime.push(firstLegTime);
                  console.log('firstLeg', firstLegTime);
                  console.log('Thsi is used time now line 1339', usedTime);

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
            async function continueJourneypartOne(
              fromAirport,
              toAirport,
              aircraft
            ) {
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
                console.log('Tech Stop Response line 1176', {
                  op: techStopResponse.data,
                  from: techStopData,
                });

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

                  console.log('Airway Time Responsee', airwayTimeResponse.data);
                  console.log('Tech Stop Response line 1201', {
                    op: airwayTimeResponse.data,
                    from: airwayTimeData,
                  });

                  // Update the finalLegTechStopDepature
                  finalLegTechStopDepatureOne = nextTechStop;
                  if (airwayTimeResponse.data.time.airway != null) {
                    usedTime.push(airwayTimeResponse.data.time.airway);
                    finalLegTechStopDepatureOne =
                      airwayTimeResponse.data.airport.arrival_airport;
                    if (airwayTimeResponse.data.airport.arrival_airport != to) {
                      selectedTechStops.push(
                        airwayTimeResponse.data.airport.arrival_airport
                      );
                    }
                    console.log(
                      'finalLegTechStopDepatureOneo',
                      finalLegTechStopDepatureOne
                    );
                  }
                }
              }

              // console.log("Total Tech Stop Timeeee:", totalTechStopTime);
              console.log('Final Destinationww:', toAirport);

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
                  console.log('Tech Stop Response', techStopResponse.data);
                  continueJourneyTimeThree = techStopResponse.data.time.airway;
                  console.log('continueJourneyTimeThree 1451', continueJourneyTimeThree);

                  console.log('Tech Stop Response line 1253', {
                    op: techStopResponse.data,
                    from: techStopData,
                  });

                  if (
                    techStopResponse.data.time.airway != null
                  ) {
                    usedTime.push(techStopResponse.data.time.airway);
                    console.log('used time in this time is now 1463', usedTime);


                    if (techStopResponse.data.airport.arrival_airport != to) {

                      selectedTechStops.push(
                        techStopResponse.data.airport.arrival_airport
                      );

                    }

                    console.log('selected techstop 1545', selectedTechStops);

                  }

                  if (
                    techStopResponse.data.airport.techstop &&
                    techStopResponse.data.airport.techstop.length > 0
                  ) {
                    // If tech stops are suggested, pick the first one

                    const nextTechStop = techStopResponse.data.airport.techstop[0];
                    console.log('This next here', nextTechStop);

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
                      'Airway Time Responsee2222',
                      airwayTimeResponse.data.airport.techstop
                    );
                    console.log('Tech Stop Response line 1285', {
                      op: airwayTimeResponse.data,
                      from: airwayTimeData,
                    });
                    // Update the finalLegTechStopDepature
                    finalLegTechStopDepatureOne = nextTechStop;
                    if (airwayTimeResponse.data.time.airway != null) {
                      usedTime.push(airwayTimeResponse.data.time.airway);
                      console.log('firstLeg', firstLegTime);
                      finalLegTechStopDepatureOne =
                        airwayTimeResponse.data.airport.arrival_airport;
                      if (airwayTimeResponse.data.airport.arrival_airport != to) {
                        selectedTechStops.push(
                          airwayTimeResponse.data.airport.arrival_airport
                        );
                      }
                      console.log(
                        'finalLegTechStopDepatureOne',
                        finalLegTechStopDepatureOne
                      );
                    }
                  }
                }

                console.log('Total Tech Stop Timeeee:', totalTechStopTime);
                console.log('Final Destinationww:', toAirport);
              }
              // for knowing the averagespeed from the From to To Location
              async function KnowAverageSpeedTime(
                fromAirport,
                toAirport,
                aircraft
              ) {
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
                  'Tech Stop Response in while loop',
                  techStopResponse.data
                );

                console.log('finalLegAverageSpeedTime', finalLegAverageSpeedTime);

                if (techStopResponse.data) {
                  const finalLegAverageSpeedInAirwayFormat =
                    finalLegAverageSpeedTime / 60;
                  console.log('My techstop average time 1558', finalLegAverageSpeedTime);

                  let total = 0;

                  for (let i = 0; i < usedTime.length; i++) {
                    total += usedTime[i];
                    console.log('total time 1564', total);

                  }

                  const totalTimeFromToto =
                    (finalLegAverageSpeedInAirwayFormat + (total / 60))
                  console.log(totalTimeFromToto);
                  console.log('this total time for nowoo', totalTimeFromToto);

                  const data = {
                    ...operator,
                    totalTime: totalTimeFromToto,
                    techStopAirport: {
                      selectedTechStops: selectedTechStops,
                      techStopTime: `${0.5}hour / 45minute`,
                      techStopCost: `${50000}rs`,
                    },
                    TotalPriceWithTechStop:
                      operator.charges_per_hour *
                      (totalTimeFromToto +
                        selectedTechStops.length * 0.5) +
                      selectedTechStops.length * 50000,
                    totalPriceWithTechStopAndAdminMargin:
                      operator.charges_per_hour *
                      (totalTimeFromToto +
                        selectedTechStops.length * 0.5) +
                      selectedTechStops.length * 50000 +
                      ((operator.charges_per_hour *
                        (totalTimeFromToto +
                          selectedTechStops.length * 0.5) +
                        selectedTechStops.length * 50000) *
                        operator.margin) /
                      100,
                    from: from,
                    to: to,
                  };

                  operatorsWithoutTechStopCalculated.push(data);
                }
              }
              KnowAverageSpeedTime(from, to, operator.Aircraft_type);
              continueJourneypartTwo(
                finalLegTechStopDepatureOne,
                to,
                operator.Aircraft_type
              );
              console.log('selectedTechStops', selectedTechStops);
            }

            continueJourneypartOne(
              finalLegTechStopDepatureOne,
              to,
              operator.Aircraft_type
            );
          }
        })

        await Promise.all(nearestOperatorsWithTechstoppPromises)
        finalToCustomerPlace.push(...operatorsWithoutTechStopCalculated)
        console.log('my final to customer place is now 1709', operatorsWithoutTechStopCalculated);


      }


      //for real customer journey joureny to final destination
      try {

        console.log('everything works', finalToCustomerPlace);

        let final = [];
        finalToCustomerPlace.map(async (operator) => {
          console.log("welome operetor line", operator);

          let from = originLocationCode.toString();

          let to = destinationLocationCode.toString();
          let departure_datetime = departureDate.toString();

          let dataa = `{"departure_airport": "${from}", "arrival_airport": "${to}", "aircraft": "${operator.Aircraft_type}", "pax":"${pax}", "departure_datetime":"${departure_datetime}", "airway_time": true, "advise_techstops": true}\r\n`;
          console.log('THis is operator line 1039', operator);
          const response = await axios(buildRequestConfig(dataa));
          console.log('response is line 1044' + response.data);

          if (
            !response.data.airport.techstop ||
            response.data.airport.techstop.length === 0
          ) {
            const totalTimeFromToto = response.data.time.airway / 60;
            console.log(totalTimeFromToto);
            const data = {
              ...operator,
              totalTime: operator.totalTime + (totalTimeFromToto),
              price: operator.price + (operator.charges_per_hour * (totalTimeFromToto)),
              totalPriceWithAdminMargin: operator.totalPriceWithTechStopAndAdminMargin ? operator.totalPriceWithTechStopAndAdminMargin + (operator.charges_per_hour * (totalTimeFromToto) + (operator.charges_per_hour *
                (totalTimeFromToto) *
                (operator.margin / 100))) : operator.totalPriceWithAdminMargin + (operator.charges_per_hour * (totalTimeFromToto) + (operator.charges_per_hour *
                  (totalTimeFromToto) *
                  (operator.margin / 100))),
              from: from,
              to: to,
            };

            final.push(data);
            if (final.length === finalToCustomerPlace.length) {
              const ResultData = new AvipageAircraft({
                Response: final,
              });
              ResultData.save();
              console.log('This is ResultData', ResultData);
              aircraftId = ResultData._id;
              console.log('This is ResultData', ResultData);
              return res.json({ final, aircraftId: aircraftId });


            }
          }
          else {
            setTimeout(async () => {
              // for getting at least max techstop during the journey
              let selectedTechStops = [];
              let usedTime = [];
              let techStopAirportDetails = [];
              let techStopAirport;
              let finalLegTechStopDepatureOne;

              for (let i = 0; i < response.data.airport.techstop.length; i++) {
                techStopAirport = response.data.airport.techstop[i];
                console.log('this techStopAirport line 1092', techStopAirport);
                techStopAirportDetails.push(techStopAirport);
                previousAirport = techStopAirport;

                if (i === 0) {
                  let techStopData = `{
                   "departure_airport": "${from}",
                   "arrival_airport": "${to}",
                   "aircraft": "${operator.Aircraft_type}",
                   "pax":"${pax}",
                   "departure_datetime":"${departure_datetime}",
                   "airway_time": true,
                   "advise_techstops": true
                 }`;

                  let techStopResponse = await axios(
                    buildRequestConfig(techStopData)
                  );
                  let techStopAirport = techStopResponse.data.airport.techstop;
                  techStopAirportDetails.push(techStopAirport);

                  console.log('techStopResponse line 1113', techStopResponse.data);

                  while (techStopResponse.data.time.airway == null) {
                    if (techStopResponse.data.airport.techstop.length > 0) {
                      techStopAirport = techStopResponse.data.airport.techstop[0];

                      techStopData = `{
                       "departure_airport": "${originLocationCode}",
                       "arrival_airport": "${techStopAirport}",
                       "aircraft": "${operator.Aircraft_type}",
                       "pax":"${pax}",
                       "departure_datetime":"${departure_datetime}",
                       "airway_time": true,
                       "advise_techstops": true
                     }`;

                      techStopResponse = await axios(
                        buildRequestConfig(techStopData)
                      );
                      console.log('techStopResponse line 1136', {
                        op: techStopResponse.data,
                        from: techStopData,
                      });
                    } else {
                      break;
                    }
                  }

                  if (techStopResponse.data.time.airway != null) {
                    console.log('yes am not null 1334', techStopResponse.data.time.airway);

                    firstLegTime = techStopResponse.data.time.airway;
                    usedTime.push(firstLegTime);
                    console.log('firstLeg', firstLegTime);
                    console.log('Thsi is used time now line 1339', usedTime);

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
              async function continueJourneypartOne(
                fromAirport,
                toAirport,
                aircraft
              ) {
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
                  console.log('Tech Stop Response line 1176', {
                    op: techStopResponse.data,
                    from: techStopData,
                  });

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

                    console.log('Airway Time Responsee', airwayTimeResponse.data);
                    console.log('Tech Stop Response line 1201', {
                      op: airwayTimeResponse.data,
                      from: airwayTimeData,
                    });

                    // Update the finalLegTechStopDepature
                    finalLegTechStopDepatureOne = nextTechStop;
                    if (airwayTimeResponse.data.time.airway != null) {
                      usedTime.push(airwayTimeResponse.data.time.airway);
                      finalLegTechStopDepatureOne =
                        airwayTimeResponse.data.airport.arrival_airport;
                      if (airwayTimeResponse.data.airport.arrival_airport != to) {
                        selectedTechStops.push(
                          airwayTimeResponse.data.airport.arrival_airport
                        );
                      }
                      console.log(
                        'finalLegTechStopDepatureOneo',
                        finalLegTechStopDepatureOne
                      );
                    }
                  }
                }

                // console.log("Total Tech Stop Timeeee:", totalTechStopTime);
                console.log('Final Destinationww:', toAirport);

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
                    console.log('Tech Stop Response', techStopResponse.data);
                    continueJourneyTimeThree = techStopResponse.data.time.airway;
                    console.log('continueJourneyTimeThree 1451', continueJourneyTimeThree);

                    console.log('Tech Stop Response line 1253', {
                      op: techStopResponse.data,
                      from: techStopData,
                    });

                    if (
                      techStopResponse.data.time.airway != null
                    ) {
                      usedTime.push(techStopResponse.data.time.airway);
                      console.log('used time in this time is now 1463', usedTime);


                      if (techStopResponse.data.airport.arrival_airport != to) {

                        selectedTechStops.push(
                          techStopResponse.data.airport.arrival_airport
                        );

                      }

                      console.log('selected techstop 1545', selectedTechStops);

                    }

                    if (
                      techStopResponse.data.airport.techstop &&
                      techStopResponse.data.airport.techstop.length > 0
                    ) {
                      // If tech stops are suggested, pick the first one

                      const nextTechStop = techStopResponse.data.airport.techstop[0];
                      console.log('This next here', nextTechStop);

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
                        'Airway Time Responsee2222',
                        airwayTimeResponse.data.airport.techstop
                      );
                      console.log('Tech Stop Response line 1285', {
                        op: airwayTimeResponse.data,
                        from: airwayTimeData,
                      });
                      // Update the finalLegTechStopDepature
                      finalLegTechStopDepatureOne = nextTechStop;
                      if (airwayTimeResponse.data.time.airway != null) {
                        usedTime.push(airwayTimeResponse.data.time.airway);
                        console.log('firstLeg', firstLegTime);
                        finalLegTechStopDepatureOne =
                          airwayTimeResponse.data.airport.arrival_airport;
                        if (airwayTimeResponse.data.airport.arrival_airport != to) {
                          selectedTechStops.push(
                            airwayTimeResponse.data.airport.arrival_airport
                          );
                        }
                        console.log(
                          'finalLegTechStopDepatureOne',
                          finalLegTechStopDepatureOne
                        );
                      }
                    }
                  }

                  console.log('Total Tech Stop Timeeee:', totalTechStopTime);
                  console.log('Final Destinationww:', toAirport);
                }
                // for knowing the averagespeed from the From to To Location
                async function KnowAverageSpeedTime(
                  fromAirport,
                  toAirport,
                  aircraft
                ) {
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
                    'Tech Stop Response in while loop',
                    techStopResponse.data
                  );

                  console.log('finalLegAverageSpeedTime', finalLegAverageSpeedTime);

                  if (techStopResponse.data) {
                    const finalLegAverageSpeedInAirwayFormat =
                      finalLegAverageSpeedTime / 60;
                    console.log('My techstop average time 1558', finalLegAverageSpeedTime);

                    let total = 0;

                    for (let i = 0; i < usedTime.length; i++) {
                      total += usedTime[i];
                      console.log('total time 1564', total);

                    }

                    const totalTimeFromToto =
                      (finalLegAverageSpeedInAirwayFormat + (total / 60))
                    console.log(totalTimeFromToto);
                    console.log('this total time for nowoo', totalTimeFromToto);

                    const data = {
                      ...operator,
                      totalTime: operator.totalTime + (totalTimeFromToto),
                      techStopAirport: {
                        selectedTechStops: operator.techStopAirport ? [...operator.techStopAirport.selectedTechStops, ...selectedTechStops] : selectedTechStops,
                        techStopTime: `${0.5}hour / 45minute`,
                        techStopCost: `${50000}rs`,
                      },
                      TotalPriceWithTechStop: operator.TotalPriceWithTechStop ?
                        operator.TotalPriceWithTechStop + (operator.charges_per_hour *
                          (totalTimeFromToto + selectedTechStops.length * 0.5) +
                          (selectedTechStops.length * 50000)) : (operator.charges_per_hour *
                            (totalTimeFromToto + selectedTechStops.length * 0.5) +
                            (selectedTechStops.length * 50000)),
                      totalPriceWithTechStopAndAdminMargin: operator.totalPriceWithTechStopAndAdminMargin ?
                        operator.totalPriceWithTechStopAndAdminMargin + (operator.charges_per_hour *
                          (totalTimeFromToto + (selectedTechStops.length * 0.5))) +
                        (selectedTechStops.length * 50000) + (((operator.charges_per_hour) * (totalTimeFromToto + (selectedTechStops.length * 0.5)) +
                          (selectedTechStops.length * 50000)) *
                          (operator.margin)) /
                        100 : (operator.charges_per_hour *
                          (totalTimeFromToto + (selectedTechStops.length * 0.5))) +
                        (selectedTechStops.length * 50000) + (((operator.charges_per_hour) * (totalTimeFromToto + (selectedTechStops.length * 0.5)) +
                          (selectedTechStops.length * 50000)) *
                          (operator.margin)) /
                        100,
                      from: from,
                      to: to,
                    };

                    final.push(data);
                    if (final.length === finalToCustomerPlace.length) {
                      const ResultData = new AvipageAircraft({
                        Response: final,
                      });
                      ResultData.save();
                      console.log('This is ResultData', ResultData);
                      aircraftId = ResultData._id;
                      console.log('This is ResultData', ResultData);
                      return res.json({ final, aircraftId: aircraftId })
                    }
                  }
                }
                KnowAverageSpeedTime(from, to, operator.Aircraft_type);
                continueJourneypartTwo(
                  finalLegTechStopDepatureOne,
                  to,
                  operator.Aircraft_type
                );
                console.log('selectedTechStops', selectedTechStops);
              }

              continueJourneypartOne(
                finalLegTechStopDepatureOne,
                to,
                operator.Aircraft_type
              );
            }, 40000);
          }
        });

      } catch (error) {
        console.error(error);
        return res
          .status(500)
          .json({ error: `Failed to calculate flight time ${error}` });
      }

    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ error: `Failed to calculate flight time ${error}` });

    }


  }

  else if (nearestOperator.length > 0) {
    try {

      console.log('everything works', nearestOperator);

      let final = [];
      nearestOperator.map(async (operator) => {
        console.log("welome operetor line", operator);

        let from = originLocationCode.toString();

        let to = destinationLocationCode.toString();
        let departure_datetime = departureDate.toString();

        let dataa = `{"departure_airport": "${from}", "arrival_airport": "${to}", "aircraft": "${operator.operator.Aircraft_type}", "pax":"${pax}", "departure_datetime":"${departure_datetime}", "airway_time": true, "advise_techstops": true}\r\n`;
        console.log('THis is operator line 1039', operator);
        const response = await axios(buildRequestConfig(dataa));
        console.log('response is line 1044' + response.data);

        if (
          !response.data.airport.techstop ||
          response.data.airport.techstop.length === 0
        ) {
          const totalTimeFromToto = response.data.time.airway / 60;
          console.log(totalTimeFromToto);
          const data = {
            ...operator,
            totalTime: (operator.aviapagesResponse.time.airway + totalTimeFromToto),
            price:
              operator.operator.charges_per_hour *
              (operator.aviapagesResponse.time.airway + totalTimeFromToto),
            totalPriceWithAdminMargin:
              operator.operator.charges_per_hour *
              (operator.aviapagesResponse.time.airway + totalTimeFromToto) +
              operator.operator.charges_per_hour *
              (operator.aviapagesResponse.time.airway + totalTimeFromToto) *
              (operator.operator.margin / 100),
            from: from,
            to: to,
          };

          final.push(data);
          if (final.length === nearestOperator.length) {
            const ResultData = new AvipageAircraft({
              Response: final,
            });
            ResultData.save();
            console.log('This is ResultData', ResultData);
            aircraftId = ResultData._id;
            console.log('This is ResultData', ResultData);
            return res.json({ final, aircraftId: aircraftId })
          }
        }
        else {
          // for getting at least max techstop during the journey
          let selectedTechStops = [];
          let usedTime = [];
          let techStopAirportDetails = [];
          let techStopAirport;
          let finalLegTechStopDepatureOne;

          for (let i = 0; i < response.data.airport.techstop.length; i++) {
            techStopAirport = response.data.airport.techstop[i];
            console.log('this techStopAirport line 1092', techStopAirport);
            techStopAirportDetails.push(techStopAirport);
            previousAirport = techStopAirport;

            if (i === 0) {
              let techStopData = `{
              "departure_airport": "${from}",
              "arrival_airport": "${to}",
              "aircraft": "${operator.operator.Aircraft_type}",
              "pax":"${pax}",
              "departure_datetime":"${departure_datetime}",
              "airway_time": true,
              "advise_techstops": true
            }`;

              let techStopResponse = await axios(
                buildRequestConfig(techStopData)
              );
              let techStopAirport = techStopResponse.data.airport.techstop;
              techStopAirportDetails.push(techStopAirport);

              console.log('techStopResponse line 1113', techStopResponse.data);

              while (techStopResponse.data.time.airway == null) {
                if (techStopResponse.data.airport.techstop.length > 0) {
                  techStopAirport = techStopResponse.data.airport.techstop[0];

                  techStopData = `{
                  "departure_airport": "${originLocationCode}",
                  "arrival_airport": "${techStopAirport}",
                  "aircraft": "${operator.operator.Aircraft_type}",
                  "pax":"${pax}",
                  "departure_datetime":"${departure_datetime}",
                  "airway_time": true,
                  "advise_techstops": true
                }`;

                  techStopResponse = await axios(
                    buildRequestConfig(techStopData)
                  );
                  console.log('techStopResponse line 1136', {
                    op: techStopResponse.data,
                    from: techStopData,
                  });
                } else {
                  break;
                }
              }

              if (techStopResponse.data.time.airway != null) {
                console.log('yes am not null 1334', techStopResponse.data.time.airway);

                firstLegTime = techStopResponse.data.time.airway;
                usedTime.push(firstLegTime);
                console.log('firstLeg', firstLegTime);
                console.log('Thsi is used time now line 1339', usedTime);

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
          async function continueJourneypartOne(
            fromAirport,
            toAirport,
            aircraft
          ) {
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
              console.log('Tech Stop Response line 1176', {
                op: techStopResponse.data,
                from: techStopData,
              });

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

                console.log('Airway Time Responsee', airwayTimeResponse.data);
                console.log('Tech Stop Response line 1201', {
                  op: airwayTimeResponse.data,
                  from: airwayTimeData,
                });

                // Update the finalLegTechStopDepature
                finalLegTechStopDepatureOne = nextTechStop;
                if (airwayTimeResponse.data.time.airway != null) {
                  usedTime.push(airwayTimeResponse.data.time.airway);
                  finalLegTechStopDepatureOne =
                    airwayTimeResponse.data.airport.arrival_airport;
                  if (airwayTimeResponse.data.airport.arrival_airport != to) {
                    selectedTechStops.push(
                      airwayTimeResponse.data.airport.arrival_airport
                    );
                  }
                  console.log(
                    'finalLegTechStopDepatureOneo',
                    finalLegTechStopDepatureOne
                  );
                }
              }
            }

            // console.log("Total Tech Stop Timeeee:", totalTechStopTime);
            console.log('Final Destinationww:', toAirport);

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
                console.log('Tech Stop Response', techStopResponse.data);
                continueJourneyTimeThree = techStopResponse.data.time.airway;
                console.log('continueJourneyTimeThree 1451', continueJourneyTimeThree);

                console.log('Tech Stop Response line 1253', {
                  op: techStopResponse.data,
                  from: techStopData,
                });

                if (
                  techStopResponse.data.time.airway != null
                ) {
                  usedTime.push(techStopResponse.data.time.airway);
                  console.log('used time in this time is now 1463', usedTime);


                  if (techStopResponse.data.airport.arrival_airport != to) {

                    selectedTechStops.push(
                      techStopResponse.data.airport.arrival_airport
                    );

                  }

                  console.log('selected techstop 1545', selectedTechStops);

                }

                if (
                  techStopResponse.data.airport.techstop &&
                  techStopResponse.data.airport.techstop.length > 0
                ) {
                  // If tech stops are suggested, pick the first one

                  const nextTechStop = techStopResponse.data.airport.techstop[0];
                  console.log('This next here', nextTechStop);

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
                    'Airway Time Responsee2222',
                    airwayTimeResponse.data.airport.techstop
                  );
                  console.log('Tech Stop Response line 1285', {
                    op: airwayTimeResponse.data,
                    from: airwayTimeData,
                  });
                  // Update the finalLegTechStopDepature
                  finalLegTechStopDepatureOne = nextTechStop;
                  if (airwayTimeResponse.data.time.airway != null) {
                    usedTime.push(airwayTimeResponse.data.time.airway);
                    console.log('firstLeg', firstLegTime);
                    finalLegTechStopDepatureOne =
                      airwayTimeResponse.data.airport.arrival_airport;
                    if (airwayTimeResponse.data.airport.arrival_airport != to) {
                      selectedTechStops.push(
                        airwayTimeResponse.data.airport.arrival_airport
                      );
                    }
                    console.log(
                      'finalLegTechStopDepatureOne',
                      finalLegTechStopDepatureOne
                    );
                  }
                }
              }

              console.log('Total Tech Stop Timeeee:', totalTechStopTime);
              console.log('Final Destinationww:', toAirport);
            }
            // for knowing the averagespeed from the From to To Location
            async function KnowAverageSpeedTime(
              fromAirport,
              toAirport,
              aircraft
            ) {
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
                'Tech Stop Response in while loop',
                techStopResponse.data
              );

              console.log('finalLegAverageSpeedTime', finalLegAverageSpeedTime);

              if (techStopResponse.data) {
                const finalLegAverageSpeedInAirwayFormat =
                  finalLegAverageSpeedTime / 60;
                console.log('My techstop average time 1558', finalLegAverageSpeedTime);

                let total = 0;

                for (let i = 0; i < usedTime.length; i++) {
                  total += usedTime[i];
                  console.log('total time 1564', total);

                }

                const totalTimeFromToto =
                  (finalLegAverageSpeedInAirwayFormat + (total / 60))
                console.log(totalTimeFromToto);
                console.log('this total time for nowoo', totalTimeFromToto);

                const data = {
                  ...operator,
                  totalTime:
                    (operator.aviapagesResponse.time.airway + totalTimeFromToto),
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
                  from: from,
                  to: to,
                };

                final.push(data);
                if (final.length === nearestOperator.length) {
                  const ResultData = new AvipageAircraft({
                    Response: final,
                  });
                  ResultData.save();
                  console.log('This is ResultData', ResultData);
                  aircraftId = ResultData._id;
                  console.log('This is ResultData', ResultData);
                  return res.json({ final, aircraftId: aircraftId })

                }
              }
            }
            KnowAverageSpeedTime(from, to, operator.operator.Aircraft_type);
            continueJourneypartTwo(
              finalLegTechStopDepatureOne,
              to,
              operator.operator.Aircraft_type
            );
            console.log('selectedTechStops', selectedTechStops);
          }

          continueJourneypartOne(
            finalLegTechStopDepatureOne,
            to,
            operator.operator.Aircraft_type
          );
        }
      });

    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ error: `Failed to calculate flight time ${error}` });
    }
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
  // Radius of the Earth in kilometer
  const R = 6371;

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

exports.SingleAvipageAircraftdata = async (req, res, next) => {
  const { concatenatedParam } = req.params;
  if (concatenatedParam === null || undefined) {
    return res.status(400).json({
      success: false,
      msg: 'concatenatedParam is required',
    });
  }
  const [id, Child_id] = concatenatedParam.split('-');
  if (id === null || undefined || Child_id === null || undefined) {
    return res.status(400).json({
      success: false,
      msg: 'id or Child_id is missing',
    });
  }
  console.log('concatenatedParam', concatenatedParam);
  console.log('id line 1320', id);
  try {
    const aircraftData = await AvipageAircraft.findById(id);
    console.log('aircraftData', aircraftData);
    if (!aircraftData) {
      return res.status(404).send({ message: 'Aircraft not found' });
    } else if (aircraftData) {
      const specificOperator = aircraftData.Response.find(
        (item) => String(item.operator._id) === Child_id,
      );
      res.json(specificOperator);
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: 'Internal Server Error' });
  }
};

exports.SingleAmadusAircraftdata = async (req, res, next) => {
  const { concatenatedParam } = req.params;
  if (concatenatedParam === null || undefined) {
    return res.status(400).json({
      success: false,
      msg: 'concatenatedParam is required',
    });
  }
  const [id, Child_id] = concatenatedParam.split('-');
  if (id === null || undefined || Child_id === null || undefined) {
    return res.status(400).json({
      success: false,
      msg: 'id or Child_id is missing',
    });
  }
  console.log('concatenatedParam', concatenatedParam);
  console.log('id line 1320', id);
  try {
    const aircraftData = await AmadusAircraft.findById(id);
    console.log('aircraftData', aircraftData);
    if (!aircraftData) {
      return res.status(404).send({ message: 'Aircraft not found' });
    } else if (aircraftData) {
      if (aircraftData?.Response?.AirCraftDatawithNotechStop) {
        const specificAircraft =
          aircraftData?.Response?.AirCraftDatawithNotechStop.find(
            (item) => item.aircraft.id === Child_id,
          );
        console.log('specificAircraft', specificAircraft);
        res.json({ specificAircraft });
      } else if (aircraftData.Response?.AirCraftDatawithtechStop) {
        const specificAircraft =
          aircraftData.Response?.AirCraftDatawithtechStop.find(
            (item) => item.aircraft.id === Child_id,
          );
        console.log('specificAircraft', specificAircraft);
        res.json({ specificAircraft });
      }
    }
  } catch (error) {
    return res.status(500).send({ message: 'Internal Server Error' });
  }
};



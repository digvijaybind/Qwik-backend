const bcrypt = require('bcrypt');
const NodeCache = require('node-cache');
const axios = require('axios');
const { Operator } = require('../db/Operator');
const Role = require('../db/role');
const ErrorHandler = require('../utils/error-handler');
const OperatorService = require('../services/operator-service');
const generateToken = require('../configs/jwtToken');
const { isValidMobileNumber } = require('../regex/phoneNumberRegex');
const { isValidEmail } = require('../regex/emailRegex');

exports.Register = async (req, res, next) => {
  const {
    company_name,
    email_address,
    password,
    contact_number,
    country_name,
  } = req.body;

  if (
    company_name === undefined ||
    email_address === undefined ||
    password === undefined ||
    contact_number === undefined ||
    country_name === undefined
  ) {
    return res.status(400).json({
      success: false,
      msg: 'company_name,email_address,password,contact_number,country_name are required',
    });
  } else if (
    typeof company_name !== 'string' ||
    typeof email_address !== 'string' ||
    typeof password !== 'string' ||
    typeof contact_number !== 'string' ||
    typeof country_name !== 'string'
  ) {
    return res.status(400).json({
      error:
        'company_name,email_address,password,contact_number,country_name must be a string',
    });
  } else if (
    company_name === '' ||
    email_address === '' ||
    password === '' ||
    contact_number === '' ||
    country_name === ''
  ) {
    return res.status(400).json({
      success: false,
      msg: `company_name,email_address,password,contact_number,country_name cant take an empty string value i.e ''`,
    });
  } else if (!isValidMobileNumber(contact_number)) {
    return res.status(400).json({
      success: false,
      msg: 'Invalid contact_number',
    });
  } else if (!isValidEmail(email_address)) {
    return res.status(400).json({
      success: false,
      msg: 'Invalid email_address entered',
    });
  }
  const role = Role.OPERATOR;

  console.log(req.body);

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const findOperator = await Operator.findOne({
      email_address: email_address,
    });
    if (!findOperator) {
      // create new operator
      const newUser = new Operator({
        company_name,
        email_address,
        contact_number,
        country_name,

        password: hashedPassword,
        role: role,
      });

      console.log('line 86 operator deatils', newUser);
      // res.json(newUser);

      await newUser.save();

      res.status(201).json({ message: 'Operator register successfully' });
    } else {
      throw new Error('Operator already exist');
    }
  } catch (error) {
    throw new Error(error);
  }
};

exports.Login = async (req, res) => {
  const { email_address, password } = req.body;

  if (email_address === undefined || password === undefined) {
    return res.status(400).json({
      success: false,
      msg: 'email_address,password are required',
    });
  } else if (!isValidEmail(email_address)) {
    return res.status(400).json({
      success: false,
      msg: 'Invalid emailAddress entered',
    });
  }
  try {
    const user = await Operator.findOne({ email_address });

    if (!user) {
      return res.json({ message: 'user not found' });
    }
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(404).json({ message: 'inCorrect password' });
    }
    if (user && passwordMatch) {
      const aircraftCreatedByOPerator = user.aircraftOperators;
      console.log('operator login line 127', aircraftCreatedByOPerator);
      res.json({
        id: user?._id,
        email_address,
        password,

        token: generateToken(user?._id),
        aircraftCreatedByOPerator: aircraftCreatedByOPerator,
      });
    }
  } catch (error) {
    return res.status(500).json({ error: 'server error' });
  }
};

// Initialize a cache with a longer TTL (30 days)
const cache = new NodeCache({ stdTTL: 30 * 24 * 60 * 60 }); // Cache data for 30 days

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

//

exports.AddAircrafts = async (req, res, next) => {
  try {
    const searchCity = req.body.location;

    // Check if the data is already cached
    const cachedData = cache.get(searchCity);
    if (cachedData) {
      // If cached data exists, use it instead of making an API call
      const { icaoCode, country_name } = cachedData;

      const AirOperator = {
        Aircraft_type: req.body.Aircraft_type,
        Tail_sign: req.body.Tail_sign,
        location: req.body.location,
        charges_per_hour: req.body.charges_per_hour,
        speed: req.body.speed,
        icao: icaoCode,
        country_name: country_name,
        sr_no: req.body.sr_no,
      };
      console.log('line 194 operator details', AirOperator);
      if (
        AirOperator.Aircraft_type === undefined ||
        AirOperator.Tail_sign === undefined ||
        AirOperator.location === undefined ||
        AirOperator.charges_per_hour === undefined ||
        AirOperator.speed === undefined ||
        AirOperator.sr_no === undefined
      ) {
        return res.status(400).json({
          success: false,
          msg: 'Aircraft_type,Tail_sign,location,charges_per_hour,speed,sr_no are required',
        });
      } else if (
        typeof AirOperator.Aircraft_type !== 'string' ||
        typeof AirOperator.Tail_sign !== 'string' ||
        typeof AirOperator.location !== 'string' ||
        typeof AirOperator.charges_per_hour !== 'number' ||
        typeof AirOperator.speed !== 'number' ||
        typeof AirOperator.sr_no !== 'string'
      ) {
        return res.status(400).json({
          error:
            'Aircraft_type,Tail_sign,location,sr_no  must be a string and charges_per_hour,speed must be a number',
        });
      } else if (
        AirOperator.Aircraft_type === '' ||
        AirOperator.Tail_sign === '' ||
        AirOperator.location === '' ||
        AirOperator.charges_per_hour === 0 ||
        AirOperator.speed === 0 ||
        AirOperator.sr_no === ''
      ) {
        return res.status(400).json({
          success: false,
          msg: `Aircraft_type,Tail_sign,location,sr_no  cant take an empty string value i.e '' and charges_per_hour, speed must not be 0`,
        });
      }

      // Insert AirOperator into the database or perform other necessary actions
      const operator = await OperatorService.createOperator(AirOperator);

      // Update the Operator's aircraftOperators field with the new AircraftOperator's ID
      await Operator.findByIdAndUpdate(
        req.operator._id,
        {
          $push: {
            aircraftOperators: {
              aircraftOperator: operator._id,
              Aircraft_type: operator.Aircraft_type,
              Tail_sign: operator.Tail_sign,
              location: operator.location,
              charges_per_hour: operator.charges_per_hour,
              speed: operator.speed,
              icao: operator.icao,
              country_name: operator.country_name,
              margin: operator.margin,
              sr_no: operator.sr_no,
            },
          },
        },
        { new: true }
      );
      console.log('line 257 operator details', Operator);
      await operator.save();
      res.json({ message: 'Aircraft created successfully', AirOperator });
    } else {
      // If not cached, make the API call

      const tlsSocket = new MyTLSSocket();

      tlsSocket.on('close', () => {
        // Remove the listener to avoid memory leaks
        tlsSocket.emitter.removeListener('close', () => {
          // ...
        });
      });

      const response = await axios.get(
        'https://dir.aviapages.com/api/airports/',
        {
          headers: {
            accept: 'application/json',
            Authorization: process.env.AVID_API_TOKEN,
          },
          params: {
            search_city: searchCity, // Include the search_city query parameter in the request
          },
          socket: tlsSocket,
        }
      );

      let icaoCode = '';
      let country_name = '';

      if (response.status === 200) {
        if (response.data.results.length === 1) {
          icaoCode = response.data.results[0]
            ? response.data.results[0].icao
            : null;
          country_name = response.data.results[0]
            ? response.data.results[0].country_name
            : null;
        } else if (response.data.results.length > 1) {
          const results = response.data.results;
          for (const result of results) {
            console.log('result is ', result);

            if (result.icao) {
              icaoCode = result.icao;
              country_name = result.country_name;
              break;
            }
          }
        }

        // Cache the data for a month (30 days) for future use
        cache.set(searchCity, { icaoCode, country_name });

        const AirOperator = {
          Aircraft_type: req.body.Aircraft_type,
          Tail_sign: req.body.Tail_sign,
          location: req.body.location,
          charges_per_hour: req.body.charges_per_hour,
          speed: req.body.speed,
          icao: icaoCode,
          country_name: country_name,
          sr_no: req.body.sr_no,
        };

        if (
          AirOperator.Aircraft_type === undefined ||
          AirOperator.Tail_sign === undefined ||
          AirOperator.location === undefined ||
          AirOperator.charges_per_hour === undefined ||
          AirOperator.speed === undefined ||
          AirOperator.sr_no === undefined
        ) {
          return res.status(400).json({
            success: false,
            msg: 'Aircraft_type,Tail_sign,location,charges_per_hour,speed,sr_no are required',
          });
        } else if (
          typeof AirOperator.Aircraft_type !== 'string' ||
          typeof AirOperator.Tail_sign !== 'string' ||
          typeof AirOperator.location !== 'string' ||
          typeof AirOperator.charges_per_hour !== 'number' ||
          typeof AirOperator.speed !== 'number' ||
          typeof AirOperator.sr_no !== 'string'
        ) {
          return res.status(400).json({
            error:
              'Aircraft_type,Tail_sign,location,sr_no  must be a string and charges_per_hour,speed must be a number',
          });
        } else if (
          AirOperator.Aircraft_type === '' ||
          AirOperator.Tail_sign === '' ||
          AirOperator.location === '' ||
          AirOperator.charges_per_hour === 0 ||
          AirOperator.speed === 0 ||
          AirOperator.sr_no === ''
        ) {
          return res.status(400).json({
            success: false,
            msg: `Aircraft_type,Tail_sign,location,sr_no  cant take an empty string value i.e '' and charges_per_hour, speed must not be 0`,
          });
        }

        // Insert AirOperator into the database or perform other necessary actions
        const operator = await OperatorService.createOperator(AirOperator);
        // Get the operator's ID and push it to the aircraftOperators array in Operator

        // Update the Operator's aircraftOperators field with the new AircraftOperator's ID
        await Operator.findByIdAndUpdate(
          req.operator._id,
          {
            $push: {
              aircraftOperators: {
                aircraftOperator: operator._id,
                Aircraft_type: operator.Aircraft_type,
                Tail_sign: operator.Tail_sign,
                location: operator.location,
                charges_per_hour: operator.charges_per_hour,
                speed: operator.speed,
                icao: operator.icao,
                country_name: operator.country_name,
                margin: operator.margin,
                sr_no: operator.sr_no,
              },
            },
          },
          { new: true }
        );
        await operator.save();
        res.json({ message: 'Aircraft created successfully', AirOperator });
      } else {
        res.status(response.status).json({
          error: 'Failed to fetch airport data',
        });
      }
    }
  } catch (error) {
    console.error(error);

    return res.status(500).json({ error: 'Error creating aircraft' });
  }
};

exports.getAirCraftOperatorLists = async (req, res) => {
  const operator = await OperatorService.getOperators();

  res.json({ succes: true, message: 'operator List found', data: operator });
};
exports.EditOperator = async (req, res) => {
  const { id } = req.params;
  if (id === undefined || null) {
    return res.status(400).json({
      success: false,
      msg: 'id is required',
    });
  }
  const AirOperator = {
    Aircraft_type: req?.body?.Aircraft_type,
    Tail_sign: req?.body?.Tail_sign,
    location: req?.body?.location,
    charges_per_hour: req?.body?.charges_per_hour,
    speed: req?.body?.speed,
    icao: req?.body?.icao,
    country_name: req?.body?.country_name,
    sr_no: req?.body?.sr_no,
  };

  if (
    AirOperator.Aircraft_type === undefined ||
    AirOperator.Tail_sign === undefined ||
    AirOperator.location === undefined ||
    AirOperator.charges_per_hour === undefined ||
    AirOperator.icao === undefined ||
    AirOperator.country_name === undefined ||
    AirOperator.speed === undefined ||
    AirOperator.sr_no === undefined
  ) {
    return res.status(400).json({
      success: false,
      msg: 'Aircraft_type,Tail_sign,location,charges_per_hour ,icao,speed,sr_no,country_name are required',
    });
  } else if (
    typeof AirOperator.Aircraft_type !== 'string' ||
    typeof AirOperator.Tail_sign !== 'string' ||
    typeof AirOperator.location !== 'string' ||
    typeof AirOperator.icao !== 'string' ||
    typeof AirOperator.charges_per_hour !== 'number' ||
    typeof AirOperator.country_name !== 'string' ||
    typeof AirOperator.speed !== 'number' ||
    typeof AirOperator.sr_no !== 'string'
  ) {
    return res.status(400).json({
      error:
        'Aircraft_type,Tail_sign,location,sr_no,icao,country_name  must be a string and charges_per_hour,speed must be a number',
    });
  } else if (
    AirOperator.Aircraft_type === '' ||
    AirOperator.Tail_sign === '' ||
    AirOperator.location === '' ||
    AirOperator.icao === '' ||
    AirOperator.charges_per_hour === 0 ||
    AirOperator.country_name === '' ||
    AirOperator.speed === 0 ||
    AirOperator.sr_no === ''
  ) {
    return res.status(400).json({
      success: false,
      msg: `Aircraft_type,Tail_sign,location,sr_no,icao,country_name  cant take an empty string value i.e '' and charges_per_hour, speed must not be 0`,
    });
  }

  console.log(AirOperator);

  const operator = await OperatorService.updateOperator(id, AirOperator);

  if (!operator) {
    return res.status(404).json({
      success: false,
      message: 'Operator not found',
    });
  }

  try {
    await operator.save();

    res
      .status(200)
      .json({ success: true, message: 'Operator is updated sucessfully' });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating operator',
    });
  }
};
exports.DeleteOperator = async (req, res) => {
  const { id } = req.params;
  if (id === undefined || null) {
    return res.status(400).json({
      success: false,
      msg: 'id is required',
    });
  }
  try {
    const deleteOperator = await OperatorService.deleteOperator(id);
    // Remove all records of the deleted operator from aircraftOperators array
    await Operator.updateMany(
      { 'aircraftOperators.aircraftOperator': deleteOperator.id },
      { $pull: { aircraftOperators: { aircraftOperator: deleteOperator.id } } }
    );

    res.json({
      success: true,
      data: deleteOperator,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error while deleting operator',
    });
  }
};

exports.GetAllLocation = async (req, res) => {
  const operator = await OperatorService.getAllOperatorsLocation();

  res.json({ succes: true, message: 'operator List found', data: operator });
};
exports.getSingleOperator = async (req, res) => {
  const { _id } = req.params;
  if (_id === undefined || null) {
    return res.status(400).json({
      success: false,
      msg: '_id is required',
    });
  }

  try {
    const operator = await OperatorService.getOperator(_id);
    if (!operator) {
      return res.status(404).json({
        success: false,
        message: 'Operator not found',
      });
    } else {
      res.json({
        success: true,
        data: operator,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error while freshing operator',
    });
  }
};

exports.getSearchFilter = async (req, res) => {
  const { filter } = req.query;

  try {
    const result = await OperatorService.getOpeartorsSearchFilter(filter);
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error while searching operators',
    });
  }
};

exports.getIndividualAirCraftOPeratorsLists = async (req, res) => {
  try {
    const operatorId = req.operator._id;
    if (operatorId === undefined || null) {
      return res.status(401).json({
        success: false,
        msg: 'unauthorized please login as operator',
      });
    }

    // Fetch the operator and populate the latest data
    const operator = await Operator.findById(operatorId).populate({
      path: 'aircraftOperators.aircraftOperator',
      model: 'AircraftOPerator',
      select:
        'Aircraft_type Tail_sign location icao country_name charges_per_hour speed margin sr_no',
    });

    if (!operator) {
      return res.status(404).json({ message: 'UserOperator Does Not Exist' });
    }


    const operatorObject = operator.toObject();



    const aircraftOperators = operatorObject.aircraftOperators.map(
      (entry) => entry.aircraftOperator
    );

    res.status(200).json({
      id: operatorObject._id,
      aircraftCreatedByOperator: aircraftOperators,
      message: 'AirCraftOperator List Refreshed successfully',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

exports.getOperatorsLists = async (req, res) => {
  const operator = await Operator.find();
  return res.json({
    succes: true,
    message: 'operator List found',
    data: operator,
  });
};

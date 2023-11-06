const bcrypt = require("bcrypt");
const NodeCache = require("node-cache");
const axios = require("axios");

const { Operator} = require("../db/Operator");
const Role=require("../db/role")


const ErrorHandler = require("../utils/error-handler");
const OperatorService = require("../services/operator-service");

const generateToken = require("../configs/jwtToken");

exports.Register = async (req, res, next) => {

  const { company_name, email_address, password,contact_number,country_name} = req.body;
  const role=Role.OPERATOR

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
        role:role
        
      });
      // res.json(newUser);

      await newUser.save();


      res.status(201).json({ message: "Operator register successfully" });

    } else {
      throw new Error("Operator already exist");
    }
  } catch (error) {
    throw new Error(error)
  }
};

exports.Login = async (req, res) => {
  const {email_address, password} = req.body;

  try {

    const user = await Operator.findOne({ email_address });
    


    if (!user) {
      return res.json({message: "Incorrect email"});
    }
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {

      return res.status(404).json({ message: "inCorrect password" });

    }
    if (user && passwordMatch) {
      const aircraftCreatedByOPerator=user.aircraftOperators
      res.json({
        id: user?._id,
        email_address,
        password,

        token: generateToken(user?._id),
        aircraftCreatedByOPerator:aircraftCreatedByOPerator
      });
      return res.status(200).json({message: "login succes fully done "});
    }
  } catch (error) {}
};

// Initialize a cache with a longer TTL (30 days)
const cache = new NodeCache({stdTTL: 30 * 24 * 60 * 60}); // Cache data for 30 days

const EventEmitter = require("events");
const TLSSocket = require("tls").TLSSocket;

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
    this.emitter.emit("close");
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
      const {icaoCode, country_name} = cachedData;
      const AirOperator = {
        Aircraft_type: req.body.Aircraft_type,
        Tail_sign: req.body.Tail_sign,
        location: req.body.location,
        charges_per_hour: req.body.charges_per_hour,
        date:req.body.date,
        speed: req.body.speed,
        icao: icaoCode,
        country_name: country_name,
        sr_no:req.body.sr_no
      };

      // Insert AirOperator into the database or perform other necessary actions
      const operator = await OperatorService.createOperator(AirOperator);

      
    

    // Update the Operator's aircraftOperators field with the new AircraftOperator's ID
    await Operator.findByIdAndUpdate(
      req.operator._id,
      { $push: {
        aircraftOperators: {
          aircraftOperator:operator._id,
          Aircraft_type: operator.Aircraft_type,
        Tail_sign: operator.Tail_sign,
        location: operator.location,
        charges_per_hour: operator.charges_per_hour,
        speed: operator.speed,
        icao: operator.icao,
        country_name: operator.country_name,
        margin:operator.margin,
        sr_no:operator.sr_no
        }
      }
     },
      { new: true }
    );
    await operator.save();
      res.json({ message: "Aircraft created successfully", AirOperator });

    } else {
      // If not cached, make the API call

      const tlsSocket = new MyTLSSocket();

      tlsSocket.on("close", () => {
        // Remove the listener to avoid memory leaks
        tlsSocket.emitter.removeListener("close", () => {
          // ...
        });
      });

      const response = await axios.get(
        "https://dir.aviapages.com/api/airports/",
        {
          headers: {
            accept: "application/json",
            Authorization: process.env.AVID_API_TOKEN,
          },
          params: {
            search_city: searchCity, // Include the search_city query parameter in the request
          },
          socket: tlsSocket,
        }
      );

      let icaoCode = "";
      let country_name = "";

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
            if (result.icao) {
              icaoCode = result.icao;
              country_name = result.country_name;
              break;
            }
          }
        }

        // Cache the data for a month (30 days) for future use
        cache.set(searchCity, {icaoCode, country_name});

        const AirOperator = {
          Aircraft_type: req.body.Aircraft_type,
          Tail_sign: req.body.Tail_sign,
          location: req.body.location,
          charges_per_hour: req.body.charges_per_hour,
          speed: req.body.speed,
          icao: icaoCode,
          country_name: country_name,
          sr_no:req.body.sr_no
        };

        // Insert AirOperator into the database or perform other necessary actions
        const operator = await OperatorService.createOperator(AirOperator);
          // Get the operator's ID and push it to the aircraftOperators array in Operator
   

    // Update the Operator's aircraftOperators field with the new AircraftOperator's ID
    await Operator.findByIdAndUpdate(
      req.operator._id,
      { $push: {
        aircraftOperators: {
          aircraftOperator:operator._id,
          Aircraft_type: operator.Aircraft_type,
        Tail_sign: operator.Tail_sign,
        location: operator.location,
        charges_per_hour: operator.charges_per_hour,
        speed: operator.speed,
        icao: operator.icao,
        country_name: operator.country_name,
        margin:operator.margin,
        sr_no:operator.sr_no
        }
      }
     },
      { new: true }
    );
        await operator.save();
        res.json({message: "Aircraft created successfully", AirOperator});
      } else {
        res.status(response.status).json({
          error: "Failed to fetch airport data",
        });
      }
    }
  } catch (error) {
    console.error(error);
    return next(new ErrorHandler("Error creating aircraft", 500));
  }
};

exports.getAirCraftOperatorLists = async (req, res) => {
  const operator = await OperatorService.getOperators();

  res.json({succes: true, message: "operator List found", data: operator});
};
exports.EditOperator = async (req, res) => {
  const {_id} = req.params;

  const AirOperator = {
    Aircraft_type: req?.body?.Aircraft_type,
    Tail_sign: req?.body?.Tail_sign,
    location: req?.body?.location,
    charges_per_hour: req?.body?.charges_per_hour,
    speed: req?.body?.speed,
    icao:req?.body?.icao,
    country_name:req?.body?.country_name,
    sr_no:req?.body?.sr_no
  };
  console.log(AirOperator);

  const operator = await OperatorService.updateOperator(_id, AirOperator);

  if (!operator) {
    return res.status(404).json({
      success: false,
      message: "Operator not found",
    });
  }

  try {
    await operator.save();

    res.status(200).json({ success: true, message: "Operator is updated sucessfully" });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating operator",
    });
  }
};
exports.DeleteOperator = async (req, res) => {
  const {_id} = req.params;
  try {
    const deleteOperator = await OperatorService.deleteOperator(_id);
    res.json({
      success: true,
      data: deleteOperator,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error while deleting operator",
    });
  }
};

exports.GetAllLocation = async (req, res) => {
  const operator = await OperatorService.getAllOperatorsLocation();

  res.json({succes: true, message: "operator List found", data: operator});
};
exports.getSingleOperator = async (req, res) => {
  const {_id} = req.params;

  try {
    const operator = await OperatorService.getOperator(_id);
    if (!operator) {
      return res.status(404).json({
        success: false,
        message: "Operator not found",
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
      message: "Error while freshing operator",
    });
  }
};

exports.getSearchFilter = async (req, res) => {
  const {filter} = req.query;

  try {
    const result = await OperatorService.getOpeartorsSearchFilter(filter);
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error while searching operators",
    });
  }
};

exports.getOperatorsLists= async (req, res) => {

 const operator=await Operator.find();
 return res.json({ succes: true, message: "operator List found", data: operator });

}
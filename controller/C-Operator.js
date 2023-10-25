const Auth = require("../db/Auth");
const bcrypt = require("bcrypt");
const axios = require("axios");
const { Operator} = require("../db/Operator");

const Token = require("../configs/jwtToken");
const ErrorHandler = require("../utils/error-handler");
const OperatorService = require("../services/operator-service");


const generateToken = require("../configs/jwtToken");

exports.Register = async (req, res, next) => {
  const { company_name, email_address, password } = req.body;
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
        password: hashedPassword,
      });
      res.json(newUser);

      await newUser.save();

      res.status(201).json({ message: "Operator register suceesful" });
    } else {
      throw new Error("Operator already exist");
    }
  } catch (error) {
    console.log(error);
  }
};

exports.Login = async (req, res) => {
  const { email_address, password } = req.body;

  try {
    const user = await Operator.findOne({ email_address });

    if (!user) {
      return res.json({ message: "Incorrect email" });
    }
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(404).json({ message: "inCorrect passord" });
    }
    if (user && passwordMatch) {
      res.json({
        id: user?._id,
        email_address,
        password,

        token: generateToken(user?._id),
      });
      return res.status(200).json({ message: "login succes fully done " });
    }
  } catch (error) {
  }
};

exports.AddAircrafts = async (req, res, next) => {
  try {
    const searchCity = req.body.location; 

    
    const response = await axios.get(
      "https://dir.aviapages.com/api/airports/",
      {
        headers: {
          "accept": "application/json",
          "Authorization": process.env.AVID_API_TOKEN, 
         
        },
        params: {
          search_city: searchCity, // Include the search_city query parameter in the request
        },
      },
    );
let country_name='';
let icaoCode='';
    if (response.status === 200) {
      // Extract the icao code from the response
      console.log(response.data.results[0]);
  if(response.data.results.length === 1){
    icaoCode = response.data.results[0]
    ? response.data.results[0].icao
    : null;
  country_name = response.data.results[0]
    ? response.data.results[0].country_name
    : null;
  }
  else if(response.data.results.length>1){
    const results = response.data.results;

    // Loop through the results
    for (const result of results) {
      if (result.icao) {
        // If icao is not null, set the variable and break the loop
        icaoCode = result.icao;
        country_name=result.country_name
        break;
      }
  }}
      // Create the AircraftOperator object with the extracted icao code
      const AirOperator = {
        Aircraft_type: req.body.Aircraft_type,
        Tail_sign: req.body.Tail_sign,
        location: req.body.location,
        charges_per_hour: req.body.charges_per_hour,
        speed: req.body.speed,
        icao: icaoCode,
        country_name: country_name,
      };

      // Insert AirOperator into the database or perform other necessary actions
      const operator = await OperatorService.createOperator(AirOperator);
      await operator.save();
      res.json({ message: "Aircraft created successfully", AirOperator });
    } else {
      res.status(response.status).json({
        error: "Failed to fetch airport data",
      });
    }
  } catch (error) {
    console.error(error);
    return next(new ErrorHandler("Error creating aircraft", 500));
  }
};

exports.getOperatorlists = async (req, res) => {
  const operator = await OperatorService.getOperators();

  res.json({ succes: true, message: "operator List found", data: operator });
};
exports.EditOperator = async (req, res) => {
  const { _id } = req.params;

  const AirOperator = {
    Aircraft_type: req?.body?.Aircraft_type,
    Tail_sign: req?.body?.Tail_sign,
    location: req?.body?.location,
    charges_per_hour: req?.body?.charges_per_hour,
    speed: req?.body?.speed,
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
    res.status(200).json({ success: true, message: "Operator is updated" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating operator",
    });
  }
};
exports.DeleteOperator = async (req, res) => {
  const { _id } = req.params;
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

  res.json({ succes: true, message: "operator List found", data: operator });
};
exports.getSingleOperator = async (req, res) => {
  const { _id } = req.params;

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
      message: "Error while searching operators",
    });
  }
};

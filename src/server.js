const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const cookieSession = require('cookie-session');
const app = express();
const OperatorRouter = require('./routes/Operator-Router');
const CustomerRouter = require('./routes/Customer-Router');
const EquiryRouter = require('./routes/ConfirmEquiry-Router');
const AdminRouter = require('./routes/Admin-Router');
const FormDataRouter = require('./routes/Form-Data');
const RayzorpayRouter = require('./routes/Paymount-Router');
const cookieParser = require('cookie-parser');
const errorMiddleware = require('./middleware/error-middleware');
const dotenv = require('dotenv');
require('./database/Database');
const { superBaseConnect } = require('./configs/supabase');
superBaseConnect();
dotenv.config();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(
  cookieSession({
    name: 'sample-session',
    keys: ['COOKIE_SECRET'],
    httpOnly: true,
  })
);

const corsOptions = { origin: `*` };
app.use(cors(corsOptions));
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => {
  res.json({
    msg: 'Hello from QickLift Server',
    status: 'ok',
  });
});

http: app.use('/admin', AdminRouter);
app.use('/operator', OperatorRouter);
app.use('/customer', CustomerRouter);
app.use('/equiry', EquiryRouter);
app.use('/formData', FormDataRouter);
app.use('/rayzorpay', RayzorpayRouter);

app.use(errorMiddleware);

app.listen(8000, () => {
  console.log('node API app is running on port 8000');
});

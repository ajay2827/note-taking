const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
app.use(cors());
const connectDB = require('./db/connect');
const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/errorHandler');
require('dotenv').config();

// connecting to database
connectDB();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

// starting server
const port = process.env.PORT || 5000;

const server = app.listen(
  port,
  console.log(`Server running on PORT ${port}...`)
);

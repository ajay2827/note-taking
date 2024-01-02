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

app.get('/', (req, res) => {
  res.send('Welcome to my Express application!');
});

// requiring routers
const userRoute = require('./routes/userRoute');
const noteRoute = require('./routes/noteRoute');

// using routers
app.use('/api/v1/user', userRoute);
app.use('/api/v1/notes', noteRoute);

// middleware
app.use(express.json({ limit: '20mb' }));
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

// starting server
const port = process.env.PORT || 5000;

const server = app.listen(
  port,
  console.log(`Server running on PORT ${port}...`)
);

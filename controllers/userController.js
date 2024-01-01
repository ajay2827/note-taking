const User = require('../models/User');
const asyncWrapper = require('../middleware/async');
const { createCustomError } = require('../errors/custom-error');
const generatetoken = require('../config/generateToken');
const bcrypt = require('bcrypt');

// register new user
exports.userRegister = asyncWrapper(async (req, res, next) => {
  let { name, email, password } = req.body;

  // checks
  if (!name || !email || !password) {
    return next(createCustomError(`Provide necessary credentials`, 404));
  }

  // exiting user
  const exitingUser = await User.findOne({ email });

  if (exitingUser) {
    return next(createCustomError(`User already exit`, 404));
  }

  // hash password
  const salt = await bcrypt.genSalt(10);
  const hashpassword = await bcrypt.hash(password, salt);

  password = hashpassword;

  // creating user
  const user = await User.create({
    name,
    email,
    password,
  });
  const token = generatetoken(user._id);

  res.status(200).json({ user, token });
});

// login user
exports.userLogin = asyncWrapper(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(createCustomError(`Provide necessary credentials`, 400));
  }

  // check user
  const user = await User.findOne({ email });
  if (!user) {
    return next(createCustomError(`Invalid Email`, 401));
  }

  // compare password
  const matchpassword = await bcrypt.compare(password, user.password);
  if (!matchpassword) {
    return next(createCustomError(`Invalid Password`, 401));
  }

  const token = generatetoken(user._id);
  res.status(200).json({ user, token });
});

// get current user
exports.getCurruser = asyncWrapper(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(createCustomError(`No token provided`, 401));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    res.status(200).json(user);
  } catch (error) {
    return next(createCustomError(`Not authorized to access this route`, 401));
  }
});

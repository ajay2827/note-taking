const express = require('express');
const router = express.Router();

const {
  userRegister,
  userLogin,
  getCurruser,
} = require('../controllers/userController');
const authenticationMiddleware = require('../middleware/auth');

// register user route
router.route('/').post(userRegister);

// login user route
router.route('/login').post(userLogin);

// get current user
router.route('/currentuser').get(getCurruser, authenticationMiddleware);

module.exports = router;

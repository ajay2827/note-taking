const express = require('express');
const router = express.Router();
const { userRegister, userLogin } = require('../controllers/userController');

// register user route
router.route('/').post(userRegister);

// login user route
router.route('/login').post(userLogin);

module.exports = router;

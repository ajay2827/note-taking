const express = require('express');
const router = express.Router();
const {
  createNote,
  getAllNotes,
  getNote,
  updateNote,
  deleteNote,
} = require('../controllers/noteController');
const authenticationMiddleware = require('../middleware/auth');

// creating an note and getting all notes route
router
  .route('/')
  .post(createNote, authenticationMiddleware)
  .get(getAllNotes, authenticationMiddleware);

// updaring note route
router.route('/updateNote').put(updateNote, authenticationMiddleware);

// deleting note route
router.route('/deleteNote').delete(deleteNote, authenticationMiddleware);

router.route('/getNote').get(getNote, authenticationMiddleware);

module.exports = router;

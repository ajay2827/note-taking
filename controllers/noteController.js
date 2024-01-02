const Note = require('../models/Note');
const asyncWrapper = require('../middleware/async');
const { createCustomError } = require('../errors/custom-error');

// create a new note
exports.createNote = asyncWrapper(async (req, res, next) => {
  const { title, description, tag, userId } = req.body;

  if (!title || !description || !tag || !userId) {
    return next(createCustomError(`Provide necessary credentials`, 404));
  }

  const note = await Note.create({ title, description, tag, userId });

  if (!note) {
    return next(createCustomError(`Something went wrong`, 500));
  }

  res.status(200).json({ msg: 'Successfully note created', note });
});

// retrieve all notes of user
exports.getAllNotes = asyncWrapper(async (req, res, next) => {
  const { userId } = req.body;

  const notes = await Note.find({ userId: userId });

  if (!notes) {
    return next(createCustomError(`Something went wrong`, 500));
  }

  res.status(200).json({ msg: 'Data fetched', notes: notes });
});

// retrieve note by id
exports.getNote = asyncWrapper(async (req, res, next) => {
  const id = req.body.id;

  const singleNote = await Note.findOne({ _id: id });

  if (!singleNote) {
    return next(createCustomError(`Something went wrong`, 500));
  }

  return res.status(200).json({ msg: 'Note fetched', note: singleNote });
});

// update an exiting note
exports.updateNote = asyncWrapper(async (req, res, next) => {
  const { id } = req.body;
  const updateFields = req.body;

  // checking exiting note
  const note = await Note.findById(id);
  if (!note) {
    return next(createCustomError(`note not found`, 404));
  }

  Object.assign(note, updateFields);
  await note.save();

  res.status(200).json({ note, msg: 'note updated successfully' });
});

// deleting the exiting note
exports.deleteNote = asyncWrapper(async (req, res, next) => {
  const { id } = req.body;

  // checking exiting note
  const note = await Note.findById(id);
  if (!note) {
    return next(createCustomError(`Note not found`, 404));
  }
  await Note.findByIdAndDelete(id);
  res.status(200).json({ note, message: 'Note deleted successfully' });
});

const moongoose = require('mongoose');

const notesSchema = new moongoose.Schema(
  {
    title: {
      type: String,
      require: [true, 'must provide title'],
      maxlength: [20, 'title can not be more than 8 characters'],
      minlength: [2, 'title can not be less than 2 characters'],
    },
    description: {
      type: String,
      require: [true, 'must provide Description'],
    },
    tag: { type: String, require: [true, 'must provide Tag'] },
    userId: { type: String, require: [true, 'must provide userId'] },
  },
  { timestamps: true }
);

module.exports = moongoose.model('Note', notesSchema);

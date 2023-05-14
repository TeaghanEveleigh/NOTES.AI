const mongoose = require('mongoose');

const NoteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  content: {
    type: String,
    required: true
  },
  date: {
    type:String,
    required:true
  }
});

module.exports = mongoose.model('Note', NoteSchema);

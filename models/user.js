const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  posts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Note' // Changed 'note' to 'Note'
    }
  ]
});

module.exports = mongoose.models.User || mongoose.model('User', UserSchema);

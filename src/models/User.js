const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true,
    unique: true,
    minLength: 5
  },
  accountNumber: {
    type: Number,
    required: true,
    unique: true,
  },
  emailAddress: {
    type: String,
    required: true,
    unique: true,
  },
  identityNumber: {
    type: Number,
    required: true,
    unique: true,
  },
}, {
  timestamps: {
    createdAt: true,
    updatedAt: true
  }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
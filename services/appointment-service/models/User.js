const mongoose = require('mongoose');

// Reference schema for User model (shared with auth service)
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  role: String,
}, {
  timestamps: true,
});

const User = mongoose.model('User', userSchema);

module.exports = User;

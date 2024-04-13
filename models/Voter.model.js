const mongoose = require('mongoose');

const voterSchema = new mongoose.Schema({
  user: {
    type: String, 
    required: true,
    unique: true 
  },
  votes: [{
    type: String, // Id of the photo that user has voted
    required: true,
  }]
});

const Voter = mongoose.model('Voter', voterSchema);

module.exports = Voter;
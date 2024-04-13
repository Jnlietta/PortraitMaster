const mongoose = require('mongoose');

const voterSchema = new mongoose.Schema({
  user: {
    type: String, 
    required: true,
    unique: true 
  },
  votes: [{
    type: mongoose.Schema.Types.ObjectId, // Id of the photo that user has voted
    ref: 'Photo' // Refer to model of photos data
  }]
});

const Voter = mongoose.model('Voter', voterSchema);

module.exports = Voter;
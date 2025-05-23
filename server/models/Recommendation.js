const mongoose = require('mongoose');

const recommendationSchema = new mongoose.Schema({
  fromUserId: {
    type: String,
    required: true,
  },
  toUserId: {
    type: String,
    required: true,
  },
  animeTitle: {
    type: String,
    required: true,
  },
  comment: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Recommendation', recommendationSchema); 
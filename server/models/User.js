const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  telegramId: {
    type: String,
    required: true,
    unique: true
  },
  username: {
    type: String,
    required: true
  },
  profileId: {
    type: String,
    required: true,
    unique: true
  },
  avatar: {
    type: String,
    default: null
  },
  watchedCount: {
    type: Number,
    default: 0
  },
  plannedCount: {
    type: Number,
    default: 0
  },
  animeList: [{
    title: String,
    status: {
      type: String,
      enum: ['planned', 'watching', 'completed'],
      default: 'planned'
    },
    addedAt: {
      type: Date,
      default: Date.now
    },
    image: String,
    episodes: String,
    score: String,
    synopsis: String
  }],
  recommendations: [{
    animeTitle: String,
    comment: String,
    sharedAt: {
      type: Date,
      default: Date.now
    }
  }]
});

module.exports = mongoose.model('User', userSchema); 
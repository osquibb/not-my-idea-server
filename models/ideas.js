const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const userSchema = mongoose.model('User').schema;

const ideaSchema = new Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  text: {
    type: String,
    required: true,
    maxlength: 140
  },
  likedRank: {
    type: Number,
    required: true,
    default: 0,
  },
  flaggedRank: {
    type: Number,
    required: true,
    default: 0,
  }
}, {
    timestamps: true
  });

module.exports = mongoose.model('Idea', ideaSchema);
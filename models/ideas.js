const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const userSchema = mongoose.model('User').schema;

const ideaSchema = new Schema({
  author: userSchema,
  text: {
    type: String,
    required: true,
    maxlength: 140
  },
  rank: {
    type: Number,
    required: true,
    min: 0
  }
}, {
    timestamps: true
  });

module.exports = mongoose.model('Idea', ideaSchema);
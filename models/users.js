const mongoose = require('mongoose');
const Schema = mongoose.Schema;
let passportLocalMongoose = require('passport-local-mongoose');

const User = new Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  admin:   {
    type: Boolean,
    default: false
  },
  likedIdeas: [
                {
                  type: mongoose.Schema.Types.ObjectId,
                  ref: 'Idea'
                }
              ],
  flaggedIdeas: [
                  {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Idea'
                  }
                ]
}, {
    timestamps: true
  });

// this plugin adds username, hash and salt to the Schema
User.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', User);
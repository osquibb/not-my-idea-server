const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: {
      type: String,
      required: true,
      unique: true
  },
  password:  {
      type: String,
      required: true
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

module.exports = mongoose.model('User', userSchema);
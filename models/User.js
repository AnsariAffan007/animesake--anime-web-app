const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const watchlistSchema = new mongoose.Schema({
  poster: String,
  name: String,
  mal_id: String
})

const watchHistorySchema = new mongoose.Schema({
  name: String,
  additionalInfo: String,
  dateOfWatch: String
})

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  watchlist: [watchlistSchema],
  watchHistory: [watchHistorySchema]
});

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema);

module.exports = User;
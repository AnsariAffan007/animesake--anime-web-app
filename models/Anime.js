const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const reviewSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: false
  },
  rating: Number,
  reviewHead: String,
  reviewDesc: String,
  _id: {
    type: String,
    unique: false
  }
});

const animeSchema = new mongoose.Schema({
  entertainmentId: String,
  entertainmentName: String,
  imageUrl: String,
  entertainmentReviews: [reviewSchema]
})

animeSchema.plugin(passportLocalMongoose);

const Anime = mongoose.model("Entertainment", animeSchema);

module.exports = Anime;
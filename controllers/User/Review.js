const Anime = require("../../models/Anime");

module.exports = {
  postReview: function (req, res) {
    if (req.isAuthenticated()) {
      let newReview = {
        username: req.user.username,
        rating: req.body.reviewRating,
        reviewHead: req.body.reviewHead,
        reviewDesc: req.body.reviewDesc
      };

      let reviewExists = false;
      Anime.findOne({ entertainmentId: req.body.entId }, async function (err, foundEntertainment) {
        if (foundEntertainment) {
          foundEntertainment.entertainmentReviews.forEach(function (element) {
            if (element.username === req.user.username) {
              reviewExists = true;
              return;
            }
          })
          if (reviewExists) {
            res.redirect("/anime/" + req.body.entId);
          }
          else {
            foundEntertainment.entertainmentReviews.push(newReview);
            await foundEntertainment.save();
            res.redirect("/anime/" + req.body.entId);
          }
        }
        else {
          let newEnt = new Anime({
            entertainmentId: req.body.entId,
            entertainmentName: req.body.entName,
            imageUrl: req.body.imageUrl,
            entertainmentReviews: [newReview]
          });
          await newEnt.save();
          res.redirect("/anime/" + req.body.entId);
        }
      })
    }
    else {
      res.redirect("/login");
    }
  },
  deleteReview: function (req, res) {
    if (req.isAuthenticated()) {
      Anime.findOneAndUpdate({ entertainmentId: req.body.entId }, { $pull: { entertainmentReviews: { username: req.user.username } } }, function (error, reviews) {
        if (!error) {
          res.redirect("/anime/" + req.body.entId);
        }
      })
    }
    else {
      res.redirect("/login");
    }
  }
}
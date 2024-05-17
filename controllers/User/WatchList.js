const User = require("../../models/User");

module.exports = {
  getWatchList: function (req, res) {
    let isLoggedIn = req.isAuthenticated();
    if (isLoggedIn) {
      res.render("watchlist", {
        signedInflag: isLoggedIn,
        username: isLoggedIn ? req.user.username : "",
        watchlist: req.user.watchlist
      });
    }
    else {
      res.redirect("/login");
    }
  },
  postWatchList: function (req, res) {
    if (req.isAuthenticated()) {
      let newEntToWatch = {
        poster: req.body.poster,
        name: req.body.name,
        mal_id: req.body.mal_id
      }

      User.findOne({ username: req.user.username }, async function (err, foundUser) {
        if (!err) {
          foundUser.watchlist.push(newEntToWatch)
          await foundUser.save();
          res.redirect("/anime/" + req.body.mal_id);
        }
        else {
          res.redirect("/anime/" + req.body.mal_id);
        }
      })
    }
    else {
      res.redirect("/login");
    }
  },
  deleteWatchList: function (req, res) {
    if (req.isAuthenticated()) {
      User.findOneAndUpdate({ username: req.user.username }, { $pull: { watchlist: { name: req.body.deleteEntName } } }, function (error, watchlist) {
        if (!error) {
          res.redirect("/user/watchlist");
        }
      })
    }
    else {
      res.redirect("/login");
    }
  }
}
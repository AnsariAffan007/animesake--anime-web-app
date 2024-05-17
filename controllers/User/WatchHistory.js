const User = require("../../models/User");

module.exports = {
  getWatchHistory: function (req, res) {
    let isLoggedIn = req.isAuthenticated();
    if (isLoggedIn) {
      res.render("watchEdlist", {
        signedInflag: isLoggedIn,
        username: req.user.username,
        watchedList: req.user.watchHistory
      });
    }
    else {
      res.redirect("/login");
    }
  },
  postWatchHistory: function (req, res) {
    if (req.isAuthenticated()) {
      let newlyWatchedEnt = {
        name: req.body.watchedEntName,
        additionalInfo: req.body.info,
        dateOfWatch: req.body.dateOfWatch
      }
      User.findOne({ username: req.user.username }, async function (err, foundUser) {
        if (!err) {
          foundUser.watchHistory.push(newlyWatchedEnt)
          await foundUser.save();
          res.redirect("/user/watchedList");
        }
        else {
          res.redirect("/user/watchedList");
        }
      })
    }
    else {
      res.redirect("/login");
    }
  },
  deleteWatchHistory: function (req, res) {
    if (req.isAuthenticated()) {
      User.findOne({ username: req.user.username }, async function (error, foundUser) {
        if (!error) {
          foundUser.watchHistory.splice(parseInt(req.body.index), 1);
          await foundUser.save();
          res.redirect("/user/watchedList");
        }
      })
    }
    else {
      res.redirect("/login");
    }
  },
  putWatchHistory: function (req, res) {
    if (req.isAuthenticated()) {
      User.findOne({ username: req.user.username }, async function (error, foundUser) {
        if (!error) {
          foundUser.watchHistory[parseInt(req.body.index)] = {
            name: req.body.watchedEntName,
            additionalInfo: req.body.info,
            dateOfWatch: req.body.dateOfWatch
          }
          await foundUser.save();
          res.redirect("/user/watchedList");
        }
      })
    }
    else {
      res.redirect("/login");
    }
  }
}
const passport = require("passport");
const User = require("../models/User");

module.exports = {
  getRegister: function (req, res) {
    var invalid = req.query.invalid;
    let isLoggedIn = req.isAuthenticated();

    res.render("register", {
      wrongPassword: invalid,
      signedInflag: isLoggedIn,
      username: isLoggedIn ? req.user.username : ""
    });
  },
  getLogin: function (req, res) {
    var invalid = req.query.invalid;
    let isLoggedIn = req.isAuthenticated();

    res.render("login", {
      wrongPassword: invalid,
      signedInflag: isLoggedIn,
      username: isLoggedIn ? req.user.username : ""
    });
  },
  postRegister: function (req, res) {
    User.register({ username: req.body.username }, req.body.password, function (err, user) {
      if (err) {
        // console.log(err);
        res.redirect("/register?invalid=" + "A user with the given username is already registered");
      }
      else {
        passport.authenticate("local")(req, res, function () {
          res.redirect("/");
        })
      }
    })
  },
  postLogin: function (req, res) {
    const user = new User({
      username: req.body.username,
      password: req.body.password
    });

    req.login(user, function (err) {
      if (err) {
        res.redirect("/login?invalid=" + "Invalid Credentials");
      }
      else {
        passport.authenticate("local", {
          failureRedirect: "/login?invalid=" + "Invalid Credentials"
        })(req, res, function () {
          res.redirect("/");
        })
      }
    })
  },
  logout: function (req, res) {
    req.logout(function (error) {
      if (error) {
        console.log(error);
      }
      else {
        res.redirect("/");
      }
    });
  }
}
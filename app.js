require('dotenv').config();
const express = require("express");
const https = require("https");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

let signedInflag = false;

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

// mongoose.connect('mongodb://127.0.0.1:27017/cinemyDB');
mongoose.connect(process.env.MONGO_URI)

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

const entertainmentSchema = new mongoose.Schema({
    entertainmentId: String,
    entertainmentName: String,
    imageUrl: String,
    entertainmentReviews: [reviewSchema]
})

userSchema.plugin(passportLocalMongoose);
entertainmentSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema);
const Entertainment = mongoose.model("Entertainment", entertainmentSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", function (req, res) {
    if (req.isAuthenticated()) {
        signedInflag = true;
        res.render("home", { signedInflag: signedInflag, username: req.user.username });
    }
    else {
        signedInflag = false;
        res.render("home", { signedInflag: signedInflag, username: "" });
    }
})

app.get("/reviewed", async (req, res) => {
    let allAnimes = await Entertainment.find({}).exec();
    res.send(JSON.stringify(allAnimes));
})

app.post("/", async function (req, res) {

    let existsInWatchlist = false;
    if (req.isAuthenticated()) {
        let watchlist = req.user.watchlist;
        watchlist.some(function (element) {
            if (element.name === req.body.search) {
                existsInWatchlist = true;
            }
        })
        signedInflag = true;
    }

    var name = req.body.mal_id || req.query.entId;

    //Extracting Reviews of users
    var allReviews = [];
    let foundEntertainment = await Entertainment.findOne({ entertainmentId: name }).exec();
    if (foundEntertainment) {
        allReviews = foundEntertainment.entertainmentReviews;
    }
    const url = `https://api.jikan.moe/v4/anime/${name}/full`;

    https.get(url, function (response) {

        let entData = "";

        response.on("data", function (data) {
            entData = entData + data;
        })

        response.on("end", function () {
            // console.log(entData);
            entData = JSON.parse(entData);
            if (!entData.error) {
                let Poster = entData.data.images.jpg.image_url;
                let Title = entData.data.title;
                let mal_id = entData.data.mal_id
                let englishTitle = entData.data.title_english;
                let type = entData.data.type;
                let totalEpisodes = entData.data.episodes;
                let status = entData.data.status;
                let runtime = entData.data.duration;
                let rating = entData.data.rating;
                let genre = entData.data.genres;
                let airDates = entData.data.aired.string;
                let score = entData.data.score;
                let scored_by = entData.data.scored_by;
                let rank = entData.data.rank;
                let studio = (entData.data.studios.length !== 0) && entData.data.studios[0].name;
                let plot = entData.data.synopsis;
                let season = (entData.data.season) && entData.data.season.charAt(0).toUpperCase() + entData.data.season.slice(1);

                res.render("searchedEnt", {
                    poster: Poster,
                    title: Title,
                    malId: mal_id,
                    englishTitle: englishTitle,
                    type: type,
                    totalEpisodes: (totalEpisodes) ? totalEpisodes : "Unknown",
                    status: status,
                    runtime: runtime,
                    rating: rating,
                    genres: genre,
                    release_date: (airDates === "Not available") ? "Dates Unrevealed" : airDates,
                    score: score,
                    scored_by: scored_by,
                    rank: rank,
                    studio: (studio) ? studio : "Unrevealed",
                    plot: plot,
                    season: (season) ? season : "Unrevealed",
                    signedInflag: signedInflag,
                    username: (signedInflag) ? req.user.username : "",
                    existsInWatchlist: existsInWatchlist,
                    Reviews: allReviews,
                });
            }
            else {
                res.render("noResults", { signedInflag: signedInflag });
            }
        })
    })
})

app.get("/watchOrder", function (req, res) {
    let watchOrderData = "";
    https.get("https://chiaki.vercel.app/get?group_id=" + req.query.id, function (response) {
        response.on("data", (data) => {
            watchOrderData = watchOrderData + data;
        })
        response.on('end', () => {
            watchOrderData = JSON.parse(watchOrderData);
            res.send({ watchOrderData: watchOrderData });
        })
    })
})

app.get("/advanced-search", function (req, res) {
    res.render("advancedSearch", { signedInflag: signedInflag, username: (signedInflag) ? req.user.username : "" })
})

app.get("/register", function (req, res) {
    var invalid = req.query.invalid;
    res.render("register", { wrongPassword: invalid, signedInflag: signedInflag, username: (signedInflag) ? req.user.username : "" });
})

app.get("/login", function (req, res) {
    var invalid = req.query.invalid;
    res.render("login", { wrongPassword: invalid, signedInflag: signedInflag, username: (signedInflag) ? req.user.username : "" });
})

app.post("/register", function (req, res) {

    User.register({ username: req.body.username }, req.body.password, function (err, user) {
        if (err) {
            // console.log(err);
            res.redirect("/register?invalid=" + "A user with the given username is already registered");
        }
        else {
            passport.authenticate("local")(req, res, function () {
                signedInflag = true;
                res.redirect("/");
            })
        }
    })
})

app.post("/login", function (req, res) {

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
                signedInflag = true;
                res.redirect("/");
            })
        }
    })
})

app.get("/logout", function (req, res) {
    signedInflag = false;

    req.logout(function (error) {
        if (error) {
            console.log(error);
        }
        else {
            res.redirect("/login");
        }
    });
})

app.get("/watchlist", function (req, res) {
    if (req.isAuthenticated()) {
        signedInflag = true;
        res.render("watchlist", { signedInflag: signedInflag, username: (signedInflag) ? req.user.username : "", watchlist: req.user.watchlist });
    }
    else {
        res.redirect("/login");
    }
})

app.get("/watchedList", function (req, res) {
    if (req.isAuthenticated()) {
        signedInflag = true;
        res.render("watchEdlist", { signedInflag: signedInflag, username: (signedInflag) ? req.user.username : "", watchedList: req.user.watchHistory });
    }
    else {
        res.redirect("/login");
    }
})

app.post("/watchlist", function (req, res) {
    if (req.isAuthenticated()) {

        signedInflag = true;

        let newEntToWatch = {
            poster: req.body.poster,
            name: req.body.name,
            mal_id: req.body.mal_id
        }

        User.findOne({ username: req.user.username }, function (err, foundUser) {
            if (!err) {
                foundUser.watchlist.push(newEntToWatch)
                foundUser.save();
                res.redirect("/watchlist");
            }
            else {
                res.redirect(307, "/");
            }
        })
    }
    else {
        res.redirect("/login");
    }

})

app.post("/delete-watchlist-ent", function (req, res) {
    if (req.isAuthenticated()) {

        signedInflag = true;

        User.findOneAndUpdate({ username: req.user.username }, { $pull: { watchlist: { name: req.body.deleteEntName } } }, function (error, watchlist) {
            if (!error) {
                res.redirect("/watchlist");
            }
        })
    }
    else {
        res.redirect("/login");
    }
})

app.post("/watchedList", function (req, res) {

    if (req.isAuthenticated()) {

        signedInflag = true;

        let newlyWatchedEnt = {
            name: req.body.watchedEntName,
            additionalInfo: req.body.info,
            dateOfWatch: req.body.dateOfWatch
        }

        User.findOne({ username: req.user.username }, async function (err, foundUser) {
            if (!err) {
                foundUser.watchHistory.push(newlyWatchedEnt)
                await foundUser.save();
                res.redirect("/watchedList");
            }
            else {
                res.redirect("/watchedList");
            }
        })
    }

    else {
        res.redirect("/login");
    }
})

app.post("/delete-watched-ent", function (req, res) {

    if (req.isAuthenticated()) {

        signedInflag = true;

        User.findOne({ username: req.user.username }, async function (error, foundUser) {
            if (!error) {
                foundUser.watchHistory.splice(parseInt(req.body.index), 1);
                await foundUser.save();
                res.redirect("/watchedList");
            }
        })
    }
    else {
        res.redirect("/login");
    }
})

app.post("/update-watch-history", function (req, res) {
    if (req.isAuthenticated()) {

        signedInflag = true;

        User.findOne({ username: req.user.username }, async function (error, foundUser) {
            if (!error) {
                foundUser.watchHistory[parseInt(req.body.index)] = {
                    name: req.body.watchedEntName,
                    additionalInfo: req.body.info,
                    dateOfWatch: req.body.dateOfWatch
                }
                await foundUser.save();
                res.redirect("/watchedList");
            }
        })
    }
    else {
        res.redirect("/login");
    }
})

app.post("/add-review", function (req, res) {

    if (req.isAuthenticated()) {

        signedInflag = true;

        let newReview = {
            username: req.user.username,
            rating: req.body.reviewRating,
            reviewHead: req.body.reviewHead,
            reviewDesc: req.body.reviewDesc
        };

        let reviewExists = false;
        Entertainment.findOne({ entertainmentId: req.body.entId }, function (err, foundEntertainment) {
            if (foundEntertainment) {
                foundEntertainment.entertainmentReviews.forEach(function (element) {
                    if (element.username === req.user.username) {
                        reviewExists = true;
                        return;
                    }
                })
                if (reviewExists) {
                    res.redirect(307, "/?entId=" + req.body.entId);
                }
                else {
                    foundEntertainment.entertainmentReviews.push(newReview);
                    foundEntertainment.save();
                    res.redirect(307, "/?entId=" + req.body.entId);
                }
            }
            else {

                let newEnt = new Entertainment({
                    entertainmentId: req.body.entId,
                    entertainmentName: req.body.entName,
                    imageUrl: req.body.imageUrl,
                    entertainmentReviews: [newReview]
                });
                newEnt.save();
                res.redirect(307, "/?entId=" + req.body.entId);
            }
        })
    }
    else {
        res.redirect("/login");
    }
});

app.post("/delete-review", function (req, res) {
    if (req.isAuthenticated()) {

        signedInflag = true;

        Entertainment.findOneAndUpdate({ entertainmentId: req.body.entId }, { $pull: { entertainmentReviews: { username: req.user.username } } }, function (error, reviews) {
            if (!error) {
                res.redirect(307, "/?entId=" + req.body.entId);
            }
        })
    }
    else {
        res.redirect("/login");
    }
})

app.get("/about", function (req, res) {
    res.render("about", { signedInflag: signedInflag, username: (signedInflag) ? req.user.username : "" });
})

app.post("/similar/:malId", (req, res) => {
    let malId = req.params.malId;
    let name = req.body.name;
    res.render("entertainments", {
        signedInflag: signedInflag,
        username: (signedInflag) ? req.user.username : "",
        type: malId,
        name: name
    });
})

app.get("/:type", (req, res) => {
    let type = req.params.type;
    type = type.slice(0, 1).toUpperCase() + type.slice(1);
    res.render("entertainments", { signedInflag: signedInflag, username: (signedInflag) ? req.user.username : "", type: type, name: "" });
})


app.post("/entertainments", function (req, res) {
    res.redirect(307, "/");
})

app.listen(3000, function () {
    console.log("Server tuned to port 3000");
})

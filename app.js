// NPM Packages
require('dotenv').config();
const express = require("express");
const https = require("https");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");

// Routers
const authRouter = require("./routes/Auth");
const watchListRouter = require("./routes/User/WatchList");
const watchHistoryRouter = require("./routes/User/WatchHistory");
const reviewRouter = require("./routes/User/Review")

// Models
const User = require("./models/User");
const Anime = require("./models/Anime");

// Data
const idMap = require("./data/animes-minified.json");

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

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Home Page
app.get("/", function (req, res) {
    let isLoggedIn = req.isAuthenticated();
    if (isLoggedIn) {
        res.render("home", { signedInflag: isLoggedIn, username: req.user.username });
    }
    else {
        res.render("home", { signedInflag: isLoggedIn, username: "" });
    }
})

// Ger all reviewed animes to show on home page
app.get("/reviewed", async (req, res) => {
    let allAnimes = await Anime.find({}).exec();
    res.send(JSON.stringify(allAnimes));
})

// Watch order. Chiaki API has been Deprecated!
app.get("/watchOrder", function (req, res) {

    let groupId = idMap[req.query.id].groupId;
    let malIdGroup = Object.keys(idMap).filter(key => idMap[key].groupId === groupId);
    let groupAnimes = [];
    for (malId of malIdGroup) {
        idMap[malId]['mal_id'] = malId;
        groupAnimes.push(idMap[malId]);
    }
    groupAnimes = groupAnimes.map(anime => {
        anime.startData = new Date(anime.startDate)
        anime.endData = new Date(anime.endDate)
        return anime;
    })
    groupAnimes.sort((a, b) => {
        if (a.startDate < b.startDate) return -1;
        else if (a.startDate < b.startDate) return 1;
    })
    res.send({ watchOrderData: groupAnimes });

    // let watchOrderData = "";
    // https.get("https://chiaki.vercel.app/get?group_id=" + req.query.id, function (response) {
    //     response.on("data", (data) => {
    //         watchOrderData = watchOrderData + data;
    //     })
    //     response.on('end', () => {
    //         watchOrderData = JSON.parse(watchOrderData);
    //         res.send({ watchOrderData: watchOrderData });
    //     })
    // })
})

// Advanced search page
app.get("/advanced-search", function (req, res) {
    let isLoggedIn = req.isAuthenticated();
    res.render("advancedSearch", {
        signedInflag: isLoggedIn,
        username: isLoggedIn ? req.user.username : ""
    })
})

// Authentication routes
app.use("/", authRouter);

// Watchlist routes
app.use("/user", watchListRouter);

// watch history routes
app.use("/user", watchHistoryRouter);

// review routes
app.use("/user", reviewRouter);

// About page
app.get("/about", function (req, res) {
    let isLoggedIn = req.isAuthenticated();
    res.render("about", { signedInflag: isLoggedIn, username: isLoggedIn ? req.user.username : "" });
})

// Get details of an anime
app.get("/anime/:mal_id", async function (req, res) {
    let isLoggedIn = req.isAuthenticated();

    let existsInWatchlist = false;
    if (isLoggedIn) {
        let watchlist = req.user.watchlist;
        watchlist.some(function (element) {
            if (element.mal_id === req.params.mal_id) {
                existsInWatchlist = true;
            }
        })
    }

    var name = req.params.mal_id;

    //Extracting Reviews of users
    var allReviews = [];
    let foundEntertainment = await Anime.findOne({ entertainmentId: name }).exec();
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
            let data = entData.data;
            if (!entData.error) {
                let totalEpisodes = data.episodes;
                let airDates = data.aired.string;
                let studio = (data.studios.length !== 0) && data.studios[0].name;
                let season = (data.season) && data.season.charAt(0).toUpperCase() + data.season.slice(1);

                res.render("searchedEnt", {
                    poster: data.images.jpg.image_url,
                    title: data.title,
                    malId: data.mal_id,
                    englishTitle: data.title_english,
                    type: data.type,
                    totalEpisodes: (totalEpisodes) ? totalEpisodes : "Unknown",
                    status: data.status,
                    runtime: data.duration,
                    rating: data.rating,
                    genres: data.genres,
                    release_date: (airDates === "Not available") ? "Dates Unrevealed" : airDates,
                    score: data.score,
                    scored_by: data.scored_by,
                    rank: data.rank,
                    studio: (studio) ? studio : "Unrevealed",
                    plot: data.synopsis,
                    season: (season) ? season : "Unrevealed",
                    signedInflag: isLoggedIn,
                    username: isLoggedIn ? req.user.username : "",
                    existsInWatchlist: existsInWatchlist,
                    Reviews: allReviews,
                });
            }
            else {
                res.render("noResults", { signedInflag: isLoggedIn });
            }
        })
    })
})

// get animes similar to 1 anime. (main fetching is done on the frontend)
app.post("/similar/:malId", (req, res) => {
    let malId = req.params.malId;
    let name = req.body.name;
    let isLoggedIn = req.isAuthenticated();
    res.render("entertainments", {
        signedInflag: isLoggedIn,
        username: isLoggedIn ? req.user.username : "",
        type: malId,
        name: name
    });
})

// Get top, ongoing or upcoming animes (main fetching is done on the frontend)
app.get("/type/:type", (req, res) => {
    let isLoggedIn = req.isAuthenticated();
    let type = req.params.type;
    type = type.slice(0, 1).toUpperCase() + type.slice(1);
    res.render("entertainments", {
        signedInflag: isLoggedIn,
        username: isLoggedIn ? req.user.username : "",
        type: type,
        name: ""
    });
})

app.listen(3000, function () {
    console.log("Server tuned to port 3000");
})

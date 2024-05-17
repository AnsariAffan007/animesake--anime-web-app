const express = require("express");
const watchListController = require("../../controllers/User/WatchList");

const router = express.Router();

router.get("/watchlist", watchListController.getWatchList);

router.post("/watchlist", watchListController.postWatchList);

router.post("/delete-watchlist-ent", watchListController.deleteWatchList);

module.exports = router;
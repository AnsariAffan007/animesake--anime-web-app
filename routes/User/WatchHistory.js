const express = require("express");
const watchHistoryController = require("../../controllers/User/WatchHistory");

const router = express.Router();

router.get("/watchedList", watchHistoryController.getWatchHistory)

router.post("/watchedList", watchHistoryController.postWatchHistory)

router.post("/delete-watched-ent", watchHistoryController.deleteWatchHistory)

router.post("/update-watch-history", watchHistoryController.putWatchHistory);

module.exports = router;
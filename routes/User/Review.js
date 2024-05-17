const express = require("express");
const reviewController = require("../../controllers/User/Review")

const router = express.Router();

router.post("/add-review", reviewController.postReview);

router.post("/delete-review", reviewController.deleteReview);

module.exports = router;
const express = require("express");

const router = express.Router();

const {
addReview,
getReviews
}
=
require("../controllers/review.controller");

router.post("/",addReview);

router.get("/:productId",getReviews);

module.exports = router;
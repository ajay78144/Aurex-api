const express = require("express");

const router = express.Router();

const {
  createReview,
  getReviews,
  deleteReview,
    updateReview,
    getReviewById
    
} = require("../controllers/review.controller");

router.post("/", createReview);

router.get("/", getReviews);

router.delete("/:id", deleteReview);

router.put("/:id", updateReview);

router.get("/:id", getReviewById);



module.exports = router;
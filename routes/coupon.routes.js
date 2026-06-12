const express = require("express");
const router = express.Router();

const {
  createCoupon,
  getCoupons,
  getCouponById,
  updateCoupon,
  deleteCoupon,
} = require("../controllers/coupon.controller");

router.post("/", createCoupon);
router.get("/", getCoupons);
router.get("/:id", getCouponById);
router.put("/:id", updateCoupon);
router.delete("/:id", deleteCoupon);

module.exports = router;
const express = require("express");

const router = express.Router();

const {
createCoupon,
getCoupons,
deleteCoupon
}
=
require("../controllers/coupon.controller");

router.post("/",createCoupon);

router.get("/",getCoupons);

router.delete("/:id",deleteCoupon);

module.exports = router;
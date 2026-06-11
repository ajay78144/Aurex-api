const express = require("express");

const router = express.Router();

const {
createBanner,
getBanners,
deleteBanner
}
=
require("../controllers/banner.controller");

router.post("/",createBanner);

router.get("/",getBanners);

router.delete("/:id",deleteBanner);

module.exports = router;
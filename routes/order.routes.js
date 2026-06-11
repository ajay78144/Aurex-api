const express = require("express");

const router = express.Router();

const {
createOrder,
getOrders,
getOrderById,
updateOrderStatus
}
=
require("../controllers/order.controller");

router.post("/",createOrder);

router.get("/",getOrders);

router.get("/:id",getOrderById);

router.put("/:id/status",updateOrderStatus);

module.exports = router;
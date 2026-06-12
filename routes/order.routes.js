const express = require("express");

const router = express.Router();

const {
createOrder,
getOrders,
getOrderById,
deleteOrder,
updateOrder

}
=
require("../controllers/order.controller");

router.post("/",createOrder);

router.get("/",getOrders);

router.get("/:id",getOrderById);

router.delete("/:id",deleteOrder);

router.put("/:id",updateOrder);




module.exports = router;
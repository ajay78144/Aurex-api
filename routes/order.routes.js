const express = require("express");

const router = express.Router();

const {
createOrder,
getOrders,
getOrderById,
deleteOrder,
updateOrder,
getOrdersByUserId

}
=
require("../controllers/order.controller");

router.post("/",createOrder);

router.get("/",getOrders);

router.get("/user/:userId", getOrdersByUserId);

router.get("/:id",getOrderById);

router.delete("/:id",deleteOrder);

router.put("/:id",updateOrder);




module.exports = router;
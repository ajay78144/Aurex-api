const express = require("express");

const router = express.Router();

const {

    addToCart,

    getCart,

    updateQuantity,

    increaseQuantity,

    decreaseQuantity,

    deleteCartItem,

    clearCart

} = require("../controllers/cart.controller");


// ===============================
// Add Product To Cart
// POST /api/cart
// ===============================

router.post(
    "/",
    addToCart
);


// ===============================
// Get User Cart
// GET /api/cart/user/:userId
// ===============================

router.get(
    "/user/:userId",
    getCart
);


// ===============================
// Update Quantity
// PUT /api/cart/update/:id and PUT /api/cart/:id
// ===============================

router.put(
    "/update/:id",
    updateQuantity
);

router.put(
    "/:id",
    updateQuantity
);


// ===============================
// Increase Quantity
// PATCH /api/cart/increase/:id and PUT /api/cart/increase/:id
// ===============================

router.patch(
    "/increase/:id",
    increaseQuantity
);

router.put(
    "/increase/:id",
    increaseQuantity
);


// ===============================
// Decrease Quantity
// PATCH /api/cart/decrease/:id and PUT /api/cart/decrease/:id
// ===============================

router.patch(
    "/decrease/:id",
    decreaseQuantity
);

router.put(
    "/decrease/:id",
    decreaseQuantity
);


// ===============================
// Delete Cart Item
// DELETE /api/cart/:id
// ===============================

router.delete(
    "/:id",
    deleteCartItem
);


// ===============================
// Clear User Cart
// DELETE /api/cart/clear/:userId
// ===============================

router.delete(
    "/clear/:userId",
    clearCart
);


module.exports = router;
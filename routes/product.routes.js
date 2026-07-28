const express = require("express");

const router = express.Router();

const {

    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    searchProducts,
    getProductsByCategory

} = require("../controllers/product.controller");


// Create Product

router.post("/", createProduct);


// Get All Products

router.get("/", getProducts);


// Search

router.get("/search", searchProducts);


// Products By Category

router.get("/category/:categoryId", getProductsByCategory);


// Get Product By ID

router.get("/:id", getProductById);


// Update

router.put("/:id", updateProduct);


// Delete

router.delete("/:id", deleteProduct);


module.exports = router;
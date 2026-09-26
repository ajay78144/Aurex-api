const Cart = require("../models/Cart");
const Product = require("../models/Product");

/*
==========================================
Add To Cart
==========================================
*/

const addToCart = async (req, res) => {

    try {

        const {
            user,
            product,
            quantity = 1
        } = req.body;

        // Check Product

        const findProduct = await Product.findById(product);

        if (!findProduct) {

            return res.status(404).json({
                success: false,
                message: "Product not found"
            });

        }

        // Check Stock bypassed to support simple ecommerce flow


        // Already Exists

        let cart = await Cart.findOne({
            user,
            product
        });

        if (cart) {

            cart.quantity += quantity;


            cart.price = findProduct.offerPrice > 0
                ? findProduct.offerPrice
                : findProduct.price;

            cart.total = cart.price * cart.quantity;

            await cart.save();

            return res.json({
                success: true,
                message: "Cart Updated",
                cart
            });

        }

        // Create Cart

        cart = await Cart.create({

            user,

            product,

            quantity,

            price: findProduct.offerPrice > 0
                ? findProduct.offerPrice
                : findProduct.price,

            total: (findProduct.offerPrice > 0
                ? findProduct.offerPrice
                : findProduct.price) * quantity

        });

        res.status(201).json({

            success: true,

            message: "Added To Cart",

            cart

        });

    }

    catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};


/*
==========================================
Get User Cart
==========================================
*/

const getCart = async (req, res) => {

    try {

        const cart = await Cart.find({

            user: req.params.userId

        })

            .populate("product");

        let grandTotal = 0;

        cart.forEach(item => {

            grandTotal += item.total;

        });

        res.json({

            success: true,

            totalItems: cart.length,

            grandTotal,

            cart

        });

    }

    catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};


/*
==========================================
Update Quantity
==========================================
*/

const updateQuantity = async (req, res) => {

    try {

        const {

            quantity

        } = req.body;

        const cart = await Cart.findById(req.params.id)
            .populate("product");

        if (!cart) {

            return res.status(404).json({

                success: false,

                message: "Cart Item Not Found"

            });

        }

        if (quantity < 1) {

            return res.status(400).json({

                success: false,

                message: "Quantity Invalid"

            });

        }

        // Stock limit bypassed


        cart.quantity = quantity;

        cart.total = quantity * cart.price;

        await cart.save();

        res.json({

            success: true,

            message: "Quantity Updated",

            cart

        });

    }

    catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};


/*
==========================================
Increase Quantity
==========================================
*/

const increaseQuantity = async (req, res) => {

    try {

        const cart = await Cart.findById(req.params.id)
            .populate("product");

        if (!cart) {

            return res.status(404).json({

                success: false,

                message: "Cart Item Not Found"

            });

        }

        // Stock limit bypassed


        cart.quantity++;

        cart.total = cart.quantity * cart.price;

        await cart.save();

        res.json({

            success: true,

            cart

        });

    }

    catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};


/*
==========================================
Decrease Quantity
==========================================
*/

const decreaseQuantity = async (req, res) => {

    try {

        const cart = await Cart.findById(req.params.id);

        if (!cart) {

            return res.status(404).json({

                success: false,

                message: "Cart Item Not Found"

            });

        }

        if (cart.quantity > 1) {

            cart.quantity--;

            cart.total = cart.quantity * cart.price;

            await cart.save();

        }

        res.json({

            success: true,

            cart

        });

    }

    catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};


/*
==========================================
Delete Cart Item
==========================================
*/

const deleteCartItem = async (req, res) => {

    try {

        await Cart.findByIdAndDelete(req.params.id);

        res.json({

            success: true,

            message: "Item Removed"

        });

    }

    catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};


/*
==========================================
Clear Cart
==========================================
*/

const clearCart = async (req, res) => {

    try {

        await Cart.deleteMany({

            user: req.params.userId

        });

        res.json({

            success: true,

            message: "Cart Cleared"

        });

    }

    catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};


/*
==========================================
Get All Carts
==========================================
*/

const getAllCarts = async (req, res) => {
    try {
        const carts = await Cart.find()
            .populate("user")
            .populate("product");
        res.json(carts);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


module.exports = {

    addToCart,

    getCart,

    getAllCarts,

    updateQuantity,

    increaseQuantity,

    decreaseQuantity,

    deleteCartItem,

    clearCart

};
const express = require("express");
const cors = require("cors");


const authRoutes = require("./routes/auth.routes");
const categoryRoutes = require("./routes/category.routes");
const productRoutes = require("./routes/product.routes");
const orderRoutes = require("./routes/order.routes");
const reviewRoutes = require("./routes/review.routes");
const couponRoutes = require("./routes/coupon.routes");
const bannerRoutes = require("./routes/banner.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const userRoutes = require("./routes/user.routes");
const cartRoutes = require("./routes/cart.routes");
const contactRoutes = require("./routes/contact.routes");

const app = express();

app.use(cors());

app.use(express.json());
app.use("/api/categories",categoryRoutes);
app.use("/api/products",productRoutes);
app.use("/api/auth",authRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/banners", bannerRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/users", userRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/contact", contactRoutes);

app.get("/",(req,res)=>{
res.send("AUREX API Running");
});

module.exports = app;
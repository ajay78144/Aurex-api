const express = require('express');
const cors = require("cors");


const authRoutes = require("./routes/auth.routes");

const categoryRoutes = require("./routes/category.routes");

const productRoutes = require("./routes/product.routes");

const app = express();

app.use(cors());

app.use(express.json());

app.use("/api/categories",categoryRoutes);
app.use("/api/products",productRoutes);
app.use("/api/auth",authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/banners", bannerRoutes);



app.get("/",(req,res)=>{
res.send("AUREX API Running");
});

module.exports = app;
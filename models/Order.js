const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
{
    customer:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },

    products:[
        {
            product:{
                type:mongoose.Schema.Types.ObjectId,
                ref:"Product"
            },

            quantity:Number,

            price:Number
        }
    ],

    shippingAddress:{
        name:String,
        phone:String,
        email:String,
        address:String,
        city:String,
        state:String,
        pincode:String
    },

    totalAmount:Number,

    paymentMethod:{
        type:String,
        default:"COD"
    },

    orderStatus:{
        type:String,
        enum:[
            "Pending",
            "Confirmed",
            "Packed",
            "Shipped",
            "Delivered",
            "Cancelled"
        ],
        default:"Pending"
    }

},
{
    timestamps:true
}
);

module.exports = mongoose.model("Order",orderSchema);
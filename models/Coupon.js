const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
{
    code:{
        type:String,
        unique:true
    },

    discount:Number,
    expiryDate:Date,

    active:{
        type:Boolean,
        default:true
    }

},
{
    timestamps:true
}
);

module.exports = mongoose.model("Coupon",couponSchema);
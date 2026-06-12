const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
{
    name:{
        type:String,
        required:true
    },

    slug:{
        type:String,
        required:true,
        unique:true
    },

    description:{
        type:String,
        required:true
    },

    price:{
        type:Number,
        required:true
    },

    offerPrice:{
        type:Number,
        default:0
    },

    gender:{
        type:String,
        enum:["boys","girls"]
    },

    category:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Category"
    },

    images:[
        {
            type:String
        }
    ],

    colors:[
        {
            type:String
        }
    ],

    sizes:[
        {
            type:String
        }
    ],

    stock:{
        type:Number,
        default:0
    },

    rating:{
        type:Number,
        default:0
    },

    featured:{
        type:Boolean,
        default:false
    },

    trending:{
        type:Boolean,
        default:false
    },

    newArrival:{
        type:Boolean,
        default:false
    }

},
{
    timestamps:true
}
);

module.exports = mongoose.model("Product",productSchema);
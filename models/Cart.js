const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(

{

    user:{

        type:mongoose.Schema.Types.ObjectId,

        ref:"User",

        required:true

    },

    product:{

        type:mongoose.Schema.Types.ObjectId,

        ref:"Product",

        required:true

    },

    quantity:{

        type:Number,

        default:1,

        required:true,

        min:1

    },

    price:{

        type:Number,

        required:true

    },

    total:{

        type:Number,

        default:0

    }

},

{

timestamps:true

}

);

// One product only once in one user's cart

cartSchema.index(

{

user:1,

product:1

},

{

unique:true

}

);

// Calculate total before save

cartSchema.pre("save",function(){

this.total=this.price*this.quantity;

});

module.exports=mongoose.model("Cart",cartSchema);
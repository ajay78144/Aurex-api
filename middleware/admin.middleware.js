const User = require("../models/User");

const adminOnly = async(req,res,next)=>{

    const user = await User.findById(req.user.id);

    if(user.role !== "admin"){

        return res.status(403).json({
            message:"Admin Access Only"
        });

    }

    next();

};

module.exports = adminOnly;
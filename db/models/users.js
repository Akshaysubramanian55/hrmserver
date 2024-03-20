const mongoose= require("mongoose");
const user_types = require("./user_types");

const users=new mongoose.Schema(
    {
            name:"string",
            email:"string",
            phonenumber:"string",
            Address:"string",
            pincode:"string",
            password:"string",
            password_token: "string",
            lastLogin:{ type: Date, default: null },
            // firstLogin: { type: Boolean, default: true },


            user_type: { type: mongoose.Schema.Types.ObjectId, ref: "user_types" },

    }

)
module.exports=mongoose.model("users",users);
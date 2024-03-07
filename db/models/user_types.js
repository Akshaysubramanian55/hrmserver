const mongoose=require('mongoose');

const user_types =new mongoose.Schema(
    {
        user_type:"string",

    },
    // {
    //     timestamps:true,
    // }
);


module.exports=mongoose.model("user_types",user_types);
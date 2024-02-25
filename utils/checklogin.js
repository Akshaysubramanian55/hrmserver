let success_function=require('./response-handler').success_function;
let error_function=require('./response-handler').error_function;
let users =require('../db/models/users');
let jwt =require('jsonwebtoken');
exports.checkLogin=async function(req,res,next){
    try {

        let token =req.headers['authorization'].split(' ')[1];
        console.log("token : ",token);

        if(!token){
            let response=error_function({
                statusCode:400,
                message:"Token is required",
            });
            res.status(response.statusCode).send(response);
            return;
        }else{
            jwt.verify(token,process.env.PRIVATE_KEY,async function(err,decoded){
                if(err){
                    let response=error_function({
                        statusCode:400,
                        message:err.message?err.message:err,
                    })
                    res.status(response.statusCode).send(response);
                    return;
                }else{
                    let user_id=decoded.user_id;
                    console.log("user_id : ",user_id);

                    let user=await users.findOne({_id:user_id});
                    console.log("user : ",user)

                    if(user){
                        req.user_id=user_id;//write user_id into the request
                        next();
                    }else{
                        let response=error_function({
                            statusCode:404,
                            message:"Login User not found"
                        });
                        res.status(response.statusCode).send(response);
                        return;
                    }
                }
            })
        }
    } catch (error) {
      console.log("error : ",error);
      let response=error_function({
        statusCode:400,
        message:"something went wrong",
      });
      res.status(response.statusCode).send(response);
      return;
    }
}
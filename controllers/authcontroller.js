let success_function = require('../utils/response-handler').success_function;
let error_function = require('../utils/response-handler').error_function;
const users=require('../db/models/users');
let jwt =require('jsonwebtoken');
let bcrypt=require('bcryptjs');
let dotenv=require('dotenv');
dotenv.config();


exports.login = async function (req, res) {


    try {
        let email = req.body.email;
        let password = req.body.password;
        


        if (email && password) {
            let user = await users.findOne({
                $and: [{ email: email }]
            })

            if (!user) {
                let response = error_function({ "status": 400, "message": "Invalid Email" });
                res.status(response.statusCode).send(response);
                return;
            }

            
        if(user){
            let db_password=user.password;
            console.log("db_password : ",db_password);

            bcrypt.compare(password,db_password,(err,auth)=>{
                if(auth===true){
                    let access_token=jwt.sign({user_id:user.user_id},process.env.PRIVATE_KEY,{expiresIn :"1d"});
                    console.log("access_token : ",access_token);
    
                    let response=success_function({
                        statusCode:200,
                        data:access_token,
                        message:"Login Successfull",
                    });
                    res.status(response.statusCode).send(response);
                    return;
                } else {
                        let response = error_function({
                            statusCode: 401,
                            message: "invalid credentials"
                        });
                        res.status(response.statusCode).send(response);
                        return;
                    }

                });
            } else {
                let response = error_function({
                    statusCode: 401,
                    message: "invalid Credentials"
                });
                res.status(response.statusCode).send(response);
                return;
            }

        } else {
            if (!email) {
                let response = error_function({
                    statusCode: 422,
                    message: "email is required"
                });
                res.status(response.statusCode).send(response);
                return;
            }

            if (!password) {
                let response = success_function({
                    statusCode: 422,
                    message: "password required"
                });
                res.status(response.statusCode).send(response);
                return;
            }
        }
    } catch (error) {
        if (process.env.NODE_ENV == "production") {
            let response = error_function({
                statusCode: 400,
                message: error
                    ? error.message
                        ? error.message
                        : error
                :"something went wrong",        
        });
        res.status(response.statusCode).send(response);
        return;
        }else{
            let response=error_function({status:400,message:error});
            res.status(response.statusCode).send(response);
            return;
        }
    }
};
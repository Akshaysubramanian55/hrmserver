const success_function = require('../utils/response-handler').success_function;
const error_function = require('../utils/response-handler').error_function;
const users = require('../db/models/users');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const validator = require("validator");
const isEmpty = require('../vallidation/isEmpty');
const revokeuser = require('../userr/revokeuser');
const sendEmail = require('../utils/sendemail').sendEmail;
const resetpassword = require('../utils/resetpassword').resetpassword;
dotenv.config();

exports.login = async function (req, res) {
    try {
        let email = req.body.email;
        let password = req.body.password;

        async function ValidateLogin(data) {
            let errors = {};

            data.email = !isEmpty(data.email) ? data.email : "";
            data.password = !isEmpty(data.password) ? data.password : "";
            console.log(data.email)

            if (validator.isEmpty(data.email)) {
                errors.email_empty = "Email is required";
            }

            if (!validator.isEmail(data.email)) {
                errors.email = "Email is Invalid";
            }

            if (validator.isEmpty(data.password)) {
                errors.password_empty = "Password is required";
            }



            return {
                userValid: isEmpty(errors),
                usererrors: errors,
            };
        }

        const { userValid, usererrors } = await ValidateLogin(req.body);

        console.log("userinvalid", userValid);
        console.log("usererror", usererrors);

        if (!userValid) {
            let response = error_function({
                statusCode: 400,
                message: "Validation error",
                errors: usererrors, // Send validation errors to the client
            });
            res.status(response.statusCode).send(response);
            return;
        } else {
            if (email && password) {
                let user = await users.findOne({
                    email: email
                });

                if (!user) {
                    let response = error_function({
                        statusCode: 400,
                        message: "No User Found",
                    });
                    res.status(response.statusCode).send(response);
                    return;
                }

                if (user) {
                    let db_password = user.password;
                    console.log("db_password : ", db_password);

                    bcrypt.compare(password, db_password, (err, auth) => {
                        if (auth === true) {
                            let access_token = jwt.sign({ user_id: user._id }, process.env.PRIVATE_KEY, { expiresIn: "1d" });
                            console.log("access_token : ", access_token);

                            let response = success_function({
                                statusCode: 200,
                                data: access_token,
                                message: "Login Successful",
                            });
                            res.status(response.statusCode).send(response);
                            return;
                        } else {
                            let response = error_function({
                                statusCode: 401,
                                message: "Invalid credentials"
                            });
                            res.status(response.statusCode).send(response);
                            return;
                        }
                    });
                } else {
                    let response = error_function({
                        statusCode: 401,
                        message: "Invalid Credentials"
                    });
                    res.status(response.statusCode).send(response);
                    return;
                }
            } else {
                if (!email) {
                    let response = error_function({
                        statusCode: 422,
                        message: "Email is required"
                    });
                    res.status(response.statusCode).send(response);
                    return;
                }

                if (!password) {
                    let response = error_function({
                        statusCode: 422,
                        message: "Password is required"
                    });
                    res.status(response.statusCode).send(response);
                    return;
                }
            }
        }
    } catch (error) {
        if (process.env.NODE_ENV == "production") {
            let response = error_function({
                statusCode: 400,
                message: error ? (error.message ? error.message : error) : "Something went wrong",
            });
            res.status(response.statusCode).send(response);
            return;
        } else {
            let response = error_function({ status: 400, message: error });
            res.status(response.statusCode).send(response);
            return;
        }
    }
};

exports.forgetpasswordcontroller = async function (req, res) {

    try {

        let email = req.body.email;


        if (email) {
            let user = await users.findOne({ email: email });

           


            if(user){

                
                let reset_token=jwt.sign({user_id:user._id},process.env.PRIVATE_KEY ,{expiresIn:"10m"});

                let data=await users.updateOne(
                    {email:email},
                    {$set:{password_token:reset_token}},

                   
                );


               



                if(data.matchedCount === 1 && data.modifiedCount == 1){

                    let reset_link=`${process.env.FRONTEND_URL}/reset-password?token=${reset_token}`;

                  console.log(user.email)

                    let email_template = await resetpassword(user.name,reset_link);
                    await sendEmail(email, "forgot password", email_template);



                    

                    let response=success_function({
                        statusCode:200,
                        message:"Email sent Successfully",
                    });
                    res.status(statusCode).send(response);
                    return;
                }else if(data.matchedCount===0){
                    let response=error_function({
                        statusCode:404,
                        message:"user not found",
                    });
                    res.status(statusCode).send(response);
                    return;
                }else{
                    let response=error_function({
                        statusCode:400,
                        message:"Password reset failed",
                    });
                    res.status(statusCode).send(response);
                    return;
                }
            }else{
                let response=error_function({
                    statusCode:403,
                    message:"forbidden",
                });
                res.status(statusCode).send(response);
                return;
            }

        }else{
            response=error_function({
                statusCode:422,
                message:"email is required",
            });
            res.status(statusCode).send(response);
            return;
        }
    } catch (error) {

       


            let response=error_function({
                
                statusCode:400,
                message:"something went wrong"
            });
            res.status(response.statusCode).send(response);
            return;
        }
    }










exports.checkRevoked = function (req, res) {
    return new Promise((resolve, reject) => {
        const authHeader = req.headers["authorization"];
        const token = authHeader.split(" ")[1];

        revokeuser
            .checkRevoked(token)
            .then((message) => {
                resolve(message);
            })
            .catch((error) => {
                reject(error);
            });
    });
};


let success_function = require('../utils/response-handler').success_function;
let error_function = require('../utils/response-handler').error_function;
const users = require('../db/models/users');
let jwt = require('jsonwebtoken');
let bcrypt = require('bcryptjs');
let dotenv = require('dotenv');
const validator = require("validator");
const isEmpty = require('../vallidation/isEmpty'); 
const revokeuser=require('../userr/revokeuser')
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
  

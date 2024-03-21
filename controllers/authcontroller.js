const success_function = require('../utils/response-handler').success_function;
const error_function = require('../utils/response-handler').error_function;
const users = require('../db/models/users');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const validator = require("validator");
const isEmpty = require('../vallidation/isEmpty');
const revokeuser = require('../userr/revokeuser');
const { listeners } = require('../db/models/user_types');
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


                // let data = await users.updateOne(
                //     { email: email },
                //     { $set: { password_token: reset_token } }
                // console.log("Existing lastLogin field:", user.lastLogin);

                let firstLogin = !user.lastLogin;
        
        // Update lastLogin field if it's the first login
        if (firstLogin) {
            await users.updateOne({ email: email }, { $set: { lastLogin: new Date() } });
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
                                data: {
                                    token: access_token,
                                    lastLogin: user.lastLogin,
                                    user_type:user.user_type,
                                },
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

        if (!email) {
            let response = error_function({
                statusCode: 422,
                message: "email is required",
            });
            return res.status(response.statusCode).send(response);
        }

        let user = await users.findOne({ email: email });
        if (!user) {
            let response = error_function({
                statusCode: 404,
                message: "user not found",
            });
            return res.status(response.statusCode).send(response);
        }

        let reset_token = jwt.sign({ user_id: user._id }, process.env.PRIVATE_KEY, { expiresIn: "10m" });
        let data = await users.updateOne(
            { email: email },
            { $set: { password_token: reset_token } }
        );

        if (data.matchedCount === 1 && data.modifiedCount == 1) {
            let reset_link = `${process.env.FRONTEND_URL}/reset-password?token=${reset_token}`;
            let email_template = await resetpassword(user.name, reset_link);
            await sendEmail(email, "forgot password", email_template);

            let response = success_function({
                statusCode: 200,
                message: "Email sent Successfully",
            });
            return res.status(response.statusCode).send(response);
        } else {
            let response = error_function({
                statusCode: 400,
                message: "Password reset failed",
            });
            return res.status(response.statusCode).send(response);
        }
    } catch (error) {
        let response = error_function({
            statusCode: 400,
            message: "something went wrong"
        });
        return res.status(response.statusCode).send(response);
    }
}

exports.passwordresetcontroller = async function (req, res) {
    try {
        const authHeader = req.headers["authorization"];

        if (!authHeader) {
            let response = error_function({
                statusCode: 401,
                message: "Authorization header not received"
            });
            return res.status(response.statusCode).send(response);
        }

        const token = authHeader.split(" ")[1];

        let password = req.body.password;

        if (!password) {
            let response = error_function({
                statusCode: 422,
                message: "Password is required"
            });
            return res.status(response.statusCode).send(response);
        }

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.PRIVATE_KEY);
        } catch (error) {
            let response = error_function({
                statusCode: 403,
                message: "Invalid or expired token"
            });
            return res.status(response.statusCode).send(response);
        }

        let user = await users.findOne({
            _id: decoded.user_id,
            password_token: token
        });

        if (!user) {
            let response = error_function({
                statusCode: 404,
                message: "User not found or invalid token"
            });
            return res.status(response.statusCode).send(response);
        }

        let salt = bcrypt.genSaltSync(10);
        let password_hash = bcrypt.hashSync(password, salt);

        let data = await users.updateOne(
            { _id: decoded.user_id },
            { $set: { password: password_hash, password_token: null } }
        );

        if (data.matchedCount === 1 && data.modifiedCount === 1) {
            let response = success_function({
                statusCode: 200,
                message: "Password changed successfully"
            });
            return res.status(response.statusCode).send(response);
        } else {
            let response = error_function({
                statusCode: 400,
                message: "Password reset failed"
            });
            return res.status(response.statusCode).send(response);
        }
    } catch (error) {
        let response = error_function({
            statusCode: 500,
            message: "Internal server error"
        });
        return res.status(response.statusCode).send(response);
    }
}



exports.changepassword = async function (req, res) {
    const { currentpassword, newpassword } = req.body;
    const authHeader = req.headers["authorization"];

    if (!authHeader) {
        let response = error_function({
            statusCode: 401,
            message: "Authorization header not received"
        });
        return res.status(response.statusCode).send(response);
    }

    try {
        const token = authHeader.split(" ")[1];
        const decodedToken = jwt.verify(token, process.env.PRIVATE_KEY);

        const UserId = decodedToken.user_id;

        const user = await users.findById(UserId);
        if (!user) {
            let response = error_function({
                statusCode: 404,
                message: "No such user"
            });
            return res.status(response.statusCode).send(response);
        }

        const currentpasswordvalid = await bcrypt.compare(currentpassword, user.password);
        if (!currentpasswordvalid) {
            let response = error_function({
                statusCode: 400,
                message: "Current password is incorrect"
            });
            return res.status(response.statusCode).send(response);
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newpassword, salt);

        await users.findByIdAndUpdate(UserId, { password: hashedPassword });

        let response = success_function({
            statusCode: 200,
            message: "Password changed successfully"
        });
        return res.status(response.statusCode).send(response);
    } catch (error) {
        let response = error_function({
            statusCode: 500,
            message: error.message || "Internal server error"
        });
        return res.status(response.statusCode).send(response);
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


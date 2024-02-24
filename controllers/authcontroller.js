let success_function = require('../utils/response-handler').success_function;
let error_function = require('../utils/response-handler').error_function;
const users=require('../db/models/users');



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

            if (user) {
                bcrypt.compare(password, user.password, async (error, auth) => {

                    if (auth === true) {
                        let access_token = jwt.sign(
                            { user_id: user_id },
                            process.env.PRIVATE_KEY,
                            { expiresIn: "10d" }
                        );
                        let response = success_function({
                            status: 200,
                            data: access_token,
                            message: "Login successful"
                        });
                        response.user_type = user_type;
                        res.status(response.statusCode).send(response);
                        return;
                    } else {
                        let response = error_function({
                            status: 401,
                            message: "invalid credentials"
                        });
                        res.status(response.statusCode).send(response);
                        return;
                    }

                });
            } else {
                let response = error_function({
                    status: 401,
                    message: "invalid Credentials"
                });
                res.status(response.statusCode).send(response);
                return;
            }

        } else {
            if (!email) {
                let response = error_function({
                    status: 422,
                    message: "email is required"
                });
                res.status(response.statusCode).send(response);
                return;
            }

            if (!password) {
                let response = success_function({
                    status: 422,
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
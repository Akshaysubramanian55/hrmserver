const users = require('../db/models/users');
const bcrypt = require('bcryptjs');
const success_function = require('../utils/response-handler').success_function;
const error_function = require('../utils/response-handler').error_function;
const validateadduser = require('../vallidation/adduser_validation');
const sendEmail = require('../utils/sendemail').sendEmail;
const set_password = require('../utils/set-password').setpassword;

exports.addUser = async function (req, res) {
    try {
        const { name, email, phonenumber, Address, pincode } = req.body;

        const { userValid, usererrors } = await validateadduser(req.body);

        if (!userValid) {
            let response = error_function({
                statusCode: 400,
                message: "Validation error",
            });
            response.errors = usererrors;
            return res.status(response.statusCode).send(response);
        } else {
            const user_type_id = "65e9929396df220728517706";

            if (phonenumber.length !== 10) {
                let response = error_function({
                    statusCode: 400,
                    message: 'Phone number should be 10 digits.'
                });
                return res.status(response.statusCode).send(response);
            }

            if (pincode.length !== 6) {
                let response = error_function({
                    statusCode: 400,
                    message: 'Pincode should be 6 digits.'
                });
                return res.status(response.statusCode).send(response);
            }

            const isUserExist = await users.findOne({ email });
            if (isUserExist) {
                let response = error_function({
                    statusCode: 400,
                    message: 'User already exists'
                });
                return res.status(response.statusCode).send(response.message);
            }

            // Generate random password
            function generateRandomPassword(length) {
                let charset =
                  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$";
                let password = "";
                for (var i = 0; i < length; i++) {
                  var randomIndex = Math.floor(Math.random() * charset.length);
                  password += charset.charAt(randomIndex);
                }
                return password;
            }

            var randomPassword = generateRandomPassword(12);
            console.log("Random Password:", randomPassword);

            const salt = bcrypt.genSaltSync(10);
            const hashed_password = bcrypt.hashSync(randomPassword, salt);
            console.log("hashedpasword :",hashed_password)

            // Creating new user
            const new_user = await users.create({
                name,
                email,
                password: hashed_password,
                phonenumber,
                Address,
                pincode,
                user_type: user_type_id
            });

            if (new_user) {
                let email_template = await set_password(name, email, randomPassword);
                await sendEmail(email, "Password", email_template);
                console.log("Email sent.....");
        
                let response = success_function({
                    statusCode: 201,
                    data: new_user,
                    message: 'User created successfully'
                });
                return res.status(response.statusCode).send(response);
            } else {
                let response = error_function({
                    statusCode: 400,
                    message: 'Failed to create user'
                });
                return res.status(response.statusCode).send(response);
            }
        } 
    }catch (error) {
            console.error(error); // Log the error for debugging
            let response = error_function({
                statusCode: 500,
                message: 'User creation failed'
            });
            return res.status(response.statusCode).send(response);
        }
    }

exports.getuser = async function (req, res) {
    try {

        const page = parseInt(req.query.page) || 1; // Current page, default to 1
        const limit = parseInt(req.query.limit) || 5; // Items per page, default to 5

        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;

        

        const keyword=req.query.keyword

        let filter={};


        if (keyword) {
            filter = {
                $or: [
                    { "name": { $regex: keyword, $options: "i" } }, 
                    { "email": { $regex: keyword, $options: "i" } } // Case-insensitive 
                ]
            };
        }

        const allUsers = await users.find(filter).skip(startIndex).limit(limit);
        const totalUsers = await users.countDocuments(filter);



        // const allUsers = await users.find();
        if (allUsers && allUsers.length > 0) {
            // Sending response with users if found
            const response = {
                statusCode: 200,
                message: "Success",
                data: allUsers,
                currentPage: page,
                totalPages: Math.ceil(totalUsers / limit)
            };
            res.status(200).send(response);
        } else {
            // Sending error response if no users found
            const response = {
                statusCode: 404,
                message: "No users found"
            };
            res.status(404).send(response);
        }
    } catch (error) {
        // Sending internal server error response if any error occurs
        console.error("Error fetching users:", error);
        const response = {
            statusCode: 500,
            message: "Internal server error"
        };
        res.status(500).send(response);
    }
}

exports.router = async function (req, res) {
    try {
        const userId = req.params.userId;
        const user = await users.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // If user found, return user details
        res.json(user);
    } catch (error) {
        console.error('Error fetching user details:', error);
        res.status(500).json({ error: 'Server error' });
    }
};
exports.Updateuser = async function (req, res) {


    const userId = req.params.userId;
    const userData = req.body;



    try {
        const updateuser = await users.findByIdAndUpdate(userId, userData, { new: true });

        if (updateuser) {
            // Sending response with updated user
            const response = {
                statusCode: 200,
                message: "User updated successfully",
                data: updateuser
            };
            res.status(200).send(response);
        } else {
            // Sending error response if user not found
            const response = {
                statusCode: 404,
                message: "User not found"
            };
            res.status(404).send(response);
        }
    } catch (error) {
        console.error("Error updating user:", error);
        const response = {
            statusCode: 500,
            message: "Internal server error"
        };
        res.status(500).send(response);
    }
}

// exports.userlogout=async function(req,res){
//     const token = req.headers.authorization?.split(" ")[1]; // Extract JWT token from request headers
//     if (token) {
//         // Add token to blacklist
//         jwtBlacklist.push(token);
//         res.json({ message: 'Logout successful' });
//     } else {
//         res.status(401).json({ message: 'Unauthorized' });
//     }
// }


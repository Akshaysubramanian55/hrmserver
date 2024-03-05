const users = require('../db/models/users');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { response } = require('express');
const success_function = require('../utils/response-handler').success_function;
const error_function = require('../utils/response-handler').error_function;


exports.addUser = async function (req, res) {

    try {

        const name = req.body.name;

        //Name Validation

        

        const email = req.body.email;
        const password = req.body.password;
        const phonenumber = req.body.phonenumber;
        const Address = req.body.Address;
        const pincode = req.body.pincode;




        const isUserExist = await users.findOne({ email });
        console.log("isUserExist : ", isUserExist);

        if (isUserExist) {
            let response = error_function({
                statusCode: 400,
                message: ('User Already Exixts')
            });
            res.status(response.statusCode).send(response.message);
            return;
        }

        let salt = await bcrypt.genSalt(10);
        console.log("salt : ", salt);

        let hashed_password = bcrypt.hashSync(password, salt);
        console.log("hashed_password : ", hashed_password);

        const new_user = await users.create({
            name,
            email,
            password: hashed_password,
            phonenumber,
            Address,
            pincode
        });
        let response_obj = {
            name,
            email,
            password,
            phonenumber,
            Address,
            pincode
        }

        if (new_user) {
            let response = success_function({
                statusCode: 201,
                data: new_user,
                message: "success"
            });
            res.status(response.statusCode).send(response)
        } else {
            response = error_function({
                statusCode: 400,
                message: "failed"
            });
            res.status(response.statusCode).send(response)
        }
    } catch (error) {
        let response = error_function({
            statusCode: 400,
            message: "user creation failed"
        });
        res.status(response.statusCode).send(response)
    }
}


exports.getuser = async function (req, res) {
    try {
        const allUsers = await users.find();
        if (allUsers && allUsers.length > 0) {
            // Sending response with users if found
            const response = {
                statusCode: 200,
                message: "Success",
                data: allUsers
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

exports.router= async function (req, res)  {
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
exports.Updateuser=async function(req,res){


    const userId = req.params.userId;
    const userData = req.body;



    try {
               const updateuser=await users.findByIdAndUpdate(userId,userData,{ new: true });

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



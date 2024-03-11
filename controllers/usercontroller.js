const users = require('../db/models/users');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const express = require('express');
const success_function = require('../utils/response-handler').success_function;
const error_function = require('../utils/response-handler').error_function;
const validateadduser = require('../vallidation/adduser_validation');



exports.addUser = async function (req, res) {

    
        try {


            const { name, email, password, phonenumber, Address, pincode } = req.body;

           
               console.log(req.body)
            
         
            const {userValid,usererrors }= await validateadduser(req.body);
            
            console.log("userinvalid",userValid);
            console.log("usererror",usererrors)


            

            if (!userValid ) {
                let response = error_function({
                    statusCode: 400,
                    message:"Validation error",
                   
                });
                response.errors = usererrors;
                res.status(response.statusCode).send(response);
                return;
            }else{

               let user_type_id="65e9929396df220728517706"

                console.log(user_type_id)

                if (phonenumber.length !== 10) {
                    let response = error_function({
                        statusCode: 400,
                        message: ' phone number should be 10 digits.'
                    });
                    res.status(response.statusCode).send(response);
                    return;
                }
              
    
                if(pincode.length !==6){
                    let response = error_function({
                        statusCode: 400,
                        message: ' pincode should be 6 digits.'
                    });
                    res.status(response.statusCode).send(response);
                    return;
                }
        
                const isUserExist = await users.findOne({ email });
                if (isUserExist) {
                    let response = error_function({
                        statusCode: 400,
                        message: 'User already exists'
                    });
                    res.status(response.statusCode).send(response.message);
                    return;
                }
        
                const salt = await bcrypt.genSalt(10);
                const hashed_password = bcrypt.hashSync(password, salt);
        
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
                    let response = success_function({
                        statusCode: 201,
                        data: new_user,
                        message: 'User created successfully'
                    });
                    res.status(response.statusCode).send(response);
                } else {
                    let response = error_function({
                        statusCode: 400,
                        message: 'Failed to create user'
                    });
                    res.status(response.statusCode).send(response);
                }
            }
           
          
           
           
        } catch (error) {
            let response = error_function({
                statusCode: 400,
                message: 'User creation failed'
            });
            res.status(response.statusCode).send(response);
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


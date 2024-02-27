const users=require('../db/models/users');
const mongoose=require('mongoose');
const bcrypt=require('bcryptjs');
const { response } = require('express');
const success_function=require('../utils/response-handler').success_function;
const error_function=require('../utils/response-handler').error_function;


exports.addUser=async function(req,res){

    try {
        
        const name=req.body.name;
        const email=req.body.email;
        const password=req.body.password;
        const phonenumber=req.body.phonenumber;
        const Address=req.body.Address;
        const pincode =req.body.pincode;

        const isUserExist =await users.findOne({email});
        console.log("isUserExist : ",isUserExist);

        if(isUserExist){
          let  response=error_function({
            statusCode:400,
           message:('User Already Exixts')
          });
          res.status(response.statusCode).send(response.message);
            return;  
        }

        let salt=await bcrypt.genSalt(10);
        console.log("salt : ",salt);

        let hashed_password=bcrypt.hashSync(password,salt);
        console.log("hashed_password : ",hashed_password);

        const new_user=await users.create({
            name,
            email,
            password:hashed_password,
            phonenumber,
            Address,
            pincode
        });
        let response_obj={
           name,
           email,
           password,
           phonenumber,
           Address,
           pincode
        }

        if(new_user){
            let response=success_function({
                statusCode:201,
                data:new_user,
                message:"success"
            });
            res.status(response.statusCode).send(response.message)
        }else{
            response=error_function({
                statusCode:400,
                message:"failed"
            });
            res.status(response.statusCode).send(response.message)
        }
    } catch (error) {
        let response=error_function({
            statusCode:400,
            message:"user creation failed"
        });
        res.status(response.statusCode).send(response.message)
    }
}


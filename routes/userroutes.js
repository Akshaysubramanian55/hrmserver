const express=require('express');
const router=express.Router();
const userController=require("../controllers/usercontroller");
const checkLogin=require('../utils/checklogin').checkLogin;


router.post('/adduser',userController.addUser);
router.get('/getuser',userController.getuser);

module.exports=router;
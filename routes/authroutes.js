const express=require('express');
const router=express.Router();

const authController=require('../controllers/authcontroller');
const checkLogin =require('../utils/checklogin').checkLogin;

router.post('/login',checkLogin,authController.login);

module.exports = router;
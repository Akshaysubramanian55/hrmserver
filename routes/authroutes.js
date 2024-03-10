const express=require('express');
const router=express.Router();

const authController=require('../controllers/authcontroller');

const accesscontrol=require("../utils/accesscontol").accesscontrol

const setAccessControl = (access_type) => {
    return (req, res, next) => {
        accesscontrol(access_type, req, res, next);
    }
};


router.post('/login',setAccessControl('*'),authController.login);

module.exports = router;
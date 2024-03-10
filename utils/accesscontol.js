const jwt = require("jsonwebtoken");
const authcontroller = require("../controllers/authcontroller");;
const error_function = require("./response-handler").error_function;
const control_data = require("./control_data.json");
const user = require("../db/models/users");
const user_types = require("../db/models/user_types");

exports.accesscontrol = async function (access_types, req, res) {

    try {

        if (access_types =="*") {
            next();
        } else {
            const authHeader = req.headers["authorization"];
            const token = authHeader ? authHeader.split(" ")[1] : null;

            if(token==null||token=="null"||token==""||token=="undefined"){
                let response = error_function({
                    statusCode: 401,
                    message: "Invalid Access Token",
                  });
                  res.status(401).send(response);
            }else{
                jwt.verify(
                    token,
                    process.env.PRIVATE_KEY,
                    async function(err,decoded){

                        if(err){
                            let response=error_function({
                               statusCode:401,
                               message:err.message
                            });
                            res.status(401).send(response);
                        }else{
                            let allowed=access_types.split(",")
                            .map((obj)=>control_data[obj]);


                            let user_type_id=(await  user.findOne({_id:decoded.users_id})).user_type;
                            let user_type=(await user_types.findOne({_id:user_type_id})).user_type;

                            if(allowed&&allowed.include(user_type)){

                                let revoked=await authcontroller.checkRevoked(req,res)

                                if(revoked==false){
                                    next()
                                }else if(revoked==true){
                                    let response=error_function({
                                        statusCode:401,
                                        message:"Revoked Access token"
                                    })
                                    res.status(401).send(response);
                                }else{
                                    let response=error_function({
                                        statusCode:400,
                                        message:"Something Went Wrong"
                                    })
                                    res.status(400).send(response);
                                }
                            }else{
                               let response=error_function({
                                    statusCode:403,
                                    message:"Not allowed to access the route"
                                })
                                res.status(403).send(response);
                            }
                        }

                        
                    }
                )
            }
        }

    } catch (error) {
        let response = error_function(error);
        res.status(400).send(response);
      }
}
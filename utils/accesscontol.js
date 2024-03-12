const jwt = require("jsonwebtoken");
const authcontroller = require("../controllers/authcontroller");
const error_function = require("./response-handler").error_function;
const control_data = require("./control_data.json");
// const user = require("../db/models/users");
const user_types = require("../db/models/user_types");
const users = require("../db/models/users");

exports.accesscontrol = async function (access_types, req, res,next) {

    try {

        if (access_types =="*") {
            next();
        } else {
            const authHeader = req.headers["authorization"];
            console.log("authheader",authHeader);
            const token = authHeader ? authHeader.split(" ")[1] : null;
            console.log("token",token);

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

                            console.log("allowed",allowed);
                            console.log("decoded : ",decoded);

                            console.log("token from access_control ",decoded.user_id)


                            let user_type_id=(await  users.findOne({_id:decoded.user_id})).user_type;
                            console.log("usertypeid",user_type_id);



                            let user_type=(await user_types.findOne({_id:user_type_id})).user_type;
                            console.log("user_type",user_type)

                            if(allowed && allowed.includes(user_type)){

                                // let revoked=await authcontroller.checkRevoked(req,res)

                                // if(revoked==false){
                                //     next()
                                // }else if(revoked==true){
                                //     let response=error_function({
                                //         statusCode:401,
                                //         message:"Revoked Access token"
                                //     })
                                //     res.status(401).send(response);
                                // }
                                // else{
                                //     let response=error_function({
                                //         statusCode:400,
                                //         message:"Something Went Wrong"
                                //     })
                                //     res.status(400).send(response);
                                // }
                                next();
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
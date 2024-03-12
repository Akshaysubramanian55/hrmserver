// const accessControl = require('../db/models/revokedtokens');


// exports.revoke = async function (token) {
//     return new Promise(async (resolve, reject) => {
//         try {
//             if (token == null || token == "null" || token == "" || token == "undefined") {
//                 reject({ "status": 400, "message": "Invalid Access Token" });
//             }
//             else {
//                 console.log("Reached here ...");
//                 let saveToken = await accessControl.findOneAndUpdate({ token: token }, { token: token }, { upsert: true, new : true },
               
                
//                 );

//                 if(saveToken) {

//                     resolve({"status" : 200, "message" : "Logout successful"});
//                 }else {
//                     reject({ "status": 400, "message": "Logout Failed" });
//                 }
//             }
//         }
//         catch (error) {
//             if (process.env.NODE_ENV == "production") reject({ "status": 400, "message": error ? (error.message ? error.message : error) : "Something went wrong" });
//             else reject({ "status": 400, "message": error });
//         }
//     });
// }

// exports.checkRevoked = function (token) {
//     return new Promise(async (resolve, reject) => {
//         try {
//             let revoked = await accessControl.findOne({ token: token });
//             // If the token is found and is revoked, resolve with true
//             if (revoked) {
//                 resolve(true);
//             } else {
//                 // If the token is found but not revoked, resolve with false
//                 resolve(false);
//             }
//         }
//         catch (error) {
//             // If an error occurs during the operation, reject the promise
//             let errorMessage = error.message || "Something went wrong";
//             reject({ "status": 400, "message": errorMessage });
//         }
//     });
// };

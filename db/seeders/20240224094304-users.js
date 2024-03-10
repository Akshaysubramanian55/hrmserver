'use strict';

module.exports = {
  up: (models, mongoose) => {

    return models.users
    .insertMany([
      {
        _id:"65d9c2889f9dfda2f46d8b7d",
        name:"Akshaysubramanian",
        email:"akshaysubramanian55@gmail.com",
        phonenumber:"8606570103",
        Address:"pallath(h),cheranallooor p.o,cheranallor",
        pincode:"683544",
        password:"$2y$10$PCppS.lE13Gp5zn60sQyYuVdgI8N2WyWH8fjJRjS2q6stFwKQZTXO",//123654789
        user_type:"65e9927f96df220728517705"
      },
      {
         _id:"65d9c2929f9dfda2f46d8b7e",
         name:"John Dae",
         email:"john@gmail.com",
         phonenumber:"1234567890",
         Address:"House Number:106,kaloor,Ernakulam",
         pincode:"684044",
         password:"$2y$10$p0N2aqF6HRlRqrbf6hADT.pPs6Wtmi/OkVpndqAVDU60uVtnmIp9e",//john@123
         user_type:"65e9927f96df220728517705"

      }
    ])
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return models.Test.bulkWrite([
        {
          insertOne: {
            document: {
              name: 'first test'
            }
          }
        }
      ]).then(res => {
      // Prints "1"
      console.log(res.insertedCount);
    });
    */
  },

  down: (models, mongoose) => {


    return models.users
    .deleteMany({
      _id:{
        $in:[
         "65d9c2889f9dfda2f46d8b7d",
          "65d9c2929f9dfda2f46d8b7e"
        ],
      },
    })
    .then((res)=>{
      console.log(res.deletedCount);
    });
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return models.Test.bulkWrite([
        {
          deleteOne: {
            filter: {
              name: 'first test'
            }
          }
        }
      ]).then(res => {
      // Prints "1"
      console.log(res.deletedCount);
      });
    */
  }
};

'use strict';

const { model } = require("mongoose");

module.exports = {
  up: (model, mongoose) => {
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





    return model.user_types
    .insertMany([
      {
        _id:"65e9927f96df220728517705",
        user_type:"admin"
      },
      {
        _id:"65e9929396df220728517706",
        user_type:"employee"

      }
    ])
  },

  down: (model, mongoose) => {
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


      return model.user_types
      .deleteMany({
        _id:{
          $in:[
            "65e9927f96df220728517705",
            "65e9929396df220728517706"
          ],
        },
      })
     
  }
};

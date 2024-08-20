// require("dotenv").config({ path: "./env" });
import dotenv from "dotenv";
// import mongoose from "mongoose";
// import { DB_NAME } from "./constants";
import db_connection from "./db/approch_2.js";
import { app } from "./app.js";

dotenv.config({ path: "./env" }); // this is recently come , to use  import  dotenv so we need to chang ein pckg.json

// when asyn functioon will complete then it will return a promise
db_connection()
  /// if db connect successfuly then we connect our express app
  .then(() => {
    app.listen(process.env.PORT || 3000, () => {
      console.log(
        `🖥 Server is Running  at http://localhost:${process.env.PORT} `
      );
    });
  })
  .catch((err) => {
    console.log("MONGODB Connection Fail ", err);
  });

/*    

! First approch 

 

import express from "express";
const app = express();

// IIFE
(async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`); // this is way to connect db url + db nmae

        // this is listener of express which listen diff event here we use this : db is connted but our express app is not working
        app.on("Error", (error) => {
            console.log("error", error);
            throw error;
        });

        app.listen(process.env.PORT, () => {
            console.log(`app is listing on port${process.env.PORT}`);
        });
    } catch (error) {
        console.log("Error", error);
        throw error;
    }
})();

*/

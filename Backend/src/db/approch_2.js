import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
import express from "express";
const app = express();

const db_connection = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URL}/${DB_NAME}`
    );
    console.log(
      `Mongo DB Connect !! DB Host: ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.log("Error", error);
    process.exit(1); // exit the process
  }
};

export default db_connection;

// assgiemnt
// process.exit(1); // exit the process
// ${connectionInstance}`);

import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const user_schema = new Schema(
  {
    user_name: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true, // Removes any leading or trailing whitespace from the user_name value before saving it. This ensures data cleanliness and consistency.

      index: true, // feild is searchable  and for searching
    },

    Full_name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    Email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    avatar: {
      type: String, // we use 3rd party application for url
      required: true,
    },
    cover_img: {
      type: String, // we use 3rd party application for url
    },

    // watch_history feild make our project next level
    watch_history: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video",
      },
    ],

    password: {
      type: String,
      required: [true, "Password is required"],
    },

    refresh_token: {
      type: String,
    },
  },
  { timestamps: true }
);

//* Mongoose has 4 types of middleware: document middleware, model middleware, aggregate middleware, and query middleware.
// todo-> https://mongoosejs.com/docs/middleware.html#pre
// where we are using pre-hook (middleware ) for encrption

// Middleware methods in Mongoose allow you to define functions that execute before or after specific operations on your models or queries.
user_schema.pre("save", async function (next) {
  // if pass will modifi then we encrypt
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next(); //middware to next
});

//.methods: Indicates that you are defining an instance method.
//Instance methods in Mongoose are custom functions that you define within your schema. These functions are then available on every instance (or document) of your Mongoose model.

user_schema.methods.is_password_currect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

user_schema.methods.Genrate_ACCESS_TOKEN = function () {
  // jwt.sign use to create new jwt
  return jwt.sign(
    {
      // /The payload (data to be encoded in the token)
      _id: this._id,
      Email: this.Email,
      user_name: this.user_name,
      Full_name: this.Full_name,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );
};

// limited payload
user_schema.methods.Genrate_REFRESH_TOKEN = function () {
  return jwt.sign(
    {
      // /The payload (data to be encoded in the token)
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
  );
};

export const User = mongoose.model("User", user_schema);

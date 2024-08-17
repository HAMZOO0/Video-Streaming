import express from "express";
import cookieparser from "cookie-parser";
import cors from "cors";

const app = express();

//This is the cors middleware which stands for Cross-Origin Resource Sharing. It allows your server to accept requests from different origins.

// { origin: process.env.CORS_ORIGIN }: This is a configuration object for the cors middleware. Here, the origin is set to the value of the environment variable CORS_ORIGIN. This means only requests from this origin will be allowed.
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
  })
);

app.use(express.json({ limit: "16 kb" }));

// Express.urlencoded: This is a built-in middleware function in Express. It parses incoming requests with URL-encoded payloads, like data submitted from an HTML form.{ extended: true }: This option allows for more complex data structures (like nested objects) to be encoded into the URL-encoded format.
app.use(express.urlencoded({ extended: true, limit: "16 kb" }));

app.use(express.static("public")); // 'Public' folder se files serve ko send krnaa

app.use(cookieparser()); // here we send and resive cookies from clien and save in server and perform other opration on cookies
// -----------------------------------------------------------------------------------------------
//! route import -  here in mid most of the case
import user_router from "./routes/user.routes.js";
import tweet_router from "./routes/tweet.routes.js";
import videoRouter from "./routes/video.routes.js";
import subscriptionRouter from "./routes/subscription.routes.js";
import healthcheckRouter from "./routes/healthcheck.routes.js";
import playlistRouter from "./routes/playlist.routes.js";
import likeRouter from "./routes/like.routes.js";
import commentRouter from "./routes/comment.routes.js";
import dashboardRouter from "./routes/dashboard.routes.js";

// routes decleration
// * http://localhost:8000/api/v1/users/register
app.use("/api/v1/users", user_router);
app.use("/api/v1/tweets", tweet_router);
app.use("/api/v1/videos", videoRouter);
app.use("/api/v1/subscriptions", subscriptionRouter);
app.use("/api/v1/healthcheck", healthcheckRouter);
app.use("/api/v1/playlist", playlistRouter);
app.use("/api/v1/like", likeRouter);
app.use("/api/v1/comment", commentRouter);
app.use("/api/v1/dashboard", dashboardRouter);

export { app };

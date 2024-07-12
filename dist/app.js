import express from "express";
import { DBConnect } from "./utils/features.js";
const app = express();
const port = 3000;
import userRoute from "./routes/user.js";
import ErrorMiddleware from "./middlewares/error.js";
DBConnect();
app.use(express.json());
app.use("/api/v1/user", userRoute);
app.use(ErrorMiddleware);
app.listen(port, () => {
    console.log("App is Listening at Port ", port);
});

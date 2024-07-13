import express from "express";
import { DBConnect } from "./utils/features.js";
import ErrorMiddleware from "./middlewares/error.js";
import NodeCache from "node-cache";
//ImportingRoutes
import userRoute from "./routes/user.js";
import productRoute from "./routes/products.js";
const port = 3000;
DBConnect();
const app = express();
export const myCache = new NodeCache();
app.use(express.json());
app.use("/uploads", express.static("uploads"));
app.use("/api/v1/user", userRoute);
app.use("/api/v1/product", productRoute);
app.use(ErrorMiddleware);
app.listen(port, () => {
    console.log("App is Listening at Port ", port);
});

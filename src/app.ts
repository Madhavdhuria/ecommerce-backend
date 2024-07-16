import express from "express";
import { DBConnect } from "./utils/features.js";
import NodeCache from "node-cache";
//ImportingRoutes
import userRoute from "./routes/user.js";
import productRoute from "./routes/products.js";
import OrderRoute from "./routes/order.js";
import paymentRoute from "./routes/coupon.js";
import DashboardRoute from "./routes/stats.js";
import { config } from "dotenv";
import morgan from "morgan";
import { ErrorMiddleware } from "./middlewares/error.js";

config({
  path: "./.env",
});

const port = process.env.PORT;
const MongoDbUri=process.env.MONGO_URI || "";

DBConnect(MongoDbUri || "");

const app = express();
export const myCache = new NodeCache();
app.use(express.json());
app.use(morgan("dev"));


app.use("/uploads", express.static("uploads"));
app.use("/api/v1/user", userRoute);
app.use("/api/v1/product", productRoute);
app.use("/api/v1/order", OrderRoute);
app.use("/api/v1/payment", paymentRoute);
app.use("/api/v1/dashboard", DashboardRoute);
app.use(ErrorMiddleware);
app.listen(port, () => {
  console.log("App is Listening at Port ", port);
});

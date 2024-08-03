import express from "express";
import { DBConnect } from "./utils/features.js";
import NodeCache from "node-cache";
//ImportingRoutes
import userRoute from "./routes/user.js";
import productRoute from "./routes/products.js";
import OrderRoute from "./routes/order.js";
import paymentRoute from "./routes/payment.js";
import DashboardRoute from "./routes/stats.js";
import { config } from "dotenv";
import morgan from "morgan";
import { ErrorMiddleware } from "./middlewares/error.js";
import Stripe from "stripe";
import cors from "cors"

config({
  path: "./.env",
});

const port = process.env.PORT;
const MongoDbUri=process.env.MONGO_URI || "";
const StripeKey=process.env.STRIPE_KEY || "";

DBConnect(MongoDbUri || "");

const app = express();
export const myCache = new NodeCache();
export const stripe = new Stripe(StripeKey);
app.use(express.json());
app.use(morgan("dev"));
app.use(cors());


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

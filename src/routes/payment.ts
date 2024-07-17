import express from "express";
import {
  newCoupon,
  applyDiscount,
  allCoupon,
  deleteCoupon,
  createPaymentIntent
} from "../controllers/payment.js";
import { adminOnly } from "../middlewares/auth.js";

const app = express.Router();

app.post("/create", createPaymentIntent);
app.post("/coupon/new", adminOnly, newCoupon);
app.get("/discount", applyDiscount);
app.get("/coupon/all", adminOnly, allCoupon);
app.delete("/coupon/:id", adminOnly, deleteCoupon);

export default app;
 
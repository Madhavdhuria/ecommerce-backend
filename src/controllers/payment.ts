import { TryCatch } from "../middlewares/error.js";
import { Coupon } from "../models/coupon.js";
import Errorhandler from "../utils/utility-class.js";

export const newCoupon = TryCatch(async (req, res, next) => {
  const { code, amount } = req.body;

  if (!code || !amount) {
    return next(new Errorhandler("Please enter both Coupon and Amount", 400));
  }

  await Coupon.create({
    code,
    amount,
  });

  return res.json({
    success: true,
    message: `Coupon ${code} Created Successfully`,
  });
});

export const applyDiscount = TryCatch(async (req, res, next) => {
  const { coupon } = req.query;

  if (!coupon) {
    return next(new Errorhandler("Please enter Coupon", 400));
  }

  const discount = await Coupon.findOne({
    code: coupon,
  });

  if (!discount) {
    return next(new Errorhandler("Invalid Coupon Code", 400));
  }

  return res.status(200).json({
    success: true,
    discount: discount?.amount,
  });
});

export const allCoupon = TryCatch(async (req, res, next) => {
  const coupons = await Coupon.find({});
  return res.json({
    success: true,
    coupons,
  });
});

export const deleteCoupon = TryCatch(async (req, res, next) => {
  const { id } = req.params;

  const deletedCoupon = await Coupon.findByIdAndDelete(id);

  if (!deletedCoupon) {
    return next(new Errorhandler("Invalid Coupon Code", 400));
  }

  return res.status(200).json({
    success: true,
    message: `Coupon ${deletedCoupon.code} Deleted Successfully`,
  });
});
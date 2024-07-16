import mongoose from "mongoose";
const schema = new mongoose.Schema({
    code: {
        type: String,
        required: [true, "Please enter coupon"],
        unique: true,
    },
    amount: {
        type: Number,
        required: [true, "Please enter amount"],
    },
});
export const Coupon = mongoose.model("Coupon", schema);

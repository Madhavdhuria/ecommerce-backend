import mongoose from "mongoose";
const schema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please enter name"],
    },
    photo: {
        type: String,
        required: [true, "Please enter photo"],
    },
    price: {
        type: String,
        required: [true, "Please enter Price"],
    },
    stock: {
        type: String,
        required: [true, "Please enter stock"],
    },
    category: {
        type: String,
        required: [true, "Please enter category"],
        trim: true,
    },
}, {
    timestamps: true,
});
export const Product = mongoose.model("Product", schema);
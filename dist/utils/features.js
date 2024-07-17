import mongoose from "mongoose";
import { Product } from "../models/product.js";
import { myCache } from "../app.js";
export const DBConnect = (uri) => {
    mongoose
        .connect(uri, {
        dbName: "Ecommerce_24",
    })
        .then((c) => {
        console.log("Db Connected to ", c.connection.host);
    })
        .catch((e) => {
        console.log(e);
    });
};
export const invalideCache = ({ product, order, admin, userId, orderId, productId, }) => {
    if (product) {
        const productKeys = [
            "latest-products",
            "categories",
            "all-products",
        ];
        if (typeof productId === "string") {
            productKeys.push(`product-${productId}`);
        }
        if (typeof productId === "object") {
            productId.forEach((i) => {
                productKeys.push(`product-${i}`);
            });
        }
        myCache.del(productKeys);
    }
    if (order) {
        const orderkeys = [
            "all-orders",
            `my-orders-${userId}`,
            `order-${orderId}`,
        ];
        myCache.del(orderkeys);
    }
    if (admin) {
        myCache.del([
            "admin-stats",
            "admin-pie-charts",
            "admin-bar-charts",
            "admin-line-charts",
        ]);
    }
};
export const reduceStock = async (orderItems) => {
    for (let i = 0; i < orderItems.length; i++) {
        const order = orderItems[i];
        const product = await Product.findById(order.productId);
        if (!product)
            throw new Error("Product Not Found");
        product.stock -= order.quantity;
        await product.save();
    }
};
export const CalculatePercentage = (thisMonth, lastMonth) => {
    let percent;
    if (lastMonth === 0)
        percent = thisMonth * 100;
    else
        percent = (thisMonth / lastMonth) * 100;
    return Number(percent.toFixed(0));
};
export const getInventories = async ({ categories, ProductCount, }) => {
    const CategoryCountPromise = categories.map((category) => Product.countDocuments({ category }));
    const CategoriesCount = await Promise.all(CategoryCountPromise);
    const categoryCount = [];
    categories.forEach((category, i) => {
        categoryCount.push({
            [category]: Math.round((CategoriesCount[i] / ProductCount) * 100),
        });
    });
    return categoryCount;
};
export const getChartData = ({ length, docArr, today, property, }) => {
    const data = new Array(length).fill(0);
    docArr.forEach((i) => {
        const creationDate = i.createdAt;
        const monthDiff = (today.getMonth() - creationDate.getMonth() + 12) % 12;
        if (monthDiff < length) {
            data[length - monthDiff - 1] += property ? i[property] : 1;
        }
    });
    return data;
};

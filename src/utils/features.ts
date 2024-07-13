import mongoose from "mongoose";
import { Product } from "../models/product.js";
import { myCache } from "../app.js";
import { InvaidatecacheProps } from "../types/types.js";
export const DBConnect = () => {
  mongoose
    .connect(
      "mongodb+srv://madhav:2003%40Mongo2024@cluster0.xaijqpg.mongodb.net/mystrymsg",
      {
        dbName: "Ecommerce_24",
      }
    )
    .then((c) => {
      console.log("Db Connected to ", c.connection.host);
    })
    .catch((e) => {
      console.log(e);
    });
};

export const invalideCache = async ({
  product,
  order,
  admin,
}: InvaidatecacheProps) => {
  if (product) {
    const productKeys: string[] = [
      "latest-products",
      "categories",
      "all-products",
    ];

    const products = await Product.find({}).select("_id");

    products.forEach((p) => {
      productKeys.push(`product-${p._id}`);
    });

    myCache.del(productKeys);
  }
};

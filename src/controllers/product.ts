import { NextFunction, Request, Response } from "express";
import { TryCatch } from "../middlewares/error.js";
import {
  baseQuery,
  NewProductRequestBody,
  SearchRequestQuery,
} from "../types/types.js";
import { Product } from "../models/product.js";
import ErrorHandler from "../utils/utility-class.js";
import { rm } from "fs";
import { faker } from "@faker-js/faker";
import { myCache } from "../app.js";
import { invalideCache } from "../utils/features.js";

export const createProduct = TryCatch(
  async (
    req: Request<{}, {}, NewProductRequestBody>,
    res: Response,
    next: NextFunction
  ) => {
    const { category, name, price, stock } = req.body;
    const photo = req.file;

    if (!photo) return next(new ErrorHandler("Please upload a photo", 400));
    if (!category || !name || !price || !stock) {
      rm(photo.path, () => {
        console.log("Photo deleted");
      });
      return next(new ErrorHandler("Please fill all fields", 400));
    }

    await Product.create({
      category: category.toLowerCase(),
      name,
      price,
      stock,
      photo: photo.path,
    });

    invalideCache({ product: true });

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
    });
  }
);

export const getLatestProducts = TryCatch(async (req, res, next) => {
  let products;

  if (myCache.has("latest-products")) {
    products = JSON.parse(myCache.get("latest-products") as string);
  } else {
    products = await Product.find({}).sort({ createdAt: -1 }).limit(5);
    myCache.set("latest-products", JSON.stringify(products));
  }

  return res.json({
    success: true,
    products,
  });
});

export const getSingleProduct = TryCatch(async (req, res, next) => {
  let product;
  const { id } = req.params;

  if (myCache.has(`product-${id}`)) {
    product = JSON.parse(myCache.get(`product-${id}`) as string);
  } else {
    product = await Product.findById(req.params.id);
    if (!product) {
      return next(new ErrorHandler("Invalid product ID", 401));
    }
    myCache.set(`product-${id}`, JSON.stringify(product));
  }

  return res.status(200).json({
    success: true,
    product,
  });
});

export const updateProduct = TryCatch(async (req, res, next) => {
  const { id } = req.params;
  const { category, name, price, stock } = req.body;
  const photo = req.file;
  const product = await Product.findById(id);

  if (!product) {
    return next(new ErrorHandler("Invalid product ID", 401));
  }

  if (photo) {
    rm(product.photo, () => {
      console.log("Old photo deleted");
    });
    product.photo = photo.path;
  }

  if (name) product.name = name;
  if (stock) product.stock = stock;
  if (price) product.price = price;
  if (category) product.category = category;

  await product.save();

  invalideCache({ product: true });

  return res.json({
    success: true,
    product,
  });
});

export const deleteProduct = TryCatch(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return next(new ErrorHandler("Invalid product ID", 401));
  }
  rm(product.photo, () => {
    console.log("Product photo deleted");
  });
  await product.deleteOne();

  invalideCache({ product: true });

  return res.json({
    success: true,
    message: "Product deleted successfully",
  });
});

export const getAdminProducts = TryCatch(async (req, res, next) => {
  let products;

  if (myCache.has("all-products")) {
    products = JSON.parse(myCache.get("all-products") as string);
  } else {
    products = await Product.find({});
    myCache.set("all-products", JSON.stringify(products));
  }

  return res.json({
    success: true,
    products,
  });
});

export const getAllCategories = TryCatch(async (req, res, next) => {
  let categories;

  if (myCache.has("categories")) {
    categories = JSON.parse(myCache.get("categories") as string);
  } else {
    categories = await Product.distinct("category");
    myCache.set("categories", JSON.stringify(categories));
  }

  return res.json({
    success: true,
    categories,
  });
});

export const getAllProducts = TryCatch(
  async (req: Request<{}, {}, {}, SearchRequestQuery>, res, next) => {
    const { search, price, category, sort } = req.query;
    const page = Number(req.query.page) || 1;

    const limit = Number(process.env.PRODUCT_PER_PAGE) || 8;
    const skip = (page - 1) * limit;

    const baseQuery: baseQuery = {};

    if (search)
      baseQuery.name = {
        $regex: search,
        $options: "i",
      };
    if (price)
      baseQuery.price = {
        $lte: Number(price),
      };
    if (category) baseQuery.category = category;

    const productsPromise = Product.find(baseQuery)
      .sort(sort && { price: sort === "asc" ? 1 : -1 })
      .limit(limit)
      .skip(skip);

    const [productsFetched, filteredProducts] = await Promise.all([
      productsPromise,
      Product.find(baseQuery),
    ]);

    const products = productsFetched;
    const totalPages = Math.ceil(filteredProducts.length / limit);

    return res.status(200).json({
      success: true,
      products,
      totalPages,
    });
  }
);

const generateRandomProducts = async (count: number = 10) => {
  const products = [];

  for (let i = 0; i < count; i++) {
    const product = {
      name: faker.commerce.productName(),
      photo: "uploads\\3cf856fb-d78e-4435-8a94-af25030d4aff.png",
      price: faker.commerce.price({ min: 1500, max: 80000, dec: 0 }),
      stock: faker.commerce.price({ min: 0, max: 100, dec: 0 }),
      category: faker.commerce.department(),
      createdAt: new Date(faker.date.past()),
      updatedAt: new Date(faker.date.recent()),
      __v: 0,
    };

    products.push(product);
  }

  await Product.create(products);

  console.log({ success: true });
};

// generateRandomProducts();

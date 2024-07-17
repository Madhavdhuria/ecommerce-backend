import { myCache } from "../app.js";
import { TryCatch } from "../middlewares/error.js";
import { Order } from "../models/order.js";
import { Product } from "../models/product.js";
import { User } from "../models/user.js";
import {
  CalculatePercentage,
  getChartData,
  getInventories,
} from "../utils/features.js";

export const getDashboardStats = TryCatch(async (req, res, next) => {
  let stats;
  const key = "admin-stats";
  if (myCache.has(key)) {
    stats = JSON.parse(myCache.get(key) as string);
  } else {
    const today = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const thisMonth = {
      Start: new Date(today.getFullYear(), today.getMonth(), 1),
      end: today,
    };

    const lastMonth = {
      Start: new Date(today.getFullYear(), today.getMonth() - 1, 1),
      end: new Date(today.getFullYear(), today.getMonth(), 0),
    };

    const thisMonthProductsPromise = Product.find({
      createdAt: {
        $gte: thisMonth.Start,
        $lte: thisMonth.end,
      },
    });

    const lastMonthProductsPromise = Product.find({
      createdAt: {
        $gte: lastMonth.Start,
        $lte: lastMonth.end,
      },
    });

    const thisMonthUsersPromise = User.find({
      createdAt: {
        $gte: thisMonth.Start,
        $lte: thisMonth.end,
      },
    });

    const lastMonthUsersPromise = User.find({
      createdAt: {
        $gte: lastMonth.Start,
        $lte: lastMonth.end,
      },
    });

    const thisMonthOrdersPromise = Order.find({
      createdAt: {
        $gte: thisMonth.Start,
        $lte: thisMonth.end,
      },
    });

    const lastMonthOrdersPromise = Order.find({
      createdAt: {
        $gte: lastMonth.Start,
        $lte: lastMonth.end,
      },
    });

    const lastSixMonthOrdersPromise = Order.find({
      createdAt: {
        $gte: sixMonthsAgo,
        $lte: today,
      },
    });
    const latestTransactionsPromise = Order.find({})
      .select(["orderItems", "discount", "total", "status"])
      .limit(4);

    const [
      thisMonthProducts,
      thisMonthUsers,
      thisMonthOrders,
      lastMonthProducts,
      lastMonthUsers,
      lastMonthOrders,
      ProductCount,
      UserCount,
      allOrder,
      lastSixMonthOrders,
      categories,
      femaleUsersCount,
      latestTransaction,
    ] = await Promise.all([
      thisMonthProductsPromise,
      thisMonthUsersPromise,
      thisMonthOrdersPromise,
      lastMonthProductsPromise,
      lastMonthUsersPromise,
      lastMonthOrdersPromise,
      Product.countDocuments(),
      User.countDocuments(),
      Order.find({}).select("total"),
      lastSixMonthOrdersPromise,
      Product.distinct("category"),
      User.countDocuments({ gender: "female" }),
      latestTransactionsPromise,
    ]);

    const thisMonthRevenue = thisMonthOrders.reduce(
      (total, order) => total + (order.total || 0),
      0
    );

    const lastMonthRevenue = lastMonthOrders.reduce(
      (total, order) => total + (order.total || 0),
      0
    );

    const ChangePercent = {
      revenue: CalculatePercentage(thisMonthRevenue, lastMonthRevenue),
      product: CalculatePercentage(
        thisMonthProducts.length,
        lastMonthProducts.length
      ),
      order: CalculatePercentage(
        thisMonthOrders.length,
        lastMonthOrders.length
      ),
      user: CalculatePercentage(thisMonthUsers.length, lastMonthUsers.length),
    };

    const revenue = allOrder.reduce(
      (total, order) => total + (order.total || 0),
      0
    );

    const count = {
      revenue,
      user: UserCount,
      product: ProductCount,
      order: allOrder.length,
    };

    const orderMonthCounts = getChartData({
      length: 6,
      docArr: lastSixMonthOrders,
      today,
    });
    const orderMonthyRevenue = getChartData({
      length: 6,
      docArr: lastSixMonthOrders,
      today,
      property: "total",
    });

    const categoryCount: Record<string, number>[] = await getInventories({
      categories,
      ProductCount,
    });
    const userRatio = {
      male: UserCount - femaleUsersCount,
      female: femaleUsersCount,
    };

    const modifiedLatestTransaction = latestTransaction.map((i) => ({
      _id: i._id,
      discount: i.discount,
      amount: i.total,
      quantity: i.orderItems.length,
      status: i.status,
    }));

    stats = {
      categoryCount,
      ChangePercent,
      count,
      userRatio,
      chart: {
        order: orderMonthCounts,
        revenue: orderMonthyRevenue,
      },
      latestTransaction: modifiedLatestTransaction,
    };

    myCache.set(key, JSON.stringify(stats));
  }
  return res.json({
    success: true,
    stats,
  });
});
export const getPieCharts = TryCatch(async (req, res, next) => {
  let charts;
  const key = "admin-pie-charts";
  if (myCache.has(key)) {
    charts = JSON.parse(myCache.get(key) as string);
  } else {
    const AllOrderPromise = Order.find({}).select([
      "total",
      "subtotal",
      "tax",
      "shippingCharges",
      "discount",
    ]);

    const [
      ProcessingOrder,
      Shippedorder,
      deliveredOrder,
      categories,
      ProductCount,
      OutOfStack,
      allOrders,
      allUsers,
      adminUsers,
      customerUsers,
    ] = await Promise.all([
      Order.countDocuments({ status: "Processing" }),
      Order.countDocuments({ status: "Shipped" }),
      Order.countDocuments({ status: "Delivered" }),
      Product.distinct("category"),
      Product.countDocuments(),
      Product.countDocuments({ stock: 0 }),
      AllOrderPromise,
      User.find({}).select(["dob"]),
      User.countDocuments({ role: "admin" }),
      User.countDocuments({ role: "user" }),
    ]);

    const orderFullfillment = {
      Processing: ProcessingOrder,
      Shipped: Shippedorder,
      Delivered: deliveredOrder,
    };
    const productCategories: Record<string, number>[] = await getInventories({
      categories,
      ProductCount,
    });

    const stockAvailablity = {
      InStock: ProductCount - OutOfStack,
      OutOfStack,
    };

    const grossIncome = allOrders.reduce(
      (prev, order) => prev + (order.total || 0),
      0
    );

    const discount = allOrders.reduce(
      (prev, order) => prev + (order.discount || 0),
      0
    );

    const productionCost = allOrders.reduce(
      (prev, order) => prev + (order.shippingCharges || 0),
      0
    );

    const burnt = allOrders.reduce((prev, order) => prev + (order.tax || 0), 0);

    const marketingCost = Math.round(grossIncome * (30 / 100));

    const netMargin =
      grossIncome - discount - productionCost - burnt - marketingCost;

    const usersAgeGroup = {
      teen: allUsers.filter((i) => i.age < 20).length,
      adult: allUsers.filter((i) => i.age >= 20 && i.age < 40).length,
      old: allUsers.filter((i) => i.age >= 40).length,
    };

    const revenueDistribution = {
      netMargin,
      discount,
      productionCost,
      burnt,
      marketingCost,
    };

    const adminCustomer = {
      admin: adminUsers,
      customer: customerUsers,
    };

    charts = {
      orderFullfillment,
      productCategories,
      stockAvailablity,
      revenueDistribution,
      usersAgeGroup,
      adminCustomer,
    };
    myCache.set(key, JSON.stringify(charts));
  }
  res.status(200).json({
    success: true,
    charts,
  });
});

export const getbarCharts = TryCatch(async (req, res, next) => {
  let charts;
  const key = "admin-bar-charts";

  // Simulated cache retrieval for illustration
  charts = myCache.get(key);
  if (charts) {
    charts = JSON.parse(myCache.get(key) as string);
  } else {
    const today = new Date();

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const sixMonthProductPromise = Product.find({
      createdAt: {
        $gte: sixMonthsAgo,
        $lte: today,
      },
    }).select("createdAt");

    const sixMonthUsersPromise = User.find({
      createdAt: {
        $gte: sixMonthsAgo,
        $lte: today,
      },
    }).select("createdAt");

    const twelveMonthOrdersPromise = Order.find({
      createdAt: {
        $gte: twelveMonthsAgo,
        $lte: today,
      },
    }).select("createdAt");

    const [products, users, orders] = await Promise.all([
      sixMonthProductPromise,
      sixMonthUsersPromise,
      twelveMonthOrdersPromise,
    ]);

    const productCounts = getChartData({
      length: 6,
      today,
      docArr: products,
    });
    const usersCounts = getChartData({
      length: 6,
      today,
      docArr: users,
    });
    const ordersCounts = getChartData({
      length: 12,
      today,
      docArr: orders,
    });

    charts = {
      users: usersCounts,
      products: productCounts,
      orders: ordersCounts,
    };

    myCache.set(key, JSON.stringify(charts));
  }
});

export const getLineCharts = TryCatch(async (req, res, next) => {
  let charts;
  const key = "admin-line-charts";
  if (myCache.has(key)) {
    charts = JSON.parse(myCache.get(key) as string);
  } else {
    const today = new Date();

    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const baseQuery = {
      createdAt: {
        $gte: twelveMonthsAgo,
        $lte: today,
      },
    };

    const [products, users, orders] = await Promise.all([
      Product.find(baseQuery).select("createdAt"),
      User.find(baseQuery).select("createdAt"),
      Order.find(baseQuery).select(["createdAt", "discount", "total"]),
    ]);

    const productCounts = getChartData({
      length: 12,
      today,
      docArr: products,
    });

    const usersCounts = getChartData({
      length: 12,
      today,
      docArr: users,
    });

    const discount = getChartData({
      length: 12,
      today,
      docArr: orders,
      property: "discount",
    });
    const revenue = getChartData({
      length: 12,
      today,
      docArr: orders,
      property: "total",
    });

    charts = {
      productCounts,
      usersCounts,
      discount,
      revenue,
    };

    myCache.set(key, JSON.stringify(charts));
  }
  return res.status(200).json({
    success: true,
    charts,
  });
});

const User = require("../model/userModel"); 

const Order = require("../model/orderModel");
const moment = require("moment");
const hbs = require("hbs");
const ExcelJS = require('exceljs');
const Product = require('../model/productModel')
hbs.registerHelper("json", function (context) {
  return JSON.stringify(context);
});


const homeload = async (req, res) => {
  try {
    const users = await User.countDocuments({});
    const products = await Product.countDocuments({});
    const orders = await Order.countDocuments({});
    const allOrders = await Order.find({ status: "delivered" });
    console.log("orders delivered: " + allOrders.length);

    const totalRevenue = allOrders.reduce((total, order) => total + (order.totalBill || 0), 0);
    console.log("the total revenue is " + totalRevenue);

    

    const categorysale = await Order.aggregate([
      {
        $lookup: {
          from: "addresses",
          localField: "shippingAddress",
          foreignField: "_id",
          as: "address",
        },
      },
      {
        $unwind: "$items",
      },
      {
        $lookup: {
          from: "products",
          localField: "items.product_id",
          foreignField: "_id",
          as: "product",
        },
      },
      {
        $unwind: "$product",
      },
      {
        $group: {
          _id: "$product.category",
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "_id",
          foreignField: "name",
          as: "category",
        },
      },
      {
        $unwind: "$category",
      },
      {
        $project: {
          category: "$category.name",
          count: "$count",
          price:"$category.price",
        },
      },
    ]);

    // The resulting categorysale data can be used in your frontend chart code

    let obj = Object.assign({}, categorysale);
    

   

    const cashOnDeliveryCount = await Order.countDocuments({
      paymentMode: "cashondelivery",
    });

    console.log(cashOnDeliveryCount, "cashOnDeliveryCount");

    const razorPayCount = await Order.countDocuments({
      paymentMode: "razorpay",
    });

    console.log(razorPayCount, "razorPayCount");

    const pipeline = [
      {
        $group: {
          _id: {
            year: { $year: "$dateOrdered" },
            month: { $month: "$dateOrdered" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          date: {
            $dateFromParts: {
              year: "$_id.year",
              month: "$_id.month",
              day: 1,
            },
          },
          count: 1,
        },
      },
      {
        $sort: {
          date: 1,
        },
      },
    ];



    const ordersByMonth = await Order.aggregate(pipeline);
    const orderCounts = ordersByMonth.map(({ date, count }) => ({
      month: date.toLocaleString("default", { month: "long" }),
      count,
    }));
   

    res.render("admin/dashboard", {
      cashOnDeliveryCount,
      razorPayCount,
      orderCounts,
      users,
      products,
      orders,
      totalRevenue,
      categorysale: JSON.stringify(categorysale),
      obj,  
    });
  } catch (error) {
    console.log(error.message);
  }
};
  
  //     res.render("admin/dashboard", {
        
  //       users,
  //       products,
  //       orders,
  //       totalRevenue,
       
  //     });
  //   } catch (error) {
  //     console.log(error.message);
  //   }
  // };

  const reports = async (req, res) => {
    try {
      const ordersData = await Order.find()
        .populate('items.product_id')
        .sort({ dateOrdered: -1 });
  
      res.render('admin/salesreport', { orders: ordersData });
    } catch (error) {
      console.error(error);
      res.status(500).send('An error occurred while fetching sales reports.');
    }
  };
  let monthlyorderdata=[];
const getOrders = async (req, res) => {
  try {
    const fromDate = req.body.fromDate;
    const toDate = req.body.toDate;

    const monthlyorderdata = await Order.find({ dateOrdered: { $gte: fromDate, $lte: toDate } })
      .populate('items.product_id')
      .sort({ dateOrdered: -1 });

    console.log('Monthly Order Data:', 174, monthlyorderdata);

    res.json({ orders: monthlyorderdata });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};



const dailySales = async (req, res) => {
  try {
   
    const orderDate = req.body.daily;
    console.log(orderDate," o date")
    const startDate = moment(orderDate, 'YYYY-MM-DD').startOf('day').toDate();
    const endDate = moment(orderDate, 'YYYY-MM-DD').endOf('day').toDate();
    console.log(orderDate, "orderDate");
    console.log(startDate, "startDate");
    console.log(endDate, "endDate");

    dailyorders = await Order.find({
      dateOrdered: {
        $gte: startDate,
        $lte: endDate
      }
    }).populate("shippingAddress");
    console.log(dailyorders, "DailyOrdersssss");
    totalOrderBill = dailyorders.reduce(
      (total, totalBill) => total + Number(totalBill.totalBill),
      0
    );
    console.log(totalOrderBill, "totalOrderBill");
    res.render('admin/dailysales', { dailyorders, totalOrderBill });
  } catch (error) {
    console.log(error.message);
  }
};

const monthlysales = async (req, res) => {
  try {
    const monthinput = req.body.month;
    console.log(monthinput,"Monthhhhh")
    const year = parseInt(monthinput.substring(0, 4));
    const month = parseInt(monthinput.substring(5));

    console.log(year,"year123",)
    console.log(month,"month123")

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    console.log(startDate,"startDate")
    console.log(endDate,"endDate")

   const monthlyOrders = await Order.find({
    dateOrdered: {
        $gte: startDate,
        $lte: endDate,
      }
      
    }).populate("shippingAddress")
      .sort({ date: 'desc' });
      console.log(monthlyOrders,"month")
    totalMonthlyBill = monthlyOrders.reduce(
      (totall, order) => totall + Number(order.totalBill),
      0
    );
      console.log(totalMonthlyBill,"tot month")

    res.render("admin/monthlyOrders", { monthlyOrders, totalMonthlyBill });
  } catch (error) {
    console.log(error.message);
  }
};

const yearlysales = async (req, res) => {
  try {
    const orders = await Order.find();
    const year = req.body.yearly;

    yearlyorders = orders.filter((order) => {
      const orderYear = new Date(order.dateOrdered).getFullYear();
      return orderYear === parseInt(year);
    });
    console.log(yearlyorders,"y")
    totalYearlyBill = yearlyorders.reduce(
      (total, order) => total + Number(order.totalBill),
      0
    );
    res.render("admin/yearlyOrder", { yearlyorders, totalYearlyBill });
  } catch (error) {
    res.status(500).send({ message: `${error}` });
  }
};
  module.exports={
    yearlysales,
    monthlysales,
    dailySales,
    homeload,
    reports,
    getOrders,
    // excelDownload
  }
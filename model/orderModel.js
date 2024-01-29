const mongoose = require("mongoose");


const orderSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  items: [
    
    {
      product_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product", 
        
      },
      quantity: {
        type: Number,
      },
      price: {
        type: Number,
        require:false
      },
    },
  ],
  shippingAddress: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Address", 
  },

  totalBill: {
    type: Number,
  },
  status: {
    type: String,
    enum: ["ordered", "shipped", "delivered"],
    default: "ordered",
  },
  paymentMode: {
    type: String,
    enum: ["cashondelivery", "razorpay", "wallet","pending"],
    default: "pending",
  },
  dateOrdered: {
    type: Date,
    default: Date.now,
  },
  discountAmt: {
    type: Number,
  },
  coupon: {
    type: String,
  },
  wallet: {
    type: Number,
  },
  
});

module.exports = mongoose.model("order", orderSchema); 





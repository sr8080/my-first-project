const Category = require("../model/category");
const Product = require("../model/productModel"); 
const User = require("../model/userModel");
const Cart = require("../model/cartModel")
const Address = require("../model/addressModel");
const Order = require("../model/orderModel");
const Coupon = require("../model/couponModel");
require('dotenv').config()




//VIEW CART-------
const viewCart = async (req, res) => {
  console.log("viewCart", 16);
  try {
    const qty = req.body.qty
    console.log("cart count " + qty)
    const userData1 = req.session.user_id;

    console.log(userData1, 20);
    const user = await User.findById(userData1).populate("cart.product_id");

    console.log(user, 23);
    if (!user) {
      throw new Error("User not found");
    }

    const categories = await Category.find();
    const cartData = user.cart;
    console.log(categories, 30);

    console.log(cartData, 32);

    console.log(cartData.length, 34, "cartData");

    // Ensure that cartData is an array and not undefined
    if (!Array.isArray(cartData)) {
      cartData = [];
    }

    const cartItemCount = cartData.length;
    console.log('Cart Item Count:', cartItemCount);


    const subTotal = findSubTotal(cartData);


    res.render("users/cart", { userData1, categories, subTotal, cartData, cartItemCount });

    console.log(subTotal, 46);
    console.log("work aya");

  } catch (error) {
    console.log(error.message);
    res.status(500).send("An error occurred");
  }
};

//ADD TO CART----------


const addToCart = async (req, res) => {
  try {
    if (req.session.user_id) {
      const userData1 = req.session.user_id;
      const categories = await Category.find();
      const productIds = req.body.productId;

      const quantity = 1;
      const productData = await Product.findById(productIds);

      const user = await User.findById(userData1);

      const existingCartItem = user.cart.find((item) => item.product_id == productIds);

      if (existingCartItem) {
        
        existingCartItem.quantity += quantity;
      } else {
       
        user.cart.push({ product_id: productIds, quantity: quantity });
      }

      const updatedUser = await user.save();
      req.session.user = updatedUser;

      return res.json({
        result: "success"
      });
    } else {
      return res.redirect("/login");
    }
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      error: "An error occurred"
    });
  }
};





//FIND SUB TOTAL FUNCTION-----


function findSubTotal(cartData) {
  let subTotal = 0;

  for (let i = 0; i < cartData.length; i++) {
   
    if (cartData[i] && cartData[i].product_id && cartData[i].product_id.price) {
      subTotal += cartData[i].product_id.price * cartData[i].quantity;
    } else {
      console.log('Invalid product or price for item:', i);
     
    }
  }
  return subTotal;
}




//CART OPERATIONS-----------------



const cartOperation = async (req, res) => {
  try {
    const userData1 = req.session.user_id;
    const a = req.body;
    const data = await User.find(
      { _id: userData1 },
      { _id: 0, cart: 1 }
    ).lean();
    data[0].cart.forEach((val, i) => {
      val.quantity = req.body.datas[i].quantity;
    });
    console.log('count product', 132 + req.body.datas[i].quantity)

    await User.updateOne(
      { _id: userData1._id },
      { $set: { cart: data[0].cart } }
    );

    res.json("from backend ,cartUpdation json");
  } catch (error) {
    console.log(error.message);
  }
};


const cartUpdation = async (req, res) => {

  try {
    const userId = req.session.user_id;
    const productIndex = Number(req.query.index);
    const quantity = req.body.quantity;
    
    console.log("haaaaii",163);

    if (quantity === "plus") {
      await User.updateOne(
        { _id: userId },
        { $inc: { [`cart.${productIndex}.quantity`]: 1 } }
       
      );
    } else if (quantity === "minus") {
      await User.updateOne(
        { _id: userId },
        { $inc: { [`cart.${productIndex}.quantity`]: -1 } }
      );
    }
   
    res.status(200).json({ message: "Cart updated successfully." });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "An error occurred while updating the cart." });
  }
};




//REMOVE FROM CART------------------------
const deleteFromCart = async (req, res) => {
  try {
    const productId = req.query.id;

    const userData1 = req.session.user_id;

    const addressData = await User.findOneAndUpdate(
      { _id: userData1 },
      { $pull: { cart: { product_id: req.body.addressId } } },
      { new: true }
    );


    res.json({
      res: "success"

    });
  } catch (error) {
    console.log(error.message);
  }
};


const couponCheck = async (req, res) => {
  try {
    const userData1 = req.session.user_id;
    let coupon = req.query.couponval.trim();
    let total = req.query.total.trim(); 

    const couponData = await Coupon.findOne({ code: coupon });

    if (!couponData || couponData.length === 0) {
      res.json({ message: `Invalid coupon` });
    } else if (couponData.status === "inactive") {

      res.json({ message: `Inactive coupon` });
    } else if (parseFloat(total) < couponData.minBill) { 

      res.json({ message: `Minimum bill amount is Rs ${couponData.minBill}` });
    } else if (new Date(couponData.expiryDate) < new Date()) { // Check expiration date
      res.json({ message: `Coupon has expired` });
     } else {
      const discount = couponData.discount;
      const newTotal = parseFloat(total) - discount; 
      couponData.userid.push(userData1._id);
      await couponData.save();

      res.json({
        message: "Coupon applied successfully",
        discount,
        newTotal,
        success: true,
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};






//LOAD CHECKOUT
const loadCheckout = async (req, res) => {
  try {

    const userData1 = req.session.user_id;
    const user = await User.findOne({ _id: userData1 }).populate(
      "cart.product_id"
    );
    const cartData = user.cart;
    const categories = await Category.find();

    subTotal = findSubTotal(cartData);

    const address = await Address.find({ owner: userData1 });


    const addressData = address;

    res.render("users/checkout", {
      userData1,
      cartData: cartData,
      subTotal,
      addressData: addressData,
      categories,
    });
  } catch (error) {
    console.log(error.message);
  }
};






const placeOrder = async (req, res) => {
  try {
    const userData1 = req.session.user_id;
    const user = await User.findOne({ _id: userData1 }).populate(
      "cart.product_id"
    );
    const cartData = user.cart;
    const paymentMethod = req.body.payment;
    const qty = req.body.qty

      console.log(req.body.qty)
    await Address.findOne({ _id: userData1 });


    // const wallet = user.wallet;

    const cartItems = cartData.map((item) => ({
      product_id: item.product_id,
      quantity:req.body.qty
      
    }));


    let finalTotal;
    if (req.body.totalAfterDiscount) {
      finalTotal =  req.body.totalAfterDiscount;
     
    } else {
      finalTotal = subTotal;
    }



    for (const item of cartItems) {
      const product = await Product.findOne({ _id: item.product_id });

      // Check if enough quantity is available before reducing
      if (product.quantity >= item.quantity) {
        product.quantity -= item.quantity;
        await product.save();
      } 
    }



    if (paymentMethod === "cashondelivery") {
      if (cartData.length > 0) {
        const order = new Order({
          owner: userData1,
          items: cartItems,
          shippingAddress: req.body.address,
          totalBill: finalTotal,
          status: req.body.status,
          paymentMode: paymentMethod,
          dateOrdered: req.body.dateOrdered,
          discountAmt: req.body.totalAfterDiscount,
          coupon: req.body.search,
         
        });
        await order.save();
        user.cart = [];
        await user.save();
        res.json({ codSuccess: true })
      } else {
        res.redirect("/shop");
      }
    } else if (paymentMethod === "razorpay") {
      if (cartData.length > 0) {
        const order = new Order({
          owner: userData1,
          items: cartItems,
          shippingAddress: req.body.address,
          totalBill: finalTotal,
          status: req.body.status,
          paymentMode: paymentMethod,
          dateOrdered: req.body.dateOrdered,
          discountAmt: req.body.totalAfterDiscount,
          coupon: req.body.search,
        });
        await order.save();
        // user.cart = [];
        const orderid = order._id;
        await user.save();

        res.json({ razorpay: true, order: order, bill: finalTotal })
      } else {
        res.redirect("/shop");
      }
    } 

  } catch (error) {
    console.log(error.message);
  }
};



//PAYMENT

const orderPayment = async (req, res) => {
  try {
    const userData1 = req.session.user_id;
    const instance = new Razorpay({
      key_id: process.env.RazorpayId,
      key_secret:process.env.RazorpayKeySecret,
    });

    const { amount } = req.body; 
    let options = {
      amount: amount, 
      currency: "INR",
      receipt: "rcp1",
    };
    instance.orders.create(options, function (err, order) {
      if (err) {
        console.log(err.message);
        return res.status(500).json({ error: "Failed to create order" });
      }

      res.send({ orderId: order.id }); 
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};




//PAYMENT VERIFY

const paymentverify = async (req, res) => {
  let body =
    req.body.response.razorpay_order_id +
    "|" +
    req.body.response.razorpay_payment_id;

  let crypto = require("crypto");
  let expectedSignature = crypto
    .createHmac("sha256", "a1VkVxK7Mfz1rh3s3U13D2wt")
    .update(body.toString())
    .digest("hex");
  let response = { signatureIsValid: "false" };
  if (expectedSignature === req.body.response.razorpay_signature)
    response = { signatureIsValid: "true" };
  res.send(response);
};



//ORDER SUCCESS
const loadOrderSuccess = async (req, res) => {
  try {
    const shippingAddress = req.body.address1

    console.log(shippingAddress, 466, "shippingAddress");
    const userData1 = req.session.user_id;
    const user = await User.findOne({ _id: userData1 }).populate(
      "cart.product_id"
    );
    console.log(user,"car")
    user.cart=[]
    user.save()
    const refstatus= user.refcodestatus
    console.log(refstatus,"refcodeststus")
    if(refstatus==true){
      console.log("eeeeett")
      const updatedUser = await User.findByIdAndUpdate(
        {_id: userData1},
        {
          $inc: { wallet: 100 },
          $set: { refcodestatus: false }
        }
      );
      
    }
    res.render("users/ordersuccess", { userData1 });
  } catch (error) {
    console.log(error.message);
  }
};









const coupenshow = async(req,res)=>{
  try{
    const couponData = await Coupon.find();
    res.render('users/coupons',{couponData})
  } catch (error) {
    console.log(error.message);
  }
}







module.exports = {
  coupenshow,
  viewCart,
  addToCart,
  cartOperation,
  deleteFromCart,
  loadCheckout,
  placeOrder,
  couponCheck,
  orderPayment,
  paymentverify,
  loadOrderSuccess,


  cartUpdation


}
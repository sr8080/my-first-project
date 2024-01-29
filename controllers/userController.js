const User = require('../model/userModel')
const Category = require('../model/category')
const Product = require('../model/productModel')
const Address = require('../model/addressModel')
const Order = require('../model/orderModel')
const Offer = require('../model/offerModel')
const banner = require('../model/bannerModel')
const nodemailer = require('nodemailer')
const randomstring = require("randomstring")
const bcrypt = require('bcrypt')
const category = require('../model/category')
const PDFDocument = require("pdfkit");
const session = require('express-session')
const loadHome = async (req, res) => {
    
    try {
      console.log(req.session.user_id,"user idddddddddd")
      console.log(req.session.admin_id,"admin idddddddddd")
        const categoryData=await Category.find()
        const productData=await Product.find()
        const offerData = await Offer.find()
        const bannerData=await banner.find()
        
        res.render('users/home',{isLogged: req.session.userName,categoryData,productData,offerData,bannerData})

    } catch (error) {
        console.log(error.message);
    }
 }

 const loadShop = async (req, res) => {
    try {
      var cartItemCount
      const offer = await Offer.find()
      console.log(offer,"off")
      const categoryData = await Category.find();
      const productData = await Product.find();
      const offerData = await Offer.find()
      User.findById({_id: req.session.user_id})
    .then(user => {
      if (user) {
         cartItemCount = user.cart.length;
        console.log('Cart Item Count:', cartItemCount,categoryData);
      }})
      
  
      let search = '';
      if (req.query.search) {
        search = req.query.search;
  
        const shopData = await Product.find({
          is_blocked: false,
          name: { $regex: ".*" + search + ".*", $options: "i" }
        });
  
        if (shopData.length > 0) {
          res.render("users/shop", {
            isLogged: req.session.userName,
            productData: shopData,
            cartItemCount:cartItemCount,
            categoryData: categoryData,
            offer:offer
          });
          return; 
        }
      }
  
      let filter=' '
      if(req.query.filter){
        filter=req.query.filter
        const asc=await Product.find({}).sort({price:1})
        const dsc=await Product.find({}).sort({price:-1})
        console.log(asc,"ascend")
        console.log(dsc,"dsc")
        if(filter=="asc"){
          res.render("users/shop", {
            isLogged: req.session.userName,
            productData: asc,
            cartItemCount:cartItemCount,
            categoryData: categoryData,
            offer:offer
          });
          return;
        }else if(filter=="dse"){
          res.render("users/shop", {
            isLogged: req.session.userName,
            productData: dsc,
            cartItemCount:cartItemCount,
            categoryData: categoryData,
            offer:offer
          });
          return;
        }



      }
      if(req.query.id){
      const productId=req.query.id
      const productData=await Product.find({category:productId})
      const categoryData = await category.find()
      res.render('users/shop',{isLogged: req.session.userName,productData:productData,categoryData})
      return
      }


      let page = 1; 
      if (req.query.page) {
        page = parseInt(req.query.page); 
      }
      
      const limit = 9;
      const skip = (page - 1) * limit;
      
      const query = {
        is_blocked: false,
        name: { $regex: new RegExp(search, "i") } 
      };
      
      const [shopData, count] = await Promise.all([
        Product.find(query).limit(limit).skip(skip), 
        Product.countDocuments(query) 
      ]);
      
      const totalPages = Math.ceil(count / limit);
      const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
      res.render("users/shop", {
        isLogged: req.session.userName,
        productData: shopData,
        categoryData: categoryData,
        totalPages: totalPages,
        currentPage: page,
        previousPage: page > 1 ? page - 1 : null, 
        nextPage: page < totalPages ? page + 1 : null ,
        offer:offer,
        pages: pages
      });
      
      
  
      res.render("users/shop", {
        isLogged: req.session.userName,
        productData: productData,
        categoryData: categoryData,
        offer:offer
      });
    } catch (error) {
      console.log(error.message);
    }
  };
  

  const offershow = async(req,res)=>{
    try{
      const offerData = await Offer.find()
      res.render("users/offer",{offerData})
    }catch (error) {
        console.log(error.message);
    }
  }

 const loadDeatails=async(req,res)=>{
    try {
        const categories=await Category.find();
        const id=req.query.id
        console.log(id)
       
        const userData1=req.session.user_id;
    
        let productData=await Product.findById({_id:id});
       
        res.render("users/detail",{isLogged: req.session.userName,productData:productData,userData1,categories })
    } catch (error) {
        console.log(error.message);
    }
}

const loadCategoryProducts = async (req,res)=>{
    try{
        const productId=req.query.id
        const productData=await Product.find({category:productId})
        const categoryData = await category.find()
        res.render('users/shop',{isLogged: req.session.userName,productData:productData,categoryData})

    }catch(error){
        console.log(error.message);
    }
}

 const loadRegister = async (req, res) => {
    try {
        res.render('users/registration')
    } catch (error) {
        console.log(error.message);
    }

}


const insertUser = async (req, res) => {
    try {
      console.log(128);
        const name = req.body.name
        const email = req.body.email
        console.log('name is ',name, 'email is ', email)
        userRegData = req.body
        console.log(132, email);
        const existUser = await User.findOne({ email: email })

        if (existUser == null) {
         
            await sendVerifyMail(name, email)
            res.redirect('/otpverification')

        }
        else {
            if (existUser.email == email) {
                res.render('users/registration', { message1: 'email  Alredy Exist' })
            }
        }
    }
    catch (error) {
        console.log(error.message)
    }
}

const loadverifyotp = async (req, res) => {

    try {
     
        res.render('users/otpverification')
    } catch (error) {
        console.log(error.message);
    }
}


let userRegData;
function generateOTP(){
return otp = `${Math.floor(1000 + Math.random() * 90000)}`
}


const sendVerifyMail = async (name, email, res) => {

    try {
      console.log("transporter");
      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        requireTLS: true,
        service:'gmail',
        auth: {
          user: "sreeragsree198@gmail.com",
          pass: "ejdg ettl gtlv oknt"
        }
      });
      const otp = generateOTP(); 
  console.log(otp,"otp",45);
      
      const mailOptions = {
        from: "sreeragsree198@gmail.com",
        to: email,
        subject: 'Verification Email',
        text: `${otp}`
      }
  
  
      const info = await transporter.sendMail(mailOptions);
      console.log(info, 54);
      console.log("Email has been sent:", info.response);
      res.redirect("/otpverification");
      console.log('Mail sent successfully');
      return otp;
     
    } catch (error) {
      console.log("Error while sending email:", error);
      console.log(error.message);
    }
  };


  const verifyotp = async (req, res) => {
    
      try {
         
          const password = await bcrypt.hash(userRegData.password, 10);
          const enteredotp = req.body.otp;

          const refno = Math.random().toFixed(2)*100
          const refname=userRegData.name
          const refcodeid=refname+refno
          console.log(refcodeid,"refcodeid")
          if (otp == enteredotp) {
              const user = new User({
                  name: userRegData.name,
                  mobile: userRegData.mobile,
                  email: userRegData.email,
                  password: password,
                  is_blocked: false,
                  is_verified: 1,
                  is_admin: 0,
                  refcode:refcodeid
              })
              const userData = await user.save();
              console.log("refdatafffffffff")
              const refdata=await User.findOne({refcode:userRegData.ref})
              console.log(refdata,"refdata")
              if(refdata){
                await User.updateOne({email:userRegData.email},{$set:{refcodestatus: true}})
              }
              res.redirect('login' )
          }
          else {
              res.render('users/otpverification', { message1: "Invalid otp" })
          }
      }
      catch (error) {
          console.log(error.message);
      }
  }
  
  const loginLoad = async (req, res) => {
    try {
        console.log(req.session.user_id)
        if (req.session.user_id) {
            res.redirect('/home')
        } else {
            res.render('users/login')
        }

    } catch (error) {
        console.log(error.message);
    }
}
const userLogout = async (req, res) => {
    try {

        req.session.destroy()
        res.redirect('/')

    } catch (error) {
        console.log(error.message);
    }
}


const verifyLogin = async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;
        const userData = await User.findOne({ email: email })
        console.log(userData);
        if (userData) {
            const is_blocked = userData.is_blocked

                if(is_blocked===true){
                    res.render('users/login', { message: "User is already blocked" })
                    }
            req.session.user_id=userData._id        
            req.session.userName = userData.name
            const passwordMatch = await bcrypt.compare(password, userData.password)
            
            if (passwordMatch) {
                if (userData.is_verified === 0) {
                    res.render('users/login', { message: "Please verify your mail" })
                } else {
                    req.session.user_id = userData._id;
                    res.redirect('/home')
                }
            } else {
                res.render('users/login', { message: "Email and password is incorect" })
            }
        } else {
            res.render('users/login', { message: "Email and password is incorect" })
        }

    } catch (error) {
        console.log(error.message);
    }
}


const loadProfile = async (req, res) => {
    try {
      console.log("entered profile")
      const userData1 = req.session.user_id;
      const id = userData1;
      const wallet = await User.findById({_id:id})
      const userData = await User.findById(id);
      
  
      if (!userData) {
        res.redirect("/logout");
      } else {
        const categories = await Category.find();
  
        
  
        res.render("users/profile", {
          userData,
          userData1,
          categories,
          
          isLogged: req.session.userName,
          wallet:wallet.wallet,
          refcode:wallet.refcode
        });
      }
    } catch (error) {
      console.log(error.message);
      res.status(500).send('Internal Server Error');
    }
  };
  const loadEditProfile = async (req, res) => {
    try {
      const userData1 = req.session.user_id;
      const category = await Category.find()
      const id = req.query._id;

      const userData = await User.findById({_id:req.session.user_id});
      console.log('user DATA '+userData,410)
      res.render("users/editprofile", {
        userData: userData,
        userData1,
        categoryData:category
      });

      console.log("loadEditProfile",userData,415);
    } catch (error) {
      console.log(error.message);
    }
  };

  const editProfile = async (req, res) => {
    console.log("hello edit");
    try {
      const userData1 = req.session.user_id;
  
      const id = req.body.id;
  
      console.log(req.body.id,426);
  
      if (!id) {
        throw new Error('Invalid user ID');
      }
  
      const userData = await User.findByIdAndUpdate(
        {_id:id},
        {
          name: req.body.name,
          email: req.body.mail,
          mobile: req.body.mobile,
        },
        { new: true }
      );
   
      res.render("users/profile", { userData, userData1 });
    } catch (error) {
      console.log(error.message);
  
      res.status(500).send('Internal Server Error');
    }
  };
  const loadAddress = async (req, res) => {
    try {
      const userData1 = req.session.user_id;
      const addressData = await Address.find({ owner: userData1 });
  
      res.render("users/address", {
        userData1,
        addressData: addressData,
      });
    } catch (error) {
      console.log(error.message);
    }
  };
  const loadAddAddress = async (req, res) => {
    try {
      const userData1 = req.session.user_id;
      res.render("users/addaddress", { userData1 });
    } catch (error) {
      console.log(error.message);
    }
  };
  const addAddress = async (req, res) => {
  
    try {
      const userData1 = req.session.user_id;
      if (
       
        Object.values(req.body).some(
          (value) => !value.trim() || value.trim().length === 0
        )
      ) {
        res.render("users/addaddress", { message1: "Please fill the field" });
      } else {
        const address = new Address({
          owner: userData1,
          name: req.body.name,
          mobile: req.body.mobile,
          address1: req.body.address1,
          address2: req.body.address2,
          city: req.body.city,
          state: req.body.state,
          pin: req.body.pin,
          country: req.body.country,
        });
        const addressData = await address.save();
        if (addressData) {
          res.redirect("/address");
        }
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const loadEditAddress = async (req, res) => {
    try {
      const userData1 = req.session.user_id;
      const id = req.query.id;
      const addressData = await Address.findById(id);
  
      res.render("users/editaddress", { userData1, addressData });
    } catch (error) {
      console.log(error.message);
    }
  };
  
  
  const editAddress = async (req, res) => {
    try {
      const id = req.body.id;
      await Address.findByIdAndUpdate(
        { _id: id },
        {
          name: req.body.name,
          mobile: req.body.mobile,
          address1: req.body.address1,
          address2: req.body.address2,
          city: req.body.city,
          state: req.body.state,
          pin: req.body.pin,
          country: req.body.country,
        },
        { new: true }
      );
      res.redirect("/address");
    } catch (error) {
      console.log(error.message);
    }
  };


  
 
  const deleteAddress = async (req, res) => {
    try {
      const id = req.query.id;
      await Address.findByIdAndDelete({ _id: id });
      res.redirect("/address");
    } catch (error) {
      console.log(error.message);
    }
  };
  const forgetLoad = async (req, res) => {
    try {
        res.render('users/forget')

    } catch (error) {
        console.log(error.message);
    }
}

const forgetVerify = async (req, res) => {
  
   
  try {

      resetMail = req.body.email;
      const userData = await User.findOne({ email: resetMail })
      
      if (userData) {
          
          if (userData.is_verified === 0) {
              res.render('users/forget', { message: "Please verify your email " })


          } else {

              const rendomString = randomstring.generate();
              const updatedData = await User.updateOne({ email: resetMail }, { $set: { token: rendomString } });
              sendResetPasswordMail(userData.name, userData.email, rendomString);
              res.redirect('/otpforgotpassword')
          }
      } else {

          res.render('users/forget', { message: "User email is incorrect" })

      }

  } catch (error) {
      console.log(error.message);
  }
}
const sendResetPasswordMail = async (name, email, token) => {
  try {

    console.log("sendResetPasswordMail",89);

      const transporter = nodemailer.createTransport({
        service:'gmail',
        auth: {
          user: "sreeragsree198@gmail.com",
          pass: "ejdg ettl gtlv oknt"
        }
      });
      console.log(transporter,"transporter",98);

      const otp = generateOTP(); 
      console.log(otp,"otp",101);
      
      const mailoptions = {
        from: "sreeragsree198@gmail.com",
        to: email,
          subject: 'for Reset Password mail',
          text: `${otp}`
          
          

      }
      console.log(mailoptions,"mailoptions",110);
      transporter.sendMail(mailoptions, function (error, info) {
          if (error) {
              console.log("error while sending email:" , error)
          }
          else {
              console.log("Email has been sent:", info.response);
              res.redirect("/otpverification")
          }
          return otp;
      })

      console.log(transporter,"transporter",122);
  } catch (error) {
      console.log(error.message);
  }
}
const forgetPasswordOtpLoad=async(req,res)=>{
  console.log("forgetPasswordOtpLoad")
    try {
        res.render('users/otpforgotpassword')
    } catch (error) {
        console.log(error.message);
    }
}
const forgetVerifyotp=async(req,res)=>{
  console.log("forgetVerifyotp");
    const forgototp=req.body.otp
    console.log(forgototp);
    try {
        if(otp==forgototp){
            res.render('users/resetpassword1')
        }else{
            res.render('users/otpforgotpassword',{message:'Entered otp wrong'})
        }
    } catch (error) {
        console.log(error.message);
    }
}
const loadresetpassword=async(req,res)=>{
  try {
      res.render('users/resetpassword1')
  } catch (error) {
      console.log(error.message);
  }
}
const resetpassword = async (req, res) => {
  
  const password  = req.body.password
  console.log(password)

  try {
   
    const hashedPassword = await securePassword(password);
    console.log(resetMail)

    
    const user = await User.updateOne({ email: resetMail }, { $set: { password: hashedPassword } });
      console.log(user)
      res.render('test')
    
    if (user) {
      console.log("enterd for pass cagnge")
     
      resetMail=null
      res.render('users/login',{message:"password updated "});
    } else {
      
      res.render('error', { message: 'User not found' });
    }
  } catch (error) {
    console.log(error.message);
  
    //res.render('error', { message: error.message });
  }
};
const securePassword = async (password) => {
  try {

      const passwordHash = await bcrypt.hash(password, 10);
      return passwordHash;

  } catch (error) {
      console.log(error.message);
  }
}
const forgetPasswordLoad = async (req, res) => {
  try {

      const token = req.query.token;
      console.log(token)
      const tokenData = await User.findOne({ token: token });
      if (tokenData) {
          res.render('forget-password', { user_id: tokenData_id })
      } else {
          res.render('404', { message: "Tokken is invalid" })
      }
  } catch (error) {
      console.log(error.message);
  }
}

//----
const resetPassword = async (req, res) => {
  try {
      const password = req.body.password;
      const user_id = req.body.user_id;

      const secure_Password = await securePassword(password);

      const updateData = await User.findByIdAndUpdate({ _id: user_id }, { $set: { password: secure_Password, token: '' } })

      res.redirect("/")
  } catch (error) {
      console.log(error.message);
  }
}
const testload= async(req,res)=>{
  try{
    res.render('users/test')
  }catch (error) {
      console.log(error.message);
  }
}
const orderHistory = async (req, res) => {
  try {
    const userData1 = req.session.user_id;
    
    
    const categoryData=await Category.find()
    const orderData = await Order.find({ owner: userData1})
      .populate("items.product_id")
      .populate("items.quantity")
      .populate("shippingAddress")
      .sort({ dateOrdered: -1 });

      console.log(orderData);
    res.render("users/orderhistory", {isLogged: req.session.userName,categoryData, userData1, orderData });
  } catch (error) {
    console.log(error.message);
  }
};

const orderHistoryDetails = async (req, res) => {
  try {
    const userData1 = req.session.user_id;

    
    const id = req.query.id;
    const orderDetail = await Order.findById(id)
      .populate("items.product_id")
      .populate("shippingAddress")
      .populate("owner");
    //const itemsData = orderDetail.items;

    console.log(orderDetail.status,880,"orderDetail");                                   

    res.render("users/orderhistorydetails", {
      userData1,
      orderDetail,
    });
  } catch (error) {
    console.log(error.message);
  }
};
// tttttttttttt
// const orderHistoryDetails = async (req, res) => {
//   try {
//     const userData1 = req.session.user_id;
//     const id = req.query.id;
//     const orderDetail = await Order.findById(id)
//       .populate("items.product_id")
//       .populate("shippingAddress")
//       .populate("owner");

//     // Calculate the difference in days between the current date and the order date
//     const currentDate = new Date();
//     const orderDate = orderDetail.dateOrdered;

//     const timeDifference = currentDate.getTime() - orderDate.getTime();
//     const daysDifference = timeDifference / (1000 * 3600 * 24);

//     res.render("users/orderhistorydetails", {
//       userData1,
//       orderDetail,
//       daysDifference, // Pass the difference in days to the template
//     });
//   } catch (error) {
//     console.log(error.message);
//   }
// };


let  paymentMethod

//CANCEL ORDER
const orderCancel = async (req, res) => {
  try {
    const userId=req.session.user_id;
    const userData=await User.findById(userId)
    const orderId=req.body.id

    const orderData= await Order.findById(orderId)
    const paymentMethod = orderData.paymentMode
    const currentBalance=userData.wallet
    const refundAmount =orderData.totalBill;

    const updateTotalAmount=currentBalance+refundAmount
    console.log(updateTotalAmount,1058);

    if(paymentMethod == "razorpay" ||paymentMethod =="wallet"){
      console.log('this is inside if')
      const updatewalletAmount=await User.findByIdAndUpdate(

        userData._id,
        {$set:{wallet:updateTotalAmount}},
        {new:true})

        console.log("order completed");
      
    }

    

    


    const { id } = req.body;
    const updatedData = await Order.findByIdAndUpdate(
      { _id: id },
      { status: "cancelled" },
      { new: true }
    );
    res.json(updatedData);
  } catch (error) {
    console.log(error.message);
  }
};

const reotp= async(req,res)=>{
  try{
    console.log("entereddddddddddddddddddddd")
    const { name, email } = userRegData; 
    console.log(email,"my emailllllllllllllllllllll")

 
  const otp = await sendVerifyMail(name, email, res);
  }catch (error) {
    console.log(error.message);
  }
}


const invoiceDownload = async (req, res) => {
  try {
    const id = req.query.id;
    const order = await Order.findOne({ _id: id })
      .populate("items.product_id")
      .populate("shippingAddress");

    if (!order) {
      return res.status(404).send("Order not found");
    }

    // Create a new PDF document
    const doc = new PDFDocument({ font: "Helvetica" });

    // Set the response headers for downloading the PDF file
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="invoice-${order._id}.pdf"`
    );

    // Pipe the PDF document to the response
    doc.pipe(res);

    // Add the order details to the PDF document
    doc
      .fontSize(18)
      .text(`E-SHOPPER  INVOICE`, { align: "center", lineGap: 20 }); // increase line gap for better spacing

    doc.moveDown(2); // move down by 2 lines

    doc
      .fontSize(10)
      .text(`Order ID: ${order._id}`, { align: "left", lineGap: 10 }); // decrease line gap for tighter spacing
    doc.moveDown();
    doc.fontSize(12).text("Product Name", { width: 380, continued: true });
    doc
      .fontSize(12)
      .text("Price", { width: 100, align: "center", continued: true });
    doc.fontSize(12).text("Qty", { width: 50, align: "right" });
    doc.moveDown();

    let totalPrice = 0;
    order.items.forEach((item, index) => {
      doc
        .fontSize(12)
        .text(`${index + 1}. ${item.product_id.name}`, {
          width: 375,
          continued: true,
        });

      const totalCost = item.product_id.price * item.quantity;
      doc
        .fontSize(12)
        .text(`${totalCost}`, { width: 100, align: "center", continued: true });

      doc.fontSize(12).text(`${item.quantity}`, { width: 50, align: "right" });
      doc.moveDown();
      totalPrice += totalCost;
    });

    doc.moveDown(2); // move down by 2 lines

    doc.fontSize(12).text(`Subtotal: Rs ${totalPrice}`, { align: "right" });
    doc.moveDown();
    doc
      .fontSize(12)
      .text(`Total Amount after discount: Rs ${order.totalBill}`, {
        align: "right",
      });
    doc.moveDown();
    doc.fontSize(12).text(
      `Ordered Date: ${order.dateOrdered.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })} ${order.dateOrdered.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "numeric",
      })}`,
      { lineGap: 10 } // increase line gap for better spacing
    );
    doc.moveDown();
    doc
      .fontSize(12)
      .text(`Payment Method: ${order.paymentMode}`, { lineGap: 10 });
    doc.moveDown();
    doc.fontSize(12).text(`Coupon : ${order.coupon}`, { lineGap: 10 });
    doc.moveDown();
    doc
      .fontSize(12)
      .text(`Discount Amount : ${order.discountAmt}`, { lineGap: 10 });
    doc.moveDown();
    doc
      .fontSize(12)
      .text(
        `Shipping Address:\n ${order.shippingAddress.name},\n${order.shippingAddress.mobile},\n${order.shippingAddress.address1},\n${order.shippingAddress.address2},\n${order.shippingAddress.city}`,
        { lineGap: 10 }
      );
    doc.moveDown();
    doc.fontSize(12).text(`Order Status: ${order.status}`, { lineGap: 10 });

    doc.moveDown(2); // move down by 2 lines

    doc
      .fontSize(14)
      .text("Thank you for purchasing with us!", {
        align: "center",
        lineGap: 20,
      });

    doc.moveDown(); // move down by 1 line

    // End the PDF document
    doc.end();
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
};


const orderReturn = async (req, res) => {
  try {
    console.log("enter return")

    const userId=req.session.user_id;
    const userData=await User.findById(userId)
    const orderId=req.body.id

    const orderData= await Order.findById(orderId)
    const paymentMethod = orderData.paymentMode
    const currentBalance=userData.wallet
    const refundAmount =orderData.totalBill;

    const updateTotalAmount=currentBalance+refundAmount
    console.log(updateTotalAmount,1058);

    
      const updatewalletAmount=await User.findByIdAndUpdate(

        userData._id,
        {$set:{wallet:updateTotalAmount}},
        {new:true})

        console.log("order completed");
      



    const { id } = req.body;
    const updatedData = await Order.findByIdAndUpdate(
      id,
      { status: 'returned' },
      { new: true }
    );
    res.json(updatedData);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: 'Something went wrong' });
  }
};


const walletview = async(req,res)=>{
  try{
    const id= req.session.user_id
    console.log(id)
    const wallet = await User.findById({_id:id})
    console.log(wallet.wallet)
    res.render("users/wallet",{walletamt:wallet.wallet})
  } catch (error) {
    console.log(error.message);
  }
}

 module.exports={
  walletview,
    loadHome,
    loadRegister,
    insertUser,
    loadverifyotp,
    verifyotp,
    loginLoad,
    verifyLogin,
    loadShop,
    loadDeatails,
    loadProfile,
    loadAddress,
    loadAddAddress,
    addAddress,
    userLogout,
    loadCategoryProducts,
    loadEditAddress,
    editAddress,
    deleteAddress,
    forgetLoad,
    loadEditProfile,
    editProfile,
    forgetVerify ,
    forgetPasswordOtpLoad,
    forgetVerifyotp,
    loadresetpassword,
    resetpassword,
    resetPassword ,
    forgetPasswordLoad,
    testload,
    orderHistory,
    orderHistoryDetails,
    orderCancel,
    reotp,
    invoiceDownload,
    orderReturn,
    offershow
   

    
 }
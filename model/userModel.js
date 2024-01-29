const mongoose = require("mongoose")

const userschema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    mobile: {
        type: String,
        required: true
    },

    password: {
        type: String,
        required: true
    },
    is_admin: {
        type: Boolean,
        required: true
    },
    is_verified: {
        type: Number,
        default: 0
    },
    is_blocked: {
        type: Boolean,
        required: true
    },
    token: {
        type: String,
        default: ''
    },
    wallet: {
        type: Number,
        default:0
    },
    refcode:{
        type:String,
        default: ''
    },
    refcodestatus : {
        type: Boolean,
        default: false
    },
   
      

    cart: [{
        product_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product', 
        },
        quantity: {
            type: Number,
            default: 1
        }
    }],
    wishlist: [{
        product_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product'
        }
    }],





});
module.exports = mongoose.model("User", userschema)
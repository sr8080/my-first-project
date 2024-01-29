const { loadHome } = require("../controllers/userController");
const User = require('../model/userModel')

const isLogin = async (req, res, next) => {
    try {
        if (req.session.user_id) {
            res.redirect('/home')
        }
        next();
    } catch (error) {
        console.log(error.message);
    }
}


const isLogout = async (req, res, next) => {
    try {

        if (!req.session.user_id) {
            res.redirect('/home')
        }
        next();
    } catch (error) {
        console.log(error.message);
    }
}
const is_blocked = async (req, res, next) => {
    try {
        const id = req.session.user_id;
        console.log(id, "idddddddddddxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx");

        const user = await User.findOne({ _id: id }, { _id: 0, is_blocked: 1 });
        console.log(user, "user");
        console.log(user.is_blocked,"issss")

        if (user.is_blocked) {
            res.redirect('/login');
        } else {
            next()
        }
        

    } catch (error) {
        console.log(error.message);
        res.redirect('/login'); 
    }
}


module.exports = {
    isLogin,
    isLogout,
    is_blocked
}
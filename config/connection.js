require('dotenv').config()


const mongoose=require('mongoose');
mongoose.connect(process.env.MONGODB_URL)

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", function () {
  console.log("Connected successfully");
});


module.exports=db

// const mongoose = require('mongoose')

// const dbConnect = async () => {
//     try {
//         await mongoose.connect(process.env.MONGODB_URL)
//         console.log('Db connected');

//     } catch (error) {
//         console.log("Data base error");
//     }
// }

// module.exports = { dbConnect }

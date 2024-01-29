
const Product = require("../model/productModel")
const Category = require("../model/category");
const Offer = require('../model/offerModel')
const sharp = require('sharp');
const path = require('path');

// const listProduct = async (req, res) => {
//     try {
//         const productData = await Product.find();
//         const categoryData = await Category.find();
//         res.render('admin/product', { product: productData,categoryData})
       
//     } catch (error) {
//         console.log(error.message);
//     }
// }

const listProduct = async (req, res) => {
    try {
        const productData = await Product.find().sort({ _id: 'desc' });
        const categoryData = await Category.find();
        res.render('admin/product', { product: productData, categoryData });
    } catch (error) {
        console.log(error.message);
    }
}


const removeproduct = async(req,res)=>{
    try{
        const productId = req.params.id
        console.log(productId,"pid")

        
        const deletedProduct = await Product.findByIdAndDelete(productId);
        res.redirect('/admin/product')
    }catch (error) {
        console.log(error.message);
    }
}

const productLoad = async (req, res) => {
    try {
        const categoryData = await Category.find();
        res.render('admin/addProduct', { categoryData });
    } catch (error) {
        console.log(error.message);
    }
};



// const addProduct = async (req, res) => {
//     try {
//         console.log("111111111")
//         const categoryData = await Category.find();
//         if (Object.values(req.body).some(
//             (value) => !value.trim() || value.trim().length === 0
//         )) {
//             res.render("admin/addProduct", { message1: "Please fill the field" });
//         } else {
//             console.log("22222")
//             const name = req.body.name;
//             const productData = await Product.findOne({ name: name })
//             console.log("eeeee")
//             const images = []
//             console.log("23333")
//             const file = req.files;

            
//             console.log(file,"fileeeeeeeee")
//             file.forEach((element) => {
//                 const image = element.filename;
//                 images.push(image)
//             });
//             console.log("444")
//             const offer = req.body.offer || 0; 
//         const originalPrice = parseFloat(req.body.price);

       
//         const offerPrice = originalPrice - (originalPrice * (offer / 100));
//             if (productData == null) {
                
//                 const product = new Product({
//                     name: req.body.name,
//                     description: req.body.description,
//                     image: images,
//                     category: req.body.category,
//                     price: req.body.price,
//                     brand: req.body.brand,
//                     quantity: req.body.quantity,
//                     Offerprice:offerPrice,
//                     offerstatus:false,
//                     origianlprice:req.body.price,
//                     is_blocked: false
//                 });

//                 await product.save();
//                 res.render("admin/addProduct", { message: "Product added succesfuly" ,categoryData});
//             } else {
//                 console.log("first",productData.name)
//                 console.log("second",name)

//                 if (productData.name == name)
//                 console.log("test 1",productData.name)
//                 console.log("stest 2",name)
//                     res.render('admin/addProduct', { message: 'Product already exists.... ' });
//             }
//         }
//     } catch (error) {
//         console.log(error.message);
//     }
// };
// tttttttttttttttttttttttttttttttttttttt



const addProduct = async (req, res) => {
    try {
        const categoryData = await Category.find();
        const img = req.files;
        console.log(img, "iiii");
        const images = [];

        
        const imagePromises = img.map(async (image) => {
            const upimg = image.path;
            const cropimg = path.join(
                image.destination,
                `image_${new Date().getTime()}.jpg`
            );
            const options = {
                height: 100,
                width: 100
            };

           
            await sharp(upimg).resize(options).toFile(cropimg);
            images.push(path.basename(cropimg));
        });

        
        await Promise.all(imagePromises);

        
        const offer = req.body.offer || 0;
        const originalPrice = parseFloat(req.body.price);
        const offerPrice = originalPrice - (originalPrice * (offer / 100));

        const product = new Product({
            name: req.body.name,
            description: req.body.description,
            image: images,
            category: req.body.category,
            price: req.body.price,
            brand: req.body.brand,
            quantity: req.body.quantity,
            Offerprice: offerPrice,
            offerstatus: false,
            origianlprice: req.body.price,
            is_blocked: false
        });

        await product.save();
        res.render("admin/addProduct", { message: "Product added successfully", categoryData });
    } catch (error) {
        console.error('General error:', error.message);
        res.status(500).send('Internal Server Error');
    }
};






// tttttttttttttttttttttttttttttttttttttt



const loadEditProduct = async (req, res) => {
    try {
        const id = req.query.id
        const categoryData = await Category.find();
        const productData = await Product.findById({ _id: id })
        const images  = productData.image
        console.log(productData)
        console.log(productData.name)
        if (productData) {
            res.render('admin/editproduct', { product: productData, categoryData: categoryData,images });
        }
        else {
            res.render('admin/product')
        }

    } catch (error) {
        console.log(error.message);
    }
};




const editProduct = async (req, res) => {
    try {
        console.log("entered")
        const id = req.query.id
        console.log(id,"iii")
        const productData = await Product.findById({ _id: id });
        const oldPhotosArray = productData.image
        console.log(productData,"ppp")
        let newArray = []
        // tttttttt
        const oldImagesArray = productData.image;
        console.log(oldImagesArray,"ooo")
    let updatedImages = [...oldImagesArray];
        console.log(updatedImages,"up")
        console.log(updatedImages[0],"first up")
        const file=req.files
        console.log(file,"naaa")

        if (req.files && req.files.length > 0) {
            const uploadedFilename = req.files[0].filename;
           
           
            updatedImages[0] = uploadedFilename;
           
           
          }
          if(req.files[1]){
            const secondimg = req.files[1].filename
            updatedImages[1]=secondimg
          }
          if(req.files[2]){
            const thirddimg = req.files[2].filename
            updatedImages[2]=thirddimg
          }
        //   wwwwwwwwwwwwwwwwwwwwwwwwwwww

        // if (req.files && req.files.updatedImages && req.files.updatedImages.length > 0) {
        //     const uploadedImages = req.files.updatedImages.map(file => file.filename);
        //     updatedImages.splice(0, uploadedImages.length, ...uploadedImages);
        //   }
          
        
        // file.forEach((element)=>{
        //     const image = element.filename
        //     console.log(image,"nnnn")
        //     updatedImages[0]=image
        // })
        // console.log(updatedImages[0],"fsecond up")
        // console.log(image,"nnnn")
    // if (req.files) {
    //   const updatedFirstImage = req.files.filename;
    //   updatedImages[0] = updatedFirstImage; // Update the first image in the array
    // }
       console.log(updatedImages,"after")

        // const images = []
        // const file = req.files
        // console.log(file,"fffffff")
        // file.forEach((element) => {
        //     const image = element.filename
        //     images.push(image)
        // })
        // console.log(images,"imgggg")

       
        // newArray = [...oldPhotosArray, ...images]
        if(req.body.name && req.body.description &&  req.body.category && req.body.price &&req.body.brand && req.body.quantity) {

        await Product.findByIdAndUpdate(
            { _id: id },
            {
                name: req.body.name,
                description: req.body.description,
                image: updatedImages,
                category: req.body.category,
                price: req.body.price,
                origianlprice:req.body.price,
                brand: req.body.brand,
                quantity: req.body.quantity

            },
            { new: true }

        );
        }else{
            res.redirect("/admin/editproduct");
        }
        res.redirect("/admin/product");
    } catch (error) {
        console.log(error.message);
    }
};


const deleteimg = async(req,res)=>{
    try {
        const productId = req.params.productId;
        const imageName = req.params.imageName;

        
        const updatedProduct = await Product.findByIdAndUpdate(
            productId,
            { $pull: { image: imageName } },
            { new: true }
        );

        

        res.json({ success: true, message: 'Image deleted successfully' });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}

// const editProduct = async (req, res) => {
//     try {
//       const id = req.query.id;
//       const productData = await Product.findById(id);
//       let updatedImages = [...productData.image];
  
//       if (req.files && req.files.updatedImages) {
//         const updatedFileArray = req.files.updatedImages;
//         updatedFileArray.forEach(updatedFile => {
//           const imageIndex = updatedFile.fieldname; // Access the index attribute from the form
//           updatedImages[imageIndex] = updatedFile.filename; // Update the specific image
//         });
//       }
  
//       // Update other fields as needed (name, description, etc.)
//       // ...
  
//       await Product.findByIdAndUpdate(
//         id,
//         { image: updatedImages, /* Other updated fields */ },
//         { new: true }
//       );
//       await Product.findByIdAndUpdate(
//         { _id: id },
//         {
//             name: req.body.name,
//             description: req.body.description,
//             image: newArray,
//             category: req.body.category,
//             price: req.body.price,
//             brand: req.body.brand,
//             quantity: req.body.quantity

//         },
//         { new: true }

//     );
//       res.redirect("/admin/product");
//     } catch (error) {
//       console.error(error.message);
//       res.status(500).send("Server Error");
//     }
//   };
  
  


const deleteProdImage = async (req, res) => {
    try {

        const { id, image } = req.query
        const productData = await Product.findById(id)
        productData.image.splice(image, 1)
        await productData.save()
        res.status(200).send({ message: 'Image deleted succesfully' });

    } catch (error) {
        res.status(500).send({ error: error.message });
    }
}







const blockProduct = async (req, res) => {
    const blockid = req.params.id
    const blockProductData = await Product.findById(blockid)
    const block_status = blockProductData.is_blocked

    try {
        const final = await Product.findByIdAndUpdate(blockid, { $set: { is_blocked: !block_status } }, { new: true })
        res.redirect('/admin/product')
    } catch (error) {
        console.log(error.message);
    }
}
const blockoffer = async(req,res)=>{
    try{
        const blockid = req.params.id
        const blockProductData = await Product.findById(blockid)
        const block_status = blockProductData. offerstatus
        const final = await Product.findByIdAndUpdate(blockid, { $set: { offerstatus: !block_status } }, { new: true })
        const offerstatus = await Product.findById(blockid)
        const latest = offerstatus.offerstatus
        if(latest== true){
            const offerprice=offerstatus.Offerprice
            const final = await Product.findByIdAndUpdate(blockid, { $set: { price:offerprice } })

        }else if(latest==false){
            const orginalprice=offerstatus.origianlprice
            const final = await Product.findByIdAndUpdate(blockid, { $set: { price:orginalprice} })
        }
        res.redirect('/admin/product')
    }catch (error) {
        console.log(error.message);
    }
}

const deleteoffer = async(req,res)=>{
    try{
        const offerid = req.params.id
        
  
        
        const deletedoffer = await Offer.findByIdAndDelete(offerid);
        res.redirect('/admin/showoffers')
    }catch (error) {
        console.log(error.message);
    }
}
const loadproductlist =async(req,res)=>{
    try {
        const data =req.session.user_id;
        const categorydata=await Category.find()

        const options={
            page:req.query.page||1,
            limits:8,
            query:{is_blocked:true}
        };
        let result;
        const selectedCategoryId=req.body.categoryid;

        if (selectedCategoryId) {
            result =await Product.paginate(
                {category:selectedCategoryId,is_blocked:false},
                options
            );
        } else {
            result =await Product.paginate({is_blocked:false},options)
        }
        res.render('users/productlist ',{productData:result,data,categorydata});
    } catch (error) {
        console.log(error.message);
    }
}

const deleteimage= async(req,res)=>{
    try{

        const imagename = req.query.imagename;
        console.log(imagename)

  
        
    
        const addressData = await Product.findOneAndUpdate(
          { image:imagename },
          { $pull: { cart: { product_id: req.body.addressId } } },
          { new: true }
        );
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    deleteoffer,
    blockoffer,
    removeproduct,
    listProduct,
    productLoad,
    addProduct,
    loadEditProduct,
    editProduct,
    deleteProdImage,
    loadproductlist,

    blockProduct,
    deleteimg
}

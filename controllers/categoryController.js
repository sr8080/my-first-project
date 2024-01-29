

const Category = require('../model/category');





const listCategory = async (req, res) => {
    try {

        const categories = await Category.find()
        
        res.render('admin/category', { category: categories })

    } catch (error) {
        console.log(error.message);
    }
}


const loadAddCategory = async (req, res) => {
    try {
        res.render("admin/addcategory");
    } catch (error) {
        console.log(error.message);
    }
};



const insertCategory = async (req, res) => {
    try {
        const name = req.body.name;

        const nameLo = name.toLowerCase();
        const categoryData = await Category.findOne({ name: nameLo });
        if (name.trim() == '') {
            
            res.render("admin/addcategory", { message1: "Please enter valid name" })
        } else if (categoryData) {
            res.render("admin/addcategory", { message1: "Category exixts" });
        } else {

            const category = new Category({
                name: nameLo,
                image: req.file.filename,

            });
            const categoryy = await category.save();

            res.render("admin/addcategory", {
                message: "Category added successfully",
            });
        }
    } catch (error) {
        console.log(error.message);
    }
};



const loadEditCategory = async (req, res) => {
    try {
        const id = req.query.id;
        const categoryData = await Category.findById({ _id: id });
        if (categoryData) {
            res.render("admin/editcategory", { category: categoryData })
        } else {
            res.redirect("admin/category");
        }
    } catch (error) {
        console.log(error.message);

    }
};

const updateCategoy = async (req, res) => {
    try {
        const id = req.query.id;
        console.log(id,"idddddddddddddd")
        const categoryData = await Category.find();
        const name = req.body.name;
        const nameLo=name.toLowerCase();
        const imname = req.file.filename
        console.log(imname,"imgggggggggg")

        const existingCategory = categoryData.find(
            category => category.name.toLowerCase() === nameLo && category._id != id
        );
        if (existingCategory) {
            return res.render("admin/editcategory", { message: "Category exists" });
        }


        const updateCategoy = await Category.findByIdAndUpdate(
            {_id:id},
            { name, image: req.file.filename },
            { new: true }
        );
        if (!updateCategoy) {
            return res.status(404).render("admin/editcategory", { message: "Caegory not found" })
        }

        res.redirect("/admin/category");
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal server error");
    }
};

const deleteCategory = async (req, res) => {

    try {
        const id = req.query.id;
        const category = await Category.findByIdAndDelete({ _id: id });
        res.redirect("/admin/category");
    } catch (error) {
        
        (error.message);
    }
};

module.exports = {
    listCategory,
    loadAddCategory,
    insertCategory,
    loadEditCategory,
    updateCategoy,
    deleteCategory


};


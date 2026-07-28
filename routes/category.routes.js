const express = require("express");

const router = express.Router();

const {

createCategory,

getCategories,

getCategoryById,

getCategoryBySlug,

updateCategory,

deleteCategory

}=require("../controllers/category.controller");

router.post("/",createCategory);

router.get("/",getCategories);

// Get Category By Slug

router.get("/slug/:slug",getCategoryBySlug);

// Get Category By Id

router.get("/:id",getCategoryById);

router.put("/:id",updateCategory);

router.delete("/:id",deleteCategory);

module.exports=router;
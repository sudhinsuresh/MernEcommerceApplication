const express =require("express");
const router =express.Router()
const { createProduct, getaProduct, getAllProduct, updateProduct,
     deleteProduct,addToWishlist,rating, uploadImages } = require("../controller/productCtrl");
const { isAdmin , authMiddleware }= require("../middleware/authMiddleware");
const { uploadPhoto, productImgResize } = require("../middleware/uploadimages");


router.post("/",authMiddleware,isAdmin,createProduct)
router.get("/:id",authMiddleware,isAdmin,getaProduct)

router.put("/wishlist",authMiddleware,addToWishlist)
router.put("/rating",authMiddleware,rating)
router.put("/upload/:id",authMiddleware,isAdmin,uploadPhoto.array("images",2),productImgResize,uploadImages)

router.get("/",authMiddleware,isAdmin,authMiddleware,getAllProduct)
router.put("/:id",authMiddleware,isAdmin,updateProduct)
router.delete("/:id",authMiddleware,isAdmin,deleteProduct)


module.exports= router;
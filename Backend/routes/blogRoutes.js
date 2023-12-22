const express =require("express");
const { authMiddleware, isAdmin } = require("../middleware/authMiddleware");
const {createBlog, updateBlog, getallBlog, getBlog, deleteBlog, likeBlog, dislikeBlog, uploadImages }= require("../controller/blogCtrl");
const { blogImgResize, uploadPhoto } = require("../middleware/uploadimages");
const router =express.Router() 

router.post("/",authMiddleware,isAdmin, createBlog)
router.put("/upload/:id",authMiddleware,isAdmin,uploadPhoto.array("images",2),blogImgResize,uploadImages)
router.put("/likes", authMiddleware,likeBlog)
router.put("/dislikes",authMiddleware, dislikeBlog)
router.put("/:id",authMiddleware, isAdmin, updateBlog)
router.get("/",getallBlog)
router.get("/:id",getBlog),
router.delete("/:id",authMiddleware,isAdmin,  deleteBlog)


module.exports =router;
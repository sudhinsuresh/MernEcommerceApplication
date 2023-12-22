const Blog= require("../models/blogModel")
const User =require("../models/userModel")
const asyncHandler =require("express-async-handler")
const validateMongoDbId =require("../utils/validateMongodbid")
const cloudinaryUploadImg = require("../utils/cloudinary")
const fs =require("fs")

const createBlog =asyncHandler( async( req, res) =>{
    try{
        const newBlog =await Blog.create(req.body);
        res.json(newBlog)

    }catch(error){
        throw new Error(error)
    }

})
const updateBlog =asyncHandler( async (req, res) =>{
    const { id } =req.params
    validateMongoDbId(id)
    try{
        const updateaBlog =await Blog.findByIdAndUpdate(id, req.body,{
            new:true,
        })
        res.json(updateaBlog)

    }catch(error){
        throw new Error(error)
    }
})
const getallBlog =asyncHandler( async (req, res) =>{
    try{
        const getBlog= await Blog.find()
        res.json(getBlog)

    }catch(error){
        throw new Error(error)

    }
})
const getBlog = asyncHandler( async (req, res) => {
    const { id } = req.params
    validateMongoDbId(id)
    try{
        const getaBlog =await Blog.findById(id).populate("likes").populate("dislikes")
        const updateViews =await Blog.findByIdAndUpdate(
            id,
            {
                $inc:{ numViews: 1 },
            },
            {
                new :true
            }
        )
        res.json(getaBlog)

    }catch(error){
        throw new Error(error)
    }

})
const deleteBlog = asyncHandler( async (req, res )=>{
    const { id } = req.params
    validateMongoDbId(id)
    try{
        const deleteaBlog = await Blog.findByIdAndDelete(id)
        res.json(deleteaBlog)

    }catch(error){
        throw new Error(error)
    }
})
const likeBlog = asyncHandler(async (req, res) => {
    const { blogId } =req.body;
    validateMongoDbId(blogId)
    const blog = await Blog.findById(blogId)
    const loginUserId = req?.user?._id

    const isLiked =blog?.isLiked

    const alreadyDisliked =blog?.disliked?.find(
        (userId) =>userId?.toString()=== loginUserId?.toString()
    )
    if(alreadyDisliked){
        const blog =await Blog.findByIdAndUpdate(
            blogId,
            {
                $pull:{ dislikes :loginUserId},
                isDisliked :false,
            },
            {
                new:true
            }
        )
        res.json(blog)
    }
    if(isLiked){
        const blog =await Blog.findByIdAndUpdate(
            blogId,
            {
                $pull:{likes: loginUserId },
                isLiked: false,
            },
            {
                new:true
            }
        )
        res.json(blog)
    }else{
        const blog =await Blog.findByIdAndUpdate(
            blogId,
            {
                $push:{likes :loginUserId },
                isLiked:true,
            },
            {
                new:true
            }
        )
        res.json(blog)
    }
   

});
const dislikeBlog = asyncHandler(async (req, res) => {
    const { blogId } = req.body;
  
    // Validate the MongoDB ID
    validateMongoDbId(blogId);
  
    // Find the blog to be liked
    const blog = await Blog.findById(blogId);
  
    // Find the login user
    const loginUserId = req?.user?._id;
    const isDisLiked=blog?.isDisLiked
    // Check if the user has disliked the blog
    const alreadyLiked =blog?.likes?.find(
        (userId) =>userId?.toString() === loginUserId.toString()
    )
    if(alreadyLiked){
        const blog= await Blog.findByIdAndUpdate(
            blogId,
            {
                $pull:{ likes: loginUserId },
                isLiked: false,
            },
            {
                new:true
            }
        )
        res.json(blog)
    }
    if (isDisLiked){
        const blog =await Blog.findByIdAndUpdate(
            blogId,
            {
                $pull: { dislikes:loginUserId },
                isDisliked: false,
            },
            {
                new: true
            }
        )
        res.json(blog)
    }else{
        const blog =await Blog.findByIdAndUpdate(
            blogId,
            {
                $push:{ dislikes : loginUserId },
                isDisliked: true,
            },
            {
                new:true
            }
        )
        res.json(blog)
    }
 
  });

  const uploadImages = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);

    try {
        const uploader = async (path) => await cloudinaryUploadImg(path, "images");
        const urls = [];
        const files = req.files;

        for (const file of files) {
            const { path } = file;
            const newpath = await uploader(path);
            urls.push(newpath);

            // Asynchronously unlink the file with error handling
            try {
                await fs.promises.unlink(path);
            } catch (unlinkError) {
                console.error('Error deleting file:', unlinkError);
            }
        }

        const findBlog = await Blog.findByIdAndUpdate(
            id,
            {
                images: urls.map((file) => file),
            },
            {
                new: true,
            }
        );

        res.json(findBlog);
    } catch (error) {
        console.error('Error in uploadImages:', error);
        throw new Error(error);
    }
});

module.exports = { createBlog, updateBlog, getallBlog, getBlog, deleteBlog  , likeBlog, dislikeBlog,uploadImages } 
const Product =require("../models/productModel")
const asyncHandler= require("express-async-handler")
const slugify =require("slugify")
const validateMongoDbId =require("../utils/validateMongodbid")
const User =require('../models/userModel')
const cloudinaryUploadImg = require("../utils/cloudinary")
const fs =require("fs")



const createProduct =asyncHandler( async(req, res)=>{
    try{
        if(req.body.title){
            req.body.slug =slugify(req.body.title)
        }
        const newProduct =await Product.create(req.body)
        res.json(newProduct)
    }catch(error){
        throw new Error(error)
    }
})
const updateProduct = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        validateMongoDbId(id)
        if (req.body.title) {
            req.body.slug = slugify(req.body.title);
        }
        const updatedProduct = await Product.findOneAndUpdate({ _id: id }, req.body, {
            new: true,
        });
        res.json(updatedProduct);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Server Error' });
    }
});
const deleteProduct =asyncHandler( async (req, res) =>{
    try{
        const { id } =req.params
        validateMongoDbId(id)
        const deleteaProduct= await Product.findOneAndDelete({ _id: id})
        res.json(deleteaProduct)
    }catch(error){
        throw new Error(error.message)
    }
})
const getaProduct =asyncHandler( async (req, res)=>{
    const {id} =req.params
    validateMongoDbId(id)
    try{
        const findProduct =await Product.findById(id)
        res.json(findProduct)

    }catch(error){
        throw new Error(error)
    }
})
const getAllProduct =asyncHandler(async(req, res)=>{
    try{
        //filtering
        const queryObj={...req.query };
        const excludeFields =["page","sort","limit","fields"];
        excludeFields.forEach((el)=> delete queryObj[el])
        let queryStr =JSON.stringify(queryObj)
        queryStr=queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match=>`$${match}`)
        let query =Product.find(JSON.parse(queryStr))
        //Sorting
        if(req.query.sort){
            const sortBy =req.query.sort.split(",").join(" ")
            query =query.sort(sortBy)
        }else{
            query=query.sort('-createdAt')
        } 
        //limiting the fields
        if(req.query.fields){
            const fields =req.query.fields.split(",").join(" ")
            query=query.select(fields)
        }else{
            query=query.select('-__v')
        }
        //pagination
        const page =req.query.page;
        const limit =req.query.limit
        const skip =(page -1) * limit;
        query =query.skip(skip).limit(limit)
        if(req.query.page){
            const productCount =await Product.countDocuments()
            if(skip >= productCount) throw new Error("this page does not exists")
        }
        console.log(page,limit,skip)


        const product=await query;
        res.json(product)

    }catch(error){
        throw new Error(error)
    }
})

const addToWishlist =asyncHandler( async ( req, res)=>{
    const { _id } =req.user
    const { prodId } =req.body;
    try{
        const user = await User.findById(_id)
        const alreadyadded = user.wishlist.find((id) => id.toString() === prodId);
        if(alreadyadded){
            let user = await User.findByIdAndUpdate(_id,{
                $pull:{ wishlist:prodId },

            },
            {
                new:true
            })
            res.json(user)
        }else{
            let user = await User.findByIdAndUpdate(_id,{
                $push:{ wishlist:prodId },

            },
            {
                new:true
            })
            res.json(user)

        }

    }catch(error){
        throw new Error(error)
    }
})

const rating = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    const { star, prodId, comment  } = req.body;
  
    try {
      const product = await Product.findById(prodId);
  
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
      const alreadyRated = product.ratings.find((userId) => userId.postedby.toString() === _id.toString());
  
      if (alreadyRated) {
        const updateRating = await Product.updateOne(
          {
            'ratings.postedby': _id,
            _id: prodId,
          },
          {
            $set: { 'ratings.$.star': star, "ratings.$.comment":comment  },
          },
          {
            new: true,
          }
        );
  
        res.json(updateRating);
      } else {
        const rateProduct = await Product.findByIdAndUpdate(
          prodId,
          {
            $push: {
              ratings: {
                star: star,
                comment:comment,
                postedby: _id,
              },
            },
          },
          {
            new: true,
          }
        );
  
        res.json(rateProduct);
      }
      const getallratings = await Product.findById(prodId);
      const totalRating = getallratings.ratings.length;
      const ratingsum = getallratings.ratings.map((item) => item.star).reduce((prev, curr) => prev + curr, 0);
      const actualRating = Math.round(ratingsum / totalRating);
  
      const finalproduct = await Product.findByIdAndUpdate(
        prodId,
        {
          totalrating: actualRating,
        },
        {
          new: true,
        }
      );
  
      res.json(finalproduct);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  const uploadImages = asyncHandler(async (req, res) => {
    console.log(req.files);
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

        const findProduct = await Product.findByIdAndUpdate(
            id,
            {
                images: urls.map((file) => file),
            },
            {
                new: true,
            }
        );

        res.json(findProduct);
    } catch (error) {
        console.error('Error in uploadImages:', error);
        throw new Error(error);
    }
});

  

module.exports ={ createProduct,getaProduct, getAllProduct, updateProduct,deleteProduct,addToWishlist,rating,uploadImages };
const Coupon =require("../models/couponModel")
const validateMongoDbId =require("../utils/validateMongodbid")
const asyncHandler = require("express-async-handler")


const createCoupon =asyncHandler( async (req, res) =>{
    try{
        const newCoupon =await Coupon.create(req.body)
        res.json(newCoupon)
    }catch(error){
        throw new Error(error)
    }
})

const getAllcoupon = asyncHandler( async (req, res)=>{
    try{
        const coupons = await Coupon.find()
        res.json(coupons)

    }catch(error){
        throw new Error(error)
    }
})
const Updatecoupon = asyncHandler (async (req, res)=>{
    const { id } =req.params
    validateMongoDbId(id)
    try{
        const updatecoupon = await Coupon.findByIdAndUpdate(id, req.body,
            {
                new:true
            }
            )
            res.json(updatecoupon)
    }catch(error){
        throw new Error(error)

    }

})
const Deletecoupon = asyncHandler( async (req, res ) =>{
    const { id }= req.params
    validateMongoDbId(id)
    try{
        const deletecoupon = await Coupon.findByIdAndDelete(id)
        res.json(deletecoupon)
    }catch(error){
        throw new Error(error)
    }
})
module.exports={ createCoupon, getAllcoupon, Updatecoupon, Deletecoupon }
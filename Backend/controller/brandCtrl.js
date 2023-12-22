const Brand =require("../models/brandModel")
const asyncHandler =require("express-async-handler")
const validateMongoDbId =require("../utils/validateMongodbid")

const createBrand =asyncHandler( async (req, res) =>{
    try{
        const newBrand = await Brand.create(req.body)
        res.json(newBrand)

    }catch(error){
        throw new Error(error)
    }
})
const updateBrand = asyncHandler( async (req, res)=>{
    const { id } =req.params
    try{
        const updateBrand =await Brand.findByIdAndUpdate(id, req.body,
            {
                new:true
            })
            res.json(updateBrand)

    }catch(error){
        throw new Error(error)
    }
})
const deleteBrand = asyncHandler( async( req, res) =>{
    const { id } = req.params
    try{
        const deleteBrand = await Brand.findByIdAndDelete(id)
        res.json(deleteBrand)
    }catch(error){
        throw new Error(error)
    }
})

const getBrand =asyncHandler( async( req, res) =>{
    const { id } = req.params
    try{
        const getBrand = await Brand.findById(id)
        res.json(getBrand)

    }catch(error){
        throw new Error(error)
    }
})
const getallBrand = asyncHandler( async (req, res )=>{
    try{
        const getallBrand = await Brand.find()
        res.json(getallBrand)

    }catch(error){
        throw new Error(error)
    }
})


module.exports ={ createBrand, updateBrand,deleteBrand,getBrand,getallBrand }
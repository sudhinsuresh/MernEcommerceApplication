const User =require('../models/userModel')
const Product = require("../models/productModel")
const Cart =require("../models/cartModel")
const Coupon = require("../models/couponModel")
const Order = require('../models/orderModel')
const uniqid = require('uniqid')

const asyncHandler =require("express-async-handler")
const generateToken=require("../config/jwtToken");
const { json } = require('body-parser');
const validateMongoDbId =require("../utils/validateMongodbid")
const generaterefresh =require("../config/refreshToken");
const generaterefreshToken = require('../config/refreshToken');
const jwt =require("jsonwebtoken");
const sendEmail = require('./emailCtrl');
const crypto =require("crypto")


const createUser =asyncHandler(async (req,res)=>{
    const email =req.body.email;
    const findUser =await User.findOne({ email : email });
    if(!findUser){
        //create a new user
        const newUser = await User.create(req.body)
        res.json(newUser)
    }else{
        throw new Error("user Already Exists")
    }
})
const loginUserCtrl =asyncHandler(async (req,res)=>{
    const {email, password} =req.body;
    //console.log(email,password)
    const findUser =await User.findOne({ email });
    if(findUser && await findUser.isPasswordMatched(password)){
        const refreshToken =await generaterefreshToken(findUser?._id);
        const updateUser =await User.findByIdAndUpdate(findUser.id,{
            refreshToken:refreshToken,

        },
        {
            new:true
        }
        )
        res.cookie('refreshToken',refreshToken,{
            httpOnly:true,
            maxAge:72 * 60 * 60 * 1000,
        }
        )
        res.json({
            _id: findUser?._id,
            firstname: findUser?.firstname,
            lastname: findUser?.lastname,
            email: findUser?.email,
            mobile:findUser?.mobile,
            token: generateToken(findUser?._id),

        })

    }else{
        throw new Error("invalid credentials")
    }

})

//handle refresh token
const handleRefreshToken = asyncHandler(async (req, res) => {
    try {
        const cookie = req.cookies;

        if (!cookie?.refreshToken) {
            throw new Error('No Refresh Token in Cookies');
        }

        const refreshToken = cookie.refreshToken;
        const user = await User.findOne({ refreshToken });

        if (!user) {
            throw new Error('No Refresh token present in db or not matched');
        }

        jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
            if (err || user.id !== decoded.id) {
                throw new Error('There is something wrong with the refresh token');
            }

            const accessToken = generateToken(user?._id);
            res.json({ accessToken });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});
//logout functionality

const logout = asyncHandler(async (req, res) => {
    try {
        const { refreshToken } = req.cookies;

        if (!refreshToken) {
            throw new Error('No Refresh Token in Cookies');
        }

        const user = await User.findOneAndUpdate(
            { refreshToken }, 
            { $set: { refreshToken: "" } }, // Update refreshToken field to an empty string
            { new: true } 
        );

        if (!user) {
            res.clearCookie('refreshToken', {
                httpOnly: true,
                secure: true
            });
            return res.sendStatus(204);
        }

        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: true
        });

        return res.sendStatus(204);
    } catch (error) {
        console.error(error);
        return res.status(500).send('Internal Server Error');
    }
});




//Get all users

const getallUser= asyncHandler(async(req,res)=>{
    try{
        const getUsers =await User.find()
        res.json(getUsers)

    }catch(error){
        throw new Error(error)
    }
})

//get a single user
const getaUser =asyncHandler(async (req,res)=>{
    const {id} =req.params
    validateMongoDbId(id)
    try{
        const getaUser =await User.findById(id);
        res.json({
            getaUser
        })

    }catch(error){
        throw new Error(error)
    }

})
const deleteUser =asyncHandler(async (req, res)=>{
    const{id} =req.params
    validateMongoDbId(id)
    try{
        const deleteUser =await User.findByIdAndDelete(id)
        res.json({
            deleteUser
        })

    }catch(error){
        throw new Error(error)
    }
})

const UpdateUser =asyncHandler(async (req,res)=>{
    const {_id} =req.user;
    validateMongoDbId(_id)
    try{
        const updateUser =await User.findByIdAndUpdate(_id,{
            firstname:req?.body?.firstname,
            lastname:req?.body?.lastname,
            email:req?.body?.email,
            mobile:req?.body?.mobile
            
        },
        {
            new: true
        })
        res.json(updateUser)

    }catch(error){
        throw new Error(error)

    }
})

const blockUser =asyncHandler(async(req,res) =>{
    const {id} =req.params
    validateMongoDbId(id)
    try{
        const block= await User.findByIdAndUpdate(id,{
            isBlocked:true,
    },
    {
        new: true
    })
    res.json({message:"User Blocked"})

    }catch(error){
        throw new Error(error)

    }
})
const unblockUser =asyncHandler( async(req,res) =>{
    const {id} =req.params
    validateMongoDbId(id)
    try{
        const unblock=await User.findByIdAndUpdate(id,{
            isBlocked:false,
    },
    {
        new: true
    })
    res.json({message:"User unblocked"})

    }catch(error){
        throw new Error(error)

    }
})

const updatePassword =asyncHandler( async (req, res)=>{
    const { _id } =req.user;
    const {password} =req.body;
    validateMongoDbId( _id)
    const user=await User.findById(_id)
    if(password){
        user.password =password.toString();
        const updatedPassword =await user.save()
        res.json(updatedPassword)
    }else{
        res.json(user)
    }
})
const forgetPasswordToken =asyncHandler( async (req, res)=>{
    const { email } =req.body;
    const user =await User.findOne({ email })
    if(!user) throw new Error("User not Found with this Email")
    try{
       const token =await user.createPasswordResetToken();
       await user.save();
       const resetURL =`Hi ,Please follow this link to reset your Password. this link is valid till 10 minutes from now,<a href='http:localhost:5000/api/user/resetpassword/${token}'>Click Here</>`
       const data ={
        to:email,
        text:"Hey User",
        subject:"Forget Password Link",
        htm:resetURL
       }
       sendEmail(data)
       res.json(token)


    }catch(error){
        throw new Error(error)
    }
})
const resetPassword =asyncHandler( async (req, res)=>{
    const { password } = req.body;
    const { token } = req.params
    const hashedToken =crypto.createHash('sha256').update(token).digest("hex")
    const user =await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires:{ $gt :Date.now() },
    })
    if(!user) throw new Error("Token Expired , please try again later");
    user.password =password
    user.passwordResetToken= undefined;
    user.passwordResetExpires =undefined;
    await user.save()
    res.json(user);
    
})
const loginAdmin =asyncHandler(async (req,res)=>{
    const {email, password} =req.body;
    //console.log(email,password)
    const findAdmin =await User.findOne({ email });
    if (findAdmin.role !== 'admin') throw new Error('Not Authorised')
    if(findAdmin && await findAdmin.isPasswordMatched(password)){
        const refreshToken =await generaterefreshToken(findAdmin?._id);
        const updateUser =await User.findByIdAndUpdate(findAdmin.id,{
            refreshToken:refreshToken,

        },
        {
            new:true
        }
        )
        res.cookie('refreshToken',refreshToken,{
            httpOnly:true,
            maxAge:72 * 60 * 60 * 1000,
        }
        )
        res.json({
            _id: findAdmin?._id,
            firstname: findAdmin?.firstname,
            lastname: findAdmin?.lastname,
            email: findAdmin?.email,
            mobile:findAdmin?.mobile,
            token: generateToken(findAdmin?._id),

        })

    }else{
        throw new Error("invalid credentials")
    }

})

const getWishlist =asyncHandler( async (req, res)=>{
    const { _id } = req.user
    try{
        const findUser =await User.findById(_id).populate("wishlist")
        res.json(findUser)
    }catch(error){
        throw new Error(error)

    }
})
const saveAddress = asyncHandler( async (req, res)=>{
    const {_id}= req.user;
    validateMongoDbId(_id)
    try{
        const updateUser = await User.findByIdAndUpdate(
            _id,
            {
                address:req?.body?.address,
            },
            {
                new:true
            }
        )
        res.json(updateUser)
    }catch(error){
        throw new Error(error)

    }
})

const useCart = asyncHandler(async (req, res) => {
    try {
      const { cart } = req.body;
      const { _id } = req.user;
      validateMongoDbId(_id);
  
      let products = [];
      const user = await User.findById(_id);
      const alreadyExistCart = await Cart.findOne({ orderby: user._id });
      if (alreadyExistCart) {
        await alreadyExistCart.remove();
      }
  
      for (let i = 0; i < cart.length; i++) {
        const productObject = {
          product: cart[i]._id,
          count: cart[i].count,
          color: cart[i].color,
        };
  
        const getPrice = await Product.findById(cart[i]._id).select("price").exec();
  
        // Check if getPrice is null
        if (getPrice === null) {
          console.error(`Product with ID ${cart[i]._id} not found.`);
          
        } else {
          // Access the price property
          productObject.price = getPrice.price;
        }
  
        products.push(productObject);
      }
  
      let cartTotal = 0;
      for (let i = 0; i < products.length; i++) {
        cartTotal += products[i].price * products[i].count;
      }
      let newCart =await new Cart({
        products,
        cartTotal,
        orderby:user?._id,
      }).save()
      res.json(newCart)
      
    } catch (error) {
      throw new Error(error);
    }
  });

  const getUserCart = asyncHandler( async (req, res)=>{
    const { _id } =req.user;
    validateMongoDbId(_id)
    try{
        const cart =await Cart.findOne({ orderby:_id }).populate(
            "products.product"
        )
        res.json(cart)
    }catch(error){
        throw new Error(error)
    }
  })
  const emptyCart = asyncHandler( async (req, res)=>{
    const { _id } = req.user;
    validateMongoDbId(_id);
    try{
        const user =await User.findOne({ _id })
        const cart = await Cart.findOneAndRemove({ orderby: user._id })
    }catch(error){
        throw new Error(error)
    }
  })

  const applyCoupon = asyncHandler( async (req, res)=>{
    const { coupon } = req.body;
    const { _id }= req.user
    const validCoupon = await Coupon.findOne({ name: coupon })
    if(validCoupon === null){
        throw new Error("Invalid Coupon")
    }
    const user = await User.findOne({ _id });
    let {cartTotal } = await Cart.findOne({
        orderby: user._id,
    }).populate("products.product")
    let totalAfterDiscount=( cartTotal -(cartTotal * validCoupon.discount)/100).toFixed(2)
    await Cart.findOneAndUpdate(
        {orderby: user._id},
        {totalAfterDiscount},
        {new: true}
    )
    res.json(totalAfterDiscount)
  })

  const createOrder = asyncHandler(async (req, res) => {
    const { COD, couponApplied } = req.body;
    const { _id } = req.user;
    validateMongoDbId(_id);

    try {
        if (!COD) {
            throw new Error("Create cash order failed");
        }
        const user = await User.findById(_id);
        const userCart = await Cart.findOne({ orderby: user._id });

        // Check if userCart is null
        if (!userCart) {
            throw new Error("User cart not found");
        }

        // Calculate final amount based on couponApplied and userCart
        let finalAmount = 0;
        if (couponApplied && userCart.totalAfterDiscount) {
            finalAmount = userCart.totalAfterDiscount;
        } else {
            finalAmount = userCart.cartTotal * 100;
        }

        // Create a new order
        const newOrder = await new Order({
            products: userCart.products,
            paymentIntent: {
                id: uniqid(),
                method: "COD",
                amount: finalAmount,
                status: "Cash On Delivery",
                created: Date.now(),
                currency: "IND",
            },
            orderby: user._id,
            orderStatus: "Cash On Delivery",
        }).save();

        // Update product quantities and sold counts
        const update = userCart.products.map((item) => ({
            updateOne: {
                filter: { _id: item.product._id },
                update: { $inc: { quantity: -item.count, sold: +item.count } },
            },
        }));
        const updated = await Product.bulkWrite(update, {});

        res.json({ message: "success" });
    } catch (error) {
        // Handle the error appropriately (log it, send an error response, etc.)
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});
const getOrders =asyncHandler( async (req, res)=>{
    const { _id } = req.user;
    validateMongoDbId(_id);
    try{
        const userorders =await Order.findOne({ orderby: _id })
        res.json(userorders)
    }catch(error){
        throw new Error(error)

    }
})
const updateOrderStatus = asyncHandler( async ( req, res) =>{
    const { status } = req.body;
    const { id }= req.params
    validateMongoDbId(id);
    try{
        const updateOrder = await Order.findByIdAndUpdate(
            id,
            { orderStatus: status ,
            paymentIntent:{
                status:status,
            },
        },
            { new:true }
        )
        res.json(updateOrder )
    }catch(error){
        throw new Error(error)
    }
    
})



module.exports = {
    createUser, 
    loginUserCtrl,
     getallUser, 
     getaUser, 
     deleteUser,
      UpdateUser,
      blockUser,
      unblockUser,
      handleRefreshToken,
      logout,
      updatePassword,
      forgetPasswordToken,
      resetPassword,
      loginAdmin,
      getWishlist,
      saveAddress,
      useCart,
      getUserCart,
      emptyCart,
      applyCoupon,
      createOrder,
      getOrders,
      updateOrderStatus
      
     }
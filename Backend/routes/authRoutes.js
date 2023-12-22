const express =require("express")
const router =express.Router();
const {createUser, loginUserCtrl, getallUser, getaUser, deleteUser, UpdateUser, blockUser,
     unblockUser, handleRefreshToken, logout, updatePassword, forgetPasswordToken, resetPassword, loginAdmin, getWishlist, saveAddress, 
     useCart, getUserCart, emptyCart, applyCoupon, createOrder, getOrders, updateOrderStatus } =require('../controller/userCtrl');
const {authMiddleware, isAdmin} = require("../middleware/authMiddleware");




router.post("/register",createUser);
router.put('/password',authMiddleware,updatePassword)
router.post("/forgotpasswordtoken",forgetPasswordToken)
router.put("/resetpassword/:token",resetPassword)
router.get("/orders",authMiddleware,getOrders)
router.put("/orders/:id",authMiddleware,isAdmin,updateOrderStatus)


router.post("/cart",authMiddleware,useCart)
router.get("/cart",authMiddleware,getUserCart)
router.delete("/emptycart",authMiddleware, emptyCart)
router.post("/cart/applycoupon", authMiddleware, applyCoupon)
router.post("/cart/cashorder",authMiddleware,createOrder)



router.post("/login",loginUserCtrl)
router.post('/adminlogin',loginAdmin)
router.get("/wishlist",authMiddleware, getWishlist)
router.post("/saveaddress",authMiddleware,saveAddress)
router.get('/allusers', getallUser)
router.get('/refresh',handleRefreshToken)
router.get('/logout',logout)
router.get('/:id',authMiddleware,isAdmin,getaUser)
router.delete('/:id',deleteUser)
router.put('/edit_user',authMiddleware,UpdateUser)
router.put('/block_user/:id',authMiddleware,isAdmin,blockUser)
router.put('/unblock_user/:id',authMiddleware,isAdmin,unblockUser)



module.exports =router
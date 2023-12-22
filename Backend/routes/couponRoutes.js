const express = require("express")
const { createCoupon, getAllcoupon, Updatecoupon, Deletecoupon } = require("../controller/couponCtrl")
const router =express.Router()
const { isAdmin , authMiddleware }= require("../middleware/authMiddleware")


router.post("/",authMiddleware, isAdmin, createCoupon)
router.get("/",authMiddleware, isAdmin, getAllcoupon)
router.put("/:id",authMiddleware, isAdmin, Updatecoupon)
router.delete("/:id",authMiddleware, isAdmin,Deletecoupon)


module.exports =router
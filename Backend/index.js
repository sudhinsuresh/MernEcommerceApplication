const express =require("express");
const dbConect = require("./config/dbConnect");
const slugify =require("slugify")
const app =express()
const dotenv = require("dotenv").config()
const bodyParser =require("body-parser")
const morgan =require("morgan")
const { notFound, errorHandler } = require('./middleware/errorHandler');
const cookieParser =require("cookie-parser")
const PORT =process.env.PORT || 4000;
const productRouter =require('./routes/productRoutes')
const blogRouter =require('./routes/blogRoutes')
const categoryRouter =require("./routes/categoryRoutes")
const blogcategory =require("./routes/blogcatRoutes")
const brandRouter =require("./routes/brandRoutes")
const couponRouter =require("./routes/couponRoutes")
dbConect()
app.use(morgan())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false}))
app.use(cookieParser())
const authRouter =require('./routes/authRoutes')


app.use('/api/user',authRouter)
app.use("/api/product",productRouter)
app.use("/api/blog",blogRouter)
app.use("/api/category",categoryRouter )
app.use("/api/blogcategory",blogcategory)
app.use("/api/brand",brandRouter)
app.use("/api/coupon",couponRouter)


app.use(notFound)
app.use(errorHandler)
app.listen(PORT,()=>{
    console.log(`Server is running at PORT ${PORT}`)
})
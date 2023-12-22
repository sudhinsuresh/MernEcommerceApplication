const mongoose =require("mongoose")

const dbConect =()=>{
    try{
        const conn= mongoose.connect(process.env.MONGODB_URL)
        console.log("Mongodb is connected")

    }catch(error){
        console.log(error)
    }
}

module.exports= dbConect;
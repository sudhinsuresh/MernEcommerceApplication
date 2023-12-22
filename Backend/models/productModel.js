const mongoose = require('mongoose'); 


var productSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true,
        trim:true,
    },
    slug:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
    },
    description:{
        type:String,
        required:true,
        
    },
    price:{
        type:Number,
        required:true,
    },
    category:{
        type:String,
        required:true,
    },
    qunatity:{
        type:Number,
        required:true,
        
    },
    sold:{
        type:Number,
        default:0,
        
    },
    brand:{
        type:String,
        required:true,
    },
    images:[],
    color:{
        type:String,
        required:true,
    },
    ratings:[
        {
            star:Number,
            comment:String,
            postedby:{type:mongoose.Schema.Types.ObjectId, ref:'User'},
        }
    ],
    totalrating:{
        type:String,
        default:0,
    },

},{
    timestamps:true
});

//Export the model
module.exports = mongoose.model('Product', productSchema);
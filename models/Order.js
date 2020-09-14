const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    product:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Product',
        required:true
    },
    quantity:{
        type:Number,
        default:1
    },
    date:{
        type:Date,
        required:true,
    },
    delivered:{
        type:Boolean,
        default:false
    }
})
module.exports = mongoose.model('Order',orderSchema)
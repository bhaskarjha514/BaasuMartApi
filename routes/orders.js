const express = require('express')
const router = express()
const mongoose = require('mongoose')
const Order = require('../models/Order')
const Product = require('../models/Products')


// Handling Get Request to /orders
router.get('/',async(req, res, next)=>{
    Order.find()
    .select("product quantity _id")
    .populate('product','name price')
    .exec()
    .then(doc=>{
        if(doc.length>0) return res.status(200).json({success:true, message:doc, msg: "List of Orders"})
        else return res.status(404).json({success:true, message: "Cart is Empty", msg: doc})
    })
    .catch(err=>{
        return res.status(200).json({success:false, message:"Something went wrong", msg: err})
    })
})

router.get('/addorder',async(req, res, next)=>{
    const is_exist = await Product.findById(req.query.productId)
    if(is_exist){
        const order = new Order({
            _id: mongoose.Types.ObjectId(),
            product:req.query.productId,
            quantity:req.query.price
        })
        await order.save().then(result => {
            return res.status(200).json({success:true, message: "Order Placed", msg: result})
        }).catch(err => {
            return res.status(400).json({success:false, message: "Couldn't Placed Order" ,msg: err})
        })
    }else{
        return res.status(500).json({
            success:false,
            message:'Product not available'
        })
    }
})

router.get('/:orderId',async(req, res, next)=>{
    const id = req.params.orderId;
    Order.findById(id)
    .populate('product')
    .exec()
    .then(doc=>{
        if(doc) return res.status(200).json({success:true, message: doc, msg: "Got Order Detail"})
        else return res.status(500).json({success:false, message:"Order Not Found", msg: doc})
    })
    .catch(err=>{
        return res.status(500).json({success:false, message: "Order not found", msg: err})
    })

})

router.delete('/:orderId',async(req, res, next)=>{
    const id = req.params.orderId
    await Order.remove({_id:id}).exec()
    .then(result=>{
        return res.status(200).json({success:true, message: "Order Removed", msg: result})
    })
    .catch(err=>{
        return res.status(500).json({success:false, message: "something went wrong", msg: err})
    })
})

module.exports = router
const express = require('express')
const router = express()
const mongoose = require('mongoose')
const Order = require('../models/Order')
const Product = require('../models/Products')
const User = require('../models/User')
const confirmOrder = require('../utils/ConfirmOrder')


// Handling Get Request to /orders
router.get('/',async(req, res, next)=>{
    Order.find()
    .select("user product quantity _id")
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
    const user_exist = await User.findById(req.query.userId)
    
    if(is_exist && user_exist){
        const userAcc = await User.findOne({'_id':req.query.userId})
        const productName = is_exist.name
        const order = new Order({
            _id: mongoose.Types.ObjectId(),
            user:req.query.userId,
            product:req.query.productId,
            quantity:req.query.price,
            date: new Date(),
            delivered:false  
           
        })
        await order.save().then(result => {
            const output = `
            <p>Welcome To BaasuMart , You placed a order for</p>
            <p>This Product ${productName}</p>
        `;
            msg = confirmOrder.mailer(userAcc.email,productName,output)
            if(msg){
                return res.status(200).json({success:true, message: "Order Placed", msg: result,detailMsg:"couldn't sent email"})
            }
            return res.status(200).json({success:true, message: "Order Placed", msg: result,detailMsg:'sent email too'})
           
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
router.get('/delivered', async(req, res, next)=>{
    const orderId = req.query.orderId;
    
    const is_exist = await Order.findById({'_id':orderId})
    if(is_exist){
        
        const product = await Product.findById({'_id':is_exist.product})
        const userAcc = await User.findById({'_id':is_exist.user})

        mongoose.set('useFindAndModify', false);
        await Order.findOneAndUpdate({'_id':orderId},{'delivered':true})
        .then(result=>{
            const output = `
            <p>Welcome To BaasuMart , You placed a order for</p>
            <p>This Product ${product.name} which have been Successfully delivered</p>
        `;
       msg = confirmOrder.mailer(userAcc.email,product.name,output)
    //    if(msg) return res.status(200).json({success:true, message: "Order delivered", msg: "couldn't send mail"})
       return res.status(200).json({success:true, message: "Order delivered", msg: "sent mail too"})     
        })
        .catch(err=>{
            console.log("err"+err)
            return res.status(500).json({success:false, message: "Something went wrong", msg: err})
        })
    }else{
        return res.status(400).json({success:false, message: "Order not found"})
    }
   
})
router.get('/:orderId',async(req, res, next)=>{
    const id = req.params.orderId;
    Order.findById(id)
    .populate('product','user')
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
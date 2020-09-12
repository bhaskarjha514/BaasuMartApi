const express = require('express')
const router = express()
const mongoose = require('mongoose')
const multer = require('multer')
const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null,'./uploads/')
    },
    filename: function(req, file, cb){
        cb(null, Date.now() + '-' + file.originalname);
    }
})
const upload = multer({storage: storage})
const Product = require('../models/Products')


router.get('/',async(req, res, next)=>{
    Product.find()
    .select("name price _id productImage")
    .exec()
    .then(doc=>{
        if(doc.length>0) return res.status(200).json({success:true, message:doc, msg: "List of product"})
        else return res.status(404).json({success:true, message: "Product Not Found", msg: doc})
    })
    .catch(err=>{
        return res.status(200).json({success:false, message:"Something went wrong", msg: err})
    })
})

router.get('/addproduct',upload.single('productImage'),async(req, res, next)=>{
    const product = new Product({
        _id: mongoose.Types.ObjectId(),
        name:req.query.name,
        price:req.query.price,
        productImage: req.file.path
    })
    await product.save().then(result => {
        return res.status(200).json({success:true, message: "Product Saved", msg: result})
    }).catch(err => {
        return res.status(400).json({success:false, message: "Couldn't save" ,msg: err})
    })
})

router.get('/:productId',async(req, res, next)=>{
    const id = req.params.productId;
    Product.findById(id)
    .select("name price _id productImage")
    .exec()
    .then(doc=>{
        if(doc) return res.status(200).json({success:true, message: doc, msg: "Got Product"})
        else return res.status(500).json({success:false, message:"Product Not Found", msg: doc})
    })
    .catch(err=>{
        return res.status(500).json({success:false, message: "Product not found", msg: err})
    })

})

router.patch('/:productId',async(req, res, next)=>{
    const id = req.params.productId
    const updateOps = {};
    //either name or price
   
    for(const ops of req.body){
        updateOps[ops.propName] = ops.value
    }
    await Product.update({_id:id},{$set: updateOps})
    .exec()
    .then(result=>{
        return res.status(201).json({success:true, message: "Product updated", msg: result})
    })
    .catch(err=>{
        return res.status(500).json({success:false, message: "Couldn't update", msg: err})
    })
})

router.delete('/:productId',async(req, res, next)=>{
    const id = req.params.productId
    await Product.remove({_id:id}).exec()
    .then(result=>{
        return res.status(200).json({success:true, message: "Product Deleted", msg: result})
    })
    .catch(err=>{
        return res.status(500).json({success:false, message: "something wrong", msg: err})
    })
})

module.exports = router
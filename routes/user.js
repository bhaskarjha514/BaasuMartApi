const express = require('express')
const router = express.Router()
const mailer = require('../utils/SendMail')
const User = require('../models/User');
const Auth = require('../models/Auth')
const bcryptjs = require('bcryptjs');

router.get('/register',async (req, res, next)=>{

    const email = req.query.email
    const fpassword = req.query.password
    console.log(email+fpassword)
    try {
        let user_exist = await User.findOne({'email':email})
        if(user_exist){
            let checkAuth = await Auth.findOne({'email':email})
            if(checkAuth) return res.status(201).json({success:true, message:'Verify your Account'})
            return res.status(201).json({success:true, message:'Email Already used! Enter OTP'})
        }
        const salt = await bcryptjs.genSalt(10)
        const password = await bcryptjs.hash(fpassword, salt)
        
        const userData = new User({
            email,
            password
        })
        const authData = new Auth({
            email
        })
        await userData.save(async (err, response)=>{
        
            if(err) return res.status(400).json({ success:false,message: 'Server Fucked Up 😑😢' })
            await authData.save((err, response)=>{
                if (err) return res.status(400).json({success:false,message:'server fucked up'})
                return res.status(201).json({success:true,message:'verify Account! '})
            })
        })

    } catch (error) {
        console.log(error)
        res.status(404).json({
            success:false,
            message:'server error'
        })
    }
})

router.get('/login', async (req, res, next)=>{
    const email = req.query.email
    const password = req.query.password

    try{
        let user = await User.findOne({'email':email})
        if(!user){
            res.status(400).json({
                success: false,
                message: "Email not Registered"
            })
        }else{
            const isVerified = await user.isVerified
            if(!isVerified){
                res.status(400).json({success:false, message:'Email is not verified'})
            }else{
                const isMatch = await bcryptjs.compare(password,user.password)
                if(!isMatch){
                    return res.status(400).json({success:false, message:'wrong password'})
                }else{
                    return res.status(201).json({success:true, message:'successfully login',msg:user})
                }
            }
        }
    }catch(err){
        console.log(err)
        res.status(500).json({
            success: false,
            message:'server error'
        })
    }
})

router.get('/verify/', async (req, res) => {
    const code = req.query.code
    const email = req.query.email

    
    const acc = await Auth.findOne({'email':email})
   
    if(!(acc.code == code)){
        return res.status(400).json({success:false,message:'otp is incorrect'})
    }else{
        await Auth.findOneAndDelete({'email':email})
        await User.findOneAndUpdate({'email':email}, {'isVerified':true})
        return res.status(201).json({success:true,'message' : 'Account has verified'})
    }
})

router.get('/getotp',async (req, res, next)=>{
    const email = req.query.email
    let savedCred = await Auth.findOne({'email':email})
    if(!savedCred){
        return res.status(400).json({success:false, message: 'Register Email first'})
    }
    let code = generateOTP()
    
    let is_exist = await Auth.findOne({'email':email});
    
    const authData = new Auth({
        email,
        code
    }) 

    if(is_exist){
        // update the code
        msg = mailer.mailer(email, code)
        if(msg){
        return res.status(400).json({ success:false ,message : 'Cannot Send Otp ! Check your email and try again'})
    }
        await Auth.findOneAndUpdate({'email':email},{'code':code})
        return res.status(200).json({success:true, message:'Otp has been sent to mail'})
    }else{
        await authData.save((err, response)=>{
            if(err) return res.status(400).json({success:false, message:'server problem'})
            return res.status(200).json({success:true, message: 'Otp has been sent to email'})
        })
    }

})

router.get('/forgotpassword',async(req, res, next)=>{
    const email = req.query.email
    console.log('forgot password email'+email)

    try {
        let is_exist = await User.findOne({'email':email})
        if(is_exist){
            let code = generateOTP()
            const authData = new Auth({
                email,
                code
            })
        msg = mailer.mailer(email, code)
        if(msg){
        return res.status(400).json({ success:false ,message : 'Cannot Send Otp ! Check your email and try again'})
        }
        let exist_auth = await Auth.findOne({'email':email})
        if(exist_auth){
            await Auth.findOneAndUpdate({'email':email},{'code':code})
            return res.status(200).json({success:true, message:'OTP has been sent to email'})
        }
        await authData.save((err, response)=>{
            if(err) return res.status(400).json({success:false, message:'server problem'})
            return res.status(200).json({success:true, message:'OTP has been sent to email'})
        })
    }
    } catch (error) {
        console.log(error)
        res.status(400).json({success:false, message:'Something wrong'})
    }
})

router.get('/verifyotp',async(req, res, next)=>{
    const email = req.query.email
    const code = req.query.code

    let userAcc = await Auth.findOne({'email':email})
    if(userAcc.code == code){
        await Auth.findOneAndDelete({'email':email})
        return res.status(201).json({success:true,'message' : 'OTP has verified'})
    }
    return res.status(400).json({success:false, message:'Wrong OTP'})
})

router.get('/changepassword',async(req, res, next)=>{
    const email = req.query.email;
    const fpassword = req.query.password;

    const salt = await bcryptjs.genSalt(10)
    const password = await bcryptjs.hash(fpassword, salt)
    
    let is_exist = await User.findOne({'email':email})
    if(is_exist){
        await User.findOneAndUpdate({'email':email},{'password':password})
        return res.status(200).json({success:true, message:'Password changed successfully'})
    }
    return res.status(400).json({success:false, message:'Something wrong'})
})

function generateOTP() { 
    var digits = '0123456789'; 
    let OTP = ''; 
    for (let i = 0; i < 4; i++ ) { 
        OTP += digits[Math.floor(Math.random() * 10)]; 
    } 
    return OTP; 
}
module.exports = router;

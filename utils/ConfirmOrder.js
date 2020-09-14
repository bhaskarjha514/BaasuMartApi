const nodemailer = require('nodemailer')
const config = require('config')
let adminEmail = config.get('adminEmail')
let adminPassword = config.get('adminPassword')

const mailer = (email, productName, output) => {

    // The output message to be shown
   

    var transporter = nodemailer.createTransport({
        service : 'gmail',
        auth : {
            user: adminEmail, // Your Email
            pass: adminPassword // your password
        },
        tls: {
            rejectUnauthorized: false
        }
    })

    let mailOptions = {
        from: 'BaasuMart',
        to: email,
        subject: 'Order Placed',
        text: 'Your order have been successfully placed',
        html: output
    }

    try {
        transporter.sendMail(mailOptions, (err, info) => {
            if(err) console.log(err)
    
            console.log('Message sent: %s', info.messageId);
        })      
    } catch (error) {
       return 'Cannot send email' 
    }
}

module.exports = { mailer }
const express = require('express')
const connectDB = require('./config/db')

const userRoutes = require('./routes/user')
const productRoutes = require('./routes/products')
const orderRoutes = require('./routes/orders')

const app = express()
const PORT = process.env.PORT || 5000

app.use(express.json({ extended : true }))
app.use('/uploads',express.static('uploads'))

// connect to database
connectDB()

// routes
app.use('/api/baasumart/auth',userRoutes)
app.use('/api/baasumart/products', productRoutes)
app.use('/api/baasumart/orders',orderRoutes)

app.listen(PORT , () => console.log(`Server running at ${PORT}`))

//Hosted Api Uri = https://baasumart.herokuapp.com/
//Heroku bhaskarjha514@gmail.com
//MongDB- bassumarts@gmail.com
//NodeEmailer - starizontech3@gmail.com

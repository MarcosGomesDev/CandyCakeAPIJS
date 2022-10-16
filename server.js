require('dotenv').config();

require('./src/database')

const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')

const userRoutes = require('./src/routes/userRoutes')
const sellerRoutes = require('./src/routes/sellerRoutes')
const productRoutes = require('./src/routes/productRoutes')
const admRoutes = require('./src/routes/admRoutes');
const categoryRoutes = require('./src/routes/categoryRoutes');
const subCategoryRoutes = require('./src/routes/subCategoryRoutes')

const app = express()

app.use(cors())
app.use(cookieParser())
app.use(express.json())
app.use(userRoutes)
app.use(categoryRoutes)
app.use(subCategoryRoutes)
app.use(sellerRoutes)
app.use(productRoutes)
app.use(admRoutes)

app.listen(3003, (req, res) => {
    console.log('Server on')
})
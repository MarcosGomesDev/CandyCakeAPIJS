const express = require('express');
const category = require('../controllers/categoryController')
const {isAuthUser} = require('../middlewares/authUser')
const categoryRoutes = express.Router()

// PRODUCT ROUTES
categoryRoutes.get('/categories', category.index) // RETURN ALL PRODUCTS
categoryRoutes.post('category/new', isAuthUser, category.create)

module.exports = categoryRoutes
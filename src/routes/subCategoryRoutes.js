const express = require('express');
const subCategory = require('../controllers/subCategoryController')
const {isAuthUser} = require("../middlewares/authUser")
const subCategoryRoutes = express.Router()

// PRODUCT ROUTES
subCategoryRoutes.get('/subCategories', subCategory.index) // RETURN ALL PRODUCTS
subCategoryRoutes.post('/subcategory/new', isAuthUser, subCategory.create)
module.exports = subCategoryRoutes
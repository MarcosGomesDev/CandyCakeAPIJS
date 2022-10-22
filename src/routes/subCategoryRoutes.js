const express = require('express');
const subCategory = require('../controllers/subCategoryController')
const {isAuthUser} = require("../middlewares/authUser")
const subCategoryRoutes = express.Router()

// PRODUCT ROUTES
subCategoryRoutes.get('/subCategories', subCategory.index) // RETORNA TODAS AS SUBCATEGORIAS
subCategoryRoutes.post('/subcategory/new', isAuthUser, subCategory.create) // CRIA UMA NOVA CATEGORIA
module.exports = subCategoryRoutes
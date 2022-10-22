const express = require('express');
const category = require('../controllers/categoryController')
const {isAuthUser} = require('../middlewares/authUser')
const categoryRoutes = express.Router()

// PRODUCT ROUTES
categoryRoutes.get('/categories', category.index) // RETURNA TODAS AS CATEGORIAS
categoryRoutes.post('category/new', isAuthUser, category.create) // CRIA UMA NOVA CATEGORIA

module.exports = categoryRoutes
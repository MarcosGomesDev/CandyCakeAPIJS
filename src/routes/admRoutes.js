const express = require('express');
const category = require('../controllers/categoryController');
const subCategory = require('../controllers/subCategoryController')
const {isAuthUser} = require('../middlewares/authUser')

const admRoutes = express.Router()

//Category Routes by Admin
admRoutes.get('/categories', category.index)
admRoutes.post('/category/new', isAuthUser, category.create)
admRoutes.delete('/category/delete', isAuthUser, category.delete)

// subCategory by Admin
admRoutes.get('/subCategories', subCategory.index)
admRoutes.post('/subCategories/new', isAuthUser, subCategory.create)

module.exports = admRoutes
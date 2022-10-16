const express = require('express');
const product = require('../controllers/productController')
const {isAuthSeller} = require('../middlewares/authSeller');
const { isAuthUser } = require('../middlewares/authUser');
const upload = require('../middlewares/uploadImage')

const productRoutes = express.Router()

// PRODUCT ROUTES
productRoutes.get('/products', product.index) // RETURN ALL PRODUCTS
productRoutes.get('/products/search', product.search) // SEARCH ANY PRODUCT
productRoutes.get('/product/:id', product.oneProduct) // RETURN ONE PRODUCT
productRoutes.post('/product/create', isAuthSeller, upload.array('images', 3), product.create) // CREATE NEW PRODUCT
productRoutes.post('/product/:id/update', isAuthSeller, upload.array('images', 3), product.update) // UPDATE PRODUCT
productRoutes.post('/product/:id/rating', isAuthUser, product.addNewRating) // ADD NEW RATING
productRoutes.delete('/product/:id/rating/delete', isAuthUser, product.deleteRating) // DELETE RATING
productRoutes.post('/product/:id/rating/:ratingId', isAuthSeller, product.replyRating) // ADD REPLY RATING
productRoutes.put('/product/:id/rating/:ratingId', isAuthSeller, product.deleteReplyRating) // DELETE REPLY RATING
productRoutes.delete('/product/:id/delete', product.delete) // DELETE PRODUCT

module.exports = productRoutes
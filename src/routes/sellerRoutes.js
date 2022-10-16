const express = require('express');
const seller = require('../controllers/sellerController')
const {isAuthSeller} = require('../middlewares/authSeller')
const {isAuthUser} = require('../middlewares/authUser')
const upload = require('../middlewares/uploadImage')

const sellerRoutes = express.Router()

// SELLER ROUTES
sellerRoutes.get('/sellers', seller.index) // RETURN SELLERS
sellerRoutes.get('/seller/products', isAuthSeller, seller.productsBySeller)
sellerRoutes.get('/seller/:id', seller.selected) // RETURN SELLER
sellerRoutes.post('/sign-up/seller', seller.register) // CREATE NEW SELLER
sellerRoutes.post('/sign-in/seller', seller.login) // LOGIN SELLER
sellerRoutes.post('/seller/forgot-password', seller.forgotPassword) // SEND LINK TO RESET PASSSWORD
sellerRoutes.post('/seller/valid-token', seller.verifyToken) // VERIFY VALID TOKEN RESET PASSWORD
sellerRoutes.post('/seller/reset-password', seller.resetPassword) // RESET PASSWORD AND SAVE IN BD
sellerRoutes.post('/cep', seller.getLatLong)
sellerRoutes.post('/socialmedias', seller.insertSocialMedias) //INSERT SOCIAL MEDIAS OF SELLER
sellerRoutes.post('/seller/upload-profile', isAuthSeller, upload.single('avatar'), seller.uploadProfile) // SAVE PROFILE
sellerRoutes.delete('/seller/delete', isAuthSeller, seller.delete) // DELETE SELLER

module.exports = sellerRoutes
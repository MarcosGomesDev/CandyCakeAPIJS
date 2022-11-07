const express = require('express');
const seller = require('../controllers/sellerController')
const {isAuthSeller} = require('../middlewares/authSeller')
const {isAuthUser} = require('../middlewares/authUser')
const upload = require('../middlewares/uploadImage')

const sellerRoutes = express.Router()

// SELLER ROUTES

// RETORNA TODOS OS VENDEDORES (FEITO)
sellerRoutes.get('/sellers', seller.index)

// RETORNA O VENDEDOR PESQUISADO & SEUS PRODUTO (FEITO)
sellerRoutes.get('/seller/products', isAuthSeller, seller.sellerProducts)

// RETORNA O VENDEDOR LOGADO & SEUS PRODUTOS (FEITO)
sellerRoutes.get('/seller', isAuthUser, seller.selectedSeller)

// CRIA UM NOVO VENDEDOR (FEITO)
sellerRoutes.post('/sign-up/seller', seller.register)

// LOGIN VENDEDOR (FEITO)
sellerRoutes.post('/sign-in/seller', seller.login)

// ENVIA UM LINK COM REDEFINIÇÃO DE SENHA (FEITO)
sellerRoutes.post('/seller/forgot-password', seller.forgotPassword)

// VERIFICA SE O TOKEN DE REDEFINIÇÃO DE SENHA É VÁLIDO (FEITO)
sellerRoutes.post('/seller/valid-token', seller.verifyToken)

// ALTERA E SALVA A SENHA NOVA (FEITO)
sellerRoutes.post('/seller/reset-password/:token', seller.resetPassword)


sellerRoutes.post('/cep', seller.getLatLong)

// INSERE OS CONTATOS DE MÍDIA SOCIAIS DO VENDEDOR (FEITO)
sellerRoutes.post('/socialmedias', seller.insertSocialMedias)

// ATUALIZA A IMAGEM DO VENDEDOR (FEITO)
sellerRoutes.post('/seller/upload-profile', isAuthSeller, upload.single('avatar'), seller.uploadProfile)

// DELETA O VENDEDOR 
sellerRoutes.delete('/seller/delete', isAuthSeller, seller.delete)


module.exports = sellerRoutes
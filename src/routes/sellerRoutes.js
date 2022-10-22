const express = require('express');
const seller = require('../controllers/sellerController')
const {isAuthSeller} = require('../middlewares/authSeller')
const {isAuthUser} = require('../middlewares/authUser')
const upload = require('../middlewares/uploadImage')

const sellerRoutes = express.Router()

// SELLER ROUTES
sellerRoutes.get('/sellers', seller.index) // RETORNA TODOS OS VENDEDORES
sellerRoutes.get('/seller/products', isAuthSeller, seller.sellerProducts) // RETORNA O VENDEDOR PESQUISADO & SEUS PRODUTO
sellerRoutes.get('/seller', isAuthUser, seller.selectedSeller) // RETORNA O VENDEDOR LOGADO & SEUS PRODUTOS
sellerRoutes.post('/sign-up/seller', seller.register) // CRIA UM NOVO VENDEDOR
sellerRoutes.post('/sign-in/seller', seller.login) // LOGIN VENDEDOR
sellerRoutes.post('/seller/forgot-password', seller.forgotPassword) // ENVIA UM LINK COM REDEFINIÇÃO DE SENHA
sellerRoutes.post('/seller/valid-token', seller.verifyToken) // VERIFICA SE O TOKEN DE REDEFINIÇÃO DE SENHA É VÁLIDO
sellerRoutes.post('/seller/reset-password', seller.resetPassword) // ALTERA E SALVA A SENHA NOVA
sellerRoutes.post('/cep', seller.getLatLong)
sellerRoutes.post('/socialmedias', seller.insertSocialMedias) //INSERE OS CONTATOS DE MÍDIA SOCIAIS DO VENDEDOR
sellerRoutes.post('/seller/upload-profile', isAuthSeller, upload.single('avatar'), seller.uploadProfile) // ATUALIZA A IMAGEM DO VENDEDOR
sellerRoutes.delete('/seller/delete', isAuthSeller, seller.delete) // DELETA O VENDEDOR
module.exports = sellerRoutes
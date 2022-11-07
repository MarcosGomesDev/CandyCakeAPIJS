const express = require('express');
const user = require('../controllers/userController')
const upload = require('../middlewares/uploadImage')
const {isAuthUser} = require('../middlewares/authUser')

const userRoutes = express.Router();

// USER ROUTES

// RETORNA TODOS OS USUÁRIOS (FEITO)
userRoutes.get('/users', user.index)

// INSERE UM NOVO PRODUTO NA LISTA DE FAVORITOS DO USUÁRIO (FEITO)
userRoutes.post('/favorites/new', isAuthUser, user.addToFavorites)

// RETORNA TODOS OS PRODUTOS NA LISTA DE FAVORITOS DO USUÁRIO (FEITO)
userRoutes.get('/user/favorites', isAuthUser, user.allFav)

// CRIA UM NOVO USUÁRIO (FEITO)
userRoutes.post('/sign-up/user', user.register)

// LOGIN USUÁRIO (FEITO)
userRoutes.post('/sign-in/user', user.login)

// ENVIA UM LINK COM REDEFINIÇÃO DE SENHA (FEITO)
userRoutes.post('/user/forgot-password', user.forgotPassword)

// VERIFICA SE O TOKEN DE REDEFINIÇÃO DE SENHA É VÁLIDO (FEITO)
userRoutes.post('/user/valid-token', user.verifyToken)

// ALTERA E SALVA A SENHA NOVA (FEITO)
userRoutes.post('/user/reset-password/:token', user.resetPassword)

// SALVA A IMAGEM DE PERFIL DO USUÁRIO (FEITO)
userRoutes.post('/user/upload-profile', isAuthUser, upload.single('avatar'), user.uploadProfile)

// REMOVE UM PRODUTO DA LISTA DOS FAVORITOS DO USUÁRIO (FEITO)
userRoutes.delete('/favorites/delete', isAuthUser, user.removeFavorites)

// DELETA O USUÁRIO
userRoutes.delete('/user/delete', user.delete)

module.exports = userRoutes;
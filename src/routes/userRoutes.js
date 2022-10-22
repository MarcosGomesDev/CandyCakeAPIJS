const express = require('express');
const user = require('../controllers/userController')
const upload = require('../middlewares/uploadImage')
const {isAuthUser} = require('../middlewares/authUser')

const userRoutes = express.Router();

// USER ROUTES
userRoutes.get('/users', user.index) // RETORNA TODOS OS USUÁRIOS
userRoutes.post('/favorites/new', isAuthUser, user.addToFavorites) // INSERE UM NOVO PRODUTO NA LISTA DE FAVORITOS DO USUÁRIO
userRoutes.get('/user/favorites', isAuthUser, user.allFav) // RETORNA TODOS OS PRODUTOS NA LISTA DE FAVORITOS DO USUÁRIO
userRoutes.post('/sign-up/user', user.register) // CRIA UM NOVO USUÁRIO
userRoutes.post('/sign-in/user', user.login) // LOGIN USUÁRIO
userRoutes.post('/user/forgot-password', user.forgotPassword) // ENVIA UM LINK COM REDEFINIÇÃO DE SENHA
userRoutes.post('/user/valid-token', user.verifyToken) // VERIFICA SE O TOKEN DE REDEFINIÇÃO DE SENHA É VÁLIDO
userRoutes.post('/user/reset-password', user.resetPassword) // ALTERA E SALVA A SENHA NOVA
userRoutes.post('/user/upload-profile', isAuthUser, upload.single('avatar'), user.uploadProfile) // SALVA A IMAGEM DE PERFIL DO USUÁRIO
userRoutes.delete('/favorites/delete', isAuthUser, user.removeFavorites) // REMOVE UM PRODUTO DA LISTA DOS FAVORITOS DO USUÁRIO
userRoutes.delete('/user/delete', user.delete) // DELETA O USUÁRIO

module.exports = userRoutes;
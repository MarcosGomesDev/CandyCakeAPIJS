const express = require('express');
const product = require('../controllers/productController')
const {isAuthSeller} = require('../middlewares/authSeller');
const { isAuthUser } = require('../middlewares/authUser');
const upload = require('../middlewares/uploadImage')

const productRoutes = express.Router()

// ROTAS DO PRODUTO
productRoutes.get('/products', product.index) // RETURNA TODOS OS PRODUTOS
productRoutes.get('/products/search', product.search) // PROCURA POR PRODUTOS POR NOME
productRoutes.get('/product', isAuthUser, product.oneProduct) // RETORNA UM PRODUTO ESPECÍFICO
productRoutes.get('/product/:id/comments', isAuthUser, product.getAllCommentByProduct) // RETORNA TODOS OS COMENTÁRIOS DO PRODUTO
productRoutes.post('/product/create', isAuthSeller, upload.array('images', 3), product.create) // CRIA UM NOVO PRODUTO
productRoutes.post('/product/update', isAuthSeller, upload.array('images', 3), product.update) // ATUALIZA O PRODUTO
productRoutes.post('/:id/comment/new', isAuthUser, product.addNewRating) // INSERE UMA NOVA AVALIAÇÃO & COMENTÁRIO
productRoutes.delete('/product/:id/rating/delete', isAuthUser, product.deleteRating) // REMOVE A AVALIAÇÃO & COMENTÁRIO
productRoutes.post('/product/rating', isAuthSeller, product.replyRating) // INSERE UMA RESPOSTA AO COMENTÁRIO DO USUÁRIO
productRoutes.delete('/product/rating/:id', isAuthSeller, product.deleteReplyRating) // REMOVE A RESPOSTA DO VENDEDOR AO COMENTÁRIO DO USUÁRIO
productRoutes.delete('/product/delete', product.delete) // DELETA O PRODUTO

module.exports = productRoutes
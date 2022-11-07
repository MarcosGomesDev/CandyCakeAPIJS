const express = require('express');
const product = require('../controllers/productController')
const {isAuthSeller} = require('../middlewares/authSeller');
const { isAuthUser } = require('../middlewares/authUser');
const upload = require('../middlewares/uploadImage')

const productRoutes = express.Router()

// ROTAS DO PRODUTO

// RETURNA TODOS OS PRODUTOS (FEITO)
productRoutes.get('/products', product.index)

// PROCURA POR PRODUTOS POR NOME
productRoutes.get('/product/search', product.search)

// RETORNA UM PRODUTO ESPECÍFICO (FEITO)
productRoutes.get('/product', product.oneProduct)

// RETORNA TODOS OS COMENTÁRIOS DO PRODUTO (FEITO)
productRoutes.get('/product/:id/comments', product.getAllCommentByProduct)

// CRIA UM NOVO PRODUTO (FEITO)
productRoutes.post('/product/create', isAuthSeller, upload.array('images', 3), product.create)

// ATUALIZA O PRODUTO (FEITO)
productRoutes.post('/product/:id/update', isAuthSeller, upload.array('images', 3), product.update)

// INSERE UMA NOVA AVALIAÇÃO & COMENTÁRIO (FEITO)
productRoutes.post('/:id/comment/new', isAuthUser, product.addNewRating)

// REMOVE A AVALIAÇÃO & COMENTÁRIO (FEITO)
productRoutes.delete('/product/:id/rating/delete', isAuthUser, product.deleteRating)

// INSERE UMA RESPOSTA AO COMENTÁRIO DO USUÁRIO (FEITO)
productRoutes.post('/product/rating', isAuthSeller, product.replyRating)

// REMOVE A RESPOSTA DO VENDEDOR AO COMENTÁRIO DO USUÁRIO (FEITO)
productRoutes.delete('/product/rating/:id', isAuthSeller, product.deleteReplyRating)

// DELETA O PRODUTO (FEITO)
productRoutes.delete('/product/:id/delete', isAuthSeller, product.delete)

module.exports = productRoutes
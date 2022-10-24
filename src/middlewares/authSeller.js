const jwt = require('jsonwebtoken')
const Seller = require('../models/seller')

exports.isAuthSeller = async (req, res, next) => {
    if(req.headers && req.headers.authorization) {
        const token = req.headers.authorization.split(' ')[1]

        try {
            const decode = jwt.verify(token, process.env.SECRET)
            const sellerAuth = await Seller.findById(decode.sellerId)
            if(!sellerAuth) {
                return res.status(401).json('Autorização inválida do vendedor!')
            }

            req.sellerAuth = sellerAuth
            next()
        } catch (error) {
            if(error.name === 'JsonWebTokenError') {
                return res.status(400).json('Autorização inválida do vendedor!')
            }
            if(error.name === 'TokenExpiredError') {
                return res.status(413).json('Sessão expirada, por favor faça login')
            }
            return res.status(500).json('Internal server error')
        }

        
    } else {
        console.log('ta dizendo q n ta chegando o token')
        return res.status(400).json('Autorização inválida!')
    }
}
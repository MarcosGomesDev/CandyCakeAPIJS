const jwt = require('jsonwebtoken')
const User = require('../models/user')

exports.isAuthUser = async (req, res, next) => {
    if(req.headers && req.headers.authorization) {
        const token = req.headers.authorization.split(' ')[1]
        
        try {
            const decode = jwt.verify(token, process.env.SECRET)
            const userAuth = await User.findById(decode.userId)
            if(!userAuth) {
                return res.status(401).json('Autorização inválida do usuário!')
            }

            req.userAuth = userAuth
            next()
        } catch (error) {
            if(error.name === 'JsonWebTokenError') {
                return res.status(400).json('Autorização inválida do usuário!')
            }
            if(error.name === 'TokenExpiredError') {
                return res.status(413).json('Sessão expirada, por favor faça login')
            }
            return res.status(500).json('Internal Server Error')
        }
    } else {
        return res.status(400).json('Autorização inválida!')
    }
}
require('dotenv').config();

const User = require('../models/user')
const Product = require('../models/product')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const Token = require("../models/token");
const sendEmail = require("../utils/sendEmail")
const cloudinary = require('../helper/cloudinaryAuth')
const moment = require('moment');
const { request } = require('express');

var date = moment().format('LLL')

module.exports = {
    //READ USERS
    async index(req, res) {
        // GET ALL USERS
        try {
            const users = await User.find()
            
            return res.status(200).json(users)
            
        } catch (error) {
            return res.status(500).json('Internal Server Error')
        }
    },

    //CREATE USER
    async register(req, res) {
        const {name, email, password} = req.body

        //Validations
        if(!name) {
            return res.status(401).json('O nome é obrigatório!')
        }

        if(!email) {
            return res.status(401).json('O email é obrigatório!')
        }

        if(!password) {
            return res.status(401).json('A senha é obrigatória!')
        }

        // VERIFIED IF USER EXISTS
        const userExist = await User.findOne({email: email})

        if(userExist) {
            return res.status(401).json('Este email já está sendo utilizado!')
        }

        // HASHING THE PASSWORD
        const salt = await bcrypt.genSalt(12)
        const passwordHash = await bcrypt.hash(password, salt)

        // METHOD OF SAVE NEW USER
        const user = new User({
            name,
            email,
            password: passwordHash,
            admin: false,
            seller: false,
            createdAt: moment().format('LLL')
        });

        try {
            // SAVE NEW USER
            await user.save()

            // AFTER SAVE SHOW THIS
            return res.status(201).json('Úsuario criado com sucesso!')
        } catch (error) {
            // IF HAVE AN ERROR SHOW THIS
            console.log(error)
            return res.status(500).json('Erro ao criar usuário, tente novamente mais tarde!')
        }
    },

    // DELETE USER
    async delete(req, res) {
        const {user} = req

        if(!user) {
            return res.status(401).json( "Acesso não autorizado")
        }

        try {
            await User.findByIdAndDelete({_id: user._id})
            return res.status(200).json('Usuário deletado com sucesso')
        } catch (error) {
            return res.status(500).json('Erro ao deletar o usuário')
        }
    },

    // Login user
    async login(req, res) {
        const {email, password} = req.body
        //Validations
        if(!email) {
            return res.status(401).json('O email é obrigatório!')
        }
        
        //Check if user exists
        const user = await User.findOne({email: email})

        if(!user) {
            return res.status(401).json('Não existe nenhum usuário com este email!')
        }

        if(!password) {
            return res.status(401).json('A senha é obrigatória!')
        }
        try {
            //Check if password match
            const checkPassword = bcrypt.compare(password, user.password)
    
            if(!checkPassword) {
                return res.status(401).json('Senha inválida!')
            }   

            const secret = process.env.SECRET

            const token = jwt.sign({
                userId: user._id
            }, secret, {expiresIn: '1d'})

            return res.status(200).json({user, token})
        } catch (err) {
            console.log(err)
            return res.status(500).json('Erro ao logar usuário, tente novamente mais tarde!')
        }
    },

    // SEND LINK FOR RESET PASSWORD
    async forgotPassword(req, res) {
        const {email} = req.body

        try{
            if(!email) {
                return res.status(401).json('Por favor insira o email')
            }
    
            const user = await User.findOne({ email: email })

            if (!user) {
                return res.status(401).json("Nenhum usuário encontrado com este email");
            }
    
            const token = await Token.findOne({ userId: user._id });
    
            if(token !== null) {
                await Token.findByIdAndDelete({_id: token._id})
            }

            const sort = Math.floor(100000 + Math.random() * 900000)
            const newResetToken = await new Token({
                userId: user._id,
                token: sort,
                expiresIn: 300,
            }).save();

            const link = `${newResetToken.token}`;
            await sendEmail(user.email, "Redefinir senha"
                ,`Seu código de redefinição de senha é: ${link}`
            )
            
            return res.status(200).json("Token de redefinição de senha foi enviado ao email");
        } catch (error) {
            console.log('ta caindo nesse erro', error)
            return res.status(500).json("Algum erro ocorreu, tente novamente mais tarde");
        }
    },

    async verifyToken(req, res) {
        const {email} = req.query
        const {token} = req.body

        try {
            const user = await User.findOne({email: email})
    
            if (!user) {
                return res.status(401).json("Token inválido ou expirado!");
            }
    
            const verifyToken = await Token.findOne({
                userId: user._id,
                token: token,
            });
    
            if (!verifyToken) {
                return res.status(401).json("Token inválido ou expirado!");
            }

            return res.status(200).json('Token verificado!')
        } catch (error) {
            return res.status(500).json("Algum erro ocorreu, tente novamente mais tarde!");
        }
    },

    //RESET AND SAVE NEW PASSWORD
    async resetPassword(req, res) {
        const {password} = req.body
        const {token} = req.query

        try {
            if(!password) {
                return res.status(401).json("Por favor insira a senha!")
            }

            const userToken = await Token.findOne({token: token});

            if (!userToken) {
                return res.status(401).json("Token inválido ou expirado!");
            }

            const salt = await bcrypt.genSalt(12)
            const passwordHash = await bcrypt.hash(password, salt)

            User.findOneAndUpdate({_id: userToken.userId}, {password: passwordHash, updatedAt: date}, (updateErr) => {
                if(updateErr) {
                    return res.status(401).json('Erro ao alterar a senha')
                } else {
                    return res.status(200).json("Senha alterada com sucesso!");
                }
            })

            await userToken.delete()
        } catch (error) {
            return res.status(500).json("Algum erro ocorreu, tente novamente mais tarde!");
        }
    },

    //UPLOAD PROFILE
    async uploadProfile(req, res) {
        const {userAuth} = req
        
        if(!userAuth) {
            return res.status(401).json("Acesso não autorizado")
        }

        const user = await User.findOne({_id: userAuth._id})

        if(user.avatar === true) {
            await cloudinary.uploader.destroy(user.avatarId)
        }

        try {
            const result = await cloudinary.uploader.upload(req.file.path, {
                public_id: `${user._id}_profile`,
                width: 500,
                height: 500,
                crop: 'fill',
                folder: 'Avatars Users'
            })
            
            await User.findByIdAndUpdate(user._id, {
                avatar: result.secure_url,
                avatarId: result.public_id,
                updatedAt: date
            })
            
            return res.status(201).json({message: 'Imagem alterada com sucesso', avatar: result.secure_url})
        } catch (error) {
            console.log(error)
            return res.status(500).json('server error, try again')
        }

    },

    //RETURN ALL ITEMS IN FAVORITES LIST ON USER
    async allFav(req, res) {
        const {userAuth} = req

        try {
            const userExist = await User.findOne({_id: userAuth._id})
            .populate({path: 'favorites',
                populate: 'seller',
            })

            return res.status(200).json(userExist.favorites)
        } catch (error) {
            console.log(error)
            return res.status(500).json('Erro ao retornar os favoritos, tente novamente mais tarde!')
        }
    },

    //ADD NEW ITEM IN FAVORITES LIST ON USER
    async addToFavorites(req, res) {
        const {id, userId} = req.params

        try {
            const list = []
            
            const product = await Product.findOne({_id: id})
            .populate('category')
            .populate('subcategory')
            .populate('seller')

            list.push(product)
            
            await User.findOneAndUpdate({_id: userId},
                {
                    $push: {
                        favorites: list,
                    },
                    updatedAt: date
                }
            )

            return res.status(200).json('Produto adicionado aos favoritos com sucesso!')
        } catch (error) {
            return res.status(500).json('Erro ao adicionar aos favoritos, tente novamente mais tarde!')
        }
    },

    //REMOVE ITEM IN FAVORITES LIST ON USER
    async removeFavorites(req, res) {
        const {userAuth} = req
        const {productId} = req.query

        try {
            await User.findOneAndUpdate({_id: userAuth._id}, {
                $pull: {
                    favorites: productId
                },
                updatedAt: date
            })

            return res.status(200).json('removido da lista de favoritos')
        } catch (error) {
            console.log(error)
            return res.status(500).json('Erro ao remover dos favoritos, tente novamente mais tarde!')
        }
    },
};
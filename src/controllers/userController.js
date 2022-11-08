require('dotenv').config();

const User = require('../models/user')
const Product = require('../models/product')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const Token = require("../models/token");
const sendEmail = require("../utils/sendEmail")
const cloudinary = require('../helper/cloudinaryAuth')
const moment = require('moment');

var date = moment().format('LLL')

module.exports = {
    // RETONAR TODOS OS USUÁRIOS
    async index(req, res) {
        try {
            const users = await User.find()
            
            return res.status(200).json(users)
            
        } catch (error) {
            return res.status(500).json('Internal Server Error')
        }
    },

    // INSERE UM NOVO USUÁRIO
    async register(req, res) {
        const {name, lastname, email, password} = req.body

        // VALIDAÇÕES
        if(!name) {
            return res.status(401).json('O nome é obrigatório!')
        }

        if(!email) {
            return res.status(401).json('O email é obrigatório!')
        }

        if(!password) {
            return res.status(401).json('A senha é obrigatória!')
        }

        // VERIFICA SE O USUÁRIO EXISTE
        const userExist = await User.findOne({email: email})

        if(userExist) {
            return res.status(401).json('Este email já está sendo utilizado!')
        }

        // CRIPTOGRAFA A SENHA INSERIDA
        const salt = await bcrypt.genSalt(12)
        const passwordHash = await bcrypt.hash(password, salt)

        // MÉTODO PARA SALVAR UM NOVO USUÁRIO
        const user = new User({
            name,
            lastname,
            email,
            password: passwordHash,
            admin: false,
            seller: false,
            createdAt: moment().format('LLL')
        });

        try {
            // SALVANDO O NOVO USUÁRIO
            await user.save()

            return res.status(201).json('Úsuario criado com sucesso!')
        } catch (error) {
            console.log(error)
            return res.status(500).json('Erro ao criar usuário, tente novamente mais tarde!')
        }
    },

    // ATUALIZA OS DADOS DO USUARIO
    async updateUser(req, res) {
        const {userAuth} = req
        const {name, lastname, email} = req.body

        try {
            const user = await User.findById(userAuth._id)

            if(!user) {
                return res.status(400).json('Este usuário não existe!')
            }

            await user.updateOne({
                $set: {
                    name: name,
                    lastname: lastname,
                    email: email,
                    updatedAt: date
                }
            })

            return res.status(201).json('Dados atualizados com sucesso')

        } catch (error) {
            return res.status(500).json('Erro ao atualizar dados do usuário')
        }
    },

    // EXCLUÍ O USUÁRIO
    async delete(req, res) {
        const {userAuth} = req

        try {
            await User.findByIdAndDelete({_id: userAuth._id})
            return res.status(200).json('Usuário deletado com sucesso')
        } catch (error) {
            return res.status(500).json('Erro ao deletar o usuário')
        }
    },

    // LOGIN USUÁRIO
    async login(req, res) {
        const {email, password} = req.body
        //Validations
        if(!email) {
            return res.status(401).json('O email é obrigatório!')
        }
        
        //Check if user exists
        const user = await User.findOne({email: email}, 
            {name: 1, lastname: 1, email: 1, password: 1, avatar: 1, seller: 1, admin: 1})

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

            const data = {
                _id: user._id,
                name: user.name,
                lastname: user.lastname,
                email: user.email,
                avatar: user.avatar,
                seller: user.seller,
                admin: user.admin,
                token: token,
            }

            return res.status(200).json(data)
        } catch (err) {
            console.log(err)
            return res.status(500).json('Erro ao logar usuário, tente novamente mais tarde!')
        }
    },

    // ENVIA UM LINK COM O TOKEN PARA REDEFINIR A SENHA DO USUÁRIO
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
            console.log(link)
            await sendEmail(user.email, "Redefinir senha"
                ,`Seu código de redefinição de senha é: ${link}`
            )
            
            return res.status(200).json("Token de redefinição de senha foi enviado ao email");
        } catch (error) {
            console.log('ta caindo nesse erro', error)
            return res.status(500).json("Algum erro ocorreu, tente novamente mais tarde");
        }
    },

    // VERIFICA SE O TOKEN ESTÁ VÁLIDO PARA REDEFINIR A SENHA
    async verifyToken(req, res) {
        const {email, token} = req.body

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

    // ALTERA E SALVA A NOVA SENHA
    async resetPassword(req, res) {
        const {password} = req.body
        const {token} = req.params

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

    // ATUALIZA A FOTO DO PERFIL DO USUÁRIO
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

    // RETORNA TODOS OS PRODUTOS FAVORITOS DO USUÁRIO
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

    // ADICIONA UM PRODUTO A LISTA DE FAVORITOS DO USUÁRIO
    async addToFavorites(req, res) {
        const {userAuth} = req
        const {id} = req.body
        try {
            const list = []
            
            const product = await Product.findOne({_id: id})
            .populate('category')
            .populate('subcategory')
            .populate('seller')
            
            list.push(product)
            
            await User.findOneAndUpdate({_id: userAuth._id},
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

    // REMOVE UM PRODUTO DA LISTA DE FAVORITOS DO USUÁRIO
    async removeFavorites(req, res) {
        const {userAuth} = req
        const {id} = req.query

        try {
            await User.findOneAndUpdate({_id: userAuth._id}, {
                $pull: {
                    favorites: id
                },
                updatedAt: date
            })

            return res.status(200).json('Removido da lista de favoritos')
        } catch (error) {
            console.log(error)
            return res.status(500).json('Erro ao remover dos favoritos, tente novamente mais tarde!')
        }
    },
};
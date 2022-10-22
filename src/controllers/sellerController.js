require('dotenv').config();

const Seller = require('../models/seller')
const Product = require('../models/product')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const crypto = require("crypto")
const Token = require("../models/token");
const sendEmail = require("../utils/sendEmail")
const cloudinary = require('../helper/cloudinaryAuth')
const moment = require('moment')
const CepCoords = require('coordenadas-do-cep')
var date = moment().format('LLL')

module.exports = {
    // RETORNA TODOS OS VENDEDORES
    async index(req, res) {
        const sellers = await Seller.find().populate('products')
        return res.json(sellers)
    },

    // RETORNA PRO USUÁRIO O VENDEDOR E OS PRODUTOS DO MESMO
    async selectedSeller(req, res) {
        const {userAuth} = req
        const {id} = req.query

        try {
            const seller = await Product.find({seller: id}, {publicImages: 0, ratingSum: 0, description: 0, createdAt: 0})
            .populate({
                path: 'category',
                select: ['name']
            })
            .populate({
                path: 'subcategory',
                select: ['name']
            })
            .populate({
                path: 'seller',
                select: ['name', 'avatar']
            })

            return res.status(200).json(seller)
        } catch (error) {
            return res.status(500).json('Internal Server Error')
        }
    },

    // RETORNA OS PRODUTOS DO VENDEDOR LOGADO
    async sellerProducts(req, res) {
        const {sellerAuth} = req

        try {
            const products = await Product.find({seller: sellerAuth._id})
            .populate('seller')
            .populate('category')
            .populate('subcategory')

            return res.status(200).json(products)
        } catch (error) {
            return res.status(500).json(error)
        }
    },

    //CADASTRA UM NOVO VENDEDOR
    async register(req, res) {
        const {
            name,
            email,
            password,
            cep,
            logradouro,
            numero,
            complemento,
            bairro,
            localidade,
            UF
        } = req.body
        
        //Validations
        if(!name) return res.status(401).json('O nome é obrigatório!');

        if(!email) return res.status(401).json('O email é obrigatório!');

        if(!password) return res.status(401).json('A senha é obrigatória!');

        //VERIFICA SE O CEP DO ENDEREÇO FOI INSERIDO
        if(!cep) return res.status(401).json('O cep é obrigatório!');

        //VERIFICA SE O ENDEREÇO FOI INSERIDO
        if(!logradouro) return res.status(401).json('O nome da rua é obrigatório!');

        //VERIFICA SE O NÚMERO DO ENDEREÇO FOI INSERIDO
        if(!numero) return res.status(401).json('O número do endereço é obrigatório!');

        //VERIFICA SE O BAIRRO FOI INSERIDO
        if(!bairro) return res.status(401).json('O bairro é obrigatório!');

        //VERIFICA SE A CIDADE FOI INSERIDA
        if(!localidade) return res.status(401).json('A cidade é obrigatória!');

        //VERIFICA SE O ESTADO FOI INSERIDO
        if(!UF) return res.status(401).json('O estado é obrigatório!');
        try {
            // VERIFIED IF SELLER EXISTS
            const sellerExist = await Seller.findOne({email: email})

            if(sellerExist) {
                return res.status(401).json('Este email já está sendo utilizado!')
            }

            //OBTÉM A LATITUDE E LONGITUDE DO ENDEREÇO
            const info = await CepCoords.getByCep(cep)

            // HASHING THE PASSWORD
            const salt = await bcrypt.genSalt(12)
            const passwordHash = await bcrypt.hash(password, salt)

            // METHOD OF SAVE NEW SELLER
            const seller = new Seller({
                name,
                email,
                seller: true,
                admin: false,
                password: passwordHash,
                location: {
                    type: 'Point',
                    coordinates: [info.lon, info.lat],
                },
                address: [{
                    cep: cep,
                    street: logradouro,
                    number: numero,
                    complement: complemento,
                    neighborhood: bairro,
                    city: localidade,
                    state: UF
                }],
                createdAt: date
            });

            // SAVE NEW SELLER
            await seller.save()

            // AFTER SAVE SHOW THIS
            return res.status(201).json('Vendedor criado com sucesso!')
        } catch (error) {
            // IF HAVE AN ERROR SHOW THIS
            console.log(error)
            return res.status(500).json('Erro ao criar usuário, tente novamente mais tarde!')
        }
    },

    // DELETA A CONTA DO VENDEDOR
    async delete(req, res) {
        const {seller} = req
        try {
            
            const result = await Seller.findByIdAndDelete({_id: seller._id})

            let productsID = result.products.map((p) => p._id)

            await Product.deleteMany({
                _id: {
                    $in: productsID,
                }
            })
            
            return res.status(200).json('Usuário deletado com sucesso')
        } catch (error) {
            return res.status(500).json('Erro ao deletar o usuário')
        }
    },

    // LOGIN DO VENDEDOR
    async login(req, res) {
        const {email, password} = req.body

        //Validations
        if(!email) {
            return res.status(401).json('O email é obrigatório!')
        }
        
        //Check if SELLER exists
        const user = await Seller.findOne({email: email}, 
            {name: 1, email: 1, password: 1, avatar: 1, seller: 1, admin: 1})

        if(!user) {
            return res.status(401).json('Usuário não encontrado!')
        }

        if(!password) {
            return res.status(401).json('A senha é obrigatória!')
        }

        //Check if password match
        const checkPassword = await bcrypt.compare(password, user.password)

        if(!checkPassword) {
            return res.status(401).json('Senha inválida!')
        }

        try {
            const secret = process.env.SECRET

            const token = jwt.sign({
                sellerId: user._id
            }, secret, {expiresIn: '1d'})


            
            return res.status(200).json({user, token})

        } catch (err) {
            return res.status(500).json('Erro ao logar usuário, tente novamente mais tarde!')
        }
    },

    // ENVIA O LINK COM O TOKEN PARA REDEFINIR A SENHA
    async forgotPassword(req, res) {
        const {email} = req.body

        try{
            if(!email) {
                return res.status(401).json('Por favor insira o email')
            }

            const seller = await Seller.findOne({ email: email });
            if (!seller)
                return res.status(401).json("Nenhum usuário encontrado com este email");

            let token = await Token.findOne({ sellerId: seller._id });
            if (!token) {
                newResetToken = await new Token({
                    userId: seller._id,
                    token: crypto.randomBytes(32).toString("hex"),
                }).save();
            }

            const link = newResetToken.token;
            await sendEmail(user.email, "Redefinir senha"
                ,`Seu código de redefinição de senha é: ${link}`
            );

            return res.status(200).json("Token de redefinição de senha foi enviado ao email");
        } catch (error) {
            console.log(error);
            return res.status(500).json("Algum erro ocorreu, por favor tente novamente mais tarde");
        }
    },

    // VERIFICA SE O TOKEN INSERIDO PELO VENDEDOR É VÁLIDO
    async verifyToken(req, res) {
        const {email} = req.query
        const {token} = req.body

        try {
            const seller = await Seller.findOne({email: email})
    
            if (!seller) {
                return res.status(401).json("Token inválido ou expirado!");
            }
    
            const verifyToken = await Token.findOne({
                userId: seller._id,
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

    // MUDA E TROCA A SENHA POR UMA NOVA
    async resetPassword(req, res) {
        const {token} = req.query
        const {password} = req.body
        try {
            if(!password) {
                return res.status(401).json("Por favor insira a senha!")
            }

            const sellerToken = await Token.findOne({token: token})

            if (!sellerToken) {
                return res.status(401).json("Token inválido ou expirado!");
            }

            const salt = await bcrypt.genSalt(12)
            const passwordHash = await bcrypt.hash(password, salt)

            
            Seller.findOneAndUpdate({_id: sellerToken.userId}, {password: passwordHash, updatedAt: date}, (updateErr) => {
                if(updateErr) {
                    return res.status(401).json({msg: 'Erro ao alterar a senha'})
                } else {

                    return res.status(200).json({msg: "Senha alterada com sucesso!"});
                }
            })  
            await sellerToken   .delete();     
        } catch (error) {
            console.log(error);
            return res.status(500).json("Algum erro ocorreu, por favor tente novamente mais tarde");
        }
    },

    // INSERE A FOTO DA LOJA DO VENDEDOR
    async uploadProfile(req, res) {
        const {seller} = req
        if(!seller) {
            return res.status(401).json("Acesso não autorizado")
        }

        try {
            const result = await cloudinary.uploader.upload(req.file.path, {
                public_id: `${seller._id}_profile`,
                width: 500,
                height: 500,
                crop: 'fill'
            })
            
            await Seller.findByIdAndUpdate(seller._id, {
                avatar: result.secure_url,
                avatarId: result.public_id,
                updatedAt: date
            })

            return res.status(201).json('imagem alterada com sucesso!')
        } catch (error) {
            console.log('erro ao subir imagem', error)
            return res.status(500).json('Erro ao alterar a imagem, por favor tente novamente mais tarde!')
        }
    },

    // INSERE OS CONTATOS DO VENDEDOR
    async insertSocialMedias(req, res) {
        const {sellerAuth} = req
        const {instagram, whatsapp, facebook} = req.body

        try {
            await Seller.findByIdAndUpdate(sellerAuth._id, {
                $push: {
                    socialMedias: {
                        instagram: instagram,
                        whatsapp: whatsapp,
                        facebook: facebook
                    }
                }
            })

            return res.status(201).json('dados salvos com sucesso!')
        } catch (error) {
            return res.status(500).json('Internal Server Error')
        }
    },

    async getLatLong(req, res) {
        const {cep} = req.body

        try {
            const info = await CepCoords.getByCep(cep)
            const coords = [
                {lat: info.lat},
                {long: info.lon}
            ]
            return res.json(info)
        } catch (error) {
            console.log(error)
            return res.status(500).json('deu erro')
        }
    }
};
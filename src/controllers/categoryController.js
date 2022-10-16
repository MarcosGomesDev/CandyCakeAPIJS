require('dotenv').config()

const Category = require('../models/category')
const Product = require('../models/product')

module.exports = {
    async index(req, res) {
        const categories = await Category.find()

        return res.status(200).json(categories)
    },
    
    async create(req, res) {
        const {userAuth} = req
        const {name} = req.body
        
        if(!userAuth) {
            return res.status(401).json('Invalid authorization')
        }

        if(userAuth.admin != true) {
            return res.status(401).json('Invalid authorization, u are not administrator')
        }

        if(!name) {
            return res.status(401).json('Por favor insira a nova categoria!')
        }

        const categoryExist = await Category.findOne({name: name})

        if(categoryExist) {
            return res.status(401).json('Categoria já existente!')
        }

        try {
            const category = new Category({
                name: name,
                createdBy: userAuth._id
            })

            await category.save()
            return res.status(201).json('Categoria criada com sucesso')
        } catch (error) {
            return res.status(500).json('Erro ao criar a categoria, por favor tente novamente mais tarde!')
        }
    },

    async delete(req, res) {
        const {user} = req
        const cat = req.query

        if(user.admin != true) {
            return res.status(401).json('Autorização inválida!')
        }

        let query = {category: cat}
        let newObj = {$set: {category: null}}

        try {
            await Category.findByIdAndDelete({_id: cat})
            await Product.updateMany(query, newObj)

            return res.status(200).json('Categoria deletada com sucesso!')
        } catch (error) {
            return res.status(401).json('Erro ao deletar a categoria, por favor tente novamente mais tarde!') 
        }
    }
}
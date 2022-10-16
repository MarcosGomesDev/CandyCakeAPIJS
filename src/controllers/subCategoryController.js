require('dotenv').config()

const moment = require('moment')
const subCategory = require('../models/subCategory')
const Category = require('../models/category')

var date = moment().format('LLL')

module.exports = {
    async index(req, res) {
        const subCategories = await subCategory.find()

        return res.status(200).json(subCategories)
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
            return res.status(401).json('Por favor insira a sub categoria')
        }

        const subCategoryExist = await subCategory.findOne({name: name})

        if(subCategoryExist) {
            return res.status(401).json('sub Categoria já existente!')
        }

        try {
            const result = new subCategory({
                name: name,
                createdBy: userAuth._id,
                createdAt: date
            })
            
            await result.save()

            return res.status(201).json('Sub Categoria criada com sucesso')
        } catch (error) {
            return res.status(500).json('Internal Server Error')
        }
    }
}
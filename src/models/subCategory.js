const mongoose = require('mongoose')
const {Schema} = mongoose

const subCategorySchema = Schema({
    name: String,
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    createdAt: String
})

module.exports = mongoose.model('sub_category', subCategorySchema)
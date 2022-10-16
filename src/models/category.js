const mongoose = require('mongoose');
const {Schema} = mongoose;

const categorySchema = Schema({
    name: String,
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    createdAt: String
})

module.exports = mongoose.model('Category', categorySchema)
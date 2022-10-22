const mongoose = require('mongoose');
const {Schema} = mongoose
const PointSchema = require('../utils/pointSchema')

const sellerSchema = Schema({
    name: {type: String},
    lastName: {type: String},
    storeName: {type: String},
    email: {type: String},
    password: {type: String},
    avatar: {type: String},
    seller: {type: Boolean},
    avatarId: String,
    products: [{
        type: Schema.Types.ObjectId,
        ref: 'Product'
    }],
    location: {
        type: PointSchema,
        index: '2dsphere'
    },
    address: [{
        cep: {type: String},
        street: {type: String},
        number: {type: String},
        complement: {type: String},
        neighborhood: {type: String},
        city: {type: String},
        state: {type: String}
    }],
    socialMedias: [
        {
            instagram: {type: String},
            facebook: {type: String},
            whatsapp: {type: String}
        }
    ],
    createdAt: {type: String},
    updatedAt: {type: String}
});

module.exports = mongoose.model('Seller', sellerSchema);
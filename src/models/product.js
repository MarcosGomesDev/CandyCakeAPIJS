const mongoose = require('mongoose');
const {Schema} = mongoose;

const productSchema = Schema({
    name: String,
    description: String,
    price: String,
    category: {
        type: Schema.Types.ObjectId,
        ref: 'Category'
    },
    subcategory: {
        type: Schema.Types.ObjectId,
        ref: 'sub_category'
    },
    images: [String],
    publicImages: [String],
    seller: {
        type: Schema.Types.ObjectId,
        ref: 'Seller'
    },
    rating: [{
        userName: {type: String, default: ''},
        userId: {type: Schema.Types.ObjectId, ref: 'User'},
        productRating: {type: Number, default: 0},
        productReview: {type: String, default: ''},
        replyRating: [{
            sellerName: {type: String, default: ''},
            sellerId: {type: Schema.Types.ObjectId, ref: 'Seller'},
            replyReview: {type: String, default: ''}
        }]
    }],
    ratingNumbers: [Number],
    ratingSum: {type: Number, default: 0},
    ratingAverage: {type: Number, default: 0},
    createdAt: String,
    updatedAt: String
})

productSchema.index({'name': 'text', 'descrip': 'text'})
module.exports = mongoose.model('Product', productSchema)
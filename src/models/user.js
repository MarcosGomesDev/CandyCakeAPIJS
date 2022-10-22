const mongoose = require('mongoose');
const {Schema} = mongoose

const userSchema = new Schema({
    name: {type: String},
    lastname: {type: String},
    email: {type: String},
    password: {type: String},
    avatar: String,
    avatarId: String,
    seller: {type: Boolean},
    admin: Boolean,
    favorites: [{
        type: Schema.Types.ObjectId,
        ref: 'Product'
    }],
    createdAt: String,
    updatedAt: String
});

module.exports = mongoose.model('User', userSchema);
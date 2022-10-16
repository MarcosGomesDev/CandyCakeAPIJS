const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const moment = require('moment')

const tokenSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "user",
    },
    token: {
        type: Number,
        required: true,
    }
});

module.exports = mongoose.model("token", tokenSchema);
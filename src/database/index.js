require('dotenv').config();

const mongoose = require('mongoose');

mongoose.connect(process.env.URL)
    .then(() => {
        console.log('our db as connect')
    })
    .catch((err) => console.log(err))
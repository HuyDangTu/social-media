const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const nationalitySchema = mongoose.Schema({
    name: {
        type: String,
    },
    code:{
        type: String,
    }
});

const Nationality = mongoose.model('Nationality', nationalitySchema);
module.exports = { Nationality }


const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const policySchema = mongoose.Schema({
    content: {
        type: String,
        required: true,
    }
}, { timestamps: true });

const Policy = mongoose.model('Policy',  policySchema);
module.exports = { Policy }
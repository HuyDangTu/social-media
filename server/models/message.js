const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const messageSchema = mongoose.Schema({
    sentBy: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    sentTo:{
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    content: {
        type: String,
        required: true,
        maxlength: 1000
    },
    type:{
        type: String,
        required: true,
        maxlength: 1000
    }

}, { timestamps: true });

const Message = mongoose.model('Message', messageSchema);
module.exports = { Message }
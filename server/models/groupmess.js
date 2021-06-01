const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const groupmessSchema = mongoose.Schema({
    sentBy: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    sentTo:{
        type: Schema.Types.ObjectId,
        ref: "Group"
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
    },
    attachment:[{
        type: String,
        required: false,
        maxlength: 1000
    }]
},{ timestamps: true });

const Groupmess = mongoose.model('Groupmess', groupmessSchema);
module.exports = { Groupmess }
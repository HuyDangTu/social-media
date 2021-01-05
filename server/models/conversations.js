const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const conversationSchema = mongoose.Schema({
    user1: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    user2:{
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    messagelist: [{
        type: Schema.Types.ObjectId,
        ref: "Message"
    }],
    seenBy: [{
        type: Schema.Types.ObjectId,
        ref: "User"
    }],
    lastMess:{
        type: Schema.Types.ObjectId,
        ref: "Message"
    }
}, { timestamps: true });

const Conversation = mongoose.model('Conversation', conversationSchema);
module.exports = { Conversation }
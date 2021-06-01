const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const groupSchema = mongoose.Schema({
    user:[{
        type: Schema.Types.ObjectId,
        unique:true,
        ref: "User",
        
    }],
    messagelist: [{
        type: Schema.Types.ObjectId,
        ref: "Groupmess"
    }],
    seenBy: [{
        type: Schema.Types.ObjectId,
        ref: "User"
    }],
    lastMess:{
        type: Schema.Types.ObjectId,
        ref: "Groupmess"
    },
    title:{
        type: String,
        required: false,
        maxlength: 100
    },
    type:{
        type:String,
        required:false,
        maxlength:100
    },
    groupimg:{
        type:String,
        required:false,
        maxlength:100
    },
    lastMessageTimestamp:{
        type: Date,
        required:false
    },
    type:{
        type: String,
        required:false,
    }
}, { timestamps: true });

const Group = mongoose.model('Group', groupSchema);
module.exports = { Group }
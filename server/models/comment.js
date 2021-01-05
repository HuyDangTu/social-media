const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = mongoose.Schema({
    content: {
        type: String,
        required: true,
        maxlength: 1000
    },
    responds: [{
        content: {
            type: String,
            required: true,
            maxlength: 1000
        },
        likes: [{
            type: Schema.Types.ObjectId,
            ref: "User"
        }],
        postedBy: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },
        hiden: {
            required: true,
            default: false,
            type: Boolean
        },
    }],
    likes: [{
        type: Schema.Types.ObjectId,
        ref: "User"
    }],
    postedBy: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    hiden: {
        required: true,
        default: false,
        type: Boolean
    },
}, { timestamps: true });

const Comment = mongoose.model('Comment', commentSchema);
module.exports = { Comment }
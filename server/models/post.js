const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postSchema = mongoose.Schema({
    images: {
        type: Array,
        default: [],
    },
    description: {
        type: String,
        required: true,
        maxlength: 1000
    },
    userTag:[{
        type: Schema.Types.ObjectId,
        ref: "User" 
    }],
    comments: [{
        type: Schema.Types.ObjectId,
        ref: "Comment"
    }],
    likes: [{ 
        type: Schema.Types.ObjectId,
        ref: "User" 
    }],
    postedBy: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    hidden: [],
}, { timestamps: true });

const Post = mongoose.model('Post', postSchema);
module.exports = { Post }
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tagSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        maxlength: 100
    },
    posts:[{
        type: Schema.Types.ObjectId,
        ref: "Post"
    }],
    followers:[{
        type: Schema.Types.ObjectId,
        ref: "User"
    }]
})

const Tag = mongoose.model('Tag', tagSchema);
module.exports = { Tag }
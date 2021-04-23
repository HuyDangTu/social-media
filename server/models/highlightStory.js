const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const highlightStorySchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        default: "Nổi bật"
    },
    storyList:[{
        type: Schema.Types.ObjectId,
        ref: "Story",
        required: true,
    }],
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    disabled: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

const HighlightStory = mongoose.model('HighlightStory', highlightStorySchema);
module.exports = { HighlightStory }
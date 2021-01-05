const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const storySchema = mongoose.Schema({
    image: {
        type: String,
        required: true,
    },
    header: {
        type: String,
        required: true,
    },
    postedBy: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    viewedBy: [{
        type: Schema.Types.ObjectId,
        ref: "User",
    }]
}, { timestamps: true });

const Story = mongoose.model('Story', storySchema);
module.exports = { Story }
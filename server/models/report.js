const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reportSchema = mongoose.Schema({
    reportType:{
        type: String,
        required: true,
    },
    reportAbout: [{
        type: String,
        required: true,
    }],
    post: {
        type: Schema.Types.ObjectId,
        ref: "Post"
    },
    comment: {
        type: Schema.Types.ObjectId,
        ref: "Comment"
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    sentBy: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    status: {
        type: Boolean,
        required: true,
    },
}, { timestamps: true }
);

const Report = mongoose.model('Report', reportSchema);
module.exports = { Report }
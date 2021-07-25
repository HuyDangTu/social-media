const express = require("express");
var cors = require('cors')

const router = express.Router();
const app = express();
app.use(cors())
var bodyParser = require('body-parser');
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
const mailer = require('nodemailer');
const moment = require("moment");
const formidable = require('express-formidable');
const cloudinary = require('cloudinary');
const multer = require('multer');
const fs = require('fs');
var jsonParser = bodyParser.json();
var urlencodedParser = bodyParser.urlencoded({ extended: false });

const cookieParser = require('cookie-parser');
app.use(cookieParser());

app.use(express.static('client/build'))
require('dotenv').config();

const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
mongoose.Promise = global.Promise;

mongoose.connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

const { User } = require("../models/user");
const { Comment } = require('../models/comment');
const { Post } = require('../models/post');
const { Report } = require('../models/report');
const { Notification } = require('../models/notification');

const { auth } = require('../middleware/auth');
const { admin } = require('../middleware/admin');
function findPost(postId, userHiddenPost, blockedUsers) {
    console.log(userHiddenPost);
    const post = Post.aggregate([
        {
            "$match": { "_id": ObjectId(postId) }
        },
        {
            "$match": { "_id": { "$nin": userHiddenPost } }
        },
        {
            $lookup: { from: 'users', localField: 'postedBy', foreignField: '_id', as: 'postedBy' }
        },
        {
            $lookup: { from: 'users', localField: 'likes', foreignField: '_id', as: 'likes' }
        },
        {
            $lookup: { from: 'users', localField: 'userTag', foreignField: '_id', as: 'userTag' }
        },
        {
            $lookup: { from: 'comments', localField: 'comments', foreignField: '_id', as: 'comments' },
        },
        {
            $unwind: {
                path: "$comments",
                preserveNullAndEmptyArrays: true,
            }
        },
        {
            $lookup: { from: 'users', localField: 'comments.postedBy', foreignField: '_id', as: 'comments.postedBy' },
        },
        {
            "$project": {
                "_id": 1,
                "dateDifference": { $trunc: { $divide: [{ $subtract: [new Date(), "$createdAt"] }, 1000 * 60 * 60 * 24] } },
                "images": 1,
                "comments": {
                    "_id": 1,
                    "content": 1,
                    "likes": 1,
                    "postedBy": {
                        "_id": 1,
                        "userName": 1,
                        "avt": 1,
                    },
                    "hiden": 1,
                    "createdAt": 1,
                    "updatedAt": 1,
                },
                "likes": {
                    "_id": 1,
                    "avt": 1,
                    "userName": 1,
                },
                "userTag": {
                    "_id": 1,
                    "userName": 1,
                },
                "hidden": 1,
                "locationName": 1,
                "description": 1,
                "postedBy": {
                    "_id": 1,
                    "avt": 1,
                    "userName": 1,
                },
                "createdAt": 1,
                "updatedAt": 1,
            }
        }, {
            "$sort": { "comments.createdAt": -1 }
        },
        {
            "$group": {
                _id: '$_id',
                locationName: {$first :'$locationName'},
                description: { $first: '$description' },
                dateDifference: { $first: '$dateDifference' },
                images: { $first: '$images' },
                createdAt: { $first: '$createdAt' },
                updatedAt: { $first: '$updatedAt' },
                likes: { $first: '$likes' },
                userTag: { $first: '$userTag' },
                hidden: { $first: '$hidden' },
                postedBy: { $first: '$postedBy' },
                comments: {
                    $push: '$comments'
                }
            }
        }], function (err, post) {
            if (err) return {} 
            return post[0];
        }
    )
    return post;
}
function findComment(id){
    const comment = Comment.aggregate([
        {
            $match: { "_id": ObjectId(id) }
        },
        {
            $lookup: { from: 'users', localField: 'postedBy', foreignField: '_id', as: 'postedBy' }
        },
        {
            "$project": {
                "_id": 1,
                "dateDifference": { $trunc: { $divide: [{ $subtract: [new Date(), "$createdAt"] }, 1000 * 60 * 60 * 24] } },
                "content": 1,
                "postedBy": {
                    "_id": 1,
                    "avt": 1,
                    "userName": 1,
                },
                "likes": 1,
                "createdAt": 1,
            }
        }], function (err, comments) {
            if (err) return {}
            return comments[0];
        }
    )
    return comment;
}

function findComment(id){
    const comment = Comment.aggregate([
        {
            $match: { "_id": ObjectId(id) }
        },
        {
            $lookup: { from: 'users', localField: 'postedBy', foreignField: '_id', as: 'postedBy' }
        },
        {
            "$project": {
                "_id": 1,
                "dateDifference": { $trunc: { $divide: [{ $subtract: [new Date(), "$createdAt"] }, 1000 * 60 * 60 * 24] } },
                "content": 1,
                "postedBy": {
                    "_id": 1,
                    "avt": 1,
                    "userName": 1,
                },
                "likes": 1,
                "createdAt": 1,
            }
        }], function (err, comments) {
            if (err) return {}
            return comments[0];
        }
    )
    return comment;
}
function SaveNotification(notification) {
    if (JSON.stringify(notification.sentTo) != JSON.stringify(notification.sentFrom)) {
        Notification.create(notification, (err, data) => {
            if (err) {
                console.log(err)
            }
            else {
                console.log(data)
            }
        })
    }
}

router.post('/api/reports/getAll', auth, admin, (req, res) => {

    let limit = req.body.limit ? parseInt(req.body.limit) : 6;
    let skip = req.body.skip ? parseInt(req.body.skip) : 0;
    let filter = req.body.filter[0] == "all" ? ["post", "comment","user"] : req.body.filter;

    Report.aggregate([
        {
            $match: { "reportType": { "$in": filter } }
        },
        {
            $lookup: { from: 'posts', localField: 'post', foreignField: '_id', as: 'post' }
        },
        {
            $lookup: { from: 'comments', localField: 'comment', foreignField: '_id', as: 'comment' }
        },
        {
            $lookup: { from: 'users', localField: 'sentBy', foreignField: '_id', as: 'sentBy' }
        },
        {
            $lookup: { from: 'users', localField: 'userId', foreignField: '_id', as: 'userId' }
        },
        {
            $lookup: { from: 'users', localField: 'post.postedBy', foreignField: '_id', as: 'post.postedBy' },
        },
        {
            $lookup: { from: 'users', localField: 'comment.postedBy', foreignField: '_id', as: 'comment.postedBy' },
        },
        {
            "$project": {
                "_id": 1,
                "reportType": 1,
                "dateDifference": { $trunc: { $divide: [{ $subtract: [new Date(), "$createdAt"] }, 1000 * 60 * 60 * 24] } },
                "post": {
                    "_id": 1,
                    "postedBy": {
                        "_id": 1,
                        "userName": 1,
                        "avt": 1,
                    },
                },
                "userId": 1,
                "comment": {
                    "_id": 1,
                    "postedBy": {
                        "_id": 1,
                        "userName": 1,
                        "avt": 1,
                    },
                },
                "status": 1,
                "sentBy": {
                    "_id": 1,
                    "avt": 1,
                    "userName": 1,
                },
                "createdAt": 1,
                "updatedAt": 1,
            }
        },
        { "$sort": { createdAt: -1 } },
        { "$skip": skip },
        { "$limit": limit },
    ], function (err, reports) {
        console.log(reports);
        if (err) return res.status(400).send(err);
        res.status(200).json({
            reports: reports,
            size: reports.length
        });
    }
    )
})

router.post('/api/reports/getDetail', auth, admin, (req, res) => {
    Report.aggregate([
        {
            $match: { "_id": ObjectId(req.body.id) }
        },
        {
            $lookup: { from: 'policies', localField: 'reportAbout', foreignField: '_id', as: 'reportAbout' }
        },
        {
            $lookup: { from: 'users', localField: 'userId', foreignField: '_id', as: 'userId' }
        },
        {
            $lookup: { from: 'users', localField: 'sentBy', foreignField: '_id', as: 'sentBy' }
        },
        {
            "$project": {
                "_id": 1,
                "reportType": 1,
                "dateDifference": { $trunc: { $divide: [{ $subtract: [new Date(), "$createdAt"] }, 1000 * 60 * 60 * 24] } },
                "status": 1,
                "post": 1,
                "comment": 1,
                "userId": {
                    "_id": 1,
                    "userName": 1,
                    "email": 1,
                    "name": 1,
                    "lastname": 1,
                    "avt": 1,
                    "bio": 1,
                    "followers": 1,
                    "followings": 1,
                    "userName": 1,
                    "restrictedFunctions": 1,
                },
                "reportAbout": {
                    "content": 1,
                },
                "sentBy": {
                    "_id": 1,
                    "avt": 1,
                    "userName": 1,
                },
                "createdAt": 1,
                "updatedAt": 1,
            }
        }], function (err, reports) {
            if (err) return res.status(400).send(err);
            //console.log(report[0]);
            const report = reports[0];
            if(report.reportType == "user") {
                Post.find({ postedBy: reports[0].userId[0]._id })
                .populate("postedBy", "_id userName")
                .sort({ "createdAt": -1 })
                .exec((err, posts) => {
                    if (err) return res.status(422).json({ error: err })
                    res.status(200).json({
                            reportDetail: {
                                ...report,
                                posts
                            }
                        });
                })
            }else{
                if (report.reportType == "post") {
                    findPost(report.post, []).then((post) => {
                        console.log(post);
                        res.status(200).json({
                            reportDetail: {
                                ...report,
                                post: post
                            }
                        });
                    })
                } else {
                    findComment(report.comment).then((comment) => {
                        findPost(report.post, []).then((post) => {
                            res.status(200).json({
                                reportDetail: {
                                    ...report,
                                    comment: comment,
                                    post: post
                                }
                            })
                        });
                    })
                }
            }
        }
    )
})

router.put('/api/reports/updateReport', auth, admin, (req, res) => {
    Report.findByIdAndUpdate(req.body.id, {
        $set: { status: true }
    }, {
        new: true
    }).exec((err, report) => {
        if (err) res.status(400).json(err);
        const notification = new Notification({
            sentFrom: req.user._id,
            sentTo: report.sentBy,
            type: "discardReport",
            link: report.post,
            "seenStatus": false
        });
        SaveNotification(notification);
        res.status(200).json({ report });
    })
})

router.put('/api/reports/restrictUserFunction', auth, admin, async (req, res) => {

    const user = await User.findOne({_id: req.body._id})
    
    req.body.funcList.map(item=>{
        if(!user.restrictedFunctions.some(ele => ele.function == item.func)){
            user.restrictedFunctions.push({
                function: item.func,
                amountOfTime: moment().startOf('day').add(item.time,'days').valueOf(),
                assignedAt: Date.now(),
            })
        }
    })

    const updated = await user.save((err, user) => {
        if (err) return res.json({ success: false, message: "Lỗi! Vui lòng thử lại" })
        Report.findByIdAndUpdate(req.body.reportId, {
            $set: { status: true }
        }, {
            new: true
        }).exec((err, report) => {
            if (err) res.status(400).json(err);
            const notification = new Notification({
                sentFrom: req.user._id,
                sentTo: user._id,
                type: "restrictUserFunction",
                link: user._id,
                "seenStatus": false
            });
            SaveNotification(notification);
            return res.status(200).json({
                success: true,
                message: 'Thành công',
                restrictedFunctions: user.restrictedFunctions,
                report
            });
        })
    })
    
    console.log(updated);
})

router.put('/api/reports/deleteRestrictFunction', auth, admin, async (req, res) => {

    const user = await User.findOne({_id: req.body._id})
    user.restrictedFunctions.pull({
        _id: req.body.funcId
    })
    const updated = await user.save((err, doc) => {
        if (err) return res.json({ success: false, message: "Lỗi! Vui lòng thử lại" })
        return res.status(200).json({
            success: true,
            funcId: req.body.funcId,
            message: 'Thành công'
        })
    })
    console.log(updated);
})

router.post('/api/reports/delete_post', auth, admin, (req, res) => {
    Post.findByIdAndUpdate(req.body.postId, {
        $set: { hidden: true } }, {new: true })
    .exec((err,post) => {
        if (err) res.status(400).send(err);
        Report.findByIdAndUpdate(req.body.reportId, {
            $set: { status: true }
        }, {
            new: true
        }).exec((err, report) => {
            if (err) res.status(400).json(err);
            const notification = new Notification({
                sentFrom: req.user._id,
                sentTo: post.postedBy,
                type: "deletePost",
                link: report.post,
                "seenStatus": false
            });
            SaveNotification(notification);
            res.status(200).json({ report });
        })
    })
})

router.post('/api/reports/delete_comment', auth, admin, (req, res) => {
    // Comment.findByIdAndUpdate(req.body.commentId, {
    //     $set: { hiden: true }}, {new: true })
    Post.findByIdAndUpdate(req.body.postId, {
        $pull: { comments: req.body.commentId }
    }, {
        new: true
    })
    .exec((err, comment) => {
        if (err) res.status(400).send(err);
        Report.findByIdAndUpdate(req.body.reportId, {
            $set: { status: true }
        },{
            new: true
        }).exec((err, report) => {
            if (err) res.status(400).json(err);
            const notification = new Notification({
                sentFrom: req.user._id,
                sentTo: comment.postedBy,
                type: "deleteComment",
                link: report.post,
                "seenStatus": false
            });
            SaveNotification(notification);
            res.status(200).json({report});
        })
    })
})

function getReport(postId, userHiddenPost) {
    console.log(userHiddenPost);
    let limit = req.body.limit ? parseInt(req.body.limit) : 6;
    let skip = req.body.skip ? parseInt(req.body.skip) : 0;
    const post = Report.aggregate([
        {
            $lookup: { from: 'posts', localField: 'post', foreignField: '_id', as: 'post' }
        },
        {
            $lookup: { from: 'comments', localField: 'comment', foreignField: '_id', as: 'comment' }
        },
        {
            $lookup: { from: 'users', localField: 'sentBy', foreignField: '_id', as: 'sentBy' }
        },
        {
            $lookup: { from: 'users', localField: 'post.postedBy', foreignField: '_id', as: 'post.postedBy' },
        },
        {
            $lookup: { from: 'users', localField: 'comment.postedBy', foreignField: '_id', as: 'comment.postedBy' },
        },
        {
            "$project": {
                "_id": 1,
                "reportType": 1,
                "dateDifference": { $subtract: [new Date(), "$createdAt"] },
                "post": {
                    "_id": 1,
                    "postedBy": {
                        "_id": 1,
                        "userName": 1,
                        "avt": 1,
                    },
                },
                "comment": {
                    "_id": 1,
                    "postedBy": {
                        "_id": 1,
                        "userName": 1,
                        "avt": 1,
                    },
                },
                "userTag": {
                    "_id": 1,
                    "userName": 1,
                },
                "status": 1,
                "postedBy": {
                    "_id": 1,
                    "avt": 1,
                    "userName": 1,
                },
                "createdAt": 1,
                "updatedAt": 1,
            }
        },
        { "$sort": { createdAt: -1 } },
        { "$skip": skip },
        { "$limit": limit },
    ], function (err, post) {
        if (err) return {}
        return post[0];
    })
    return post;
}


module.exports = router;
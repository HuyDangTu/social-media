const express = require("express");
const app = express();
const router = express.Router();
require('dotenv').config();

const mongoose = require('mongoose');
const moment = require("moment");

mongoose.connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

const { Comment } = require('../models/comment');
const { Post } = require('../models/post');
const { Notification } = require('../models/notification');

const ObjectId = mongoose.Types.ObjectId;
const { auth } = require('../middleware/auth');

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

function isRestricted(restrictedFunctions, func){
    var today = moment().startOf('day').valueOf();
    console.log(restrictedFunctions.some(item => (item.function == func) && (item.amountOfTime>today)))
    if(restrictedFunctions.some(item => (item.function == func) && (item.amountOfTime>today))){
        return true
    }else{
        return false
    }
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

router.post('/api/posts/comment', auth, (req, res) => {
    if(!isRestricted(req.user.restrictedFunctions,"Comment")){
        const comment = Comment({
            content: req.body.content,
            responds: [],
            postedBy: req.user._id
        });
        comment.save((err, cmt) => {
            if (err) return res.json(err);
            Post.findByIdAndUpdate(req.body.postId, {
                $push: { comments: cmt._id }
            }, {
                new: true
            }).exec((err, post) => {
                if (err) res.status(400).json(err);

                findPost(req.body.postId, req.user.hiddenPost).then((post) => {
                    const notification = new Notification({
                        sentFrom: req.user._id,
                        sentTo: post[0].postedBy[0]._id,
                        type: "comment",
                        link: req.body.postId,
                        "seenStatus": false
                    });
                    SaveNotification(notification)
                    console.log(post);
                    res.status(200).json(post);
                })
            })
        })
    }else{
        res.status(200).json({restricted: true,restrictedFunction: req.user.restrictedFunctions.find(item => item.function == "Comment") });
    }
})

router.put('/api/posts/respond', auth, (req, res) => {

    const respond = {
        content: req.body.content,
        likes: [],
        postedBy: req.user._id,
        hiden: false
    };

    Comment.findByIdAndUpdate(req.body.commentId, {
        $push: { responds: respond }
    }, {
        new: true
    }).then((err, cmt) => {
        if (err) return res.json(err);
        res.status(200).json({
            cmt: cmt
        })
    })
})

router.put('/api/posts/likeComment', auth, (req, res) => {
    if(!isRestricted(req.user.restrictedFunctions,"Like")){
        Comment.findByIdAndUpdate(req.body.commentId, {
            $push: { likes: req.user._id }
        }, {
            new: true
        }).exec((err, comment) => {
            if (err) res.status(400).json(err);
            findPost(req.body.postId, req.user.hiddenPost).then((post) => {
                const notification = new Notification({
                    sentFrom: req.user._id,
                    sentTo: comment.postedBy._id,
                    type: "likecomment",
                    link: req.body.postId,
                    "seenStatus": false
                });
                SaveNotification(notification);
                console.log(post);

                res.status(200).json(post);
            })
        })
    }else{
        res.status(200).json({restricted: true});
    }
})

router.put('/api/posts/unLikeComment', auth, (req, res) => {

    if(!isRestricted(req.user.restrictedFunctions,"Like")){
        Comment.findByIdAndUpdate(req.body.commentId, {
            $pull: { likes: req.user._id }
        }, {
            new: true
        }).exec((err, comment) => {
            if (err) res.status(400).json(err);
            findPost(req.body.postId, req.user.hiddenPost).then((post) => {
                console.log(post);
                res.status(200).json(post);
            })
        })
    }else{
        res.status(200).json({restricted: true,restrictedFunction: req.user.restrictedFunctions.find(item => item.function == "Like")});
    }
})

router.put('/api/posts/deleteComment', auth, (req, res) => {
    Post.findByIdAndUpdate(req.body.postId, {
        $pull: { comments: req.body.commentId }
    }, {
        new: true
    }).exec((err, post) => {
        if (err) res.status(400).json(err);
        findPost(req.body.postId, req.user.hiddenPost).then((post) => {
            console.log(post);
            res.status(200).json(post);
        })
        // if (err) return 
        // Comment.remove({ "_id": ObjectId(req.body.commentId) })
        // .exec((err) => {
        // })
    });
})

module.exports = router;

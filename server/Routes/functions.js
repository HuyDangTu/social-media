const { User } = require("./models/user");
const { Comment } = require('./models/comment');
const { Post } = require('./models/post');
const moment = require("moment");

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

function findBlockedUsers(id){
    console.log(id)
    return result = User.aggregate([
        {
            "$match": { "_id": ObjectId(id) }
        },
        {
            "$project": {
                "blockedUsers": 1,
            }
        },
    ], function (err,user){
        if(err) return []
        return user
    })
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
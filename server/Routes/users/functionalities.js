const express = require("express");
var cors = require('cors')

const app = express();
const router = express.Router();
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


const { User } = require("../../models/user");
const { Post } = require('../../models/post');
const { Tag } = require('../../models/tag');
const { Notification } = require('../../models/notification');
const { Nationality } = require('../../models/nationality');
const {Group} = require('../../models/group');
const { auth } = require('../../middleware/auth');
const { sendEmail } = require('../../ultils/mail/index');

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

router.post('/api/users/getRecommendPost',auth,(req,res)=>{

    let limit = req.body.limit ? parseInt(req.body.limit) : 3;
    let skip = req.body.skip ? parseInt(req.body.skip) : 0;

    Tag.aggregate([
        {
            "$match": { "followers": { $elemMatch: { $eq: req.user._id } }}
        }
        ], function (err, tags) {
        if (err) return res.status(400).send(err);
        let posts = [];
        // lấy danh sách bài viết
        tags.map(item=>{
            posts=[...posts,...item.posts]
        })
        // Xóa id bị trùng
        const removedDuplicate = new Set(posts)
        const backToArray = [...removedDuplicate]
        // Lấy bài viết 
        Post.aggregate([
        {
            "$match": { "_id": { "$in": backToArray } }
        },
        {
            "$match": { "postedBy": { "$nin": req.user.blockedUsers } }
        },
        {
            "$match": { "postedBy": { "$nin": req.user.blockedUsers } }
        },
        {
            "$match": { "hidden": false }
        },
        {
            "$match": { "_id": { "$nin": req.user.hiddenPost } }
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
                    "content": 1,
                    "likes": 1,
                    "postedBy": {
                        "_id": 1,
                        "userName": 1,
                    },
                    "hiden": 1,
                    "createdAt": 1,
                    "updatedAt": 1,
                },
                "likes":
                {
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
        },
        {
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
        },
        { "$sort": { createdAt: -1 } },
        { "$skip": skip },
        { "$limit": limit },
        ], function (err, posts) {
            if (err) return res.status(400).send(err);
            res.status(200).json({
                posts,
                size: posts.length
            });
        })
    })
})

router.get('/api/users/blockedUsers', auth, (req, res) => {
    User.find({ "_id": { $in: req.user.blockedUsers } })
        .select('userName _id avt')
        .exec((err, users) => {
            console.log(err)
            if (err) return res.status(400).send(err);
            res.send(users);
        })
});

router.get('/api/users/profile/:id', auth, (req, res) => {
    User.findOne({ _id: req.params.id, _id: {$nin: req.user.blookedUsers} })
        .select('-password')
        .then((err,user) => {
            if(err) return res.status(400).json({success: false})
            else if(user) return res.status(200).json(user);
            else return res.status(200).json({success: false})
        })
})

router.get('/api/users/tagged/:id', auth, (req, res) => {
    Post.find({ userTag: req.params.id, hidden: {$eq: false}})
    .populate("userTag", "_id userName")
    .sort({ "createdAt": -1 })
    .exec((err, posts) => {
        if (err) {
            return res.status(422).json({ error: err })
        }
        res.json({ posts })
    })
})

router.post('/api/users/getSavedPost', auth, (req, res) => {

    Post.find({_id:{$in: req.user.saved}})
    .sort({ "createdAt": 0 })
    .exec((err, posts) => {
        if (err) return res.status(422).json({ error: err })
        res.status(200).json({posts})
    })
})

router.get('/api/users/posted/:id', auth, (req, res) => {
    Post.find({ postedBy: req.params.id })
    .populate("postedBy", "_id userName")
    .sort({ "createdAt": -1 })
    .exec((err, posts) => {
        if (err) {
            return res.status(422).json({ error: err })
        }
        res.json({ posts })
    })
})

router.put('/api/users/updatePrivate', auth, (req, res)=>{
    User.findByIdAndUpdate(req.user._id, { $set: { privateMode: req.body.privateMode } }, { new: true },
        (err, result) => {
            if (err) {
                return res.json({ success: false, message: "Đã xảy ra lỗi" })
            }
            else{
                return res.json({ success: true, message: "Đã đổi thành công" })
            }
        })
})

router.put('/api/users/updatepic', auth, (req, res) => {
    User.findByIdAndUpdate(req.user._id, { $set: { avt: req.body.url } }, { new: true },
        (err, result) => {
            if (err) {
                return res.json({ success: false, message: "Đã xảy ra lỗi" })
            }
            else{
                return res.json({ success: true, message: "Đã đổi thành công ảnh đại diện" })
            }
        })
})

router.post('/api/users/searchmess', auth, (req, res) => {

    let limit = req.body.limit ? parseInt(req.body.limit) : 3;
    let skip = req.body.skip ? parseInt(req.body.skip) : 0;

    const matchRegex = new RegExp(req.body.keyword);
    console.log(matchRegex)
    User.find({ userName: { $regex: matchRegex }, _id: {$nin: req.user.blockedUsers} })
        .skip(skip)
        .limit(limit)
        .select("_id avt userName blockedUsers")
        .exec((err, users) => {
            let filteredUsers = [...users]
            filteredUsers = filteredUsers.filter(item => 
                !item.blockedUsers.includes(req.user._id)
            )
            console.log(filteredUsers)
            Group.find({ $and: [ {title: { $regex: matchRegex }, user:{$in: req.user._id}}] })
                .skip(skip)
                .limit(limit)
                .select("_id title groupimg user")
                .exec((err, groups) => {
                    if (err) res.status(400).json(err);
                    res.status(200).json({ users: filteredUsers, groups });
                })
        })
})


router.put('/api/users/update/:id', auth, jsonParser, (req, res) => {
    let message = "", isValidUserName = false;
    User.findOne({ userName: req.body.userName.trim() }, (err, user) => {
        console.log(user)
        if (user) {
            if( JSON.stringify(user._id) == JSON.stringify(req.user._id))
            {
              isValidUserName = true;
            }
            else{
                message += "Username đã được sử dụng";
                isValidUserName = false;
            }
        } else {
            isValidUserName = true;
        }
    }).then(() => {
        if (isValidUserName) {
            User.findByIdAndUpdate(req.params.id,
                {
                    $set: {
                        userName: req.body.userName.trim(),
                        bio: req.body.bio,
                        name: req.body.name,
                        email: req.body.email.trim(),
                        privateMode: req.body.privateMode,
                        dob: req.body.dob,
                        nationality: req.body.nationality
                    }
                }, {
                new: false
            }, function (err, doc) {
                if (err) {
                    res.send(err)
                }
            }).then(result =>
                res.json({ success: true, message: "Thành công" })
            )
        }
        else {
            return res.json({ success: false, message: message });
        }
    })
})

router.put('/api/users/askfollow/:followId',auth,(req,res)=>{
    const notification = new Notification({
        sentFrom: req.user._id,
        sentTo: req.params.followId,
        type: "askfollow",
        link: req.user._id,
        "seenStatus": false
    });
    User.findByIdAndUpdate(req.params.followId,{
        $addToSet: {request: req.user._id }
    }, {
        new: true
    }) .populate("followers", "_id userName avt")
    .populate("followings", "_id userName avt")
   
    .then(results=>
        {
            res.json(results)
        })
    SaveNotification(notification);
})

router.put('/api/users/declinefollow/:id',auth,(req,res)=>{
    Notification.updateMany( 
        {"sentFrom": req.params.id, "sentTo":req.user._id  , "type": 'askfollow'},
        {
            $set:   { disabled:true}
        },
        {
            new:true
        }
    ).catch(err=>console.log(err))
    User.findByIdAndUpdate(req.user._id,{
        $pull:{request:req.params.id}
    }).exec((err,result)=>{
        if(err){
            console.log(err)
        }
        else{
            res.json('success')
            console.log(result)
        }
    })
})

router.put('/api/users/acceptfollow/:id',auth,(req,res)=>{
   
    Notification.updateMany( 
        {"sentFrom": req.params.id, "sentTo":req.user._id  , "type": 'askfollow'},
        {
            $set:   { disabled:true}
        },
        {
            new:true
        }
    ).catch(err=>console.log(err))
    const notification = new Notification({
        sentFrom: req.user._id,
        sentTo: req.params.id,
        type: "acceptfollow",
        link: req.user._id,
        "seenStatus": false
    });
    SaveNotification(notification);
    User.findByIdAndUpdate(req.params.id,{
        $addToSet:{followings:req.user._id}
    }).exec((err,result)=>{
        if(err){
            console.log(err)
        }
        else{
           
            console.log(result)
        }})
    User.findByIdAndUpdate(req.user._id,{
        $addToSet:{followers:req.params.id},
        $pull:{request:req.params.id}
    }).exec((err,result)=>{
        if(err){
            console.log(err)
        }
        else{
            res.json('success')
            console.log(result)
        }
    })
})

router.put('/api/users/undoaskfollow/:followId',auth,(req,res)=>{
    Notification.updateMany( 
        {"sentFrom": req.user._id , "sentTo": req.params.followId , "type": 'askfollow'},
        {
            $set:   { disabled:true}
        },
        {
            new:true
        }
    ).catch(err=>console.log(err))
    User.findByIdAndUpdate(req.params.followId,{
        $pull: {request: req.user._id }
    }, {
        new: true
    }) .populate("followers", "_id userName avt")
    .populate("followings", "_id userName avt")
    .then(results=>
        {
            res.json(results)
        })
    
})

router.put('/api/users/follow/:followId', auth, (req, res) => {
    if(!isRestricted(req.user.restrictedFunctions,"Follow")){
        User.findById(req.params.followId)
        User.findByIdAndUpdate(req.params.followId, {
            $push: { followers: req.user._id }
        }, {
            new: true
        })
            .populate("followers", "_id userName avt")
            .populate("followings", "_id userName avt")
            .populate("request", "_id userName avt")
            .then(results => {
                User.findByIdAndUpdate(req.user._id, {
                    $push: { followings: req.params.followId }
                }, { new: true })
                    .then(result => {
                        res.json(result)
                        const notification = new Notification({
                            sentFrom: req.user._id,
                            sentTo: req.params.followId,
                            type: "follow",
                            link: req.user._id,
                            "seenStatus": false
                        });
                        SaveNotification(notification);
                    }).catch(err => {
                        return res.status(422).json({ error: err })
                    })
            })
    }else{
        res.status(200).json({restricted: true,restrictedFunction: req.user.restrictedFunctions.find(item => item.function == "Follow") });
    }
})

router.put('/api/users/block/:id', auth,(req,res)=>{
    User.findOneAndUpdate(
        {"_id": req.user.id}, 
        {$pull: { followings: req.params.id, followers: req.params.id}, $push: { blockedUsers: req.params.id}},
        {new: true},
        (err, user) => {
            if (err) return res.status(400).json({success: false});
            User.findOneAndUpdate(
                {"_id": req.params.id}, 
                {$pull: { followers: req.user._id,followings: req.user._id }},
                { new: true}, (err, results) => {
                if (err) return res.status(400).json({success: false});
                return res.status(200).json({ success: true, userId: req.params.id })
            })
        })
})

router.put('/api/users/unblock/:id', auth,(req,res)=>{
    User.findOneAndUpdate(
        {"_id": req.user.id}, 
        {$pull: { blockedUsers: req.params.id}},
        {new: true},
        (err, user) => {
            if (err) return res.status(400).json({success: false});
            return res.status(200).json({ success: true, userId: req.params.id })
        })
})

router.put('/api/users/unfollow/:unfollowId', auth, (req, res) => {
    if(!isRestricted(req.user.restrictedFunctions,"Follow")){
        User.findByIdAndUpdate(req.params.unfollowId, {
            $pull: { followers: req.user._id }
        }, {
            new: true
        }, (err, results) => {
            if (err) {
                return res.status(422).json({ error: err })
            }
            User.findByIdAndUpdate(req.user._id, {
                $pull: { followings: req.params.unfollowId }
            }, { new: true })
                .then(result => {
                    res.json(result)
                }).catch(err => {
                    return res.status(422).json({ error: err })
                })
        })
    }else{
        res.status(200).json({restricted: true,restrictedFunction: req.user.restrictedFunctions.find(item => item.function == "Follow") });
    }
})

router.post('/api/users/search', auth, (req, res) => {

    let limit = req.body.limit ? parseInt(req.body.limit) : 3;
    let skip = req.body.skip ? parseInt(req.body.skip) : 0;

    const matchRegex = new RegExp(req.body.keyword);
    console.log(matchRegex)
    User.find({ userName: { $regex: matchRegex }, _id: {$nin: req.user.blockedUsers} })
        .skip(skip)
        .limit(limit)
        .select("_id avt userName blockedUsers")
        .exec((err, users) => {
            let filteredUsers = [...users]
            filteredUsers = filteredUsers.filter(item => 
                !item.blockedUsers.includes(req.user._id)
            )
            console.log(filteredUsers)
            Tag.find({ name: { $regex: matchRegex } })
                .skip(skip)
                .limit(limit)
                .select("_id name posts")
                .exec((err, tags) => {
                    if (err) res.status(400).json(err);
                    res.status(200).json({ users: filteredUsers, tags });
                })
        })
})

router.post('/api/users/searchUser', auth, (req, res) => {

    let limit = req.body.limit ? parseInt(req.body.limit) : 3;
    let skip = req.body.skip ? parseInt(req.body.skip) : 0;

    const matchRegex = new RegExp(req.body.keyword);
    console.log(matchRegex)
    User.find({ userName: { $regex: matchRegex }, _id: {$nin: req.body.blockedUsers}  })
        .skip(skip)
        .limit(limit)
        .select("_id avt userName")
        .exec((err, users) => {
            if (err) res.status(400).json(err);
            res.status(200).json({ users });
        })
})

router.post('/api/users/searchTag', auth, (req, res) => {

    let limit = req.body.limit ? parseInt(req.body.limit) : 3;
    let skip = req.body.skip ? parseInt(req.body.skip) : 0;

    const matchRegex = new RegExp(req.body.keyword);
    console.log(matchRegex)
    Tag.find({ name: { $regex: matchRegex } })
        .skip(skip)
        .limit(limit)
        .select("_id name posts")
        .exec((err, tags) => {
            if (err) res.status(400).json(err);
            res.status(200).json({ tags });
    })
})

router.post('/api/users/reset_pass', (req, res) => {
    var today = moment().startOf('day').valueOf();
    User.findOne({
        resetToken: req.body.resetToken,
        resetTokenExp: {
            $gte: today
        }
    }, (err, user) => {
        if (err) console.log(err)
        if (!user) return res.json({ success: false, message: "Sorry, your token is invalid, please gennerate new one!" })

        user.password = req.body.password;
        user.resetToken = '';
        user.resetTokenExp = 0;

        user.save((err, doc) => {
            if (err) return res.json({ success: false, err })
            return res.status(200).json({
                success: true
            })
        })
    })
})

router.post('/api/users/reset_user', (req, res) => {
    User.findOne(
        { 'email': req.body.email },
        (err, user) => {
            user.gennerateResetToken((err, user) => {
                if (err) return res.json({ success: false, err });
                sendEmail(user.email, user.name, null, "reset_password", user);
                return res.json({ success: true })
            })
    })
})

router.post('/api/users/postsIncludedTags', auth, (req, res) => {

    let limit = req.body.limit ? parseInt(req.body.limit) : 6;
    let skip = req.body.skip ? parseInt(req.body.skip) : 0;

    Tag.aggregate([
        {
            "$match": { "followers": { $elemMatch: { $eq: req.user._id } } }
        },
        {
            "$project": {
                "_id": -1,
                "posts": 1,
            }
        },
    ], function (err, tags) {
        if (err) postIncludedTag = []
        tags.forEach(item => {
            postIncludedTag = [...postIncludedTag, ...item.posts]
        })
        console.log(postIncludedTag);

    })
    Post.aggregate([
        {
            "$match": { "_id": { "$in": postIncludedTag } }
        },
        {
            "$match": { "hidden": true }
        },
        {
            "$match": { "_id": { "$nin": req.user.hiddenPost } }
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
                    "content": 1,
                    "likes": 1,
                    "postedBy": {
                        "_id": 1,
                        "userName": 1,
                    },
                    "hiden": 1,
                    "createdAt": 1,
                    "updatedAt": 1,
                },
                "likes":
                {
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
        },
        {
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
        },
        { "$sort": { createdAt: -1 } },
        { "$skip": skip },
        { "$limit": limit },
    ], function (err, posts) {
        list = [...posts]
    }
    )
})

router.post('/api/users/newfeed', auth, (req, res) => {

    let limit = req.body.limit ? parseInt(req.body.limit) : 6;
    let skip = req.body.skip ? parseInt(req.body.skip) : 0;

    Post.aggregate([
        {
            "$match": { "postedBy": { "$in": [...req.user.followings, req.user._id] } }
        },
        {
            "$match": { "hidden": false }
        },
        {
            "$match": { "_id": { "$nin": req.user.hiddenPost } }
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
                    "content": 1,
                    "likes": 1,
                    "postedBy": {
                        "_id": 1,
                        "userName": 1,
                    },
                    "hiden": 1,
                    "createdAt": 1,
                    "updatedAt": 1,
                },
                "likes":
                {
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
        },
        {
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
        },
        { "$sort": { createdAt: -1 } },
        { "$skip": skip },
        { "$limit": limit },
    ], function (err, posts) {
        if (err) return res.status(400).send(err);
        res.status(200).json({
            topNewFeed: posts,
            size: posts.length
        });
    })
})

router.get('/api/users/nationality', (req,res)=>{
    Nationality.find({}).then((err,doc)=>{
        if(err) return res.json(err)
        return res.status(200).json({doc});
    })
})

router.post('/api/users/uploadimage', auth, formidable(), (req, res) => {
    cloudinary.uploader.upload(req.files.file.path, (result) => {
        console.log(result);
        res.status(200).send({
            public_id: result.public_id,
            url: result.url,
        })
    }, {
        public_id: `${Date.now()}`,
        resource_type: `auto`
    })
})


router.get('/api/users/:id', auth, (req, res) => {
    User.findOne({ _id: req.params.id })
        .populate("followers", "_id userName avt")
        .populate("followings", "_id userName avt")
        .select("-password")
        .then(user => {
            if(!req.user.blockedUsers.includes(user._id) && !user.blockedUsers.includes(req.user._id)){
                Post.find({ 
                    postedBy: req.params.id
                })
                .populate("postedBy", "_id userName")
                .exec((err, posts) => {
                    if (err) {
                        return res.status(422).json({ error: err })
                    }
                    return res.status(200).json({ user, posts })
                })
            }else{
                return res.status(200).json({NotFound: true})
            }
        }).catch(err => {
            return res.status(404).json({ err })
        })
})


module.exports = router;
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
const { Post } = require('../models/post');
const { Tag } = require('../models/tag');
const { Report } = require('../models/report');
const { Notification } = require('../models/notification');
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

function isRestricted(restrictedFunctions, func){
    var today = moment().startOf('day').valueOf();
    console.log(restrictedFunctions.some(item => (item.function == func) && (item.amountOfTime>today)))
    if(restrictedFunctions.some(item => (item.function == func) && (item.amountOfTime>today))){
        return true
    }else{
        return false
    }
}

const cloudinaryImageUploadMethod = async image => {
      return new Promise(resolve => {
          cloudinary.uploader.upload( image , (result) => {
              console.log( result)
              resolve({
                public_id: result.public_id,
                url: result.url
              }) 
            }
          ) 
      })
}

router.post('/api/posts/create_post', auth, async (req, res) => {
    const imagesList = [];
    for (const image of req.body.images) {
        const newPath = await cloudinaryImageUploadMethod(image)
        imagesList.push(newPath)
    }
    
    if(!isRestricted(req.user.restrictedFunctions,"Post")){
    User.find({ userName: { $in: req.body.userTag } })
        .select("_id")
        .exec((err, users) => {
            if (err) return res.status(400).json(err);
            let userTag = [];
            users.forEach((item) => {
                userTag.push(item._id);
            })
            console.log(userTag)
            try{
                let post = new Post({
                    images: imagesList,
                    description: req.body.description,
                    locationName: req.body.locationInput,
                    userTag: userTag,
                    postedBy: req.user._id,
                })
                console.log(post)   
                post.save((err, post) => {
                    if (err) return res.json({ success: false, err });
                    req.body.tags.forEach((item) => {
                        var query = { name: item }
                        update = { $push: { posts: post._id } },
                            options = { upsert: true, new: true, setDefaultsOnInsert: true };
                        Tag.findOneAndUpdate(query, update, options, function (error, result) {
                            if (error) return;
                            console.log(result);
                        });
                    });
                    console.log(post)
                    res.status(200).json({ success: true });
                })
            }catch (error){
                return res.status(400).json({ error })
            }
        })
    }else{
        res.status(200).json({restricted: true, restrictedFunction: req.user.restrictedFunctions.find(item => item.function == "Post")});
    }
})

router.post('/api/posts/update_post', auth, (req, res) => {

    Tag.find({ posts: { $elemMatch: { $eq: req.body.postId } } })
        .exec((err, tags) => {
            const oldTag = [];
            tags.forEach((item) => {
                //Xóa id bài viết khỏi trường posts của tag
                if (!req.body.tags.includes(item.name)) {
                    var query = { name: item.name },
                        update = { $pull: { posts: req.body.postId } };
                    Tag.findOneAndUpdate(query, update, function (error, result) {
                        if (error) return;
                        console.log(result);
                    });
                } else {
                    oldTag.push(item.name)
                }
            });

            req.body.tags.forEach((item) => {
                if (!oldTag.includes(item)) {
                    var query = { name: item }
                    update = { $push: { posts: req.body.postId } },
                    options = { upsert: true, new: true, setDefaultsOnInsert: true };
                    Tag.findOneAndUpdate(query, update, options, function (error, result) {
                        if (error) return;
                        console.log(result);
                    });
                }
            })
        })

    User.find({ userName: { $in: req.body.userTag } })
        .select("_id")
        .exec((err, users) => {
            if (err) return res.status(400).json(err);
            let userTag = [];
            users.forEach((item) => {
                userTag.push(item._id);
            })
            console.log(userTag)
            Post.findByIdAndUpdate(req.body.postId,
                {
                    $set: {
                        description: req.body.description,
                        userTag: userTag,
                        locationName: req.body.locationInput
                    }
                },
                { new: true }, (err, post) => {
                    if (err) res.send(err)
                    findPost(post._id, req.user.hiddenPost).then((post) => {
                        console.log(post);
                        return res.status(200).json({ success: true, post });
                    })
                })
        })
})

router.post('/api/posts/delete_post', auth, (req, res) => {
    Post.findByIdAndUpdate(req.body.id, {
        $set: { hidden: true }
    }, {
        new: true
    }).exec((err, post) => {
        if (err) res.status(400).send(err);
        res.status(200).json({ success: true, post: post});
    })
    // let posts = [];
    // posts.push(req.body.postId);
    // var query = { posts: { $in: posts}},
    // update = { $pull: { posts: req.body.postId } },
    // options = {new: true};
    // Tag.updateMany(query, update, options, function (error, result) {
    //     if (error) return;
    //     console.log(result);
    //     Post.findById(req.body.postId, (err, post) => {
    //         if (err) return;
    //         Comment.remove({ '_id': { '$in': post.comments } })
    //         .exec((err) => {
    //             if (err) return;
    //             Post.remove({ "_id": ObjectId(req.body.postId) })
    //             .exec((err) => {
    //                 if (err) return res.status(400).send(err);
    //                 return res.status(200).json({ success: true });
    //             })
    //         })
    //     })
    // });
})

router.post('/api/posts/getpostFormtag', auth, (req, res) => {
    let postId = []
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
        if (err) res.status(400).json(err)
        tags.forEach(item => {
            postId = [...postId, ...item.posts]
        })
        res.status(200).json(postId);
    })
});

router.get('/api/posts/postDetail', auth, (req, res) => {

    let type = req.query.type;
    let items = req.query.id;
    console.log(items);

    if (type === 'array') {
        let ids = req.query.id.split(',');
        items = [];
        items = ids.map(item => {
            return mongoose.Types.ObjectId(item);
        })
    }

    findPost(items, req.user.hiddenPost, req.user.blockedUsers).then((post) => {
        console.log(post)
        if(post.length == 0){
            return res.status(200).json({ NotFound: true });   
        }else{
            if(req.user.blockedUsers.includes(post[0].postedBy[0]._id)){
                return res.status(200).json({ NotFound: true });   
            } 
            else{
                findBlockedUsers(post[0].postedBy[0]._id).then((result) => {
                    console.log("result", result);
                    if(result[0].blockedUsers.includes(Object(req.user._id))){
                        return res.status(200).json({ NotFound: true });
                    }else{
                        return res.status(200).json(post[0]);
                    }
                })
            }
        }
    })
})

router.get('/api/posts/location/:name',auth,(req,res)=>{
    Post.find({"locationName": req.params.name})
    .exec((err, posts) => {
        if (err) return res.status(400).send(err);
        res.send(posts);
    })
});

router.put('/api/posts/save', auth, (req, res) => {
    if(!isRestricted(req.user.restrictedFunctions,"Save")){ 
        User.findByIdAndUpdate(req.user._id, {
            $push: { saved: req.body.postId }
        }, {
            new: true
        }).exec((err, user) => {
            if (err) res.status(400).json(err);
            res.status(200).json({user});
        })
    }else{
        res.status(200).json({restricted: true,restrictedFunction: req.user.restrictedFunctions.find(item => item.function == "Save")});
    }
})

router.put('/api/posts/unSave', auth, (req, res) => {
    if(!isRestricted(req.user.restrictedFunctions,"Save")){   
        User.findByIdAndUpdate(req.user._id, {
            $pull: { saved: req.body.postId }
        },{
            new: true
        }).exec((err, user) => {
            if (err) res.status(400).json(err);
            res.status(200).json({user});
        })
    }else{
        res.status(200).json({restricted: true,restrictedFunction: req.user.restrictedFunctions.find(item => item.function == "Like")});
    }
})

router.put('/api/posts/like', auth, (req, res) => {
    if(!isRestricted(req.user.restrictedFunctions,"Like")){
        Post.findByIdAndUpdate(req.body.postId, {
            $push: { likes: req.user._id }
        }, {
            new: true
        }).exec((err, post) => {
            if (err) res.status(400).json(err);
            findPost(req.body.postId, req.user.hiddenPost).then((post) => {
                console.log(post);
                const notification = new Notification({
                    sentFrom: req.user._id,
                    sentTo: post[0].postedBy[0]._id,
                    type: "likepost",
                    link: req.body.postId,
                    "seenStatus": false
                });
                SaveNotification(notification);
                res.status(200).json(post);
            })
        })
    }else{
        res.status(200).json({restricted: true,restrictedFunction: req.user.restrictedFunctions.find(item => item.function == "Like")});
    }
})

router.put('/api/posts/unlike', auth, (req, res) => {
    if(!isRestricted(req.user.restrictedFunctions,"Like")){
        Post.findByIdAndUpdate(req.body.postId, {
        $pull: { likes: req.user._id }
        }, {
            new: true
        }).exec((err, post) => {
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

router.post('/api/posts/test', auth, (req, res) => {

    var today = moment().startOf('day').valueOf();
    var next7Day = moment().startOf('day').add(7,'days').valueOf();

    var tomorow = moment(today).endOf('day').valueOf();
    res.status(200).json({today,tomorow,next7Day});

    var today = moment().startOf('day').valueOf();
    if(restrictedFunctions.some(item => {
        item.func == func && item.time > today
    })){
        return true
    }else{
        return false
    }

})

router.put('/api/posts/hidePost', auth, (req, res) => {
    if (req.body.postId) {
        User.findByIdAndUpdate(req.user._id, {
            $push: { hiddenPost: req.body.postId }
        }, { new: true }).exec((err) => {
            if (err) return res.json(err);
            res.status(200).json({ postId: req.body.postId })
        })
    }
    else {
        res.status(400).send("error");
    }
})

router.post('/api/posts/report', auth, (req, res) => {

    const report = new Report({
        reportType: req.body.reportType,
        reportAbout: req.body.reportAbout,
        post: req.body.post,
        comment: req.body.comment,
        userId: req.body.userId,
        sentBy: req.user._id,
        status: false,
    })
    report.save((err, report) => {
        if (err) return res.json({ reportSuccess: false, err });
        res.status(200).json({ reportSuccess: true });
    })
})

module.exports = router;

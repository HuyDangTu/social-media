const express = require("express");
const app = express();
const Pusher = require("pusher");
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const mailer = require('nodemailer');
const moment = require("moment");
const formidable = require('express-formidable');
const cloudinary = require('cloudinary');
// const SHA1 = require("cryto-js/sha1");
const multer = require('multer');
const fs = require('fs');
var jsonParser = bodyParser.json();
var urlencodedParser = bodyParser.urlencoded({ extended: false });

const cookieParser = require('cookie-parser');
app.use(cookieParser());

require('dotenv').config();

const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
mongoose.Promise = global.Promise;
mongoose.connect(process.env.DATABASE, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true,
    useCreateIndex: true,
})

const pusher = new Pusher({
    appId: "1117019",
    key: "c0e96b0fff8d0edac17d",
    secret: "4342528eb44f06867435",
    cluster: "mt1",
    useTLS: true
});
mongoose.connection.once('connected', async () => {
    console.log("mongoose is ready")
    const db = await mongoose.connection.collection('messages')
    const changeStream = db.watch()
    changeStream.on('change', (change) => {
        pusher.trigger("messages", "newMessage", {
            "change": change
        });
    })
    const noti = await mongoose.connection.collection('notifications')
    const addnoti = noti.watch()
    addnoti.on('change', (change) => {
        pusher.trigger("notifications", "newNoti", {
            "change": change
        });
    })
    const conver = await mongoose.connection.collection('conversations')
    const changeconver = conver.watch()
    changeconver.on('change', (change) => {
        pusher.trigger("conversations", "changeConver", {
            "change": change
        });
    })
})


mongoose.connection.on('connected', () =>{
    console.log("mongoose is ready");
})

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key:process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
})


// ============== MODEL ===============
const {User} = require("./models/user");
const { Comment } = require('./models/comment');
const { Post } = require('./models/post');
const { Tag } = require('./models/tag');
const { Report } = require('./models/report');
const { Policy } = require('./models/policy');
const { Story } = require('./models/story');
const { Message } = require('./models/message');
const { Conversation } = require('./models/conversations');
const { Notification } = require('./models/notification');
//=============== MIDDLEWARE ===========
const {auth} = require('./middleware/auth');
const { admin } = require('./middleware/admin');
const { response } = require("express");
const post = require("./models/post");

//ULTILS
const { sendEmail } = require('./ultils/mail/index');
const user = require("./models/user");



// ============== API ===============

//TEST
app.post('/api/posts/add_new',(req,res)=>{
    res.status(200).json({
        success: true
    })
})

//AUTH
app.get('/api/users/auth', auth, (req, res) => {
    res.status(200).json({
        isAdmin: req.user.role === 0 ? false : true,
        isAuth: true,
        _id: req.user._id,
        email: req.user.email,
        name: req.user.name,
        privateMode: req.user.privateMode,
        lastname: req.user.lastname,
        avt: req.user.avt,
        bio: req.user.bio,
        followers: req.user.followers,
        followings: req.user.followings,
        userName: req.user.userName,
        hiddenPost: req.user.hiddenPost,
    });
});

// =========================
//          USER
// =========================

//REGISTER 
app.post('/api/users/register', jsonParser,(req,res)=>{
   
    let message = "", isValidUserName = false;
    User.findOne({ userName: req.body.userName }, (err, user) => {
        console.log(user)
        if (user) {
            message += "Username đã được sử dụng!";
            isValidUserName = false;
        } else {
            isValidUserName = true;
        }
    }).then(()=>{
        if (isValidUserName) {
            const newUser = new User(req.body);
            newUser.save((err, user) => {
                if (err) return res.json({ success: false, err: "Thêm không thành công" });
                sendEmail(user.email,user.userName,null,"welcome")
                return res.status(200).json({
                    success: true,
                    message: "Thành công"
                });
            });
        } else {
          
            return res.json({ success: false, message: message });
        }
    })
});

//LOGIN
app.post('/api/users/login', jsonParser,(req,res)=>{
    // find the email
    User.findOne({'email':req.body.email},(err,user)=>{
        if(!user) return res.json({loginSuccess: false,message: 'Auth failes,email not found'});
        //check password
        user.comparePassword(req.body.password,(err,isMatch)=>{
            if(!isMatch) return res.json({loginSuccess: false,message: 'wrongPassword'})
            user.gennerateToken((err,user)=>{
                if(err) return res.status(400).send(err);
                //gennerate Token
                res.cookie('u_auth',user.token).status(200).json({
                    loginSuccess: true
                });
            });
        });
    });
})

app.post('/api/users/loginByFaceGoogle', jsonParser, (req, res) => {
    // find the email
    User.findOne({ 'email': req.body.email }, (err, user) => {
        if (!user) return res.json({ loginSuccess: false, message: 'Auth fail, No account found' });
            user.gennerateToken((err, user) => {
                if (err) return res.status(400).send(err);
                //gennerate Token
                res.cookie('u_auth', user.token).status(200).json({
                    loginSuccess: true
            });
         });
    });
})

//LOGOUT
app.get('/api/users/logout',auth,(req,res)=>{
    User.findOneAndUpdate(
        {_id:req.user._id},//tìm theo id
        {token:''},//update token của user tìm đc bằng rổng
        //callback function 
        (err,doc)=>{
            if(err) return res.json({success: false,err});
            res.clearCookie('u_auth').status(200).send({
                success: true
            })
        }
    )
})

app.post('/api/users/addToCart', auth, (req, res) => {
    User.findOne({ _id: req.user._id }, (err, doc) => {
        let duplicate = false;

        doc.cart.forEach((item) => {
            if (item.id == req.query.productId) {
                duplicate = true;
            }
        })

        if (duplicate) {
            User.findOneAndUpdate(
                {
                    _id: req.user._id,
                    "cart.id": mongoose.Types.ObjectId(req.query.productId)
                }
                ,{ $inc: {"cart.$.quantity": 1}},
                {new: true}
                ,() => {
                    console.log(doc.cart)
                    if(err) return res.json({success: false,err})
                    
                    res.status(200).json(doc.cart)
                }
            )
        } else {
            User.findOneAndUpdate(
                {
                    _id: req.user._id
                },
                {
                    $push: {
                        cart: {
                            id: mongoose.Types.ObjectId(req.query.productId),
                            quantity: 1,
                            date: Date.now(),
                        }
                    }
                },
                { new: true },
                (err, doc) => {
                    if (err) return res.json({ success: false, err })
                    res.status(200).json(doc.cart)
                }
            )
        }
    })
})

// IMAGE UPLOAD AND REMOVE
app.post('/api/users/uploadimage',auth,formidable(),(req,res)=>{
    cloudinary.uploader.upload(req.files.file.path,(result)=>{
        console.log(result);
        res.status(200).send({
            public_id: result.public_id,
            url: result.url,
        })
    },{
        public_id: `${Date.now()}`,
        resource_type: `auto`
    })
})

app.get('/api/users/removeimage',auth,(req,res)=>{
    let image_id = req.query.public_id;
    cloudinary.uploader.destroy(image_id,(error,result)=>{
        if (error) return res.json({ success: false, error});
        res.status(200).send('ok');
    })
})

// ====================
//          POST
// ====================

//------- ADD NEW -----------//
app.post('/api/posts/create_post', auth, (req, res) => {
    
    User.find({ userName: { $in: req.body.userTag }})
    .select("_id")
    .exec((err,users)=>{
        if (err) return res.status(400).json(err); 
        let userTag = [];
        users.forEach((item) => {
            userTag.push(item._id);
        })
        console.log(userTag)
        const post = new Post({
            images: req.body.images,
            description: req.body.description,
            userTag: userTag,
            postedBy: req.user._id,
        })
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
    })
})

app.post('/api/posts/update_post', auth, (req, res) => {

    Tag.find({ posts: { $elemMatch: { $eq: req.body.postId }}})
    .exec((err,tags)=>{
        const oldTag = [];
        tags.forEach((item) => {
            //Xóa id bài viết khỏi trường posts của tag
            if(!req.body.tags.includes(item.name)){
                var query = { name: item.name },
                update = { $pull: { posts: req.body.postId } };
                Tag.findOneAndUpdate(query, update, function (error, result) {
                    if (error) return;
                    console.log(result);
                });
            }else{
                oldTag.push(item.name)
            }
        });

        req.body.tags.forEach((item) => {
            if (!oldTag.includes(item))
            {
                var query = { name: item }
                update = { $push: { posts: req.body.postId}},
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
                        userTag: userTag
                    }
                },
                {new: true }, (err, post) => {
                    if (err) res.send(err)
                    findPost(post._id, req.user.hiddenPost).then((post) => {
                        console.log(post);
                        res.status(200).json({ success: true,post});
                    })      
                })
        })
})


app.post('/api/posts/delete_post', auth, (req, res) => {
    Post.findByIdAndUpdate(req.body.id, {
        $set: { hidden: true }
    }, {
        new: true
    }).exec((err, post) => {
        if (err) res.status(400).send(err);
        res.status(200).json({ success: true });
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

// Get lastest post for new feed 
// newfeed?sortBy=createdAt&order=desc&limit=6

function findPost(postId,userHiddenPost){
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
                "description": 1,
                "postedBy": {
                    "_id": 1,
                    "avt": 1,
                    "userName": 1,
                },
                "createdAt": 1,
                "updatedAt": 1,
            }
        },{
            "$sort": { "comments.createdAt": -1 } 
        },
        {
            "$group": {
                _id: '$_id',
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
        }],function (err, post) {
            if (err) return {}
            return post[0];
        }
    )
    return post;
}

app.post('/api/posts/getpostFormtag',auth,(req,res)=>{
    let postId = []
    Tag.aggregate([
        {
            "$match": { "followers": { $elemMatch: { $eq: req.user._id } } }
        },
        {
            "$project": {
                "_id":-1,
                "posts": 1,
            }
        },
    ], function (err, tags) {
        if(err) res.status(400).json(err)
        tags.forEach(item=>{
            postId = [...postId,...item.posts]
        })
        res.status(200).json(postId);
    })
});

app.get('/api/posts/postDetail',auth,(req,res)=>{

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

    findPost(items,req.user.hiddenPost).then((post) => {
        console.log(post);
        res.status(200).json(post[0]);
    })    
})

app.post('/api/users/postsIncludedTags', auth, (req, res) => {

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

app.post('/api/users/newfeed',auth,(req,res)=>{

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
    }
    )
   
})

// Get user's posts 
// newfeed?id=5f90e95460842c39900e3ffb&sortBy=createdAt&order=desc&limit=6
app.get('/api/userPost', auth, (req, res) => {

    let id = req.query.id ? req.query.id : '';
    let order = req.query.order ? req.query.order : 'asc';
    let sortBy = req.query.sortBy ? req.query.sortBy : '_id';
    let limit = req.query.limit ? parseInt(req.query.limit) : 6;

    Post.find({ "postedBy": id })
    .populate("postedBy", "_id userName")
    .sort([[sortBy, order]])
    .limit(limit)
    .exec((err, posts) => {
        if (err) return res.status(400).send(err)
        console.log(posts);
        res.send(posts)
    })
})

// getUser?id=5f90e95460842c39900e3ffb
app.get('/api/getUser', auth, (req, res) => {
    let id = req.query.id ? req.query.id : '';
    User.find({ "_id": id }).select('-password')
    .populate("followings")
    .populate("followers")
    .exec((err, user) => {
        if (err) return res.status(400).send(err)
        console.log(user);
        res.send(user)
    })
})

// =========================
//           TAGS
// =========================

app.post('/api/tags/newTag',auth,(req, res) => {
    const tag = new Tag({
        ...req.body,
    });
    tag.save((err,tag) => {
        if(err) return res.status(400).send(err);
        res.send(tag);
    })
})

app.get('/api/tags/getAllTags',(req,res)=>{
    Tag.find().exec((err,tags)=>{
        if(err) return res.status(400).send(err);
        res.send(tags);
    })
});

//tag?id=5f90e95460842c39900e3ffb&sortBy=createdAt&order=desc&limit=6
app.post('/api/tags/getTag', auth ,(req, res) => {
    
    let id = req.body.id ? req.body.id : '';
    let order = 'desc';
    let sortBy = 'createdAt';
    let limit = req.body.limit ? parseInt(req.body.limit) : 6;
    let skip = req.body.skip ? parseInt(req.body.skip) : 0;
    
    Tag.findOne({_id: id})
    .exec((err, tag) => {
        if (err) return res.status(400).send(err);
        Post.find({ "_id": { "$in": [...tag.posts]}})
            .populate("postedBy", "_id userName")
            .sort([[sortBy, order]])
            .skip(skip)
            .limit(limit)
            .exec((err, posts) => {
            if (err) return res.status(400).send(err)
            console.log(posts);
            res.status(200).json({
                tag: tag,
                posts: posts
            })
        })
    })
});

app.get('/api/tags/getFollowers',auth,(req, res) => {
    User.find({ "_id": { $in: req.user.followings}})
    .select('userName -_id')
    .limit(5)
        .exec((err, followings) => {
        if (err) return res.status(400).send(err);
            res.send(followings);
    })
});

app.post('/api/tags/getTop10Tags',auth, (req, res) => {

    Tag.aggregate([
            {
            "$project": {
                "name": 1,
                "length": {"$size": "$posts"},
            }},
            { "$sort": { "length": -1 } },
            { "$skip": 0 },
            { "$limit": 10 }
        ],
        function(err, tags){
            //console.log(tags);
            if (err) return res.status(400).send(err);
            res.status(200).json({
                topTenTags: tags
            });
        }
    )
})

app.put('/api/posts/like', auth, (req, res) => {

    Post.findByIdAndUpdate(req.body.postId, {
        $push: { likes: req.user._id }
    }, {
        new: true
    }).exec((err,post) => {
        if (err) res.status(400).json(err);
        findPost(req.body.postId, req.user.hiddenPost).then((post)=>{
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
})

app.put('/api/posts/unlike', auth, (req, res) => {
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
})
///////////////////
//Mới
//////////////////////////////
app.get('/api/users/:id', auth, (req, res) => {
    User.findOne({ _id: req.params.id })
        .populate("followers", "_id userName avt")
        .populate("followings", "_id userName avt")
        .select("-password")
        .then(user => {
            Post.find({ postedBy: req.params.id })
                .populate("postedBy", "_id userName")
                .exec((err, posts) => {
                    if (err) {
                        return res.status(422).json({ error: err })
                    }
                    res.json({ user, posts })
                })
        }).catch(err => {
            return res.status(404).json({ error: "Users not found" })
        })
})
app.get('/api/users/profile/:id', auth, (req, res) => {
    User.findOne({ _id: req.params.id })
        .select('-password')
        .then((user) => {
            res.json(user)
        })
})
app.get('/api/users/tagged/:id', auth, (req, res) => {
    Post.find({ userTag: req.params.id })
        .populate("userTag", "_id userName")
        .sort({ "createdAt": -1 })
        .exec((err, posts) => {
            if (err) {
                return res.status(422).json({ error: err })
            }
            res.json({ posts })
        })
})
app.get('/api/users/posted/:id', auth, (req, res) => {
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
app.put('/api/users/updatepic', auth, (req, res) => {
    User.findByIdAndUpdate(req.user._id, { $set: { avt: req.body.url } }, { new: true },
        (err, result) => {
            if (err) {

                return res.status(422).json({ error: "pic canot post" })
            }
            res.json(result)
        })

})
app.put('/api/users/update/:id', auth, jsonParser, (req, res) => {
    User.findByIdAndUpdate(req.params.id,
        {
            $set: {
                userName: req.body.userName,
                bio: req.body.bio,
                name: req.body.name,
                email: req.body.email,
                privateMode: req.body.privateMode,
            }
        }, {
        new: false
    }, function (err, doc) {
        if (err) {
            res.send(err)
        }
    }).then(result =>
        res.json(result)
    )
})
app.put('/api/users/follow/:followId', auth, (req, res) => {
    User.findByIdAndUpdate(req.params.followId, {
        $push: { followers: req.user._id }
    }, {
        new: true
    })
        .populate("followers", "_id userName avt")
        .populate("followings", "_id userName avt")
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
})
app.put('/api/users/unfollow/:unfollowId', auth, (req, res) => {
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
})

app.get('/api/messages/get/:id', auth, (req, res) => {
    const userlist = [(req.params.id), (req.user._id)]
    Conversation.findOne({ $and: [{ user1: { $in: userlist } }, { user2: { $in: userlist } }] })
        .populate("messagelist")
        .populate("user1", "_id userName avt")
        .populate("user2", "_id userName avt")
        .populate("lastMess")
        .exec((err, data) => {
            if (err) {
                res.status(500).send(err)
            }
            else {
                if (data == null) {
                    const conversation = new Conversation({
                        user1: req.params.id,
                        user2: req.user._id,
                        seenBy: [(req.user._id)]
                        
                    })
                    Conversation.create(conversation, (err, conver) => {
                        if (err) {
                            res.status(500).send(err)
                        }
                        else {
                            res.json(conver)
                        }
                    })
                }
                else (res.json(data))
            }
        })
})
app.get('/api/messages/seen/:id', auth, (req, res) => {
    const userlist = [(req.params.id), (req.user._id)]
    Conversation.findOneAndUpdate({ $and: [{ user1: { $in: userlist } }, { user2: { $in: userlist } }] }, { $push: { seenBy: req.user._id } })
        .exec((err, data) => {
            if (err) {
                res.status(500).send(err)
            }
            else {
                res.json(data)
            }
        })
})

app.get('/api/messages/conversations', auth, (req, res) => {
    Conversation.find(
        {
            $or: [{ user1: { $eq: req.user._id } }, { user2: { $eq: req.user._id } }]
        }
    ).populate("user1", "_id userName avt")
        .populate("user2", "_id userName avt")
        .populate("lastMess")
        .sort('-conversations.lastMess.updatedAt')
        .exec((err, data) => {
            if (err) {
                res.status(500).send(err)
            }
            else {
                res.json(data)
            }
        })
})

app.get('/api/notify/getall', auth, (req, res) => {
    Notification.find({ "sentTo": req.user._id }).
        populate("sentFrom", "_id userName avt")
        .sort({ "createdAt": -1 })
        .exec((err, data) => {
            if (err) {
                res.status(500).send(err)
            }
            else {
                res.json(data)
            }
        })
})
app.post('/api/notify/seen/:id', auth, (req, res) => {
    Notification.findByIdAndUpdate(req.params.id, {
        $set: { seenStatus: true }
    }).exec((err, noti) => {
        if (err) res.status(400).json(err);
        else
            res.json(noti);
    })
})
app.post('/api/notify/seenall', auth, (req, res) => {
    Notification.update({ "sentTo": req.user._id }, {
        $set: { seenStatus: true }
    }, { multi: true })
        .populate("sentFrom", "_id userName avt")
        .sort({ "createdAt": -1 })
        .exec((err, data) => {
            if (err) {
                res.status(500).send(err)
            }
            else {
                res.json(data)
            }
        })
})
function SaveNotification(notification) {
    Notification.create(notification, (err, data) => {
        if (err) {
            console.log(err)
        }
        else {
            console.log(data)
        }
    })
}
app.post('/api/messages/save', jsonParser, (req, res) => {
    const dbMess = req.body
    Message.create(dbMess, (err, data) => {
        if (err) {
            res.status(500).send(err)
        }
        else {
            const userlist = [data.sentTo, data.sentBy]
            Conversation.findOneAndUpdate(
                {
                    $and: [{ user1: { $in: userlist } }, { user2: { $in: userlist } }]
                }
                , {
                    $push: {
                        messagelist: data._id
                    },
                    $set: {
                        lastMess: data._id
                    },
                    $pull: {
                        seenBy: data.sentTo
                    }
                }, {

            }, (err, doc) => {
                if (!err) {
                    if (doc) {
                        res.status(200).json(doc)
                    }
                    if (!doc) {
                        const conversation = new Conversation({
                            user1: data.sentBy,
                            user2: data.sentTo,
                            messagelist: [(data._id)],
                            lastMess: data._id,
                            seenBy: [(data.sentBy)]
                        })
                        Conversation.create(conversation, (err, conver) => {
                            if (err) {
                                res.status(500).send(err)
                            }
                            else {
                                res.json(conver)
                            }
                        })

                    }

                }
            })
        }
    })
})

// ==============================
//            COMMENT
// ==============================

app.post('/api/posts/comment',auth, (req, res) => {   
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
})

app.put('/api/posts/respond', auth, (req, res) => {

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
    }).then((err,cmt) => {
        if (err) return res.json(err);
        res.status(200).json({
            cmt: cmt
        })
    })
})

app.put('/api/posts/hidePost', auth, (req, res) => {
    if (req.body.postId )
    {
        User.findByIdAndUpdate(req.user._id, {
            $push: { hiddenPost: req.body.postId }
        },{new: true}).exec((err)=>{
            if (err) return res.json(err);
            res.status(200).json({ postId: req.body.postId})
        })
    }
    else{
        res.status(400).send("error");
    }
})

app.put('/api/posts/likeComment',auth,(req,res)=>{
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
})

app.put('/api/posts/unLikeComment', auth, (req, res) => {
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
})

app.put('/api/posts/deleteComment', auth, (req, res) => {
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

app.post('/api/posts/report', auth, (req, res) => {

    const report = new Report({
        reportType: req.body.reportType,
        reportAbout: req.body.reportAbout,
        post: req.body.post,
        comment: req.body.comment,
        sentBy: req.user._id,
        status: false,
    })
    report.save((err, report) => {
        if (err) return res.json({ reportSuccess: false, err });
        res.status(200).json({ reportSuccess: true });
    })
})

app.post('/api/policies/create', auth, (req, res) => {
    let policy = new Policy({
        content: req.body.content
    })

    policy.save((err,policy)=>{
        if(err) return res.status(400).json({err})
        res.status(200).json(policy)
    })
})

app.get('/api/policies/getAll', auth, (req, res) => {
    Policy.find()
    .exec((err, policies) => {
        if (err) return res.status(400).json({ err })
        res.status(200).json(policies)
    })
})



app.post('/api/story/create', auth, (req, res) => {
    
    let story = new Story({
        image: req.body.image,
        header: req.body.header,
        postedBy: req.user._id,
    })

    story.save((err, story) => {
        if (err) return res.status(400).json({ err })
        res.status(200).json(story)
    })

})



function getStory() {
    console.log(userHiddenPost);
    const stories = Story.aggregate([
        {
            "$match": { "postedBy": { "$in": req.user.followings } }
        },
        {
            $lookup: { from: 'users', localField: 'postedBy', foreignField: '_id', as: 'postedBy' }
        },
        // {
        //     "$match": { "createdAt": { "$lt": new Date(Date.now() - 24 * 60 * 60 * 1000) } }
        // },
        {
            "$project": {
                "_id": 1,
                "image": 1,
                "postedBy": {
                    "_id": 1,
                    "avt": 1,
                    "userName": 1,
                },
                "dateDifference": { $subtract: [new Date(), "$createdAt"] },
                "createdAt": 1,
                "updatedAt": 1,
            }
        }], function (err, stories) {
            if (err) return {}
            return stories;
        }
    )
    return stories;
}

app.put('/api/tags/follow', auth, (req, res) => {
    Tag.findByIdAndUpdate(req.body.tagId, {
        $push: { followers: req.user._id }
    }, {
        new: true
    }).exec((err, tag) => {
        if (err) res.status(400).json(err);
            res.status(200).json({tag});
    })
})

app.post('/api/tags/getTagId', (req, res) => {
    Tag.aggregate([
        {
            "$match": { "name": { "$in": req.body.hashtag } }
        },
        {
            $project: {
                _id: 1,
                name: 1,
            }
        }
    ],function (err, tags) {
            if (err) return res.status(400).json(err);
            res.status(200).json(tags);
        }
    )
})

app.put('/api/tags/unfollow', auth, (req, res) => {
    Tag.findByIdAndUpdate(req.body.tagId, {
        $pull: { followers: req.user._id }
    },{new: true })
    .exec((err, tag) => {
        if (err) res.status(400).json(err);
        res.status(200).json({ tag });
    })
})

app.post('/api/users/search',auth,(req,res)=>{

    let limit = req.body.limit ? parseInt(req.body.limit) : 3;
    let skip = req.body.skip ? parseInt(req.body.skip) : 0;

    const matchRegex = new RegExp(req.body.keyword);
    console.log(matchRegex)
    User.find({ userName: { $regex: matchRegex }})
    .skip(skip)
    .limit(limit)
    .select("_id avt userName")
    .exec((err,users)=>{
        Tag.find({ name: { $regex: matchRegex } })
        .skip(skip)
        .limit(limit)
        .select("_id name posts")
        .exec((err, tags) => {
            if (err) res.status(400).json(err);
            res.status(200).json({ users, tags});
        })
    })
})

app.post('/api/users/searchUser', auth, (req, res) => {

    let limit = req.body.limit ? parseInt(req.body.limit) : 3;
    let skip = req.body.skip ? parseInt(req.body.skip) : 0;

    const matchRegex = new RegExp(req.body.keyword);
    console.log(matchRegex)
    User.find({ userName: { $regex: matchRegex } })
        .skip(skip)
        .limit(limit)
        .select("_id avt userName")
        .exec((err, users) => {
            if (err) res.status(400).json(err);
            res.status(200).json({ users });
        })
})

app.post('/api/users/searchTag', auth, (req, res) => {

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

app.get('/api/story/getAll', auth, (req, res) => {
    Story.aggregate([
        {
            $match: { "postedBy": { "$in": req.user.followings } }
        },
        {
            $match: { "createdAt": { $gt: new Date(Date.now() - 24 * 60 * 60 * 1000) } }
        },
        {
            "$project": {
                "_id": 1,
                "header": 1,
                "image": 1,
                "viewedBy": 1,
                "postedBy": 1,
                "createdAt": 1,
                "dateDifference": { $subtract: [new Date(), "$createdAt"] },
            }
        },
        {
            $group: { _id: "$postedBy", stories: { $push: "$$ROOT" } }
        },
        {
            $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'postedBy' }
        },
        {
            "$project": {
                "postedBy": {
                    "_id": 1,
                    "avt": 1,
                    "userName": 1,
                },
                "stories": {
                    "_id": 1,
                    "header": 1,
                    "image": 1,
                    "viewedBy": 1,
                     "createdAt": 1,
                    "dateDifference": 1,
                },
            }
        }], function (err, stories) {
            if (err) return res.status(400).json(err);
            res.status(200).json(stories);
        }
    )
})

app.post('/api/users/reset_pass',(req,res)=>{
    
    var today = moment().startOf('day').valueOf();

    User.findOne({
        resetToken: req.body.resetToken,
        resetTokenExp: {
            $gte: today
        }
    },(err,user)=>{
        if( err)console.log(err)
        if(!user) return res.json({success:false,message:"Sorry, your token is invalid, please gennerate new one!"})

        user.password = req.body.password;
        user.resetToken = '' ;
        user.resetTokenExp = 0 ;

        user.save((err,doc)=>{
            if(err) return res.json({success: false, err})
            return res.status(200).json({
                success: true
            })
        })
    })
})

app.post('/api/users/reset_user',(req,res)=>{
    User.findOne(
        {'email': req.body.email},
        (err,user) => {
            user.gennerateResetToken((err,user)=>{
                if(err) return res.json({success: false,err});
                sendEmail(user.email,user.name,null,"reset_password",user);
                return res.json({success:true})
        })
    })
})

//=======================
//  ADMIN
//=======================

app.post('/api/admin/login', jsonParser, (req, res) => {
    // find the email
    User.findOne({ 'email': req.body.email }, (err, user) => {
        if (!user) return res.json({ loginSuccess: false, message: 'Auth failes,email not found' });
        //check password
        if (user.role === 0) res.json({ loginSuccess: false, message: 'Auth failes' });
        user.comparePassword(req.body.password, (err, isMatch) => {
            if (!isMatch) return res.json({ loginSuccess: false, message: 'wrongPassword' })
            user.gennerateToken((err, user) => {
                if (err) return res.status(400).send(err);
                //gennerate Token
                res.cookie('u_auth', user.token).status(200).json({
                    loginSuccess: true
                });
            });
        });
    });
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
        }
    )
    return post;
}

app.post('/api/reports/getAll', auth, admin, (req, res) => {

    let limit = req.body.limit ? parseInt(req.body.limit) : 6;
    let skip = req.body.skip ? parseInt(req.body.skip) : 0;
    let filter = req.body.filter[0] == "all" ? ["post", "comment"] : req.body.filter ;

    Report.aggregate([
        {
            $match: { "reportType": { "$in": filter }}
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
        { "$sort": {createdAt: -1}},
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

findComment = (id) =>{
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

app.post('/api/reports/getDetail', auth, admin, (req, res) => {

    Report.aggregate([
        {
            $match: { "_id": ObjectId(req.body.id) } 
        },
        {
            $lookup: { from: 'policies', localField: 'reportAbout', foreignField: '_id', as: 'reportAbout' }
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
                "reportAbout":{
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
            }else{
                findComment(report.comment).then((comment) => {
                    findPost(report.post, []).then((post) => {
                        res.status(200).json({
                            reportDetail: {
                                ...report,
                                comment: comment,
                                post:post
                            }
                        })
                    });
                })
            }
        }
    )
})

app.put('/api/reports/updateReport', auth, admin, (req, res) => {
    Report.findByIdAndUpdate(req.body.id, {
        $set: { status: true }
    }, {
        new: true
    }).exec((err, report) => {
        if (err) res.status(400).json(err);
        res.status(200).json({report});
    })
})

app.post('/api/reports/delete_post', auth, (req, res) => {
    Post.findByIdAndUpdate(req.body.postId, {
        $set: { hidden: true }
    }).exec((err) => {
        if (err) res.status(400).send(err);
        Report.findByIdAndUpdate(req.body.reportId, {
            $set: { status: true }
        }, {
            new: true
        }).exec((err, report) => {
            if (err) res.status(400).json(err);
            res.status(200).json({report});
        })
    })
})

app.post('/api/reports/delete_comment', auth, (req, res) => {
    Comment.findByIdAndUpdate(req.body.commentId, {
        $set: { hidden: true }
    }, {
        new: true
    }).exec((err, post) => {
        if (err) res.status(400).send(err);
        Report.findByIdAndUpdate(req.body.reportId, {
            $set: { status: true }
        }, {
            new: true
        }).exec((err, report) => {
            if (err) res.status(400).json(err);
            res.status(200).json(report);
        })
    })
})

app.post('/api/accounts/getAll', auth, admin, (req, res) => {

    let limit = req.body.limit ? parseInt(req.body.limit) : 6;
    let skip = req.body.skip ? parseInt(req.body.skip) : 0;
    // let filter = req.body.filter[0] == "all" ? ["post", "comment"] : req.body.filter;

    User.aggregate([
    {
        $match: { "role": 1 }
    },
    {
        "$project": {
            "_id": 1,
            "avt": 1,
            "role": 1,
            "email": 1,
            "password": 1,
            "userName": 1,
            "name": 1,
            "lastname": 1,
        }
    },
    { "$sort": { createdAt: -1 } },
    { "$skip": skip },
    { "$limit": limit }
    ], function (err, accounts) {
            console.log(accounts);
        if (err) return res.status(400).send(err);
        res.status(200).json({
            accounts: accounts,
            size: accounts.length
        });
    }
    )
})


app.post('/api/users/login', jsonParser, (req, res) => {
    // find the email
    User.findOne({ 'email': req.body.email }, (err, user) => {
        if (!user) return res.json({ loginSuccess: false, message: 'Auth failes,email not found' });
        //check password
        user.comparePassword(req.body.password, (err, isMatch) => {
            if (!isMatch) return res.json({ loginSuccess: false, message: 'wrongPassword' })
            user.gennerateToken((err, user) => {
                if (err) return res.status(400).send(err);
                //gennerate Token
                res.cookie('u_auth', user.token).status(200).json({
                    loginSuccess: true
                });
            });
        });
    });
})

app.post('/api/users/changePassword',auth,(req, res) => {
    User.findOne({
        _id: req.user._id,
    }, (err, user) => {
        if (err) console.log(err)
        if (!user) return res.json({ success: false, message: "Lỗi! Vui lòng thử lại" })
        user.comparePassword(req.body.currentPassword, (err, isMatch) => {
            if (!isMatch) return res.json({ success: false, message: 'Mật khẩu hiện tại không đúng!' })
            user.password = req.body.password;
            user.save((err, doc) => {
                if (err) return res.json({ success: false, message: "Lỗi! Vui lòng thử lại" })
                return res.status(200).json({
                    success: true,
                    message: 'Thay đổi mật khẩu thành công' 
                })
            }) 
        });
    })
})


//---------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------



app.use(function (req, res, next) {
    res.status(404).send('Unable to find the requested resource!');
});

const port =  process.env.PORT || 3002;
app.listen(port,()=>{{
    console.log(`Server is running at ${port}`);
}})





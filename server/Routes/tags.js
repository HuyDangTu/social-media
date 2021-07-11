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
const { Tag } = require('../models/tag');
const { auth } = require('../middleware/auth');

router.post('/api/tags/newTag', auth, (req, res) => {
    const tag = new Tag({
        ...req.body,
    });
    tag.save((err, tag) => {
        if (err) return res.status(400).send(err);
        res.send(tag);
    })
})

router.get('/api/tags/getAllTags', (req, res) => {
    Tag.find().exec((err, tags) => {
        if (err) return res.status(400).send(err);
        res.send(tags);
    })
});

router.post('/api/tags/getTag', auth, (req, res) => {
    let id = req.body.id ? req.body.id : '';
    let order = 'desc';
    let sortBy = 'createdAt';
    let limit = req.body.limit ? parseInt(req.body.limit) : 6;
    let skip = req.body.skip ? parseInt(req.body.skip) : 0;

    Tag.findOne({ _id: id })
        .exec((err, tag) => {
            if (err) return res.status(400).send(err);
            Post.find({ "_id": { "$in": [...tag.posts]},hidden: {$eq: false},postedBy: {"$nin": req.body.blockedUsers}})
                .populate("postedBy", "_id userName")
                .sort([[sortBy, order]])
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

router.get('/api/tags/getFollowers', auth, (req, res) => {
    
    User.find({ "_id": { $in: req.user.followings } })
        .select('userName -_id')
        .limit(5)
        .exec((err, followings) => {
            if (err) return res.status(400).send(err);
            res.send(followings);
        })
});

router.post('/api/tags/getTop10Tags', auth, (req, res) => {

    Tag.aggregate([
        {
            "$project": {
                "name": 1,
                "length": { "$size": "$posts" },
            }
        },
        { "$sort": { "length": -1 } },
        { "$skip": 0 },
        { "$limit": 10 }
    ],
        function (err, tags) {
            //console.log(tags);
            if (err) return res.status(400).send(err);
            res.status(200).json({
                topTenTags: tags
            });
        }
    )
})

router.put('/api/tags/follow', auth, (req, res) => {
    Tag.findByIdAndUpdate(req.body.tagId, {
        $push: { followers: req.user._id }
    }, {
        new: true
    }).exec((err, tag) => {
        if (err) res.status(400).json(err);
        res.status(200).json({ tag });
    })
})

router.post('/api/tags/getTagId', (req, res) => {
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
    ], function (err, tags) {
        if (err) return res.status(400).json(err);
        res.status(200).json(tags);
    }
    )
})

router.put('/api/tags/unfollow', auth, (req, res) => {
    Tag.findByIdAndUpdate(req.body.tagId, {
        $pull: { followers: req.user._id }
    }, { new: true })
        .exec((err, tag) => {
            if (err) res.status(400).json(err);
            res.status(200).json({ tag });
        })
})

router.post('/api/tags/getTop10Tags', auth, (req, res) => {
    Tag.aggregate([
        {
            "$project": {
                "name": 1,
                "length": { "$size": "$posts" },
            }
        },
        { "$sort": { "length": -1 } },
        { "$skip": 0 },
        { "$limit": 10 }
    ],
        function (err, tags) {
            //console.log(tags);
            if (err) return res.status(400).send(err);
            res.status(200).json({
                topTenTags: tags
            });
        }
    )
})

module.exports = router;
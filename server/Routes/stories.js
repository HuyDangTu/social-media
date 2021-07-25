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
const { Story } = require('../models/story');
const { HighlightStory } = require('../models/highlightStory');

//=============== MIDDLEWARE ===========
const { auth } = require('../middleware/auth');

router.get('/api/story/getAll', auth, (req, res) => {
    Story.aggregate([
        {
            $match: { "postedBy": { "$in": [...req.user.followings, req.user._id] }}
        },
        {
            $match: { "disabled": false }
        },
        {
            $match: { "createdAt": { $gt: new Date(Date.now() - 24 * 60 * 60 * 1000) } }
        },
        {
            $lookup: { from: 'users', localField: 'viewedBy', foreignField: '_id', as: 'viewedBy' }
        },
        {
            "$project": {
                "_id": 1,
                "header": 1,
                "image": 1,
                "viewedBy": {
                    "_id": 1,
                    "avt": 1,
                    "userName": 1,  
                },
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
        },{"$sort": {"stories.createdAt": -1 }}], function (err, stories) {
            if (err) return res.status(400).json(err);
            res.status(200).json(stories);
        }
    )
})

router.get('/api/story/get', auth, (req, res) => {
    Story.aggregate([
        {
            $match: { "postedBy": { "$in": [...req.user.followings, req.user._id] }, "disabled": false }
        },
        {
            $match: { "disabled": false }
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
        },{"$sort": {"stories.createdAt": -1 }}], function (err, stories) {
            if (err) return res.status(400).json(err);
            res.status(200).json(stories);
        }
    )
})

function getStories(followings,id) {
    const list = Story.aggregate([
        {
            $match: { "postedBy": { "$in": [...followings,id] }, "disabled": false }
        },
        {
            $match: { "disabled": false }
        },
        {
            $match: { "createdAt": { $gt: new Date(Date.now() - 24 * 60 * 60 * 1000) } }
        },
        {
            $lookup: { from: 'users', localField: 'viewedBy', foreignField: '_id', as: 'viewedBy' }
        },
        {
            "$project": {
                "_id": 1,
                "header": 1,
                "image": 1,
                "viewedBy": {
                    "_id": 1,
                    "avt": 1,
                    "userName": 1,  
                },
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
        },{"$sort": {"stories.createdAt": -1 }}], 
        function (err, stories) {
            if (err) return {}
            return stories
        }
    )
    return list;
}

router.post('/api/story/create', auth, async (req, res) => {
    try{
        const fileStr = req.body.uri;
        await cloudinary.uploader.upload(fileStr, (result)=>{
            console.log("here",result)
            let story = new Story({
                image: {
                    public_id: result.public_id,
                    url: result.url
                },
                postedBy: req.user._id,
            })
            story.save((err) => {
                if (err) return res.status(400).json({ err })
                getStories(req.user.followings,req.user._id).then((stories)=>{
                    res.status(200).json({success: true,stories: stories})
                })
            })
        })
    }catch (error){
        return res.status(400).json({ error })
    }
})

router.put('/api/story/view', auth, (req, res) => {
    Story.findByIdAndUpdate(req.body.id, {
        $addToSet: { viewedBy: req.user._id }
    }).exec((err, story) => {
        if (err) res.status(400).json(err);
        res.status(200).json({story});
    })
})

router.post('/api/story/delete', auth, (req, res) => {
    console.log(req.body.storyId);
    Story.findByIdAndUpdate(req.body.storyId, {
        $set: { disabled: true }
    },{
        new: true
    }).exec((err, story) => {
        console.log(story)
        if (err) res.status(400).json(err);
        getStories([],req.user._id).then((storyList)=>{
            res.status(200).json({success: true, storyList})
        })
    })
})

router.get('/api/story/getHighlightStory/:id',auth,(req,res)=>{
    HighlightStory.aggregate([
        {
            "$match": { "createdBy": ObjectId(req.params.id)}
        },
        {
            "$match": { "disabled": false}
        },
        {
            $lookup: { from: 'stories', localField: 'storyList', foreignField: '_id', as: 'storyList' }
        },
        {
            $lookup: { from: 'users', localField: 'createdBy', foreignField: '_id', as: 'createdBy' }
        },
        {
            $project: {
                name: 1,
                storyList:{
                    _id: 1,
                    image: 1,
                    postedBy: 1,
                    viewedBy: 1,
                    disabled: 1,
                    createdAt: 1,
                },
                createdBy:{
                    _id: 1,
                    userName: 1,
                    avt: 1,
                },
                disabled: 1,
            }
        }
    ], function (err, highlightStory) {
        if (err) return res.status(400).json(err);
        res.status(200).json(highlightStory);
    })
})

router.post('/api/story/deleteHighLightStory', auth, (req, res) => {
    console.log(req.body.storyId);
    HighlightStory.findByIdAndUpdate(req.body.storyId, {
        $set: { disabled: true }
    },{
        new: true
    }).exec((err, story) => {
        console.log(story)
        if (err) res.status(400).json(err);
        res.status(200).json({success: true, storyId: req.body.storyId})
    })
})

function getHighLightStory(id){
    const story = HighlightStory.aggregate([
        {
            "$match": { "_id": id}
        },
        {
            $lookup: { from: 'stories', localField: 'storyList', foreignField: '_id', as: 'storyList' }
        },
        {
            $lookup: { from: 'users', localField: 'createdBy', foreignField: '_id', as: 'createdBy' }
        },
        {
            $project: {
                name: 1,
                storyList:{
                    _id: 1,
                    image: 1,
                    postedBy: 1,
                    viewedBy: 1,
                    disabled: 1,
                    createdAt: 1,
                },
                createdBy:{
                    _id: 1,
                    userName: 1,
                    avt: 1,
                },
                disabled: 1,
            }
        }
    ], function (err, highlightStory) {
        if (err) return {};
        return highlightStory;
    })
    return story
}

router.post('/api/story/createHighlightStory', auth ,(req,res)=>{
    const highlightStory = new HighlightStory({
        name: req.body.name,
        storyList: req.body.storyList,
        createdBy: req.user._id,
        disabled: false,
    });
    highlightStory.save((err, highlightStory) => {
        if(err) res.status(400).json({success: false})
        getHighLightStory(highlightStory._id).then((highlightStory) => {
            console.log(highlightStory);
            res.status(200).json({
                success: true,
                highlightStory
            })
        })
    })
})

router.get('/api/story/getAllStories',auth,(req,res)=>{
    Story.aggregate([
        {
            $match: { "postedBy": req.user._id}
        },
        {
            $match: { "disabled": false }
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
        },{"$sort": {"createdAt": -1 }}], function (err, stories) {
            if (err) return res.status(400).json(err);
            res.status(200).json(stories);
        }
    )
})

router.post('/api/story/editHighlightStory',auth,(req,res)=>{
    HighlightStory.findByIdAndUpdate(req.body.storyId,
        {
            $set: {
                name: req.body.name,
                storyList: req.body.storyList,
            }
        },
        { new: true }, (err, highlightStory) => {
            if (err) res.send(err)
            getHighLightStory(highlightStory._id).then((highlightStory) => {
                console.log(highlightStory);
                res.status(200).json({ success: true, highlightStory });
            })
        }
    )
})

module.exports = router
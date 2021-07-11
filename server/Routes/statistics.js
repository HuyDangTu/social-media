
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
const { Story } = require('../models/story');

const { auth } = require('../middleware/auth');
const { admin } = require('../middleware/admin');

router.get('/api/statistics/newAccountThisMonth', auth, admin, async (req,res)=>{

    let year = req.query.year ? req.query.year : new Date().getFullYear();
    let month = req.query.month ? req.query.month : new Date().getMonth();

    var firstDate = moment([year, month]);
    var lastDate = moment(firstDate).endOf('month');

    console.log(firstDate,lastDate)
    const usersThisMonth = await User.find({ $and: [
        { createdAt: { $gt: new Date(firstDate)}},
        { createdAt: { $lt: new Date(lastDate)}},
    ]  }).count().then((cnt, err)=>{
        if(err) res.status(400).json(err)
        return cnt
    })

    var firstDate = moment([year, month-1]);
    var lastDate = moment(firstDate).endOf('month');

    console.log(firstDate,lastDate)
    await User.find({ $and: [
        { createdAt: { $gt: new Date(firstDate)}},
        { createdAt: { $lt: new Date(lastDate)}},
    ] }).count().then((cnt, err)=>{
        if(err) res.status(400).json(err)
        return res.status(200).json({
            usersThisMonth,   
            usersLastMonth: cnt    
        })
    })

})

router.get('/api/statistics/newPostThisMonth', auth, admin, async (req,res)=>{
    
    let year = req.query.year ? req.query.year : new Date().getFullYear();
    let month = req.query.month ? req.query.month : new Date().getMonth();

    var firstDate = moment([year, month]);
    var lastDate = moment(firstDate).endOf('month');

    console.log(firstDate,lastDate)
    const postsThisMonth = await  Post.find({ $and: [
        { createdAt: { $gt: new Date(firstDate)}},
        { createdAt: { $lt: new Date(lastDate)}},
    ]}).count().then((cnt, err)=>{
        if(err) res.status(400).json(err)
        return cnt
    })

    var firstDate = moment([year, month-1]);
    var lastDate = moment(firstDate).endOf('month');

    console.log(firstDate,lastDate)
    await Post.find({ $and: [
        { createdAt: { $gt: new Date(firstDate)}},
        { createdAt: { $lt: new Date(lastDate)}},
    ] }).count().then((cnt, err)=>{
        if(err) res.status(400).json(err)
        return res.status(200).json({
            postsThisMonth,   
            postsLastMonth: cnt    
        })
    })

})


router.get('/api/statistics/numOfAccount', auth, admin, async(req,res)=>{  
        
    let year = req.query.year ? req.query.year : new Date().getFullYear();

    var firstDate = moment([year, 0]);

    var endDate = moment([year, 11]);
    var lastDate = moment(endDate).endOf('month');
    console.log(firstDate,lastDate)
    const usersThisYear = await User.find({ $and: [
        { createdAt: { $gt: new Date(firstDate)}},
        { createdAt: { $lt: new Date(lastDate)}},
    ]  }).count().then((cnt, err)=>{
        if(err) res.status(400).json(err)
        return cnt
    })
    firstDate = moment([year-1, 0]);
    endDate = moment([year-1, 11]);
    lastDate = moment(endDate).endOf('month');
    console.log(firstDate,lastDate)
    const usersLastYear = await User.find({ $and: [
        { createdAt: { $gt: new Date(firstDate)}},
        { createdAt: { $lt: new Date(lastDate)}},
    ] }).count().then((cnt, err)=>{
        if(err) res.status(400).json(err)
        return cnt
    })

    User.count().then((cnt, err)=>{
        if(err) res.status(400).json(err)
        res.status(200).json({
            cnt,
            usersThisYear,
            usersLastYear       
        })
    })
})

router.get('/api/statistics/unusedAccountSinceBeginOfThisYear', auth, admin, (req,res)=>{
    const startOfYear = moment().clone().startOf('year').format('YYYY-MM-DD');
    // const endOfMonth   = moment().clone().endOf('month').format('YYYY-MM-DD');
    // console.log(startOfMonth, endOfMonth)
    User.find(
        { updatedAt: { $lt: new Date(startOfYear) }},
    ).count().then((cnt, err)=>{
        if(err) res.status(400).json(err)
        res.status(200).json(cnt)
    })
})

router.get('/api/statistics/getTop10Users', auth, admin,(req, res) => {

    User.aggregate([
        {
            "$project": {
                "userName": 1,
                "_id": 1,
                "avt": 1,
                "length": { "$size": "$followers" },
            }
        },
        { "$sort": { "length": -1 } },
        { "$skip": 0 },
        { "$limit": 5 }
    ],
        function (err, users) {
            if (err) return res.status(400).send(err);
            res.status(200).json(users);
        }
    )
})

// ?id=5f90e95460842c39900e3ffb&sortBy=createdAt&order=desc&limit=6
router.get('/api/statistics/growthOfUser', auth, admin, async (req, res) => {
    
    let year = req.query.year ? req.query.year : new Date().getFullYear(); ;
    let Data = [];
    let month = 12;

    console.log(moment().month());
    if(year == moment().year()){
        month = moment().month()
    }

    for(let i = 1;i<=month;i++){

        var startDate = moment([year, i - 1]);
        var endDate = moment(startDate).endOf('month');

        const users = await User.find({ $and: [
            { createdAt: { $gt: new Date(startDate) } },
            { createdAt: { $lt: new Date(endDate) }},
        ]  }).count().then((cnt, err)=>{
            if(err) res.status(400).json(err)
            return cnt
        })

        Data.push({
            x: i,
            y: users
        })
    }

    return res.status(200).json(Data)
})

router.get('/api/statistics/userBehaviors', auth, admin, async (req, res) => {
    
    let year = req.query.year ? req.query.year : new Date().getFullYear(); ;
    let postsData = [];
    let storiesData = [];
    let commentsData = [];
    let reportsData = [];

    let month = 12;

    console.log(moment().month());
    if(year == moment().year()){
        month = moment().month()
    }

    for(let i = 1;i<=month;i++){

        var startDate = moment([year, i - 1]);
        var endDate = moment(startDate).endOf('month');

        const posts = await Post.find({ $and: [
            { createdAt: { $gt: new Date(startDate) } },
            { createdAt: { $lt: new Date(endDate) }},
        ]  }).count().then((cnt, err)=>{
            if(err) res.status(400).json(err)
            return cnt
        })

        postsData.push({
            x: i,
            y: posts
        })
    }

    for(let i = 1;i<=month;i++){

        var startDate = moment([year, i - 1]);
        var endDate = moment(startDate).endOf('month');

        const comments = await Comment.find({ $and: [
            { createdAt: { $gt: new Date(startDate) } },
            { createdAt: { $lt: new Date(endDate) }},
        ]  }).count().then((cnt, err)=>{
            if(err) res.status(400).json(err)
            return cnt
        })

        commentsData.push({
            x: i,
            y: comments
        })
    }
     for(let i = 1;i<=month;i++){

        var startDate = moment([year, i - 1]);
        var endDate = moment(startDate).endOf('month');

        const stories = await Story.find({ $and: [
            { createdAt: { $gt: new Date(startDate) } },
            { createdAt: { $lt: new Date(endDate) }},
        ]  }).count().then((cnt, err)=>{
            if(err) res.status(400).json(err)
            return cnt
        })

        storiesData.push({
            x: i,
            y: stories
        })
    }

    for(let i = 1;i<=month;i++){

        var startDate = moment([year, i - 1]);
        var endDate = moment(startDate).endOf('month');

        const reports = await Report.find({ $and: [
            { createdAt: { $gt: new Date(startDate) } },
            { createdAt: { $lt: new Date(endDate) }},
        ]}).count().then((cnt, err)=>{
            if(err) res.status(400).json(err)
            return cnt
        })
        
        reportsData.push({
            x: i,
            y: reports
        })
    }

    return res.status(200).json({
        postsData,
        storiesData,
        commentsData,
        reportsData,
    })
})
router.get('/api/statistics/userNationalities', auth, admin, async (req,res)=>{
    let year = req.query.year ? req.query.year : new Date().getFullYear();

    var firstDate = moment([year, 0]);
    var endDate = moment([year, 11]);
    var lastDate = moment(endDate).endOf('month');

    User.aggregate([
        {
            "$match":{ createdAt: { $lt: new Date(lastDate)}}
        },
        {
            $group:{
                "_id":"$nationality",
                count: { $sum: 1 }
            }
        },
        {
            $lookup: { from: 'nationalities', localField: '_id', foreignField: '_id', as: '_id' }
        },
        {
            "$project":{
                "_id":  {
                    "code": 1
                },
                "count": 1
            }
        }
    ],function(err,users){
        console.log(users)
        if (err) return res.status(400).json(err)
        return res.status(200).json(users)
    })
})

router.get('/api/statistics/percentageOfAge', auth, admin, async (req, res) => {
    
    let year = req.query.year ? req.query.year : new Date().getFullYear();
    let Data = [];
    const arr = [0,15,18,30,50,120];
    
    var endDate = moment([year, 11]);
    var lastDate = moment(endDate).endOf('month');

    for(let i = 1;i<arr.length;i++){

        const amountOfUsers = await User.aggregate([
            {
                "$match":{ createdAt: { $lt: new Date(lastDate)}}
            },
            {
                "$project":{
                    "_id": 1,
                    "age": {$divide:[{$subtract: [ new Date(), "$dob" ]}, (365 * 24*60*60*1000)]},
                    "userName": 1
                }
            },
            {
                "$match": { "age" : { "$gt": arr[i-1]}}
            },
            {
                "$match": {  "age" : { "$lt": arr[i]}}
            },
        ],function(err, users){
            if(err) return res.status(400).json(err)
            return users;
        })
        
        let id = `Dưới ${arr[i]}`;
    
        if(i == arr.length-1){
            id = "Trên 50";
        }

        Data.push({
            id:  id,
            label : `${arr[i-1]} - ${arr[i]}`,
            value: amountOfUsers.length, 
        })
    }

    return res.status(200).json(Data)
})

module.exports = router;
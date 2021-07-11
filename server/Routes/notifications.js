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

const { Notification } = require('../models/notification');
const { auth } = require('../middleware/auth');

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

router.get('/api/notify/getall', auth, (req, res) => {
    Notification.find({ "sentTo": req.user._id }).
    populate("sentFrom", "_id userName avt role")
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

router.post('/api/notify/seen/:id', auth, (req, res) => {
    Notification.findByIdAndUpdate(req.params.id, {
        $set: { seenStatus: true }
    }).exec((err, noti) => {
        if (err) res.status(400).json(err);
        else
            res.json(noti);
    })
})

router.post('/api/notify/disable/:id',auth,(req,res)=>{
    Notification.findByIdAndUpdate(req.params.id,{
        $set:{disabled:true,seenStatus:true}
    }).exec((err, data) => {
        if (err) {
            res.status(500).send(err)
        }
        else {
            res.json(data)
        }
    })
})

router.post('/api/notify/seenall', auth, (req, res) => {
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

module.exports = router;

// app.get('/api/notify/getall', auth, (req, res) => {
//     Notification.find({ "sentTo": req.user._id }).
//     populate("sentFrom", "_id userName avt role")
//     .sort({ "createdAt": -1 })
//     .exec((err, data) => {
//         if (err) {
//             res.status(500).send(err)
//         }
//         else {
//             res.json(data)
//         }
//     })
// })

// app.post('/api/notify/seen/:id', auth, (req, res) => {
//     Notification.findByIdAndUpdate(req.params.id, {
//         $set: { seenStatus: true }
//     }).exec((err, noti) => {
//         if (err) res.status(400).json(err);
//         else
//             res.json(noti);
//     })
// })

// app.post('/api/notify/disable/:id',auth,(req,res)=>{
//     Notification.findByIdAndUpdate(req.params.id,{
//         $set:{disabled:true,seenStatus:true}
//     }).exec((err, data) => {
//         if (err) {
//             res.status(500).send(err)
//         }
//         else {
//             res.json(data)
//         }
//     })
// })

// app.post('/api/notify/seenall', auth, (req, res) => {
//     Notification.update({ "sentTo": req.user._id }, {
//         $set: { seenStatus: true }
//     }, { multi: true })
//         .populate("sentFrom", "_id userName avt")
//         .sort({ "createdAt": -1 })
//         .exec((err, data) => {
//             if (err) {
//                 res.status(500).send(err)
//             }
//             else {
//                 res.json(data)
//             }
//         })
// })

// function SaveNotification(notification) {
//     if (JSON.stringify(notification.sentTo) != JSON.stringify(notification.sentFrom)) {
//         Notification.create(notification, (err, data) => {
//             if (err) {
//                 console.log(err)
//             }
//             else {
//                 console.log(data)
//             }
//         })
//     }

// }
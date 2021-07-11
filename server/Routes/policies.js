
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

const { Policy } = require('../models/policy');
const { auth } = require('../middleware/auth');

router.post('/api/policies/create', auth, (req, res) => {
    let policy = new Policy({
        content: req.body.content
    })

    policy.save((err, policy) => {
        if (err) return res.status(400).json({ err })
        res.status(200).json(policy)
    })
})

router.get('/api/policies/getAll', auth, (req, res) => {
    Policy.find()
        .exec((err, policies) => {
            if (err) return res.status(400).json({ err })
            res.status(200).json(policies)
        })
})

module.exports = router;
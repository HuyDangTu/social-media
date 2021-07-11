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
const { auth } = require('../../middleware/admin');

router.post('/api/users/loginAdmin', jsonParser, (req, res) => {
    // find the email
    User.findOne({ 'email': req.body.email }, (err, user) => {
        if (!user) return res.json({ loginSuccess: false, message: 'Auth failes,email not found' });
        //check password
        if (user.role === 0) res.json({ loginSuccess: false, message: 'Auth failes' });
        user.comparePassword(req.body.password, (err, isMatch) => {
            console.log(err);
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

module.exports = router;
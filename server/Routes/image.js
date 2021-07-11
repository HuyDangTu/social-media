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

const { auth } = require('../middleware/auth');

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

router.post('/api/upload', async (req,res)=>{
    try{
        const fileStr = req.body.data;
        const uploadResponse = await cloudinary.uploader.upload(fileStr)
        console.log(uploadResponse);
    }catch (error){
        console.error(error);
    }
})

router.post('/api/users/testUploadImage',(req, res) => {
    cloudinary.uploader.upload( req.body.uri ,(result) => {
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

router.get('/api/users/removeimage', auth, (req, res) => {
    let image_id = req.query.public_id;
    cloudinary.uploader.destroy(image_id, (error, result) => {
        if (error) return res.json({ success: false, error });
        res.status(200).send('ok');
    })
})

module.exports = router;
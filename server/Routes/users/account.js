const express = require("express");
var cors = require('cors')

const router = express.Router();
const app = express();
app.use(cors())
var bodyParser = require('body-parser');
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

// const bodyParser = require('body-parser');
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(express.bodyParser({ limit: '50mb' }));
// app.use(express.urlencoded({ limit: '50mb', extended: true }));
// const SHA1 = require("cryto-js/sha1");

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
const { auth } = require('../../middleware/auth');
const { admin } = require('../../middleware/admin');
const { sendEmail } = require('../../ultils/mail/index');


router.get('/api/users/auth', auth, (req, res) => {
    res.status(200).json({
        isAdmin: req.user.role === 0 ? false : true,
        isAuth: true,
        _id: req.user._id,
        email: req.user.email,
        name: req.user.name,
        privateMode: req.user.privateMode,
        lastname: req.user.lastname,
        request: req.user.request,
        avt: req.user.avt,
        bio: req.user.bio,
        followers: req.user.followers,
        followings: req.user.followings,
        userName: req.user.userName,
        dob: req.user.dob,
        nationality: req.user.nationality,
        saved: req.user.saved,
        hiddenPost: req.user.hiddenPost,
        blockedUsers: req.user.blockedUsers,
        restrictedFunctions: req.user.restrictedFunctions,
    });
});

router.post('/api/users/register', jsonParser, (req, res) => {

    let message = "", isValidUserName = false;
    User.findOne({ userName: req.body.userName}, (err, user) => {
        console.log(user)
        if (user) {
            message += "Username đã được sử dụng!";
            //isValidUserName = false;
            res.json({ success: false, err: message });
        } else {
            User.findOne({ email: req.body.email }, (err, user) => {
                console.log(user)
                if (user) {
                    message += "Username đã được sử dụng!";
                    //isValidUserName = false;
                    res.json({ success: false, err: message });
                } else {
                //isValidUserName = true;
                const newUser = new User(req.body);
                newUser.save((err, user) => {
                    if (err) return res.json({ success: false, err: "Thêm không thành công" });
                    sendEmail(user.email, user.userName, null, "welcome")
                    return res.status(200).json({
                        success: true,
                        message: "Thành công"
                    });
                });
            }});
        }
    })
    // .then(() => {
    //     if (isValidUserName) {
    //         const newUser = new User(req.body);
    //         newUser.save((err, user) => {
    //             if (err) return res.json({ success: false, err: "Thêm không thành công" });
    //             sendEmail(user.email, user.userName, null, "welcome")
    //             return res.status(200).json({
    //                 success: true,
    //                 message: "Thành công"
    //             });
    //         });
    //     } else {

    //         return res.json({ success: false, message: message });
    //     }
    // })
});

router.post('/api/users/login', jsonParser, (req, res) => {
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

router.post('/api/users/login', jsonParser, (req, res) => {
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

router.post('/api/users/loginByFaceGoogle', jsonParser, (req, res) => {
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

router.post('/api/users/loginByFaceGoogle', jsonParser, (req, res) => {
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

router.get('/api/users/logout', auth, (req, res) => {
    User.findOneAndUpdate(
        { _id: req.user._id },//tìm theo id
        { token: '' },//update token của user tìm đc bằng rổng
        //callback function 
        (err, doc) => {
            if (err) return res.json({ success: false, err });
            res.clearCookie('u_auth').status(200).send({
                success: true
            })
        }
    )
})

router.post('/api/accounts/getAll', auth, admin, (req, res) => {

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
        { "$sort": { "name": 1 } },
        { "$skip": skip },
        { "$limit": limit }
    ], function (err, accounts) {
        console.log(accounts);
        if (err) return res.status(400).send(err);
        res.status(200).json({
            accounts: accounts,
            size: accounts.length
        });
    })
})

router.post('/api/users/login', jsonParser, (req, res) => {
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

router.post('/api/users/changePassword', auth, (req, res) => {
    console.log()
    User.findOne({
        _id: req.user._id,
    }, (err, user) => {
        if (err) console.log(err)
        if (!user) return res.json({ success: false, message: "Lỗi! Vui lòng thử lại" })
        user.comparePassword(req.body.currentPassword, (err, isMatch) => {
            if (!isMatch) return res.json({ success: false, message: 'Mật khẩu hiện tại không đúng!' })
            user.password = req.body.password;
            console.log(user.password)
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




module.exports = router;
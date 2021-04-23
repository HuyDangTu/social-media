const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const moment =  require("moment");
const SALT_I = 10;
const Schema = mongoose.Schema;
require('dotenv').config();

const userSchema = mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        unique: 1
    },
    password: {
        type: String,
        required: true,
        minlength: 5,
    },
    name: {
        type: String,
        required: true,
        maxlength: 100
    },
    avt:{
        type: String,
        default: "https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcQ3F_4AEBUvIOQPFqcVFUsh5_eFIAHcdtExdA&usqp=CAU"
    },
    userName:{
        type: String,
        required: true,
        maxlength: 100
    },
    bio:{
        type: String,
        maxlength: 100,
        default: "" 
    },
    privateMode: {
        type: Boolean,
        default: false,
    },
    followers: [{
        type: Schema.Types.ObjectId,
        ref: "User"
    }],
    followings: [{
        type: Schema.Types.ObjectId,
        ref: "User"
    }],
    role: {
        type: Number,
        default: 0,
    },
    token: {
        type: String
    },
    hiddenPost:[{
        type: Schema.Types.ObjectId,
        ref: "Post"
    }],
    highlight:[{
        type: Schema.Types.ObjectId,
        ref: "HighlightStory"
    }],
    saved: [{
        type: Schema.Types.ObjectId,
        ref: "Post"
    }],
    resetToken: {
        type:String
    },
    resetTokenExp: {
        type: Number
    },
});

//callback function này được gọi trước phương thức save 
//để mã hóa password
userSchema.pre('save', function (next) {
    var user = this;
    if (user.isModified('password')) {
        bcrypt.genSalt(SALT_I, function (err, salt) {
            if (err) return next(err);
            bcrypt.hash(user.password, salt, function (err, hash) {
                bcrypt.hash(user.password, salt, function (err, hash) {
                    if (err) return next(err);
                    user.password = hash;
                    next();
                });
            })
        })
    } else {
        next();
    }
});

// định nghĩa các phương thức cho các đối tượng User này được sử dụng 
//------Phương thức kiểm tra mật khẩu----------
userSchema.methods.comparePassword = function (candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function (err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    })
}

userSchema.methods.gennerateResetToken = function(cb){
    var user = this;

    crypto.randomBytes(20,function(err,buffer){
        var token = buffer.toString('hex');

        var today = moment().startOf('day').valueOf();
        var tomorow = moment(today).endOf('day').valueOf();

        user.resetToken = token;
        user.resetTokenExp = tomorow;

        user.save((function(err,user){
            if(err) return scrollBy(err); 
            cb(null,user);
        }))
    })
}


//------Phương thức tạo jwt sau khi đăng nhập thành công----------
userSchema.methods.gennerateToken = function (cb) {
    var user = this;
    var token = jwt.sign(user._id.toHexString(), process.env.SECRET)

    user.token = token;
    user.save(function (err, user) {
        if (err) return cb(err)
        cb(null, user);
    })
}


userSchema.statics.findByToken = function (token, cb) {
    var user = this;
    jwt.verify(token, process.env.SECRET, function (err, decode) {
        user.findOne({ "_id": decode, "token": token }, function (err, user) {
            if (err) return cb(err);
            cb(null, user);
        })
    })
}

const User = mongoose.model('User', userSchema);

//export module User
module.exports = { User }
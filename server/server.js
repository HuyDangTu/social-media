const express = require("express");
var cors = require('cors')


const app = express();
const Pusher = require("pusher");
// const bodyParser = require('body-parser');
app.use(cors())
var bodyParser = require('body-parser');
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));
// // app.use(express.bodyParser({ limit: '50mb' }));
// // app.use(express.urlencoded({ limit: '50mb', extended: true }));
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
    const grme = await mongoose.connection.collection('groups')
    const addgrmess = grme.watch()
    addgrmess.on('change', (change) => {
        pusher.trigger("groups", "newGroupmess", {
            "change": change
        });
    })
})

mongoose.connection.on('connected', () => {
    console.log("mongoose is ready");
})

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
})

// ============== MODEL ===============
const { User } = require("./models/user");
const { Comment } = require('./models/comment');
const { Post } = require('./models/post');
const { Tag } = require('./models/tag');
const { Report } = require('./models/report');
const { Policy } = require('./models/policy');
const { Story } = require('./models/story');
const { HighlightStory } = require('./models/highlightStory');
const { Message } = require('./models/message');
const { Conversation } = require('./models/conversations');
const { Notification } = require('./models/notification');
const { Group } = require('./models/group');
const { Groupmess} = require('./models/groupmess');
const { Nationality } = require('./models/nationality');
//=============== MIDDLEWARE ===========
const { auth } = require('./middleware/auth');
const { admin } = require('./middleware/admin');
const { response } = require("express");
const post = require("./models/post");

//ULTILS
const { sendEmail } = require('./ultils/mail/index');
const user = require("./models/user");
const { error } = require("console");
const { ppid } = require("process");

// ============== API ===============
//TEST
app.post('/api/posts/add_new', (req, res) => {
    res.status(200).json({
        success: true
    })
})

app.get('/api/users/nationality', (req,res)=>{
    Nationality.find({}).then((err,doc)=>{
        if(err) return res.json(err)
        return res.status(200).json({doc});
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
        request: req.user.request,
        avt: req.user.avt,
        bio: req.user.bio,
        followers: req.user.followers,
        followings: req.user.followings,
        userName: req.user.userName,
        saved: req.user.saved,
        hiddenPost: req.user.hiddenPost,
        blockedUsers: req.user.blockedUsers,
        restrictedFunctions: req.user.restrictedFunctions,
    });
});

// =========================
//          USER
// =========================
///
app.post('/api/pusher/auth/:id', (req, res) => {
    const socketId = req.body.socket_id;
    const channel = req.body.channel_name;
    let id = req.params.id
    User.findById(id,(err,user)=>{
        if(err) throw err;
        
        if(!user) return res.json({
            isAuth: false,
            error: true
        });      
        //use later
        console.log(user);
        var presenceData = {
            user_id: user._id,
            user_info: {
                avt: user.avt,
                userName: user.userName,
                id:user._id
            }
        }
        const auth = pusher.authenticate(socketId, channel, presenceData);
        console.log(auth)
        res.send(auth);
    })
    
});

///
//REGISTER 
app.post('/api/users/register', jsonParser, (req, res) => {

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

//LOGIN
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
/////////////GROUP
app.post('/api/messages/group/create',auth,(req,res)=>{
    const gr = new Group({
        user: req.body.user,
        seenBy: [(req.user._id)],
    })
    Group.create(gr, (err, group) => {
        if (err) {
            res.status(500).send(err)
        }
        else {
            res.json(group)
            const mess = new Message({
                sentBy: req.user._id,
                sentTo: group._id,
                seenBy: [req.user._id],
                type: "event",
                content: req.user.userName + " đã tạo cuộc trò chuyện"
            });
            Groupmess.create(mess, (err, data) => {
                if (err) {
                    res.status(500).send(err)
                }
                else {
                    Group.findOneAndUpdate(
                        {
                            _id : { $eq : data.sentTo }
                        }
                        , {
                            $push: {
                                messagelist: data._id
                            },
                            $set: {
                                lastMess: data._id,
                                lastMessageTimestamp: data.updatedAt
                            },
                         
                        }, {
        
                    }, (err, doc) => {
                     
                        if (err) {
                            console.log(err)
                        }
                        else {
                            console.log(data)
                        }
                    })
                }
            })
        }
    })
})

app.post('/api/messages/group/seen/:id', auth, (req, res) => {
    Group.findByIdAndUpdate(req.params.id, { $addToSet: { seenBy: req.user._id } })
        .exec((err, data) => {
            if (err) {
                res.status(500).send(err)
            }
            else {
                res.json(data)
            }
        })
})

app.post('/api/messages/group/seenall', auth, (req, res) => {
    Group.updateMany( 
        { user: { $in: req.user._id }},
        {
            $addToSet:   { seenBy: req.user._id }
        },
        {
            new:true
        }
    ).exec((err, data) => {
        if (err) {
            res.status(500).send(err)
        }
        else {
            res.json(data)
        }
    })
})


app.post('/api/messages/group/disable/:id', auth, (req, res) => {
    Group.findByIdAndUpdate(req.params.id, { $addToSet: { disabledBy: req.user._id } })
        .exec((err, data) => {
            if (err) {
                res.status(500).send(err)
            }
            else {
                res.json(data)
            }
        })
})


app.post('/api/messages/group/addmember/:id',auth,(req,res)=>{
    const  userlist  = [req.body.user]
    const userlistid = [req.body.userid]
    userlistid.map(uid=>{
        Group.findByIdAndUpdate({_id:req.params.id}, 
            {
                $addToSet:{user:uid},
                $set:{seenBy:[(req.user._id)],disabledBy:[]}
            },
            (err, group) => {
            if (err) {
                console.log(err)
            }
            if(group) {
                User.findOne({ _id: uid })
                    .select('-password')
                    .then((user) => {
                        const mess = new Message({
                            sentBy: req.user._id,
                            sentTo: req.params._id,
                            type: "event",
                            content: req.user.userName + " đã thêm "+ user.userName + " vào cuộc trò chuyện"
                        })
                        Groupmess.create(mess, (err, data) => {
                            if (err) {
                                res.status(500).send(err)
                            }
                            else {
                                Group.findOneAndUpdate(
                                    {
                                        _id : { $eq : req.params.id }
                                    }
                                    , {
                                        $push: {
                                            messagelist: data._id
                                        },
                                        $set: {
                                            lastMess: data._id,
                                            lastMessageTimestamp: data.updatedAt
                                        },
                                     
                                    }, {
                    
                                }, (err, doc) => {
                                 
                                    if (err) {
                                        console.log(err)
                                    }
                                    else {
                                        console.log(doc)
                                    }
                                })
                            }
                        })
                        
                    })
            }
        })
      
    })
        Group.findOne({_id:req.params.id}, 
            (err, group) => {
            if (err) {
                res.status(500).send(err)
            }
            else {
              res.json(group)
            }
        })
})

app.post('/api/messages/group/replyStory',auth,(req,res)=>{
    Group.findOne( 
        { $and: [{ user: { $in: req.user._id } }, { user: { $in: req.body.sentTo }},{ type:{$eq:'personal'} }] }
    )
    .exec((err, data) => {
        if (err) {
            res.json(err)
        }
        else{
            if (data == null)
            {
                const gr = new Group({
                    user: [(req.user._id),(req.body.sentTo)],
                    seenBy: [(req.user._id)],
                    type: "personal"
                })
                Group.create(gr, (err, group) => {
                    if (err) {
                        res.status(500).send(err)
                    }
                    else {
                        const mess = new Message({
                            sentBy: req.user._id,
                            sentTo: group._id,
                            seenBy: [req.user._id],
                            type: req.body.type,
                            attachment: req.body.attachment, 
                            content: req.body.content
                        });
                        Groupmess.create(mess, (err, data) => {
                            if (err) {
                                res.status(500).send(err)
                            }
                            else {
                                Group.findOneAndUpdate(
                                    {
                                        _id : { $eq : data.sentTo }
                                    }, 
                                    {
                                        $push: {
                                            messagelist: data._id
                                        },
                                        $set: {
                                            lastMess: data._id,
                                            lastMessageTimestamp: data.updatedAt
                                        },
                                     
                                    }, {
                                    new: true
                                }, (err, doc) => {
                                    if (err) {
                                        console.log(err)
                                    }
                                    else {
                                        return res.json(doc);
                                    }
                                })
                            }
                        })
                    }
                })
            }
            else{
                const mess = new Message({
                    sentBy: req.user._id,
                    sentTo: data._id,
                    seenBy: [req.user._id],
                    type: req.body.type,
                    attachment: req.body.attachment, 
                    content: req.body.content
                });
                Groupmess.create(mess, (err, data) => {
                    if (err) {
                        res.status(500).send(err)
                    }
                    else {
                        Group.findOneAndUpdate(
                            {
                                _id : { $eq : data.sentTo }
                            }
                            , {
                                $push: {
                                    messagelist: data._id
                                },
                                $set: {
                                    lastMess: data._id,
                                    lastMessageTimestamp: data.updatedAt
                                },
                                
                            }, {
                            new: true
                        }, (err, doc) => {
                            if (err) {
                                res.status(500).send(err)
                            }
                            else {
                                res.status(200).json(doc);
                            }
                        })
                    }
                })
            }
        }
    })
})

app.post('/api/messages/group/person/find/:id',auth,(req,res)=>{
    Group.findOne( 
        { $and: [{ user: { $in: req.user._id } }, { user: { $in: req.params.id }},{ type:{$eq:'personal'} }] }
    )
    .exec((err, data) => {
        if (err) {
            res.json(err)
        }
        else{
            if (data == null)
            {
                const gr = new Group({
                    user: [(req.user._id),(req.params.id)],
                    seenBy: [(req.user._id)],
                    type: "personal"
                })
                Group.create(gr, (err, group) => {
                    if (err) {
                        res.status(500).send(err)
                    }
                    else {
                        res.json(group)
                        const mess = new Message({
                            sentBy: req.user._id,
                            sentTo: group._id,
                            seenBy: [req.user._id],
                            type: "event",
                            content: req.user.userName + " đã bắt đầu cuộc trò chuyện"
                        });
                        Groupmess.create(mess, (err, data) => {
                            if (err) {
                                res.status(500).send(err)
                            }
                            else {
                                Group.findOneAndUpdate(
                                    {
                                        _id : { $eq : data.sentTo }
                                    }
                                    , {
                                        $push: {
                                            messagelist: data._id
                                        },
                                        $set: {
                                            lastMess: data._id,
                                            lastMessageTimestamp: data.updatedAt
                                        },
                                     
                                    }, {
                    
                                }, (err, doc) => {
                                 
                                    if (err) {
                                        console.log(err)
                                    }
                                    else {
                                        console.log(data)
                                    }
                                })
                            }
                        })
                    }
                })
            }
            else{
                res.json(data)
            }
        }
    })
})

app.post('/api/messages/group/remove/:id',auth,(req,res)=>{
    let exit = ""
        Group.findOneAndUpdate({_id:req.params.id}, 
            {
                $pull:{user : req.body.uid},
                $set:{seenBy:[(req.user._id)],disabledBy:[]}
            },
            (err, group) => {
            if (err) {
                console.log(err)
            }
            if(group) {
                User.findOne({ _id: req.body.uid })
                    .select('-password')
                    .then((result) => {
                        if(req.user.id==req.body.uid)
                        {
                            exit = req.user.userName + " đã thoát khỏi cuộc trò chuyện"
                        }
                        else
                        {
                            exit = req.user.userName + " đã xóa "+ result.userName + " khỏi cuộc trò chuyện"
                        }
                        const mess = new Message({
                            sentBy: req.user._id,
                            sentTo: req.params._id,
                            type: "event",
                            content: exit
                        })
                        Groupmess.create(mess, (err, data) => {
                            if (err) {
                                res.status(500).send(err)
                            }
                            else {
                                Group.findOneAndUpdate(
                                    {
                                        _id : { $eq : req.params.id }
                                    }
                                    , {
                                        $push: {
                                            messagelist: data._id
                                        },
                                        $set: {
                                            lastMess: data._id,
                                            lastMessageTimestamp: data.updatedAt
                                        },
                                     
                                    }, {
                    
                                }, (err, doc) => {
                                 
                                    if (err) {
                                        console.log(err)
                                    }
                                    else {
                                        console.log(doc)
                                    }
                                })
                            }
                        })
                        
                    })
            
            res.json(group)
                }
        })
})

app.post('/api/messages/group/save', auth,jsonParser, (req, res) => {
    const dbMess = req.body
    console.log(dbMess);
    Groupmess.create(dbMess, (err, data) => {
        if (err) {
            res.status(500).send(err)
        }
        else {
            console.log(data)
            Group.findOneAndUpdate(
                {
                    _id : { $eq : data.sentTo }
                }
                , {
                    $push: {
                        messagelist: data._id
                    },
                    $set: {
                        lastMess: data._id,
                        seenBy:[(req.user._id)],
                        lastMessageTimestamp: data.updatedAt,
                        disabledBy:[]
                    },
                }, {
            },(err, doc) => {
                if (err) {
                    console.log(err)
                }
                else {
                    console.log(doc)
                    res.status(200).json(doc);
                }
            })
        }
    })
})

app.get('/api/messages/group/find',auth,(req,res)=>{
    Group.find( { user : { $in : req.user._id } })
    .populate("user", "_id userName avt")
    .populate("lastMess")
    .populate({ 
        path: 'lastMess',
        populate: {
          path: 'sentBy',
          model: 'User',
          select: "_id userName avt"
        } 
     })

    .sort([["lastMessageTimestamp",-1]])
    .exec((err, data) => {
        if (err) {
            res.status(500).send(err)
        }
        else{
            res.json(data)
        }
    })
})
app.post('/api/messages/group/edittitle/:id',auth,(req,res)=>{
    Group.findByIdAndUpdate({_id:req.params.id},
        {
            $set:{title:req.body.title}
        }).exec((err, conversation) => {
            if (err) res.status(400).json(err);
            res.status(200).json({conversation});
        })
})
app.get('/api/messages/group/get/:id', auth, (req, res) => {
    Group.findOne( {_id: { $eq: req.params.id }})
        .populate("messagelist")
        .populate("user", "_id userName avt")
        .populate("lastMess")
        .populate({ 
            path: 'messagelist',
            populate: {
              path: 'sentBy',
              model: 'User',
              select: "_id userName avt"
            } 
         })
         .populate({ 
            path: 'seenBy',
              select: "_id userName avt"
            })
        .exec((err, data) => {
            if (err) {
                res.status(500).send(err)
            }
            else {
                if (data == null) {
                    // const conversation = new Conversation({
                    //     user1: req.params.id,
                    //     user2: req.user._id,
                    //     seenBy: [(req.user._id)]
                    // })
                    // Conversation.create(conversation, (err, conver) => {
                    //     if (err) {
                    //         res.status(500).send(err)
                    //     }
                    //     else {
                    //         res.json(conver)
                    //     }
                    // })
                }
                else (res.json(data))
            }
        })
})
app.post('/api/messages/group/updatepic', auth, (req, res) => {
    Group.findByIdAndUpdate( req.body.id, { $set: { groupimg: req.body.url } }, { new: true },
        (err, result) => {
            if (err) {
                return res.json({ success: false, message: "Đã xảy ra lỗi" ,err:err})
            }
            else{    
                const mess = new Message({
                    sentBy: req.user._id,
                    sentTo: result._id,
                    type: "event",
                    content: req.user.userName + " đã đổi hình ảnh cuộc trò chuyện"
                });
                Groupmess.create(mess, (err, data) => {
                    if (err) {
                        res.status(500).send(err)
                    }
                    else {
                        Group.findOneAndUpdate(
                            {
                                _id : { $eq : data.sentTo }
                            }
                            , {
                                $push: {
                                    messagelist: data._id
                                },
                                $set: {
                                    lastMess: data._id
                                },
                             
                            }, {
            
                        }, (err, doc) => {
                         
                            if (err) {
                                console.log(err)
                            }
                            else {
                                console.log(data)
                            }
                        })
                    }
                })
                res.json({ success: true, message: "Đã đổi thành công ảnh đại diện",result:result })
            }
           
        })
    

})
//LOGIN
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
app.get('/api/users/logout', auth, (req, res) => {
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
                , { $inc: { "cart.$.quantity": 1 } },
                { new: true }
                , () => {
                    console.log(doc.cart)
                    if (err) return res.json({ success: false, err })

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
app.post('/api/users/uploadimage', auth, formidable(), (req, res) => {
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

app.post('/api/upload', async (req,res)=>{
    try{
        const fileStr = req.body.data;
        const uploadResponse = await cloudinary.uploader.upload(fileStr)
        console.log(uploadResponse);
    }catch (error){
        console.error(error);
    }
})

app.post('/api/users/testUploadImage',(req, res) => {
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

app.get('/api/users/removeimage', auth, (req, res) => {
    let image_id = req.query.public_id;
    cloudinary.uploader.destroy(image_id, (error, result) => {
        if (error) return res.json({ success: false, error });
        res.status(200).send('ok');
    })
})

// ====================
//          POST
// ====================

//------- ADD NEW -----------//
app.post('/api/posts/create_post', auth, (req, res) => {
    if(!isRestricted(req.user.restrictedFunctions,"Post")){
    User.find({ userName: { $in: req.body.userTag } })
        .select("_id")
        .exec((err, users) => {
            if (err) return res.status(400).json(err);
            let userTag = [];
            users.forEach((item) => {
                userTag.push(item._id);
            })
            console.log(userTag)
            const post = new Post({
                images: req.body.images,
                description: req.body.description,
                locationName: req.body.locationInput,
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
    }else{
        res.status(200).json({restricted: true, restrictedFunction: req.user.restrictedFunctions.find(item => item.function == "Post")});
    }
})

app.post('/api/posts/update_post', auth, (req, res) => {

    Tag.find({ posts: { $elemMatch: { $eq: req.body.postId } } })
        .exec((err, tags) => {
            const oldTag = [];
            tags.forEach((item) => {
                //Xóa id bài viết khỏi trường posts của tag
                if (!req.body.tags.includes(item.name)) {
                    var query = { name: item.name },
                        update = { $pull: { posts: req.body.postId } };
                    Tag.findOneAndUpdate(query, update, function (error, result) {
                        if (error) return;
                        console.log(result);
                    });
                } else {
                    oldTag.push(item.name)
                }
            });

            req.body.tags.forEach((item) => {
                if (!oldTag.includes(item)) {
                    var query = { name: item }
                    update = { $push: { posts: req.body.postId } },
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
                        userTag: userTag,
                        locationName: req.body.locationInput
                    }
                },
                { new: true }, (err, post) => {
                    if (err) res.send(err)
                    findPost(post._id, req.user.hiddenPost).then((post) => {
                        console.log(post);
                        return res.status(200).json({ success: true, post });
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
        res.status(200).json({ success: true, post: post});
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

function findPost(postId, userHiddenPost, blockedUsers) {
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
                "locationName": 1,
                "description": 1,
                "postedBy": {
                    "_id": 1,
                    "avt": 1,
                    "userName": 1,
                },
                "createdAt": 1,
                "updatedAt": 1,
            }
        }, {
            "$sort": { "comments.createdAt": -1 }
        },
        {
            "$group": {
                _id: '$_id',
                locationName: {$first :'$locationName'},
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
        }], function (err, post) {
            if (err) return {} 
            return post[0];
        }
    )
    return post;
}

app.post('/api/posts/getpostFormtag', auth, (req, res) => {
    let postId = []
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
        if (err) res.status(400).json(err)
        tags.forEach(item => {
            postId = [...postId, ...item.posts]
        })
        res.status(200).json(postId);
    })
});

function findBlockedUsers(id){
    console.log(id)
    return result = User.aggregate([
        {
            "$match": { "_id": ObjectId(id) }
        },
        {
            "$project": {
                "blockedUsers": 1,
            }
        },
    ], function (err,user){
        if(err) return []
        return user
    })
}

app.get('/api/posts/postDetail', auth, (req, res) => {

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

    findPost(items, req.user.hiddenPost, req.user.blockedUsers).then((post) => {
        console.log(post)
        if(post.length == 0){
            console.log("11111111111111111111")
            return res.status(200).json({ NotFound: true });   
        }else{
            if(req.user.blockedUsers.includes(post[0].postedBy[0]._id)){
                console.log("22222222222222222")
                
                return res.status(200).json({ NotFound: true });   
            } 
            else{
                findBlockedUsers(post[0].postedBy[0]._id).then((result) => {
                    console.log("result", result);
                    if(result[0].blockedUsers.includes(Object(req.user._id))){
                        console.log("3333333333333333333")
                        return res.status(200).json({ NotFound: true });
                    }else{
                        console.log("4444444444444444444444444")
                        return res.status(200).json(post[0]);
                    }
                })
            }
        }
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
                "locationName": 1,
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
                locationName: {$first :'$locationName'},
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

app.post('/api/users/newfeed', auth, (req, res) => {

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
                "locationName": 1,

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
                locationName: {$first :'$locationName'},
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
    })
})

app.post('/api/users/getRecommendPost',auth,(req,res)=>{

    let limit = req.body.limit ? parseInt(req.body.limit) : 3;
    let skip = req.body.skip ? parseInt(req.body.skip) : 0;

    Tag.aggregate([
        {
            "$match": { "followers": { $elemMatch: { $eq: req.user._id } }}
        }
        ], function (err, tags) {
        if (err) return res.status(400).send(err);
        let posts = [];
        // lấy danh sách bài viết
        tags.map(item=>{
            posts=[...posts,...item.posts]
        })
        // Xóa id bị trùng
        const removedDuplicate = new Set(posts)
        const backToArray = [...removedDuplicate]
        // Lấy bài viết 
        Post.aggregate([
        {
            "$match": { "_id": { "$in": backToArray } }
        },
        {
            "$match": { "postedBy": { "$nin": req.user.blockedUsers } }
        },
        {
            "$match": { "postedBy": { "$nin": req.user.blockedUsers } }
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
                "locationName": 1,
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
                locationName: {$first :'$locationName'},
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
                posts,
                size: posts.length
            });
        })
    })
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

app.post('/api/tags/newTag', auth, (req, res) => {
    const tag = new Tag({
        ...req.body,
    });
    tag.save((err, tag) => {
        if (err) return res.status(400).send(err);
        res.send(tag);
    })
})

app.get('/api/tags/getAllTags', (req, res) => {
    Tag.find().exec((err, tags) => {
        if (err) return res.status(400).send(err);
        res.send(tags);
    })
});

//tag?id=5f90e95460842c39900e3ffb&sortBy=createdAt&order=desc&limit=6

app.post('/api/tags/getTag', auth, (req, res) => {
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

app.get('/api/tags/getFollowers', auth, (req, res) => {
    
    User.find({ "_id": { $in: req.user.followings } })
        .select('userName -_id')
        .limit(5)
        .exec((err, followings) => {
            if (err) return res.status(400).send(err);
            res.send(followings);
        })
});

app.get('/api/users/blockedUsers', auth, (req, res) => { 
    User.find({ "_id": { $in: req.user.blockedUsers } })
        .select('userName _id avt')
        .exec((err, users) => {
            if (err) return res.status(400).send(err);
            res.send(users);
        })
});

app.get('/api/posts/location/:name',auth,(req,res)=>{
    Post.find({"locationName": req.params.name})
    .exec((err, posts) => {
        if (err) return res.status(400).send(err);
        res.send(posts);
    })
});

app.post('/api/tags/getTop10Tags', auth, (req, res) => {

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

app.put('/api/posts/save', auth, (req, res) => {
    if(!isRestricted(req.user.restrictedFunctions,"Save")){ 
        User.findByIdAndUpdate(req.user._id, {
            $push: { saved: req.body.postId }
        }, {
            new: true
        }).exec((err, user) => {
            if (err) res.status(400).json(err);
            res.status(200).json({user});
        })
    }else{
        res.status(200).json({restricted: true,restrictedFunction: req.user.restrictedFunctions.find(item => item.function == "Save")});
    }
})

app.put('/api/posts/unSave', auth, (req, res) => {
    if(!isRestricted(req.user.restrictedFunctions,"Save")){   
        User.findByIdAndUpdate(req.user._id, {
            $pull: { saved: req.body.postId }
        },{
            new: true
        }).exec((err, user) => {
            if (err) res.status(400).json(err);
            res.status(200).json({user});
        })
    }else{
        res.status(200).json({restricted: true,restrictedFunction: req.user.restrictedFunctions.find(item => item.function == "Like")});
    }
})

app.put('/api/posts/like', auth, (req, res) => {
    if(!isRestricted(req.user.restrictedFunctions,"Like")){
        Post.findByIdAndUpdate(req.body.postId, {
            $push: { likes: req.user._id }
        }, {
            new: true
        }).exec((err, post) => {
            if (err) res.status(400).json(err);
            findPost(req.body.postId, req.user.hiddenPost).then((post) => {
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
    }else{
        res.status(200).json({restricted: true,restrictedFunction: req.user.restrictedFunctions.find(item => item.function == "Like")});
    }
})

app.put('/api/posts/unlike', auth, (req, res) => {
    if(!isRestricted(req.user.restrictedFunctions,"Like")){
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
    }else{
        res.status(200).json({restricted: true,restrictedFunction: req.user.restrictedFunctions.find(item => item.function == "Like")});
    }
})

///////////////////
//Mới
///////////////////

app.get('/api/users/:id', auth, (req, res) => {
    User.findOne({ _id: req.params.id })
        .populate("followers", "_id userName avt")
        .populate("followings", "_id userName avt")
        
        .select("-password")
        .then(user => {
            if(!req.user.blockedUsers.includes(user._id) && !user.blockedUsers.includes(req.user._id)){
                Post.find({ 
                    postedBy: req.params.id
                })
                .populate("postedBy", "_id userName")
                .exec((err, posts) => {
                    if (err) {
                        return res.status(422).json({ error: err })
                    }
                    return res.status(200).json({ user, posts })
                })
            }else{
                return res.status(200).json({NotFound: true})
            }
        }).catch(err => {
            return res.status(404).json({ err })
        })
})

app.get('/api/users/profile/:id', auth, (req, res) => {
    User.findOne({ _id: req.params.id, _id: {$nin: req.user.blookedUsers} })
        .select('-password')
        .then((err,user) => {
            if(err) return res.status(400).json({success: false})
            else if(user) return res.status(200).json(user);
            else return res.status(200).json({success: false})
        })
})

app.get('/api/users/tagged/:id', auth, (req, res) => {
    Post.find({ userTag: req.params.id, hidden: {$eq: false}})
    .populate("userTag", "_id userName")
    .sort({ "createdAt": -1 })
    .exec((err, posts) => {
        if (err) {
            return res.status(422).json({ error: err })
        }
        res.json({ posts })
    })
})

app.post('/api/users/getSavedPost', auth, (req, res) => {

    Post.find({_id:{$in: req.user.saved}})
    .sort({ "createdAt": -1 })
    .exec((err, posts) => {
        if (err) return res.status(422).json({ error: err })
        res.status(200).json({posts})
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

app.put('/api/users/updatePrivate', auth, (req, res)=>{
    User.findByIdAndUpdate(req.user._id, { $set: { privateMode: req.body.privateMode } }, { new: true },
        (err, result) => {
            if (err) {
                return res.json({ success: false, message: "Đã xảy ra lỗi" })
            }
            else{
                return res.json({ success: true, message: "Đã đổi thành công" })
            }
        })
})

app.put('/api/users/updatepic', auth, (req, res) => {
    User.findByIdAndUpdate(req.user._id, { $set: { avt: req.body.url } }, { new: true },
        (err, result) => {
            if (err) {
                return res.json({ success: false, message: "Đã xảy ra lỗi" })
            }
            else{
                return res.json({ success: true, message: "Đã đổi thành công ảnh đại diện" })
            }
        })
})



app.put('/api/users/update/:id', auth, jsonParser, (req, res) => {
    let message = "", isValidUserName = false;
    User.findOne({ userName: req.body.userName.trim() }, (err, user) => {
        console.log(user)
        if (user) {
            if( JSON.stringify(user._id) == JSON.stringify(req.user._id))
            {
              isValidUserName = true;
            }
            else{
                message += "Username đã được sử dụng";
                isValidUserName = false;
            }
        } else {
            isValidUserName = true;
        }
    }).then(() => {
        if (isValidUserName) {
            User.findByIdAndUpdate(req.params.id,
                {
                    $set: {
                        userName: req.body.userName.trim(),
                        bio: req.body.bio,
                        name: req.body.name,
                        email: req.body.email.trim(),
                        privateMode: req.body.privateMode,
                    }
                }, {
                new: false
            }, function (err, doc) {
                if (err) {
                    res.send(err)
                }
            }).then(result =>
                res.json({ success: true, message: "Thành công" })
            )
        }
        else {
            return res.json({ success: false, message: message });
        }
    })
})

app.put('/api/users/askfollow/:followId',auth,(req,res)=>{
    const notification = new Notification({
        sentFrom: req.user._id,
        sentTo: req.params.followId,
        type: "askfollow",
        link: req.user._id,
        "seenStatus": false
    });
    User.findByIdAndUpdate(req.params.followId,{
        $addToSet: {request: req.user._id }
    }, {
        new: true
    }) .populate("followers", "_id userName avt")
    .populate("followings", "_id userName avt")
   
    .then(results=>
        {
            res.json(results)
        })
    SaveNotification(notification);
})

app.put('/api/users/declinefollow/:id',auth,(req,res)=>{
    Notification.updateMany( 
        {"sentFrom": req.params.id, "sentTo":req.user._id  , "type": 'askfollow'},
        {
            $set:   { disabled:true}
        },
        {
            new:true
        }
    ).catch(err=>console.log(err))
    User.findByIdAndUpdate(req.user._id,{
        $pull:{request:req.params.id}
    }).exec((err,result)=>{
        if(err){
            console.log(err)
        }
        else{
            res.json('success')
            console.log(result)
        }
    })
})

app.put('/api/users/acceptfollow/:id',auth,(req,res)=>{
   
    Notification.updateMany( 
        {"sentFrom": req.params.id, "sentTo":req.user._id  , "type": 'askfollow'},
        {
            $set:   { disabled:true}
        },
        {
            new:true
        }
    ).catch(err=>console.log(err))
    const notification = new Notification({
        sentFrom: req.user._id,
        sentTo: req.params.id,
        type: "acceptfollow",
        link: req.user._id,
        "seenStatus": false
    });
    SaveNotification(notification);
    User.findByIdAndUpdate(req.params.id,{
        $addToSet:{followings:req.user._id}
    }).exec((err,result)=>{
        if(err){
            console.log(err)
        }
        else{
           
            console.log(result)
        }})
    User.findByIdAndUpdate(req.user._id,{
        $addToSet:{followers:req.params.id},
        $pull:{request:req.params.id}
    }).exec((err,result)=>{
        if(err){
            console.log(err)
        }
        else{
            res.json('success')
            console.log(result)
        }
    })
})
app.put('/api/users/undoaskfollow/:followId',auth,(req,res)=>{
    Notification.updateMany( 
        {"sentFrom": req.user._id , "sentTo": req.params.followId , "type": 'askfollow'},
        {
            $set:   { disabled:true}
        },
        {
            new:true
        }
    ).catch(err=>console.log(err))
    User.findByIdAndUpdate(req.params.followId,{
        $pull: {request: req.user._id }
    }, {
        new: true
    }) .populate("followers", "_id userName avt")
    .populate("followings", "_id userName avt")
    .then(results=>
        {
            res.json(results)
        })
    
})

app.put('/api/users/follow/:followId', auth, (req, res) => {
    if(!isRestricted(req.user.restrictedFunctions,"Follow")){
        User.findById(req.params.followId)
        User.findByIdAndUpdate(req.params.followId, {
            $push: { followers: req.user._id }
        }, {
            new: true
        })
            .populate("followers", "_id userName avt")
            .populate("followings", "_id userName avt")
            .populate("request", "_id userName avt")
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
    }else{
        res.status(200).json({restricted: true,restrictedFunction: req.user.restrictedFunctions.find(item => item.function == "Follow") });
    }
})

app.put('/api/users/block/:id', auth,(req,res)=>{
    User.findOneAndUpdate(
        {"_id": req.user.id}, 
        {$pull: { followings: req.params.id, followers: req.params.id}, $push: { blockedUsers: req.params.id}},
        {new: true},
        (err, user) => {
            if (err) return res.status(400).json({success: false});
            User.findOneAndUpdate(
                {"_id": req.params.id}, 
                {$pull: { followers: req.user._id,followings: req.user._id }},
                { new: true}, (err, results) => {
                if (err) return res.status(400).json({success: false});
                return res.status(200).json({ success: true, userId: req.params.id })
            })
        })
})

app.put('/api/users/unblock/:id', auth,(req,res)=>{
    User.findOneAndUpdate(
        {"_id": req.user.id}, 
        {$pull: { blockedUsers: req.params.id}},
        {new: true},
        (err, user) => {
            if (err) return res.status(400).json({success: false});
            return res.status(200).json({ success: true, userId: req.params.id })
        })
})

app.put('/api/users/unfollow/:unfollowId', auth, (req, res) => {
    if(!isRestricted(req.user.restrictedFunctions,"Follow")){
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
    }else{
        res.status(200).json({restricted: true,restrictedFunction: req.user.restrictedFunctions.find(item => item.function == "Follow") });
    }
})

app.get('/api/messages/get/:id', auth, (req, res) => {
    const userlist = [(req.params.id), (req.user._id)]
    Conversation.findOne({ $and: [{ 
        user1: { $in: userlist } }, { user2: { $in: userlist } }] })
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
        .sort([['updatedAt', -1]])
       
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

app.post('/api/notify/seen/:id', auth, (req, res) => {
    Notification.findByIdAndUpdate(req.params.id, {
        $set: { seenStatus: true }
    }).exec((err, noti) => {
        if (err) res.status(400).json(err);
        else
            res.json(noti);
    })
})

app.post('/api/notify/disable/:id',auth,(req,res)=>{
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

function isRestricted(restrictedFunctions, func){
    var today = moment().startOf('day').valueOf();
    console.log(restrictedFunctions.some(item => (item.function == func) && (item.amountOfTime>today)))
    if(restrictedFunctions.some(item => (item.function == func) && (item.amountOfTime>today))){
        return true
    }else{
        return false
    }
}

app.post('/api/posts/test', auth, (req, res) => {

    var today = moment().startOf('day').valueOf();
    var next7Day = moment().startOf('day').add(7,'days').valueOf();

    var tomorow = moment(today).endOf('day').valueOf();
    res.status(200).json({today,tomorow,next7Day});

    var today = moment().startOf('day').valueOf();
    if(restrictedFunctions.some(item => {
        item.func == func && item.time > today
    })){
        return true
    }else{
        return false
    }

})

app.post('/api/posts/comment', auth, (req, res) => {
    if(!isRestricted(req.user.restrictedFunctions,"Comment")){
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
    }else{
        res.status(200).json({restricted: true,restrictedFunction: req.user.restrictedFunctions.find(item => item.function == "Comment") });
    }
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
    }).then((err, cmt) => {
        if (err) return res.json(err);
        res.status(200).json({
            cmt: cmt
        })
    })
})

app.put('/api/posts/hidePost', auth, (req, res) => {
    if (req.body.postId) {
        User.findByIdAndUpdate(req.user._id, {
            $push: { hiddenPost: req.body.postId }
        }, { new: true }).exec((err) => {
            if (err) return res.json(err);
            res.status(200).json({ postId: req.body.postId })
        })
    }
    else {
        res.status(400).send("error");
    }
})

app.put('/api/posts/likeComment', auth, (req, res) => {
    if(!isRestricted(req.user.restrictedFunctions,"Like")){
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
    }else{
        res.status(200).json({restricted: true});
    }
})

app.put('/api/posts/unLikeComment', auth, (req, res) => {

    if(!isRestricted(req.user.restrictedFunctions,"Like")){
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
    }else{
        res.status(200).json({restricted: true,restrictedFunction: req.user.restrictedFunctions.find(item => item.function == "Like")});
    }
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
        userId: req.body.userId,
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

    policy.save((err, policy) => {
        if (err) return res.status(400).json({ err })
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

app.put('/api/tags/follow', auth, (req, res) => {
    Tag.findByIdAndUpdate(req.body.tagId, {
        $push: { followers: req.user._id }
    }, {
        new: true
    }).exec((err, tag) => {
        if (err) res.status(400).json(err);
        res.status(200).json({ tag });
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
    ], function (err, tags) {
        if (err) return res.status(400).json(err);
        res.status(200).json(tags);
    }
    )
})

app.put('/api/tags/unfollow', auth, (req, res) => {
    Tag.findByIdAndUpdate(req.body.tagId, {
        $pull: { followers: req.user._id }
    }, { new: true })
        .exec((err, tag) => {
            if (err) res.status(400).json(err);
            res.status(200).json({ tag });
        })
})

app.post('/api/users/search', auth, (req, res) => {

    let limit = req.body.limit ? parseInt(req.body.limit) : 3;
    let skip = req.body.skip ? parseInt(req.body.skip) : 0;

    const matchRegex = new RegExp(req.body.keyword);
    console.log(matchRegex)
    User.find({ userName: { $regex: matchRegex }, _id: {$nin: req.user.blockedUsers} })
        .skip(skip)
        .limit(limit)
        .select("_id avt userName blockedUsers")
        .exec((err, users) => {
            let filteredUsers = [...users]
            filteredUsers = filteredUsers.filter(item => 
                !item.blockedUsers.includes(req.user._id)
            )
            console.log(filteredUsers)
            Tag.find({ name: { $regex: matchRegex } })
                .skip(skip)
                .limit(limit)
                .select("_id name posts")
                .exec((err, tags) => {
                    if (err) res.status(400).json(err);
                    res.status(200).json({ users: filteredUsers, tags });
                })
        })
})

app.post('/api/users/searchmess', auth, (req, res) => {

    let limit = req.body.limit ? parseInt(req.body.limit) : 3;
    let skip = req.body.skip ? parseInt(req.body.skip) : 0;

    const matchRegex = new RegExp(req.body.keyword);
    console.log(matchRegex)
    User.find({ userName: { $regex: matchRegex }, _id: {$nin: req.user.blockedUsers} })
        .skip(skip)
        .limit(limit)
        .select("_id avt userName blockedUsers")
        .exec((err, users) => {
            let filteredUsers = [...users]
            filteredUsers = filteredUsers.filter(item => 
                !item.blockedUsers.includes(req.user._id)
            )
            console.log(filteredUsers)
            Group.find({ $and: [ {title: { $regex: matchRegex }, user:{$in: req.user._id}}] })
                .skip(skip)
                .limit(limit)
                .select("_id title groupimg user")
                .exec((err, groups) => {
                    if (err) res.status(400).json(err);
                    res.status(200).json({ users: filteredUsers, groups });
                })
        })
})

app.post('/api/users/searchUser', auth, (req, res) => {

    let limit = req.body.limit ? parseInt(req.body.limit) : 3;
    let skip = req.body.skip ? parseInt(req.body.skip) : 0;

    const matchRegex = new RegExp(req.body.keyword);
    console.log(matchRegex)
    User.find({ userName: { $regex: matchRegex }, _id: {$nin: req.body.blockedUsers}  })
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

app.post('/api/users/reset_pass', (req, res) => {
    var today = moment().startOf('day').valueOf();
    User.findOne({
        resetToken: req.body.resetToken,
        resetTokenExp: {
            $gte: today
        }
    }, (err, user) => {
        if (err) console.log(err)
        if (!user) return res.json({ success: false, message: "Sorry, your token is invalid, please gennerate new one!" })

        user.password = req.body.password;
        user.resetToken = '';
        user.resetTokenExp = 0;

        user.save((err, doc) => {
            if (err) return res.json({ success: false, err })
            return res.status(200).json({
                success: true
            })
        })
    })
})

app.post('/api/users/reset_user', (req, res) => {
    User.findOne(
        { 'email': req.body.email },
        (err, user) => {
            user.gennerateResetToken((err, user) => {
                if (err) return res.json({ success: false, err });
                sendEmail(user.email, user.name, null, "reset_password", user);
                return res.json({ success: true })
            })
    })
})
// ==============================
// STORY
// ==============================

app.get('/api/story/getAll', auth, (req, res) => {
    Story.aggregate([
        {
            $match: { "postedBy": { "$in": [...req.user.followings, req.user._id] }}
        },
        {
            $match: { "disabled": false }
        },
        // {
        //     $match: { "createdAt": { $gt: new Date(Date.now() - 24 * 60 * 60 * 1000) } }
        // },
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

app.get('/api/story/get', auth, (req, res) => {
    Story.aggregate([
        {
            $match: { "postedBy": { "$in": [...req.user.followings, req.user._id] }, "disabled": false }
        },
        {
            $match: { "disabled": false }
        },
        // {
        //     $match: { "createdAt": { $gt: new Date(Date.now() - 24 * 60 * 60 * 1000) } }
        // },
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
        // {
        //     $match: { "createdAt": { $gt: new Date(Date.now() - 24 * 60 * 60 * 1000) } }
        // },
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

app.post('/api/story/create', auth, async (req, res) => {
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

app.put('/api/story/view', auth, (req, res) => {
    Story.findByIdAndUpdate(req.body.id, {
        $addToSet: { viewedBy: req.user._id }
    }).exec((err, story) => {
        if (err) res.status(400).json(err);
        res.status(200).json({story});
    })
})

app.post('/api/story/delete', auth, (req, res) => {
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

app.get('/api/story/getHighlightStory/:id',auth,(req,res)=>{
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

app.post('/api/story/deleteHighLightStory', auth, (req, res) => {
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

app.post('/api/story/createHighlightStory', auth ,(req,res)=>{
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

app.get('/api/story/getAllStories',auth,(req,res)=>{
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

app.post('/api/story/editHighlightStory',auth,(req,res)=>{
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
//=======================
//  ADMIN
//=======================

app.post('/api/users/loginAdmin', jsonParser, (req, res) => {
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
    })
    return post;
}

app.post('/api/reports/getAll', auth, admin, (req, res) => {

    let limit = req.body.limit ? parseInt(req.body.limit) : 6;
    let skip = req.body.skip ? parseInt(req.body.skip) : 0;
    let filter = req.body.filter[0] == "all" ? ["post", "comment","user"] : req.body.filter;

    Report.aggregate([
        {
            $match: { "reportType": { "$in": filter } }
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
            $lookup: { from: 'users', localField: 'userId', foreignField: '_id', as: 'userId' }
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
                "userId": 1,
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
        { "$sort": { createdAt: -1 } },
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

findComment = (id) => {
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
            $lookup: { from: 'users', localField: 'userId', foreignField: '_id', as: 'userId' }
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
                "userId": {
                    "_id": 1,
                    "userName": 1,
                    "email": 1,
                    "name": 1,
                    "lastname": 1,
                    "avt": 1,
                    "bio": 1,
                    "followers": 1,
                    "followings": 1,
                    "userName": 1,
                    "restrictedFunctions": 1,
                },
                "reportAbout": {
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
            if(report.reportType == "user") {
                Post.find({ postedBy: reports[0].userId[0]._id })
                .populate("postedBy", "_id userName")
                .sort({ "createdAt": -1 })
                .exec((err, posts) => {
                    if (err) return res.status(422).json({ error: err })
                    res.status(200).json({
                            reportDetail: {
                                ...report,
                                posts
                            }
                        });
                })
            }else{
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
                } else {
                    findComment(report.comment).then((comment) => {
                        findPost(report.post, []).then((post) => {
                            res.status(200).json({
                                reportDetail: {
                                    ...report,
                                    comment: comment,
                                    post: post
                                }
                            })
                        });
                    })
                }
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
        const notification = new Notification({
            sentFrom: req.user._id,
            sentTo: report.sentBy,
            type: "discardReport",
            link: report.post,
            "seenStatus": false
        });
        SaveNotification(notification);
        res.status(200).json({ report });
    })
})

app.put('/api/reports/restrictUserFunction', auth, admin, async (req, res) => {

    const user = await User.findOne({_id: req.body._id})
    
    req.body.funcList.map(item=>{
        if(!user.restrictedFunctions.some(ele => ele.function == item.func)){
            user.restrictedFunctions.push({
                function: item.func,
                amountOfTime: moment().startOf('day').add(item.time,'days').valueOf(),
                assignedAt: Date.now(),
            })
        }
    })

    const updated = await user.save((err, user) => {
        if (err) return res.json({ success: false, message: "Lỗi! Vui lòng thử lại" })
        Report.findByIdAndUpdate(req.body.reportId, {
            $set: { status: true }
        }, {
            new: true
        }).exec((err, report) => {
            if (err) res.status(400).json(err);
            // const notification = new Notification({
            //     sentFrom: req.user._id,
            //     sentTo: post.postedBy,
            //     type: "deletePost",
            //     link: report.post,
            //     "seenStatus": false
            // });
            // SaveNotification(notification);
            return res.status(200).json({
                success: true,
                message: 'Thành công',
                restrictedFunctions: user.restrictedFunctions,
                report
            });
        })
    })
    
    console.log(updated);
})

app.put('/api/reports/deleteRestrictFunction', auth, admin, async (req, res) => {

    const user = await User.findOne({_id: req.body._id})
    user.restrictedFunctions.pull({
        _id: req.body.funcId
    })
    const updated = await user.save((err, doc) => {
        if (err) return res.json({ success: false, message: "Lỗi! Vui lòng thử lại" })
        return res.status(200).json({
            success: true,
            funcId: req.body.funcId,
            message: 'Thành công'
        })
    })
    console.log(updated);
})

app.post('/api/reports/delete_post', auth, admin, (req, res) => {
    Post.findByIdAndUpdate(req.body.postId, {
        $set: { hidden: true } }, {new: true })
    .exec((err,post) => {
        if (err) res.status(400).send(err);
        Report.findByIdAndUpdate(req.body.reportId, {
            $set: { status: true }
        }, {
            new: true
        }).exec((err, report) => {
            if (err) res.status(400).json(err);
            const notification = new Notification({
                sentFrom: req.user._id,
                sentTo: post.postedBy,
                type: "deletePost",
                link: report.post,
                "seenStatus": false
            });
            SaveNotification(notification);
            res.status(200).json({ report });
        })
    })
})

app.post('/api/reports/delete_comment', auth, admin, (req, res) => {
    Comment.findByIdAndUpdate(req.body.commentId, {
        $set: { hidden: true }}, {new: true })
    .exec((err, comment) => {
        if (err) res.status(400).send(err);
        Report.findByIdAndUpdate(req.body.reportId, {
            $set: { status: true }
        }, {
            new: true
        }).exec((err, report) => {
            if (err) res.status(400).json(err);
            const notification = new Notification({
                sentFrom: req.user._id,
                sentTo: comment.postedBy,
                type: "deleteComment",
                link: report.post,
                "seenStatus": false
            });
            SaveNotification(notification);
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

app.post('/api/users/changePassword', auth, (req, res) => {
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

///////////// statistical function //////////////////////////

app.get('/api/statistics/newAccountThisMonth', auth, admin, async (req,res)=>{

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

app.get('/api/statistics/newPostThisMonth', auth, admin, async (req,res)=>{
    
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


app.get('/api/statistics/numOfAccount', auth, admin, async(req,res)=>{  
        
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

app.get('/api/statistics/unusedAccountSinceBeginOfThisYear', auth, admin, (req,res)=>{
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

app.get('/api/statistics/getTop10Users', auth, admin,(req, res) => {

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
app.get('/api/statistics/growthOfUser', auth, admin, async (req, res) => {
    
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


app.get('/api/statistics/userBehaviors', auth, admin, async (req, res) => {
    
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
app.get('/api/statistics/userNationalities', auth, admin, async (req,res)=>{
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



app.get('/api/statistics/percentageOfAge', auth, admin, async (req, res) => {
    
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


// const port = process.env.PORT || 3002;
// if(process.env.NODE_ENV === 'production'){
//     const path = require('path');
//     app.get('/*',(req,res)=>{
//         res.sendFile(path.resolve(__dirname,'../client','src','index.js'))
//     })
// }

// app.use(function (req, res, next) {
//     res.status(404).send('Unable to find the requested resource!');
// });
const port = process.env.PORT || 3002;
app.listen(port, () => {
    {
        console.log(`Server is running at ${port}`);
    }
})
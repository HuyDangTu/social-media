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
const { Message } = require('../models/message');
const { Group } = require('../models/group');
const { Groupmess} = require('../models/groupmess');
const { Conversation } = require('../models/conversations');
const { auth } = require('../middleware/auth');

router.post('/api/messages/group/create',auth,(req,res)=>{
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

router.post('/api/messages/group/seen/:id', auth, (req, res) => {
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

router.post('/api/messages/group/seenall', auth, (req, res) => {
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

router.post('/api/messages/group/disable/:id', auth, (req, res) => {
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

router.post('/api/messages/group/addmember/:id',auth,(req,res)=>{
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

router.post('/api/messages/group/replyStory',auth,(req,res)=>{
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

router.post('/api/messages/group/person/find/:id',auth,(req,res)=>{
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

router.post('/api/messages/group/remove/:id',auth,(req,res)=>{
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

router.post('/api/messages/group/save', auth,jsonParser, (req, res) => {
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

router.get('/api/messages/group/find',auth,(req,res)=>{
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

router.post('/api/messages/group/edittitle/:id',auth,(req,res)=>{
    Group.findByIdAndUpdate({_id:req.params.id},
        {
            $set:{title:req.body.title}
        }).exec((err, conversation) => {
            if (err) res.status(400).json(err);
            res.status(200).json({conversation});
        })
})

router.get('/api/messages/group/get/:id', auth, (req, res) => {
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

router.post('/api/messages/group/updatepic', auth, (req, res) => {
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

router.get('/api/messages/get/:id', auth, (req, res) => {
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

router.get('/api/messages/seen/:id', auth, (req, res) => {
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

router.get('/api/messages/conversations', auth, (req, res) => {
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
router.get('/api/messages/geticeServers', auth, (req, res) => {
    const client = require('twilio')("AC4a646aa80898fb472a5f6e875787c5fb", "90aca236f6cc93b9b778f2454f6bf99c");
    client.tokens.create().then(token => 
        res.json(token.iceServers));
});

router.post('/api/messages/save', jsonParser, (req, res) => {
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

module.exports = router;
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

app.use(require('./Routes/users/account'))
app.use(require('./Routes/users/adminFunctionalities'))
app.use(require('./Routes/users/functionalities'))
app.use(require('./Routes/comments'))
app.use(require('./Routes/image'))
app.use(require('./Routes/messages'))
app.use(require('./Routes/notifications'))
app.use(require('./Routes/policies'))
app.use(require('./Routes/posts'))
app.use(require('./Routes/reports'))
app.use(require('./Routes/statistics'))
app.use(require('./Routes/stories'))
app.use(require('./Routes/tags'))


if(process.env.NODE_ENV === 'production'){
    const path = require('path');
    app.get('*',(req,res)=>{
        res.sendFile(path.resolve(__dirname,'../client','src','index.js'))
    })
}

const port = process.env.PORT || 3002;
app.listen(port, () => {
    {
        console.log(`Server is running at ${port}`);
    }
})

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


// const client = require('twilio')("AC4a646aa80898fb472a5f6e875787c5fb", "2122dfed4e52f1f1299d3992ce9e5f1d");
// client.tokens.create().then(token => console.log(token.iceServers));
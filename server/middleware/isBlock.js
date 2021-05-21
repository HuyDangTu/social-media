const {User} = require('../models/user');

let isBlocked = function(req,res,next){
    let token = req.cookies.u_auth;
    User.findByToken(token,(err,user)=>{
        if(err) throw err;
        
        if(!user) return res.json({
            isAuth: false,
            error: true
        });
        
        //use later
        req.token = token;
        console.log(user);
        req.user = user;
        next();
    });
}

module.exports = {isBlocked}
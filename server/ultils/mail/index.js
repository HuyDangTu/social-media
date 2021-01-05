const mailer = require('nodemailer');
const { resetpass} = require("./reset_template");
require('dotenv').config();

const getEmailData = (to, name, token, template, actionData) =>{
    let data = null;

    switch (template){
        case "reset_password":
            data = {
                from: "huy311099@gmail.com",
                to,
                subject: `Hey ${name}, reset your password`,
                html: resetpass(actionData)
            }
            break;
        default:
            data;
    }
    return data;
}

const sendEmail = (to, name, token, type, actionData= null) =>{
    const smtpTransport = mailer.createTransport({
        service: "Gmail",
        auth:{
            user: "huy311099@gmail.com",
            pass:  process.env.EMAIL_PASS
        }
    });

    const mail = getEmailData(to, name, token, type, actionData);
    
    smtpTransport.sendMail(mail,function(error,response){
        if(error){
            console.log(error)
        }else{
            console.log("email sent");
        }
        smtpTransport.close(); 
    })
}

module.exports = {sendEmail}
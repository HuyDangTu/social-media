const resetpass = (data) =>{
    
    const URL = process.env.NODE_ENV === "production" ? process.env.ROOT_URL : "http://localhost:3000";
    
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Document</title>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    STUNNING  
                </div>
                <a href="${URL}/reset_password/${data.resetToken}">
                    Click here to reset your password
                </a>
                <div class="footer">
                    Contact us: (+84)19880088
                </div>
            </div>
        </body>
        </html>
    `
}

module.exports = { resetpass}
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
    app.use('/api',createProxyMiddleware({
        target: "https://dashboard.heroku.com",
            changeOrigin: true
        })
    );
};
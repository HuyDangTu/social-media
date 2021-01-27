const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
    app.use('/api',createProxyMiddleware({
        target: "https://dashboard.heroku.com" || `http://localhost:3002`,
            changeOrigin: true
        })
    );
};
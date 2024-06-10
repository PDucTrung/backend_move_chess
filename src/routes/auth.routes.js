const controller = require("../controllers/authController");

module.exports = function (app) {
    app.post('/register', controller.register);
    app.get('/api/auth/confirmation/:token', controller.confirmEmail);
    app.post('/login', controller.login);
    app.post('/refresh-token', controller.refreshToken);
    app.post('/logout', controller.logout);
    app.post('/forgot-password', controller.forgotPassword);
    app.post('/reset-password/:token', controller.resetPassword);
};

var express = require('express');
var justifyController = require('./Controllers/JustifyController');
var tokenController = require('./Controllers/TokenController');

exports.router = (() => {

    var apiRouter = express.Router();

    apiRouter.route('/justify').post(justifyController.justifyText);
    apiRouter.route('/token').post(tokenController.createToken);

    return apiRouter;

})();
const queryController = require('./../controllers/query.ctrl');
// const auth = require('./tools/auth');

module.exports = (router) => {
    router.get('/medias', (req, res, next) => {
        queryController.getMedias(req, res, next);
    });
    router.get('/channels', (req, res, next) => {
        queryController.getChannels(req, res, next);
    });
};
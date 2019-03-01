const commandController = require('./../controllers/command.ctrl');

module.exports = (router) => {
    router.post('/channels/:id', (req, res, next) => {
        commandController.activateChannel(req, res, next);
    });
    router.delete('/channels/:id', (req, res, next) => {
        commandController.deactivateChannel(req, res, next);
    });
    router.delete('/medias/:id', (req, res, next) => {
        commandController.deleteMedia(req, res, next);
    });
};
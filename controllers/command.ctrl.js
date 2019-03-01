const async = require('async');
let mongoose = require('mongoose');
let MessagesModel = require('./../models/Messages');
const Messages = mongoose.model('Messages');
let ChannelsModel = require('./../models/Channels');
const Channels = mongoose.model('Channels');
const messageTransformer = require('./../transformers/message.transformer');

const self = {
    modifyChannelActivation: (req, res) => {
        const channelId = req.params.id;
        Channels.findOne({channelId: channelId}).then((channel) => {
            if(!channel) {
                return res.sendStatus(404);
            }
            channel.active = req.channelStatus;
            channel.save(() => {
                res.json({channel: channel.toJSON()});
            });
        });
    },
    activateChannel: (req, res) => {
        req.channelStatus = true;
        self.modifyChannelActivation(req, res);
    },
    deactivateChannel: (req, res) => {
        req.channelStatus = false;
        self.modifyChannelActivation(req, res);
    },
};

module.exports = self;
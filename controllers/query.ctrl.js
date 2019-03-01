const async = require('async');
let mongoose = require('mongoose');
let MessagesModel = require('./../models/Messages');
const Messages = mongoose.model('Messages');
let ChannelsModel = require('./../models/Channels');
const Channels = mongoose.model('Channels');
const messageTransformer = require('./../transformers/message.transformer');

const self = {
    getMedias: async (req, res) => {
        Messages.find({'attachment.title': {$exists: true}}).then((messages) => {
            return res.json({
                messages: messages.map((message) => {
                    return messageTransformer.transform(message);
                })
            });
        });
    },
    getChannels: async (req, res) => {
        Channels.find().then((channels) => {
            return res.json({channels: channels.map((channel) => {
                return channel.toJSON();
            })});
        });
    }
};

module.exports = self;
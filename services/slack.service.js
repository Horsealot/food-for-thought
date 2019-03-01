const mongoose = require('mongoose');
require('./../models/Messages');
const Messages = mongoose.model('Messages');
require('./../models/Channels');
const Channels = mongoose.model('Channels');
const async = require('async');
const config = require('config');

const { WebClient } = require('@slack/client');

const authorizedPayloads = ['message_changed'];

const self = {
    /**
     * Add process functions to the serieFunctions array to process a message without attachment
     * @param serieFunctions
     * @param messageData
     * @param channel
     */
    handleMessageWithAttachments: (serieFunctions, messageData, channel) => {
        messageData.attachments.forEach((attachment) => {
            const message = new Messages({
                text: messageData.text,
                attachment: attachment,
                createdAt: new Date(),
                author: messageData.user,
                messageId: messageData.client_msg_id,
                channel: channel._id
            });
            serieFunctions.push((callback) => {
                message.save().then((message) => {
                    console.log('Message saved : ' + message.messageId);
                    callback();
                });
            });
        });
    },
    /**
     * Add process functions to the serieFunctions array to process a message with attachment
     * @param serieFunctions
     * @param messageData
     * @param channel
     */
    handleMessageWithoutAttachments: (serieFunctions, messageData, channel) => {
        const message = new Messages({
            text: messageData.text,
            createdAt: new Date(),
            author: messageData.user,
            messageId: messageData.client_msg_id,
            channel: channel._id
        });
        serieFunctions.push((callback) => {
            message.save().then((message) => {
                console.log('Message saved : ' + message.messageId);
                callback();
            });
        });
    },
    /**
     * Handle a message in a channel
     * @param payload
     */
    handleChannelMessage: (payload) => {
        self.findOrCreateChannel(payload.channel).then((channel) => {
            if(!channel.active) {
                console.log("Channel not active");
                return;
            }
            if(payload.subtype && authorizedPayloads.indexOf(payload.subtype) < 0) {
                console.log("Unknown subtype");
                return;
            }
            let serieFunctions = [];
            let messageData = payload;
            if(payload && payload.subtype && payload.subtype === 'message_changed') {
                messageData = payload.message;
                serieFunctions.push((callback) => {
                    Messages.remove({messageId: messageData.client_msg_id}).then(() => {
                        console.log('Existing messages removed');
                        callback();
                    });
                });
            }
            if(messageData.attachments && Array.isArray(messageData.attachments)) {
                self.handleMessageWithAttachments(serieFunctions, messageData, channel);
            } else {
                self.handleMessageWithoutAttachments(serieFunctions, messageData, channel);
            }
            async.series(serieFunctions,
                function(err, results) {
                    console.log("Message processed");
                });
        }).catch(() => {
            console.error("Error finding or creating the channel");
        });
    },
    findOrCreateChannel: (channelId) => {
        return Channels.findOne({channelId: channelId}).then((channel) => {
            if (!channel) {
                return self.updateChannels().then(() => {
                    return Channels.findOne({channelId: channelId});
                }).then((channel) => {
                    return new Promise(function(resolve, reject) {
                        if(channel) {
                            resolve(channel);
                        } else {
                            reject();
                        }
                    });
                })
            }
            return new Promise(function(resolve) {
                resolve(channel);
            });
        });
    },
    /**
     * Handle a slack event
     * @param payload
     */
    handle: (payload) => {
        console.log(payload);
        if(payload.type === 'message' && payload.channel_type === 'channel') {
            self.handleChannelMessage(payload);
        }
    },
    updateChannels: () => {
        const web = new WebClient(config.get('slack.access_token'));
        web.conversations.list({
            exclude_archived: true,
            types: 'public_channel',
            // Only get first 100 items
            limit: 100,
        }).then((res) => {
            res.channels.forEach((channel) => {
                if(channel.is_private) return;
                Channels.findOne({channelId: channel.id}).then((existingChannel) => {
                    if(existingChannel) {
                        if(existingChannel.name !== channel.name) {
                            existingChannel.name = channel.name;
                            existingChannel.save();
                        }
                        return;
                    }
                    const newChannel = new Channels({
                        channelId: channel.id,
                        name: channel.name,
                        active: false
                    });
                    newChannel.save();
                });
            });
        });
    }
};

module.exports = self;
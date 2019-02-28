const mongoose = require('mongoose');
require('./../models/Messages');
const Messages = mongoose.model('Messages');
const async = require('async');

const authorizedPayloads = ['message_changed'];

const self = {
    /**
     * Add process functions to the serieFunctions array to process a message without attachment
     * @param serieFunctions
     * @param messageData
     */
    handleMessageWithAttachments: (serieFunctions, messageData) => {
        messageData.attachments.forEach((attachment) => {
            const message = new Messages({
                text: messageData.text,
                attachment: attachment,
                createdAt: new Date(),
                author: messageData.user,
                messageId: messageData.client_msg_id
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
     */
    handleMessageWithoutAttachments: (serieFunctions, messageData) => {
        const message = new Messages({
            text: messageData.text,
            createdAt: new Date(),
            author: messageData.user,
            messageId: messageData.client_msg_id
        });
        serieFunctions.push((callback) => {
            message.save().then((message) => {
                console.log('Message saved : ' + message.messageId);
                callback();
            });
        });
    },
    handleMessage: (payload) => {
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
            self.handleMessageWithAttachments(serieFunctions, messageData);
        } else {
            self.handleMessageWithoutAttachments(serieFunctions, messageData);
        }
        async.series(serieFunctions,
            function(err, results) {
                console.log("Message processed");
            });
    },
    handle: (payload) => {
        // console.log(payload);
        if(payload.type === 'message') {
            self.handleMessage(payload);
        }
    }
};

module.exports = self;
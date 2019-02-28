const mongoose = require('mongoose');

const { Schema } = mongoose;

const ChannelsSchema = new Schema({
    name: String,
    slackId: String,
    active: Boolean,
});

mongoose.model('Channels', ChannelsSchema);
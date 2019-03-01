const mongoose = require('mongoose');

const { Schema } = mongoose;

const ChannelsSchema = new Schema({
    channelId: String,
    name: String,
    slackId: String,
    active: Boolean,
});

ChannelsSchema.methods.toJSON = function() {
    return {
        id: this.channelId,
        name: this.name,
        slackId: this.slackId,
        active: this.active,
    }
};

mongoose.model('Channels', ChannelsSchema);
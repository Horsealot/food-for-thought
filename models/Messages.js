const mongoose = require('mongoose');

const { Schema } = mongoose;

const MessagesSchema = new Schema({
    text: String,
    attachment: Object,
    createdAt: Date,
    author: String,
    messageId: String,
    displayed: Boolean,
    channel: {
        type: Schema.Types.ObjectId,
        ref: 'Channels'
    }
});

// KpisSchema.methods.toJSON = function() {
//     return {
//         id: this._id,
//         owner: this.owner,
//         source: this.source,
//         name: this.name,
//         type: this.type,
//         schedule: this.schedule,
//         lastUpdate: this.lastUpdate,
//         inError: this.inError
//     }
// };

mongoose.model('Messages', MessagesSchema);
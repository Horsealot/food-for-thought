const self = {
    transform: (message) => {
        if(message.attachment) {
            return self.transformMedia(message);
        }
        return self.transformTextMessage(message);
    },
    transformMedia: (message) => {
        return {
            ...self.transformTextMessage(message),
            media: {
                source: {
                    name: message.attachment.service_name,
                    icon: message.attachment.service_icon,
                    link: message.attachment.title_link
                },
                headline: message.attachment.text,
                title: message.attachment.title,
                image: message.attachment.image_url,
                thumb: message.attachment.thumb_url
            }
        }
    },
    transformTextMessage: (message) => {
        return {
            id: message.messageId,
            author: message.author,
            createdAt: message.createdAt,
            text: message.text,
        }
    }
};

module.exports = self;
function formatDate() {
    // https://codereview.stackexchange.com/questions/184459/getting-the-date-on-yyyymmdd-format
    function twoDigit(n) { return (n < 10 ? '0' : '') + n; }

    var now = new Date();
    return '' + twoDigit(now.getDate()) + '-' + twoDigit(now.getMonth() + 1) + '-' + now.getFullYear();
}

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
            createdAt: formatDate(message.createdAt),
            text: message.text,
        }
    }
};

module.exports = self;
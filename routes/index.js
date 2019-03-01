const query = require('./query');
const command = require('./command');

module.exports = (router) => {
    query(router);
    command(router);
};
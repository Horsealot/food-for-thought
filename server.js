const express = require('express');
const path = require('path');
const cors = require('cors');
const mongoose = require('mongoose');
const errorHandler = require('errorhandler');
const routes = require('./routes/');
const helmet = require('helmet');
const config = require('config');
const port = process.env.PORT || 5003;
const { createEventAdapter } = require('@slack/events-api');
const slackEvents = createEventAdapter(config.get('slack.signing_secret'));

const slackService = require('./services/slack.service');

//Configure mongoose's promise to global promise
mongoose.promise = global.Promise;

//Configure isProduction variable
const isProduction = process.env.NODE_ENV === 'production';
const isTesting = process.env.NODE_ENV === 'test';

//Initiate our app
const app = express();
const router = express.Router();

//Configure our app
app.use(cors());
app.use(helmet());
app.use(require('morgan')('dev'));
app.use(express.static(path.join(__dirname, 'public')));

/** Connect to the database */
mongoose.connect(`${config.get('db.host')}/${config.get('db.db_name')}`, { useNewUrlParser: true });

if(!isProduction) {
    app.use(errorHandler());
}
if(!isProduction && !isTesting) {
    mongoose.set('debug', true);
}

//Models & routes
require('./models/Messages');
require('./models/Channels');

/** set up routes {API Endpoints} */
routes(router);
app.use('/api', router);

// Mount the slack handler on a route
app.use('/slack/events', slackEvents.expressMiddleware());
// And attach listeners to events by Slack Event "type". See: https://api.slack.com/events/message.im
// And handle errors (see `errorCodes` export)
slackEvents.on('message', slackService.handle);
slackEvents.on('error', console.error);

slackService.updateChannels();

//Error handlers & middlewares
if(!isProduction) {
    app.use((req, res, err) => {
        res.status(err.status || 500);

        res.json({
            errors: {
                message: err.message,
                error: err,
            },
        });
    });
}

app.use((req, res, err) => {
    res.status(err.status || 500);

    res.json({
        errors: {
            message: err.message,
            error: {},
        },
    });
});

app.listen(port, () => console.log(`Listening on port ${port}`));

if (process.env.NODE_ENV === 'production') {
    process.on('uncaughtException', function (er) {
        console.error(er.stack)
    })
}

module.exports = app;

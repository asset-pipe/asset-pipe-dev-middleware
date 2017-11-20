'use strict';

const express = require('express');
const Assets = require('../');
const app = express();

// set up asset bundler
const assets = new Assets('./assets/es5/main.js');

// listen for events
assets.on('update', ids => {
    ids.forEach(id => {
        console.log('updated:', id);
    });
});

// provide bundle info to each request
app.use(assets.middelware());

// attach bundle routes
app.use(assets.router());

// print where bundle is
app.get('/', (req, res) => {
    res.status(200).send(`JS bunde is at: ${res.locals.js}`);
});

// start server
const server = app.listen(8080, () => {
    console.log(
        `http server - Bundle at: http://localhost:${server.address().port}/js/`
    );
});

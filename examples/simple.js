'use strict';

const express = require('express');
const app = express();

const Assets = require('../');
const assets = new Assets('./assets/es5/main.js');

assets.on('update', (ids) => {
    ids.forEach((id) => {
        console.log('updated:', id);
    });
});

app.use(assets.router);

const server = app.listen(8080, () => {
    console.log(`http server - Bundle at: http://localhost:${server.address().port}/js/`);
});

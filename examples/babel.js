'use strict';

const babelify = require('babelify');
const express = require('express');
const app = express();

const Assets = require('../');
const assets = new Assets('./assets/es6/main.js');

assets.transform(babelify, { presets: ['es2015'] });

assets.on('update', ids => {
    ids.forEach(id => {
        console.log('updated:', id);
    });
});

app.use(assets.router());

const server = app.listen(8080, () => {
    console.log(
        `http server - Bundle at: http://localhost:${server.address().port}/js/`
    );
});

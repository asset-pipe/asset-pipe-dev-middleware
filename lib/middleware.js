"use strict";

const   writer       = require('../../asset-pipe-js-writer/'),
        request       = require('request'),
        express       = require('express'),
        JSONStream    = require('JSONStream');



const Mid = module.exports = function (options) {
    this.options = options;

    const router = express.Router();
};



Mid.prototype.feed = function (source) {
    return (req, res, next) => {
        res.writeHead(200, {'Content-Type' : 'application/javascript'});
        writer(source, true).pipe(JSONStream.stringify()).pipe(res);
    };
};



Mid.prototype.upload = function (source) {
    let url = 'http://127.0.0.1:7100/feed';
    writer(source, true).pipe(JSONStream.stringify()).pipe(request.post({
        url: url,
        json: true
    }, (error, response, body) => {
        console.log(body);
    }));
};

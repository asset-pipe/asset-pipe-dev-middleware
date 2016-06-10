"use strict";

const   writer        = require('../../asset-pipe-js-writer/'),
        reader        = require('../../asset-pipe-js-reader/'),
        request       = require('request'),
        express       = require('express'),
        JSONStream    = require('JSONStream');



const Mid = module.exports = function (options) {
    this.options = options;
    this.builderUri = 'http://127.0.0.1:7100';
    this.builderInfo = {
        js : {
            bundle : '',
            feed   : ''
        }
    };

    this.router = express.Router();

    this.router.get('/feed/js', this.feed('./assets/js/main.js'));
    this.router.get('/bundle/js', this.bundle('./assets/js/main.js'));
    this.router.get('/info', this.info());
};



Mid.prototype.feed = function (source) {
    return (req, res, next) => {
        res.writeHead(200, {'Content-Type' : 'application/javascript'});
        writer(source, true).pipe(JSONStream.stringify()).pipe(res);
    };
};



Mid.prototype.bundle = function (source) {
    return (req, res, next) => {
        res.writeHead(200, {'Content-Type' : 'application/javascript'});
        let input = writer(source).pipe(JSONStream.stringify());
        reader([input]).pipe(res);
    };
};



Mid.prototype.info = function () {
    return (req, res, next) => {
        res.status(200).json(this.builderInfo);
    };
};



Mid.prototype.upload = function (onError, onSuccess, source) {
    writer(source, true).pipe(JSONStream.stringify()).pipe(request.post({
        url: this.builderUri + '/feed',
        json: true
    }, (error, response, body) => {
        if (error) {
            return onError(error);
        }
        this.builderInfo.js.feed = body.uri;
        onSuccess(body);
    }));
};



Mid.prototype.build = function (onError, onSuccess, sources) {
    request.post({
        url: this.builderUri + '/bundle',
        body: sources,
        json: true
    }, (error, response, body) => {
        if (error) {
            return onError(error);
        }
        this.builderInfo.js.bundle = body.uri;
        onSuccess(body);
    });
};

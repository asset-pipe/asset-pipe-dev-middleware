"use strict";

const   Writer        = require('asset-pipe-js-writer'),
        request       = require('request'),
        express       = require('express'),
        JSONStream    = require('JSONStream');



const Mid = module.exports = function (files, options) {
    this.files = files;
    this.options = options;
    this.transforms = [];

    this.builderUri = 'http://127.0.0.1:7100';
    this.builderInfo = {
        js : {
            bundle : '',
            feed   : ''
        }
    };


    this.router = express.Router();

    this.router.get('/feed/js', this.feed());
    this.router.get('/bundle/js', this.bundle());
    this.router.get('/info', this.info());
};



Mid.prototype.transform = function (transform, options) {
    this.transforms.push({
        transform: transform,
        options: options
    });
};



Mid.prototype.feed = function () {
    const self = this;
    return (req, res, next) => {
        res.writeHead(200, {'Content-Type' : 'application/javascript'});
        const writer = new Writer(self.files, self.options);
        self.transforms.forEach((entry) => {
            writer.transform(entry.transform, entry.options);
        });
        writer.bundle().pipe(JSONStream.stringify()).pipe(res);
    };
};



Mid.prototype.bundle = function () {
    const self = this;
    return (req, res, next) => {
        res.writeHead(200, {'Content-Type' : 'application/javascript'});
        const writer = new Writer(self.files, self.options, true);
        self.transforms.forEach((entry) => {
            writer.transform(entry.transform, entry.options);
        });
        writer.bundle().pipe(res);
    };
};



Mid.prototype.info = function () {
    return (req, res, next) => {
        res.status(200).json(this.builderInfo);
    };
};



Mid.prototype.upload = function (onError, onSuccess) {

    const writer = new Writer(this.files, this.options);
    this.transforms.forEach((entry) => {
        writer.transform(entry.transform, entry.options);
    });

    writer.bundle().pipe(JSONStream.stringify()).pipe(request.post({
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

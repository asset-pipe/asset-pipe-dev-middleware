"use strict";

const JSONStream = require('JSONStream');
const request = require('request');
const express = require('express');
const Writer = require('asset-pipe-js-writer');


class Middleware {
    constructor (files, options) {
        this.files = files;
        this.options = options;
        this.transforms = [];

        this.buildServerUri = 'http://127.0.0.1:7100';

        this.buildInfo = {
            bundle : '',
            feed   : ''
        };

        this.router = express.Router();

        this.router.get('/feed/js', this.feed());
        this.router.get('/bundle/js', this.bundle());
        this.router.get('/info', this.info());
    }

    transform (transform, options) {
        this.transforms.push({
            transform: transform,
            options: options
        });
    }

    feed () {
        const self = this;
        return (req, res, next) => {
            res.writeHead(200, {'Content-Type' : 'application/javascript'});
            const writer = new Writer(self.files, self.options);
            self.transforms.forEach((entry) => {
                writer.transform(entry.transform, entry.options);
            });
            writer.bundle().pipe(JSONStream.stringify()).pipe(res);
        };
    }

    bundle () {
        const self = this;
        return (req, res, next) => {
            res.writeHead(200, {'Content-Type' : 'application/javascript'});
            const writer = new Writer(self.files, self.options, true);
            self.transforms.forEach((entry) => {
                writer.transform(entry.transform, entry.options);
            });
            writer.bundle().pipe(res);
        };
    }

    info () {
        return (req, res, next) => {
            res.status(200).json(this.buildInfo);
        };
    }

    upload (onError, onSuccess) {
        const writer = new Writer(this.files, this.options);
        this.transforms.forEach((entry) => {
            writer.transform(entry.transform, entry.options);
        });

        writer.bundle().pipe(JSONStream.stringify()).pipe(request.post({
            url: this.buildServerUri + '/feed',
            json: true
        }, (error, response, body) => {
            if (error) {
                return onError(error);
            }
            this.buildInfo.feed = body.uri;
            onSuccess(body);
        }));
    }

    build (onError, onSuccess, sources) {
        request.post({
            url: this.buildServerUri + '/bundle',
            body: sources,
            json: true
        }, (error, response, body) => {
            if (error) {
                return onError(error);
            }
            this.builderInfo.bundle = body.uri;
            onSuccess(body);
        });
    }
}

module.exports = Middleware;

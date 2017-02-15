'use strict';

const EventEmitter = require('events');
const watchify = require('watchify');
const devnull = require('dev-null');
const express = require('express');
const extend = require('extend');
const Writer = require('asset-pipe-js-writer');
const emits = require('emits');


class Middleware extends EventEmitter {
    constructor (files = [], options = {}) {
        super();

        options = extend(options, { cache: {}, packageCache: {} });

        this.emits = emits;
        this.writer = new Writer(files, options, true);
        this.writer.plugin(watchify);

        // On every filechange, drain the stream to keep the cache up to date
        this.writer.on('update', () => {
            this.writer.bundle().pipe(devnull());
        });

        // Proxy underlaying events
        this.writer.on('error', this.emits('error'));
        this.writer.on('update', this.emits('update'));
        this.writer.on('bytes', this.emits('bytes'));
        this.writer.on('time', this.emits('time'));
        this.writer.on('log', this.emits('log'));

        this.router = express.Router({ // eslint-disable-line
            mergeParams: true,
        });
        this.router.get('/js', this.js());
    }


    transform (transform, options) {
        this.writer.transform(transform, options);
    }


    plugin (plugin, options) {
        this.writer.plugin(plugin, options);
    }


    js () {
        const self = this;
        return (req, res) => {
            res.writeHead(200, { 'Content-Type': 'application/javascript' });
            self.writer.bundle().pipe(res);
        };
    }
}

module.exports = Middleware;

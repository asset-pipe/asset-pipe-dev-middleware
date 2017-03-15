'use strict';

const EventEmitter = require('events');
const watchify = require('watchify');
const devnull = require('dev-null');
const express = require('express');
const Writer = require('asset-pipe-js-writer');
const emits = require('emits');


module.exports = class Middleware extends EventEmitter {
    constructor (files = [], options = {}) {
        super();

        this.options = Object.assign({
            cache: {},
            packageCache: {},
            debug: true,
            jsPath: '/js',
        }, options);

        this.emits = emits;
        this.writer = new Writer(files, this.options, true);
        this.writer.plugin(watchify);

        // On every filechange, drain the stream to keep the cache up to date
        this.writer.on('update', () => {
            const bundler = this.writer.bundle();

            bundler.on('error', (e) => {
                this.emit('error', e);
            });

            bundler.pipe(devnull());
        });

        // Proxy underlaying events
        this.writer.on('error', this.emits('error'));
        this.writer.on('update', this.emits('update'));
        this.writer.on('bytes', this.emits('bytes'));
        this.writer.on('time', this.emits('time'));
        this.writer.on('log', this.emits('log'));

        this.app = express.Router({ // eslint-disable-line
            mergeParams: true,
        });

        this.app.get(this.options.jsPath, this.js());
    }


    transform (transform, options) {
        this.writer.transform(transform, options);
    }


    plugin (plugin, options) {
        this.writer.plugin(plugin, options);
    }


    middelware (jsProp = 'js') {
        return (req, res, next) => {
            res.locals[jsProp] = this.options.jsPath;
            next();
        };
    }


    router () {
        return this.app;
    }


    js () {
        return (req, res, next) => {
            res.writeHead(200, { 'Content-Type': 'application/javascript' });
            const bundler = this.writer.bundle();

            bundler.on('error', cleanup);

            const writeStream = bundler
                .pipe(res)
                .on('error', cleanup);

            function cleanup (e) {
                res.write(`console.error(${JSON.stringify(e.stack)})`);
                bundler.pause();
                bundler.unpipe(writeStream);
                writeStream.end();
                next(e);
            }
        };
    }
};

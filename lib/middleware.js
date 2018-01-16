'use strict';

const EventEmitter = require('events');
const watchify = require('watchify');
const devnull = require('dev-null');
const express = require('express');
const JsWriter = require('@asset-pipe/js-writer');
const CssWriter = require('@asset-pipe/css-writer');
const emits = require('emits');

module.exports = class Middleware extends EventEmitter {
    constructor(jsFiles = [], cssFiles = [], options = {}) {
        super();

        this.options = Object.assign(
            {
                cache: {},
                packageCache: {},
                debug: true,
                jsPath: '/js',
                cssPath: '/css',
            },
            options
        );

        this.emits = emits;
        this.writers = {
            js: new JsWriter(jsFiles, this.options, true),
            css: new CssWriter(cssFiles, true),
        };

        this.writers.js.plugin(watchify);

        // On every filechange, drain the stream to keep the cache up to date
        this.writers.js.on('update', () => {
            const bundler = this.writers.js.bundle();

            bundler.on('error', e => {
                this.emit('error', e);
            });

            bundler.pipe(devnull());
        });

        // Proxy underlaying events
        this.writers.js.on('error', this.emits('error'));
        this.writers.js.on('update', this.emits('update'));
        this.writers.js.on('bytes', this.emits('bytes'));
        this.writers.js.on('time', this.emits('time'));
        this.writers.js.on('log', this.emits('log'));

        this.writers.css.on('error', this.emits('error'));

        // eslint-disable-next-line new-cap
        this.app = express.Router({
            mergeParams: true,
        });

        this.app.get(this.options.jsPath, this.js());
        this.app.get(this.options.cssPath, this.css());
    }

    transform(transform, options) {
        this.writers.js.transform(transform, options);
    }

    plugin(plugin, options) {
        this.writers.js.plugin(plugin, options);
    }

    middleware(jsProp = 'js', cssProp = 'css') {
        return (req, res, next) => {
            res.locals[jsProp] = this.options.jsPath;
            res.locals[cssProp] = this.options.cssPath;
            next();
        };
    }

    router() {
        return this.app;
    }

    js() {
        return (req, res, next) => {
            res.type('javascript');
            this.writers.js
                .bundle()
                .on('error', next)
                .pipe(res);
        };
    }

    css() {
        return (req, res, next) => {
            res.type('css');
            this.writers.css
                .bundle()
                .on('error', next)
                .pipe(res);
        };
    }
};

"use strict";

const   jsWriter      = require('../../asset-pipe-js-writer/'),
        JSONStream    = require('JSONStream');



module.exports.js = (source) => {
    return (req, res, next) => {
        res.writeHead(200, {'Content-Type' : 'application/javascript'});
        jsWriter(source).pipe(JSONStream.stringify()).pipe(res);
    };    
}; 

'use strict';

// const stream = require('stream');
// const concat = require('concat-stream');
const Mid = require('../');
const tap = require('tap');

// const sourceStream = (arr) => new stream.Readable({
//     objectMode: false,
//     read (n) {
//         arr.forEach((chunk) => {
//             this.push(chunk);
//         });
//         this.push(null);
//     },
// });

// const a = ['a', 'b', 'c'];
// const b = ['d', 'a', 'b', 'c'];

tap.test('not a real test', t => {
    const mid = new Mid();
    console.log(mid);
    t.end();
});

module.exports = {
    entry: './index.js',
    mode: 'production',
    output: {
        filename: 'linkify-it.umd.min.js',
        library: {
            type: 'umd',
            name: 'LinkifyIt',
        },
        globalObject: 'this',
    }
};

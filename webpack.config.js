module.exports = {
    entry: './index.js',
    mode: 'production',
    output: {
        filename: 'linkifyIt.umd.min.js',
        library: {
            type: 'umd',
            name: 'linkifyIt',
        }
    }
};
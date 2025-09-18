const webpack = require('webpack');
const dotenv = require('dotenv');

module.exports = function override(config) {
    // dotenv вернет объект с полем parsed 
    const env = dotenv.config().parsed;

    const fallback = config.resolve.fallback || {};
    Object.assign(fallback, {
        "crypto": require.resolve("crypto-browserify"),
        "stream": require.resolve("stream-browserify"),
        "assert": require.resolve("assert"),
        "http": require.resolve("stream-http"),
        "https": require.resolve("https-browserify"),
        "os": require.resolve("os-browserify"),
        "fs": require.resolve("browserify-fs"),
        "zlib": require.resolve("browserify-zlib"),
        "url": require.resolve("url")
    })
    config.resolve.fallback = fallback;
    config.plugins = (config.plugins || []).concat([
        new webpack.ProvidePlugin({
            process: 'process/browser',
            Buffer: ['buffer', 'Buffer']
        })
    ])

    // сделаем reduce, чтобы сделать объект
    const envKeys = Object.keys(env).reduce((prev, next) => {
        prev[`process.env.${next}`] = JSON.stringify(env[next]);
        return prev;
    }, {});

    config.plugins = (config.plugins || []).concat([
        new webpack.DefinePlugin(envKeys)
    ])

    return config;
}

/*
const webpack = require('webpack');

const NodePolyfillPlugin = require("node-polyfill-webpack-plugin")

module.exports = {
    // Other rules...
    plugins: [
        new NodePolyfillPlugin()
    ]
}
*/
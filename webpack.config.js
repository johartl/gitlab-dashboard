const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const LoaderOptionsPlugin = require('webpack/lib/LoaderOptionsPlugin');
const UglifyJsPlugin = require('webpack/lib/optimize/UglifyJsPlugin');
const DefinePlugin = require('webpack/lib/DefinePlugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = function(options = {}) {
    const releaseEnv = options.release || false;

    const rootDir = path.resolve(__dirname);
    const outputDir = path.resolve(rootDir, 'app-build');
    const nodeModulesDir = path.resolve(rootDir, 'node_modules');
    const appDir = path.resolve(rootDir, 'app');
    const assetsDir = path.resolve(appDir, 'assets');

    let config = {
        entry: {
            main: path.resolve(appDir, 'main.js')
        },
        output: {
            path: outputDir,
            filename: '[name].js',
            sourceMapFilename: '[file].map'
        },
        devtool: releaseEnv ? 'none' : 'source-map',
        cache: !releaseEnv,
        resolve: {
            extensions: ['.js'],
            modules: [appDir, nodeModulesDir, assetsDir],
            alias: {
                'vue': 'vue/dist/vue.common'
            }
        },
        module: {
            rules:[{
                test: /\.js$/,
                include: [appDir],
                use: [{
                    loader: 'babel-loader',
                    options: {presets: ['es2015'], cacheDirectory: '.babel-cache'}
                }]
            }, {
                test: /\.scss$/,
                include: [appDir, nodeModulesDir],
                use: ExtractTextPlugin.extract({
                    fallback: ['style-loader'],
                    use: ['css-loader', 'sass-loader']
                })
            },{
                test: /\.(eot|woff|woff2|ttf|svg|png|jpg)$/,
                include: [appDir, nodeModulesDir],
                use: [{
                    loader: 'file-loader', options: {
                        name: '[name].[ext]'
                    }
                }]
            }]
        },
        stats: 'minimal',
        plugins: []
    };

    config.plugins.push(new ExtractTextPlugin('style.css'));
    config.plugins.push(new CopyWebpackPlugin([
        {from: path.resolve(appDir, 'index.html'), to: outputDir},
        {from: assetsDir, to: outputDir},
    ]));
    config.plugins.push(new CleanWebpackPlugin({verbose: false}));

    if (releaseEnv) {
        config.plugins.push(new DefinePlugin({
            'process.env': {
                NODE_ENV: '"production"'
            }
        }));

        config.plugins.push(new UglifyJsPlugin({
            sourceMap: false,
            mangle: {
                toplevel: true
            },
            compress: {
                reduce_vars: true,
                collapse_vars: true,
                warnings: false
            },
            output: {
                comments: false
            }
        }));

        config.plugins.push(new LoaderOptionsPlugin({
            minimize: true,
            debug: false
        }));
    }

    return config;
};

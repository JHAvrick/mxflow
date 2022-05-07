//const webpack = require('webpack');
const path = require('path');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
// const nodeExternals = require('webpack-node-externals');
// const { VueLoaderPlugin } = require('vue-loader');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const babelOptions = {
    "presets": [
        ["@babel/preset-env", {
            "useBuiltIns": "usage",
            "corejs": 3,
            "targets": "> 1%, not dead"
        }]
    ]
};

console.log(__dirname);
module.exports = {
    entry: './demo/src/index.ts',
    mode: 'development',
    devtool: 'eval-source-map',
    output: {
        filename: 'demo.js',
        path: path.resolve(__dirname, 'public')
    },
    devServer: {
        static: {
            directory: path.join(__dirname, 'public'),
        },
        compress: true,
        port: 9000
    },
    module: {
        rules: [
            {
                test: /\.ts(x?)$/,
                use: [
                    {
                        loader: 'babel-loader',
                        options: babelOptions
                    },
                    {
                        loader: 'ts-loader',
                        options: {
                            onlyCompileBundledFiles: true
                        }
                    }
                ],
                exclude: /node_modules/,
            },
            {
                test: /\.css$/i,
                sideEffects: true,
                use: ["style-loader", "css-loader"],
            },
            // {
            //     test: /\.scss$/,
            //     sideEffects: true,
            //     use: [
            //         {
            //             loader: MiniCssExtractPlugin.loader,
            //             options: {
            //                 publicPath: ''
            //             }
            //         },
            //         'css-loader',
            //         {
            //             loader: 'resolve-url-loader'
            //         },
            //         {
            //             loader: "sass-loader",
            //             options: {
            //                 // Prefer `dart-sass`
            //                 implementation: require("sass"),
            //             }
            //         }
            //     ]
            // }
        ]
    },
    resolve: {
        extensions: ['.ts', '.js'],
        plugins: [new TsconfigPathsPlugin()] //https://github.com/dividab/tsconfig-paths-webpack-plugin
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: '[name].[chunkhash:8].css'
        }),
        new HtmlWebpackPlugin({
            template: './demo/src/index.ejs',
            title: 'mxflow',
            realContentHash: false
        }),
        new CleanWebpackPlugin()
    ]
}

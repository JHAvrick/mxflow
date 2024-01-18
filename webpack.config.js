//const webpack = require('webpack');
const path = require('path');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
// const nodeExternals = require('webpack-node-externals');
// const { VueLoaderPlugin } = require('vue-loader');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const babelOptions = {
    "presets": [
        ["@babel/preset-env", {
            "useBuiltIns": "usage",
            "corejs": 3,
            "targets": "> 1%, not dead"
        }]
    ]
};

if (process.env.NODE_ENV === 'development' ? 'eval-source-map' : false)

module.exports = {
    entry: './src/index.ts',
    mode: process.env.NODE_ENV,
    devtool: process.env.NODE_ENV === 'development' ? 'eval-source-map' : false,
    output: {
        filename: 'mxflow.min.js',
        path: path.resolve(__dirname, 'dist'),
        library: {
            type: 'umd',
            name: 'mxflow'
        }
    },
    optimization: {
        minimize: process.env.NODE_ENV !== 'development'
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
                test: /\.(css)$/i,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: 'themes/[name].css',
                            //outputPath: path.resolve(__dirname, 'dist', 'themes'),
                        },
                    },
                ],
            },
            // {
            //     test: /\.css$/,
            //     sideEffects: true,
            //     use: [/*MiniCssExtractPlugin.loader, */
            //         // 'vue-style-loader',
            //         'css-loader'
            //     ]
            // },
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
        //new BundleAnalyzerPlugin(),
        new MiniCssExtractPlugin({
            filename: '[name].[chunkhash:8].css'
        }),
        new CleanWebpackPlugin()
    ]
}

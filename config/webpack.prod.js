// webpack配置文件，打包时识别到可简化命令行操作
const path = require('path')
const ESLintPlugin = require('eslint-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
// const ImageMinimizerPlugin = require("image-minimizer-webpack-plugin");
// const { extendDefaultPlugins } = require("svgo");
const PreloadWebpackPlugin = require("@vue/preload-webpack-plugin");
const WorkboxPlugin = require('workbox-webpack-plugin');
const os = require('os')
const threads = os.cpus.length

// 合并不同样式文件的loader配置
const getStyleLoaders = (preProcessor) => {
    return [
        // 'style-loader', // 将js中的css通过动态创建style标签添加到html的head生效
        MiniCssExtractPlugin.loader,
        'css-loader', // 将css资源打包成commonjs模块到js中
        {
            loader: "postcss-loader",
            options: {
                postcssOptions: {
                    plugins: [
                        "postcss-preset-env", // 能解决大多数样式兼容性问题
                    ],
                },
            },
        },
        preProcessor
    ].filter(Boolean)
}

module.exports = {
    entry: './main.js', // 相对路径
    // entry: {
    //     app: './app.js',
    //     main: './main.js'
    // },
    output: {
        path: path.resolve(__dirname, '../dist'),// 绝对路径,所有文件的输出目录
        // filename: 'static/js/main.js', // js目录
        filename: 'static/js/[name].[contenthash:8].js', // 多入口，使用chunk的name作为输出的文件名, [contenthash:8]使用contenthash，取8位长度
        chunkFilename: "static/js/[name].[contenthash:8].chunk.js", // 动态导入额外的chunk输出资源命名方式
        assetModuleFilename: "static/media/[name].[hash:8][ext]", // 处理type:asset静态资源,图片、字体等资源命名方式（注意用hash）
        clean: true // webpack4用的是clearwebpackplugin，webpack5仅需要设置clean即可
    },
    // loader规则匹配
    module: {
        rules: [
            {
                oneOf: [
                    {
                        test: /\.css$/,
                        use: getStyleLoaders()

                    },
                    {
                        test: /\.less$/,
                        use: getStyleLoaders('less-loader') // 将less文件编译成css文件
                    },
                    {
                        test: /\.s[ac]ss$/,
                        use: getStyleLoaders('sass-loader') // 将 Sass 编译成 CSS
                    },
                    {
                        test: /\.styl$/,
                        use: getStyleLoaders('stylus-loader') // 将 Stylus 文件编译为 CSS
                    },
                    {
                        test: /\.(png|jpe?g|webp|gif)$/,
                        type: 'asset',
                        parser: {
                            dataUrlCondition: {
                                maxSize: 10 * 1024, // 小于10kb的图片会处理成base64格式，减少发送请求，打包后体积变大所以设置小图片打包
                            },
                        },
                        // generator: {
                        //     // [hash:8]: 根据文件内容生成的hash值取8位
                        //     // [ext]: 对应文件扩展名
                        //     // [query]: 对应query参数
                        //     filename: 'static/images/[hash:8][ext][query]'
                        // }
                    },
                    {
                        test: /\.(woff|woff2|eot|ttf|otf|mp4|mp3|avi)$/,
                        type: 'asset/resource',
                        // generator: {
                        //     filename: 'static/media/[hash:8][ext][query]'
                        // }
                    },
                    {
                        test: /\.js$/,
                        // exclude: /node_modules/,// 排除第三方库处理
                        include: path.resolve(__dirname, '../src'), // 只处理src下的js
                        use: [
                            {
                                loader: 'thread-loader',
                                options: {
                                    workers: threads // 开启多进程打包的进程数
                                }
                            },
                            {
                                loader: 'babel-loader',
                                options: {
                                    //     presets: ['@babel/preset-env']
                                    cacheDirectory: true, // 开启babel编译缓存
                                    cacheCompression: false, // 关闭压缩缓存
                                    plugins: ["@babel/plugin-transform-runtime"], // 减少代码体积,从此引用辅助代码
                                }
                            }]
                    }
                ]
            }
        ]
    },
    // 插件
    plugins: [
        new ESLintPlugin({
            // 指定eslint检查文件的根目录
            context: path.resolve(__dirname, '../src'),
            exclude: 'node_modules', // eslint默认排除node_modules，不进行代码检查
            cache: true, // 开启缓存
            cacheLocation: path.resolve(__dirname, '../node_modules/.cache/.eslintcache'),
            threads // 开启多进程打包eslint编译
        }),
        // 以 public/index.html为模板创建文件: 1.内容和源文件一致 2.自动引入打包生成的js等资源
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, '../public/index.html')
        }),
        // prefetch浏览器空闲时间加载后续资源，preload立即加载
        new PreloadWebpackPlugin({
            rel: "preload", // preload兼容性更好
            as: "script",
            // rel: 'prefetch' // prefetch兼容性更差
        }),
        new WorkboxPlugin.GenerateSW({
            // 这些选项帮助快速启用 ServiceWorkers
            // 不允许遗留任何“旧的” ServiceWorkers
            clientsClaim: true,
            skipWaiting: true,
        }),
    ],
    optimization: {
        minimizer: [
            new MiniCssExtractPlugin({
                // 定义输出文件名和目录
                // filename: "static/css/main.css",
                filename: "static/css/[name].[contenthash:8].css",
                chunkFilename: "static/css/[name].[contenthash:8].chunk.css",
            }),
            new CssMinimizerPlugin(), // 生产模式默认开启html、js压缩
            new TerserPlugin({ // 对js进行多进程压缩
                parallel: threads
            }),
            // 压缩图片
            // new ImageMinimizerPlugin({
            //     minimizerOptions: {
            //         // Lossless optimization with custom option
            //         // Feel free to experiment with options for better result for you
            //         plugins: [
            //             ["gifsicle", { interlaced: true }],
            //             ["jpegtran", { progressive: true }],
            //             ["optipng", { optimizationLevel: 5 }],
            //             // Svgo configuration here https://github.com/svg/svgo#configuration
            //             [
            //                 "svgo",
            //                 {
            //                     plugins: extendDefaultPlugins([
            //                         {
            //                             name: "removeViewBox",
            //                             active: false,
            //                         },
            //                         {
            //                             name: "addAttributesToSVGElement",
            //                             params: {
            //                                 attributes: [{ xmlns: "http://www.w3.org/2000/svg" }],
            //                             },
            //                         },
            //                     ]),
            //                 },
            //             ],
            //         ],
            //     },
            // }),
        ],
        // 代码分割配置
        splitChunks: {
            chunks: "all", // 对所有模块都进行分割
            // 以下是默认值
            // minSize: 20000, // 分割代码最小的大小
            // minRemainingSize: 0, // 类似于minSize，最后确保提取的文件大小不能为0
            // minChunks: 1, // 至少被引用的次数，满足条件才会代码分割
            // maxAsyncRequests: 30, // 按需加载时并行加载的文件的最大数量
            // maxInitialRequests: 30, // 入口js文件最大并行请求数量
            // enforceSizeThreshold: 50000, // 超过50kb一定会单独打包（此时会忽略minRemainingSize、maxAsyncRequests、maxInitialRequests）
            // cacheGroups: { // 组，哪些模块要打包到一个组
            //   defaultVendors: { // 组名
            //     test: /[\\/]node_modules[\\/]/, // 需要打包到一起的模块
            //     priority: -10, // 权重（越大越高）
            //     reuseExistingChunk: true, // 如果当前 chunk 包含已从主 bundle 中拆分出的模块，则它将被重用，而不是生成新的模块
            //   },
            //   default: { // 其他没有写的配置会使用上面的默认值
            //     minSize: 100, // 我们定义的文件体积太小了，所以要改打包的最小文件体积
            //     minChunks: 2, // 这里的minChunks权重更大
            //     priority: -20,
            //     reuseExistingChunk: true,
            //   },
            // },
        },
        runtimeChunk: {
            name: (entrypoint) => `runtime~${entrypoint.name}`, // runtime文件命名规则
        },
    },
    mode: 'production',
    devtool: "source-map",
}

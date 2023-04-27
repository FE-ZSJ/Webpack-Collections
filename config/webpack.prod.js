// webpack配置文件，打包时识别到可简化命令行操作
const path = require('path')
const ESLintPlugin = require('eslint-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
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
    output: {
        path: path.resolve(__dirname, '../dist'),// 绝对路径,所有文件的输出目录
        filename: 'static/js/main.js', // js目录
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
                        generator: {
                            // [hash:8]: 根据文件内容生成的hash值取8位
                            // [ext]: 对应文件扩展名
                            // [query]: 对应query参数
                            filename: 'static/images/[hash:8][ext][query]'
                        }
                    },
                    {
                        test: /\.(woff|woff2|eot|ttf|otf|mp4|mp3|avi)$/,
                        type: 'asset/resource',
                        generator: {
                            filename: 'static/media/[hash:8][ext][query]'
                        }
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
                                    cacheCompression: false // 关闭压缩缓存
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

    ],
    optimization: {
        minimizer: [
            new MiniCssExtractPlugin({
                // 定义输出文件名和目录
                filename: "static/css/main.css",
            }),
            new CssMinimizerPlugin(), // 生产模式默认开启html、js压缩
            new TerserPlugin({ // 对js进行多进程压缩
                parallel: threads
            })
        ]
    },
    mode: 'production',
    devtool: "source-map",
}

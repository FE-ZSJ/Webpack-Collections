// webpack配置文件，打包时识别到可简化命令行操作
const path = require('path')
const ESLintPlugin = require('eslint-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserPlugin = require("terser-webpack-plugin");

const os = require('os')
const threads = os.cpus.length // cpu核数


// 合并不同样式文件的loader配置
const getStyleLoaders = (preProcessor) => {
    return [
        'style-loader', // 将js中的css通过动态创建style标签添加到html的head生效
        'css-loader', // 将css资源打包成commonjs模块到js中
        preProcessor,
    ].filter(Boolean)
}

module.exports = {
    entry: './main.js', // 相对路径
    output: {
        path: undefined,// 开发环境没有输出，不需要指定输出目录
        filename: 'static/js/main.js', // js目录
        // clean: true // 开发环境没有输出，不需要清空输出结果
    },
    // 监听文件的变化，自动打包，打包生成的文件在内存不会输出到dist目录
    devServer: {
        host: "localhost", // 启动服务器域名
        port: "8080", // 启动服务器端口号
        open: true, // 是否自动打开浏览器
        https: true, // 选择使用 HTTPS 提供服务
        hot: true, // 开启HMR功能（只用于开发环境，生产环境不需要）
    },
    // loader规则匹配
    module: {
        rules: [{
            oneOf: [
                {
                    test: /\.css$/,
                    use: getStyleLoaders()
                },
                {
                    test: /\.less$/,
                    use: getStyleLoaders('less-loader')// 将less文件编译成css文件
                },
                {
                    test: /\.s[ac]ss$/,
                    use: getStyleLoaders('sass-loader')// 将 Sass 编译成 CSS
                },
                {
                    test: /\.styl$/,
                    use: getStyleLoaders('stylus-loader')// 将 Stylus 文件编译为 CSS
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
                    include: path.resolve(__dirname, '../src'), // 只处理src目录下的js文件
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
                        }
                    ]
                }
            ]
        }]
    },
    // 插件
    plugins: [
        new ESLintPlugin({
            // 指定eslint检查文件的根目录
            context: path.resolve(__dirname, '../src'), // 绝对路径回退一层目录
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
            new TerserPlugin({ // 对js进行多进程压缩
                parallel: threads
            })
        ]
    },
    mode: 'development',
    devtool: "cheap-module-source-map" // 没有列映射
}

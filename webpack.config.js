// webpack配置文件，打包时识别到可简化命令行操作
const path = require('path')
const ESLintPlugin = require('eslint-webpack-plugin');

module.exports = {
    entry: './main.js', // 相对路径
    output: {
        path: path.resolve(__dirname, 'dist'),// 绝对路径,所有文件的输出目录
        filename: 'static/js/main.js', // js目录
        clean: true // webpack4用的是clearwebpackplugin，webpack5仅需要设置clean即可
    },
    // loader规则匹配
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    'style-loader', // 将js中的css通过动态创建style标签添加到html的head生效
                    'css-loader' // 将css资源打包成commonjs模块到js中
                ]
            },
            {
                test: /\.less$/,
                use: [
                    // compiles Less to CSS
                    'style-loader',
                    'css-loader',
                    'less-loader' // 将less文件编译成css文件
                ],
            },
            {
                test: /\.s[ac]ss$/,
                use: [
                    // 将 JS 字符串生成为 style 节点
                    'style-loader',
                    // 将 CSS 转化成 CommonJS 模块
                    'css-loader',
                    // 将 Sass 编译成 CSS
                    'sass-loader',
                ],
            },
            {
                test: /\.styl$/,
                loader: "stylus-loader", // 将 Stylus 文件编译为 CSS
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
            }
        ]
    },
    // 插件
    plugins: [
        new ESLintPlugin({
            // 指定eslint检查文件的根目录
            context: path.resolve(__dirname, 'src')
        })
    ],
    mode: 'development'
}

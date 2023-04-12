// webpack配置文件，打包时识别到可简化命令行操作
const path = require('path')
module.exports = {
    entry: './main.js', // 相对路径
    output: {
        path: path.resolve(__dirname, 'dist'),// 绝对路径
        filename: 'main.js'
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
        ]
    },
    // 插件
    plugins: [],
    mode: 'development'
}

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
                    'style-loader',// 将js中的css通过动态创建style标签添加到html的head生效
                    'css-loader' // 将css资源打包成commonjs模块到js中
                ]
            }
        ]
    },
    // 插件
    plugins: [],
    mode: 'development'
}

// webpack配置文件
const path = require('path')
module.exports = {
    entry: './main.js', // 相对路径
    output: {
        path: path.resolve(__dirname, 'dist'),// 绝对路径
        filename: 'main.js'
    },
    // loader规则匹配
    module: {
        rules: []
    },
    // 插件
    plugins: [],
    mode: 'development'
}

module.exports = {
    // 继承 Eslint 规则
    extends: ["eslint:recommended"],
    env: {
        node: true, // 启用node中全局变量
        browser: true, // 启用浏览器中全局变量
    },
    parserOptions: {// 解析选项
        ecmaVersion: 6, // es语法版本
        sourceType: "module",// es模块化
        ecmaFeatures: { // es其他特性
            jsx: true // 开启jsx语法
        }
    },
    rules: {
        "no-var": 2, // 不能使用 var 定义变量
    },
};

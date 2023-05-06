import count from "./src/js/count";
import './src/css/index.css'
import './src/css/index.less'
import './src/css/index.scss'
import './src/css/index.styl'
import './src/css/iconfont.css'

console.log(count(1, 2))

// js热模块替换需要手动判断，项目开发中一般由vue-loader、react-hot-loader处理
if (module.hot) {
    module.hot.accept("./src/js/sum")
}

// 通过import动态导入语法导入模块，模块就被代码分割，同时也能按需加载
// 即使只被引用了一次，也会代码分割
document.getElementById('header').onclick = function () {
    import(/* webpackChunkName: "math" */'./src/js/sum').then(({ sum }) => {
        alert(sum(1, 2, 3, 4, 5));
    })
}

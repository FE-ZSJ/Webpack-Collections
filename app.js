import count from "./src/js/count";
import { sum } from "./src/js/sum";
import './src/css/index.css'
import './src/css/index.less'
import './src/css/index.scss'
import './src/css/index.styl'
import './src/css/iconfont.css'

console.log(count(1, 2))
console.log(sum(1, 2, 3, 4))

// js热模块替换需要手动判断，项目开发中一般由vue-loader、react-hot-loader处理
if (module.hot) {
    module.hot.accept("./src/js/sum")
}

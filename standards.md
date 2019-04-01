## 单页面应用前端代码规范指南

### 前言
规范前端开发，促进代码稳定和团队协同合作，从文件，文件夹命名，html，css，js代码风格，书写习惯来做出各种统一约定和建议。

### 项目目录规范
```
    |-- pages                               // 页面根目录
    |   |-- [pageName]                      // 对应页面目录
    |       |-- index.vue                   // 页面入口
    |       |-- components                  // 页面私有组件
    |       |-- children                    // 子级页面目录
    |   ...
    |
    |-- components // 公用组件
    |   |-- layout  // 布局型
    |   |-- unit    // 小部件，比如表单组件（button，datapicker）
    |   |-- [business] // 业务型组件，比如订单页通用的组件
    |       |-- [component] // 组件
    |       ...
    |
    |-- routers  // 路由配置相关资源
    |   |-- index.js // 路由入口
    |   |-- [childRouterName]
    |       |-- index.js // 子级路由入口
    |       |-- [childRouterName] // 又子级路由
    |           |-- index.js // 又子级路由入口
    |           ...
    |-- stores  // vuex状态管理
    |   |-- index.js // vuex入口文件
    |   |-- modules
    |       |-- 
    |-- datas   // app的各种数据
    |-- assets  // 图片等资源
    |-- styles  // 样式等资源，仅存放通用型，业务型跟随pages和components
    |   |-- global.scss // 全应用公用，保护reset，base
    |   |-- extends.scss // 
    |   |-- functions.scss
    |   |-- mixins.scss
    | 
    |-- utils   // 常用工具包
        |-- [util].js
        ...
```

#### 目录，文件命名规则
+ api, dom.js  // 常规目录及文件使用纯小写命名
+ styles, images // 复数形式的目录
+ PageSidebar, Button, AppShareButton // 组件命名，采用首字母大写的驼峰
+ OpenBrowserButtons // 组件命名必须是名词，可以使用动词或名称作为修饰前缀
+ button-safari.png, button-chrome.png, icon-user, icon-pwd, icon-phone 多个同类型资源，建议使用类型作为前缀


#### 组件目录结构
```
    |-- PageSidebar // 组件根目录
        |-- index.vue // 组件入口文件
        |-- images // 组件图片资源
        |-- components // 组件私有子组件根目录
            |-- [childComponent] // 子组件目录
            ...    
    
```
**私有子组件结构扁平化，建议仅有一层，层次太深不利于管理**

### html代码规范指南

#### IDE自动格式化约定
+ 使用2个空格进行缩进
+ 过长属性自动换行

#### 人为约定
+ 所有的组件引用必须和组件同名
+ ref值必须和组件同名，比如 `` <OpenBrowserButtons ref="OpenBrowserButtons" /> ``
+ 所有标签必须闭合，自闭合标签或无插槽组件必须使用斜杠结尾，比如 `` <em>文本</em>, <input />, <OpenBrowserButtons /> ``
+ 字符串属性必须使用双引号，比如 `` <a class="link" :class="{ actived:true }">首页</a> ``
+ 布尔值属性必须是纯粹的，比如 `` <input type="checkbox" checked /> ``
+ 自定义属性必须是使用data-挂载，比如 `` <input data-oldValue="456" value="123" /> ``
+ 属性建议符合一定的书写顺序，（1. class, 2. id, 3. name, 4. src, title, alt, type, value, ..., 5. data-*, 6. required, checked, readyonly ）

### css，scss代码规范

#### IDE自动格式化约定
+ 使用2个空格进行缩进
+ 所以属性后面必须使用分号结尾

#### 人为约定
+ 多项选择器必须换行，比如 
    ```css
    /* bad */
    .article-body table, .article-body td, .article th{ ... }

    /* good */
    .article-body table, 
    .article-body td, 
    .article th{
        ...
    } 
    ```
+ 注释统一使用 `` /* 注释 */ ``
+ url中必须使用双引号，不可省略，比如 `` background-image: url("./images/bg.png") ``
+ 属性选择器必须使用双引号，比如 `` input[type="input"]{ ... }  ``
+ 组件类名必须和组件同名，比如 `` .OpenBrowserButtons  ``
+ 常规类名使用中划线分割，比如 `` .page-index, .button-help, .button-submit ``
+ 多级类名使用scss语法进行嵌套，比如 
    ```css
    .OpenBrowserButtons {
        padding: 8px;

        .inner-box button { /* 仅一项子级尽量不要嵌套 */
            margin: 4px;
        }

        .other-box {
            .head {
                color: red;
            }
            .body {
                color: green;
            }
        }
    }
    ```
+ id 使用驼峰，比如 `` #submitButton，#alertWindow ``
+ scss中的变量、函数、混合、placeholder采用驼峰，比如
    ```scss
    $fontSize: 12px;
    $linkColor: red;
    @function  positionFixed($left, $top) { ... }
    @mixin centerBox { ... }
    %myWindow { ... }
    ```
+ 属性声明属性建议，不强制执行
    ```css
    .page-index{
        display: block; /* 显示属性 */

        position: fixed; /* 定位属性 */
        left: 0;
        z-index: 99;

        border: 1px solid #000; /* 容器属性 */
        width: 100px;
        margin: 0;
        padding: 0;

        font: italic bold 12px/2 "Microsoft YaHei", sans-serif; /* 字体属性 */
        color: #666;

        background: #eee; /* 背景属性 */
        opacity: 0.6;

        /* 其他属性，动画等 */
    }
    ```
+ 其他...



### js代码规范

#### IDE自动格式化约定

使用eslint进行强制格式化

#### 人为约定
+ 常规变量使用纯小写，比如 `` let name = '我是大哥', let age = 16 ``
+ 配置型常量必须纯大写加下划线，比如 `` const MATH_PI = 3.14, const POSITION_LEFT_PX = 200 `` 
+ 类名使用首字母大写驼峰模式，比如 `` class MyClass { } ``
+ 命名空间型变量使用下划线，比如
    ```javascript
    // 命名空间型数据
    this.state = {
        book_name: '三国演义',
        book_price:  63.00,
        book_pageNums: 300
    }

    // 对象型数据
    this.state = {
        book = {
            name: '三国演义',
            pageNums: 300,
            price: 63.00
        }
    }

    // 命名空间型数据在react中的state操作会更加灵活容易
    this.setState({
        book_name: '西游记',
        book_pageNums: 400,
        book_pirce: 88.00
    })

    // 对象型数据
    this.setState({
        book: {
            name: '西游记',
            pageNums: 400,
            price: 88.00
        }
    })

    // 假如仅改变价格，那么优势就出来了
    this.setState(state => ({ // 对象型
        book: {
            ...state.book,
            price: 63.00 * 0.85
        }
    }))

    this.setState({ // 命名空间型
        book_price: 63.00 * 0.85
    })
    ```
+ 接口方法尽量使用 `` 动词 + 名称 `` 的方式，比如 `` getName, setName, listenScroll, reverseBooks  `` 
+ 通用类中，私有属性和方法使用下划线开始，比如 `` this._privateData, this._privateMethod('发生的消息') ``
+ 数据操作尽量用现成的方法，比如 `` [].forEach, [].reduce ``
+ 数组操作中的变量命名，比如
    ```js
    ;[ 1, 2, 3 ].map(item => item * 2) // 一层结构，变量名统一使用item
    ;[  // 多层结构，建议使用语义化的命名方式，这样辨识度比较高
        { name:'西游记', price:12.00, pages:[ '悟空出世', '悟空拜师' ] }, 
        { name:'水浒传', price:22.00, pages:[ '武松醉酒', '武松打虎' ] } 
    ].map(book => {
        return book.pages.map(page => {
            return page
        })
    })
    ```
+ 循环或变量中的索引建议使用 `` i, j, k ``，层级不要太多，假如内部不使用外层的索引，建议内层索引重置为`` i ``，比如
    ```js
    // 跨级索引循环
    for(let i = 0; i < 10; i++){
        for(let j = 0; j < 10; j++){
            console.info(i * j)
        }
    }

    // 不跨级索引，索引进行重置
    for(let i = 0; i < 10; i++){
        for(let i = 0; i < 10; i++){
            console.info(i)
        }
    }
    ```
+ 变量声明就近原则，比如
    ```js
    function doSome(type){
        
        // 省略n行 ...
        
        let type = '动物' // 在即将使用的位置声明变量
        let nums = 0
        if(type === 1){
            type = '猫'
            nums = 100
        }else if(type === 2){
            type = '狗'
            nums = 200
        }else if(type === 3){
            type = '猪'
            nums = 300
        }
    }
    ```
+ 使用语义化的常量代替字面量，有利于代码阅读和维护，比如
    ```js
    const TYPES = { // 枚举常量更加语义，扩展起来也更加容易 
        CAT: 1,
        DOG: 2,
        PIG: 3,
    } 
    function doSome(type){
        let type = '动物'
        let num = 0
        switch(type){
            case TYPES.CAT: { // 加括号让代码可以折叠
                type = '猫'
                nums = 100
                break
            }
            case TYPES.DOG: {
                type = '狗'
                nums = 200
                break
            }  
            case TYPES.PIG: {
                type = '猪'
                nums = 300
                break
            }
        }
    } 
    ```
+ 函数参数形式定义，比如
    ```js
    function doSome(type, arg1, arg2){ // 参数数量少，并且比较固定，采用常规方式
        // ...
    }

    // bad
    function doSome(type, arg1, arg2, arg3, arg4, arg5, ...){ // 参数数量多，容易导致传参顺序错误，建议使用object类型
        // ... 
    }

    // normal
    function doSome(option){
        // ...
    }

    // good
    function doSome({ type, arg1, arg2, arg3, arg4, arg5, ... }){
        // ...
    }
    ```
+ 函数参数默认值定义，比如
    ```js
    // bad
    function doSome(type, arg1){
        type = type || 'defaultType'
    }

    // good
    function doSome(type = 'defaultType', arg1){
        // ...
    }
    ```
+ 优化代码执行优先级，从而减少代码的执行，比如
    ```js
    // bad
    function doSome(type = 'default'){
        // codes...

        if(type === 'default'){
            return
        }
    }

    // good
    function doSome(type = 'default'){
        if(type === 'default'){
            return
        }

        // codes...
    }
    // 尽量避免一些无意义的运算，当type未设定时，应该第一时间跳出

    // bad
    function getLottery(){
        const rnd = Math.random()
        if(rnd < 0.001){
            return '运气冲天，中了特等奖哦！'
        }
        if(rnd < 0.02){
            return '运气超棒，中了一等奖哦！'
        }
        if(rnd < 0.1){
            return '运气不错，中了二等奖哦！'
        }
        if(rnd < 0.3){
            return '运气可以，中了三等奖哦！'
        }
        return '好运还没降临，洗洗手再来吧！'
    }

    // good
    function getLottery(){
        const rnd = Math.random()
        if(rnd >= 0.3){
            return '好运还没降临，洗洗手再来吧！'
        }
        if(rnd >= 0.1){
            return '运气可以，中了三等奖哦！'
        }
        if(rnd >= 0.02){
            return '运气不错，中了二等奖哦！'
        }
        if(rnd >= 0.001){
            return '运气超棒，中了一等奖哦！'
        }
        return '运气冲天，中了特等奖哦！'
    }

    // 把概率高的运算放前面，利于快速命中返回，从而减少执行语句，尤其在海量搜索的场景下对性能有很大帮助
    ```
+ 使用映射获取值
    ```js
    const TYPES = { CAT:1, DOG:2, PIG:3 }

    // bad
    function getSome(type){
        if(type === TYPES.CAT){
            return '猫'
        }
        if(type === TYPES.DOG){
            return '狗'
        }
        if(type === TYPES.PIG){
            return '猪'
        }
    }

    // good
    const NAMES = { [TYPES.CAT]: '猫', [TYPES.DOG]: '狗', [TYPES.PIG]:'猪' }
    function getSome(type){
        return NAMES[type]
    }
    ```
+ 对大文件进行拆分处理，比如
    ```js
    const routers = [
        {
            path: 'page1', 
            components: '*', 
            chlidren: [
                { ...},
                ...
            ]
        },
        {
            path: 'page2',
            ...
        }
        ...
    ]

    // 根据一定维度进行拆分
    import page1 from './page1'
    import page2 from './page2'
    ...

    const routers = [
        page1,
        page2,
        ...
    ]
    ```
+ 统一文件依赖入口，比如
    ```js
    // 创建依赖入口文件 element.js
    import Vue from 'vue'
    import ElementUI from 'element-ui'
    import 'element-ui/lib/theme-chalk/index.css'
    import locale from 'element-ui/lib/locale/lang/zh-CN'

    Vue.use(ElementUI, { locale })

    // 在使用的地方导入
    import './element'

    // 尽量不要把代码分散在main里，统一入口管理依赖更加清晰
    ```
+ 其他...


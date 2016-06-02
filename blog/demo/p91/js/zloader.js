!function(){
    var 
    basePath,
    entryModule, //入口模块
    modulesBox = {},
    moduleInLoading = {}, //已经发起请求的模块
    onloadedObservable = {}; //模块文件的加载作为被观察者
    
    //init
    loadMain();
    this.define = define;
    this.require = require;
    
    function loadMain(){
        var 
        mainId,
        curScript,
        scripts = document.getElementsByTagName('script');
        for(var i = 0; i < scripts.length; i++){
            curScript = scripts[i];
            mainId = curScript.getAttribute('main');
            if(mainId && /zloader/.test(curScript.src)){
                basePath = (curScript.hasAttribute 
                    ? curScript.src 
                    : curScript.getAttribute('src', 4)
                ).match(/([^?#]*\/)/)[1];
                loadModule(entryModule = curScript.getAttribute('main'));
                break;
            }
        }
    }
    
    function define(id, deps, factory){
        if(typeof id == 'function'){
            factory = id;
            deps = getDeps(factory);
            id = getModuleId();
        }else if(typeof deps == 'function'){
            factory = deps;
            if({}.toString.call(id) == '[object Array]'){
                deps = id;
                id = getModuleId();
            }else{
                deps = getDeps(factory);
            }
        }
        Module(id, deps, factory);
    }
    
    function Module(id, deps, factory){ //加载模块信息
        if(modulesBox[id]){
            throw '模块命名冲突 => '+id;
        }
        modulesBox[id] = { factory: factory };
        var 
        beforeDeps = [], //初始依赖
        afterDeps = []; //剩余依赖
        for(var i = 0; i < deps.length; i++){
            if(!modulesBox[deps[i]]){ //添加未就绪的依赖
                beforeDeps.push(deps[i]);
            }
        }
        
        if(beforeDeps.length){
            for(var i = 0; i < beforeDeps.length; i++){
                addDeps(beforeDeps[i]);
            }
        }else{
            addModuleToBox();
        }
        function addDeps(depsId){
            var onloaded; //依赖模块加载完成时的回调
            afterDeps.push(depsId);
            if(!onloadedObservable[depsId]){
                onloadedObservable[depsId] = [];
            }
            onloadedObservable[depsId].push(onloaded = function(){
                for(var i = 0; i < afterDeps.length; i++){
                    if(afterDeps[i] == depsId){
                        afterDeps.splice(i, 1);
                        break;
                    }
                }
                for(var i = 0; i < onloadedObservable[depsId]; i++){
                    if(onloadedObservable[depsId][i] == onloaded){
                        onloadedObservable[depsId].splice(i, 1);
                        break;
                    }
                }
                if(afterDeps.length == 0){
                    addModuleToBox();
                }
            });
            setTimeout(function(){ //加延迟是为了让合并后require不再触发模块的异步加载
                if(!modulesBox[depsId]){
                    loadModule(depsId);
                }
            });
            
        }

        function addModuleToBox(){
            
            
            if(id == entryModule){ //入口模块
                return factory();
            }
            if(onloadedObservable[id]){ 
            //承担被观察者（被依赖）的模块就绪了，则向所有观察者发出响应
                for(var i = 0; i < onloadedObservable[id].length; i++){
                    onloadedObservable[id][i]();
                }
                onloadedObservable[id] = null;
            }
        }
    }
    
    function loadModule(id){
        var path = basePath + id + '.js';
        if(!moduleInLoading[id]){
            moduleInLoading[id] = true;
            var script = document.createElement('script');
            if('onload' in script){
                script.onload = function(){
                    script.parentNode.removeChild(script);
                    if(!modulesBox[id]){
                        throw '模块加载失败 => '+id;
                    }
                };
            }else{
                script.onreadystatechange = function(){
                    if(/loaded|complete/.test(script.readyState)){
                        script.parentNode.removeChild(script);
                        if(!modulesBox[id]){
                            throw '模块加载失败 => '+id;
                        }
                    }
                };
            }
            script.src = path;
            document.documentElement.appendChild(script);

        }
    }
    
    function require(id){
        if(!modulesBox[id]){
            throw '模块未定义 => '+id;
        }
        if(modulesBox[id].factory){ //懒执行
            var module = {exports: {}};
            var exports = modulesBox[id].factory(module, module.exports);
            if(exports === undefined){
                exports = module.exports;
            }
            modulesBox[id].factory = null;
            modulesBox[id].exports = exports;
        }
        return modulesBox[id].exports;
    }
    
    function getModuleId(){
        return getCurrentScript().replace(basePath, '').replace(/\.js([#?].+)?$/, '');
    }
    
    //来自：http://www.cnblogs.com/rubylouvre/archive/2013/01/23/2872618.html
    function getCurrentScript(){
        //取得正在解析的script节点
        if(document.currentScript) {
            return document.currentScript.src;
        }
        // 参考 https://github.com/samyk/jiagra/blob/master/jiagra.js
        var stack;
        try {
            a.b.c(); //强制报错,以便捕获e.stack
        } catch(e) {//safari的错误对象只有line,sourceId,sourceURL
            stack = e.stack;
            if(!stack && window.opera){
                //opera 9没有e.stack,但有e.Backtrace,但不能直接取得,需要对e对象转字符串进行抽取
                stack = (String(e).match(/of linked script \S+/g) || []).join(" ");
            }
        }
        if(stack) {
            /**e.stack最后一行在所有支持的浏览器大致如下:
            *chrome23:
            * at http://113.93.50.63/data.js:4:1
            *firefox17:
            *@http://113.93.50.63/query.js:4
            *opera12:
            *@http://113.93.50.63/data.js:4
            *IE10:
            *  at Global code (http://113.93.50.63/data.js:4:1)
            */
            stack = stack.split( /[@ ]/g).pop();//取得最后一行,最后一个空格或@之后的部分
            stack = stack[0] == "(" ? stack.slice(1,-1) : stack;
            return stack.replace(/(:\d+)?:\d+$/i, "");//去掉行号与或许存在的出错字符起始位置
        }
        var nodes = document.getElementsByTagName("script");
        for(var i = 0, node; node = nodes[i++];) {
            if(node.readyState === "interactive") { //ie6-7无hasAttribute
                return node.hasAttribute ? node.src : node.getAttribute('src', 4);
            }
        }
    }
    
    function getDeps(factory){
        var hash = {}, arr = [];
        (factory+'').replace(/require\(\s*(['"])([\w./-]+)\1\s*\)/g, 
        function(match, quote, id){ //扫描factory中所有require('moduleId')
            hash[id] = 1;
        });
        for(var key in hash){
            arr.push(key);
        }
        return arr;
    }
    
}();
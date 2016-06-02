/*
模块加载器
#exports
    define(factory)                 定义模块
    define(id, factory)             定义模块
    define(deps, factory)           定义模块
    require(id)                     加载模块
*/

!function(){
    var 
    basepath,       //起始路径
    entrymodule,    //入口模块
    modules = {},
    moduleInLoading = {}, //正在加载的模块
    onloadedObserver = {}; //模块文件的加载作为被观察者
    
    this.define = define;
    this.require = require;
    
    loadMain();
    
    function loadMain(){
        
        var
        curscript,
        scripts = document.getElementsByTagName('script');
        
        for(var i = 0; i < scripts.length; i++){
            
            curscript = scripts[i];
            entrymodule = curscript.getAttribute('main');
            
            if(entrymodule && /zloader/.test(curscript.src)){
                
                basepath = (curscript.hasAttribute 
                    ? curscript.src 
                    : curscript.getAttribute('src', 4)
                ).match(/([^?#]*\/)/)[1];
                
                loadModule(entrymodule);
                
                break;
            }
            
        }
        
    }
    
    function define(id, deps, factory){
        
        if(typeof id == 'function'){ //define(factory)
            factory = id;
            deps = getDeps(factory);
            id = getId();
        }else if(typeof deps == 'function'){
            factory = deps;
            if({}.toString.call(id) == '[object Array]'){ //define(deps, factory)
                deps = id;
                id = getId();
            }else{ //define(id, factory)
                deps = getDeps(factory);
            }
        }
        
        defineModule(id, deps, factory);
        
    }
    
    function defineModule(id, deps, factory){ //加载模块信息
    
        if(modules[id]){
            throw 'zloader.nameconflict => '+ id;
        }
        
        modules[id] = {factory:factory};
        
        var 
        unreadydeps = [], //未就绪的依赖
        remaindeps = []; //剩余的依赖，当未就绪的依赖完成，那么从剩余的依赖中移除
        
        for(var i = 0; i < deps.length; i++){
            if(!modules[deps[i]]){ //添加未就绪的依赖
                unreadydeps.push(deps[i]);
            }
        }
        
        if(unreadydeps.length){
            for(var i = 0; i < unreadydeps.length; i++){
                loadDeps(unreadydeps[i], id);
            }
        }else{ //假如没有未就绪的依赖，直接添加模块
            addModule();
        }
        
        function loadDeps(id, fromModule){
            
            remaindeps.push(id);
            
            var onloaded; //依赖模块加载完成时的回调

            if(!onloadedObserver[id]){
                onloadedObserver[id] = [];
            }
            
            onloadedObserver[id].push(onloaded = function(){
                
                for(var i = 0; i < remaindeps.length; i++){ //加载完成的模块从剩余依赖中移除
                    if(remaindeps[i] == id){
                        remaindeps.splice(i, 1);
                        break;
                    }
                }
                
                for(var i = 0; i < onloadedObserver[id]; i++){ //加载完成的观察者从队列中移除
                    if(onloadedObserver[id][i] == onloaded){
                        onloadedObserver[id].splice(i, 1);
                        break;
                    }
                }
                
                if(remaindeps.length == 0){ //不存在剩余依赖，执行添加模块
                    addModule();
                }
                
            });
            
            setTimeout(function(){ //加延迟是为了让合并后require不再触发模块的异步加载
                if(!modules[id]){
                    loadModule(id, fromModule);
                }
            });
            
        }

        function addModule(){
            
            
            if(id == entrymodule){ //入口模块
                return factory();
            }
            
            if(onloadedObserver[id]){ 
            //承担被观察者（被依赖）的模块就绪了，则向所有观察者发出响应
                for(var i = 0; i < onloadedObserver[id].length; i++){
                    onloadedObserver[id][i]();
                }
                onloadedObserver[id] = null;
            }
            
        }
        
    }
    
    function loadModule(id, fromModule){
        
        var path = basepath + id + '.js';
        
        if(!moduleInLoading[id]){
            
            moduleInLoading[id] = true;
            
            var script = document.createElement('script');
            
            if('onload' in script){
                script.onload = script.onerror = done;
                
            }else{
                script.onreadystatechange = function(){
                    if(/loaded|complete/.test(script.readyState)){
                        done();
                    }
                };
            }
            
            script.src = path;
            document.documentElement.appendChild(script);

            function done(){
                script.parentNode.removeChild(script);
                if(!modules[id]){
                    throw 'module['+ fromModule +'] get module['+ id +'] fail';
                }
            }
            
        }
        
    }
    
    function require(id){
        
        if(!modules[id]){
            throw '模块未定义 => '+id;
        }
        
        if(modules[id].factory){ //懒执行
        
            var module = {exports: {}};
            var exports = modules[id].factory(module, module.exports);
            
            if(exports === undefined){
                exports = module.exports;
            }
            
            modules[id].factory = null;
            modules[id].exports = exports;
            
        }
        
        return modules[id].exports;
        
    }
    
    function getId(){
        return getCurrentScript().replace(basepath, '').replace(/\.js([#?].+)?$/, '');
    }
    
    function getDeps(factory){
        var hash = {}, arr = [];
        (factory +'').replace(/require\(\s*(['"])([\w./-]+)\1\s*\)/g, 
        function(match, quote, id){ //扫描factory中所有require('moduleid')
            hash[id] = 1;
        });
        for(var key in hash){
            arr.push(key);
        }
        return arr;
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
    
}();

!function(){
    var 
    basePath = '',
    modules = {},
    moduleDeps = {},
    moduleHasLoad = {}, //模块文件是否已经被请求
    moduleOnFinish = {}; //模块就绪时触发的事件

    loadMain();
    
    this.define = define;
    this.require = require;
    
    function define(id, deps, factory){
        if(modules[id]){
            throw '模块'+id+'命名冲突';
        }
        if(typeof id == 'function'){
            factory = id;
            deps = [];
            id = getCurrentModuleId();
        }else if(typeof deps == 'function'){
            factory = deps;
            if({}.toString.call(id) == '[object Array]'){
                deps = id;
                id = getCurrentModuleId();
            }
        }

        if(deps.length){ //存在依赖
            moduleDeps[id] = []; //初始化当前模块依赖列表
            deps.forEach(function(depsId){ //遍历处理依赖模块
                if(!moduleOnFinish[depsId]){ //初始化事件列表
                    moduleOnFinish[depsId] = []; 
                }
                if(!modules[depsId]){ //依赖的模块未就绪
                    
                    var finishFn = function(){ 
                        moduleDeps[id] = moduleDeps[id].filter(function(curId){ //移除依赖
                            return curId != depsId;
                        });
                        moduleOnFinish[depsId] = moduleOnFinish[depsId].filter(function(curFn){ //移除事件
                            return curFn != finishFn;
                        });
                        if(moduleDeps[id].length == 0){ //所有依赖模块都就绪
                            callFactory();
                        }
                    };
                    moduleDeps[id].push(depsId); //添加依赖
                    moduleOnFinish[depsId].push(finishFn); //添加观察事件
                    
                    loadModule(depsId);
                }
            });
        }else{
            callFactory();
        }
        
        function callFactory(){
            modules[id] = factory();
            if(moduleOnFinish[id]){ //被其他模块依赖，触发观察事件
                moduleOnFinish[id].forEach(function(fn){
                    fn();
                });
            }
        }
        
    }
    
    function require(id){
        return modules[id];
    }
    
    function loadModule(id){
        var path = basePath + id+'.js';
        if(!moduleHasLoad[path]){
            moduleHasLoad[path] = true;
            loadJs(path) //动态加载js文件
        }
        function loadJs(path){
            var script = document.createElement('script');
            script.src = path;
            document.documentElement.appendChild(script);
        }
    }
    
    function loadMain(){
        var
        s = document.getElementsByTagName('script'),
        slast = s[s.length - 1]; //最后一个脚本即当前执行中的脚本，除非是异步方式加载的，比如defer或者async=true
        basePath = (slast.hasAttribute ? slast.src : slast.getAttribute('src', 4)).match(/([^?#]*\/)/)[1];
        loadModule(slast.getAttribute('main'));
    }
    
    function getCurrentModuleId(){
        var currentScript = getCurrentScript();
        var path = currentScript.replace(basePath, '').replace(/\.js([#?].+)?$/, '');
        return path;
        
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



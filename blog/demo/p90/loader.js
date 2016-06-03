!function(){
    var startpath = '';
    var modules = {};
    var moduleDeps = {};
    var moduleHasLoad = {}; //模块文件是否已经被请求
    var moduleOnFinish = {}; //模块就绪时触发的事件
    
    function define(id, deps, factory){
        if(modules[id]){
            throw '模块'+id+'命名冲突';
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
        var path = startpath + id+'.js';
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
    
    this.define = define;
    this.require = require;
}();
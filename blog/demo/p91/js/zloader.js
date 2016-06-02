!function(){
    var 
    basePath,
    entryModule, //���ģ��
    modulesBox = {},
    moduleInLoading = {}, //�Ѿ����������ģ��
    onloadedObservable = {}; //ģ���ļ��ļ�����Ϊ���۲���
    
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
    
    function Module(id, deps, factory){ //����ģ����Ϣ
        if(modulesBox[id]){
            throw 'ģ��������ͻ => '+id;
        }
        modulesBox[id] = { factory: factory };
        var 
        beforeDeps = [], //��ʼ����
        afterDeps = []; //ʣ������
        for(var i = 0; i < deps.length; i++){
            if(!modulesBox[deps[i]]){ //���δ����������
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
            var onloaded; //����ģ��������ʱ�Ļص�
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
            setTimeout(function(){ //���ӳ���Ϊ���úϲ���require���ٴ���ģ����첽����
                if(!modulesBox[depsId]){
                    loadModule(depsId);
                }
            });
            
        }

        function addModuleToBox(){
            
            
            if(id == entryModule){ //���ģ��
                return factory();
            }
            if(onloadedObservable[id]){ 
            //�е����۲��ߣ�����������ģ������ˣ��������й۲��߷�����Ӧ
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
                        throw 'ģ�����ʧ�� => '+id;
                    }
                };
            }else{
                script.onreadystatechange = function(){
                    if(/loaded|complete/.test(script.readyState)){
                        script.parentNode.removeChild(script);
                        if(!modulesBox[id]){
                            throw 'ģ�����ʧ�� => '+id;
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
            throw 'ģ��δ���� => '+id;
        }
        if(modulesBox[id].factory){ //��ִ��
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
    
    //���ԣ�http://www.cnblogs.com/rubylouvre/archive/2013/01/23/2872618.html
    function getCurrentScript(){
        //ȡ�����ڽ�����script�ڵ�
        if(document.currentScript) {
            return document.currentScript.src;
        }
        // �ο� https://github.com/samyk/jiagra/blob/master/jiagra.js
        var stack;
        try {
            a.b.c(); //ǿ�Ʊ���,�Ա㲶��e.stack
        } catch(e) {//safari�Ĵ������ֻ��line,sourceId,sourceURL
            stack = e.stack;
            if(!stack && window.opera){
                //opera 9û��e.stack,����e.Backtrace,������ֱ��ȡ��,��Ҫ��e����ת�ַ������г�ȡ
                stack = (String(e).match(/of linked script \S+/g) || []).join(" ");
            }
        }
        if(stack) {
            /**e.stack���һ��������֧�ֵ��������������:
            *chrome23:
            * at http://113.93.50.63/data.js:4:1
            *firefox17:
            *@http://113.93.50.63/query.js:4
            *opera12:
            *@http://113.93.50.63/data.js:4
            *IE10:
            *  at Global code (http://113.93.50.63/data.js:4:1)
            */
            stack = stack.split( /[@ ]/g).pop();//ȡ�����һ��,���һ���ո��@֮��Ĳ���
            stack = stack[0] == "(" ? stack.slice(1,-1) : stack;
            return stack.replace(/(:\d+)?:\d+$/i, "");//ȥ���к��������ڵĳ����ַ���ʼλ��
        }
        var nodes = document.getElementsByTagName("script");
        for(var i = 0, node; node = nodes[i++];) {
            if(node.readyState === "interactive") { //ie6-7��hasAttribute
                return node.hasAttribute ? node.src : node.getAttribute('src', 4);
            }
        }
    }
    
    function getDeps(factory){
        var hash = {}, arr = [];
        (factory+'').replace(/require\(\s*(['"])([\w./-]+)\1\s*\)/g, 
        function(match, quote, id){ //ɨ��factory������require('moduleId')
            hash[id] = 1;
        });
        for(var key in hash){
            arr.push(key);
        }
        return arr;
    }
    
}();
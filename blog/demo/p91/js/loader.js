
!function(){
    var 
    basePath = '',
    modules = {},
    moduleDeps = {},
    moduleHasLoad = {}, //ģ���ļ��Ƿ��Ѿ�������
    moduleOnFinish = {}; //ģ�����ʱ�������¼�

    loadMain();
    
    this.define = define;
    this.require = require;
    
    function define(id, deps, factory){
        if(modules[id]){
            throw 'ģ��'+id+'������ͻ';
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

        if(deps.length){ //��������
            moduleDeps[id] = []; //��ʼ����ǰģ�������б�
            deps.forEach(function(depsId){ //������������ģ��
                if(!moduleOnFinish[depsId]){ //��ʼ���¼��б�
                    moduleOnFinish[depsId] = []; 
                }
                if(!modules[depsId]){ //������ģ��δ����
                    
                    var finishFn = function(){ 
                        moduleDeps[id] = moduleDeps[id].filter(function(curId){ //�Ƴ�����
                            return curId != depsId;
                        });
                        moduleOnFinish[depsId] = moduleOnFinish[depsId].filter(function(curFn){ //�Ƴ��¼�
                            return curFn != finishFn;
                        });
                        if(moduleDeps[id].length == 0){ //��������ģ�鶼����
                            callFactory();
                        }
                    };
                    moduleDeps[id].push(depsId); //�������
                    moduleOnFinish[depsId].push(finishFn); //��ӹ۲��¼�
                    
                    loadModule(depsId);
                }
            });
        }else{
            callFactory();
        }
        
        function callFactory(){
            modules[id] = factory();
            if(moduleOnFinish[id]){ //������ģ�������������۲��¼�
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
            loadJs(path) //��̬����js�ļ�
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
        slast = s[s.length - 1]; //���һ���ű�����ǰִ���еĽű����������첽��ʽ���صģ�����defer����async=true
        basePath = (slast.hasAttribute ? slast.src : slast.getAttribute('src', 4)).match(/([^?#]*\/)/)[1];
        loadModule(slast.getAttribute('main'));
    }
    
    function getCurrentModuleId(){
        var currentScript = getCurrentScript();
        var path = currentScript.replace(basePath, '').replace(/\.js([#?].+)?$/, '');
        return path;
        
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
}();



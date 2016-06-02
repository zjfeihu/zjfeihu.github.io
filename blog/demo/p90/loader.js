!function(){
    var startpath = '';
    var modules = {};
    var moduleDeps = {};
    var moduleHasLoad = {}; //ģ���ļ��Ƿ��Ѿ�������
    var moduleOnFinish = {}; //ģ�����ʱ�������¼�
    
    function define(id, deps, factory){
        if(modules[id]){
            throw 'ģ��'+id+'������ͻ';
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
        var path = startpath + id+'.js';
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
    
    this.define = define;
    this.require = require;
}();
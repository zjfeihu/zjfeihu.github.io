/*
���̿������
#exports
    calls()                         ��������
    calls.wait(fn1, fn2, fn..)      �����첽��������
    calls.then(fn1, fn2, fn..)      ����ͬ����������
    calls.error(fn)                 ���������
#info
    wait(function(resolve, reject, recive, go){})
    then(function(reject, go){})
    calls.debug = true; Ĭ�Ϲرյ���
    ?callsdebug=1 ͨ��url������������ģʽ
*/


!function(){

//module.exports = calls;
//exports('calls', calls);
this.calls = calls;

var 
STATUS_ERROR = 0,
STATUS_READY = 1;

function calls(id){
    
    var 
    exports,
    current,
    onerror,
    queue = [],
    index = 0,
    awaitcount,
    state = STATUS_READY,
    lines;
    
    if(calls.debug && calls.timeline){
        lines = calls.timeline(id); //����ʱ����ĵ���
        fire = debugfire;
    }
    
    setTimeout(fireQueue);
    
    return exports = {
        then: then,
        wait: wait,
        error: error
    };
    
    function then(){
        return pushQueue.call(exports, false, arguments);
    }
    
    function wait(){
        return pushQueue.call(exports, true, arguments);
    }
    
    function error(callback){
        onerror = callback;
        return exports;
    }
    
    function pushQueue(async, args){
        
        if(onerror)return;
        
        var name; //����������go��ʹ��
        var fns = {}.toString.call(args[0]) == '[object Array]' ? args[0] : [].slice.call(args, 0);

        if(async){
            
            for(var i = 0; i < fns.length; i++){
                name = ( (fns[i].original || fns[i]) +'').match(/^function\s+(\w+)/);
                if(name){
                    name = name[1];
                    break;
                }
            }
            
            queue.push(current = {
                fns: fns,
                async: async
            });
            
            if(name){
                current.name = name;
            }
            
        }else{
            
            for(var i = 0; i < fns.length; i++){
                
                name = ( (fns[i].original || fns[i]) +'').match(/^function\s+(\w+)/);
                
                queue.push(current = {
                    fns: [fns[i]],
                    async: async
                });
                
                if(name){
                    current.name = name[1];
                }
                
            }
            
        }
        
        return exports;
        
    }
    
    function fireQueue(){
        
        if(state == STATUS_ERROR){
            return;
        }else{
            
            current = queue[index++];
            
            if(!current){ //�������Ѿ�û��Ԫ�أ��������е���
                return;
            }
            
            var fns = current.fns;
            if(current.async){
                awaitcount = fns.length;
                for(var i = 0; i < fns.length; i++){
                    fire(fns[i], current.async);
                }
            }else{
                for(var i = 0; i < fns.length; i++){
                    if(state == STATUS_READY){
                        fire(fns[i]);
                    }
                }
                fireQueue();
            }
            
        }
        
    }
    
    function fire(fn, async){
        try{
            fn = fn.fn || fn;
            if(async){
                fn(resolve, reject, recive, go);
            }else{
                fn(reject, go);
            }
        }catch(e){
            if(!/����ִ�����ͷ�/.test(e.message)){
                //reject(e.message);
                throw e;
            }
        }
    }
    
    function debugfire(fn, async){
        
        //�첽���̣���ʼ��,����ȴ�,������Ӧ,��ɲ���
        
        var line = lines(fn.original || fn);
        
        try{
            
            fn = fn.fn || fn
            
            if(async){
                
                fn(
                
                    function(){
                        line.pushDone();
                        resolve();
                    },
                    
                    function(reason){
                        line.pushDone();
                        reject(reason);
                    },
                
                    function(){
                        line.pushRecive();
                    },
                    
                    function(name){
                        line.pushDone();
                        go(name);
                    }
                    
                );
                
                line.pushWait();
                
            }else{
                fn(reject, go);
                line.pushDone();
            }
            
        }catch(e){
            if(!/����ִ�����ͷ�/.test(e.message)){
                //reject(e.message);
                throw e;
            }
        }
        
    }
    
    function resolve(){
        if(awaitcount){
            awaitcount--;
        }
        if(!awaitcount){
            fireQueue();
        }
    }
    
    function reject(reason){
        state = STATUS_ERROR;
        onerror && onerror(reason);
    }
    
    function recive(){
        
    }
    
    function go(name){
        
        for(var i = 0; i < queue.length; i++){
            if(queue[i].name == name){
                index = i;
                if(current.async){
                    resolve();
                }
                return;
            }
        }
        
        throw 'can not found the module['+ name +'] for go';
        
    }
    
}

calls.then = function(){
    return calls().then.apply(null, arguments);
};

calls.wait = function(){
    return calls().wait.apply(null, arguments);
};

}();

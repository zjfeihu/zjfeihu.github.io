/*
流程控制组件
#exports
    calls()                         创建流程
    calls.wait(fn1, fn2, fn..)      创建异步并行流程
    calls.then(fn1, fn2, fn..)      创建同步串行流程
    calls.error(fn)                 捕获错误处理
#info
    wait(function(resolve, reject, recive, go){})
    then(function(reject, go){})
    calls.debug = true; 默认关闭调试
    ?callsdebug=1 通过url参数开启调试模式
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
        lines = calls.timeline(id); //用于时间轴的调试
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
        
        var name; //流程名，在go中使用
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
            
            if(!current){ //队列中已经没有元素，结束队列调用
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
            if(!/不能执行已释放/.test(e.message)){
                //reject(e.message);
                throw e;
            }
        }
    }
    
    function debugfire(fn, async){
        
        //异步流程：初始化,进入等待,进入响应,完成操作
        
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
            if(!/不能执行已释放/.test(e.message)){
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

define(function(module){
    /*
    观察者模式事件模型
    #exports
    
        Observer.extendTo(module)    扩展Observer的接口到目标模块
        
        module.on(type, fn)                         添加事件
        module.fire(type, args1, args2, ...)        触发事件
        module.stopEvent()                          阻止事件传播
        
    */
    
    module.exports = Observer;
    
    function Observer(){
        
        var queue = {};
        var stop = false;
        
        this.on = function(type, fn){
            if(!queue[type]){
                queue[type] = [fn];
            }else{
                queue[type].push(fn);
            }
            return this;
        };
        
        this.fire = function(type){
            var args = [].slice.call(arguments, 1);
            forEach(queue[type], function(fn){
                fn.apply(this, args);
                return stop;
            }, this);
            stop = false;
            return this;
        };
        
        this.stopEvent = function(){
            stop = true;
        };
        
    }
    
    //扩展接口到指定模块
    Observer.extendTo = function(target){
        var key, source = new Observer;
        for(key in source){
            target[key] = source[key];
        }
    };
    
    function forEach(arr, fn, context){
        if(arr && arr.length){
            var item, i = 0;
            while(item = arr[i]){
                if(fn.call(context, item, i++)){
                    break; 
                }                    
            }                
        }
    }

})
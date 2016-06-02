define(function(module){
    /*
    进度条模块
    #imports
        calls
    #exports
        Loader.wait(fn1, fn2, ...)  添加异步并行
        Loader.then(fn1, fn2, ...)  添加同步串行
    */
    
    var calls = require('widget/calls')('Loader');
    var loader = Loader();
    
    module.exports = {
        
        wait: function wait(){
            
            var wrapFns = [];
            for(var i = 0; i < arguments.length; i++){
                
                !function(fn){
                    
                    if(typeof fn.init == 'function'){
                        fn = fn.init;
                    }
                    
                    loader.addItem();
    
                    wrapFns.push({
                        original: fn,
                        fn: function(reslove, reject, loaded, go){
                            fn(function(){
                                loader.updata();
                                reslove();
                            }, reject, loaded, go);
                        }
                    });
                    
                }(arguments[i]);
                
            }
            
            calls.wait(wrapFns);
            
            return this;
            
        },
        
        then: function then(fn){
            
            if(typeof fn.init == 'function'){
                fn = fn.init;
            }
            
            loader.addItem();
            
            calls.then({
                original: fn,
                fn: function(reject, go){
                    fn(reject, go);
                    loader.updata();
                }
            });
            
            return this;
            
        },
        
        error: calls.error
        
    };
    
    function Loader(){
        
        var root = Z('.loader');
    
        var loadbar = root.find('.loader-bar');
        var ratetext = root.find('span');
        var totalwidth; //进度条总宽度
        var readycount = 0; //当前完成的任务数
        var totalcount = 0;
        var tr;
        
        Z('body').append(root);
        
        totalwidth = loadbar.parent().width();
        
        return {
            
            addItem: function(){
                totalcount++;
            },
            
            updata: function(){
                readycount++;
                clearTimeout(tr);
                tr = setTimeout(function(){
                    var rate = 0;
                    loadbar.anim({width: totalwidth * readycount / totalcount}, {
                        dur: 600,
                        onplay: function(){
                            rate = loadbar.width() * 100 / totalwidth;
                            ratetext.html(rate.toFixed(2) +'%');
                        },
                        ondone: function(){
                            if(rate == 100){ //全部加载完成
                                ratetext.html('');
                                root.anim({opacity: 0}, {
                                    ondone: function(){
                                        root.remove();
                                    }
                                }); 
                            }
                        }
                    });
                    
                }, 16); 
            }
            
        };
    }

})
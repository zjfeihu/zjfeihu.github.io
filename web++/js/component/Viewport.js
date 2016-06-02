define(function(module){
    /*
    视窗模块
    #exports
        Viewport.width                  视窗宽度
        Viewport.height                 视窗高度
        Viewport.init(resolve)          初始化模块
        Viewport.add(item, cache)       添加元素到视窗中，cache控制是否缓存模式
        Viewport.render()               渲染缓存中的元素
        Viewport.layout(type)           获取，设置视窗布局
        Observer.extendTo(Viewport)     扩展来自Observer的接口
    */
    
    var Observer = require('base/Observer');
    
    module.exports = Viewport = {};
    
    var Viewport;
    var cache;
    var root;
    var layout;
    
    Z.mix(Viewport, {
        
        init: function(resolve){ //Viewport.init
    
            cache = [];
            
            root = Z('body').attr('id', 'Viewport');
            
            Viewport.width = root.width();
            Viewport.height = root.height();
            
            Observer.extendTo(Viewport);
            
            Z(window).on('resize', function(){
                Viewport.fire('resize', 
                    Viewport.width = root.width(), 
                    Viewport.height = root.height()
                );
            });
            
            resolve();
            
        },
        
        add: function(item, flag){
            
            if(flag){
                cache.push(item);
            }else{
                root.append(item);
            }
            
        },
        
        render: function(){
            
            if(cache.length){
                
                var fragment = document.createDocumentFragment();
                Z.forEach(cache, function(item){
                    fragment.appendChild(item.e);
                });
                
                cache = [];
                root.e.appendChild(fragment);
                
            }
            
        },
        
        layout: function(type){
            
            if(!type){
                return layout;
            }
            
            if(type != layout){
                
                root
                .cls('-layout-'+ layout)
                .cls('+layout-'+ (layout = type));
                
                Viewport.fire('layout', type);
                
            }
            
        },
        
        end: 0
    });

})
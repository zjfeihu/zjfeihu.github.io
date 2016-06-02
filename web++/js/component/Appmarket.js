define(function(module){
    /*
    应用市场模块
    #exports
        Appmarket.button()      生成应用市场按钮
    */
    
    var calls = require('widget/calls');
    var Win = require('base/Win');
    var Common = require('base/Common');
    var Contextmenu = require('base/Contextmenu');
    var App = require('component/App');
    
    module.exports = Appmarket = app = {};
    
    var Appmarket;
    var app;
    
    Appmarket.button = function(){
        return Z.E('<div class="app-icon"><img src="css/imgs/appmarket.png"><span>添加应用</span></div>')
        .click(function(){
            
            if(!app.window){
                app.fire('open');
            }else{
                app.fire('focus');
            }
            
        })
        .on('contextmenu', function(evt){
            evt.preventDefault();
            evt.stopPropagation();
            
        })
        .on('mousedown', function(evt){
            evt.preventDefault();
            evt.stopPropagation();
            Contextmenu.hide();
        });
    };
    
    Z.mix(Appmarket, {
    
        type: 'App',
        id: 'appmarket',
        attr: function(key){
            return key == 'iconsrc' ? 'css/imgs/appmarket.png' : '应用市场';
        },
        
        open: function(place){
            
            app.windowplace = place;
            
            app.window = Win({
                
                container: place.root,
                src: 'appmarket.html',
                title: '应用市场',
                width: 570,
                height: 560,
                resizable : false,
                
                onclose: function(){
                    app.fire('closed');
                },
                
                onfocus: function(){
                    
                    setTimeout(function(){ //需要在focused事件中使用app.window,所以延迟执行
                        app.fire('focused');
                    });
                    
                }
                
            });
            
            app.fire('opened');
            
        },
        
        focus: function(){
            app.window.focus();
        },
        
        fire: function(){
            App.fire.apply(app, arguments);
        },
        
        stopEvent: function(){
            App.fire.call(app);
        }
        
    });

})
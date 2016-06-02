define(function(module){
    /*
    主题模块
    #exports
        Theme.init(resolve)        初始化模块
    */
    var calls = require('widget/calls');
    var Win = require('base/Win');
    var Command = require('base/Command');
    var App = require('component/App');
    var Desktop = require('component/Desktop');
    
    module.exports = Theme = {};
    
    var Theme;
    var root;
    var backgroundimgs = [];
    
    Theme.init = function(resolve){ //Theme.init
    
        calls('Theme.init')
        .then(function(){ //设置背景图片地址
            for(var i = 1; i < 13; i++){
                backgroundimgs.push('bg_'+ (i < 10 ? '0'+ i : i) +'.jpg');
            }
        })
        .then(function(){ //设置节点
            root = Z.E(
                '<div class=Style-bigpic-list><ul>'
                + Z.rstr('<li imgname={%0}><img src=css/bgpic/small/{%0}></li>', backgroundimgs)
                + '</ul></div>'
            );
        })
        .then(function(){ //设置事件
            root.find('li').click(function(){
                setBackground(this.attr('imgname'));
            });
        })
        .then(function(){ //设置菜单指令
            
            Desktop.contextmenuitems.splice(3, 0, {text: '主题设置', cmd: 'openTheme'});
            
            var app = createApp();
            
            Command({
                openTheme: function(){
                    if(!app.window){
                        app.fire('open');
                    }else{
                        app.fire('focus');
                    }
                }
            });
        
        })
        .then(function(){ //设置主题背景
            setBackground(backgroundimgs[Math.random()*12|0]);
            resolve();
        });
        
    };
    
    function setBackground(img){
        Z('body').css('background:url(css/bgpic/big/'+ img +') center center');
    }
    
    function createApp(){ //模拟App接口
        var app;
        return app = {
    
            type: 'Theme',
            
            open: function(place){
                
                app.windowplace = place;
                
                app.window = Win({
                    
                    title: '设置主题',
                    content: root.e,
                    container: place.root,
                    width: 676,
                    height: 430,
                    center: true,
                    resizable: false,
                    minimizeable: false,
                    
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
            
        };
        
    }

})
define(function(module){
    /*
    应用模块
    #exports
    
        App.contextmenuitems        获取应用菜单数据引用，用于扩展模块扩展菜单项
        App.init(resolve)           初始化模块
        App(id)                     创建应用
        App.has(id)                 判断是否存在应用
        
        Observer.extendTo(App)      扩展来自Observer的接口
        
        app.id                      应用id
        app.icon                    应用图标节点
        app.place                   应用所处的容器
        app.index                   应用的位置
        
        app.type                    对象的类型
        app.isMove(place, index)    判断应用位置是否有移动
        app.add(place, index)       添加应用到指定位置
        app.open(place)             打开窗口
        app.focus()                 激活窗口    
        app.attr(key)               获取应用相关属性
        
    */
    
    var calls = require('widget/calls');
    var Win = require('base/Win');
    var Observer = require('base/Observer');
    var Command = require('base/Command');
    var Contextmenu = require('base/Contextmenu');
    var Data = require('component/Data');
    
    module.exports = App;
    
    var apps = {};
    var contextmenu;
    
    function App(id){
        
        if(apps[id]){
            return apps[id];
        }
        
        if(this.constructor != App){
            return new App(id);
        }
        
        var app = this;
        
        apps[app.id = id] = app;
        
        setHtml();
        setDrag();
        setContextmenu();
        
        function setHtml(){
            app.icon = Z.E(
                Z.rstr(
                    '<div class=app-icon><img src={%0}><span>{%1}</span></div>', 
                    app.attr('iconsrc'), app.attr('name')
                )
            ).click(function(){
                appclick(app);
            });
        }
        
        function setDrag(){
            
            var icon = app.icon;
            
            icon.drag({
                
                before: function(){
                    
                    if(Z.browser.ie && Z.browser.ie < 9){ //修正ie下的hover bug，鼠标离开还处于over状态
                        icon.cls('+fixhover');
                    }
                    
                    icon.opacity(.6);
                    
                    app.fire('beforeDrag');
                    
                },
                
                after: function(e){
                    
                    if(Z.browser.ie && Z.browser.ie < 9){ //修正ie下的hover bug，鼠标离开还处于over状态
                        icon.on('mouseover', fixhover);
                        function fixhover(){
                            icon.un('mouseover', fixhover);
                            icon.cls('-fixhover');
                        }
                    }
                    
                    icon.opacity(null);
                    
                    app.fire('drop', [e.clientX, e.clientY]);
                    
                },
                
                runing: function(e){
                    app.fire('draging', [e.clientX, e.clientY]);
                },
                
                clone: 1,
                range: 0
                
            });
        }
        
        function setContextmenu(){
            app.icon.on('contextmenu', function(e){
                e.preventDefault();
                e.stopPropagation();
                contextmenu.showBy(app, e.clientX, e.clientY);
            }).on('mousedown', function(){ //因为drag阻止了事件冒泡，为了能正常隐藏菜单，这里添加菜单隐藏逻辑
                contextmenu.hide();
            });
        }
        
    }
    
    Observer.extendTo(App);
    
    App.init = function(resolve){ //App.init
        
        calls('App.init')
        .then(function(){ //设置右键菜单
            
            var
            menuitems  = App.contextmenuitems = [ //右键菜单内容数据
                {text: '打开应用', icon:'1', cmd: 'openApp'},
                '-',
                {text: '卸载应用', cmd: 'removeApp'}
            ],
            original_contextmenu = new Contextmenu;
            
            contextmenu = { //重写original_contextmenu接口
                
                showBy: function(app, x, y){
                    app.fire('contextmenu');
                    original_contextmenu.render(menuitems).showBy(app, x, y);
                },
                
                hide: function(){
                    original_contextmenu.hide();
                }
                
            };
            
        })
        .then(function(){ //设置事件监听
           
            App.on('closed', function(){
               
               var app = this;
               
               setTimeout(function(){ //延迟是为了在最后操作，因为其他接口在closed状态下需要用到这些属性
                    app.window = null;
                    app.windowplace = null;
               });
               
            })
            .on('end', function(){});
            
        })
        .then(function(){ //设置菜单指令
        
            Command({
                
                openApp: function(){
                    appclick(this);
                },
                
                removeApp: function(){
                    this.remove(true);
                }
                
            });
            
            resolve();
            
        });
        
    };
    
    App.has = function(id){
        return id in apps;
    };
    
    Z.mix(App.prototype, {
        
        type: 'App',
        
        add: function(place, index){
            
            var app = this;
            
            if(app.place){
                app.remove();
            }
            
            app.fire('add', place, index);
            
            app.place = place;
            
        },
        
        remove: function(flag){
            
            var app = this;
            
            app.fire('remove');
            
            if(flag){
                app.close();
                delete apps[app.id];
            }
            
            app.place = null;
            
        },
        
        open: function(place){
            
            var app = this;
            
            if(app.window == 'waitopen'){
                return;
            }
            
            if(app.attr('isReady')){
                
                app.windowplace = place;
                app.window = Win({
                    container: place.root,
                    title: app.attr('name'),
                    src: app.attr('url'),
                    width: app.attr('width') || 640,
                    height: app.attr('height') || 480,
                    resizable : app.attr('resizable') === 0 ? false : true,
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
                
            }else{
                
                app.window = 'waitopen';
                
                Data.loadApp(app.id, app.attr('ver'), function(resp){
                    app.window = null;
                    if(resp){
                        app.open(place);
                    }else{
                        alert('打开失败');
                    }
                });
                
            }
            
        },
        
        close: function(){
            
            var app = this;
            
            if(app.window){
                app.window.close();
            }
            
        },
        
        focus: function(){
            this.window.focus();
        },
        
        isMove: function(place, index){
            
            var app = this;
            
            return app.place != place || app.index != index;
            
        },
        
        attr: function(key){
            return Data.getApp(this.id, key);
        },
        
        fire: function(){
            App.fire.apply(this, arguments);
        },
        
        stopEvent: function(){
            App.stopEvent.call(this);
        }
        
    });
    
    function appclick(app){
        
        if(app.window){
            app.fire('focus');
        }else{
            app.fire('open');
        }
        
    }

})
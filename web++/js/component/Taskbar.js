define(function(module){
    /*
    任务栏模块
    #exports
        Taskbar.init(resolve)       初始化模块
    */
    
    var calls = require('widget/calls');
    var Common = require('base/Common');
    var Command = require('base/Command');
    var Contextmenu = require('base/Contextmenu');
    var Data = require('component/Data');
    var Viewport = require('component/Viewport');
    var Desktop = require('component/Desktop');
    var App = require('component/App');
    
    module.exports = Taskbar = {};
    
    var Taskbar;
    var root; //容器根节点
    var buttonwraper; //按钮容器
    var apps = []; //应用对象缓存
    var curindex = -1; //当前激活的按钮位置
    
    Taskbar.init = function(resolve){ //Taskbar.init
            
        calls('Taskbar')
        .wait(function(resolve){ //加载图片资源
            Common.loadImgs([
                'bg_task_b.png',
                'bg_task_nor.png',
                'bg_task_over.png'
            ], resolve);
        })
        .then(function(){ //初始化节点
        
            Viewport.add(root = Z.E('<div id="Taskbar" class="Taskbar"><ul></ul></div>'), true);
            buttonwraper = root.find('ul');
            
        })
        .then(function(){ //设置静态接口
        
            Z.mix(Taskbar, {
                
                add: function(app){
                    
                    apps.push(app);
                    buttonwraper.append(
                        '<li class="itembox" appid="'+ app.id +'">\
                            <img src="'+ app.attr('iconsrc') +'"/>\
                            <span>'+ app.attr('name') +'</span>\
                        </li>'
                    );
                    
                },
                
                remove: function(app){
                    
                    var index = Taskbar._getIndex(app.id);
                    
                    apps.splice(index, 1);
                    buttonwraper.child(index).remove();
                    
                    if(curindex == index){
                        curindex = -1;
                    }
                    
                },
                
                focus: function(app){
                    
                    var index = Taskbar._getIndex(app.id);
                    
                    if(index != curindex){
                        
                        if(curindex > -1 && buttonwraper.child(curindex)){
                             buttonwraper.child(curindex).cls('-focus');
                        }
                        
                        buttonwraper.child(curindex = index).cls('+focus');
                        
                    }
                    
                },
                
                _click: function(app){
                    
                    if(app.window.isFocus() && app.windowplace.isFocus()){
                        app.window.toggle(); 
                    }else{
                        app.fire('focus');
                    }
                    
                },
                
                //获取指定App在缓存apps中的位置，也是他在buttonwraper中的位置
                _getIndex: function (appid){
                    for(var i = 0; i < apps.length; i++){
                        if(apps[i].id == appid){
                            return i;
                        }
                    }
                },
                
                _getApp: function(e){
                    var target = Z(e.target);	
                    var li = target.tag('LI') ? target : target.parent('li');
                    if(li){
                        return apps[Taskbar._getIndex(li.attr('appid'))];
                    }
                }
                
            });
            
        })
        .then(function(){ //设置事件监听
        
            root.click(function(e){
                var app = Taskbar._getApp(e);
                app && Taskbar._click(app);
            });
            
            App
            .on('opened', function(){
                if(this.type == 'App'){
                    Taskbar.add(this);
                }
            })
            .on('focused', function(){
                if(this.type == 'App'){
                    Taskbar.focus(this);
                }
            })
            .on('closed', function(){
                if(this.type == 'App'){
                    Taskbar.remove(this);
                }
            });
            
        })
        .then(function(){ //设置右键菜单
        
            var
            contextmenu = new Contextmenu([
                {text: '最大化', cmd: 'maximizeWindow'},
                '-',
                {text: '最小化', cmd: 'hideWindow'},
                {text: '关闭', cmd: 'closeApp'}
            ]);
            
            root.on('contextmenu', function(e){
                
                e.preventDefault();
                
                var app = Taskbar._getApp(e);
                
                app && contextmenu.showBy(app, e.clientX, e.clientY);
                
            });
            
        })
        .then(function(){ //设置菜单指令
        
            Command({
                
                maximizeWindow: function(){
                    
                    this.window.maximize();
                    this.fire('focus');
                },
                
                hideWindow: function(){    
                    this.window.hide();
                },
                
                closeApp: function(){
                    this.window.close();
                }
                
            });
            
        })
        .then(resolve);
        
    };

})
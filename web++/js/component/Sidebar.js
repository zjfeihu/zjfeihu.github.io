define(function(module){
    /*
    侧边模块
    #exports
        Sidebar.active              是否为激活状态
        Sidebar.root                菜单根节点
        Sidebar.type                标记模块类型
        Sidebar.init(resolve)       初始化模块
        Sidebar.addToollist(el)     该接口开放给Toollist模块使用
    */
    
    var calls = require('widget/calls');
    var Common = require('base/Common');
    var Command = require('base/Command');
    var Contextmenu = require('base/Contextmenu');
    var App = require('component/App');
    var Data = require('component/Data');
    var Viewport = require('component/Viewport');
    
    module.exports = Sidebar = {};
    
    var MAX_COUNT = 7;
    
    var Sidebar;
    var apps = [];
    var root;
    var sidebar;
    var appsbox;
    var layout;
    
    Sidebar.init = function(resolve){ //Sidebar.init
        
        calls('Sidebar.init')
        .then(function(){ //初始化节点
            root = Sidebar.root = Z.E(
                '<div id="Sidebar">\
                    <div class="guides">\
                        <div class="top"></div>\
                        <div class="left"></div>\
                    </div>\
                    <div class="sidebox">\
                        <div class="top"></div>\
                        <div class="left"></div>\
                        <div class="right"></div>\
                    </div>\
                </div>'
            );
            
            sidebar = Z.E(
                '<div class="sidebar clearfix">\
                    <ul class="appsbox clearfix"></ul>\
                </div>'
            );
            
            appsbox = sidebar.find('.appsbox');
            
            Viewport.add(root, true);
            
        })
        .wait(
        
            function(resolve){ //加载图片
                Common.loadImgs(
                    ['dock_l.png', 'dock_r.png', 'dock_t.png', 'portal_all_png.png'],
                    resolve
                );
            },
            
            function(resolve){ //设置拖动
            
                var
                width,
                height,
                delayTimer,
                focusPosition, //当前激活的位置
                draging = false,
                dragMasklayer = Z.E('<div class="masklayer"></div>');
                
                root.append(dragMasklayer);
                
                sidebar.on('mousedown', function(evt){
                    
                    if(evt.mouseKey != 'L'){
                        return;
                    }
                    
                    evt.preventDefault();
    
                    delayTimer = setTimeout(function(){
                        Z(document)
                        .on('mousemove', drag)
                        .on('mouseup', drop);
                    }, 200);
                    
                });
                
                Z(document).on('mouseup', function(){
                    clearTimeout(delayTimer);
                });
                
                resolve();
                
                function drag(evt){
                    
                    evt.preventDefault();
                    
                    if(!draging){
                        draging = true;
                        width = Viewport.width;
                        height = Viewport.height;
                        showGuides(layout);
                        dragMasklayer.show();
                    }
                    
                    if(evt.clientY < height * .2){ //上
                        showGuides('top');
                    }else if(evt.clientX < width * .5){//左边
                        showGuides('left');
                    }else{
                        showGuides('right');
                    }
                    
                }
                
                function drop(evt){
                    
                    draging = false;
                    
                    if(focusPosition != layout){
                        Viewport.layout(focusPosition);
                    }
                    
                    focusPosition = '';
                    dragMasklayer.hide();
                    hideGuides();
                    
                    Z(document).un('mousemove', drag).un('mouseup', drop);
                    
                }
                
                function showGuides(positon){
                    if(focusPosition != positon){
                        hideGuides();
                        root.cls('+focus-'+ (focusPosition = positon));
                    }
                }
                
                function hideGuides(){
                    root.cls('-focus-top,focus-left,focus-right');
                }
                
            },
            
            function(resolve){ //事件监听
                
                Viewport.on('layout', function(position){
                    root.find('.sidebox .'+ (layout = position)).append(sidebar);
                }); 
                
                App
                .on('add', function(place, index){
                    
                    var app = this;
                    
                    if(place.type == 'Sidebar'){
                        place.addApp(app, index);
                        app.stopEvent();
                    }
                    
                })
                .on('remove', function(){
                    
                    var app = this;
                    var place = app.place;
                    
                    if(place.type == 'Sidebar'){
                        place.removeApp(app);
                        app.stopEvent();
                    }
                    
                })
                .on('drop', function(point){
                    
                    if(Sidebar.active){
                        Sidebar.dropApp(this, point);
                    }
                    
                })
                .on('end', function(){});
                
                resolve();
                
            },
            
            function(resolve){ //右键菜单
                var
                menuItems = [
                    {text: '向左停靠', cmd: 'layout', args: 'left'},
                    {text: '向上停靠', cmd: 'layout', args: 'top'},
                    {text: '向右停靠', cmd: 'layout', args: 'right'}
                ],
                contextmenu = new Contextmenu;
                
                Command({
                    layout: function(position){
                        Viewport.layout(position);
                    }
                });
                
                root.on('contextmenu', function(evt){
                    
                    evt.preventDefault();
                    
                    menuItems[0].status = 
                    menuItems[1].status = 
                    menuItems[2].status = '';
    
                    menuItems[
                        ({left: 0, top: 1, right: 2})[layout]
                    ].status = 'selected';
                    
                    contextmenu.render(menuItems).showBy(Sidebar, evt.clientX, evt.clientY);
                    
                });
                
                resolve();
                
            },
            
            function(resolve){ //初始化应用
                Z.forEach(Data.CONFIG.sidebar.apps, function(app, index){
                    App(app.id).add(Sidebar, index);
                });
                resolve();
            }
        )
        .then(resolve);
        
    };
    
    Z.mix(Sidebar, {
        
        type: 'Sidebar',
        
        active: true,
        
        apps: apps,
        
        addApp: function(app, index){ //添加应用
        
            if(index == -1 || index > apps.length){ //添加到最后
                index = Math.min(apps.length, MAX_COUNT);
            }
            
            apps.splice(index, 0, app);
            
            Z.forEach(apps, function(app, i){
                app.index = i;
            });
            
            appsbox.append(
                Z.E('li').append(app.icon), index
            );
            
            if(apps.length > MAX_COUNT){ //位置超过最大个数
                app.fire('addoverflow', apps[apps.length -1]);
            }
            
        },
        
        removeApp: function(app){ //移除应用
                        
            var apps = this.apps;
    
            apps.splice(app.index, 1);
    
            app.icon.parent().remove();
            
            Z.forEach(apps, function(app, i){
                app.index = i;
            });
            
        },
        
        dropApp: function(app, point){
                        
            var that = this;
            var index = Common.getGridindex(appsbox, layout == 'top' ? [63, 0] : [0, 63], point);
            
            if(index == -1){
                return;
            }
            
            index = Math.min(index, apps.length);
            
            if(app.isMove(that, index)){
                app.add(that, index);
                app.stopEvent();
            }
            
        },
        
        addToollist: function(el){      
            sidebar.append(el);
        },
        
        end: 0
        
    });

})
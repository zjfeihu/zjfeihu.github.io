define(function(module){
    /*
    应用管理模块
    #exports
        Manager.init(resolve)       初始化模块
        Manager.active              判断是否激活状态
    */
    
    var calls = require('widget/calls');
    var Common = require('base/Common');
    var Command = require('base/Command');
    var Scroll = require('base/Scroll');
    var Viewport = require('component/Viewport');
    var App = require('component/App');
    var Desktop = require('component/Desktop');
    var Sidebar = require('component/Sidebar');
    
    module.exports = Manager = {};
    
    var Manager;
    var root;
    var sidebox;
    var deskbox;
    var deskScroll = [];
    var deskInner = [];
    
    Manager.init = function(resolve){ //Manager.init
    
        calls('Manager.init')
        .then(function(){ //初始化节点
            root = Z.E(
                '<div id="Manager" class="appManagerPanel">\
                    <div class="aMg_dock_container_bg"></div>\
                    <a class="aMg_close"></a>\
                    <div class="aMg_dock_container"></div>\
                    <div class="aMg_line_x"></div>\
                    <div class="aMg_folder_container"></div>\
                </div>'
            );
            sidebox = root.find('.aMg_dock_container');
            deskbox = root.find('.aMg_folder_container');
            Viewport.add(root, true);
        })
        .then(function(){ //设置事件监听
        
            root.find('a').click(function(e){
                closeManager();
            });
            
            Viewport.on('resize', function(){
                if(Manager.active){
                    refresh();
                }
            });
            
            App.on('drop', function(point){
                
                if(!Manager.active){
                    return;
                }
                
                var app = this;
                var index;
                
                index = Common.getGridindex(sidebox, [63, 0], point);
                if(index > -1){
                    
                    index = Math.min(6, index);
                    
                    if(Sidebar.apps.length > 6 && app.place != Sidebar){ //从其他地方移动到Sidebar，并且发生溢出
                        moveAppToDesk(Desktop.curdesk.index, Sidebar.apps[6], -1);
                    }
                    
                    moveAppToSide(app, index);
                    app.stopEvent();
                    return;
                }
                
                Z.forEach(Desktop.desks, function(desk, i){
                    var inner = deskInner[i];
                    var outer = inner.parent();
                    var box = inner.offsetHeight() > outer.offsetHeight() ? inner : outer;
                    var index = Common.getGridindex(box, [0, 35], point);
                    if(index > -1){
                        
                        moveAppToDesk(i, app, index);
                        
                        return true;
                    }
                });
                
            });
            
        })
        .then(function(){ //添加指令
            
            Command({
                openManager: openManager
            });
            
        })
        .then(function(){ //添加桌面和侧边容器
            Z.forEach(Desktop.desks, function(desk, i){
                
                var 
                folderItem = Z.E(
                    Z.rstr(
                        '<div class="folderItem">\
                            <div class="folder_bg folder_bg{%0}"></div>\
                            <div class="folderOuter" index="{%1}">\
                                <div class="folderInner"></div>\
                            </div>\
                            {%2}\
                        </div>', 
                        i + 1, i, i ? '<div class="aMg_line_y"></div>' : ''
                    )
                ),
                inner = folderItem.find('.folderInner');
                
                deskScroll.push(new Scroll(inner));
                deskInner.push(inner);
                deskbox.append(folderItem);
                
            });
            
        })
        .then(resolve);
        
    };
    
    var refresh = Common.debounce(function(){ //更新界面布局
        
        deskbox.height(Viewport.height - 80);
        Z.forEach(deskScroll, function(scroll){
            scroll.rerender();
        });
        
    });
          
    function openManager(){
        
        Sidebar.active = 
        Desktop.active = false;
        Manager.active = true;
        
        Z.forEach(Desktop.desks, function(desk, deskindex){
            Z.forEach(desk.apps, function(app, index){
                moveAppToDesk(deskindex, app, index, true);
            });
        });
        
    
        Z.forEach(Sidebar.apps, function(app, index){
            moveAppToSide(app, index, true);
        });
    
        Z('body').cls('+showAppManagerPanel');
        setTimeout(function(){
            root.cls('+folderItem_turn');
        });
        
    }
    
    function closeManager(){
        
        Sidebar.active = 
        Desktop.active = true;
        Manager.active = false;
        
        Z('body').cls('-showAppManagerPanel');
        root.cls('-folderItem_turn');
        
        Z.forEach(Desktop.desks, function(desk, i){
            
            var appsbox = desk.root.find('.appsbox').html('');
            
            Z.forEach(desk.apps, function(app, index){
                app.icon.parent().remove();
                appsbox.append(app.icon, index);
            });
            
            desk.refresh(true);
            
        });
        
        var appsbox = Sidebar.root.find('.appsbox').html('');
        Z.forEach(Sidebar.apps, function(app, index){
            app.icon.parent().remove();
            appsbox.append(Z.E('li').append(app.icon), index);
        });
        
    }
    
    function moveAppToDesk(deskindex, app, index, firstAdd){
        
        if(moveApp(Desktop.desks[deskindex], app, index) || firstAdd){
            deskInner[deskindex].append(
                Z.E('<div class=iconbox><span>'+ app.attr('name') +'</span></div>').append(app.icon, 0),
                index
            );
            refresh();
        }
        
        
    }
    
    function moveAppToSide(app, index, firstAdd){
        
        if(moveApp(Sidebar, app, index) || firstAdd){
            sidebox.append(
                Z.E('<div class="iconbox"></div>').append(app.icon),
                index
            );
        }
        
    }
    
    function moveApp(targetplace, app, index){
        
        var fromplace = app.place;
        var fromindex = app.index;
        var targetindex = index;
        
        if(fromplace != targetplace || fromindex != targetindex){
           
            
            var fromapps = fromplace.apps;
            Z.forEach(fromapps, function(theapp, i){ //从旧的容器移除
                if(app == theapp){
                    fromapps.splice(i, 1);
                    return true;
                }
            });
            Z.forEach(fromapps, function(app, i){
                app.index = i;
            });
            
            var targetapps = targetplace.apps;
            if(index == -1 || index > targetapps.length){
                index = targetapps.length;
            }
            app.place = targetplace;
            targetapps.splice(index, 0, app);
            
            Z.forEach(targetapps, function(app, i){
                app.index = i;
            });
            
            app.icon.parent().remove();
            
            refresh();
            
            return true;
            
        }
        
    }

})
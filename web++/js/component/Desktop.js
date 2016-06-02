define(function(module){
    /*
    桌面模块
    #exports
        Desktop.contextmenuitems    右键菜单数据引用
        Desktop.active              桌面是否为激活状态
        Desktop.curdesk             当前的桌面
        Desktop.desks               所有的桌面
        
        Desktop.init(resolve)       初始化模块    
        Desktop(option)             创建一个桌面
        
        Observer.extendTo(Desktop)  来自Observer的接口
        
        desktop.type                对象类型
        desktop.index               桌面下标
        desktop.apps                桌面中的应用
        desktop.root                桌面根节点
        desktop.refresh()           刷新桌面
        desktop.isFocus()           判断当前桌面是否显示状态
        
    */
    
    var calls = require('widget/calls');
    var Common = require('base/Common');
    var Scroll = require('base/Scroll');
    var Command = require('base/Command');
    var Observer = require('base/Observer');
    var Contextmenu = require('base/Contextmenu');
    var Data = require('component/Data');
    var Viewport = require('component/Viewport');
    var App = require('component/App');
    var Appmarket = require('component/Appmarket');
    
    module.exports = Desktop;
    
    var deskwraper;
    var desks = []; 
    var curdesk;
    var curgridsize;
    var deskindex = 0;
    var active = true; //设置桌面默认为活动状态，假如进入管理，桌面设置为不活的，不活动的桌面是不能执行其他操作的
    
    var MAX_COUNT = 5;
    var BIG_GRIDSIZE = [142, 112];      //大图标网格
    var SMALL_GRIDSIZE = [90, 90];    //小图标网格
    var GRIDSIZE = {big: BIG_GRIDSIZE, small: SMALL_GRIDSIZE};
    
    function Desktop(option){
        
        var that = this;
        
        that.apps = [];
        
        that.type = 'Desktop';
        that.index = deskindex++;
        
        that.root = Z.E(Z.rstr(function(){/*
            <div index={%0} class=deskContainer>
                <div class=appsboxWraper>
                    <div class=appsbox></div>
                </div>
            </div>
        */}, that.index));
        
        var apps = that.apps;
        var root = that.root;
        var appsbox = root.find('.appsbox');
        var cacherefresh = false;
        var gridsize = option.gridsize;
        var rows;
        var cols;
        var scroll = new Scroll(appsbox);
        var windows = []; //存放app.window
        var focuswindow; //当前激活的窗口
        var appmarketButton;
        
        if(Appmarket){
            appmarketButton = {icon:Appmarket.button()};
        }
        
        option.container.append(root);
        
        Z.mix(that, {
            
            setGrid: function(type){
                if(GRIDSIZE[type] != curgridsize){
                    curgridsize = GRIDSIZE[type];
                    deskwraper.cls('=desktop gridsize-'+ type);
                    that.refresh();
                }
            },
            
            addApp: function(app, index){
            
                if(index == -1 || index > apps.length){ //添加到最后
                    index = apps.length;
                    apps.push(app);
                }else{
                    apps.splice(index, 0, app);
                }
                
                Z.forEach(apps, function(app, i){
                    app.index = i;
                });
                
                appsbox.append(app.icon, index);
                
                that.refresh(true);
                
            },
            
            removeApp: function(app){
                
                apps.splice(app.index, 1);
                
                app.icon.remove();
                
                Z.forEach(apps, function(app, i){
                    app.index = i;
                });
                
                that.refresh(true);
                
            },
            
            dropApp: function(app, point){
                
                var index = Common.getGridindex(appsbox, gridsize, point);
                
                if(index == -1){
                    return;
                }
                
                index = Math.min(index, apps.length);
                
                if(app.isMove(that, index)){
                    app.add(that, index);
                    app.stopEvent();
                }
                
            },
            
            addWindow: function(window){ //窗口打开完成后需要的操作
                windows.push(window);
            },
            
            removeWindow: function(window){
                
                Z.forEach(windows, function(mywindow, i){
            
                    if(mywindow == window){
                        
                        windows.splice(i, 1);
                        
                        if(window == focuswindow){
                            
                            if(windows.length){
                                focuswindow = windows[windows.length - 1];
                            }else{
                                focuswindow = null;
                            }
                            
                        }
                        
                        return true;
                    }
                    
                });
               
            },
            
            focusWindow: function(window){
                if(window != focuswindow){
                    Z.forEach(windows, function(mywindow, i){
                        if(mywindow == window){
                            windows.push(focuswindow = windows.splice(i, 1)[0]);
                            return true;
                        }
                    });
                }
            },
            
            show: function(){
                
                var visible = true;
    
                Z.forEach(windows, function(window){
                    if(window.visible){
                        visible = false;
                    }
                });
                
                Z.forEach(windows, function(window){
                    if(visible){
                        window.show();
                    }else{
                        window.hide();
                    }
                });
                
                if(visible && focuswindow){
                    focuswindow.focus();
                }
                
            },
            
            focus: function(){
                
                if(that == curdesk){
                    return;
                }
                
                var direction;
                
                if(curdesk){
                    
                    if(curdesk.index > that.index){ //目标桌面小于当前桌面，执行右移
                        
                        curdesk.root.anim({left: 2000});
                        
                        if(that.root.left() > 0){
                            that.root.left(-2000);
                        }
                        
                    }else{
                        curdesk.root.anim({left: -2000});
                    }
                    
                    that.root.anim({left: 0});
                    
                }else{ //第一次激活桌面
                    
                    that.setGrid(GRIDSIZE.big == gridsize ? 'big' : 'small');
                    that.root.left(0);
                    
                }
                
                curdesk = that;
                
                curdesk.refresh();
                
                that.fire('focused');
                
                Desktop.curdesk = curdesk;
                
            },
            
            refresh: Common.debounce(function(compel){
                
                if(that != curdesk){
                    cacherefresh = compel || cacherefresh;
                    return;
                }
                
                if(cacherefresh){
                    compel = true;
                    cacherefresh = false;
                }
                
                var width = appsbox.parent().width();
                var height = appsbox.parent().height();
                
                var gridwidth = curgridsize[0];
                var gridheight = curgridsize[1];
                
                var currows = Math.max(height / gridheight | 0, 1);
                var curcols = width / gridwidth | 0;
                
                //执行更新数据和重排图标
                if(
                    rows != currows //行改变
                    || cols != curcols //列改变
                    || gridsize != curgridsize
                    || scroll.visible && (currows * curcols >= apps.length + 1) //网格足够容纳当前应用，隐藏滚动条
                    || compel //强制刷新
                ){
                   
                    var 
                    appscopy = apps.slice(0); //复制是为了加入市场应用的添加按钮
                    
                    if(appmarketButton){ //应用市场的按钮
                        appscopy.push(appmarketButton);
                        if(!appmarketButton.icon.parent('.appsbox')){
                            appsbox.append(appmarketButton.icon);
                        }
                    }
                    
                    if(currows * curcols < appscopy.length){ //网格空间不够，出现滚动条并重新计算行列
                        curcols = Math.max(1, curcols); //滚动条是纵向的，所以至少一列
                        currows = Math.ceil(appscopy.length / curcols); //重新计算行数
                    }
                    
                    appsbox.height(gridheight * currows);
                    
                    rows = currows;
                    cols = curcols;
                    gridsize = curgridsize;
                    
                    Z.forEach(appscopy, function(app, i){
                        app.icon.css({
                            left: (i / rows | 0) * gridwidth,
                            top: (i % rows) * gridheight
                        });
                    });
                
                }
                
                scroll.rerender();
                
            }),
            
            isFocus: function(){
                return that == curdesk;
            },
            
            fire: function(){
                Desktop.fire.apply(this, arguments);
            },
            
            end: 0
            
        });
        
        Z.forEach(option.apps, function(app, index){
            App(app.id).add(that, index);
        });
        
    }
    
    Observer.extendTo(Desktop);
    
    Desktop.init = function(resolve){ //Desktop.init
    
        calls('Desktop.init')
        .then(function(){ //初始化节点
            Viewport.add(
                deskwraper = Z.E('<div id=Desktop class=desktop></div>'), 
                true
            );
        })
        .then(function(){ //设置事件监听
            
            Viewport
            .on('layout', function(){
                curdesk.refresh();
            })
            .on('resize', function(){
                curdesk.refresh();
            });
            
            var submenuitems = [ //子菜单内容数据引用，独立引用便于操作
                {text: '桌面1', cmd: 'moveAppToDesk', args: 0},
                {text: '桌面2', cmd: 'moveAppToDesk', args: 1},
                {text: '桌面3', cmd: 'moveAppToDesk', args: 2},
                {text: '桌面4', cmd: 'moveAppToDesk', args: 3},
                {text: '桌面5', cmd: 'moveAppToDesk', args: 4}
            ];
            
            App.contextmenuitems.splice(2, 0, {text: '移动应用', submenu: submenuitems});
            
            App.on('contextmenu', function(){
                
                Z.forEach(submenuitems, function(item, i){
                    
                    if(curdesk.index == i){
                        item.status = 'selected';
                    }else{
                        item.status = '';
                    }
                    
                });
                
            });
            
            App
            .on('add', function(place, index){
                
                var app = this;
                
                if(place.type == 'Desktop'){
                    place.addApp(app, index);
                    app.stopEvent();
                }
                
            })
            .on('remove', function(){
                
                var app = this;
                var place = app.place;
                
                if(place.type == 'Desktop'){
                    place.removeApp(app);
                    app.stopEvent();
                }
                
            })
            .on('drop', function(point){
                
                if(Desktop.active){
                    curdesk.dropApp(this, point);
                }
                
            })
            .on('addoverflow', function(app){
                if(Desktop.active){
                    app.add(curdesk, -1);
                }
            })
            .on('end', function(){});
            
            App.on('open', function(){
                if(Desktop.active){
                    this.open(curdesk);
                }
            })
            .on('opened', function(){
                curdesk.addWindow(this.window);
            })
            .on('closed', function(){
                this.windowplace.removeWindow(this.window);
            })
            .on('focus', function(){
                if(Desktop.active){
                    this.windowplace.focus();
                    this.focus();
                }
            })
            .on('focused', function(){
                this.windowplace.focusWindow(this.window);
            })
        
        })
        .then(function(){ //设置右键菜单
        
            var 
            submenuitems1 = [
                {text: '大图标', cmd: 'setGrid', args: 'big'},
                {text: '小图标', cmd: 'setGrid', args: 'small'}
            ],
            submenuitems2 = [
                {text: '桌面1', cmd: 'toggleDesk', args: 0},
                {text: '桌面2', cmd: 'toggleDesk', args: 1},
                {text: '桌面3', cmd: 'toggleDesk', args: 2},
                {text: '桌面4', cmd: 'toggleDesk', args: 3},
                {text: '桌面5', cmd: 'toggleDesk', args: 4}
            ],
            menuitems = Desktop.contextmenuitems = [
                {text: '显示桌面', cmd: 'showDesk'},
                {text: '切换桌面', submenu: submenuitems2},
                '-',
                ///{text: '系统设置', cmd: 'openSystemset'},
                ///{text: '主题设置', cmd: 'openTheme'},
                {text: '图标设置', submenu: submenuitems1},
                '-',
                {text: '关于', cmd: 'showAbout'}
            ],
            contextmenu = new Contextmenu(menuitems);
            
            deskwraper.on('contextmenu', function(e){
                
                e.preventDefault();
                
                Z.forEach(submenuitems1, function(menuitem, i){
                    
                    if(curgridsize == GRIDSIZE.big && i == 0 || curgridsize == GRIDSIZE.small && i == 1){
                        menuitem.status = 'selected';
                    }else{
                        menuitem.status = '';
                    }
                    
                });
                
                Z.forEach(submenuitems2, function(menuitem, i){
                    
                    if(curdesk.index == i){
                        menuitem.status = 'selected';
                    }else{
                        menuitem.status = '';
                    }
                    
                });
                
                contextmenu.render(menuitems).showBy(Desktop, e.clientX, e.clientY);
                
            });
            
        })
        .then(function(){ //设置菜单指令
        
            Command({
                
                showDesk: function(){
                    curdesk.show();
                },
                
                toggleDesk: function(index){
                    desks[index].focus();
                },
                
                setGrid: function(type){
                    curdesk.setGrid(type);
                },
                
                showAbout: function(){
                    alert([
                        'WEB++是基于1kjs仿照WEBQQ开发的一款模拟桌面系统',   
                        '程序以文件和对象的方式进行管理，代码实现了流程控制和性能监控',   
                        '数据采用纯静态的JSON格式，在数据交互中实现了并行请求和串行处理',
                        '===========================================',
                        '感谢WEBQQ提供素材和交互模型，感谢Google App提供托管空间',
                        '本程序所有图片素材都来自网络，版权归原作者所有！',
                        '如有疑问请联系：zjfeihu@126.com',
                    ].join('\n\n'));
                },
                
                moveAppToDesk: function(index){ //图标位置移动
                    var app = this;
                    var targetdesk = desks[index];
                    if(targetdesk != curdesk){
                        app.add(targetdesk, -1);
                    }
                }
                
            });
            
        })
        .then(function(){ //初始化子桌面
            
            var desktop = Data.CONFIG.desktop;
            Z.forEach(desktop.desks, function(data, i){
                
                if(i == MAX_COUNT){
                    return true;
                }
                
                desks[i] = new Desktop({
                    container: deskwraper,
                    apps: data.apps,
                    gridsize: GRIDSIZE[desktop.gridtype || 'big']
                });
                
            });
            
            desks[desktop.curindex || 2].focus();
            
            Desktop.active = true; //设置桌面为激活状态
            Desktop.desks = desks; //在Navbar中使用
        
        })
        .then(resolve);
        
    };

})
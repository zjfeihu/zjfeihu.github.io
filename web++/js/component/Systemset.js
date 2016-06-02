define(function(module){
    /*
    侧边工具
    #exports 
        Systemset.init(resolve)     初始化模块
    */
    
    var calls = require('widget/calls');
    var Win = require('base/Win');
    var Command = require('base/Command');
    var App = require('component/App');
    var Desktop = require('component/Desktop');
    var Viewport = require('component/Viewport');
    
    module.exports = Systemset = {};
    
    var Systemset;
    var root;
    
    Systemset.init = function(resolve){//Systemset.init
        
        calls('Systemset.init')
        .then(function(){ //初始化节点
            root = Z.E(
                '<div>\
                    <div class="desktopSettingHeader">默认桌面(登录后默认显示)</div>\
                    <div class="desktopSettingBody default_desktop_setting" id="defaultDesktopRadioSet">\
                        <label><input type="radio" value="1" name="defaultDesktop" id="defaultDesktop_1">第1屏桌面</label>\
                        <label><input type="radio" value="2" name="defaultDesktop" id="defaultDesktop_2">第2屏桌面</label>\
                        <label><input type="radio" value="3" name="defaultDesktop" id="defaultDesktop_3" checked>第3屏桌面</label>\
                        <label><input type="radio" value="4" name="defaultDesktop" id="defaultDesktop_4">第4屏桌面</label>\
                        <label><input type="radio" value="5" name="defaultDesktop" id="defaultDesktop_5">第5屏桌面</label>\
                    </div>\
                    <div class="desktopSettingHeader">桌面图标设置</div>\
                    <div class="desktopSettingBody dsektop_icon_style_setting" id="desktopIconStyle">\
                        <label><input type="radio" value="1" name="desktopIconStyle" id="desktopIconStyle_1">小图标</label>\
                        <label><input type="radio" value="0" name="desktopIconStyle" id="desktopIconStyle_0" checked>大图标</label>\
                    </div>\
                    <div class="desktopSettingHeader">应用码头位置</div>\
                    <div class="desktopSettingBody dock_location_preview_contaienr">\
                    <div class="dock_location_preview dock_location_left" id="dockLocationPreview">\
                        <div class="dock_set_btn dock_set_left"><label class="dock_set_btn_label"><input type="radio" class="dock_set_btn_radio" value="left" name="dockLocation" id="dockSetLeft">左部</label></div>\
                        <div class="dock_set_btn dock_set_right"><label class="dock_set_btn_label"><input type="radio" class="dock_set_btn_radio" value="right" name="dockLocation" id="dockSetRight">右部</label></div>\
                        <div class="dock_set_btn dock_set_top"><label class="dock_set_btn_label"><input type="radio" class="dock_set_btn_radio" value="top" name="dockLocation" id="dockSetTop" checked>顶部</label></div>\
                    </div>\
                    </div>\
                </div>'
            );
        })
        .then(function(){ //设置事件监听
            root.click(function(e){
                var target = Z(e.target);
                switch(target.attr('name')){
                    case 'defaultDesktop': Command.call('toggleDesk', target.val() -1); break;
                    case 'desktopIconStyle': Command.call('setGrid', ['big', 'small'][target.val()]); break;
                    case 'dockLocation': 
                        Z('#dockLocationPreview').cls('=dock_location_preview dock_location_'+ target.val());
                        Viewport.layout(target.val()); break;
                }
            });
        })
        .then(function(){ //设置菜单指令
            
            Desktop.contextmenuitems.splice(4, 0, {text: '系统设置', cmd: 'openSystemset'});
            
            var app = createApp();
            
            Command({
                
                openSystemset: function(){
                    
                    if(!app.window){
                        app.fire('open');
                    }else{
                        app.fire('focus');
                    }
                    
                }
                
            });
            
            resolve();
            
        });
    };
    
    function createApp(){ //模拟App接口
        
        var app;
        return app = {
    
            type: 'Systemset',
            
            open: function(place){
                
                app.windowplace = place;
                
                app.window = Win({
                    
                    container: place.root,
                    title: '桌面设置',
                    content: root.e,
                    width: 580,
                    height: 560,
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
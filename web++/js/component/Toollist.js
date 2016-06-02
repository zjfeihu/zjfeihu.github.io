define(function(module){
    /*
    侧边工具栏
    #exports
        Toollist.init(resolve)      初始化模块
    */
    
    var calls = require('widget/calls');
    var Command = require('base/Command');
    var Sidebar = require('component/Sidebar');
    
    module.exports = Toollist = {};
    
    var Toollist;
    var root;
    
    Toollist.init = function(resolve){ //Toollist.init
    
        calls('Toollist.init')
        .then(function(){ //初始化节点
            root = Z.E(
                '<div class="toollist">\
                    <div class="item">\
                        <span class="pinyin" title="QQ云输入法" cmd="pinyin"></span>\
                        <span class="sound" title="静音" cmd="sound"></span>\
                    </div>\
                    <div class="item">\
                        <span class="setting" title="系统设置" cmd="setting"></span>\
                        <span class="theme" title="主题设置" cmd="theme"></span>\
                    </div>\
                    <div class="item2"><span title="开始"></span></div>\
                </div>'
            );
            Sidebar.addToollist(root);
        })
        .then(function(){ //设置事件监听
            root.click(function(evt){
                var target = Z(evt.target);
                switch(target.attr('cmd')){
                    case 'sound': target.cls('~mute'); break;
                    case 'theme': Command.call('openTheme'); break;
                    case 'setting': Command.call('openSystemset'); break;
                }
            });
            resolve();
        });
        
    };

})
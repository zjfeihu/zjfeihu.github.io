define(function(){
    /* 
     WEB++ v2.01
     模拟WEBQQ，使用模块化开发
     兼容 firefox, chrome, safari, opera, ie6+(ie6-7不完美支持)
     zjfeihu@126.com
    */
    
    Z(function(){
    
        require('component/Loader')
        .wait( //初始化前置模块
            require('component/Data'),
            require('component/Viewport'),
            require('component/App')
        )
        .wait(
            require('component/Desktop')
        )
        .wait(
            require('component/Theme'),
            require('component/Systemset'),
            require('component/Sidebar'),
            require('component/Taskbar'),
            require('component/Navbar')
        )
        .wait(
            require('component/Toollist'),
            require('component/Manager')
        )
        .then(function(resolve){ //渲染UI
            require('component/Viewport').render();
            require('component/Viewport').layout(
                require('component/Data').CONFIG.layout
            );
            window.WEBJJ = { //传递种组件对象给appmarket页面
                version: 1.02,
                appmarket: { //对appmarket页面开放接口
                    Desktop: require('component/Desktop'),
                    Data: require('component/Data'),
                    App: require('component/App'),
                    calls: require('widget/calls')
                }
            };
        });
    
    
        
    });

})
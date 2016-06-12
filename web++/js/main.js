
define('main', ['component/Loader', 'component/Data', 'component/Viewport', 'component/App', 'component/Desktop', 'component/Theme', 'component/Systemset', 'component/Sidebar', 'component/Taskbar', 'component/Navbar', 'component/Toollist', 'component/Manager', 'widget/calls'], function(){
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

});

define('component/Loader', ['widget/calls'], function(module){
    /*
    进度条模块
    #imports
        calls
    #exports
        Loader.wait(fn1, fn2, ...)  添加异步并行
        Loader.then(fn1, fn2, ...)  添加同步串行
    */
    
    var calls = require('widget/calls')('Loader');
    var loader = Loader();
    
    module.exports = {
        
        wait: function wait(){
            
            var wrapFns = [];
            for(var i = 0; i < arguments.length; i++){
                
                !function(fn){
                    
                    if(typeof fn.init == 'function'){
                        fn = fn.init;
                    }
                    
                    loader.addItem();
    
                    wrapFns.push({
                        original: fn,
                        fn: function(reslove, reject, loaded, go){
                            fn(function(){
                                loader.updata();
                                reslove();
                            }, reject, loaded, go);
                        }
                    });
                    
                }(arguments[i]);
                
            }
            
            calls.wait(wrapFns);
            
            return this;
            
        },
        
        then: function then(fn){
            
            if(typeof fn.init == 'function'){
                fn = fn.init;
            }
            
            loader.addItem();
            
            calls.then({
                original: fn,
                fn: function(reject, go){
                    fn(reject, go);
                    loader.updata();
                }
            });
            
            return this;
            
        },
        
        error: calls.error
        
    };
    
    function Loader(){
        
        var root = Z('.loader');
    
        var loadbar = root.find('.loader-bar');
        var ratetext = root.find('span');
        var totalwidth; //进度条总宽度
        var readycount = 0; //当前完成的任务数
        var totalcount = 0;
        var tr;
        
        Z('body').append(root);
        
        totalwidth = loadbar.parent().width();
        
        return {
            
            addItem: function(){
                totalcount++;
            },
            
            updata: function(){
                readycount++;
                clearTimeout(tr);
                tr = setTimeout(function(){
                    var rate = 0;
                    loadbar.anim({width: totalwidth * readycount / totalcount}, {
                        dur: 600,
                        onplay: function(){
                            rate = loadbar.width() * 100 / totalwidth;
                            ratetext.html(rate.toFixed(2) +'%');
                        },
                        ondone: function(){
                            if(rate == 100){ //全部加载完成
                                ratetext.html('');
                                root.anim({opacity: 0}, {
                                    ondone: function(){
                                        root.remove();
                                    }
                                }); 
                            }
                        }
                    });
                    
                }, 16); 
            }
            
        };
    }

});

define('widget/calls', [], function(module){
    /*
    流程控制组件
    #exports
        calls()                         创建流程
        calls.wait(fn1, fn2, fn..)      创建异步并行流程
        calls.then(fn1, fn2, fn..)      创建同步串行流程
        calls.error(fn)                 捕获错误处理
    #info
        wait(function(resolve, reject, recive, go){})
        then(function(reject, go){})
        calls.debug = true; 默认关闭调试
        ?callsdebug=1 通过url参数开启调试模式
    */
    
    module.exports = calls;
    
    var 
    STATUS_ERROR = 0,
    STATUS_READY = 1;
    
    function calls(id){
        
        var 
        exports,
        current,
        onerror,
        queue = [],
        index = 0,
        awaitcount,
        state = STATUS_READY,
        lines;
        
        if(calls.debug && calls.timeline){
            lines = calls.timeline(id); //用于时间轴的调试
            fire = debugfire;
        }
        
        setTimeout(fireQueue);
        
        return exports = {
            then: then,
            wait: wait,
            error: error
        };
        
        function then(){
            return pushQueue.call(exports, false, arguments);
        }
        
        function wait(){
            return pushQueue.call(exports, true, arguments);
        }
        
        function error(callback){
            onerror = callback;
            return exports;
        }
        
        function pushQueue(async, args){
            
            if(onerror)return;
            
            var name; //流程名，在go中使用
            var fns = {}.toString.call(args[0]) == '[object Array]' ? args[0] : [].slice.call(args, 0);
    
            if(async){
                
                for(var i = 0; i < fns.length; i++){
                    name = ( (fns[i].original || fns[i]) +'').match(/^function\s+(\w+)/);
                    if(name){
                        name = name[1];
                        break;
                    }
                }
                
                queue.push(current = {
                    fns: fns,
                    async: async
                });
                
                if(name){
                    current.name = name;
                }
                
            }else{
                
                for(var i = 0; i < fns.length; i++){
                    
                    name = ( (fns[i].original || fns[i]) +'').match(/^function\s+(\w+)/);
                    
                    queue.push(current = {
                        fns: [fns[i]],
                        async: async
                    });
                    
                    if(name){
                        current.name = name[1];
                    }
                    
                }
                
            }
            
            return exports;
            
        }
        
        function fireQueue(){
            
            if(state == STATUS_ERROR){
                return;
            }else{
                
                current = queue[index++];
                
                if(!current){ //队列中已经没有元素，结束队列调用
                    return;
                }
                
                var fns = current.fns;
                if(current.async){
                    awaitcount = fns.length;
                    for(var i = 0; i < fns.length; i++){
                        fire(fns[i], current.async);
                    }
                }else{
                    for(var i = 0; i < fns.length; i++){
                        if(state == STATUS_READY){
                            fire(fns[i]);
                        }
                    }
                    fireQueue();
                }
                
            }
            
        }
        
        function fire(fn, async){
            try{
                fn = fn.fn || fn;
                if(async){
                    fn(resolve, reject, recive, go);
                }else{
                    fn(reject, go);
                }
            }catch(e){
                if(!/不能执行已释放/.test(e.message)){
                    //reject(e.message);
                    throw e;
                }
            }
        }
        
        function debugfire(fn, async){
            
            //异步流程：初始化,进入等待,进入响应,完成操作
            
            var line = lines(fn.original || fn);
            
            try{
                
                fn = fn.fn || fn
                
                if(async){
                    
                    fn(
                    
                        function(){
                            line.pushDone();
                            resolve();
                        },
                        
                        function(reason){
                            line.pushDone();
                            reject(reason);
                        },
                    
                        function(){
                            line.pushRecive();
                        },
                        
                        function(name){
                            line.pushDone();
                            go(name);
                        }
                        
                    );
                    
                    line.pushWait();
                    
                }else{
                    fn(reject, go);
                    line.pushDone();
                }
                
            }catch(e){
                if(!/不能执行已释放/.test(e.message)){
                    //reject(e.message);
                    throw e;
                }
            }
            
        }
        
        function resolve(){
            if(awaitcount){
                awaitcount--;
            }
            if(!awaitcount){
                fireQueue();
            }
        }
        
        function reject(reason){
            state = STATUS_ERROR;
            onerror && onerror(reason);
        }
        
        function recive(){
            
        }
        
        function go(name){
            
            for(var i = 0; i < queue.length; i++){
                if(queue[i].name == name){
                    index = i;
                    if(current.async){
                        resolve();
                    }
                    return;
                }
            }
            
            throw 'can not found the module['+ name +'] for go';
            
        }
        
    }
    
    calls.then = function(){
        return calls().then.apply(null, arguments);
    };
    
    calls.wait = function(){
        return calls().wait.apply(null, arguments);
    };
    
    
    /*
    异步流程时间轴组件
    */
    
    !function(){
    
    calls.timeline = timeline;
    
    if(/callsdebug=1(?=&|$)/.test(location.search)){
        calls.debug = 1;
    }
    
    var groupid = 0;
    var groups = [];
    function timeline(id){
        
        init && init();
        
        groupid++;
        
        var lineid = 0;
        var group = {
            id: id || groupid,
            lines: []
        };
        
        groups.push(group);
        
        return function(fn){
            
            var exports;
            var line;
            
            group.lines.push(line = {
                
                id: function(){
                    lineid++;
                    var id = (''+ fn).match(/^function\s*([\w$]+)?(?:[^\/\r\n]|\/[^\/\r\n])*(?:\/{2,}(.+))?/);
                    return id && (id[2] || id[1]) || lineid;
                }(),
                
                times: {
                    init: time()
                }
                
            });
            
            var times = line.times;
            
            return exports = {
                
                pushWait: function(){
                    
                    if(times.done){ //假如同步流程作为异步流程使用，那么loading的时间等于init
                        times.loading = times.init;
                    }else{
                        times.loading = time();
                    }
                    
                    update();
                    
                },
                
                pushRecive: function(){
                    
                    times.loaded = time();
                    
                    update();
                    
                },
                
                pushDone: function(){
                    
                    times.done = time();
                    
                    if(times.loading && !times.loaded){ //没有调用recive接口，那么done的时候设置loaded
                        times.loaded = times.done;
                    }
                    
                    update();
                    
                }
                
            };
            
        };
        
    }
    
    function init(){
        
        init = null;
    
        loadstyle();
        
        function loadstyle(){
            
            var cssText = '\
    #calls_timeline{position:fixed; z-Index:9999; bottom:0; border-top:1px solid #666; border-bottom:4px solid #fff; left:0; right:0; font-size:12px; cursor:default;}\
    #calls_timeline .header{background:#eee; font-size:14px; border-bottom:1px dotted #666; line-height:1.8;}\
    #calls_timeline .header span{padding:0 2px; cursor:pointer; margin:0 4px}\
    #calls_timeline .header .name{padding-right:90px; cursor:default}\
    #calls_timeline .body{max-height:300px; overflow-x:hidden; overflow-y:auto; position:relative;}\
    #calls_timeline .body .line{background:#f9f9f9; border-top:1px solid #eee; float:left; height:14px; line-height:14px; width:100%;}\
    #calls_timeline .body .name{float:left; color:#0053ff; margin-right: -260px; text-indent:4px; width:260px;}\
    #calls_timeline .body .wrapper{float:left; width:100%;}\
    #calls_timeline .body .linebox{position:relative; overflow:hidden; margin-left:160px; padding-right:60px;}\
    #calls_timeline .body .linegroup{border-bottom:1px solid #62b666; overflow:hidden}\
    \
    #calls_timeline .body .line:hover{background:#ccc}\
    \
    #calls_timeline .line-padding,\
    #calls_timeline .line-run,\
    #calls_timeline .line-wait,\
    #calls_timeline .line-null{\
        float:left;\
        height:12px;\
        margin-top:1px;\
        overflow:hidden;\
    }\
    \
    #calls_timeline .line-run{\
        background:#9ee8a2;\
        background:linear-gradient(#9ee8a2, #62b666);\
        filter:progid:DXImageTransform.Microsoft.gradient(startcolorstr=#9ee8a2,endcolorstr=#62b666,gradientType=0);\
    }\
    #calls_timeline .line-wait{\
        background:#c8bedd;\
        background:linear-gradient(#c8bedd, #9286aa);\
        filter:progid:DXImageTransform.Microsoft.gradient(startcolorstr=#c8bedd,endcolorstr=#9286aa,gradientType=0);\
    }\
    #calls_timeline .text-takentime{\
        padding:0 4px;\
        position:absolute;\
        color:#666;\
    }\
    #calls_timeline .tips{\
        position:absolute;\
        display:none;\
        left:100px;\
        top:60px;\
        padding:8px;\
        background:#ffffe0;\
        border:1px solid #7eabcd;\
        box-shadow:2px 2px 4px #ccc;\
    }\
    ';
            
            var style = document.createElement('style');
            style.type = 'text/css';
            style.styleSheet && (style.styleSheet.cssText = cssText.replace(/opacity:\s*(0?\.\d+)/g, function(mc, opacity){
                return 'filter:alpha(opacity='+ parseInt(opacity * 100) +')';
            })) || style.appendChild(document.createTextNode(cssText)); 
            (document.head || document.documentElement).appendChild(style);
            
        }
        
    }
    
    var lock = 0;
    function update(){
        
        if(lock){
            return;
        }
        
        lock = 1;
        
        setTimeout(function(){ //延迟并合并更新
            drawline();
            lock = 0;
        }, 300);
        
    }
    
    var linesbox;
    function drawline(){
        
        if(!linesbox){
            
            linesbox = {};
            
            if(document.body){
                document.body.appendChild(rootElement());
            }else{
                var tr = setInterval(function(){
                    if(document.body){
                        clearInterval(tr);
                        document.body.appendChild(rootElement());
                    }
                }, 16);
            }
            
        }
        
        if(linesbox.style){
            linesbox.innerHTML = function(){
                
                var html = [];
                var begintime, endtime, totaltime;
                
                begintime = time();
                endtime = 0;
                
                //console.info(groups)
                
                for(var i = 0; i < groups.length; i++){
                    for(var j = 0; j < groups[i].lines.length; j++){
                        var line = groups[i].lines[j];
                        begintime = Math.min(line.times.init, begintime);
                        endtime = Math.max(line.times.done || line.times.loaded || line.times.loading || 0, endtime);
                    }
                }
                
                totaltime = endtime - begintime;
                
                var lineidx = 0;
                
                for(var i = 0; i < groups.length; i++){
                    
                    var lineshtml = [];
                    for(var j = 0; j < groups[i].lines.length; j++){
                        
                        var line = groups[i].lines[j];
                        var times = line.times;
                        var lineitemhtml = [];
                        
                        //console.info(times);
                        
                        lineitemhtml.push('<span class=line-padding style=width:'+ time2width(begintime, times.init) +'></span>');
                        
                        if(times.loading){ //初始化耗时
                            lineitemhtml.push('<span class=line-run style=width:'+ time2width(times.init, times.loading) +'></span>');
                        }
                        
                        if(times.loaded){ //异步等待耗时
                            lineitemhtml.push('<span class=line-wait style=width:'+ time2width(times.loading, times.loaded) +'></span>');
                        }
                        
                        if(times.done){ //响应耗时
                            lineitemhtml.push('<span class=line-run style=width:'+ time2width(times.loaded || times.init, times.done) +'></span>');
                            lineitemhtml.push('<span class=text-takentime>'+ (times.done - times.init) +'ms</span>');
                        }
                        
                        lineshtml.push('<div class=line idx='+ (lineidx++) +'>\
                            <div class=name>'+ [groups[i].id, line.id].join('.') +'</div>\
                            <div class=wrapper>\
                                <div class=linebox>'+ lineitemhtml.join('') +'</div>\
                            </div>\
                        </div>');
                        
                    }
                    
                    html.push('<div class=linegroup>'+ lineshtml.join('') +'</div>');
                    
                }
                
                return html.join('');
                
                function time2width(begin, end){
                    return (end - begin) / totaltime * 100 +'%';
                }
                
            }();
        }
        
        function rootElement(){
            
            var 
            rootElement = document.createElement('div');
            rootElement.id = 'calls_timeline';
            rootElement.innerHTML = '\
                <div class=header>\
                    <span class=name>模块名称</span>\
                    <span tlcmd=clear class=btn-clear>清除</span>\
                    <span tlcmd=toggle class=btn-toggle>隐藏</span>\
                    <span tlcmd=close class=btn-close>关闭</span>\
                </div>\
                <div class=body></div>\
                <div class=tips> </div>';
                
            linesbox = rootElement.children[1];
            var tipsElement = rootElement.children[2];
            
            rootElement.onclick = function(e){
                
                var target = e ? e.target : event.srcElement;
                
                switch(target.getAttribute('tlcmd')){
                    
                    case 'clear':
                        groups = [];
                        linesbox.innerHTML = '';
                        break;
                        
                    case 'toggle':
                        if(target.innerHTML == '隐藏'){
                            target.innerHTML = '显示';
                            linesbox.style.display = 'none';
                        }else{
                            target.innerHTML = '隐藏';
                            linesbox.style.display = 'block';
                        }
                        break; 
                        
                    case 'close':
                        rootElement.style.display = 'none';
                        update = function(){};
                        break;
                        
                }
                
            };
            
            var delaytimer;
            rootElement.onmousemove = function(e){
                
                e = e || event;
                
                var target = e.target || event.srcElement;
                var clientX = e.clientX;
                var clientY = e.clientY;
                
                clearTimeout(delaytimer);
                delaytimer = setTimeout(function(){
                    
                    var lineElement;
                    
                    while(target.parentNode){
                        if(target.className == 'line'){
                            lineElement = target;
                            showtips({clientX: clientX, clientY: clientY}, lineElement.getAttribute('idx'));
                        }
                        target = target.parentNode;
                    }
                    
                    if(!lineElement){
                        hidetips();
                    }
                    
                }, 60);
                
            };
            
            return rootElement;
            
            function showtips(evt, idx){
                var index = 0;
                for(var i = 0; i < groups.length; i++){
                    for(var j = 0; j < groups[i].lines.length; j++){
                        if(idx == index){
                            var line = groups[i].lines[j];
                            tipsElement.innerHTML = function(times){
                                
                                var html = [];
                                
                                if(times.loading){ //进入等待前耗费时间
                                    html.push('<div style=color:red>初始化时间：'+ (times.loading - times.init) +'ms</div>');
                                }
                                
                                if(times.loaded){ //异步等待时间
                                    html.push('<div style=color:green>异步等待时间：'+ (times.loaded - times.loading) +'ms</div>');
                                }
                                
                                if(times.done){
                                    
                                    if(times.loaded || times.loading){
                                        html.push('<span style=color:red>响应执行时间：'+ (times.done - (times.loaded || times.loading)) +'ms</span>');
                                    }else{
                                        html.push('<span style=color:red>同步执行时间：'+ (times.done - times.init) +'ms</span>');
                                    }
                                    
                                }
                                
                                return html.join('');
                                
                            }(line.times);
                            
                            index = -1;
                            
                            break;
                        }
                        
                        index++;
                    }
                    
                    if(index == -1)break;
                    
                }
                
                var 
                top = evt.clientY + 4 - rootElement.offsetTop,
                left = evt.clientX + 4;
                tipsElement.style.display = 'block';
                left = Math.min(left, rootElement.offsetWidth - tipsElement.offsetWidth - 8);
                top = Math.min(top, rootElement.offsetHeight - tipsElement.offsetHeight -8);
                tipsElement.style.top = top +'px';
                tipsElement.style.left = left +'px';
                
            }
            
            function hidetips(){
                tipsElement.style.display = 'none';
            }
            
        }
        
    }
    
    function time(){
        return +new Date;
    }
        
    }();

});

define('component/Data', [], function(module){
    /*
    数据模块
    #exports
        Data.init(resolve)              初始化
        Data.loadApp(id, ver, ready)    加载App数据
        Data.getApp(id, key)            获取App数据指定的属性
    */
    
    module.exports = Data = {};  
    
    var Data;
    var apps = {};
    
    Z.mix(Data, {
        
        init: function(resolve){ //Data.init
        
            Z.get('data/config.json', function(resp){
                if(resp){
                    
                    Data.CONFIG = Z.parseJson(resp);
                    
                    Z.forEach(Data.CONFIG.sidebar.apps, function(app, i){
                        apps[app.id] = app;
                        app.iconsrc = iconsrc(app.id);
                    });
                    
                    Z.forEach(Data.CONFIG.desktop.desks, function(desk, i){
                        Z.forEach(desk.apps, function(app, i){
                            apps[app.id] = app;
                            app.iconsrc = iconsrc(app.id);
                        });
                    });
                    
                    resolve();
                }
            });
            
        },
        
        loadApp: function(id, ver, ready){
            Z.get(
                'data/detail/'+ Math.ceil(id/1000) +'/'+ id +'.json' + (ver ? '?' + ver : ''),
                function(resp){
                    var data = Z.parseJson(resp);
                    if(data){
                        data.isReady = true;
                        data.iconsrc = iconsrc(id);
                        apps[id] = data;
                        ready(data);
                    }else{
                        ready(false);
                    }
                    
                }
            );
        },
        
        getApp: function(id, key){
            return apps[id][key];
        }
        
    });
    
    function iconsrc(id){
        return Z.rstr(
            'http://{%0}.web.qstatic.com/webqqpic/pubapps/{%1}/{%2}/images/big.png',
            Math.random() * 10 | 0, id / 1000 | 0, id
        );
    }

});

define('component/Viewport', ['base/Observer'], function(module){
    /*
    视窗模块
    #exports
        Viewport.width                  视窗宽度
        Viewport.height                 视窗高度
        Viewport.init(resolve)          初始化模块
        Viewport.add(item, cache)       添加元素到视窗中，cache控制是否缓存模式
        Viewport.render()               渲染缓存中的元素
        Viewport.layout(type)           获取，设置视窗布局
        Observer.extendTo(Viewport)     扩展来自Observer的接口
    */
    
    var Observer = require('base/Observer');
    
    module.exports = Viewport = {};
    
    var Viewport;
    var cache;
    var root;
    var layout;
    
    Z.mix(Viewport, {
        
        init: function(resolve){ //Viewport.init
    
            cache = [];
            
            root = Z('body').attr('id', 'Viewport');
            
            Viewport.width = root.width();
            Viewport.height = root.height();
            
            Observer.extendTo(Viewport);
            
            Z(window).on('resize', function(){
                Viewport.fire('resize', 
                    Viewport.width = root.width(), 
                    Viewport.height = root.height()
                );
            });
            
            resolve();
            
        },
        
        add: function(item, flag){
            
            if(flag){
                cache.push(item);
            }else{
                root.append(item);
            }
            
        },
        
        render: function(){
            
            if(cache.length){
                
                var fragment = document.createDocumentFragment();
                Z.forEach(cache, function(item){
                    fragment.appendChild(item.e);
                });
                
                cache = [];
                root.e.appendChild(fragment);
                
            }
            
        },
        
        layout: function(type){
            
            if(!type){
                return layout;
            }
            
            if(type != layout){
                
                root
                .cls('-layout-'+ layout)
                .cls('+layout-'+ (layout = type));
                
                Viewport.fire('layout', type);
                
            }
            
        },
        
        end: 0
    });

});

define('base/Observer', [], function(module){
    /*
    观察者模式事件模型
    #exports
    
        Observer.extendTo(module)    扩展Observer的接口到目标模块
        
        module.on(type, fn)                         添加事件
        module.fire(type, args1, args2, ...)        触发事件
        module.stopEvent()                          阻止事件传播
        
    */
    
    module.exports = Observer;
    
    function Observer(){
        
        var queue = {};
        var stop = false;
        
        this.on = function(type, fn){
            if(!queue[type]){
                queue[type] = [fn];
            }else{
                queue[type].push(fn);
            }
            return this;
        };
        
        this.fire = function(type){
            var args = [].slice.call(arguments, 1);
            forEach(queue[type], function(fn){
                fn.apply(this, args);
                return stop;
            }, this);
            stop = false;
            return this;
        };
        
        this.stopEvent = function(){
            stop = true;
        };
        
    }
    
    //扩展接口到指定模块
    Observer.extendTo = function(target){
        var key, source = new Observer;
        for(key in source){
            target[key] = source[key];
        }
    };
    
    function forEach(arr, fn, context){
        if(arr && arr.length){
            var item, i = 0;
            while(item = arr[i]){
                if(fn.call(context, item, i++)){
                    break; 
                }                    
            }                
        }
    }

});

define('component/App', ['widget/calls', 'base/Win', 'base/Observer', 'base/Command', 'base/Contextmenu', 'component/Data'], function(module){
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

});

define('base/Win', ['widget/zwin', 'base/Contextmenu'], function(module){
    /*
    窗口类
    #imports
        zwin,Viewport,Contextmenu
    #exports
        win(option)     创建窗口
    */
    
    var zwin = require('widget/zwin');
    var Contextmenu = require('base/Contextmenu');
    
    module.exports = function(option){
        return win(option);
    };
    
    zwin.imgpath = location.href.replace(/[^/]*$/, '') + 'css/imgs/'
    
    var win = zwin.extend({
        
        init: function(option){
            
            var 
            offsetLeft =  Z('body').width() - 26 - option.width,
            offsetTop =  Z('body').height() -26 - option.height;
            
            if(option.center){
                option.left = Math.max(26, offsetLeft / 2 + 13);
                option.top = Math.max(26, offsetTop / 2 + 13);
            }else{
                option.left = Math.max(26, Math.min( offsetLeft, 0 | offsetLeft * Math.random() ));
                option.top = Math.max(26, Math.min( offsetTop, 0 | offsetTop * Math.random() ));
            }
            
            option.onClose = option.onClose || option.onclose;
            option.onFocus = option.onFocus || option.onfocus;
            option.onOpen = option.onOpen || option.onopen;
            
            this._super(option);
            
            this.rootElem
            .on('contextmenu', function(e){
                e.stopPropagation();
                e.preventDefault();
            })
            .on('mousedown', function(){
                Contextmenu.hide();
            });
            
            this.titlebarElem.on('mousedown', function(){
                Contextmenu.hide();
            });
            
        }
        
    });

});

define('widget/zwin', [], function(module){
    //zwin.js v0.11 窗口类

    module.exports = function(){
        
        var
        MIN_WIDTH = 160,
        MIN_HEIGHT = 26,
        DEFAULT = {
            title: 'title',
            src: '',
            content: '',
            left: 10,
            top: 10,
            width: 800,
            height: 400,
            resizable: true, //是否可改变大小
            minimizeable: true, //是否可最小化
            dragable: true, //是否可改拖动
            container: null, //窗口的父容器
            onClose: null, //关闭回调
            onMaximize: null, //最大化回调
            onMinimize: null, //最小化回调
            onFocus: null, //窗口获得焦点回调
            onOpen: null, //窗口打开回调
            end: null
        },
        zIndex = 9999,
        activeWin, //活动的窗口
        end;
        
        var hasstyle;
        
        var zwin = Z.Class({
            
            init: function(option){
                
                if(!hasstyle){
                    hasstyle = 1;
                    this._loadstyle();
                }
                
                var 
                that = this, 
                attrs = {},
                rootElem,
                titlebarElem,
                btnElem,
                end;
                
                option = option || {};
                
                Z.forEach(DEFAULT, function(val, key){
                    attrs[key] = key in option ? option[key] : val;
                });
                
                that.attr = function(key, val){
                    if(val === undefined){
                        return attrs[key];
                    }
                    attrs[key] = val;
                };
                
                setHtml();
                setEvent();
                setResize();
                setDrag();
                
                that.title(that.attr('title'));
                that.size(that.attr('width'), that.attr('height'));
                that.position(that.attr('left'), that.attr('top'));
                
                if(that.attr('src')){
                    that.content('');
                }
                
                that.content(that.attr('src') ? '<iframe src="'+that.attr('src')+'" frameborder=0></iframe>' : that.attr('content'));
                
                that.attr('onOpen') && that.attr('onOpen').call(that);
                that.show();
                
                function setHtml(){
                    
                    that.rootElem = rootElem = Z.E(Z.rstr(
                        '<div class=zwin>\
                            <div class=titlebar>\
                                <h4>{title}</h4>\
                                <ul>\
                                    <li class=closeBox></li>\
                                    {minimizebox}\
                                </ul>\
                            </div>\
                            <div class=contentbox>\
                                <div class=content></div>\
                                <div class=masklayer></div>\
                            </div>\
                        </div>',
                        {
                            title: that.attr('title'),
                            minimizebox: that.attr('minimizeable') ? '<li class=minimizeBox></li>':''
                        }
                    ));
                    
                    titlebarElem = rootElem.find('.titlebar');
                    btnElem = rootElem.find('ul');
                    that.titlebarElem = titlebarElem;
                    that.titleElem = titlebarElem.find('h4');
                    that.contentElem = rootElem.find('.content');
                    
                    Z(that.attr('container') || document.body).append(rootElem);
                    
                }
                
                function setEvent(){
                    
                    var isMaximize = false;
                    
                    rootElem.on('mousedown', function(){
                        that.focus();
                    });
                    
                    titlebarElem.on('mousedown', function(){
                        that.focus();
                    }).on('dblclick', function(){
                        
                        if(!that.attr('resizable')){
                            return;
                        }
                        
                        if(isMaximize){
                            isMaximize = false;
                            that.normal();
                        }else{
                            isMaximize = true;
                            that.maximize();
                        }
                        
                    });
                    
                    btnElem.on('mousedown', function(e){
                        that.focus(); 
                        e.stopPropagation();
                    }).click(function(e){
                        
                        var fn = ({
                            closeBox: that.close,
                            maximizeBox: that.maximize,
                            minimizeBox: that.hide,
                            normalBox: that.normal
                        })[e.target.className];
                        
                        fn && fn.call(that);
                        
                    });
                    
                }
                
                function setResize(){
                    
                    if(!that.attr('resizable')){
                        return;
                    }
                    
                    var 
                    rElem,
                    minWidth = MIN_WIDTH,
                    minHeight = MIN_HEIGHT,
                    clientX,
                    clientY,
                    direction,
                    resize,
                    
                    top0,
                    left0,
                    width0,
                    height0,
            
                    e;
                    
                    rootElem.append(rElem = Z.E(
                        '<ul class="resizebox">\
                            <li class="n"></li>\
                            <li class="w"></li>\
                            <li class="e"></li>\
                            <li class="s"></li>\
                            <li class="nw"></li>\
                            <li class="ne"></li>\
                            <li class="sw"></li>\
                            <li class="se"></li>\
                        </ul>'
                    ));
                    
                    btnElem.append([
                        '<li class="maximizeBox"></li>',
                        '<li class="normalBox"></li>'
                    ], 1);
                    
                    rElem.on('mousedown', function(evt){
                        
                        evt.preventDefault(); //chrome下禁止文本选择
                        that.focus();
                        
                        clientX = evt.clientX;
                        clientY = evt.clientY;
                        direction = evt.target.className;
                        
                        top0 = rootElem.top();
                        left0 = rootElem.left();
                        width0 = rootElem.width();
                        height0 = rootElem.height();
                        
                        rootElem.cls('+draging');
                        Z(document).on('mousemove', resizing);
                        Z(document).on('mouseup', unresize);
                        
                    });
                    
                    resize = {
                        n: function(e){
                            var 
                            top = top0 + e.clientY - clientY,
                            height = height0 - (e.clientY - clientY);
                            if(top < 0){
                                height += top;
                                top = 0;
                            }else if(height < minHeight){
                                top += height - minHeight;
                                height = minHeight;
                            }
                            rootElem.top(top);
                            rootElem.height(height);
                        },
                        w: function(e){
                            var 
                            left = left0 + e.clientX - clientX,
                            width = width0 - (e.clientX - clientX);
                            if(width < minWidth){
                                left += width - minWidth;
                                width = minWidth;
                            }
                            rootElem.left(left);
                            rootElem.width(width);
                        },
                        e: function(e){
                            var width = width0 + (e.clientX - clientX);
                            if(width < minWidth){
                                width = minWidth;
                            }
                            rootElem.width(width);
                        },
                        s: function(e){
                            var height = height0 + (e.clientY - clientY);
                            if(height < minHeight){
                                height = minHeight;
                            }
                            rootElem.height(height);
                        },
                        nw: function(e){this.n(e); this.w(e);},
                        ne: function(e){this.n(e); this.e(e);},
                        sw: function(e){this.s(e); this.w(e);},
                        se: function(e){this.s(e); this.e(e);}
                    };
                    
                    function resizing(evt){
                        
                        window.getSelection ? window.getSelection().removeAllRanges() : document.selection.empty();
                        resize[direction](evt);
                    }
                    
                    function unresize(){
                        rootElem.cls('-draging');
                        Z(document).un('mousemove', resizing);
                        Z(document).un('mouseup', unresize);
                    }
                    
                }
                
                function setDrag(){
                    
                    if(!that.attr('dragable')){
                        return;
                    }
                    
                    var
                    docHeight;
                    that.drag = rootElem.drag({
                        hand: titlebarElem.e,
                        //range: 0,
                        before: function(){
                            docHeight = window.innerHeight || document.documentElement.clientHeight;
                            rootElem.cls('+draging');
                        },
                        runing: function(){
                            var
                            offsetTop = rootElem.offsetTop(),
                            top;
                            
                            if(offsetTop < 0 || offsetTop > docHeight - 26){
                                top = rootElem.top() - offsetTop;
                                if(offsetTop > 0){ //超出界面底部
                                    top += docHeight - 26;
                                }
                                rootElem.top(top);
                            }
                        },
                        after: function(){
                           rootElem.cls('-draging');
                        }
                    });
                    
                }
            },
            
            isFocus: function(){
                return this == activeWin;
            },
            
            unFoucs: function(){
                if(this.isFocus()){
                    activeWin.rootElem.cls('-active');
                    activeWin = null;
                }
            },
            
            focus: function(){
                
                var that = this;
                if(!that.isFocus()){
                    
                    if(activeWin){
                        activeWin.unFoucs();
                    }
                    
                    activeWin = that;
                    
                    that.rootElem.css('zIndex', ++zIndex).cls('+active');
                    that.attr('onFocus') && that.attr('onFocus').call(that);
                    
                }
                
                if(!that.visible){
                    that.visible = true;
                    that.rootElem.show();
                }
                
            },
            
            show: function(){
                var that = this;
                if(!that.visible){
                    that.visible = true;
                    that.rootElem.show();
                }
                that.focus();
            },
            
            hide: function(){
                var that = this;
                if(that.visible){
                    that.visible = false;
                    that.rootElem.hide();
                    that.attr('onMinimize') && that.attr('onMinimize').call(that);
                }
            },
            
            close: function(){
                var that = this;
                that.unFoucs();
                that.attr('onClose') && that.attr('onClose').call(that);
                that.rootElem.remove();
            },
            
            toggle: function(){
                var that = this;
                that.visible ? that.hide() : that.show();
            },
            
            normal: function(){
                var that = this;
                that.rootElem.cls('-maximized');
                that.drag && that.drag.unlock();
            },
            
            maximize: function(){
                
                var that = this;
                
                if(!that.attr('resizable')){
                    return;
                }
                
                that.rootElem.cls('+maximized');
                that.drag && that.drag.lock();
                that.attr('onMaximize') && that.attr('onMaximize').call(that);
                that.show();
            },
            
            size: function(width, height){
                var rootElem = this.rootElem;
                rootElem.width( width > 0 ? Math.max(width, MIN_WIDTH) : width );
                rootElem.height( height > 0 ? Math.max(height, MIN_HEIGHT) : height );
            },
            
            title: function(text){
                var that = this;
                if(text){
                    that.attr('title', text);
                    that.titleElem.html(text);
                }else{
                    return that.attr('title');
                }
            },
            
            content: function(html){
                var that = this;
                if(typeof html != 'undefined'){
                    that.attr('content', html);
                    if(typeof html == 'object' && html.nodeType == 1){
                        that.contentElem.html('').append(html);
                    }else{
                        that.contentElem.html(html);
                    }
                }else{
                    return that.attr('content');
                }
            },
            
            position: function(x, y){
                var that = this;
                if(x || x === 0){
                    that.left(x);
                }
                if(y || y === 0){
                    that.top(y);
                }
            },
            
            left: function(x){
                this.rootElem.left(x);
            },
            
            top: function(y){
                this.rootElem.top(y);
            },
            
            _loadstyle: function(){
                Z.style(Z.rstr("\
                    .zwin{display:none; overflow:hidden; position:absolute; left:20%; top:10%; background:#fff; border:1px solid #ccc; border-radius:5px 5px 0 0; min-width:160px}\
    \
    .zwin .titlebar{height:25px; padding-right:80px; background:url({%0}/sprite_repeat_x_png.png) repeat-x 0 -30px; border-bottom:1px solid #ccc; border-radius:5px 5px 0 0}\
    .zwin .titlebar h4{float:left; margin:0; padding-left:.5em; line-height:25px; color:#333; font-weight:bold}\
    .zwin .titlebar ul{position:absolute; top:0; right:0; margin:0; padding:4px 5px 0 0}\
    .zwin .titlebar li{float:right; margin-left:4px; width:21px; height:19px; background:url({%0}/sprite_main_png.png) no-repeat; cursor:pointer; list-style: none}\
    .zwin .titlebar .minimizeBox{background-position:-5px -58px}\
    .zwin .titlebar .minimizeBox:hover{background-position:-5px -30px}\
    .zwin .titlebar .maximizeBox{background-position:-34px -59px}\
    .zwin .titlebar .maximizeBox:hover{background-position:-34px -30px}\
    .zwin .titlebar .closeBox{background-position:-64px -59px}\
    .zwin .titlebar .closeBox:hover{background-position:-64px -30px}\
    .zwin .titlebar .normalBox{background-position:-94px -59px}\
    .zwin .titlebar .normalBox:hover{background-position:-94px -30px}\
    \
    .zwin .contentbox{position:absolute; top:26px; bottom:0; width:100%}\
    .zwin .content{position:absolute; width:100%; top:0; bottom:0}\
    .zwin iframe{position:absolute; width:100%; height:100%; left:0; top:0; border:0;}\
    .zwin .masklayer{width:100%; height:100%; position:absolute; left:0; top:0; opacity:0; z-index:2;background:#ccc}\
    \
    \
    .zwin.active .masklayer{display:none}\
    .zwin.draging .masklayer{display:block}\
    .zwin.maximized{left:0!important; top:0!important; bottom:0; right:0; width:auto!important; height:auto!important; z-index:99999!important}\
    .zwin .normalBox{display:none}\
    .zwin.maximized .normalBox{display:block}\
    .zwin.maximized .maximizeBox{display:none}\
    .zwin.maximized .resizebox{display:none}\
    \
    \
    .zwin .resizebox{margin:0; padding:0}\
    .zwin .resizebox.disable{display:none}\
    .zwin .resizebox li{position:absolute;z-index:3;width:3px;height:3px;overflow:hidden;}\
    .zwin .resizebox .n{cursor:n-resize;width:100%;left:0;top:0}\
    .zwin .resizebox .w{cursor:w-resize;height:100%;left:0;top:0}\
    .zwin .resizebox .e{cursor:e-resize;height:100%;right:0;top:0}\
    .zwin .resizebox .s{cursor:s-resize;width:100%;left:0;bottom:0}\
    .zwin .resizebox .nw,\
    .zwin .resizebox .ne,\
    .zwin .resizebox .sw,\
    .zwin .resizebox .se{width:4px;height:4px}\
    .zwin .resizebox .nw{cursor:nw-resize;top:0;left:0}\
    .zwin .resizebox .ne{cursor:ne-resize;top:0;right:0}\
    .zwin .resizebox .sw{cursor:sw-resize;left:0;bottom:0}\
    .zwin .resizebox .se{cursor:se-resize;right:0;bottom:0}\
    \
    \
    .zwin .titlebar{*zoom:1}\
    .zwin .titlebar ul{*width:76px; _width:82px}\
    .zwin .resizebox li{background:#eee; opacity:0; filter:alpha(opacity=0);}\
    .zwin .contentbox{*height:100%}\
    .zwin .content{*height:100%}\
    .zwin .masklayer{filter:alpha(opacity=0); *zoom:1}\
    .zwin.maximized{_height:100%!important}\
                ", zwin.imgpath));
            },
            
            end: 0
        }, {
            imgpath: '/dist/zwin.imgs/'
        });
        
        return zwin;
        
    }();

});

define('base/Contextmenu', ['base/Command'], function(module){
    /*
    右键菜单类
    #imports
        Command
    #exports
        Contextmenu(items)      创建菜单    
        Contextmenu.hide()      隐藏全部菜单
        
        contextmenu.root                    菜单根节点
        contextmenu.context                   调用菜单的对象
        contextmenu.items                   菜单数据
        contextmenu.showBy(which, x, y)     显示菜单
        contextmenu.hide()                  隐藏菜单
        contextmenu.render(items)           重新渲染菜单
        
    */
    
    var Command = require('base/Command');
    
    module.exports = Contextmenu;
    
    var
    curmenu, //当前显示的菜单
    container = Z.E('<div id=Contextmenu></div>'); //菜单容器
    
    function Contextmenu(items){
        
        init && init();
        
        var 
        root,
        that = this;
        
        container.append(
            root 
            = that.root 
            = Z.E('<div class=Contextmenu>'+ createItem(that.items = items) +'</div>')
        );
        
        root.on('mousedown', function(e){
            
            e.stopPropagation();
            
            if(e.mouseKey != 'L'){
                return;
            }
            
            var 
            target = Z(e.target),
            menuitem = target.tag('LI') ? target : target.parent(),
            cmd = menuitem.attr('cmd'),
            args = menuitem.attr('args'),
            status = menuitem.attr('status');
            
            if(cmd && !/^(selected|disabled)$/.test(status)){
                root.hide();
                Command.apply(
                    that.context,
                    cmd,
                    args ? args.split(',') : []
                );
            }
            
        }).on('Contextmenu', function(e){
            e.preventDefault();
            e.stopPropagation();
        }); 
    
    }
        
    Z.mix(Contextmenu, {
        
        hide: function(){
            if(curmenu){
                curmenu.root.hide();
                curmenu = null;
            }
        }
        
    });
    
    Z.mix(Contextmenu.prototype, {
        
        showBy: function(context, x, y){
            
            var that = this;
            var root = that.root;
            
            if(curmenu != that){
                that.hide();
                that.context = context;
                curmenu = that;
            }
            
            root.show().css(revise(x, y));
            
            function revise(x, y){ //修正菜单位置
            
                var
                width = root.offsetWidth(),
                height = root.offsetHeight();
                
                if(x + width > Z('body').width()){
                    x -= width;
                }
                
                if(y + height > Z('body').height()){
                    y -= height;
                }
                
                return{left: x, top: y};
                
            }
            
        },
        
        hide: Contextmenu.hide,
        
        render: function(items){
            this.root.html(createItem(this.items = items));
            return this;
        }
        
    });
    
    function init(){
        
        init = null;
        
        Z('body').append(container);
        
        Z(document).on('contextmenu', function(e){
            e.preventDefault();
        }).on('mousedown', function(){
            Contextmenu.hide();
        });
        
    }
       
    function createItem(items){ //生成子菜单
        var html = '<ul>';
        Z.forEach(items, function(item){
            if(item == '-'){
                html += '<li class="line"></li>';
            }else if(item.status == 'disabled'){
                html += '<li class="disabled"><span class="text">'+ item.text +'</span></li>';
            }else{
                var l_icon, r_icon, submenu;
                if(item.status == 'selected'){
                    l_icon = '<span class="l_icon selected"></span>';
                }else if(item.icon){
                    l_icon = '<span class="l_icon '+ item.icon +'"></span>';
                }
                if(item.submenu){
                    r_icon = '<span class="r_icon showsubmenu"></span>';
                    submenu = createItem(item.submenu); 
                }
                html += Z.rstr(
                    '<li{cmd}{args}{status}>{l_icon}{text}{r_icon}{submenu}</li>',
                    {
                        cmd: item.cmd ? ' cmd='+ item.cmd : '',
                        args: item.args != null ? ' args='+ item.args : '',
                        status: item.status ? ' status='+ item.status : '',
                        text: '<span class="text">'+ item.text +'</span>',
                        l_icon: l_icon || '',
                        r_icon: r_icon || '',
                        submenu: submenu || ''
                    }
                );
            }
        });
        return html +'</ul>';
    }

});

define('base/Command', [], function(module){
    /*
    指令模块
    #exports
        Command(items)                      添加指令
        Command.apply(context, name, args)  执行指令
        Command.apply(name, args)           执行指令
        Command.call(context, name)         执行指令
        Command.call(name)                  执行指令
    */
    
    module.exports = Command;
    
    var cmds = {};
    
    function Command(items){
        for(var name in items){
            cmds[name] = items[name];
        }
    }
    
    Command.apply = function(context, name, args){
        
        if(typeof context == 'string'){
            args = name;
            name = context;
            context = null;
        }
        
        if(typeof cmds[name] != 'function'){
            return window.console && console.info && console.info('not found the Cammand("'+ name +'")');
        }
        
        cmds[name].apply(context, args || []);
    };
    
    Command.call = function(context, name){
        if(typeof context == 'string'){
            this.apply(null, context, [].slice.call(arguments, 1));
        }else{
            this.apply(context, name, [].slice.call(arguments, 2));
        } 
    };

});

define('component/Desktop', ['widget/calls', 'base/Common', 'base/Scroll', 'base/Command', 'base/Observer', 'base/Contextmenu', 'component/Data', 'component/Viewport', 'component/App', 'component/Appmarket'], function(module){
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

});

define('base/Common', ['widget/calls'], function(module){
    /*
    常用工具
    #imports
        calls
    #exports
        Common.loadImgs(imgs, success)      加载图片
        Common.hitTest(box, point)          碰撞检测，检测点point[x,y]是否落在panel里面
        Common.getGridindex(box, gridsize, point)    获取网格位置
        Common.debounce(callback, ms)       去除重复动作
    */
    
    var calls = require('widget/calls');
    
    module.exports = {
        
        loadImgs: function (imgs, success){
            
            calls('Common.loadImgs')
            .wait(function(){
                var fns = [];
                Z.forEach(imgs, function(src){
                    fns.push(function(resolve){
                        Z.img('css/imgs/'+ src, resolve);
                    });
                });
                return fns;
            }())
            .then(function(){ //done
                success();
            });
            
        },
        
        hitTest: function(box, point){
            var left, top, x = point[0], y = point[1];
            return !(
                x < (left = box.offsetLeft())
                || y < (top = box.offsetTop())
                || x > left + box.offsetWidth()
                || y > top + box.offsetHeight()
            );
        },
        
        getGridindex: function(box, gridsize, point){ //box为容器，gridsize为网格大小，point为坐标位置
        
            var gridwidth = gridsize[0];
            var gridheight = gridsize[1];
            var x = point[0];
            var y = point[1];
            var left, top, width, height;
            var rows, cols; //网格行列
    
            if(
                x < (left = box.offsetLeft()) || 
                x > left + (width = box.offsetWidth()) ||
                y < (top = box.offsetTop()) ||
                y > top + (height = box.offsetHeight())
            ){
                return -1;
            }
            
            var rx, ry; //二维坐标
            
            if(gridwidth){ //列坐标
                cols = Math.max(1, (width/gridwidth)|0);
                rx = Math.floor( (x - left) / gridwidth );
                rx = Math.min(cols, rx);
            }
            
            if(gridheight){ //行坐标
                rows = Math.max(1, (height/gridheight)|0)
                ry = Math.floor( (y - top) / gridheight );
                ry = Math.min(rows, ry);
            }
            
            if( (+!!gridwidth) ^ (+!!gridheight) ){ //只存在一个值
                return (rx || ry)|0;
            }
            
            return rows * rx  + ry; //2个值都存在，则纵向读取生成位置
            
        },
        
        debounce: function(fn, ms){
            var timer;
            return function(){
                var that = this;
                var args = arguments;
                clearTimeout(timer);
                timer = setTimeout(function(){
                    fn.apply(that, args);
                }, ms);
            };
        }
        
    };

});

define('base/Scroll', [], function(module){
    /*
    滚动条模块
    #exports
        
        Scroll(option)      创建滚动条
        
        scroll.visible      显示状态
        scroll.rerender()   重新渲染滚动条
        
    */
    
    module.exports = function(inner){
        
        var 
        outer = inner.parent(),
        scrollbar = Z.E('<div class=scrollbar></div>'), 
        scrollTop, //滚动条顶部
        clientHeight, //视窗高度
        scrollHeight, //滚动区域高度
        scrollbarHeight,
        paddingHeight,
        visible = false,
        offsetY;
        
        outer.append(scrollbar);
        
        scrollbar.on('mousedown', function(e){
            offsetY = e.clientY - scrollTop;
            Z(document).on('mouseup', stopDrag);
            Z(document).on('mousemove', startDrag);
        });
        
        outer.on('mousewheel', function(e){
            if(visible){
                doScroll(scrollTop -= e.delta/12);
            }
        });
        
        this.rerender = function(){
            
            clientHeight = outer.height();
            scrollHeight = inner.offsetHeight();
            
            if(scrollHeight > clientHeight){ //显示滚动条
                
                scrollbar.height(scrollbarHeight = clientHeight * clientHeight / scrollHeight);
                scrollTop = scrollbar.top();
                
                if(visible){
                    doScroll(scrollTop);
                }else{
                    visible = this.visible = true;
                    scrollbar.show();
                }
            
            }else{
                visible = this.visible = false;
                scrollbar.hide().top(scrollTop = 0);
                inner.top(0);
            }
            
        };
        
        function stopDrag(){
            Z(document).un('mouseup', stopDrag);
            Z(document).un('mousemove', startDrag);
        }
        
        function startDrag(e){
            window.getSelection ? window.getSelection().removeAllRanges() : document.selection.empty();
            doScroll(e.clientY - offsetY);
        }
        
        function doScroll(top){
            scrollbar.top(scrollTop = Math.max(0, Math.min(top, clientHeight - scrollbarHeight)));
            inner.top(-scrollTop * scrollHeight / clientHeight);
        }
        
    }

});

define('component/Appmarket', ['widget/calls', 'base/Win', 'base/Common', 'base/Contextmenu', 'component/App'], function(module){
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

});

define('component/Theme', ['widget/calls', 'base/Win', 'base/Command', 'component/App', 'component/Desktop'], function(module){
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

});

define('component/Systemset', ['widget/calls', 'base/Win', 'base/Command', 'component/App', 'component/Desktop', 'component/Viewport'], function(module){
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

});

define('component/Sidebar', ['widget/calls', 'base/Common', 'base/Command', 'base/Contextmenu', 'component/App', 'component/Data', 'component/Viewport'], function(module){
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

});

define('component/Taskbar', ['widget/calls', 'base/Common', 'base/Command', 'base/Contextmenu', 'component/Data', 'component/Viewport', 'component/Desktop', 'component/App'], function(module){
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

});

define('component/Navbar', ['widget/calls', 'base/Common', 'base/Command', 'base/Observer', 'base/Contextmenu', 'component/Data', 'component/Desktop', 'component/Viewport', 'component/App'], function(module){
    /*
    桌面导航模块
    #exports
        Navbar.init(resolve)    初始化模块
    */
    
    var calls = require('widget/calls');
    var Common = require('base/Common');
    var Command = require('base/Command');
    var Observer = require('base/Observer');
    var Contextmenu = require('base/Contextmenu');
    var Data = require('component/Data');
    
    var Desktop = require('component/Desktop');
    var Viewport = require('component/Viewport');
    var App = require('component/App');
    
    module.exports = Navbar = {};
    
    var Navbar;
    var root;
    
    Navbar.init = function(resolve){ //Navbar.init
        
        calls('Navbar.init')
        .then(function(){ //初始化节点
        
            Viewport.add(root = Z.E(
                '<div id="Navbar" class="navbar">\
                    <div class="indicatorContainer">\
                    '+ indicators() +'\
                    </div>\
                </div>'
            ), true);
            
            function indicators(){
                
                var indicators = ['<div class="header" cmd="user" title="请登录"><img src="css/imgs/avatar.png" alt="请登录"></div>'];
                
                Z.forEach(Desktop.desks, function(desk, i){
                    indicators.push(Z.rstr(
                        '<a class="indicator{cls}" index="{index}"><span class="icon_bg"></span><span class="icon_{iconIndex}"></span></a>',
                        {cls: desk.isFocus() ? ' current' : '', index: i, iconIndex: i + 1}
                    ));
                });
                
                indicators.push('<a href="#" class="indicator indicator_manage" hidefocus="true" cmd="openManager" title="全局视图"></a>');
                
                return indicators.join('');
                
            }
            
        })
        .then(function(){ //设置事件监听
            
            Desktop.on('focused', function(){
                root.find('.current').cls('-current');
                root.find('.indicator').eq(this.index).cls('+current');
            });
            
            root.drag({rang: 1});
            
            root
            .on('mousedown', function(){
                Contextmenu.hide();
            }).find('.indicator').click(function(evt){
                evt.preventDefault();
                if(this.attr('cmd') == 'openManager'){
                    Command.call('openManager');
                }else if(!this.cls('current')){
                    Command.call('toggleDesk', +this.attr('index'));
                }
            });
            
            var 
            button = root.find('.indicator'),
            toggleButtonX,
            toggleButtonY;
            
            App.on('beforeDrag', function(){
                if(Desktop.active){
                    toggleButtonX = button.offsetLeft();
                    toggleButtonY = button.offsetTop();
                }
            });
            
            App.on('draging', function(point){
                
                if(!Desktop.active){
                    return;
                }
                
                var x = point[0];
                var y = point[1];
                
                //拖动图标时候的桌面切换检测，20为按钮高度，22为按钮宽度
                if(y > toggleButtonY //y在前面考虑高度小于宽度，减少运算量
                && y < toggleButtonY + 20
                && x > toggleButtonX
                && x < toggleButtonX + 110
                ){
                    Command.call('toggleDesk', 0 | (x - toggleButtonX) / 22);
                }
                
            });
            
        })
        .then(resolve);
        
    };

});

define('component/Toollist', ['widget/calls', 'base/Command', 'component/Sidebar'], function(module){
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

});

define('component/Manager', ['widget/calls', 'base/Common', 'base/Command', 'base/Scroll', 'component/Viewport', 'component/App', 'component/Desktop', 'component/Sidebar'], function(module){
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

});

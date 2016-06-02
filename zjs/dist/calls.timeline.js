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
